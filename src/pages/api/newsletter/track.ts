// ============================================
// API: TRACK EMAIL OPENS & CLICKS
// PRODUCTION READY - Cloudflare Pages Compatible
// ============================================

// ============================================
// TRACK OPENS (1x1 transparent GIF)
// ============================================
export async function GET({ url, request, locals }) {
  try {
    console.log('📊 Track open API called');
    
    // ✅ USE THE SAME WORKING PATTERN AS YOUR POSTS API
    const { DB } = locals.runtime.env;
    
    if (!DB) {
      console.error('❌ Database not available!');
      // Still return pixel on error
      return getTrackingPixel();
    }
    
    const campaignId = url.searchParams.get('campaign');
    const subscriberId = url.searchParams.get('subscriber');
    const open = url.searchParams.get('open');

    // If it's an open tracking request
    if (open === 'true' && campaignId && subscriberId) {
      const campaignIdNum = parseInt(campaignId);
      const subscriberIdNum = parseInt(subscriberId);

      // Update campaign recipient open count
      await DB
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
        .bind(campaignIdNum, subscriberIdNum)
        .run();

      // Update campaign unique opens
      await DB
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
        .bind(campaignIdNum, campaignIdNum)
        .run();

      // Log event
      await DB
        .prepare(`
          INSERT INTO newsletter_events (subscriber_id, campaign_id, type, ip_address, user_agent)
          VALUES (?, ?, 'open', ?, ?)
        `)
        .bind(
          subscriberIdNum,
          campaignIdNum,
          request.headers.get('cf-connecting-ip') || '',
          request.headers.get('user-agent') || ''
        )
        .run();

      console.log(`✅ Tracked open for subscriber ${subscriberId}, campaign ${campaignId}`);
    }

    // Return 1x1 transparent GIF
    return getTrackingPixel();

  } catch (error) {
    console.error('❌ Tracking error:', error);
    return getTrackingPixel();
  }
}

// ============================================
// TRACK CLICKS (Redirect to URL)
// ============================================
export async function POST({ request, locals }) {
  try {
    console.log('🔗 Track click API called');
    
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

    const { campaignId, subscriberId, url: targetUrl } = await request.json();

    if (!campaignId || !subscriberId || !targetUrl) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required fields' 
        }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    const campaignIdNum = parseInt(campaignId);
    const subscriberIdNum = parseInt(subscriberId);

    // Update campaign recipient click count
    await DB
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
      .bind(campaignIdNum, subscriberIdNum)
      .run();

    // Update campaign unique clicks
    await DB
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
      .bind(campaignIdNum, campaignIdNum)
      .run();

    // Log event
    await DB
      .prepare(`
        INSERT INTO newsletter_events (subscriber_id, campaign_id, type, url, ip_address, user_agent)
        VALUES (?, ?, 'click', ?, ?, ?)
      `)
      .bind(
        subscriberIdNum,
        campaignIdNum,
        targetUrl,
        request.headers.get('cf-connecting-ip') || '',
        request.headers.get('user-agent') || ''
      )
      .run();

    console.log(`✅ Tracked click for subscriber ${subscriberId}, campaign ${campaignId}`);

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

  } catch (error) {
    console.error('❌ Click tracking error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to track click' 
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}

// ============================================
// HELPER: Get tracking pixel
// ============================================
function getTrackingPixel() {
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
}