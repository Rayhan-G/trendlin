// scripts/batch-impressions.js
// Run this as a separate process or cron job
import { Redis } from '@upstash/redis'
import { supabase } from '../lib/supabase'

const redis = Redis.fromEnv()

async function processBatch() {
  const batch = []
  
  // Get 100 impressions from queue
  for (let i = 0; i < 100; i++) {
    const item = await redis.rpop('impression_queue')
    if (!item) break
    batch.push(JSON.parse(item))
  }
  
  if (batch.length === 0) return
  
  // Bulk insert to database
  const { error } = await supabase
    .from('ad_impressions')
    .insert(batch.map(item => ({
      slot_id: item.slotId,
      code_id: item.codeId,
      session_id: item.sessionId,
      user_agent: item.userAgent,
      created_at: new Date(item.timestamp).toISOString()
    })))
  
  if (error) {
    console.error('Batch insert error:', error)
    // Re-add failed items to queue
    for (const item of batch) {
      await redis.lpush('impression_queue', JSON.stringify(item))
    }
  } else {
    console.log(`Processed ${batch.length} impressions`)
  }
}

// Run every 5 seconds
setInterval(processBatch, 5000)