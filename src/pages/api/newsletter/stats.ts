// ============================================
// API: NEWSLETTER STATS
// ============================================

import type { APIRoute } from 'astro';
import { getDB, prepareFirst } from '../../../lib/db';

export const GET: APIRoute = async ({ locals }) => {
  try {
    console.log('📊 Stats API called');
    console.log('🔍 locals keys:', Object.keys(locals || {}));
    console.log('🔍 locals.env keys:', Object.keys(locals?.env || {}));
    
    const env = locals?.env || {};
    const db = getDB(env);
    
    console.log('✅ Database connection successful');

    const stats = await prepareFirst(
      db,
      `
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
          SUM(CASE WHEN status = 'unsubscribed' THEN 1 ELSE 0 END) as unsubscribed
        FROM newsletter_subscribers
      `
    );

    console.log('📊 Stats retrieved:', stats);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          total: stats?.total || 0,
          active: stats?.active || 0,
          pending: stats?.pending || 0,
          unsubscribed: stats?.unsubscribed || 0
        }
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('❌ Stats error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to get stats',
        stack: error.stack 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};