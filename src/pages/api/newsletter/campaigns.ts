// /src/pages/api/admin/newsletter/campaigns.ts
import type { APIRoute } from 'astro';
import { createD1Client } from '../../../../lib/db';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const { subject, previewText, contentHtml, listId, status } = await request.json();
    const db = createD1Client(locals.env.DB);
    
    // Get admin from session
    const adminId = locals.user?.id;
    if (!adminId) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      );
    }

    const result = await db.prepare(`
      INSERT INTO newsletter_campaigns (
        subject, preview_text, content_html, list_id, status, created_by
      ) VALUES (?, ?, ?, ?, ?, ?)
    `).bind(subject, previewText || '', contentHtml, listId || null, status || 'draft', adminId).run();

    const campaignId = result.meta.last_row_id;

    return new Response(
      JSON.stringify({ 
        success: true, 
        id: campaignId,
        message: 'Campaign created successfully' 
      }),
      { status: 200 }
    );

  } catch (error) {
    console.error('Create campaign error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to create campaign' }),
      { status: 500 }
    );
  }
};

export const GET: APIRoute = async ({ locals }) => {
  try {
    const db = createD1Client(locals.env.DB);
    
    const campaigns = await db.prepare(`
      SELECT 
        c.*,
        u.username as created_by_name,
        l.name as list_name,
        (SELECT COUNT(*) FROM newsletter_campaign_recipients WHERE campaign_id = c.id) as recipients_count
      FROM newsletter_campaigns c
      LEFT JOIN admins u ON c.created_by = u.id
      LEFT JOIN newsletter_lists l ON c.list_id = l.id
      ORDER BY c.created_at DESC
    `).all();

    return new Response(
      JSON.stringify({ success: true, campaigns: campaigns.results }),
      { status: 200 }
    );

  } catch (error) {
    console.error('Get campaigns error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch campaigns' }),
      { status: 500 }
    );
  }
};