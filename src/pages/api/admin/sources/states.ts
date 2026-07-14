// /src/pages/api/admin/sources/states.ts
import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request, locals }) => {
  try {
    const url = new URL(request.url);
    const region = url.searchParams.get('region');
    const isActive = url.searchParams.get('is_active');
    const search = url.searchParams.get('search');
    
    const env = locals.runtime?.env || (globalThis as any).env;
    
    if (!env || !env.DB) {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Database connection not available' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    let query = `
      SELECT 
        id,
        name,
        code,
        abbreviation,
        region,
        is_active,
        created_at,
        updated_at,
        (
          SELECT COUNT(*) 
          FROM sources_state 
          WHERE state_id = sources_states.id AND is_active = 1
        ) as source_count
      FROM sources_states
      WHERE 1=1
    `;
    
    const params: any[] = [];
    
    if (region) {
      query += ` AND region = ?`;
      params.push(region);
    }
    
    if (isActive !== null && isActive !== undefined) {
      query += ` AND is_active = ?`;
      params.push(isActive === 'true' || isActive === '1' ? 1 : 0);
    }
    
    if (search) {
      query += ` AND (name LIKE ? OR code LIKE ? OR abbreviation LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    query += ` ORDER BY name ASC`;
    
    const result = await env.DB.prepare(query).bind(...params).all();
    
    return new Response(JSON.stringify({ 
      success: true, 
      data: result.results || [] 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error fetching states:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: 'Failed to fetch states: ' + (error as Error).message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = await request.json();
    const env = locals.runtime?.env || (globalThis as any).env;
    
    if (!env || !env.DB) {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Database connection not available' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const { 
      name, 
      code, 
      abbreviation, 
      region = '', 
      is_active = 1
    } = body;
    
    if (!name || !code || !abbreviation) {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Name, code, and abbreviation are required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check for duplicate code or abbreviation
    const existing = await env.DB
      .prepare('SELECT id FROM sources_states WHERE code = ? OR abbreviation = ?')
      .bind(code, abbreviation)
      .first();
    
    if (existing) {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'State with this code or abbreviation already exists' 
      }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const result = await env.DB.prepare(`
      INSERT INTO sources_states (
        name, code, abbreviation, region, is_active
      ) VALUES (?, ?, ?, ?, ?)
    `).bind(name, code, abbreviation, region, parseInt(is_active)).run();
    
    return new Response(JSON.stringify({ 
      success: true, 
      data: { 
        id: result.lastID || result.meta?.last_row_id,
        ...body 
      } 
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error creating state:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: 'Failed to create state: ' + (error as Error).message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const PUT: APIRoute = async ({ request, locals }) => {
  try {
    const body = await request.json();
    const { id, name, code, abbreviation, region, is_active } = body;
    const env = locals.runtime?.env || (globalThis as any).env;
    
    if (!env || !env.DB) {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Database connection not available' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (!id) {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'State ID is required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const result = await env.DB.prepare(`
      UPDATE sources_states SET
        name = ?,
        code = ?,
        abbreviation = ?,
        region = ?,
        is_active = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      name || '',
      code || '',
      abbreviation || '',
      region || '',
      is_active !== undefined ? parseInt(is_active) : 1,
      parseInt(id)
    ).run();
    
    if (result.changes === 0) {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'State not found' 
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({ 
      success: true, 
      data: { id, ...body } 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error updating state:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: 'Failed to update state: ' + (error as Error).message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const DELETE: APIRoute = async ({ request, locals }) => {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const env = locals.runtime?.env || (globalThis as any).env;
    
    if (!env || !env.DB) {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Database connection not available' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (!id) {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'State ID is required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check if state has sources
    const usage = await env.DB
      .prepare('SELECT COUNT(*) as count FROM sources_state WHERE state_id = ?')
      .bind(parseInt(id))
      .first();
    
    if (usage && usage.count > 0) {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Cannot delete state that has sources associated with it' 
      }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const result = await env.DB
      .prepare('DELETE FROM sources_states WHERE id = ?')
      .bind(parseInt(id))
      .run();
    
    if (result.changes === 0) {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'State not found' 
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({ 
      success: true, 
      data: { id, deleted: true } 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error deleting state:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: 'Failed to delete state: ' + (error as Error).message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};