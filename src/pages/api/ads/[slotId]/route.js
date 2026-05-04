// app/api/ads/[slotId]/route.js (Next.js App Router)
import { NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'
import { supabaseReader } from '@/lib/supabase'

const redis = Redis.fromEnv()

export const runtime = 'edge'
export const revalidate = 300 // 5 minutes CDN cache

export async function GET(request, { params }) {
  const { slotId } = params
  const { searchParams } = new URL(request.url)
  const position = searchParams.get('position') || 'unknown'
  
  try {
    // Level 1: Check Redis cache (1ms)
    let adData = await redis.get(`ad:${slotId}`)
    
    if (!adData) {
      // Level 2: Check database read replica (only on cache miss)
      const { data, error } = await supabaseReader
        .from('ad_slot_codes')
        .select(`
          code_id,
          ad_codes (id, code)
        `)
        .eq('slot_id', slotId)
        .single()
      
      if (error || !data) {
        return NextResponse.json({ error: 'Ad not found' }, { status: 404 })
      }
      
      adData = {
        html: data.ad_codes.code,
        codeId: data.code_id
      }
      
      // Store in Redis for 5 minutes
      await redis.setex(`ad:${slotId}`, 300, JSON.stringify(adData))
    } else {
      adData = JSON.parse(adData)
    }
    
    // Set cache headers for CDN
    const response = NextResponse.json({
      html: adData.html,
      codeId: adData.codeId
    })
    
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
    response.headers.set('CDN-Cache-Control', 'public, max-age=300')
    response.headers.set('Vercel-CDN-Cache-Control', 'public, max-age=300')
    
    return response
    
  } catch (error) {
    console.error('Ad API error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}