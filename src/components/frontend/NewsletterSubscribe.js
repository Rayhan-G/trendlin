// src/components/frontend/NewsletterSubscribe.js

import { useState, useEffect, useCallback } from 'react'
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
  const [submittedEmail, setSubmittedEmail] = useState('')
  const [resendCooldown, setResendCooldown] = useState(false)
  
  // 🔥 Subscription status state
  const [subscriptionStatus, setSubscriptionStatus] = useState(null) // null = unknown, 'subscribed', 'not_subscribed', 'pending'
  const [subscriberData, setSubscriberData] = useState(null)
  const [checkingStatus, setCheckingStatus] = useState(false)
  const [emailChecked, setEmailChecked] = useState(false)

  // Detect localhost
  useEffect(() => {
    const hostname = window.location.hostname
    setIsLocalhost(hostname === 'localhost' || hostname === '127.0.0.1')
  }, [])

  const categories = [
    { id: 'health', name: 'Health & Wellness', icon: '🌿' },
    { id: 'entertainment', name: 'Entertainment', icon: '🎬' },
    { id: 'growth', name: 'Personal Growth', icon: '🌱' },
    { id: 'lifestyle', name: 'Lifestyle', icon: '✨' },
    { id: 'tech', name: 'Technology', icon: '⚡' },
    { id: 'wealth', name: 'Wealth', icon: '💰' },
    { id: 'world', name: 'World News', icon: '🌍' }
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

  // 🔥 Check subscription status for an email
  const checkSubscriptionStatus = useCallback(async (emailToCheck) => {
    if (!emailToCheck || !emailToCheck.includes('@') || emailToCheck.length < 5) {
      setSubscriptionStatus(null)
      setSubscriberData(null)
      return null
    }

    setCheckingStatus(true)
    
    try {
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .select('email, status, categories, delivery_frequency, max_posts_per_week, post_format, unsubscribe_token')
        .eq('email', emailToCheck.toLowerCase().trim())
        .maybeSingle()

      if (error) throw error

      if (data) {
        if (data.status === 'verified') {
          setSubscriptionStatus('subscribed')
          setSubscriberData(data)
          // Save to localStorage for next visit
          localStorage.setItem('subscribed_email', emailToCheck.toLowerCase().trim())
          return 'subscribed'
        } else if (data.status === 'pending') {
          setSubscriptionStatus('pending')
          setSubscriberData(data)
          return 'pending'
        }
      }
      
      setSubscriptionStatus('not_subscribed')
      setSubscriberData(null)
      return 'not_subscribed'
    } catch (err) {
      console.error('Error checking subscription:', err)
      setSubscriptionStatus(null)
      return null
    } finally {
      setCheckingStatus(false)
      setEmailChecked(true)
    }
  }, [])

  // 🔥 Load saved email on page mount and check status
  useEffect(() => {
    const loadSavedSubscription = async () => {
      const savedEmail = localStorage.getItem('subscribed_email')
      if (savedEmail) {
        setEmail(savedEmail)
        await checkSubscriptionStatus(savedEmail)
      } else {
        setEmailChecked(true)
      }
    }
    loadSavedSubscription()
  }, [checkSubscriptionStatus])

  // 🔥 Handle email input change (debounced)
  useEffect(() => {
    if (!emailChecked) return
    
    const timeout = setTimeout(() => {
      if (email && email.includes('@') && email.length > 5) {
        checkSubscriptionStatus(email)
      } else if (email === '') {
        setSubscriptionStatus(null)
        setSubscriberData(null)
      }
    }, 500)

    return () => clearTimeout(timeout)
  }, [email, checkSubscriptionStatus, emailChecked])

  const generateToken = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID()
    }
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }

  const sendVerificationEmail = async (emailToSend, token, cats, sourcePage) => {
    const verificationLink = `${window.location.origin}/api/verify-newsletter?token=${token}&email=${encodeURIComponent(emailToSend)}`
    
    const response = await fetch('/api/send-verification-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: emailToSend,
        categories: cats,
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
        .eq('email', submittedEmail)

      await sendVerificationEmail(submittedEmail, newToken, selectedCategories, currentPageCategory || 'home')
      
      setError('✅ Verification email resent! Check your inbox.')
      setTimeout(() => setError(''), 5000)
      setTimeout(() => setResendCooldown(false), 30000)
    } catch (err) {
      setError('Failed to resend. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubscribe = async (e) => {
    e.preventDefault()
    
    if (cooldown) {
      setError('Please wait a moment before trying again.')
      return
    }
    
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.')
      return
    }

    if (selectedCategories.length === 0 && showCategorySelector) {
      setError('Please select at least one category.')
      return
    }

    // If already subscribed, don't submit
    if (subscriptionStatus === 'subscribed') {
      return
    }

    setLoading(true)
    setError('')

    try {
      const subscriberDataObj = {
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

      const { data: existing } = await supabase
        .from('newsletter_subscribers')
        .select('email, status')
        .eq('email', email.toLowerCase().trim())
        .maybeSingle()

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
        
        setSubmittedEmail(email)
        setShowSuccessModal(true)
        setLoading(false)
        return
      }

      // New subscriber
      if (!existing) {
        const { error: insertError } = await supabase
          .from('newsletter_subscribers')
          .insert([subscriberDataObj])

        if (insertError) {
          throw insertError
        }

        if (!isLocalhost) {
          await sendVerificationEmail(email, subscriberDataObj.verification_token, selectedCategories, currentPageCategory || 'home')
        }
      }

      setSubmittedEmail(email)
      setShowSuccessModal(true)
      
      setEmail('')
      if (!currentPageCategory) {
        setSelectedCategories([])
      }
      
      setCooldown(true)
      setTimeout(() => setCooldown(false), 30000)

    } catch (err) {
      console.error('Subscription error:', err)
      if (err.code === '23505') {
        setError('This email is already subscribed. Please check your inbox.')
      } else {
        setError(err.message || 'Something went wrong. Please try again.')
      }
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
    if (subscriptionStatus === 'subscribed') return '✓ Subscribed'
    if (subscriptionStatus === 'pending') return 'Resend Verification'
    if (currentPageCategory) return `Subscribe to ${categoryName} →`
    return 'Subscribe →'
  }

  // 🔥 SUCCESS MODAL
  if (showSuccessModal) {
    return (
      <>
        <div className="modal-overlay" onClick={() => setShowSuccessModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">✉️</div>
            <h3>Check Your Inbox!</h3>
            <p>We sent a verification link to:</p>
            <p className="modal-email"><strong>{submittedEmail}</strong></p>
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

  // 🔥 SUBSCRIBED UI (When user is already subscribed)
  if (subscriptionStatus === 'subscribed' && subscriberData && email) {
    return (
      <div className={`newsletter-wrapper ${className}`}>
        <div className="subscribed-container">
          <div className="subscribed-icon">✅</div>
          <h3 className="subscribed-title">You're subscribed!</h3>
          <p className="subscribed-email">{email}</p>
          
          <div className="subscribed-details">
            <div className="detail-row">
              <span className="detail-label">📌 Categories:</span>
              <span className="detail-value">
                {subscriberData.categories?.map(catId => 
                  categories.find(c => c.id === catId)?.name
                ).join(', ') || 'All categories'}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">⏰ Frequency:</span>
              <span className="detail-value">{subscriberData.delivery_frequency || 'Weekly'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">📊 Posts/week:</span>
              <span className="detail-value">{subscriberData.max_posts_per_week || 3}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">📄 Format:</span>
              <span className="detail-value">{subscriberData.post_format || 'Summary'}</span>
            </div>
          </div>

          <div className="subscribed-actions">
            <a href={`/newsletter/manage?email=${encodeURIComponent(email)}`} className="manage-btn">
              ⚙️ Manage Preferences →
            </a>
            <a href={`/api/unsubscribe?email=${encodeURIComponent(email)}`} className="unsubscribe-btn">
              🗑️ Unsubscribe
            </a>
            <button 
              onClick={() => {
                localStorage.removeItem('subscribed_email')
                setSubscriptionStatus(null)
                setSubscriberData(null)
                setEmail('')
              }} 
              className="different-email-btn"
            >
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
          .subscribed-container {
            text-align: center;
            max-width: 450px;
            margin: 0 auto;
          }
          .subscribed-icon { font-size: 48px; margin-bottom: 16px; }
          .subscribed-title { color: white; font-size: 1.5rem; margin-bottom: 8px; }
          .subscribed-email { color: rgba(255,255,255,0.7); margin-bottom: 24px; word-break: break-all; }
          .subscribed-details {
            background: rgba(255,255,255,0.1);
            border-radius: 16px;
            padding: 16px;
            margin-bottom: 24px;
            text-align: left;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid rgba(255,255,255,0.1);
          }
          .detail-row:last-child { border-bottom: none; }
          .detail-label { color: rgba(255,255,255,0.6); font-size: 0.8rem; }
          .detail-value { color: white; font-size: 0.8rem; font-weight: 500; }
          .subscribed-actions { display: flex; flex-direction: column; gap: 12px; }
          .manage-btn {
            display: block;
            padding: 12px;
            background: #06b6d4;
            color: white;
            text-decoration: none;
            border-radius: 40px;
            font-weight: 600;
          }
          .unsubscribe-btn {
            display: block;
            padding: 12px;
            background: rgba(239,68,68,0.2);
            color: #ef4444;
            text-decoration: none;
            border-radius: 40px;
            font-weight: 600;
            border: 1px solid rgba(239,68,68,0.3);
          }
          .different-email-btn {
            background: none;
            border: none;
            color: rgba(255,255,255,0.5);
            cursor: pointer;
            font-size: 0.8rem;
            padding: 8px;
          }
          .different-email-btn:hover { color: #06b6d4; }
        `}</style>
      </div>
    )
  }

  // 🔥 PENDING UI (When user has pending verification)
  if (subscriptionStatus === 'pending' && subscriberData && email) {
    return (
      <div className={`newsletter-wrapper ${className}`}>
        <div className="pending-container">
          <div className="pending-icon">⏳</div>
          <h3 className="pending-title">Awaiting Verification</h3>
          <p className="pending-email">{email}</p>
          <p className="pending-message">
            We sent a verification link to your email. Please check your inbox and click the link to complete your subscription.
          </p>
          <button onClick={() => {
            setSubmittedEmail(email)
            resendVerification()
          }} className="resend-btn" disabled={resendCooldown}>
            {resendCooldown ? 'Wait 30s' : 'Resend Verification Email →'}
          </button>
          <button 
            onClick={() => {
              setSubscriptionStatus(null)
              setSubscriberData(null)
              setEmail('')
            }} 
            className="different-email-btn"
          >
            Use different email
          </button>
        </div>

        <style jsx>{`
          .newsletter-wrapper {
            background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
            border-radius: 24px;
            padding: 2rem;
          }
          .pending-container {
            text-align: center;
            max-width: 450px;
            margin: 0 auto;
          }
          .pending-icon { font-size: 48px; margin-bottom: 16px; }
          .pending-title { color: white; font-size: 1.5rem; margin-bottom: 8px; }
          .pending-email { color: rgba(255,255,255,0.7); margin-bottom: 16px; }
          .pending-message { color: rgba(255,255,255,0.6); font-size: 0.9rem; margin-bottom: 24px; line-height: 1.5; }
          .resend-btn {
            width: 100%;
            padding: 12px;
            background: #06b6d4;
            color: white;
            border: none;
            border-radius: 40px;
            font-weight: 600;
            cursor: pointer;
            margin-bottom: 12px;
          }
          .resend-btn:disabled { opacity: 0.5; cursor: not-allowed; }
          .different-email-btn {
            background: none;
            border: none;
            color: rgba(255,255,255,0.5);
            cursor: pointer;
            font-size: 0.8rem;
          }
        `}</style>
      </div>
    )
  }

  // 🔥 MAIN SUBSCRIBE FORM
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
          <form onSubmit={handleSubscribe} className="newsletter-form" noValidate>
            <div className="form-row">
              <div className="email-input-wrapper">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className={`newsletter-input ${checkingStatus ? 'checking' : ''}`}
                  disabled={loading || cooldown}
                  aria-label="Email address"
                />
                {checkingStatus && (
                  <div className="email-status checking">
                    <span className="spinner"></span>
                  </div>
                )}
              </div>
              <button 
                type="submit" 
                className="newsletter-button" 
                disabled={loading || cooldown || subscriptionStatus === 'subscribed'}
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

            <div className="preferences-toggle">
              <button type="button" onClick={() => setShowPreferences(!showPreferences)} className="toggle-btn">
                {showPreferences ? '▼' : '▶'} Customize delivery preferences
              </button>
            </div>

            {showPreferences && (
              <div className="preferences-section">
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
        
        .email-input-wrapper {
          flex: 1;
          position: relative;
        }
        
        .newsletter-input {
          width: 100%;
          padding: 0.875rem 1.25rem;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 14px;
          color: white;
          font-size: 0.95rem;
          transition: all 0.2s;
        }
        
        .newsletter-input:focus { outline: none; border-color: #06b6d4; }
        .newsletter-input.checking { padding-right: 50px; }
        
        .email-status {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
        }
        
        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #06b6d4;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
          display: inline-block;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
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