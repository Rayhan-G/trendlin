// src/components/frontend/NewsletterSubscribe.js

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase'

export default function NewsletterSubscribe({ 
  presetCategory = null,
  className = '' 
}) {
  const router = useRouter()
  
  // Form state
  const [email, setEmail] = useState('')
  const [selectedCategories, setSelectedCategories] = useState([])
  const [showCategorySelector, setShowCategorySelector] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // UI state
  const [currentPageCategory, setCurrentPageCategory] = useState(null)
  const [categoryName, setCategoryName] = useState('')
  const [isLocalhost, setIsLocalhost] = useState(false)
  const [cooldown, setCooldown] = useState(false)
  
  // Preferences state
  const [showPreferences, setShowPreferences] = useState(false)
  const [deliveryFrequency, setDeliveryFrequency] = useState('weekly')
  const [maxPostsPerWeek, setMaxPostsPerWeek] = useState(3)
  const [postFormat, setPostFormat] = useState('summary')
  
  // Modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [subscribedEmail, setSubscribedEmail] = useState('')
  const [resendCooldown, setResendCooldown] = useState(false)
  
  // Existing subscriber state
  const [showManageForExisting, setShowManageForExisting] = useState(false)
  const [existingSubscriberData, setExistingSubscriberData] = useState(null)

  // Detect localhost
  useEffect(() => {
    const hostname = window.location.hostname
    setIsLocalhost(hostname === 'localhost' || hostname === '127.0.0.1')
  }, [])

  // Disposable email domains
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

  // Auto-detect category from URL
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

  const generateToken = () => {
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

  const resendVerification = async () => {
    if (resendCooldown) {
      setError('Please wait 30 seconds before resending.')
      return
    }

    setResendCooldown(true)
    setLoading(true)

    try {
      const newToken = generateToken()
      
      await supabase
        .from('newsletter_subscribers')
        .update({
          verification_token: newToken,
          verification_sent_at: new Date().toISOString()
        })
        .eq('email', subscribedEmail)

      await sendVerificationEmail(subscribedEmail, newToken, selectedCategories, currentPageCategory || 'home')
      
      setError('')
      setTimeout(() => {
        setError('✅ Verification email resent! Check your inbox.')
        setTimeout(() => setError(''), 5000)
      }, 100)
      
      setTimeout(() => setResendCooldown(false), 30000)
    } catch (err) {
      setError('Failed to resend. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    if (!email) {
      setError('Please enter your email address')
      return false
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address')
      return false
    }
    
    if (isDisposableEmail(email)) {
      setError('Please use a permanent email address. Temporary emails are not allowed.')
      return false
    }
    
    if (isRoleBasedEmail(email)) {
      setError('⚠️ Using a role-based email may affect deliverability. Consider using a personal email.')
      setTimeout(() => setError(''), 5000)
    }
    
    if (selectedCategories.length === 0 && showCategorySelector) {
      setError('Please select at least one category')
      return false
    }
    
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (cooldown) {
      setError('Please wait a moment before trying again.')
      return
    }
    
    if (!validateForm()) return

    setLoading(true)
    setError('')

    try {
      const subscriberData = {
        email: email.toLowerCase().trim(),
        categories: selectedCategories,
        subscribed_at: new Date().toISOString(),
        status: 'pending',
        verification_token: generateToken(),
        unsubscribe_token: generateToken(),
        verification_sent_at: new Date().toISOString(),
        delivery_frequency: deliveryFrequency,
        max_posts_per_week: maxPostsPerWeek,
        post_format: postFormat,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }

      const { data: existing, error: fetchError } = await supabase
        .from('newsletter_subscribers')
        .select('email, status, categories')
        .eq('email', email.toLowerCase().trim())
        .maybeSingle()

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError
      }

      // Already verified - show manage UI
      if (existing && existing.status === 'verified') {
        setExistingSubscriberData(existing)
        setShowManageForExisting(true)
        setLoading(false)
        return
      }

      // Pending - resend verification
      if (existing && existing.status === 'pending') {
        const newToken = generateToken()
        
        await supabase
          .from('newsletter_subscribers')
          .update({
            verification_token: newToken,
            verification_sent_at: new Date().toISOString(),
            categories: selectedCategories,
            delivery_frequency: deliveryFrequency,
            max_posts_per_week: maxPostsPerWeek,
            post_format: postFormat
          })
          .eq('email', email.toLowerCase().trim())

        if (!isLocalhost) {
          await sendVerificationEmail(email, newToken, selectedCategories, currentPageCategory || 'home')
        }
        
        setSubscribedEmail(email)
        setShowSuccessModal(true)
        setLoading(false)
        return
      }

      // New subscriber
      const { error: insertError } = await supabase
        .from('newsletter_subscribers')
        .insert([subscriberData])

      if (insertError) {
        if (insertError.code === '23505') {
          setError('This email is already subscribed. Please check your inbox.')
        } else {
          throw insertError
        }
        setLoading(false)
        return
      }

      if (!isLocalhost) {
        await sendVerificationEmail(email, subscriberData.verification_token, selectedCategories, currentPageCategory || 'home')
      }

      setSubscribedEmail(email)
      setShowSuccessModal(true)
      
      setEmail('')
      if (!currentPageCategory) {
        setSelectedCategories([])
      }
      
      setCooldown(true)
      setTimeout(() => setCooldown(false), 30000)

    } catch (err) {
      console.error('Subscription error:', err)
      setError(err.message || 'Something went wrong. Please try again.')
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
      return `Subscribe for ${categoryName} Updates — Free!`
    }
    return 'Subscribe to Our Newsletter — Free!'
  }

  const getDescription = () => {
    if (currentPageCategory) {
      return `Get the latest ${categoryName.toLowerCase()} articles delivered to your inbox.`
    }
    return 'Get the latest articles from all categories. Choose your interests and delivery preferences.'
  }

  const getButtonText = () => {
    if (loading) return 'Sending...'
    if (cooldown) return 'Please wait...'
    if (currentPageCategory) return `Subscribe to ${categoryName} →`
    return 'Subscribe →'
  }

  // Already subscribed UI
  if (showManageForExisting && existingSubscriberData) {
    return (
      <div className={`newsletter-wrapper ${className}`}>
        <div className="already-subscribed-box">
          <div className="as-icon">✅</div>
          <h3 className="as-title">You're already subscribed!</h3>
          <p className="as-email">{existingSubscriberData.email}</p>
          <div className="as-actions">
            <a href={`/newsletter/manage?email=${encodeURIComponent(existingSubscriberData.email)}`} className="as-manage-btn">
              Manage Preferences →
            </a>
            <button onClick={() => {
              setShowManageForExisting(false)
              setEmail('')
              setSelectedCategories([])
              setExistingSubscriberData(null)
            }} className="as-different-btn">
              Use different email
            </button>
          </div>
        </div>

        <style jsx>{`
          .newsletter-wrapper {
            background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
            border-radius: 24px;
            padding: 2rem;
          }
          .already-subscribed-box {
            text-align: center;
            max-width: 400px;
            margin: 0 auto;
          }
          .as-icon { font-size: 48px; margin-bottom: 16px; }
          .as-title { color: white; margin-bottom: 8px; font-size: 1.25rem; }
          .as-email {
            background: rgba(255,255,255,0.1);
            padding: 8px 12px;
            border-radius: 12px;
            font-size: 14px;
            margin: 12px 0;
            color: rgba(255,255,255,0.8);
            word-break: break-all;
          }
          .as-actions { display: flex; flex-direction: column; gap: 10px; margin-top: 16px; }
          .as-manage-btn {
            display: block;
            padding: 12px;
            background: #06b6d4;
            color: white;
            text-decoration: none;
            border-radius: 40px;
            font-weight: 600;
          }
          .as-different-btn {
            background: none;
            border: none;
            color: rgba(255,255,255,0.6);
            cursor: pointer;
            font-size: 13px;
          }
        `}</style>
      </div>
    )
  }

  // Success Modal
  if (showSuccessModal) {
    return (
      <>
        <div className="modal-overlay" onClick={() => setShowSuccessModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">✉️</div>
            <h3>Check Your Inbox!</h3>
            <p>We sent a verification link to:</p>
            <p className="modal-email"><strong>{subscribedEmail}</strong></p>
            <div className="modal-steps">
              <div className="step">1️⃣ Open your email inbox</div>
              <div className="step">2️⃣ Click the verification link</div>
              <div className="step">3️⃣ Start receiving updates</div>
            </div>
            <button onClick={() => setShowSuccessModal(false)} className="modal-btn">
              Got it, thanks →
            </button>
            <p className="modal-note">
              Didn't receive? Check spam folder or{' '}
              <button onClick={resendVerification} className="resend-link" disabled={resendCooldown}>
                {resendCooldown ? 'Wait 30s' : 'click here to resend'}
              </button>
            </p>
          </div>
        </div>

        <style jsx>{`
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            backdrop-filter: blur(4px);
          }
          .modal-content {
            background: white;
            border-radius: 28px;
            padding: 32px;
            max-width: 400px;
            width: 90%;
            text-align: center;
            animation: slideUp 0.3s ease-out;
          }
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .modal-icon { font-size: 48px; margin-bottom: 16px; }
          .modal-content h3 { font-size: 24px; margin-bottom: 12px; color: #1e293b; }
          .modal-content p { color: #64748b; margin-bottom: 8px; }
          .modal-email {
            background: #f1f5f9;
            padding: 8px;
            border-radius: 12px;
            margin: 12px 0;
            word-break: break-all;
          }
          .modal-steps { text-align: left; margin: 20px 0; padding: 16px; background: #f8fafc; border-radius: 16px; }
          .step { padding: 8px 0; color: #334155; font-size: 14px; }
          .modal-btn {
            width: 100%;
            padding: 12px;
            background: linear-gradient(135deg, #06b6d4, #0891b2);
            color: white;
            border: none;
            border-radius: 40px;
            font-weight: 600;
            cursor: pointer;
            margin-top: 8px;
          }
          .modal-note { font-size: 12px; color: #94a3b8; margin-top: 16px; }
          .resend-link {
            background: none;
            border: none;
            color: #06b6d4;
            cursor: pointer;
            text-decoration: underline;
          }
          .resend-link:disabled { opacity: 0.5; cursor: not-allowed; }
        `}</style>
      </>
    )
  }

  // Main form
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
                  <button type="button" onClick={handleSelectAll} className="select-all-btn" disabled={loading}>
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

            {/* Preferences Toggle */}
            <div className="preferences-toggle">
              <button type="button" onClick={() => setShowPreferences(!showPreferences)} className="toggle-btn">
                {showPreferences ? '▼' : '▶'} Customize delivery preferences
              </button>
            </div>

            {showPreferences && (
              <div className="preferences-section">
                {/* Frequency */}
                <div className="pref-group">
                  <label className="pref-label">⏰ How often?</label>
                  <div className="pref-options">
                    {[
                      { value: 'daily', label: 'Daily', icon: '📅', desc: 'Once per day' },
                      { value: 'weekly', label: 'Weekly', icon: '📆', desc: 'Every Sunday' },
                      { value: 'biweekly', label: 'Bi-weekly', icon: '📑', desc: 'Twice a month' },
                      { value: 'monthly', label: 'Monthly', icon: '📘', desc: 'Once a month' }
                    ].map(opt => (
                      <label key={opt.value} className={`pref-option ${deliveryFrequency === opt.value ? 'active' : ''}`}>
                        <input type="radio" name="frequency" value={opt.value} checked={deliveryFrequency === opt.value} onChange={() => setDeliveryFrequency(opt.value)} />
                        <span className="pref-icon">{opt.icon}</span>
                        <div className="pref-info">
                          <div className="pref-name">{opt.label}</div>
                          <div className="pref-desc">{opt.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Post Volume */}
                <div className="pref-group">
                  <label className="pref-label">📊 Max posts per week</label>
                  <div className="volume-slider">
                    <input type="range" min="1" max="10" value={maxPostsPerWeek} onChange={(e) => setMaxPostsPerWeek(parseInt(e.target.value))} className="slider" />
                    <div className="volume-value">
                      <span>{maxPostsPerWeek}</span>
                      <span className="volume-unit">{maxPostsPerWeek === 1 ? 'post' : 'posts'}</span>
                    </div>
                  </div>
                  <p className="pref-hint">
                    {maxPostsPerWeek <= 2 ? '👍 Light reader' : maxPostsPerWeek <= 4 ? '📖 Regular reader' : maxPostsPerWeek <= 7 ? '📚 Heavy reader' : '🔴 May feel like spam'}
                  </p>
                </div>

                {/* Format */}
                <div className="pref-group">
                  <label className="pref-label">📄 Email format</label>
                  <div className="pref-options">
                    {[
                      { value: 'summary', label: 'Summary', icon: '📝', desc: 'Key points + links' },
                      { value: 'digest', label: 'Digest', icon: '📰', desc: 'Full post previews' },
                      { value: 'full', label: 'Full articles', icon: '📖', desc: 'Complete posts' }
                    ].map(opt => (
                      <label key={opt.value} className={`pref-option ${postFormat === opt.value ? 'active' : ''}`}>
                        <input type="radio" name="format" value={opt.value} checked={postFormat === opt.value} onChange={() => setPostFormat(opt.value)} />
                        <span className="pref-icon">{opt.icon}</span>
                        <div className="pref-info">
                          <div className="pref-name">{opt.label}</div>
                          <div className="pref-desc">{opt.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {error && <p className="error-msg">{error}</p>}

            <p className="newsletter-note">
              By subscribing, you agree to our Privacy Policy. No spam, unsubscribe anytime.
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
        .newsletter-left { display: flex; gap: 1rem; }
        .newsletter-icon { font-size: 2.5rem; flex-shrink: 0; }
        .newsletter-text { flex: 1; }
        .newsletter-title { font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem; color: white; }
        .newsletter-description { font-size: 0.875rem; color: rgba(255,255,255,0.7); line-height: 1.5; }
        .newsletter-right { width: 100%; }
        .newsletter-form { width: 100%; }
        .form-row { display: flex; gap: 0.75rem; margin-bottom: 1rem; }
        .newsletter-input {
          flex: 1;
          padding: 0.875rem 1.25rem;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 14px;
          color: white;
          font-size: 0.95rem;
        }
        .newsletter-input:focus { outline: none; border-color: #06b6d4; }
        .newsletter-input::placeholder { color: rgba(255,255,255,0.5); }
        .newsletter-input:disabled { opacity: 0.5; cursor: not-allowed; }
        .newsletter-button {
          padding: 0.875rem 1.75rem;
          background: linear-gradient(135deg, #06b6d4, #0891b2);
          border: none;
          border-radius: 14px;
          color: white;
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          white-space: nowrap;
        }
        .newsletter-button:hover:not(:disabled) { transform: translateY(-2px); opacity: 0.9; }
        .newsletter-button:disabled { opacity: 0.6; cursor: not-allowed; }
        .category-section { margin-top: 1rem; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.1); }
        .category-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
        .category-label { font-size: 0.8rem; font-weight: 500; color: rgba(255,255,255,0.6); }
        .select-all-btn { background: none; border: none; color: #06b6d4; font-size: 0.7rem; cursor: pointer; }
        .category-chips { display: flex; flex-wrap: wrap; gap: 0.5rem; }
        .category-chip { cursor: pointer; }
        .category-chip input { position: absolute; opacity: 0; width: 0; height: 0; }
        .chip-content {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.4rem 0.9rem;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 40px;
          font-size: 0.75rem;
          color: white;
        }
        .category-chip input:checked + .chip-content { background: rgba(6,182,212,0.3); border-color: #06b6d4; }
        .chip-icon { font-size: 0.8rem; }
        .chip-name { font-weight: 500; }
        .preferences-toggle { margin: 1rem 0 0.5rem; text-align: center; }
        .toggle-btn { background: none; border: none; color: rgba(255,255,255,0.6); font-size: 0.75rem; cursor: pointer; }
        .toggle-btn:hover { color: #06b6d4; }
        .preferences-section { background: rgba(255,255,255,0.05); border-radius: 16px; padding: 1rem; margin: 0.75rem 0; }
        .pref-group { margin-bottom: 1.25rem; }
        .pref-group:last-child { margin-bottom: 0; }
        .pref-label { display: block; font-size: 0.75rem; font-weight: 600; color: rgba(255,255,255,0.7); margin-bottom: 0.5rem; text-transform: uppercase; }
        .pref-options { display: flex; flex-direction: column; gap: 0.5rem; }
        .pref-option {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem 0.75rem;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          cursor: pointer;
        }
        .pref-option.active { background: rgba(6,182,212,0.2); border-color: #06b6d4; }
        .pref-option input { position: absolute; opacity: 0; }
        .pref-icon { font-size: 1.25rem; }
        .pref-info { flex: 1; }
        .pref-name { font-size: 0.8rem; font-weight: 500; color: white; }
        .pref-desc { font-size: 0.65rem; color: rgba(255,255,255,0.5); }
        .volume-slider { display: flex; align-items: center; gap: 1rem; }
        .slider { flex: 1; height: 4px; -webkit-appearance: none; background: rgba(255,255,255,0.2); border-radius: 2px; }
        .slider::-webkit-slider-thumb { -webkit-appearance: none; width: 16px; height: 16px; background: #06b6d4; border-radius: 50%; cursor: pointer; }
        .volume-value { min-width: 60px; text-align: center; color: white; font-size: 0.9rem; font-weight: 600; }
        .volume-unit { font-size: 0.7rem; color: rgba(255,255,255,0.5); margin-left: 4px; }
        .pref-hint { font-size: 0.6rem; color: rgba(255,255,255,0.4); margin-top: 0.5rem; }
        .error-msg { color: #ef4444; font-size: 0.75rem; margin-top: 0.5rem; text-align: center; }
        .newsletter-note { font-size: 0.7rem; color: rgba(255,255,255,0.4); margin-top: 1rem; text-align: center; }
        @media (max-width: 968px) {
          .newsletter-inner { grid-template-columns: 1fr; gap: 1.5rem; }
          .newsletter-left { text-align: center; flex-direction: column; align-items: center; }
          .newsletter-title, .newsletter-description { text-align: center; }
        }
        @media (max-width: 640px) {
          .newsletter-wrapper { padding: 1.5rem; }
          .form-row { flex-direction: column; }
          .newsletter-button { width: 100%; }
          .category-chips { justify-content: center; }
        }
      `}</style>
    </div>
  )
}