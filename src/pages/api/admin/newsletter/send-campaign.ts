// ============================================
// API: SEND CAMPAIGN (Start Queue Processing)
// PRODUCTION READY - Cloudflare Pages Compatible
// ============================================

import { NewsletterQueue } from '../../../../lib/newsletter/queue';

export async function POST({ request, locals }) {
  try {
    console.log('📤 Send campaign API called');
    
    // ✅ USE THE SAME WORKING PATTERN AS YOUR POSTS API
    const { DB } = locals.runtime.env;
    
    if (!DB) {
      console.error('❌ Database not available!');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Database not available' 
        }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check authentication - using the same pattern as your working API
    const adminId = locals.user?.id;
    if (!adminId) {
      console.error('❌ Unauthorized: No admin user found');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Unauthorized' 
        }),
        { 
          status: 401, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    const { campaignId } = await request.json();

    if (!campaignId) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Campaign ID is required' 
        }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check if campaign exists
    const campaign = await DB
      .prepare('SELECT * FROM newsletter_campaigns WHERE id = ?')
      .bind(campaignId)
      .first();

    if (!campaign) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Campaign not found' 
        }),
        { 
          status: 404, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check if campaign can be sent
    if (campaign.status === 'completed') {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Campaign already completed' 
        }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    if (campaign.status === 'sending') {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Campaign is already being sent' 
        }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    // Initialize queue with the correct env
    const env = locals.runtime.env;
    const queue = new NewsletterQueue(env);

    // Enqueue campaign
    console.log(`📤 Enqueuing campaign ${campaignId}...`);
    const result = await queue.enqueueCampaign(campaignId);

    if (!result.success) {
      console.error(`❌ Failed to enqueue campaign ${campaignId}`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to enqueue campaign' 
        }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`✅ Campaign ${campaignId} enqueued with ${result.count} recipients`);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          campaignId,
          totalRecipients: result.count,
          status: 'sending',
          message: `Campaign enqueued successfully. Sending to ${result.count} subscribers.`
        }
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ Send campaign error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to send campaign' 
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}