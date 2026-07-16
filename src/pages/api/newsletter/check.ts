// ============================================
// API: CHECK SUBSCRIBER STATUS
// ============================================

import type { APIRoute } from 'astro';
import { getDB, prepareFirst } from '../../../lib/db';

export const GET: APIRoute = async ({ url, locals }) => {
  try {
    const email = url.searchParams.get('email');
    const env = locals.env;
    const db = getDB(env);

    if (!email) {
      return new Response(
        JSON.stringify({ success: false, error: 'Email is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const subscriber = await prepareFirst(
      db,
      'SELECT status FROM newsletter_subscribers WHERE email = ?',
      [email.toLowerCase().trim()]
    );

    if (!subscriber) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          status: 'not_found' 
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        status: subscriber.status 
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Check subscriber error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to check subscriber' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};