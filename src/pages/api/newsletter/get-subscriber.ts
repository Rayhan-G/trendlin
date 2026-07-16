// ============================================
// API: GET SUBSCRIBER BY EMAIL OR TOKEN
// ============================================

import type { APIRoute } from 'astro';
import { getDB, prepareFirst } from '../../../lib/db';

export const GET: APIRoute = async ({ url, locals }) => {
  try {
    const email = url.searchParams.get('email');
    const token = url.searchParams.get('token');
    const env = locals.env;
    const db = getDB(env);

    let subscriber = null;

    if (token) {
      subscriber = await prepareFirst(
        db,
        'SELECT * FROM newsletter_subscribers WHERE unsubscribe_token = ?',
        [token]
      );
    } else if (email) {
      subscriber = await prepareFirst(
        db,
        'SELECT * FROM newsletter_subscribers WHERE email = ?',
        [email.toLowerCase().trim()]
      );
    }

    if (!subscriber) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Subscriber not found' 
        }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse preferences
    let preferences = {};
    let categories: string[] = [];
    let frequency = 'weekly';
    
    try {
      preferences = subscriber.preferences ? JSON.parse(subscriber.preferences) : {};
      categories = preferences.categories || [];
      frequency = preferences.frequency || 'weekly';
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
          frequency: frequency,
          createdAt: subscriber.created_at,
          verifiedAt: subscriber.verified_at
        }
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
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