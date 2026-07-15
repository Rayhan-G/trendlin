// This runs as a Cloudflare Worker Cron Trigger
// The cron schedule is defined in wrangler.toml: crons = ["*/5 * * * *"]

import { 
  getScheduledCampaigns, 
  createDeliveries,
  getPendingDeliveries,
  updateDeliveryStatus,
  updateCampaignStatus 
} from '../lib/newsletter';
import { EmailService } from '../lib/email-service';

export default {
  async scheduled(event: any, env: any, ctx: any) {
    const db = env.DB;
    const apiKey = env.RESEND_API_KEY;

    if (!db || !apiKey) {
      console.error('❌ Missing DB or API key');
      return;
    }

    const emailService = new EmailService(apiKey);
    console.log('⏰ Cron job started at:', new Date().toISOString());

    // 1. Get scheduled campaigns
    const campaigns = await getScheduledCampaigns(db);

    if (campaigns.length === 0) {
      console.log('📭 No scheduled campaigns to send.');
      return;
    }

    console.log(`📧 Found ${campaigns.length} scheduled campaign(s)`);

    for (const campaign of campaigns) {
      console.log(`📧 Processing campaign: ${campaign.id} - ${campaign.subject}`);

      // 2. Get active subscribers
      const subscribers = await db.prepare(`
        SELECT * FROM subscribers WHERE status = 'active'
      `).all();

      if (subscribers.results.length === 0) {
        console.log(`⚠️ No active subscribers for campaign ${campaign.id}`);
        await updateCampaignStatus(campaign.id, 'sent', db);
        continue;
      }

      // 3. Create deliveries
      const subscriberIds = subscribers.results.map((s: any) => s.id);
      await createDeliveries(campaign.id, subscriberIds, db);
      console.log(`📝 Created ${subscriberIds.length} delivery records`);

      // 4. Mark campaign as sending
      await updateCampaignStatus(campaign.id, 'sending', db);

      // 5. Send in batches
      const batchSize = 100;
      let sent = 0;
      let failed = 0;

      while (sent < subscribers.results.length) {
        const batch = subscribers.results.slice(sent, sent + batchSize);
        
        // Get pending deliveries for this batch
        const deliveries = await getPendingDeliveries(batchSize, db);
        
        for (const delivery of deliveries) {
          try {
            // Send email
            await emailService.sendNewsletter({
              to: delivery.email,
              subject: campaign.subject,
              content: campaign.content_html,
              unsubscribeUrl: `https://trendlin.com/unsubscribe?token=${delivery.unsubscribe_token}`,
            });

            // Update delivery status
            await updateDeliveryStatus(delivery.id, 'sent', db);
            sent++;
          } catch (error) {
            console.error(`❌ Failed to send to ${delivery.email}:`, error);
            await updateDeliveryStatus(delivery.id, 'failed', db);
            failed++;
          }
        }

        // Wait between batches to avoid rate limits
        if (sent < subscribers.results.length) {
          console.log(`⏳ Sent ${sent}/${subscribers.results.length}, waiting 1 second...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // 6. Mark campaign as sent
      await updateCampaignStatus(campaign.id, 'sent', db);
      console.log(`✅ Campaign ${campaign.id} completed. Sent: ${sent}, Failed: ${failed}`);
    }

    console.log('✅ Cron job completed at:', new Date().toISOString());
  }
};