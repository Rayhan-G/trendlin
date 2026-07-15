// /src/pages/api/newsletter/campaigns.ts
import type { APIRoute } from 'astro';
import { getCampaigns } from '../../../lib/newsletter';

export const GET: APIRoute = async ({ locals, url }) => {
  try {
    const env = locals.env;
    const limit = parseInt(url.searchParams.get('limit') || '10');
    
    const campaigns = await getCampaigns(env, { limit });

    return new Response(
      JSON.stringify({
        success: true,
        data: campaigns
      }),
      { status: 200 }
    );

  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch campaigns' }),
      { status: 500 }
    );
  }
};