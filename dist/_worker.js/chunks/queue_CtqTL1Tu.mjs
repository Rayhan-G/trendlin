globalThis.process ??= {}; globalThis.process.env ??= {};
import { g as getDB, p as prepareFirst, a as prepare } from './db_Bt5ss5wz.mjs';
import { E as EmailService } from './email-service_B8-8MdeA.mjs';

class NewsletterQueue {
  env;
  emailService;
  batchSize = 100;
  processing = false;
  rateLimitDelay = 10;
  // ms between emails
  constructor(env) {
    this.env = env;
    const apiKey = env.RESEND_API_KEY || process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("RESEND_API_KEY is required");
    }
    this.emailService = new EmailService(apiKey);
  }
  // ============================================
  // ENQUEUE CAMPAIGN - CHUNKED FOR 500K SUBSCRIBERS
  // ============================================
  async enqueueCampaign(campaignId) {
    const db = getDB(this.env);
    const CHUNK_SIZE = 1e3;
    let offset = 0;
    let totalEnqueued = 0;
    const campaign = await prepareFirst(
      db,
      "SELECT * FROM newsletter_campaigns WHERE id = ?",
      [campaignId]
    );
    if (!campaign) {
      throw new Error(`Campaign ${campaignId} not found`);
    }
    await db.prepare("UPDATE newsletter_campaigns SET status = ? WHERE id = ?").bind("sending", campaignId).run();
    while (true) {
      const subscribers = await prepare(
        db,
        `
          SELECT 
            ns.id as subscriber_id,
            ns.email,
            ns.first_name,
            ns.last_name,
            ns.unsubscribe_token
          FROM newsletter_subscribers ns
          JOIN newsletter_list_members nlm ON ns.id = nlm.subscriber_id
          WHERE ns.status = 'active'
            AND nlm.subscribed = 1
            ${campaign.list_id ? `AND nlm.list_id = ${campaign.list_id}` : ""}
          ORDER BY ns.id
          LIMIT ? OFFSET ?
        `,
        [CHUNK_SIZE, offset]
      );
      if (!subscribers.results || subscribers.results.length === 0) {
        break;
      }
      const insertValues = subscribers.results.map((sub) => {
        return `(${campaignId}, ${sub.subscriber_id}, 0, 5, 0)`;
      }).join(",");
      if (insertValues) {
        await db.prepare(`
            INSERT OR IGNORE INTO newsletter_queue 
            (campaign_id, subscriber_id, priority, max_attempts, attempts)
            VALUES ${insertValues}
          `).run();
        const recipientValues = subscribers.results.map((sub) => {
          return `(${campaignId}, ${sub.subscriber_id}, 'pending')`;
        }).join(",");
        if (recipientValues) {
          await db.prepare(`
              INSERT OR IGNORE INTO newsletter_campaign_recipients 
              (campaign_id, subscriber_id, status)
              VALUES ${recipientValues}
            `).run();
        }
        totalEnqueued += subscribers.results.length;
        offset += CHUNK_SIZE;
        console.log(`📊 Enqueued ${totalEnqueued} subscribers for campaign ${campaignId}`);
      }
    }
    await db.prepare(`
        UPDATE newsletter_campaigns 
        SET total_recipients = ?
        WHERE id = ?
      `).bind(totalEnqueued, campaignId).run();
    return {
      success: true,
      count: totalEnqueued
    };
  }
  // ============================================
  // PROCESS QUEUE BATCH - RATE LIMITED FOR API SAFETY
  // ============================================
  async processBatch(batchSize = this.batchSize) {
    if (this.processing) {
      return { processed: 0, successful: 0, failed: 0, bounced: 0, skipped: 0 };
    }
    this.processing = true;
    const db = getDB(this.env);
    const stats = { processed: 0, successful: 0, failed: 0, bounced: 0, skipped: 0 };
    try {
      const jobs = await prepare(
        db,
        `
          SELECT 
            nq.id as queue_id,
            nq.campaign_id,
            nq.subscriber_id,
            nq.attempts,
            nq.max_attempts,
            nc.subject,
            nc.content_html,
            ns.email,
            ns.first_name,
            ns.last_name,
            ns.unsubscribe_token
          FROM newsletter_queue nq
          JOIN newsletter_campaigns nc ON nq.campaign_id = nc.id
          JOIN newsletter_subscribers ns ON nq.subscriber_id = ns.id
          WHERE nq.status = 'pending'
            AND nq.attempts < nq.max_attempts
            AND (nq.scheduled_at IS NULL OR nq.scheduled_at <= CURRENT_TIMESTAMP)
          ORDER BY nq.priority DESC, nq.created_at ASC
          LIMIT ?
        `,
        [batchSize]
      );
      if (!jobs.results || jobs.results.length === 0) {
        this.processing = false;
        return stats;
      }
      console.log(`📤 Processing ${jobs.results.length} queued emails...`);
      for (const job of jobs.results) {
        try {
          stats.processed++;
          await db.prepare(`
              UPDATE newsletter_queue 
              SET status = 'processing', 
                  attempts = attempts + 1,
                  updated_at = CURRENT_TIMESTAMP
              WHERE id = ?
            `).bind(job.queue_id).run();
          const personalizedContent = this.replaceMergeTags(job.content_html, {
            email: job.email,
            firstName: job.first_name || "",
            lastName: job.last_name || "",
            unsubscribeToken: job.unsubscribe_token || "",
            campaignId: job.campaign_id.toString()
          });
          await this.emailService.sendNewsletterDigest({
            to: job.email,
            subject: job.subject,
            title: job.subject,
            content: personalizedContent
          });
          await db.prepare(`
              UPDATE newsletter_queue 
              SET status = 'completed', 
                  processed_at = CURRENT_TIMESTAMP,
                  updated_at = CURRENT_TIMESTAMP
              WHERE id = ?
            `).bind(job.queue_id).run();
          await db.prepare(`
              UPDATE newsletter_campaign_recipients 
              SET status = 'sent', 
                  sent_at = CURRENT_TIMESTAMP,
                  updated_at = CURRENT_TIMESTAMP
              WHERE campaign_id = ? AND subscriber_id = ?
            `).bind(job.campaign_id, job.subscriber_id).run();
          await db.prepare(`
              UPDATE newsletter_campaigns 
              SET delivered_count = delivered_count + 1
              WHERE id = ?
            `).bind(job.campaign_id).run();
          await db.prepare(`
              INSERT INTO newsletter_events (subscriber_id, campaign_id, type)
              VALUES (?, ?, 'confirm')
            `).bind(job.subscriber_id, job.campaign_id).run();
          stats.successful++;
          await this.delay(this.rateLimitDelay);
        } catch (error) {
          console.error(`❌ Job ${job.queue_id} failed:`, error.message);
          const isBounce = error.message?.toLowerCase().includes("bounce") || error.message?.toLowerCase().includes("undelivered") || error.message?.toLowerCase().includes("invalid");
          const newAttempts = job.attempts + 1;
          const isFinalAttempt = newAttempts >= job.max_attempts;
          let status = "pending";
          if (isBounce) {
            status = "bounced";
          } else if (isFinalAttempt) {
            status = "failed";
          }
          await db.prepare(`
              UPDATE newsletter_queue 
              SET status = ?,
                  attempts = ?,
                  error_message = ?,
                  processed_at = CASE 
                    WHEN ? IN ('failed', 'bounced') THEN CURRENT_TIMESTAMP 
                    ELSE processed_at 
                  END,
                  updated_at = CURRENT_TIMESTAMP
              WHERE id = ?
            `).bind(
            status,
            newAttempts,
            error.message || "Unknown error",
            status,
            job.queue_id
          ).run();
          if (isBounce || isFinalAttempt) {
            await db.prepare(`
                UPDATE newsletter_campaign_recipients 
                SET status = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE campaign_id = ? AND subscriber_id = ?
              `).bind(
              isBounce ? "bounced" : "failed",
              job.campaign_id,
              job.subscriber_id
            ).run();
            const countField = isBounce ? "bounced_count" : "failed_count";
            await db.prepare(`
                UPDATE newsletter_campaigns 
                SET ${countField} = ${countField} + 1
                WHERE id = ?
              `).bind(job.campaign_id).run();
            if (isBounce) {
              await db.prepare(`
                  UPDATE newsletter_subscribers 
                  SET status = 'bounced',
                      updated_at = CURRENT_TIMESTAMP
                  WHERE id = ?
                `).bind(job.subscriber_id).run();
              stats.bounced++;
            } else {
              stats.failed++;
            }
            await db.prepare(`
                INSERT INTO newsletter_events (subscriber_id, campaign_id, type, metadata)
                VALUES (?, ?, ?, ?)
              `).bind(
              job.subscriber_id,
              job.campaign_id,
              isBounce ? "bounce" : "unsubscribe",
              JSON.stringify({ error: error.message, attempts: newAttempts })
            ).run();
          }
        }
      }
      await this.checkCampaignComplete(db);
    } catch (error) {
      console.error("❌ Batch processing error:", error);
    } finally {
      this.processing = false;
    }
    return stats;
  }
  // ============================================
  // GET QUEUE STATUS
  // ============================================
  async getQueueStatus(campaignId) {
    const db = getDB(this.env);
    const stats = await prepareFirst(
      db,
      `
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
          SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) as processing,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
          SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
          SUM(CASE WHEN status = 'bounced' THEN 1 ELSE 0 END) as bounced
        FROM newsletter_queue
        WHERE campaign_id = ?
      `,
      [campaignId]
    );
    return stats;
  }
  // ============================================
  // RETRY FAILED JOBS
  // ============================================
  async retryFailedJobs(campaignId) {
    const db = getDB(this.env);
    const result = await db.prepare(`
        UPDATE newsletter_queue 
        SET status = 'pending',
            attempts = 0,
            error_message = NULL,
            updated_at = CURRENT_TIMESTAMP
        WHERE campaign_id = ?
          AND status IN ('failed', 'bounced')
          AND attempts < max_attempts
      `).bind(campaignId).run();
    return result.meta.changes || 0;
  }
  // ============================================
  // PAUSE/RESUME CAMPAIGN
  // ============================================
  async pauseCampaign(campaignId) {
    const db = getDB(this.env);
    await db.prepare(`
        UPDATE newsletter_campaigns 
        SET status = 'paused'
        WHERE id = ?
      `).bind(campaignId).run();
  }
  async resumeCampaign(campaignId) {
    const db = getDB(this.env);
    await db.prepare(`
        UPDATE newsletter_campaigns 
        SET status = 'sending'
        WHERE id = ?
      `).bind(campaignId).run();
  }
  // ============================================
  // HELPERS
  // ============================================
  replaceMergeTags(html, data) {
    let result = html;
    for (const [key, value] of Object.entries(data)) {
      result = result.replace(new RegExp(`{{${key}}}`, "g"), value);
    }
    return result;
  }
  async checkCampaignComplete(db) {
    const campaigns = await prepare(
      db,
      `
        SELECT DISTINCT campaign_id 
        FROM newsletter_queue 
        WHERE status IN ('pending', 'processing')
      `
    );
    for (const row of campaigns.results || []) {
      const stats = await prepareFirst(
        db,
        `
          SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN status IN ('pending', 'processing') THEN 1 ELSE 0 END) as pending_or_processing
          FROM newsletter_queue
          WHERE campaign_id = ?
        `,
        [row.campaign_id]
      );
      if (stats.pending_or_processing === 0) {
        await db.prepare(`
            UPDATE newsletter_campaigns 
            SET status = 'completed',
                sent_at = CURRENT_TIMESTAMP,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `).bind(row.campaign_id).run();
        console.log(`✅ Campaign ${row.campaign_id} completed!`);
      }
    }
  }
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export { NewsletterQueue };
