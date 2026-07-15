// /src/pages/api/newsletter/stats.ts
import type { APIRoute } from 'astro';
import { getSubscriberStats, getCampaignStats, getLists } from '../../../lib/newsletter';

export const GET: APIRoute = async ({ locals }) => {
  try {
    const env = locals.env;
    
    const [subscribers, campaigns, lists] = await Promise.all([
      getSubscriberStats(env),
      getCampaignStats(env),
      getLists(env, true)
    ]);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          subscribers,
          campaigns,
          lists
        }
      }),
      { status: 200 }
    );

  } catch (error) {
    console.error('Error fetching newsletter stats:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch stats' }),
      { status: 500 }
    );
  }
};