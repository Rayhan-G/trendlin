// ============================================
// API: NEWSLETTER STATS
// ============================================

import type { APIRoute } from 'astro';
import { getDB, prepareFirst } from '../../../lib/db';

export const GET: APIRoute = async ({ locals }) => {
  try {
    const env = locals?.env || {};
    const db = getDB(env);

    // Get subscriber stats
    const stats = await prepareFirst(
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

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          total: stats?.total || 0,
          active: stats?.active || 0,
          pending: stats?.pending || 0,
          unsubscribed: stats?.unsubscribed || 0,
          suspended: stats?.suspended || 0,
          bounced: stats?.bounced || 0
        }
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('Stats error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to get stats' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};