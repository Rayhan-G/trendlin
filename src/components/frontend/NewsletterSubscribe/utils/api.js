// src/components/frontend/NewsletterSubscribe/utils/api.js
import { supabase } from '../../../../lib/supabase'

// Helper to ensure client-side only execution
const isClient = typeof window !== 'undefined'

export async function fetchCurrentUser() {
  // Only run on client side
  if (!isClient) {
    return { authenticated: false, user: null, newsletter: null }
  }
  
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) throw sessionError
    
    if (!session) {
      return { authenticated: false, user: null, newsletter: null }
    }
    
    const user = session.user
    
    // Fetch newsletter preferences
    const { data: newsletterPrefs, error: prefsError } = await supabase
      .from('newsletter_preferences')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()
    
    if (prefsError && prefsError.code !== 'PGRST116') {
      console.error('Error fetching preferences:', prefsError)
    }
    
    return {
      authenticated: true,
      user: {
        id: user.id,
        email: user.email
      },
      newsletter: newsletterPrefs || null
    }
  } catch (err) {
    console.error('Auth check failed:', err)
    return { authenticated: false, user: null, newsletter: null }
  }
}

export async function subscribeToNewsletter({ userId, categories, email }) {
  if (!isClient) throw new Error('Can only subscribe on client side')
  
  // Check if user already has preferences
  const { data: existingPrefs } = await supabase
    .from('newsletter_preferences')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle()

  const deliveryDay = 'Sunday'
  
  if (existingPrefs) {
    // Update existing
    const { error } = await supabase
      .from('newsletter_preferences')
      .update({
        is_subscribed: true,
        categories: categories,
        delivery_frequency: 'weekly',
        max_posts_per_week: categories.length,
        post_format: 'digest',
        newsletter_email: email,
        subscribed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
    
    if (error) throw error
  } else {
    // Insert new
    const { error } = await supabase
      .from('newsletter_preferences')
      .insert({
        user_id: userId,
        is_subscribed: true,
        categories: categories,
        delivery_frequency: 'weekly',
        max_posts_per_week: categories.length,
        post_format: 'digest',
        newsletter_email: email,
        subscribed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    
    if (error) throw error
  }
  
  return { success: true }
}

export async function updatePreferences({ userId, categories }) {
  if (!isClient) throw new Error('Can only update preferences on client side')
  
  const { error } = await supabase
    .from('newsletter_preferences')
    .update({
      categories: categories,
      max_posts_per_week: categories.length,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId)

  if (error) throw error
  
  return { success: true }
}

export async function unsubscribeFromNewsletter({ userId }) {
  if (!isClient) throw new Error('Can only unsubscribe on client side')
  
  const { error } = await supabase
    .from('newsletter_preferences')
    .update({
      is_subscribed: false,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId)

  if (error) throw error
  
  return { success: true }
}

export async function updateNewsletterEmail({ userId, email }) {
  if (!isClient) throw new Error('Can only update email on client side')
  
  const { error } = await supabase
    .from('newsletter_preferences')
    .update({
      newsletter_email: email,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId)

  if (error) throw error
  
  return { success: true }
}

// In-memory store for verification codes (client-side only)
let verificationCodes = new Map()

export async function sendVerificationCode(email) {
  if (!isClient) throw new Error('Can only send verification on client side')
  
  const code = Math.floor(100000 + Math.random() * 900000).toString()
  const verificationId = Date.now().toString()
  
  // Store with expiration (10 minutes)
  verificationCodes.set(verificationId, {
    email,
    code,
    expiresAt: Date.now() + 10 * 60 * 1000
  })
  
  // Clean up expired codes periodically
  setTimeout(() => {
    for (const [id, record] of verificationCodes.entries()) {
      if (Date.now() > record.expiresAt) {
        verificationCodes.delete(id)
      }
    }
  }, 10 * 60 * 1000)
  
  // In development, log to console
  if (process.env.NODE_ENV === 'development') {
    console.log(`[DEV] Verification code for ${email}: ${code}`)
  }
  
  // In production, you would send an actual email here via Supabase Edge Function
  
  return { verificationId }
}

export async function verifyCode({ verificationId, code }) {
  if (!isClient) throw new Error('Can only verify on client side')
  
  const record = verificationCodes.get(verificationId)
  
  if (!record) {
    throw new Error('Verification session not found')
  }
  
  if (Date.now() > record.expiresAt) {
    verificationCodes.delete(verificationId)
    throw new Error('Verification code has expired')
  }
  
  if (record.code !== code) {
    throw new Error('Invalid verification code')
  }
  
  // Clean up
  verificationCodes.delete(verificationId)
  
  return { verified: true, email: record.email }
}