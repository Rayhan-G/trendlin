import type { APIRoute } from 'astro';
import { getSubscriberStats } from '@/lib/newsletter';

export const GET: APIRoute = async ({ locals }) => {
  try {
    const db = (locals as any).runtime?.env?.DB;
    
    if (!db) {
      return new Response(
        JSON.stringify({ success: false, message: 'Database not available' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const stats = await getSubscriberStats(db);

    return new Response(
      JSON.stringify({
        success: true,
        data: stats,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Stats error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Something went wrong' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};