// ============================================
// API: NEWSLETTER STATS
// Returns subscriber and campaign statistics
// ============================================

import type { APIRoute } from 'astro';
import { getDB, prepareFirst } from '../../../lib/db';

export const GET: APIRoute = async ({ locals }) => {
  try {
    const env = locals.env;
    const db = getDB(env);

    // Get subscriber stats
    const subscriberStats = await prepareFirst(
      db,
      `
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
          SUM(CASE WHEN status = 'unsubscribed' THEN 1 ELSE 0 END) as unsubscribed,
          SUM(CASE WHEN status = 'suspended' THEN 1 ELSE 0 END) as suspended,
          SUM(CASE WHEN status = 'bounced' THEN 1 ELSE 0 END) as bounced
        FROM newsletter_subscribers
      `
    );

    // Get today's activity
    const todayActivity = await prepareFirst(
      db,
      `
        SELECT 
          SUM(CASE WHEN type = 'subscribe' AND DATE(created_at) = DATE('now') THEN 1 ELSE 0 END) as subscribed_today,
          SUM(CASE WHEN type = 'unsubscribe' AND DATE(created_at) = DATE('now') THEN 1 ELSE 0 END) as unsubscribed_today,
          SUM(CASE WHEN type = 'confirm' AND DATE(created_at) = DATE('now') THEN 1 ELSE 0 END) as verified_today
        FROM newsletter_events
      `
    );

    // Get campaign stats
    const campaignStats = await prepareFirst(
      db,
      `
        SELECT 
          COUNT(*) as total_campaigns,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
          SUM(CASE WHEN status = 'scheduled' THEN 1 ELSE 0 END) as scheduled,
          SUM(CASE WHEN status = 'sending' THEN 1 ELSE 0 END) as sending,
          SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as drafts,
          SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
          ROUND(AVG(CASE 
            WHEN delivered_count > 0 
            THEN CAST(opened_count AS FLOAT) / delivered_count * 100 
            ELSE NULL 
          END), 2) as avg_open_rate,
          ROUND(AVG(CASE 
            WHEN opened_count > 0 
            THEN CAST(clicked_count AS FLOAT) / opened_count * 100 
            ELSE NULL 
          END), 2) as avg_click_rate,
          ROUND(AVG(CASE 
            WHEN delivered_count > 0 
            THEN CAST(unsubscribed_count AS FLOAT) / delivered_count * 100 
            ELSE NULL 
          END), 2) as avg_unsubscribe_rate
        FROM newsletter_campaigns
        WHERE status IN ('completed', 'sending')
      `
    );

    // Get queue stats
    const queueStats = await prepareFirst(
      db,
      `
        SELECT 
          COUNT(*) as total_in_queue,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
          SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) as processing,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
          SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
          SUM(CASE WHEN status = 'bounced' THEN 1 ELSE 0 END) as bounced
        FROM newsletter_queue
        WHERE status != 'completed'
      `
    );

    // Get category breakdown (if you have categories/preferences)
    let categoryStats = [];
    try {
      const cats = await prepareFirst(
        db,
        `
          SELECT 
            json_each.value as category,
            COUNT(*) as count
          FROM newsletter_subscribers, json_each(preferences, '$.categories')
          WHERE status = 'active'
          GROUP BY json_each.value
          ORDER BY count DESC
          LIMIT 5
        `
      );
      if (cats) {
        // Parse the result - depends on your preferences format
      }
    } catch (e) {
      // No preferences table or different format
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          subscribers: {
            total: subscriberStats?.total || 0,
            active: subscriberStats?.active || 0,
            pending: subscriberStats?.pending || 0,
            unsubscribed: subscriberStats?.unsubscribed || 0,
            suspended: subscriberStats?.suspended || 0,
            bounced: subscriberStats?.bounced || 0
          },
          today: {
            subscribed: todayActivity?.subscribed_today || 0,
            unsubscribed: todayActivity?.unsubscribed_today || 0,
            verified: todayActivity?.verified_today || 0
          },
          campaigns: {
            total: campaignStats?.total_campaigns || 0,
            completed: campaignStats?.completed || 0,
            scheduled: campaignStats?.scheduled || 0,
            sending: campaignStats?.sending || 0,
            drafts: campaignStats?.drafts || 0,
            failed: campaignStats?.failed || 0,
            avg_open_rate: campaignStats?.avg_open_rate || 0,
            avg_click_rate: campaignStats?.avg_click_rate || 0,
            avg_unsubscribe_rate: campaignStats?.avg_unsubscribe_rate || 0
          },
          queue: {
            total: queueStats?.total_in_queue || 0,
            pending: queueStats?.pending || 0,
            processing: queueStats?.processing || 0,
            failed: queueStats?.failed || 0,
            bounced: queueStats?.bounced || 0,
            completed: queueStats?.completed || 0
          }
        }
      }),
      { 
        status: 200, 
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        } 
      }
    );

  } catch (error: any) {
    console.error('Stats error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to fetch stats' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};