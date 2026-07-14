// src/pages/api/admin/sources/index.ts
import type { APIRoute } from 'astro';

export const prerender = false;

// GET - Fetch all sources (master and state)
export const GET: APIRoute = async ({ locals }) => {
  try {
    const db = locals.runtime.env.DB;
    
    // Fetch master sources
    const masterResult = await db.prepare(`
      SELECT 
        id,
        name,
        url,
        description,
        source_type,
        logo_url,
        is_active,
        is_featured,
        trust_score,
        usage_count,
        created_at,
        updated_at,
        'master' as type
      FROM sources_master
      WHERE is_active = 1
      ORDER BY name
    `).all();

    // Fetch state sources
    const stateResult = await db.prepare(`
      SELECT 
        ss.id,
        ss.name,
        ss.url,
        ss.description,
        ss.source_type,
        ss.logo_url,
        ss.is_active,
        ss.is_featured,
        ss.trust_score,
        ss.usage_count,
        ss.created_at,
        ss.updated_at,
        'state' as type,
        s.name as state_name,
        s.code as state_code,
        s.abbreviation as state_abbr
      FROM sources_state ss
      LEFT JOIN sources_states s ON ss.state_id = s.id
      WHERE ss.is_active = 1
      ORDER BY s.name, ss.name
    `).all();

    return new Response(JSON.stringify({
      success: true,
      master: masterResult.results || [],
      state: stateResult.results || [],
      total: (masterResult.results?.length || 0) + (stateResult.results?.length || 0)
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error fetching sources:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch sources',
      master: [],
      state: [],
      total: 0
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};