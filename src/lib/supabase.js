import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Check if Supabase is configured
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey && supabaseUrl !== 'your_supabase_project_url')
}

// Create client only if configured
export const supabase = isSupabaseConfigured() 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Helper function to get posts
export async function getPosts() {
  if (!supabase) return []
  const { data } = await supabase.from('posts').select('*').order('created_at', { ascending: false })
  return data || []
}

// Helper function to get post by slug
export async function getPostBySlug(slug) {
  if (!supabase) return null
  
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()
  
  if (error) {
    console.error('Error fetching post:', error)
    return null
  }
  
  return data
}