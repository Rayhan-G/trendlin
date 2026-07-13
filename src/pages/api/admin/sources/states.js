// ============================================
// API: /api/admin/sources/states
// GET - Get all US states
// ============================================

export async function GET({ locals }) {
  try {
    const { DB } = locals.runtime.env;
    
    console.log('📡 Fetching states...');
    
    const result = await DB.prepare(`
      SELECT 
        id, name, code, abbreviation, region,
        is_active
      FROM sources_states
      WHERE is_active = 1
      ORDER BY name ASC
    `).all();
    
    console.log(`✅ Found ${result.results?.length || 0} states`);
    
    return new Response(JSON.stringify({
      success: true,
      states: result.results || []
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('❌ Error fetching states:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}