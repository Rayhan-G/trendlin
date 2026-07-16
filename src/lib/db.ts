// ============================================
// DATABASE HELPER - PAGES COMPATIBLE
// PRODUCTION READY
// ============================================

/**
 * Get database connection from environment
 * Supports multiple sources for compatibility
 */
export function getDB(env: any) {
  console.log('🔍 getDB called');
  
  // Try multiple sources where DB might be located
  const db = env?.DB ||          // Direct
             env?.runtime?.env?.DB ||  // Runtime env
             env?.env?.DB ||      // Nested env
             null;
  
  if (!db) {
    console.error('❌ Database not available');
    console.error('Available env keys:', Object.keys(env || {}));
    console.error('Available runtime keys:', Object.keys(env?.runtime || {}));
    console.error('Available runtime.env keys:', Object.keys(env?.runtime?.env || {}));
    throw new Error('Database not available. Please check D1 binding.');
  }
  
  if (typeof db.prepare !== 'function') {
    console.error('❌ DB object does not have prepare method');
    console.error('DB type:', typeof db);
    console.error('DB keys:', Object.keys(db || {}));
    throw new Error('Invalid database binding. Expected D1Database instance.');
  }
  
  console.log('✅ Database connection successful');
  return db;
}

/**
 * Execute a prepared statement and return all results
 */
export async function prepare<T = any>(db: any, query: string, params?: any[]): Promise<T> {
  try {
    console.log('📝 Preparing query:', query.substring(0, 100) + (query.length > 100 ? '...' : ''));
    
    const stmt = db.prepare(query);
    if (params && params.length > 0) {
      console.log('📊 Query params:', params);
      return stmt.bind(...params).all() as Promise<T>;
    }
    return stmt.all() as Promise<T>;
  } catch (error) {
    console.error('❌ Database prepare error:', error);
    console.error('Query:', query);
    console.error('Params:', params);
    throw error;
  }
}

/**
 * Execute a prepared statement and return the first result
 */
export async function prepareFirst<T = any>(db: any, query: string, params?: any[]): Promise<T> {
  try {
    console.log('📝 Preparing first query:', query.substring(0, 100) + (query.length > 100 ? '...' : ''));
    
    const stmt = db.prepare(query);
    if (params && params.length > 0) {
      console.log('📊 Query params:', params);
      return stmt.bind(...params).first() as Promise<T>;
    }
    return stmt.first() as Promise<T>;
  } catch (error) {
    console.error('❌ Database prepareFirst error:', error);
    console.error('Query:', query);
    console.error('Params:', params);
    throw error;
  }
}

/**
 * Execute a prepared statement and return the number of affected rows
 */
export async function execute(db: any, query: string, params?: any[]): Promise<{ success: boolean; changes: number; lastId?: number }> {
  try {
    console.log('📝 Executing query:', query.substring(0, 100) + (query.length > 100 ? '...' : ''));
    
    const stmt = db.prepare(query);
    let result;
    if (params && params.length > 0) {
      console.log('📊 Query params:', params);
      result = await stmt.bind(...params).run();
    } else {
      result = await stmt.run();
    }
    
    return {
      success: true,
      changes: result.meta?.changes || 0,
      lastId: result.meta?.last_row_id
    };
  } catch (error) {
    console.error('❌ Database execute error:', error);
    console.error('Query:', query);
    console.error('Params:', params);
    throw error;
  }
}

/**
 * Check if database connection is valid
 */
export function isDbValid(db: any): boolean {
  if (!db) return false;
  if (typeof db.prepare !== 'function') return false;
  return true;
}

/**
 * Get table count for diagnostics
 */
export async function getTableCount(db: any, tableName: string): Promise<number> {
  try {
    const result = await prepareFirst<{ count: number }>(
      db,
      `SELECT COUNT(*) as count FROM ${tableName}`
    );
    return result?.count || 0;
  } catch (error) {
    console.error(`❌ Error getting count for ${tableName}:`, error);
    return 0;
  }
}

/**
 * Check if table exists
 */
export async function tableExists(db: any, tableName: string): Promise<boolean> {
  try {
    const result = await prepareFirst(
      db,
      "SELECT name FROM sqlite_master WHERE type='table' AND name = ?",
      [tableName]
    );
    return !!result;
  } catch (error) {
    console.error(`❌ Error checking table ${tableName}:`, error);
    return false;
  }
}

/**
 * Get all table names for diagnostics
 */
export async function getAllTables(db: any): Promise<string[]> {
  try {
    const result = await prepare<{ name: string }>(
      db,
      "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
    );
    return (result?.results || []).map(row => row.name);
  } catch (error) {
    console.error('❌ Error getting tables:', error);
    return [];
  }
}