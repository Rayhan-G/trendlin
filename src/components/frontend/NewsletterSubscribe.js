// src/components/frontend/NewsletterSubscribe.js

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase'

export default function NewsletterSubscribe({ 
  presetCategory = null,
  className = '' 
}) {
  const router = useRouter()
  
  const [email, setEmail] = useState('')
  const [selectedCategories, setSelectedCategories] = useState([])
  const [showCategorySelector, setShowCategorySelector] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [currentPageCategory, setCurrentPageCategory] = useState(null)
  const [categoryName, setCategoryName] = useState('')
  const [isLocalhost, setIsLocalhost] = useState(false)
  const [cooldown, setCooldown] = useState(false)
  
  const [showPreferences, setShowPreferences] = useState(false)
  const [deliveryFrequency, setDeliveryFrequency] = useState('weekly')
  const [maxPostsPerWeek, setMaxPostsPerWeek] = useState(3)
  const [postFormat, setPostFormat] = useState('summary')
  
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState('')
  const [resendCooldown, setResendCooldown] = useState(false)
  
  // 🔥 SUBSCRIPTION STATE
  const [subscriptionStatus, setSubscriptionStatus] = useState(null) // 'subscribed', 'pending', 'expired', 'not_subscribed'
  const [subscriberData, setSubscriberData] = useState(null)
  const [loadingStatus, setLoadingStatus] = useState(true)
  const [cookieExpiring, setCookieExpiring] = useState(false)

  const categories = [
    { id: 'health', name: 'Health & Wellness', icon: '🌿' },
    { id: 'entertainment', name: 'Entertainment', icon: '🎬' },
    { id: 'growth', name: 'Personal Growth', icon: '🌱' },
    { id: 'lifestyle', name: 'Lifestyle', icon: '✨' },
    { id: 'tech', name: 'Technology', icon: '⚡' },
    { id: 'wealth', name: 'Wealth', icon: '💰' },
    { id: 'world', name: 'World News', icon: '🌍' }
  ]

  // Helper: Get cookie
  const getCookie = (name) => {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop().split(';').shift()
    return null
  }

  // Helper: Set cookie
  const setCookie = (name, value, days = 365) => {
    const expires = new Date()
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax;Secure`
  }

  // Helper: Check if cookie is expiring soon (within 30 days)
  const isCookieExpiringSoon = () => {
    const subscribedAt = getCookie('subscribed_at')
    if (!subscribedAt) return false
    
    const subscribedDate = new Date(parseInt(subscribedAt))
    const now = new Date()
    const daysSince = (now - subscribedDate) / (1000 * 60 * 60 * 24)
    
    // Cookie expires at 365 days, show warning at 335 days (30 days before)
    return daysSince >= 335
  }

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

  useEffect(() => {
    const hostname = window.location.hostname
    setIsLocalhost(hostname === 'localhost' || hostname === '127.0.0.1')
  }, [])

  // 🔥 CROSS-DEVICE DETECTION with Cookie + DB Verification
  useEffect(() => {
    const detectSubscription = async () => {
      setLoadingStatus(true)
      
      // Check cookie expiry warning
      setCookieExpiring(isCookieExpiringSoon())
      
      // Method 1: URL parameter (from email link)
      const { email: urlEmail, token } = router.query
      if (urlEmail && typeof urlEmail === 'string') {
        const decodedEmail = decodeURIComponent(urlEmail)
        setEmail(decodedEmail)
        await checkAndSetStatus(decodedEmail)
        setLoadingStatus(false)
        return
      }
      
      // Method 2: Cookie (cross-device)
      const cookieEmail = getCookie('subscribed_email')
      if (cookieEmail) {
        setEmail(cookieEmail)
        await checkAndSetStatus(cookieEmail)
        setLoadingStatus(false)
        return
      }
      
      // Method 3: localStorage (fallback)
      const savedEmail = localStorage.getItem('subscribed_email')
      if (savedEmail) {
        setEmail(savedEmail)
        await checkAndSetStatus(savedEmail)
        setLoadingStatus(false)
        return
      }
      
      setLoadingStatus(false)
    }
    
    detectSubscription()
  }, [router.query])

  // 🔥 Check database - SOURCE OF TRUTH
  const checkAndSetStatus = async (emailToCheck) => {
    try {
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .select('email, status, categories, delivery_frequency, max_posts_per_week, post_format, unsubscribe_token, subscribed_at, verified_at')
        .eq('email', emailToCheck.toLowerCase().trim())
        .maybeSingle()

      if (error) throw error

      if (data) {
        if (data.status === 'verified') {
          // Check if subscription is still valid (not expired)
          const verifiedDate = new Date(data.verified_at)
          const now = new Date()
          const daysSinceVerified = (now - verifiedDate) / (1000 * 60 * 60 * 24)
          
          // If subscription is older than 365 days, mark as expired
          if (daysSinceVerified >= 365) {
            setSubscriptionStatus('expired')
            setSubscriberData(data)
            // Clear expired cookie
            document.cookie = 'subscribed_email=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
          } else {
            setSubscriptionStatus('subscribed')
            setSubscriberData(data)
            // Refresh cookie
            setCookie('subscribed_email', emailToCheck.toLowerCase().trim())
            setCookie('subscribed_at', Date.now().toString())
            localStorage.setItem('subscribed_email', emailToCheck.toLowerCase().trim())
          }
        } else if (data.status === 'pending') {
          setSubscriptionStatus('pending')
          setSubscriberData(data)
        }
      } else {
        setSubscriptionStatus('not_subscribed')
        setSubscriberData(null)
        // Clear invalid cookie
        document.cookie = 'subscribed_email=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
        localStorage.removeItem('subscribed_email')
      }
    } catch (err) {
      console.error('Error:', err)
      setSubscriptionStatus('not_subscribed')
    }
  }

  // 🔥 RENEW SUBSCRIPTION - When expired
  const handleRenew = async () => {
    if (cooldown) {
      setError('Please wait a moment before trying again.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const newToken = generateToken()
      
      // Update existing subscriber with new verification token
      const { error: updateError } = await supabase
        .from('newsletter_subscribers')
        .update({
          status: 'pending',
          verification_token: newToken,
          verification_sent_at: new Date().toISOString(),
          subscribed_at: new Date().toISOString(), // Reset subscription date
        })
        .eq('email', email.toLowerCase().trim())

      if (updateError) throw updateError

      if (!isLocalhost) {
        await sendVerificationEmail(email, newToken, selectedCategories, currentPageCategory || 'home')
      }

      setSubmittedEmail(email)
      setShowSuccessModal(true)
      
      setCooldown(true)
      setTimeout(() => setCooldown(false), 30000)

    } catch (err) {
      console.error('Renew error:', err)
      setError('Failed to renew. Please try again.')
    } finally {
      setLoading(false)
    }
  }

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
    if (subscriptionStatus === 'expired') return '🔄 Renew Subscription'
    if (subscriptionStatus === 'pending') return 'Resend Verification'
    if (currentPageCategory) return `Subscribe to ${categoryName} →`
    return 'Subscribe →'
  }

  // Loading state
  if (loadingStatus) {
    return (
      <div className={`newsletter-wrapper ${className}`}>
        <div className="loading-container">
          <div className="spinner-large"></div>
          <p>Loading...</p>
        </div>
        <style jsx>{`
          .newsletter-wrapper {
            background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
            border-radius: 24px;
            padding: 2rem;
            text-align: center;
          }
          .loading-container { padding: 40px; color: white; }
          .spinner-large {
            width: 40px;
            height: 40px;
            border: 3px solid rgba(255,255,255,0.3);
            border-top-color: #06b6d4;
            border-radius: 50%;
            animation: spin 0.6s linear infinite;
            margin: 0 auto 16px;
          }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    )
  }

  // ============================================
  // SUCCESS MODAL
  // ============================================
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

  // ============================================
  // EXPIRED UI - Show Renew Button
  // ============================================
  if (subscriptionStatus === 'expired' && subscriberData && email) {
    return (
      <div className={`newsletter-wrapper ${className}`}>
        <div className="status-container expired">
          <div className="status-icon">⚠️</div>
          <h3 className="status-title">Subscription Expired</h3>
          <p className="status-email">{email}</p>
          <p className="status-message">
            Your annual subscription has expired. Renew to continue receiving updates.
          </p>
          
          <div className="status-details">
            <div className="detail-row">
              <span className="detail-label">Previously subscribed to:</span>
              <span className="detail-value">
                {subscriberData.categories?.map(catId => 
                  categories.find(c => c.id === catId)?.name
                ).join(', ') || 'All categories'}
              </span>
            </div>
          </div>

          <div className="status-actions">
            <button onClick={handleRenew} className="action-btn renew" disabled={loading}>
              {loading ? 'Sending...' : '🔄 Renew Subscription →'}
            </button>
            <a 
              href={`/api/unsubscribe?token=${subscriberData.unsubscribe_token}`}
              className="action-btn danger"
              onClick={(e) => {
                if (!confirm('Remove your data completely?')) {
                  e.preventDefault()
                }
              }}
            >
              Remove Data
            </a>
          </div>
        </div>

        <style jsx>{`
          .newsletter-wrapper {
            background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
            border-radius: 24px;
            padding: 2rem;
          }
          .status-container { text-align: center; max-width: 450px; margin: 0 auto; }
          .status-icon { font-size: 48px; margin-bottom: 16px; }
          .status-title { color: white; font-size: 1.5rem; margin-bottom: 8px; }
          .status-email { color: rgba(255,255,255,0.7); margin-bottom: 16px; }
          .status-message { color: rgba(255,255,255,0.6); margin-bottom: 24px; line-height: 1.5; }
          .status-details {
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
          }
          .detail-label { color: rgba(255,255,255,0.6); font-size: 0.8rem; }
          .detail-value { color: white; font-size: 0.8rem; font-weight: 500; }
          .status-actions { display: flex; flex-direction: column; gap: 12px; }
          .action-btn {
            display: block;
            padding: 12px;
            border-radius: 40px;
            font-weight: 600;
            text-decoration: none;
            text-align: center;
            cursor: pointer;
            border: none;
            font-size: 0.9rem;
          }
          .action-btn.renew { background: #f59e0b; color: white; }
          .action-btn.danger {
            background: rgba(239,68,68,0.2);
            color: #ef4444;
            border: 1px solid rgba(239,68,68,0.3);
            text-decoration: none;
          }
        `}</style>
      </div>
    )
  }

  // ============================================
  // SUBSCRIBED UI (Active)
  // ============================================
  if (subscriptionStatus === 'subscribed' && subscriberData && email) {
    return (
      <div className={`newsletter-wrapper ${className}`}>
        <div className="status-container">
          <div className="status-icon">✅</div>
          <h3 className="status-title">You're subscribed!</h3>
          <p className="status-email">{email}</p>
          
          {cookieExpiring && (
            <div className="warning-banner">
              ⚠️ Your subscription will expire in 30 days. <button onClick={handleRenew} className="renew-link">Renew now</button> to continue uninterrupted.
            </div>
          )}
          
          <div className="status-details">
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

          <div className="status-actions">
            <a href={`/newsletter/manage?email=${encodeURIComponent(email)}`} className="action-btn primary">
              ⚙️ Manage Preferences →
            </a>
            <a 
              href={`/api/unsubscribe?token=${subscriberData.unsubscribe_token}`} 
              className="action-btn danger"
              onClick={(e) => {
                if (!confirm('Are you sure you want to unsubscribe?')) {
                  e.preventDefault()
                }
              }}
            >
              🗑️ Unsubscribe
            </a>
          </div>
        </div>

        <style jsx>{`
          .newsletter-wrapper {
            background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
            border-radius: 24px;
            padding: 2rem;
          }
          .status-container { text-align: center; max-width: 450px; margin: 0 auto; }
          .status-icon { font-size: 48px; margin-bottom: 16px; }
          .status-title { color: white; font-size: 1.5rem; margin-bottom: 8px; }
          .status-email { color: rgba(255,255,255,0.7); margin-bottom: 24px; word-break: break-all; }
          .warning-banner {
            background: rgba(245,158,11,0.2);
            border: 1px solid rgba(245,158,11,0.3);
            border-radius: 12px;
            padding: 12px;
            margin-bottom: 20px;
            font-size: 0.8rem;
            color: #fbbf24;
          }
          .renew-link {
            background: none;
            border: none;
            color: #fbbf24;
            text-decoration: underline;
            cursor: pointer;
          }
          .status-details {
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
          .status-actions { display: flex; flex-direction: column; gap: 12px; }
          .action-btn {
            display: block;
            padding: 12px;
            border-radius: 40px;
            font-weight: 600;
            text-decoration: none;
            text-align: center;
          }
          .action-btn.primary { background: #06b6d4; color: white; }
          .action-btn.danger {
            background: rgba(239,68,68,0.2);
            color: #ef4444;
            border: 1px solid rgba(239,68,68,0.3);
          }
        `}</style>
      </div>
    )
  }

  // ============================================
  // PENDING UI
  // ============================================
  if (subscriptionStatus === 'pending' && subscriberData && email) {
    return (
      <div className={`newsletter-wrapper ${className}`}>
        <div className="status-container">
          <div className="status-icon">⏳</div>
          <h3 className="status-title">Awaiting Verification</h3>
          <p className="status-email">{email}</p>
          <p className="status-message">
            We sent a verification link to your email. Please check your inbox and click the link to complete your subscription.
          </p>
          
          <div className="status-actions">
            <button onClick={() => {
              setSubmittedEmail(email)
              resendVerification()
            }} className="action-btn primary" disabled={resendCooldown}>
              {resendCooldown ? 'Wait 30s' : 'Resend Verification Email →'}
            </button>
            <a 
              href={`/api/unsubscribe?token=${subscriberData.unsubscribe_token}`}
              className="action-btn danger"
              onClick={(e) => {
                if (!confirm('Cancel this subscription request?')) {
                  e.preventDefault()
                }
              }}
            >
              Cancel Request
            </a>
          </div>
        </div>

        <style jsx>{`
          .newsletter-wrapper {
            background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
            border-radius: 24px;
            padding: 2rem;
          }
          .status-container { text-align: center; max-width: 450px; margin: 0 auto; }
          .status-icon { font-size: 48px; margin-bottom: 16px; }
          .status-title { color: white; font-size: 1.5rem; margin-bottom: 8px; }
          .status-email { color: rgba(255,255,255,0.7); margin-bottom: 16px; }
          .status-message { color: rgba(255,255,255,0.6); margin-bottom: 24px; line-height: 1.5; }
          .status-actions { display: flex; flex-direction: column; gap: 12px; }
          .action-btn {
            display: block;
            padding: 12px;
            border-radius: 40px;
            font-weight: 600;
            text-decoration: none;
            text-align: center;
            cursor: pointer;
            border: none;
            font-size: 0.9rem;
          }
          .action-btn.primary { background: #06b6d4; color: white; }
          .action-btn.primary:disabled { opacity: 0.5; cursor: not-allowed; }
          .action-btn.danger {
            background: rgba(239,68,68,0.2);
            color: #ef4444;
            border: 1px solid rgba(239,68,68,0.3);
          }
        `}</style>
      </div>
    )
  }

  // ============================================
  // MAIN SUBSCRIBE FORM
  // ============================================
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
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="newsletter-input"
                disabled={loading || cooldown}
              />
              <button type="submit" className="newsletter-button" disabled={loading || cooldown}>
                {getButtonText()}
              </button>
            </div>

            {showCategorySelector && (
              <div className="category-section">
                <div className="category-header">
                  <span className="category-label">I'm interested in:</span>
                  <button type="button" onClick={handleSelectAll} className="select-all-btn">
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