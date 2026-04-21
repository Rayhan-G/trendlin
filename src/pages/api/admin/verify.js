// src/pages/api/admin/verify.js (COMPLETE FIXED FILE)

import bcrypt from 'bcryptjs'
import crypto from 'crypto'

// Rate limiting storage (in production, use Redis or database)
const failedAttempts = new Map()
const MAX_ATTEMPTS = 5
const LOCKOUT_TIME = 15 * 60 * 1000 // 15 minutes

// Helper to get client IP
const getClientIp = (req) => {
  return req.headers['x-forwarded-for']?.split(',')[0] || 
         req.socket.remoteAddress || 
         'unknown'
}

// Helper to check rate limit
const isRateLimited = (ip) => {
  const attempts = failedAttempts.get(ip)
  if (!attempts) return false
  
  const now = Date.now()
  if (attempts.count >= MAX_ATTEMPTS && now - attempts.firstAttempt < LOCKOUT_TIME) {
    return true
  }
  
  // Reset if lockout period has passed
  if (now - attempts.firstAttempt >= LOCKOUT_TIME) {
    failedAttempts.delete(ip)
    return false
  }
  
  return false
}

// Helper to record failed attempt
const recordFailedAttempt = (ip) => {
  const existing = failedAttempts.get(ip)
  if (existing) {
    existing.count++
    failedAttempts.set(ip, existing)
  } else {
    failedAttempts.set(ip, {
      count: 1,
      firstAttempt: Date.now()
    })
  }
}

// Helper to generate secure session token
const generateSecureToken = () => {
  return crypto.randomBytes(64).toString('hex')
}

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    })
  }

  // Get client IP for rate limiting
  const clientIp = getClientIp(req)

  // Check rate limit
  if (isRateLimited(clientIp)) {
    return res.status(429).json({ 
      success: false, 
      error: 'Too many failed attempts. Please try again later.' 
    })
  }

  const { password } = req.body

  if (!password || typeof password !== 'string') {
    return res.status(400).json({ 
      success: false, 
      error: 'Password is required' 
    })
  }

  // Get hashed password from environment
  const hashedPassword = process.env.ADMIN_PASSWORD_HASH
  const plainPassword = process.env.ADMIN_PASSWORD // For backward compatibility

  if (!hashedPassword && !plainPassword) {
    console.error('ADMIN_PASSWORD_HASH or ADMIN_PASSWORD not set')
    return res.status(500).json({ 
      success: false, 
      error: 'Server configuration error' 
    })
  }

  // Add artificial delay to prevent timing attacks
  const startTime = Date.now()

  let isValid = false

  // Check password (prefer hashed version)
  if (hashedPassword) {
    try {
      isValid = await bcrypt.compare(password, hashedPassword)
    } catch (error) {
      console.error('Password comparison error:', error)
      isValid = false
    }
  } else if (plainPassword) {
    // Fallback to plain text (should be removed in production)
    console.warn('Using plain text password. Please migrate to ADMIN_PASSWORD_HASH')
    isValid = password === plainPassword
  }

  // Ensure consistent response timing (prevent timing attacks)
  const elapsed = Date.now() - startTime
  const minDelay = 1000
  if (elapsed < minDelay) {
    await new Promise(resolve => setTimeout(resolve, minDelay - elapsed))
  }

  if (isValid) {
    // Clear failed attempts on successful login
    failedAttempts.delete(clientIp)

    // Generate secure session token
    const sessionToken = generateSecureToken()
    const expiresInHours = parseInt(process.env.ADMIN_SESSION_HOURS || '24')
    const expiresAt = Date.now() + (expiresInHours * 60 * 60 * 1000)

    // In production, store token in database with expiration
    // For now, return to client
    
    return res.status(200).json({ 
      success: true, 
      token: sessionToken,
      expiresAt: expiresAt,
      expiresIn: expiresInHours * 60 * 60 * 1000
    })
  } else {
    // Record failed attempt
    recordFailedAttempt(clientIp)
    
    return res.status(401).json({ 
      success: false, 
      error: 'Invalid credentials',
      remainingAttempts: MAX_ATTEMPTS - (failedAttempts.get(clientIp)?.count || 1)
    })
  }
}