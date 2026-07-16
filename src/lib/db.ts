// ============================================
// DATABASE HELPER - PAGES COMPATIBLE
// ============================================

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
    throw new Error('Invalid database binding.');
  }
  
  console.log('✅ Database connection successful');
  return db;
}

export async function prepare<T = any>(db: any, query: string, params?: any[]): Promise<T> {
  try {
    const stmt = db.prepare(query);
    if (params && params.length > 0) {
      return stmt.bind(...params).all() as Promise<T>;
    }
    return stmt.all() as Promise<T>;
  } catch (error) {
    console.error('Database prepare error:', error);
    throw error;
  }
}

export async function prepareFirst<T = any>(db: any, query: string, params?: any[]): Promise<T> {
  try {
    const stmt = db.prepare(query);
    if (params && params.length > 0) {
      return stmt.bind(...params).first() as Promise<T>;
    }
    return stmt.first() as Promise<T>;
  } catch (error) {
    console.error('Database prepareFirst error:', error);
    throw error;
  }
}