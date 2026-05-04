// lib/supabase.js
import { createClient } from '@supabase/supabase-js'

// Primary for writes
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Read replica for queries (uses connection pooling port 6543)
export const supabaseReader = createClient(
  process.env.SUPABASE_READ_REPLICA_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    db: { poolSize: 1 },
    auth: { persistSession: false }
  }
)

// Admin client (service role)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: { autoRefreshToken: false, persistSession: false }
  }
)