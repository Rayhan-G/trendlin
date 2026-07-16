// ============================================
// API: CREATE NEWSLETTER CAMPAIGN
// ============================================

import type { APIRoute } from 'astro';
import { getDB, prepareFirst } from '../../../lib/db';
import { getCurrentUser } from '../../../lib/auth';

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

    const { subject, preview_text, content_html, list_id, scheduled_at } = await request.json();
    const env = locals.env;
    const db = getDB(env);

    // Validate required fields
    if (!subject || !content_html) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Subject and content are required' 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Determine status
    let status = 'draft';
    if (scheduled_at) {
      status = 'scheduled';
    }

    // Create campaign
    const result = await db
      .prepare(`
        INSERT INTO newsletter_campaigns (
          subject,
          preview_text,
          content_html,
          list_id,
          status,
          scheduled_at,
          created_by,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING id
      `)
      .bind(
        subject,
        preview_text || '',
        content_html,
        list_id || null,
        status,
        scheduled_at || null,
        user.id
      )
      .first();

    if (!result) {
      throw new Error('Failed to create campaign');
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          id: result.id,
          subject,
          status,
          scheduled_at: scheduled_at || null,
          message: status === 'scheduled' 
            ? 'Campaign scheduled successfully' 
            : 'Campaign created as draft'
        }
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Create campaign error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to create campaign' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};