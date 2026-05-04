// lib/supabase.js
import { createClient } from '@supabase/supabase-js'

// Environment variables validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabaseReplicaUrl = process.env.SUPABASE_READ_REPLICA_URL

// Helper function to check if Supabase is configured
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey)
}

// Helper function to check if admin client is available
export const isSupabaseAdminConfigured = () => {
  return !!(supabaseUrl && supabaseServiceKey)
}

// Log configuration status (only in development)
if (process.env.NODE_ENV === 'development') {
  if (!isSupabaseConfigured()) {
    console.warn('⚠️ Supabase is not configured. Check your environment variables.')
  }
}

// Primary client for writes (browser-compatible)
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Read replica client for queries
export const supabaseReader = isSupabaseConfigured()
  ? createClient(
      supabaseReplicaUrl || supabaseUrl,
      supabaseAnonKey,
      {
        db: { poolSize: 1 },
        auth: { persistSession: false }
      }
    )
  : null

// Admin client with service role (server-side only)
export const supabaseAdmin = isSupabaseAdminConfigured()
  ? createClient(
      supabaseUrl,
      supabaseServiceKey,
      {
        auth: { autoRefreshToken: false, persistSession: false }
      }
    )
  : null

// Safe query function with error handling
export const safeQuery = async (queryFn, fallback = null) => {
  if (!supabase) {
    console.error('Supabase client not configured')
    return { data: fallback, error: new Error('Supabase not configured') }
  }
  
  try {
    return await queryFn()
  } catch (error) {
    console.error('Database query error:', error)
    return { data: fallback, error }
  }
}

// Re-export createClient for advanced use cases
export { createClient }

// Default export for backwards compatibility
export default supabase