// /src/lib/db.ts
// Remove the D1Database import and use any type instead

export function getDB(env: any) {
  return env.DB;
}

// Helper for prepared statements with type safety
export function prepare<T = any>(db: any, query: string, params?: any[]): Promise<T> {
  const stmt = db.prepare(query);
  if (params) {
    return stmt.bind(...params).all() as Promise<T>;
  }
  return stmt.all() as Promise<T>;
}

export function prepareFirst<T = any>(db: any, query: string, params?: any[]): Promise<T> {
  const stmt = db.prepare(query);
  if (params) {
    return stmt.bind(...params).first() as Promise<T>;
  }
  return stmt.first() as Promise<T>;
}