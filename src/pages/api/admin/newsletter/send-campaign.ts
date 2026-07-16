// ============================================
// API: SEND CAMPAIGN (Start Queue Processing)
// ============================================

import type { APIRoute } from 'astro';
import { getDB, prepareFirst } from '../../../../lib/db';
import { getCurrentUser } from '../../../../lib/auth';
import { NewsletterQueue } from '../../../../lib/newsletter/queue';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Check authentication
    const user = await getCurrentUser(request, locals.env.DB);
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { campaignId } = await request.json();
    const env = locals.env;
    const db = getDB(env);

    if (!campaignId) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Campaign ID is required' 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if campaign exists
    const campaign = await prepareFirst(
      db,
      'SELECT * FROM newsletter_campaigns WHERE id = ?',
      [campaignId]
    );

    if (!campaign) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Campaign not found' 
        }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if campaign can be sent
    if (campaign.status === 'completed') {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Campaign already completed' 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (campaign.status === 'sending') {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Campaign is already being sent' 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Initialize queue
    const queue = new NewsletterQueue(env);

    // Enqueue campaign
    const result = await queue.enqueueCampaign(campaignId);

    if (!result.success) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to enqueue campaign' 
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

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
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Send campaign error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to send campaign' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};