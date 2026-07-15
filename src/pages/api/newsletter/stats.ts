// /src/pages/api/admin/newsletter/stats.ts
import type { APIRoute } from 'astro';
import { createD1Client } from '../../../../lib/db';

export const GET: APIRoute = async ({ locals }) => {
  try {
    const db = createD1Client(locals.env.DB);

    // Overall stats
    const stats = await db.prepare(`
      SELECT 
        (SELECT COUNT(*) FROM newsletter_subscribers WHERE status = 'active') as active_subscribers,
        (SELECT COUNT(*) FROM newsletter_subscribers) as total_subscribers,
        (SELECT COUNT(*) FROM newsletter_subscribers WHERE status = 'pending') as pending_subscribers,
        (SELECT COUNT(*) FROM newsletter_campaigns WHERE status = 'completed') as total_campaigns,
        (SELECT COUNT(*) FROM newsletter_campaigns) as all_campaigns,
        (SELECT SUM(total_recipients) FROM newsletter_campaigns) as total_emails_sent,
        (SELECT SUM(opened_count) FROM newsletter_campaigns) as total_opens,
        (SELECT SUM(clicked_count) FROM newsletter_campaigns) as total_clicks
    `).first();

    // Monthly growth
    const growth = await db.prepare(`
      SELECT 
        strftime('%Y-%m', created_at) as month,
        COUNT(*) as new_subscribers
      FROM newsletter_subscribers
      WHERE created_at >= datetime('now', '-6 months')
      GROUP BY strftime('%Y-%m', created_at)
      ORDER BY month DESC
    `).all();

    // Recent campaigns
    const recentCampaigns = await db.prepare(`
      SELECT 
        id,
        subject,
        status,
        sent_at,
        total_recipients,
        delivered_count,
        opened_count,
        clicked_count,
        CAST(opened_count AS FLOAT) / NULLIF(delivered_count, 0) * 100 as open_rate,
        CAST(clicked_count AS FLOAT) / NULLIF(opened_count, 0) * 100 as click_rate
      FROM newsletter_campaigns
      WHERE status = 'completed'
      ORDER BY sent_at DESC
      LIMIT 10
    `).all();

    // Top performing campaigns
    const topCampaigns = await db.prepare(`
      SELECT 
        subject,
        total_recipients,
        delivered_count,
        opened_count,
        CAST(opened_count AS FLOAT) / NULLIF(delivered_count, 0) * 100 as open_rate
      FROM newsletter_campaigns
      WHERE status = 'completed' AND total_recipients > 100
      ORDER BY open_rate DESC
      LIMIT 5
    `).all();

    return new Response(
      JSON.stringify({
        success: true,
        stats: stats,
        growth: growth.results,
        recentCampaigns: recentCampaigns.results,
        topCampaigns: topCampaigns.results,
      }),
      { status: 200 }
    );

  } catch (error) {
    console.error('Stats error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch stats' }),
      { status: 500 }
    );
  }
};