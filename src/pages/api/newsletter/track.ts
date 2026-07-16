// ============================================
// API: TRACK EMAIL OPENS & CLICKS
// 1x1 pixel for opens, redirect for clicks
// ============================================

import type { APIRoute } from 'astro';
import { getDB, prepareFirst } from '../../../lib/db';

// ============================================
// TRACK OPENS (1x1 transparent GIF)
// ============================================
export const GET: APIRoute = async ({ url, locals }) => {
  try {
    const env = locals.env;
    const db = getDB(env);
    
    const campaignId = url.searchParams.get('campaign');
    const subscriberId = url.searchParams.get('subscriber');
    const open = url.searchParams.get('open');

    // If it's an open tracking request
    if (open === 'true' && campaignId && subscriberId) {
      // Update campaign recipient open count
      await db
        .prepare(`
          UPDATE newsletter_campaign_recipients 
          SET opened_count = opened_count + 1,
              opened_at = CASE 
                WHEN opened_at IS NULL THEN CURRENT_TIMESTAMP 
                ELSE opened_at 
              END,
              status = 'opened',
              updated_at = CURRENT_TIMESTAMP
          WHERE campaign_id = ? AND subscriber_id = ?
        `)
        .bind(parseInt(campaignId), parseInt(subscriberId))
        .run();

      // Update campaign unique opens (only if first time)
      await db
        .prepare(`
          UPDATE newsletter_campaigns 
          SET opened_count = opened_count + 1,
              unique_opens = (
                SELECT COUNT(DISTINCT subscriber_id) 
                FROM newsletter_campaign_recipients 
                WHERE campaign_id = ? AND opened_count > 0
              ),
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `)
        .bind(parseInt(campaignId), parseInt(campaignId))
        .run();

      // Log event
      await db
        .prepare(`
          INSERT INTO newsletter_events (subscriber_id, campaign_id, type, ip_address, user_agent)
          VALUES (?, ?, 'open', ?, ?)
        `)
        .bind(
          parseInt(subscriberId),
          parseInt(campaignId),
          request.headers.get('cf-connecting-ip') || '',
          request.headers.get('user-agent') || ''
        )
        .run();
    }

    // Return 1x1 transparent GIF
    const pixel = Buffer.from(
      'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      'base64'
    );

    return new Response(pixel, {
      status: 200,
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error: any) {
    console.error('Tracking error:', error);
    // Still return pixel on error
    const pixel = Buffer.from(
      'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      'base64'
    );
    return new Response(pixel, {
      status: 200,
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  }
};

// ============================================
// TRACK CLICKS (Redirect to URL)
// ============================================
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const { campaignId, subscriberId, url: targetUrl } = await request.json();
    const env = locals.env;
    const db = getDB(env);

    if (!campaignId || !subscriberId || !targetUrl) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Update campaign recipient click count
    await db
      .prepare(`
        UPDATE newsletter_campaign_recipients 
        SET clicked_count = clicked_count + 1,
            clicked_at = CASE 
              WHEN clicked_at IS NULL THEN CURRENT_TIMESTAMP 
              ELSE clicked_at 
            END,
            updated_at = CURRENT_TIMESTAMP
        WHERE campaign_id = ? AND subscriber_id = ?
      `)
      .bind(parseInt(campaignId), parseInt(subscriberId))
      .run();

    // Update campaign unique clicks
    await db
      .prepare(`
        UPDATE newsletter_campaigns 
        SET clicked_count = clicked_count + 1,
            unique_clicks = (
              SELECT COUNT(DISTINCT subscriber_id) 
              FROM newsletter_campaign_recipients 
              WHERE campaign_id = ? AND clicked_count > 0
            ),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `)
      .bind(parseInt(campaignId), parseInt(campaignId))
      .run();

    // Log event
    await db
      .prepare(`
        INSERT INTO newsletter_events (subscriber_id, campaign_id, type, url, ip_address, user_agent)
        VALUES (?, ?, 'click', ?, ?, ?)
      `)
      .bind(
        parseInt(subscriberId),
        parseInt(campaignId),
        targetUrl,
        request.headers.get('cf-connecting-ip') || '',
        request.headers.get('user-agent') || ''
      )
      .run();

    return new Response(
      JSON.stringify({
        success: true,
        redirectUrl: targetUrl
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('Click tracking error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to track click' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};