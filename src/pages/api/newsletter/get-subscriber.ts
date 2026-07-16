// ============================================
// API: GET SUBSCRIBER BY EMAIL
// ============================================

import type { APIRoute } from 'astro';
import { getDB, prepareFirst } from '../../../lib/db';

export const GET: APIRoute = async ({ locals, url }) => {
  try {
    const env = locals?.env || {};
    const db = getDB(env);
    const email = url.searchParams.get('email');
    const token = url.searchParams.get('token');

    if (!email && !token) {
      return new Response(
        JSON.stringify({ success: false, error: 'Email or token required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    let query = 'SELECT * FROM newsletter_subscribers WHERE ';
    let param: string;

    if (token) {
      query += 'unsubscribe_token = ?';
      param = token;
    } else {
      query += 'email = ?';
      param = email!.toLowerCase().trim();
    }

    const subscriber = await prepareFirst(db, query, [param]);

    if (!subscriber) {
      return new Response(
        JSON.stringify({ success: false, error: 'Subscriber not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse preferences
    let preferences = {};
    let categories: string[] = [];
    try {
      preferences = subscriber.preferences ? JSON.parse(subscriber.preferences) : {};
      categories = preferences.categories || [];
    } catch (e) {
      // Use defaults
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          id: subscriber.id,
          email: subscriber.email,
          firstName: subscriber.first_name,
          lastName: subscriber.last_name,
          status: subscriber.status,
          token: subscriber.unsubscribe_token,
          categories: categories,
          createdAt: subscriber.created_at,
          verifiedAt: subscriber.verified_at
        }
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('Get subscriber error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to get subscriber' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};