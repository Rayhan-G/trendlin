import type { APIRoute } from 'astro';
import { 
  createCampaign, 
  getCampaigns, 
  getCampaignById,
  updateCampaignStatus,
  createDeliveries,
  getPendingDeliveries,
  updateDeliveryStatus
} from '@/lib/newsletter';
import { EmailService } from '@/lib/email-service';

// ============================================
// GET - List all campaigns
// ============================================
export const GET: APIRoute = async ({ locals, url }) => {
  try {
    const db = (locals as any).runtime?.env?.DB;
    
    if (!db) {
      return new Response(
        JSON.stringify({ success: false, message: 'Database not available' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if specific campaign requested
    const id = url.searchParams.get('id');
    if (id) {
      const campaign = await getCampaignById(parseInt(id), db);
      if (!campaign) {
        return new Response(
          JSON.stringify({ success: false, message: 'Campaign not found' }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }
      return new Response(
        JSON.stringify({ success: true, data: campaign }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const campaigns = await getCampaigns(db);

    return new Response(
      JSON.stringify({
        success: true,
        data: campaigns,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Get campaigns error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Something went wrong' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// ============================================
// POST - Create a new campaign
// ============================================
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const db = (locals as any).runtime?.env?.DB;
    const apiKey = (locals as any).runtime?.env?.RESEND_API_KEY;
    
    if (!db) {
      return new Response(
        JSON.stringify({ success: false, message: 'Database not available' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const { subject, contentHtml, category, scheduledAt, sendNow } = body;

    if (!subject || !contentHtml) {
      return new Response(
        JSON.stringify({ success: false, message: 'Subject and content are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Determine status
    let status = 'draft';
    if (sendNow) {
      status = 'sending';
    } else if (scheduledAt) {
      status = 'scheduled';
    }

    const campaign = await createCampaign({
      subject,
      contentHtml,
      category,
      scheduledAt: scheduledAt || null,
    }, db);

    // If sendNow, send immediately
    if (sendNow && apiKey) {
      await sendCampaignNow(campaign.id, apiKey, db);
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: campaign,
        message: sendNow ? 'Campaign sent successfully!' : 'Campaign created successfully!',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Create campaign error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Something went wrong' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// ============================================
// PUT - Update campaign
// ============================================
export const PUT: APIRoute = async ({ request, locals }) => {
  try {
    const db = (locals as any).runtime?.env?.DB;
    const apiKey = (locals as any).runtime?.env?.RESEND_API_KEY;
    
    if (!db) {
      return new Response(
        JSON.stringify({ success: false, message: 'Database not available' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const { id, status, scheduledAt } = body;

    if (!id) {
      return new Response(
        JSON.stringify({ success: false, message: 'Campaign ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const campaign = await getCampaignById(id, db);
    if (!campaign) {
      return new Response(
        JSON.stringify({ success: false, message: 'Campaign not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Handle different update scenarios
    if (status === 'scheduled' && scheduledAt) {
      const updated = await updateCampaignStatus(id, 'scheduled', db);
      await db.prepare(`
        UPDATE newsletter_campaigns 
        SET scheduled_at = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(scheduledAt, id).run();

      return new Response(
        JSON.stringify({
          success: true,
          data: updated,
          message: 'Campaign scheduled successfully!',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (status === 'sending') {
      await sendCampaignNow(id, apiKey, db);
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Campaign sent successfully!',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (status === 'draft') {
      const updated = await updateCampaignStatus(id, 'draft', db);
      await db.prepare(`
        UPDATE newsletter_campaigns 
        SET scheduled_at = NULL,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(id).run();

      return new Response(
        JSON.stringify({
          success: true,
          data: updated,
          message: 'Campaign cancelled successfully!',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, message: 'Invalid update request' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Update campaign error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Something went wrong' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// ============================================
// DELETE - Delete a campaign
// ============================================
export const DELETE: APIRoute = async ({ request, locals }) => {
  try {
    const db = (locals as any).runtime?.env?.DB;
    
    if (!db) {
      return new Response(
        JSON.stringify({ success: false, message: 'Database not available' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return new Response(
        JSON.stringify({ success: false, message: 'Campaign ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const campaign = await getCampaignById(id, db);
    if (!campaign) {
      return new Response(
        JSON.stringify({ success: false, message: 'Campaign not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Only allow deletion of draft campaigns
    if (campaign.status !== 'draft') {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Only draft campaigns can be deleted' 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await db.prepare(`
      DELETE FROM newsletter_campaigns WHERE id = ?
    `).bind(id).run();

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Campaign deleted successfully!',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Delete campaign error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Something went wrong' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// ============================================
// HELPER: Send campaign now
// ============================================
async function sendCampaignNow(campaignId: number, apiKey: string, db: any) {
  const campaign = await getCampaignById(campaignId, db);
  if (!campaign) throw new Error('Campaign not found');

  const emailService = new EmailService(apiKey);

  // Get active subscribers
  const subscribers = await db.prepare(`
    SELECT * FROM subscribers WHERE status = 'active'
  `).all();

  if (subscribers.results.length === 0) {
    await updateCampaignStatus(campaignId, 'sent', db);
    return;
  }

  // Create deliveries
  const subscriberIds = subscribers.results.map((s: any) => s.id);
  await createDeliveries(campaignId, subscriberIds, db);

  // Mark as sending
  await updateCampaignStatus(campaignId, 'sending', db);

  // Send in batches
  const batchSize = 100;
  let sent = 0;
  let failed = 0;

  while (sent < subscribers.results.length) {
    const deliveries = await getPendingDeliveries(batchSize, db);
    
    for (const delivery of deliveries) {
      try {
        await emailService.sendNewsletter({
          to: delivery.email,
          subject: campaign.subject,
          content: campaign.content_html,
          unsubscribeUrl: `https://trendlin.com/unsubscribe?token=${delivery.unsubscribe_token}`,
        });
        await updateDeliveryStatus(delivery.id, 'sent', db);
        sent++;
      } catch (error) {
        console.error(`Failed to send to ${delivery.email}:`, error);
        await updateDeliveryStatus(delivery.id, 'failed', db);
        failed++;
      }
    }

    if (sent < subscribers.results.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  await updateCampaignStatus(campaignId, 'sent', db);
  console.log(`✅ Campaign ${campaignId} completed. Sent: ${sent}, Failed: ${failed}`);
}