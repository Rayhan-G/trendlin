// ============================================
// API: CREATE & LIST CAMPAIGNS
// PRODUCTION READY - Cloudflare Pages Compatible
// ============================================

// ============================================
// GET - List campaigns
// ============================================
export async function GET({ locals, url }) {
  try {
    console.log('📋 List campaigns API called');
    
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

    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const status = url.searchParams.get('status');

    let query = `
      SELECT 
        id, subject, preview_text, status,
        total_recipients, delivered_count, opened_count,
        scheduled_at, sent_at, created_at
      FROM newsletter_campaigns 
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status) {
      query += ` AND status = ?`;
      params.push(status);
    }

    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const campaigns = await DB
      .prepare(query)
      .bind(...params)
      .all();

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM newsletter_campaigns WHERE 1=1';
    const countParams: any[] = [];
    if (status) {
      countQuery += ` AND status = ?`;
      countParams.push(status);
    }
    const totalResult = await DB
      .prepare(countQuery)
      .bind(...countParams)
      .first();

    return new Response(
      JSON.stringify({
        success: true,
        data: campaigns.results || [],
        pagination: {
          page: Math.floor(offset / limit) + 1,
          limit,
          total: totalResult?.total || 0,
          pages: Math.ceil((totalResult?.total || 0) / limit)
        }
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ Get campaigns error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to get campaigns' 
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}

// ============================================
// POST - Create campaign
// ============================================
export async function POST({ request, locals }) {
  try {
    console.log('📝 Create campaign API called');
    
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

    const { subject, contentHtml, category, scheduledAt, sendNow } = await request.json();

    // Validate required fields
    if (!subject || !contentHtml) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Subject and content are required' 
        }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    // Determine status
    let status = 'draft';
    if (sendNow) status = 'sending';
    if (scheduledAt) status = 'scheduled';

    // Create campaign
    const result = await DB
      .prepare(`
        INSERT INTO newsletter_campaigns (
          subject, content_html, preview_text, status,
          scheduled_at, metadata, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING id
      `)
      .bind(
        subject,
        contentHtml,
        subject.substring(0, 150),
        status,
        scheduledAt || null,
        JSON.stringify({ category: category || 'general' })
      )
      .first();

    if (!result) {
      throw new Error('Failed to create campaign');
    }

    // If sending now, enqueue it
    if (sendNow) {
      try {
        const { NewsletterQueue } = await import('../../../lib/newsletter/queue');
        const queue = new NewsletterQueue(locals.runtime.env);
        await queue.enqueueCampaign(result.id);
        console.log(`✅ Campaign ${result.id} enqueued for sending`);
      } catch (queueError) {
        console.error('❌ Failed to enqueue campaign:', queueError);
        // Still return success but warn
        return new Response(
          JSON.stringify({
            success: true,
            message: 'Campaign created but failed to start sending. Please send manually.',
            data: { id: result.id, status: 'draft' }
          }),
          { 
            status: 200, 
            headers: { 'Content-Type': 'application/json' } 
          }
        );
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: sendNow ? 'Campaign sent successfully!' : 'Campaign created successfully!',
        data: { 
          id: result.id, 
          status,
          subject
        }
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ Create campaign error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error.message || 'Failed to create campaign' 
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}