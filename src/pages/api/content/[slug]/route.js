// app/api/content/[slug]/route.js
import { NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'
import { supabaseReader } from '@/lib/supabase'

const redis = Redis.fromEnv()

export const runtime = 'edge'
export const revalidate = 3600 // 1 hour

export async function GET(request, { params }) {
  const { slug } = params
  
  try {
    // Check Redis cache
    let content = await redis.get(`content:${slug}`)
    
    if (!content) {
      // Query read replica
      const { data, error } = await supabaseReader
        .from('contents')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .single()
      
      if (error || !data) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 })
      }
      
      content = data
      await redis.setex(`content:${slug}`, 3600, JSON.stringify(content))
      
      // Increment view count asynchronously
      fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/track-view`, {
        method: 'POST',
        body: JSON.stringify({ contentId: data.id }),
        headers: { 'Content-Type': 'application/json' }
      }).catch(() => {})
    } else {
      content = JSON.parse(content)
    }
    
    const response = NextResponse.json(content)
    response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=7200')
    
    return response
    
  } catch (error) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}