// scripts/monitor.js
import { Redis } from '@upstash/redis'
import { supabase } from '../lib/supabase'

const redis = Redis.fromEnv()

async function monitor() {
  // Check queue length
  const queueLength = await redis.llen('impression_queue')
  console.log(`📊 Queue length: ${queueLength}`)
  
  // Check database connections
  const { data } = await supabase.rpc('get_connection_count')
  console.log(`🔌 DB connections: ${data || 0}`)
  
  // Check cache hit rate
  const cacheHits = await redis.get('stats:cache_hits') || 0
  const cacheMisses = await redis.get('stats:cache_misses') || 0
  const hitRate = cacheHits / (cacheHits + cacheMisses) * 100
  console.log(`💾 Cache hit rate: ${hitRate.toFixed(2)}%`)
}

setInterval(monitor, 60000)