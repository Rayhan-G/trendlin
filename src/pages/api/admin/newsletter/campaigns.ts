// ============================================
// API: ADMIN - CREATE, LIST & DELETE CAMPAIGNS
// PRODUCTION READY - Cloudflare Pages Compatible
// ============================================

// ============================================
// POST - Create campaign
// ============================================
export async function POST({ request, locals }) {
  try {
    console.log('📝 Admin: Create campaign API called');
    
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

    // Check authentication
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

    const data = await request.json();
    const { subject, preview_text, content_html, list_id, status, scheduled_at } = data;

    // Validate required fields
    if (!subject || !content_html) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Subject and content are required' 
        }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    // Determine campaign status
    const campaignStatus = status || 'draft';

    // Create campaign
    const result = await DB
      .prepare(`
        INSERT INTO newsletter_campaigns (
          subject, preview_text, content_html, list_id, status,
          scheduled_at, created_by, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING id
      `)
      .bind(
        subject,
        preview_text || '',
        content_html,
        list_id || null,
        campaignStatus,
        scheduled_at || null,
        adminId
      )
      .first();

    if (!result) {
      throw new Error('Failed to create campaign');
    }

    console.log(`✅ Campaign ${result.id} created with status: ${campaignStatus}`);

    // If sending now, enqueue immediately
    if (campaignStatus === 'sending') {
      try {
        const { NewsletterQueue } = await import('../../../../lib/newsletter/queue');
        const queue = new NewsletterQueue(locals.runtime.env);
        await queue.enqueueCampaign(result.id);
        console.log(`✅ Campaign ${result.id} enqueued for sending`);
      } catch (queueError) {
        console.error('❌ Failed to enqueue campaign:', queueError);
        // Still return success but warn
        return new Response(
          JSON.stringify({
            success: true,
            id: result.id,
            message: 'Campaign created but failed to start sending. Please send manually.'
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
        id: result.id,
        message: campaignStatus === 'sending' 
          ? 'Campaign is being sent!' 
          : 'Campaign created successfully'
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
        error: error.message || 'Failed to create campaign' 
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}

// ============================================
// GET - List campaigns
// ============================================
export async function GET({ locals }) {
  try {
    console.log('📋 Admin: List campaigns API called');
    
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

    // Get campaigns with counts
    const campaigns = await DB
      .prepare(`
        SELECT 
          c.*,
          (SELECT COUNT(*) FROM newsletter_queue WHERE campaign_id = c.id) as queued_count,
          (SELECT COUNT(*) FROM newsletter_queue WHERE campaign_id = c.id AND status = 'completed') as sent_count,
          (SELECT COUNT(*) FROM newsletter_queue WHERE campaign_id = c.id AND status = 'pending') as pending_count,
          (SELECT COUNT(*) FROM newsletter_queue WHERE campaign_id = c.id AND status = 'failed') as failed_count
        FROM newsletter_campaigns c
        ORDER BY c.created_at DESC
      `)
      .all();

    return new Response(
      JSON.stringify({
        success: true,
        campaigns: campaigns.results || []
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ List campaigns error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to fetch campaigns' 
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}

// ============================================
// DELETE - Delete campaign
// ============================================
export async function DELETE({ request, locals }) {
  try {
    console.log('🗑️ Admin: Delete campaign API called');
    
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

    // Check authentication
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

    const url = new URL(request.url);
    const id = parseInt(url.searchParams.get('id') || '0');

    if (!id) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Campaign ID required' 
        }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check if campaign exists
    const campaign = await DB
      .prepare('SELECT status FROM newsletter_campaigns WHERE id = ?')
      .bind(id)
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

    // Check if campaign can be deleted
    if (campaign.status === 'sending' || campaign.status === 'completed') {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Cannot delete campaign that is sending or completed' 
        }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    // Delete campaign (cascade will handle queue and recipients)
    await DB
      .prepare('DELETE FROM newsletter_campaigns WHERE id = ?')
      .bind(id)
      .run();

    console.log(`✅ Campaign ${id} deleted successfully`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Campaign deleted successfully'
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ Delete campaign error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to delete campaign' 
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}