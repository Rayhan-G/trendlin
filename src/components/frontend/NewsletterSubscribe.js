// src/components/frontend/NewsletterSubscribe.js

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase'

export default function NewsletterSubscribe({ 
  presetCategory = null,
  variant = 'footer',
  className = '' 
}) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [selectedCategories, setSelectedCategories] = useState([])
  const [showCategorySelector, setShowCategorySelector] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [currentPageCategory, setCurrentPageCategory] = useState(null)
  const [categoryName, setCategoryName] = useState('')
  const [isLocalhost, setIsLocalhost] = useState(false)
  const [cooldown, setCooldown] = useState(false)

  // Detect if running on localhost
  useEffect(() => {
    const hostname = window.location.hostname
    setIsLocalhost(hostname === 'localhost' || hostname === '127.0.0.1')
  }, [])

  // Disposable email domains to block
  const disposableDomains = [
    'tempmail.com', '10minutemail.com', 'guerrillamail.com',
    'mailinator.com', 'yopmail.com', 'throwaway.com', 'temp-mail.org',
    'fakeinbox.com', 'dispostable.com', 'getnada.com', 'mailnator.com',
    'trashmail.com', 'spamgourmet.com', 'sogetthis.com', 'guerrillamail.net',
    'guerrillamail.org', 'guerrillamail.biz', 'maildrop.cc', 'mailnesia.com',
    'tempinbox.com', 'tempemail.net', 'tempinbox.co.uk', 'tempmailaddress.com',
    'mytemp.email', 'tempail.com', 'tyldr.com', 'mailmetrash.com',
    'sharklasers.com', 'grr.la', 'incognitomail.com', 'one-time.email',
    'emailondeck.com', 'fake-mail.net', 'emailfake.com', 'temp-mail.io'
  ]

  const roleBasedDomains = ['admin', 'support', 'info', 'contact', 'webmaster', 'postmaster', 'noreply', 'no-reply']

  const categories = [
    { id: 'health', name: 'Health & Wellness', icon: '🌿', color: '#10b981' },
    { id: 'entertainment', name: 'Entertainment', icon: '🎬', color: '#ec4899' },
    { id: 'growth', name: 'Personal Growth', icon: '🌱', color: '#10b981' },
    { id: 'lifestyle', name: 'Lifestyle', icon: '✨', color: '#f97316' },
    { id: 'tech', name: 'Technology', icon: '⚡', color: '#3b82f6' },
    { id: 'wealth', name: 'Wealth', icon: '💰', color: '#f59e0b' },
    { id: 'world', name: 'World News', icon: '🌍', color: '#06b6d4' }
  ]

  // Auto-detect category from URL or preset
  useEffect(() => {
    const detectCategory = () => {
      if (presetCategory) {
        const matchedCategory = categories.find(c => c.id === presetCategory)
        setCurrentPageCategory(presetCategory)
        setCategoryName(matchedCategory?.name || presetCategory)
        setShowCategorySelector(false)
        setSelectedCategories([presetCategory])
      } else {
        const path = window.location.pathname
        const matchedCategory = categories.find(cat => 
          path.includes(`/category/${cat.id}`) || path.includes(`/${cat.id}`)
        )
        
        if (matchedCategory) {
          setCurrentPageCategory(matchedCategory.id)
          setCategoryName(matchedCategory.name)
          setShowCategorySelector(false)
          setSelectedCategories([matchedCategory.id])
        } else {
          setShowCategorySelector(true)
          setCurrentPageCategory(null)
          setCategoryName('')
          setSelectedCategories([])
        }
      }
    }

    detectCategory()
  }, [router.asPath, presetCategory])

  const isDisposableEmail = (email) => {
    const domain = email.split('@')[1]?.toLowerCase()
    if (!domain) return false
    return disposableDomains.some(disposable => 
      domain === disposable || domain.endsWith(`.${disposable}`)
    )
  }

  const isRoleBasedEmail = (email) => {
    const localPart = email.split('@')[0]?.toLowerCase()
    return roleBasedDomains.includes(localPart)
  }

  const generateVerificationToken = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID()
    }
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }

  const sendVerificationEmail = async (email, token, categories, sourcePage) => {
    const verificationLink = `${window.location.origin}/api/verify-newsletter?token=${token}&email=${encodeURIComponent(email)}`
    
    const response = await fetch('/api/send-verification-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: email,
        subject: 'Verify Your Newsletter Subscription',
        categories: categories,
        sourcePage: sourcePage,
        verificationLink: verificationLink
      })
    })

    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to send verification email')
    }

    return data
  }

  const validateForm = () => {
    if (!email) {
      setError('Please enter your email address')
      return false
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address (e.g., name@example.com)')
      return false
    }
    
    if (isDisposableEmail(email)) {
      setError('Please use a permanent email address. Temporary/disposable emails are not allowed.')
      return false
    }
    
    if (isRoleBasedEmail(email)) {
      setError('⚠️ Note: Using a role-based email may affect deliverability. Consider using a personal email address.')
      setTimeout(() => setError(''), 5000)
    }
    
    if (selectedCategories.length === 0 && showCategorySelector) {
      setError('Please select at least one category to subscribe to')
      return false
    }
    
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Rate limiting - prevent spam
    if (cooldown) {
      setError('Please wait a moment before trying again.')
      return
    }
    
    if (!validateForm()) return

    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      // Prepare subscriber data (only include columns that exist)
     const subscriberData = {
  email: email.toLowerCase().trim(),
  categories: selectedCategories,
  subscribed_at: new Date().toISOString(),
  status: 'pending',
  verification_token: generateVerificationToken(),
  unsubscribe_token: generateVerificationToken(), // ← ADD THIS for one-click unsubscribe
  verification_sent_at: new Date().toISOString(),
  delivery_frequency: 'weekly', // ← ADD THIS (default)
  max_posts_per_week: 3, // ← ADD THIS (default - 3 posts/week)
  post_selection_method: 'latest', // ← ADD THIS (default)
  preferred_post_length: 'medium', // ← ADD THIS (default)
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone // ← ADD THIS (auto-detect)
}
      
      // Only add source_page if the column exists (optional)
      // subscriberData.source_page = currentPageCategory || 'home'

      const { data: existing, error: fetchError } = await supabase
        .from('newsletter_subscribers')
        .select('email, status, categories')
        .eq('email', email.toLowerCase().trim())
        .maybeSingle()

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError
      }

      // Already verified - just update preferences
      if (existing && existing.status === 'verified') {
        const mergedCategories = [...new Set([...existing.categories, ...selectedCategories])]
        
        const { error: updateError } = await supabase
          .from('newsletter_subscribers')
          .update({
            categories: mergedCategories,
            updated_at: new Date().toISOString()
          })
          .eq('email', email.toLowerCase().trim())

        if (updateError) throw updateError
        
        setSuccess(true)
        setSuccessMessage('✓ Your preferences have been updated!')
        setTimeout(() => setSuccess(false), 5000)
        setLoading(false)
        return
      }

      // Pending - resend verification
      if (existing && existing.status === 'pending') {
        const newToken = generateVerificationToken()
        
        const { error: updateError } = await supabase
          .from('newsletter_subscribers')
          .update({
            verification_token: newToken,
            verification_sent_at: new Date().toISOString(),
            categories: selectedCategories
          })
          .eq('email', email.toLowerCase().trim())

        if (updateError) throw updateError
        
        // Send email (skip in localhost)
        if (!isLocalhost) {
          await sendVerificationEmail(email, newToken, selectedCategories, currentPageCategory || 'home')
        }
        
        setSuccess(true)
        setSuccessMessage(isLocalhost 
          ? '✓ [Local Mode] Subscription saved!'
          : '✓ Verification email resent! Please check your inbox.')
        setTimeout(() => setSuccess(false), 5000)
        setLoading(false)
        return
      }

      // New subscriber
      const { error: insertError } = await supabase
        .from('newsletter_subscribers')
        .insert([subscriberData])

      if (insertError) {
        if (insertError.code === '23505') {
          setError('This email is already subscribed. Please check your inbox for the verification email.')
        } else {
          throw insertError
        }
        setLoading(false)
        return
      }

      // Send verification email (skip in localhost)
      if (!isLocalhost) {
        await sendVerificationEmail(email, subscriberData.verification_token, selectedCategories, currentPageCategory || 'home')
      }

      // Reset form
      setEmail('')
      if (!currentPageCategory) {
        setSelectedCategories([])
      }
      
      setSuccess(true)
      setSuccessMessage(isLocalhost
        ? '✓ Subscription saved!'
        : '✓ Verification email sent! Please check your inbox to confirm your subscription.')
      
      // Set cooldown to prevent spam (30 seconds)
      setCooldown(true)
      setTimeout(() => setCooldown(false), 30000)
      
      setTimeout(() => setSuccess(false), 8000)

    } catch (err) {
      console.error('Subscription error:', err)
      setError(err.message || 'Something went wrong. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryToggle = (categoryId) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter(c => c !== categoryId))
    } else {
      setSelectedCategories([...selectedCategories, categoryId])
    }
  }

  const handleSelectAll = () => {
    if (selectedCategories.length === categories.length) {
      setSelectedCategories([])
    } else {
      setSelectedCategories(categories.map(c => c.id))
    }
  }

  const getHeadline = () => {
    if (currentPageCategory) {
      return `Subscribe for ${categoryName} Updates — It's Free!`
    }
    return 'Subscribe to Our Newsletter — It\'s Free!'
  }

  const getDescription = () => {
    if (currentPageCategory) {
      return `Get the latest ${categoryName.toLowerCase()} articles, insights, and trends delivered straight to your inbox.`
    }
    return 'Get the latest articles from all categories delivered straight to your inbox. Choose your interests below.'
  }

  const getButtonText = () => {
    if (loading) return 'Sending...'
    if (cooldown) return 'Please wait...'
    if (currentPageCategory) return `Subscribe to ${categoryName} →`
    return 'Subscribe Now →'
  }

  return (
    <div className={`newsletter-wrapper ${className}`}>
      <div className="newsletter-inner">
        <div className="newsletter-left">
          <div className="newsletter-icon">📬</div>
          <div className="newsletter-text">
            <h3 className="newsletter-title">{getHeadline()}</h3>
            <p className="newsletter-description">{getDescription()}</p>
          </div>
        </div>

        <div className="newsletter-right">
          <form onSubmit={handleSubmit} className="newsletter-form" noValidate>
            <div className="form-row">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="newsletter-input"
                disabled={loading || cooldown}
                aria-label="Email address"
              />
              <button 
                type="submit" 
                className="newsletter-button" 
                disabled={loading || cooldown}
              >
                {getButtonText()}
              </button>
            </div>

            {showCategorySelector && (
              <div className="category-section">
                <div className="category-header">
                  <span className="category-label">I'm interested in:</span>
                  <button 
                    type="button" 
                    onClick={handleSelectAll} 
                    className="select-all-btn"
                    disabled={loading}
                  >
                    {selectedCategories.length === categories.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                <div className="category-chips">
                  {categories.map((category) => (
                    <label key={category.id} className="category-chip">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category.id)}
                        onChange={() => handleCategoryToggle(category.id)}
                        disabled={loading}
                      />
                      <span className="chip-content">
                        <span className="chip-icon">{category.icon}</span>
                        <span className="chip-name">{category.name}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {error && <p className="error-msg" role="alert">{error}</p>}
            {success && <p className="success-msg" role="status">{successMessage}</p>}

            <p className="newsletter-note">
              By subscribing, you agree to our Privacy Policy. Verification email will be sent.
            </p>
          </form>
        </div>
      </div>

      <style jsx>{`
        .newsletter-wrapper {
          background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
          border-radius: 24px;
          padding: 2rem;
        }
        
        .newsletter-inner {
          max-width: 1280px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 2rem;
          align-items: start;
        }
        
        .newsletter-left {
          display: flex;
          gap: 1rem;
        }
        
        .newsletter-icon {
          font-size: 2.5rem;
          flex-shrink: 0;
        }
        
        .newsletter-text {
          flex: 1;
        }
        
        .newsletter-title {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          color: white;
        }
        
        .newsletter-description {
          font-size: 0.875rem;
          color: rgba(255,255,255,0.7);
          line-height: 1.5;
        }
        
        .newsletter-right {
          width: 100%;
        }
        
        .newsletter-form {
          width: 100%;
        }
        
        .form-row {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }
        
        .newsletter-input {
          flex: 1;
          padding: 0.875rem 1.25rem;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 14px;
          color: white;
          font-size: 0.95rem;
          transition: border-color 0.2s;
        }
        
        .newsletter-input:focus {
          outline: none;
          border-color: #06b6d4;
        }
        
        .newsletter-input::placeholder {
          color: rgba(255,255,255,0.5);
        }
        
        .newsletter-input:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .newsletter-button {
          padding: 0.875rem 1.75rem;
          background: linear-gradient(135deg, #06b6d4, #0891b2);
          border: none;
          border-radius: 14px;
          color: white;
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.3s ease;
          white-space: nowrap;
        }
        
        .newsletter-button:hover:not(:disabled) {
          transform: translateY(-2px);
          opacity: 0.9;
        }
        
        .newsletter-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .category-section {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(255,255,255,0.1);
        }
        
        .category-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }
        
        .category-label {
          font-size: 0.8rem;
          font-weight: 500;
          color: rgba(255,255,255,0.6);
        }
        
        .select-all-btn {
          background: none;
          border: none;
          color: #06b6d4;
          font-size: 0.7rem;
          cursor: pointer;
          text-decoration: underline;
          transition: opacity 0.2s;
        }
        
        .select-all-btn:hover:not(:disabled) {
          opacity: 0.8;
        }
        
        .select-all-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .category-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        
        .category-chip {
          cursor: pointer;
        }
        
        .category-chip input {
          position: absolute;
          opacity: 0;
          width: 0;
          height: 0;
        }
        
        .chip-content {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.4rem 0.9rem;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 40px;
          font-size: 0.75rem;
          transition: all 0.3s ease;
          cursor: pointer;
          color: white;
        }
        
        .category-chip input:checked + .chip-content {
          background: rgba(6,182,212,0.3);
          border-color: #06b6d4;
        }
        
        .chip-icon {
          font-size: 0.8rem;
        }
        
        .chip-name {
          font-weight: 500;
        }
        
        .error-msg {
          color: #ef4444;
          font-size: 0.75rem;
          margin-top: 0.5rem;
        }
        
        .success-msg {
          color: #10b981;
          font-size: 0.75rem;
          margin-top: 0.5rem;
        }
        
        .newsletter-note {
          font-size: 0.7rem;
          color: rgba(255,255,255,0.4);
          margin-top: 1rem;
          text-align: center;
        }
        
        @media (max-width: 968px) {
          .newsletter-inner {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
          
          .newsletter-left {
            text-align: center;
            flex-direction: column;
            align-items: center;
          }
          
          .newsletter-title, .newsletter-description {
            text-align: center;
          }
        }
        
        @media (max-width: 640px) {
          .newsletter-wrapper {
            padding: 1.5rem;
          }
          
          .form-row {
            flex-direction: column;
          }
          
          .newsletter-button {
            width: 100%;
            justify-content: center;
          }
          
          .category-chips {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  )
}