// Helper functions for sources management
// Cloudflare Workers with D1

/**
 * Get all categories
 */
export async function getCategories(env) {
  const result = await env.DB
    .prepare(`
      SELECT 
        id,
        name,
        slug,
        icon,
        description,
        display_order,
        is_active,
        created_at,
        updated_at
      FROM sources_categories
      WHERE is_active = 1
      ORDER BY display_order ASC, name ASC
    `)
    .all();
  
  return result.results;
}

/**
 * Get all states
 */
export async function getStates(env, options = {}) {
  const { region, isActive = true } = options;
  
  let query = `
    SELECT 
      id,
      name,
      code,
      abbreviation,
      region,
      is_active
    FROM sources_states
    WHERE 1=1
  `;
  
  const params = [];
  
  if (region) {
    query += ` AND region = ?`;
    params.push(region);
  }
  
  if (isActive !== undefined && isActive !== null) {
    query += ` AND is_active = ?`;
    params.push(isActive ? 1 : 0);
  }
  
  query += ` ORDER BY name ASC`;
  
  const result = await env.DB
    .prepare(query)
    .bind(...params)
    .all();
  
  return result.results;
}

/**
 * Get sources by category and state
 */
export async function getSources(env, options = {}) {
  const { 
    categoryId, 
    stateId, 
    search, 
    type = 'all',
    limit = 50,
    offset = 0,
    featured = false
  } = options;
  
  let query = '';
  const params = [];
  
  if (type === 'master') {
    query = `
      SELECT 
        s.id,
        s.name,
        s.url,
        s.category_id,
        s.description,
        s.source_type,
        s.logo_url,
        s.is_active,
        s.is_featured,
        s.trust_score,
        s.usage_count,
        c.name as category_name,
        c.icon as category_icon,
        'master' as source_type_actual
      FROM sources_master s
      JOIN sources_categories c ON s.category_id = c.id
      WHERE s.is_active = 1
    `;
    
    if (categoryId) {
      query += ` AND s.category_id = ?`;
      params.push(categoryId);
    }
    
    if (search) {
      query += ` AND (s.name LIKE ? OR s.description LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }
    
    if (featured) {
      query += ` AND s.is_featured = 1`;
    }
    
    query += ` ORDER BY s.is_featured DESC, s.trust_score DESC, s.name ASC`;
    
  } else if (type === 'state') {
    query = `
      SELECT 
        s.id,
        s.name,
        s.url,
        s.category_id,
        s.description,
        s.source_type,
        s.logo_url,
        s.is_active,
        s.is_featured,
        s.trust_score,
        s.usage_count,
        s.address,
        s.phone,
        s.email,
        c.name as category_name,
        c.icon as category_icon,
        st.id as state_id,
        st.name as state_name,
        st.code as state_code,
        'state' as source_type_actual
      FROM sources_state s
      JOIN sources_categories c ON s.category_id = c.id
      LEFT JOIN sources_states st ON s.state_id = st.id
      WHERE s.is_active = 1
    `;
    
    if (categoryId) {
      query += ` AND s.category_id = ?`;
      params.push(categoryId);
    }
    
    if (stateId) {
      query += ` AND s.state_id = ?`;
      params.push(stateId);
    }
    
    if (search) {
      query += ` AND (s.name LIKE ? OR s.description LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }
    
    if (featured) {
      query += ` AND s.is_featured = 1`;
    }
    
    query += ` ORDER BY s.is_featured DESC, s.trust_score DESC, s.name ASC`;
    
  } else {
    // 'all' - combine both
    const masterQuery = `
      SELECT 
        s.id,
        s.name,
        s.url,
        s.category_id,
        s.description,
        s.source_type,
        s.logo_url,
        s.is_active,
        s.is_featured,
        s.trust_score,
        s.usage_count,
        c.name as category_name,
        c.icon as category_icon,
        'master' as source_type_actual,
        NULL as state_id,
        NULL as state_name,
        NULL as state_code,
        NULL as address,
        NULL as phone,
        NULL as email
      FROM sources_master s
      JOIN sources_categories c ON s.category_id = c.id
      WHERE s.is_active = 1
    `;
    
    const stateQuery = `
      SELECT 
        s.id,
        s.name,
        s.url,
        s.category_id,
        s.description,
        s.source_type,
        s.logo_url,
        s.is_active,
        s.is_featured,
        s.trust_score,
        s.usage_count,
        c.name as category_name,
        c.icon as category_icon,
        'state' as source_type_actual,
        st.id as state_id,
        st.name as state_name,
        st.code as state_code,
        s.address,
        s.phone,
        s.email
      FROM sources_state s
      JOIN sources_categories c ON s.category_id = c.id
      LEFT JOIN sources_states st ON s.state_id = st.id
      WHERE s.is_active = 1
    `;
    
    let whereClause = '';
    const unionParams = [];
    
    if (categoryId) {
      whereClause = ` AND category_id = ?`;
      unionParams.push(categoryId);
    }
    
    if (stateId) {
      whereClause += ` AND state_id = ?`;
      unionParams.push(stateId);
    }
    
    if (search) {
      whereClause += ` AND (name LIKE ? OR description LIKE ?)`;
      unionParams.push(`%${search}%`, `%${search}%`);
    }
    
    if (featured) {
      whereClause += ` AND is_featured = 1`;
    }
    
    query = `(${masterQuery}${whereClause}) UNION ALL (${stateQuery}${whereClause}) ORDER BY is_featured DESC, trust_score DESC, name ASC`;
    params.push(...unionParams, ...unionParams);
  }
  
  // Add pagination
  query += ` LIMIT ? OFFSET ?`;
  params.push(limit, offset);
  
  const result = await env.DB
    .prepare(query)
    .bind(...params)
    .all();
  
  return result.results;
}

/**
 * Get sources by state
 */
export async function getSourcesByState(env, stateCode, options = {}) {
  const { categoryId, search, featured = false, limit = 50 } = options;
  
  let query = `
    SELECT 
      s.id,
      s.name,
      s.url,
      s.category_id,
      s.description,
      s.source_type,
      s.logo_url,
      s.is_active,
      s.is_featured,
      s.trust_score,
      s.usage_count,
      s.address,
      s.phone,
      s.email,
      c.name as category_name,
      c.icon as category_icon
    FROM sources_state s
    JOIN sources_categories c ON s.category_id = c.id
    JOIN sources_states st ON s.state_id = st.id
    WHERE st.code = ? AND s.is_active = 1
  `;
  
  const params = [stateCode];
  
  if (categoryId) {
    query += ` AND s.category_id = ?`;
    params.push(categoryId);
  }
  
  if (search) {
    query += ` AND (s.name LIKE ? OR s.description LIKE ?)`;
    params.push(`%${search}%`, `%${search}%`);
  }
  
  if (featured) {
    query += ` AND s.is_featured = 1`;
  }
  
  query += ` ORDER BY s.is_featured DESC, s.trust_score DESC, s.name ASC`;
  query += ` LIMIT ?`;
  params.push(limit);
  
  const result = await env.DB
    .prepare(query)
    .bind(...params)
    .all();
  
  return result.results;
}

/**
 * Get source by ID
 */
export async function getSourceById(env, id) {
  let result = await env.DB
    .prepare(`
      SELECT 
        s.id,
        s.name,
        s.url,
        s.category_id,
        s.description,
        s.source_type,
        s.logo_url,
        s.is_active,
        s.is_featured,
        s.trust_score,
        s.usage_count,
        s.address,
        s.phone,
        s.email,
        c.name as category_name,
        c.icon as category_icon,
        st.id as state_id,
        st.name as state_name,
        st.code as state_code,
        'state' as source_type_actual
      FROM sources_state s
      JOIN sources_categories c ON s.category_id = c.id
      LEFT JOIN sources_states st ON s.state_id = st.id
      WHERE s.id = ?
    `)
    .bind(id)
    .first();
  
  if (!result) {
    result = await env.DB
      .prepare(`
        SELECT 
          s.id,
          s.name,
          s.url,
          s.category_id,
          s.description,
          s.source_type,
          s.logo_url,
          s.is_active,
          s.is_featured,
          s.trust_score,
          s.usage_count,
          c.name as category_name,
          c.icon as category_icon,
          'master' as source_type_actual
        FROM sources_master s
        JOIN sources_categories c ON s.category_id = c.id
        WHERE s.id = ?
      `)
      .bind(id)
      .first();
  }
  
  return result;
}

/**
 * Increment source usage count
 */
export async function incrementSourceUsage(env, id, type = 'state') {
  const table = type === 'master' ? 'sources_master' : 'sources_state';
  
  await env.DB
    .prepare(`UPDATE ${table} SET usage_count = usage_count + 1 WHERE id = ?`)
    .bind(id)
    .run();
}

/**
 * Get featured sources
 */
export async function getFeaturedSources(env, stateCode = null, limit = 6) {
  let query = `
    SELECT 
      s.id,
      s.name,
      s.url,
      s.category_id,
      s.description,
      s.source_type,
      s.logo_url,
      s.is_active,
      s.is_featured,
      s.trust_score,
      s.usage_count,
      c.name as category_name,
      c.icon as category_icon
    FROM sources_state s
    JOIN sources_categories c ON s.category_id = c.id
    JOIN sources_states st ON s.state_id = st.id
    WHERE s.is_active = 1 AND s.is_featured = 1
  `;
  
  const params = [];
  
  if (stateCode) {
    query += ` AND st.code = ?`;
    params.push(stateCode);
  }
  
  query += ` ORDER BY s.trust_score DESC, s.usage_count DESC LIMIT ?`;
  params.push(limit);
  
  const result = await env.DB
    .prepare(query)
    .bind(...params)
    .all();
  
  return result.results;
}