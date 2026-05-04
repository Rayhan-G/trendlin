// app/api/track-view/route.js
import { NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()

export async function POST(request) {
  try {
    const { contentId } = await request.json()
    
    // Increment view count in Redis (atomic)
    await redis.incr(`views:${contentId}`)
    
    // Every 1000 views, sync to database
    const views = await redis.get(`views:${contentId}`)
    if (views && parseInt(views) % 1000 === 0) {
      // Async update database (fire and forget)
      fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/sync-views`, {
        method: 'POST',
        body: JSON.stringify({ contentId, views }),
        headers: { 'Content-Type': 'application/json' }
      }).catch(() => {})
    }
    
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false }, { status: 200 })
  }
}