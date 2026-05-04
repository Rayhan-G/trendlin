// lib/cache.js
import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()

const CACHE_TTL = {
  AD: 300,        // 5 minutes
  CONTENT: 3600,  // 1 hour
  LIST: 300,      // 5 minutes
}

export async function getCached(key, fetcher, ttl = CACHE_TTL.CONTENT) {
  // Try cache first
  const cached = await redis.get(key)
  if (cached) {
    return JSON.parse(cached)
  }
  
  // Fetch fresh data
  const fresh = await fetcher()
  
  // Store in cache
  await redis.setex(key, ttl, JSON.stringify(fresh))
  
  return fresh
}

export async function invalidateCache(pattern) {
  const keys = await redis.keys(pattern)
  if (keys.length) {
    await redis.del(...keys)
  }
}

export async function cacheAd(slotId, adCode) {
  await redis.setex(`ad:${slotId}`, CACHE_TTL.AD, adCode)
}

export async function cacheContent(slug, content) {
  await redis.setex(`content:${slug}`, CACHE_TTL.CONTENT, JSON.stringify(content))
}