// /src/lib/db.ts
import { D1Database } from '@cloudflare/workers-types';

export function getDB(env: any) {
  return env.DB;
}

// Helper for prepared statements with type safety
export function prepare<T = any>(db: D1Database, query: string, params?: any[]): Promise<T> {
  const stmt = db.prepare(query);
  if (params) {
    return stmt.bind(...params).all() as Promise<T>;
  }
  return stmt.all() as Promise<T>;
}

export function prepareFirst<T = any>(db: D1Database, query: string, params?: any[]): Promise<T> {
  const stmt = db.prepare(query);
  if (params) {
    return stmt.bind(...params).first() as Promise<T>;
  }
  return stmt.first() as Promise<T>;
}