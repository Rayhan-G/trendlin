// app/api/track-impression/route.js
import { NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()

export const runtime = 'edge'

export async function POST(request) {
  try {
    const data = await request.json()
    const { slotId, codeId, position } = data
    
    // Get session ID from cookie
    const sessionId = request.cookies.get('session_id')?.value || crypto.randomUUID()
    
    // Add to Redis queue (batch processing)
    await redis.lpush('impression_queue', JSON.stringify({
      slotId,
      codeId,
      sessionId,
      position,
      timestamp: Date.now(),
      userAgent: request.headers.get('user-agent') || 'unknown'
    }))
    
    // Set response headers for no caching
    const response = NextResponse.json({ success: true })
    response.headers.set('Cache-Control', 'no-store')
    
    return response
    
  } catch (error) {
    // Silently fail - don't block user
    return NextResponse.json({ success: false }, { status: 200 })
  }
}