// src/components/frontend/NewsletterSubscribe.js
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function NewsletterSubscribe({ variant = 'default', onSubscriptionChange }) {
  const [user, setUser] = useState(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState([])
  const [originalCategories, setOriginalCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [cooldown, setCooldown] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [subscriptionStatus, setSubscriptionStatus] = useState(null)
  const [showAuthPopup, setShowAuthPopup] = useState(false)
  const [currentPageCategory, setCurrentPageCategory] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [emailLoading, setEmailLoading] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [pendingSubscription, setPendingSubscription] = useState(null)
  const [isHovered, setIsHovered] = useState(false)

  const categories = [
    { id: 'health', name: 'Health & Wellness', icon: '🌿', color: '#10b981' },
    { id: 'entertainment', name: 'Entertainment', icon: '🎬', color: '#f59e0b' },
    { id: 'growth', name: 'Personal Growth', icon: '🌱', color: '#8b5cf6' },
    { id: 'lifestyle', name: 'Lifestyle', icon: '✨', color: '#ec4899' },
    { id: 'tech', name: 'Technology', icon: '⚡', color: '#06b6d4' },
    { id: 'wealth', name: 'Wealth', icon: '💰', color: '#22c55e' },
    { id: 'world', name: 'World News', icon: '🌍', color: '#3b82f6' }
  ]

  const maxPostsPerWeek = selectedCategories.length
  const deliveryDay = 'Sunday'

  const detectCurrentCategory = () => {
    if (typeof window === 'undefined') return null
    const path = window.location.pathname
    const matchedCategory = categories.find(cat => 
      path.includes(`/category/${cat.id}`) || path.includes(`/${cat.id}`)
    )
    return matchedCategory ? matchedCategory.id : null
  }

  // Check authentication and subscription status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me')
        const data = await res.json()
        
        if (data.authenticated) {
          setUser(data.user)
          setNewEmail(data.user.email)
          
          if (data.newsletter && data.newsletter.is_subscribed === true) {
            setSubscriptionStatus('subscribed')
            setSelectedCategories(data.newsletter.categories || [])
            setOriginalCategories(data.newsletter.categories || [])
            if (onSubscriptionChange) onSubscriptionChange(true)
          } else {
            setSubscriptionStatus(null)
            const currentCat = detectCurrentCategory()
            if (currentCat) {
              setSelectedCategories([currentCat])
              setOriginalCategories([currentCat])
            }
            if (onSubscriptionChange) onSubscriptionChange(false)
          }
        } else {
          setUser(null)
          setSubscriptionStatus(null)
          const currentCat = detectCurrentCategory()
          if (currentCat) {
            setSelectedCategories([currentCat])
            setOriginalCategories([currentCat])
          }
          if (onSubscriptionChange) onSubscriptionChange(false)
        }
      } catch (err) {
        console.error('Auth check failed:', err)
      } finally {
        setAuthChecked(true)
      }
    }
    
    checkAuth()
  }, [onSubscriptionChange])

  // Detect current page category
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const handleUrlChange = () => {
      const newCategory = detectCurrentCategory()
      setCurrentPageCategory(newCategory)
      
      if (subscriptionStatus !== 'subscribed' && !user) {
        if (newCategory) {
          setSelectedCategories([newCategory])
          setOriginalCategories([newCategory])
        } else {
          setSelectedCategories([])
          setOriginalCategories([])
        }
      }
    }

    handleUrlChange()
    window.addEventListener('popstate', handleUrlChange)
    
    return () => {
      window.removeEventListener('popstate', handleUrlChange)
    }
  }, [user, subscriptionStatus])

  // Listen for auth complete event
  useEffect(() => {
    const handleAuthComplete = () => {
      fetch('/api/auth/me')
        .then(res => res.json())
        .then(data => {
          if (data.authenticated) {
            setUser(data.user)
            setNewEmail(data.user.email)
            setShowAuthPopup(false)
            if (data.newsletter && data.newsletter.is_subscribed) {
              setSubscriptionStatus('subscribed')
              setSelectedCategories(data.newsletter.categories || [])
              setOriginalCategories(data.newsletter.categories || [])
              if (onSubscriptionChange) onSubscriptionChange(true)
            }
          }
        })
        .catch(err => console.error('Auth refresh failed:', err))
    }

    window.addEventListener('authComplete', handleAuthComplete)
    return () => window.removeEventListener('authComplete', handleAuthComplete)
  }, [onSubscriptionChange])

  // Auto-hide auth popup after 4 seconds
  useEffect(() => {
    if (showAuthPopup) {
      const timer = setTimeout(() => setShowAuthPopup(false), 4000)
      return () => clearTimeout(timer)
    }
  }, [showAuthPopup])

  const handleSubscribe = async (e) => {
    e.preventDefault()
    
    if (!user) {
      setShowAuthPopup(true)
      return
    }
    
    if (selectedCategories.length === 0) {
      setError('Please select at least one category')
      return
    }

    setPendingSubscription({
      categories: [...selectedCategories],
      email: user.email,
      postCount: selectedCategories.length
    })
    setShowConfirmModal(true)
  }

  const confirmSubscription = async () => {
    if (!pendingSubscription) return

    setLoading(true)
    setError('')
    setShowConfirmModal(false)

    try {
      const { data: existingPrefs } = await supabase
        .from('newsletter_preferences')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()

      let result
      if (existingPrefs) {
        result = await supabase
          .from('newsletter_preferences')
          .update({
            is_subscribed: true,
            categories: pendingSubscription.categories,
            delivery_frequency: 'weekly',
            max_posts_per_week: pendingSubscription.postCount,
            post_format: 'digest',
            subscribed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
      } else {
        result = await supabase
          .from('newsletter_preferences')
          .insert({
            user_id: user.id,
            is_subscribed: true,
            categories: pendingSubscription.categories,
            delivery_frequency: 'weekly',
            max_posts_per_week: pendingSubscription.postCount,
            post_format: 'digest',
            subscribed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
      }

      if (result.error) throw result.error

      setSubscriptionStatus('subscribed')
      setSelectedCategories(pendingSubscription.categories)
      setOriginalCategories(pendingSubscription.categories)
      setShowSuccessModal(true)
      setCooldown(true)
      setTimeout(() => setCooldown(false), 30000)
      
      if (onSubscriptionChange) onSubscriptionChange(true)
      
      window.dispatchEvent(new CustomEvent('subscriptionChange', { 
        detail: { isSubscribed: true }
      }))
      
      localStorage.setItem('newsletter_subscribed', 'true')
      window.dispatchEvent(new Event('storage'))
      
      const event = new CustomEvent('showToast', { 
        detail: { message: 'Successfully subscribed to newsletter!', type: 'success' }
      })
      window.dispatchEvent(event)
    } catch (err) {
      console.error('Subscription error:', err)
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
      setPendingSubscription(null)
    }
  }

  const handleUpdatePreferences = async () => {
    if (selectedCategories.length === 0) {
      setError('Please select at least one category')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { error: updateError } = await supabase
        .from('newsletter_preferences')
        .update({
          categories: selectedCategories,
          max_posts_per_week: selectedCategories.length,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)

      if (updateError) throw updateError

      setOriginalCategories(selectedCategories)
      setError('')
      
      const event = new CustomEvent('showToast', { 
        detail: { message: 'Preferences updated successfully!', type: 'success' }
      })
      window.dispatchEvent(event)
      setIsEditing(false)
    } catch (err) {
      console.error('Update error:', err)
      setError(err.message || 'Failed to update preferences')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to unsubscribe? You will no longer receive our newsletter.')) {
      return
    }

    setLoading(true)

    try {
      const { error: updateError } = await supabase
        .from('newsletter_preferences')
        .update({
          is_subscribed: false,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)

      if (updateError) throw updateError

      setSubscriptionStatus(null)
      setSelectedCategories([])
      setOriginalCategories([])
      
      if (onSubscriptionChange) onSubscriptionChange(false)
      
      window.dispatchEvent(new CustomEvent('subscriptionChange', { 
        detail: { isSubscribed: false }
      }))
      
      localStorage.setItem('newsletter_subscribed', 'false')
      window.dispatchEvent(new Event('storage'))
      
      const event = new CustomEvent('showToast', { 
        detail: { message: 'You have been unsubscribed.', type: 'info' }
      })
      window.dispatchEvent(event)
    } catch (err) {
      console.error('Unsubscribe error:', err)
      setError(err.message || 'Failed to unsubscribe')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateEmail = async () => {
    if (!newEmail || !newEmail.includes('@')) {
      setEmailError('Please enter a valid email address')
      return
    }

    setEmailLoading(true)
    setEmailError('')

    try {
      const res = await fetch('/api/auth/update-email', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newEmail })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update email')
      }

      setUser({ ...user, email: newEmail })
      
      const event = new CustomEvent('showToast', { 
        detail: { message: 'Email updated successfully!', type: 'success' }
      })
      window.dispatchEvent(event)
      
      setEmailError('')
    } catch (err) {
      setEmailError(err.message)
    } finally {
      setEmailLoading(false)
    }
  }

  const handleCategoryToggle = (categoryId) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter(c => c !== categoryId))
    } else {
      setSelectedCategories([...selectedCategories, categoryId])
    }
    setError('')
  }

  const handleSelectAll = () => {
    if (selectedCategories.length === categories.length) {
      setSelectedCategories([])
    } else {
      setSelectedCategories(categories.map(c => c.id))
    }
    setError('')
  }

  const getButtonText = () => {
    if (loading) return 'Processing...'
    if (cooldown) return 'Please wait...'
    if (selectedCategories.length === 0) return 'Select categories first'
    return 'Review Subscription →'
  }

  const openSignupFromPopup = () => {
    setShowAuthPopup(false)
    window.dispatchEvent(new CustomEvent('openAuth', { detail: 'signup' }))
  }

  const currentCategoryName = currentPageCategory 
    ? categories.find(c => c.id === currentPageCategory)?.name 
    : null

  // Loading state
  if (!authChecked) {
    return (
      <div className={`loading-placeholder ${variant}`}>
        <div className="spinner"></div>
        <style jsx>{`
          .loading-placeholder {
            background: ${variant === 'footer' ? '#f9fafb' : '#ffffff'};
            border-radius: 24px;
            padding: 2rem;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: ${variant === 'footer' ? '120px' : '200px'};
            border: 1px solid #e5e7eb;
          }
          :global(.dark) .loading-placeholder {
            background: ${variant === 'footer' ? 'rgba(255,255,255,0.03)' : 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)'};
            border-color: #1f1f2a;
          }
          .spinner {
            width: 32px;
            height: 32px;
            border: 3px solid #e5e7eb;
            border-top-color: #06b6d4;
            border-radius: 50%;
            animation: spin 0.6s linear infinite;
          }
          :global(.dark) .spinner {
            border: 3px solid rgba(255,255,255,0.2);
            border-top-color: #06b6d4;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  // Confirmation Modal
  if (showConfirmModal && pendingSubscription) {
    const categoriesList = categories.filter(c => pendingSubscription.categories.includes(c.id))
    
    return (
      <div className="confirm-modal-overlay" onClick={() => setShowConfirmModal(false)}>
        <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
          <button className="confirm-modal-close" onClick={() => setShowConfirmModal(false)}>✕</button>
          
          <div className="confirm-modal-icon">📬</div>
          <h3 className="confirm-modal-title">Confirm Your Subscription</h3>
          
          <div className="confirm-modal-summary">
            <div className="summary-item">
              <span className="summary-label">📧 Email</span>
              <span className="summary-value">{pendingSubscription.email}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">📅 Delivery Day</span>
              <span className="summary-value">Every {deliveryDay}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">📬 Posts per week</span>
              <span className="summary-value">{pendingSubscription.postCount} {pendingSubscription.postCount === 1 ? 'post' : 'posts'}</span>
            </div>
          </div>
          
          <div className="confirm-modal-categories">
            <div className="categories-label">Selected Categories:</div>
            <div className="categories-list-confirm">
              {categoriesList.map(cat => (
                <span key={cat.id} className="category-confirm-pill">
                  {cat.icon} {cat.name}
                </span>
              ))}
            </div>
          </div>
          
          <div className="confirm-modal-actions">
            <button onClick={confirmSubscription} className="confirm-btn" disabled={loading}>
              {loading ? 'Subscribing...' : '✓ Confirm Subscription'}
            </button>
            <button onClick={() => setShowConfirmModal(false)} className="cancel-btn-modal">
              Cancel
            </button>
          </div>
          <p className="confirm-modal-note">You can unsubscribe or change preferences at any time.</p>
        </div>

        <style jsx>{`
          .confirm-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(8px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 100000;
            padding: 16px;
          }
          .confirm-modal {
            background: #ffffff;
            border-radius: 32px;
            max-width: 480px;
            width: 100%;
            padding: 2rem;
            position: relative;
            border: 1px solid #e5e7eb;
            box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
          }
          :global(.dark) .confirm-modal {
            background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
            border: 1px solid rgba(255,255,255,0.1);
          }
          .confirm-modal-close {
            position: absolute;
            top: 20px;
            right: 20px;
            background: #f3f4f6;
            border: none;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            color: #6b7280;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.2s;
          }
          :global(.dark) .confirm-modal-close {
            background: rgba(255,255,255,0.1);
            color: rgba(255,255,255,0.6);
          }
          .confirm-modal-close:hover { background: #e5e7eb; }
          :global(.dark) .confirm-modal-close:hover { background: rgba(255,255,255,0.2); color: white; }
          .confirm-modal-icon { font-size: 48px; text-align: center; margin-bottom: 16px; }
          .confirm-modal-title { font-size: 1.5rem; font-weight: 700; text-align: center; color: #111827; margin: 0 0 24px 0; }
          :global(.dark) .confirm-modal-title { color: white; }
          .confirm-modal-summary { background: #f9fafb; border-radius: 20px; padding: 1rem; margin-bottom: 20px; }
          :global(.dark) .confirm-modal-summary { background: rgba(255,255,255,0.05); }
          .summary-item { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
          .summary-item:last-child { border-bottom: none; }
          :global(.dark) .summary-item { border-bottom: 1px solid rgba(255,255,255,0.08); }
          .summary-label { font-size: 0.875rem; color: #6b7280; }
          :global(.dark) .summary-label { color: rgba(255,255,255,0.6); }
          .summary-value { font-size: 0.875rem; font-weight: 600; color: #111827; }
          :global(.dark) .summary-value { color: white; }
          .confirm-modal-categories { margin-bottom: 24px; }
          .categories-label { font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #9ca3af; margin-bottom: 12px; }
          :global(.dark) .categories-label { color: rgba(255,255,255,0.5); }
          .categories-list-confirm { display: flex; flex-wrap: wrap; gap: 8px; }
          .category-confirm-pill { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 40px; font-size: 0.8rem; color: #1e40af; }
          :global(.dark) .category-confirm-pill { background: rgba(6,182,212,0.15); border: 1px solid rgba(6,182,212,0.3); color: #06b6d4; }
          .confirm-modal-actions { display: flex; gap: 12px; margin-top: 8px; }
          .confirm-btn { flex: 2; padding: 12px; background: #06b6d4; border: none; border-radius: 40px; color: white; font-weight: 600; font-size: 0.875rem; cursor: pointer; transition: all 0.2s; }
          .confirm-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 20px -5px rgba(6,182,212,0.3); }
          .confirm-btn:disabled { opacity: 0.5; cursor: not-allowed; }
          .cancel-btn-modal { flex: 1; padding: 12px; background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 40px; color: #374151; font-size: 0.875rem; cursor: pointer; transition: all 0.2s; }
          :global(.dark) .cancel-btn-modal { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); color: rgba(255,255,255,0.7); }
          .cancel-btn-modal:hover { background: #e5e7eb; }
          :global(.dark) .cancel-btn-modal:hover { background: rgba(255,255,255,0.12); color: white; }
          .confirm-modal-note { font-size: 0.7rem; text-align: center; color: #9ca3af; margin: 20px 0 0 0; }
          :global(.dark) .confirm-modal-note { color: rgba(255,255,255,0.4); }
          @media (max-width: 480px) { .confirm-modal { padding: 1.5rem; } .confirm-modal-title { font-size: 1.25rem; } .confirm-modal-actions { flex-direction: column; } }
        `}</style>
      </div>
    )
  }

  // Success Modal
  if (showSuccessModal) {
    return (
      <div className="modal-overlay" onClick={() => setShowSuccessModal(false)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="success-icon">✅</div>
          <h3>Successfully Subscribed!</h3>
          <p>You'll now receive our weekly newsletter at:</p>
          <p className="email-highlight">{user?.email}</p>
          <button onClick={() => setShowSuccessModal(false)}>
            Got it, thanks →
          </button>
        </div>
        <style jsx>{`
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.8);
            backdrop-filter: blur(4px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
          }
          .modal-content {
            background: white;
            border-radius: 28px;
            padding: 32px;
            max-width: 400px;
            width: 90%;
            text-align: center;
          }
          .success-icon { font-size: 48px; margin-bottom: 16px; }
          .modal-content h3 { margin: 0 0 12px; color: #0f172a; }
          .modal-content p { color: #64748b; margin: 0 0 8px; }
          .email-highlight { font-family: monospace; font-weight: bold; color: #06b6d4; margin-bottom: 16px; }
          .modal-content button { width: 100%; padding: 12px; background: linear-gradient(135deg, #06b6d4, #0891b2); color: white; border: none; border-radius: 40px; cursor: pointer; font-weight: 600; margin-top: 16px; }
          :global(.dark) .modal-content { background: #1e293b; }
          :global(.dark) .modal-content h3 { color: white; }
          :global(.dark) .modal-content p { color: #94a3b8; }
        `}</style>
      </div>
    )
  }

  // Management View (for subscribed users)
  if (subscriptionStatus === 'subscribed' && user) {
    return (
      <div className={`manage-wrapper ${variant}`}>
        <div className="manage-header">
          <div className="manage-header-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </div>
          <div className="manage-header-info">
            <h3>Newsletter Active</h3>
            <p>{user.email}</p>
          </div>
          <div className="manage-badge">
            <span className="badge-active">✓ Subscribed</span>
          </div>
        </div>

        {/* Categories Card */}
        <div className="manage-card">
          <div className="card-header">
            <div className="card-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
              <h4>Your Categories</h4>
            </div>
            {!isEditing && (
              <button onClick={() => { setIsEditing(true); setSelectedCategories(originalCategories); }} className="edit-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M17 3l4 4-7 7H10v-4l7-7z" />
                  <path d="M4 20h16" />
                </svg>
                Edit
              </button>
            )}
          </div>
          
          {!isEditing ? (
            <div className="categories-display">
              {originalCategories.length > 0 ? (
                <>
                  <div className="categories-list">
                    {originalCategories.map(catId => {
                      const cat = categories.find(c => c.id === catId)
                      return (
                        <span key={catId} className="category-pill" style={{ borderColor: cat?.color + '40', backgroundColor: cat?.color + '10' }}>
                          <span className="pill-icon">{cat?.icon}</span>
                          <span>{cat?.name}</span>
                        </span>
                      )
                    })}
                  </div>
                  <div className="delivery-info">
                    <div className="info-item">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      <span>Weekly on {deliveryDay}</span>
                    </div>
                    <div className="info-item">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                      <span>{originalCategories.length} {originalCategories.length === 1 ? 'article' : 'articles'}/week</span>
                    </div>
                  </div>
                </>
              ) : (
                <p className="empty-state">No categories selected</p>
              )}
            </div>
          ) : (
            <div className="edit-mode">
              <div className="categories-grid-edit">
                {categories.map((category) => (
                  <label key={category.id} className={`category-checkbox ${selectedCategories.includes(category.id) ? 'checked' : ''}`}>
                    <input type="checkbox" checked={selectedCategories.includes(category.id)} onChange={() => handleCategoryToggle(category.id)} />
                    <span className="checkbox-icon">{category.icon}</span>
                    <span className="checkbox-label">{category.name}</span>
                  </label>
                ))}
              </div>
              <div className="edit-actions">
                <button onClick={handleUpdatePreferences} disabled={loading} className="save-btn">
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button onClick={() => { setIsEditing(false); setSelectedCategories(originalCategories); }} className="cancel-btn">
                  Cancel
                </button>
              </div>
              {error && <p className="error-msg">{error}</p>}
            </div>
          )}
        </div>

        {/* Email Change Card */}
        <div className="manage-card email-card">
          <div className="card-header">
            <div className="card-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <h4>Email Address</h4>
            </div>
          </div>
          
          <div className="email-section">
            <div className="current-email">
              <label>Current email</label>
              <div className="email-display">
                <span className="email-value">{user.email}</span>
              </div>
            </div>
            
            <div className="email-change-form">
              <label>New email address</label>
              <div className="email-input-group">
                <input 
                  type="email" 
                  value={newEmail} 
                  onChange={(e) => setNewEmail(e.target.value)} 
                  placeholder="Enter new email address"
                  className="email-input"
                  disabled={emailLoading}
                />
                <button 
                  onClick={handleUpdateEmail} 
                  disabled={emailLoading || !newEmail || newEmail === user.email}
                  className="update-email-btn"
                >
                  {emailLoading ? (
                    <span className="btn-spinner-small"></span>
                  ) : (
                    'Update Email'
                  )}
                </button>
              </div>
              {emailError && <p className="error-msg">{emailError}</p>}
              <p className="email-note">
                ⚠️ You'll need to verify your new email address. A confirmation link will be sent.
              </p>
            </div>
          </div>
        </div>

        {/* Unsubscribe Button */}
        <button onClick={handleCancelSubscription} disabled={loading} className="unsubscribe-btn">
          Unsubscribe
        </button>

        <style jsx>{`
          .manage-wrapper {
            background: ${variant === 'footer' ? '#f9fafb' : '#ffffff'};
            border-radius: ${variant === 'footer' ? '20px' : '32px'};
            padding: ${variant === 'footer' ? '1rem' : '2rem'};
            border: 1px solid #e5e7eb;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
          }
          :global(.dark) .manage-wrapper {
            background: ${variant === 'footer' ? 'transparent' : 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)'};
            border: ${variant === 'footer' ? '1px solid rgba(255,255,255,0.1)' : 'none'};
          }
          .manage-header {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding-bottom: 1rem;
            margin-bottom: 1rem;
            border-bottom: 1px solid #e5e7eb;
          }
          :global(.dark) .manage-header {
            border-bottom: 1px solid rgba(255,255,255,0.1);
          }
          .manage-header-icon {
            width: 48px;
            height: 48px;
            background: #eff6ff;
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #06b6d4;
          }
          :global(.dark) .manage-header-icon {
            background: rgba(6,182,212,0.15);
          }
          .manage-header-info { flex: 1; }
          .manage-header-info h3 { font-size: 1rem; font-weight: 600; color: #111827; margin: 0 0 4px 0; }
          :global(.dark) .manage-header-info h3 { color: white; }
          .manage-header-info p { font-size: 0.75rem; color: #6b7280; margin: 0; }
          :global(.dark) .manage-header-info p { color: rgba(255,255,255,0.5); }
          .manage-badge { margin-left: auto; }
          .badge-active { background: #d1fae5; color: #065f46; padding: 4px 12px; border-radius: 40px; font-size: 0.7rem; font-weight: 500; }
          :global(.dark) .badge-active { background: rgba(34,197,94,0.15); color: #22c55e; }
          
          .manage-card { 
            background: #f9fafb; 
            border: 1px solid #e5e7eb; 
            border-radius: 20px; 
            padding: 1rem; 
            margin-bottom: 1rem;
          }
          :global(.dark) .manage-card { 
            background: rgba(255,255,255,0.03); 
            border: 1px solid rgba(255,255,255,0.08);
          }
          
          .email-card {
            margin-bottom: 1rem;
          }
          
          .card-header { 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            margin-bottom: 0.75rem; 
          }
          .card-title { 
            display: flex; 
            align-items: center; 
            gap: 0.5rem; 
          }
          .card-title svg { 
            color: #06b6d4; 
            stroke: #06b6d4; 
          }
          .card-title h4 { 
            font-size: 0.75rem; 
            font-weight: 600; 
            color: #6b7280; 
            margin: 0; 
            text-transform: uppercase; 
            letter-spacing: 0.5px; 
          }
          :global(.dark) .card-title h4 { 
            color: rgba(255,255,255,0.7); 
          }
          
          .edit-btn { 
            background: transparent; 
            border: 1px solid #06b6d4; 
            color: #06b6d4; 
            padding: 4px 12px; 
            border-radius: 40px; 
            font-size: 0.7rem; 
            cursor: pointer; 
            display: flex; 
            align-items: center; 
            gap: 4px; 
            transition: all 0.2s; 
          }
          .edit-btn:hover { 
            background: #eff6ff; 
          }
          :global(.dark) .edit-btn { 
            border: 1px solid rgba(6,182,212,0.3); 
          }
          :global(.dark) .edit-btn:hover { 
            background: rgba(6,182,212,0.1); 
          }
          
          .categories-display { 
            display: flex; 
            flex-direction: column; 
            gap: 0.75rem; 
          }
          .categories-list { 
            display: flex; 
            flex-wrap: wrap; 
            gap: 0.5rem; 
          }
          .category-pill { 
            display: inline-flex; 
            align-items: center; 
            gap: 6px; 
            padding: 4px 12px; 
            background: #f3f4f6; 
            border-radius: 40px; 
            font-size: 0.75rem; 
            color: #374151; 
            border: 1px solid transparent;
          }
          :global(.dark) .category-pill { 
            background: rgba(255,255,255,0.08); 
            color: white; 
          }
          
          .delivery-info { 
            display: flex; 
            gap: 1rem; 
            flex-wrap: wrap; 
            padding-top: 0.5rem; 
            border-top: 1px solid #e5e7eb; 
          }
          :global(.dark) .delivery-info { 
            border-top: 1px solid rgba(255,255,255,0.08); 
          }
          .info-item { 
            display: flex; 
            align-items: center; 
            gap: 6px; 
            font-size: 0.7rem; 
            color: #6b7280; 
          }
          :global(.dark) .info-item { 
            color: rgba(255,255,255,0.4); 
          }
          .info-item svg { 
            color: #06b6d4; 
            stroke: #06b6d4; 
          }
          
          .empty-state { 
            color: #9ca3af; 
            font-size: 0.75rem; 
            margin: 0; 
          }
          :global(.dark) .empty-state { 
            color: rgba(255,255,255,0.4); 
          }
          
          .edit-mode { 
            margin-top: 0.5rem; 
          }
          .categories-grid-edit { 
            display: flex; 
            flex-wrap: wrap; 
            gap: 0.5rem; 
            margin-bottom: 1rem; 
          }
          .category-checkbox { 
            display: flex; 
            align-items: center; 
            gap: 6px; 
            padding: 6px 14px; 
            background: #f3f4f6; 
            border: 1px solid #e5e7eb; 
            border-radius: 40px; 
            cursor: pointer; 
            transition: all 0.2s; 
          }
          :global(.dark) .category-checkbox { 
            background: rgba(255,255,255,0.05); 
            border: 1px solid rgba(255,255,255,0.1); 
          }
          .category-checkbox.checked { 
            background: #eff6ff; 
            border-color: #06b6d4; 
          }
          :global(.dark) .category-checkbox.checked { 
            background: rgba(6,182,212,0.2); 
            border-color: #06b6d4; 
          }
          .category-checkbox input { 
            display: none; 
          }
          .checkbox-icon { 
            font-size: 0.9rem; 
          }
          .checkbox-label { 
            font-size: 0.75rem; 
            color: #374151; 
          }
          :global(.dark) .checkbox-label { 
            color: white; 
          }
          
          .edit-actions { 
            display: flex; 
            gap: 0.5rem; 
          }
          .save-btn { 
            padding: 6px 16px; 
            background: #06b6d4; 
            border: none; 
            border-radius: 40px; 
            color: white; 
            font-weight: 500; 
            font-size: 0.75rem; 
            cursor: pointer; 
            transition: all 0.2s; 
          }
          .save-btn:hover:not(:disabled) { 
            background: #0891b2; 
            transform: translateY(-1px); 
          }
          .cancel-btn { 
            padding: 6px 16px; 
            background: #f3f4f6; 
            border: 1px solid #e5e7eb; 
            border-radius: 40px; 
            color: #374151; 
            font-size: 0.75rem; 
            cursor: pointer; 
          }
          :global(.dark) .cancel-btn { 
            background: rgba(255,255,255,0.08); 
            border: 1px solid rgba(255,255,255,0.15); 
            color: rgba(255,255,255,0.7); 
          }
          
          /* Email Section Styles */
          .email-section {
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }
          
          .current-email label {
            display: block;
            font-size: 0.7rem;
            font-weight: 600;
            color: #6b7280;
            margin-bottom: 0.5rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          :global(.dark) .current-email label {
            color: rgba(255,255,255,0.5);
          }
          
          .email-display {
            padding: 0.75rem;
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
          }
          :global(.dark) .email-display {
            background: rgba(255,255,255,0.05);
            border-color: rgba(255,255,255,0.1);
          }
          
          .email-value {
            font-family: monospace;
            font-size: 0.875rem;
            color: #111827;
          }
          :global(.dark) .email-value {
            color: white;
          }
          
          .email-change-form label {
            display: block;
            font-size: 0.7rem;
            font-weight: 600;
            color: #6b7280;
            margin-bottom: 0.5rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          :global(.dark) .email-change-form label {
            color: rgba(255,255,255,0.5);
          }
          
          .email-input-group {
            display: flex;
            gap: 0.75rem;
          }
          
          .email-input {
            flex: 1;
            padding: 0.625rem 1rem;
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 40px;
            color: #111827;
            font-size: 0.875rem;
            transition: all 0.2s;
          }
          :global(.dark) .email-input {
            background: rgba(255,255,255,0.08);
            border-color: rgba(255,255,255,0.15);
            color: white;
          }
          
          .email-input:focus {
            outline: none;
            border-color: #06b6d4;
            box-shadow: 0 0 0 3px rgba(6,182,212,0.1);
          }
          
          .email-input:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
          
          .update-email-btn {
            padding: 0.625rem 1.5rem;
            background: #f3f4f6;
            border: 1px solid #e5e7eb;
            border-radius: 40px;
            color: #374151;
            font-size: 0.875rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
            white-space: nowrap;
          }
          :global(.dark) .update-email-btn {
            background: rgba(255,255,255,0.08);
            border-color: rgba(255,255,255,0.15);
            color: rgba(255,255,255,0.7);
          }
          
          .update-email-btn:hover:not(:disabled) {
            background: #e5e7eb;
            border-color: #06b6d4;
            color: #06b6d4;
          }
          :global(.dark) .update-email-btn:hover:not(:disabled) {
            background: rgba(6,182,212,0.1);
            border-color: #06b6d4;
            color: #06b6d4;
          }
          
          .update-email-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
          
          .btn-spinner-small {
            display: inline-block;
            width: 14px;
            height: 14px;
            border: 2px solid rgba(255,255,255,0.3);
            border-top-color: #06b6d4;
            border-radius: 50%;
            animation: spin 0.6s linear infinite;
          }
          
          .email-note {
            font-size: 0.7rem;
            margin-top: 0.5rem;
            padding: 0.5rem;
            background: #fef3c7;
            border-radius: 8px;
            color: #92400e;
          }
          :global(.dark) .email-note {
            background: rgba(245, 158, 11, 0.1);
            color: #fbbf24;
          }
          
          .error-msg { 
            color: #ef4444; 
            font-size: 0.7rem; 
            margin-top: 0.5rem; 
          }
          
          .unsubscribe-btn { 
            width: 100%; 
            padding: 10px; 
            background: #fef2f2; 
            border: 1px solid #fecaca; 
            border-radius: 40px; 
            color: #dc2626; 
            font-size: 0.75rem; 
            cursor: pointer; 
            transition: all 0.2s; 
          }
          :global(.dark) .unsubscribe-btn { 
            background: rgba(239,68,68,0.1); 
            border: 1px solid rgba(239,68,68,0.3); 
            color: #ef4444; 
          }
          .unsubscribe-btn:hover:not(:disabled) { 
            background: #fee2e2; 
          }
          :global(.dark) .unsubscribe-btn:hover:not(:disabled) { 
            background: rgba(239,68,68,0.2); 
          }
          
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          
          @media (max-width: 640px) {
            .email-input-group {
              flex-direction: column;
            }
            .update-email-btn {
              width: 100%;
            }
          }
        `}</style>
      </div>
    )
  }

  // Subscription Form (for non-subscribed users)
  return (
    <>
      <div className={`newsletter-wrapper ${variant}`}>
        <div className="newsletter-inner">
          <div className="newsletter-header-section">
            <div className="newsletter-icon">📬</div>
            <div className="newsletter-text">
              <h3>
                {currentPageCategory 
                  ? `Get ${currentCategoryName} Updates` 
                  : 'Weekly Newsletter'}
              </h3>
              <p>
                {currentPageCategory 
                  ? `Subscribe for the latest ${currentCategoryName?.toLowerCase()} trends` 
                  : 'Get the week\'s best content, curated just for you'}
              </p>
              {!user && variant !== 'footer' && (
                <div className="auth-required-badge">
                  🔒 Sign in required to subscribe
                </div>
              )}
            </div>
          </div>

          <div className="newsletter-form-section">
            <div className="categories-section">
              <div className="categories-header">
                <span>Select topics</span>
                <button type="button" onClick={handleSelectAll} className="select-all-btn">
                  {selectedCategories.length === categories.length ? 'Deselect all' : 'Select all'}
                </button>
              </div>
              <div className="categories-grid">
                {categories.map((category) => (
                  <label key={category.id} className={`category-option ${selectedCategories.includes(category.id) ? 'selected' : ''} ${!user ? 'disabled-category' : ''}`}>
                    <input 
                      type="checkbox" 
                      checked={selectedCategories.includes(category.id)} 
                      onChange={() => handleCategoryToggle(category.id)} 
                      disabled={!user}
                    />
                    <span>{category.icon}</span>
                    <span>{category.name}</span>
                  </label>
                ))}
              </div>
              {selectedCategories.length > 0 && (
                <div className="posts-preview">
                  📬 {selectedCategories.length} post{selectedCategories.length !== 1 ? 's' : ''} every {deliveryDay}
                </div>
              )}
            </div>

            {error && <div className="error-message">{error}</div>}
            
            {!user ? (
              <button 
                onClick={() => {
                  setShowAuthPopup(true)
                  window.dispatchEvent(new CustomEvent('openAuth', { detail: 'signup' }))
                }}
                className="signup-required-button"
              >
                🔒 Sign up free to subscribe →
              </button>
            ) : (
              <button 
                type="submit" 
                onClick={handleSubscribe}
                className={`subscribe-button ${isHovered ? 'hovered' : ''}`}
                disabled={loading || cooldown || selectedCategories.length === 0}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                {loading ? (
                  <span className="btn-spinner"></span>
                ) : getButtonText()}
              </button>
            )}
            
            <p className="footer-note">
              Weekly on {deliveryDay} • Unsubscribe anytime
              {!user && " • Create a free account to subscribe"}
            </p>
          </div>
        </div>

        <style jsx>{`
          .newsletter-wrapper {
            background: ${variant === 'footer' ? '#f9fafb' : '#ffffff'};
            border-radius: ${variant === 'footer' ? '20px' : '28px'};
            padding: ${variant === 'footer' ? '1.5rem' : '2rem'};
            border: 1px solid #e5e7eb;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
          }
          :global(.dark) .newsletter-wrapper {
            background: ${variant === 'footer' ? 'rgba(255,255,255,0.03)' : 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)'};
            border: ${variant === 'footer' ? '1px solid rgba(255,255,255,0.08)' : 'none'};
          }
          .newsletter-inner { 
            display: ${variant === 'footer' ? 'block' : 'grid'};
            grid-template-columns: 1fr 1.2fr;
            gap: 2rem;
            align-items: start;
          }
          .newsletter-header-section { display: flex; gap: 1rem; margin-bottom: ${variant === 'footer' ? '1.5rem' : '0'}; }
          .newsletter-icon { font-size: 2rem; }
          .newsletter-text { flex: 1; }
          .newsletter-text h3 { font-size: 1.1rem; font-weight: 700; margin: 0 0 0.25rem 0; color: #111827; }
          :global(.dark) .newsletter-text h3 { color: white; }
          .newsletter-text p { font-size: 0.8rem; color: #6b7280; margin: 0; }
          :global(.dark) .newsletter-text p { color: rgba(255,255,255,0.6); }
          .auth-required-badge {
            display: inline-block;
            background: #fef3c7;
            padding: 0.3rem 0.8rem;
            border-radius: 40px;
            font-size: 0.7rem;
            color: #92400e;
            margin-top: 0.5rem;
          }
          :global(.dark) .auth-required-badge {
            background: rgba(245, 158, 11, 0.2);
            color: #fbbf24;
          }
          .categories-section { margin-bottom: 1rem; padding: 1rem; background: #f9fafb; border-radius: 16px; border: 1px solid #e5e7eb; }
          :global(.dark) .categories-section { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); }
          .categories-header { display: flex; justify-content: space-between; margin-bottom: 0.75rem; }
          .categories-header span { font-size: 0.7rem; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; }
          :global(.dark) .categories-header span { color: rgba(255,255,255,0.7); }
          .select-all-btn { background: none; border: none; color: #06b6d4; font-size: 0.65rem; cursor: pointer; }
          .categories-grid { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.75rem; }
          .category-option { display: flex; align-items: center; gap: 0.4rem; padding: 0.35rem 0.9rem; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 40px; cursor: pointer; font-size: 0.75rem; color: #374151; transition: all 0.2s; }
          :global(.dark) .category-option { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); color: white; }
          .category-option.selected { background: #eff6ff; border-color: #06b6d4; color: #1e40af; }
          :global(.dark) .category-option.selected { background: rgba(6,182,212,0.25); border-color: #06b6d4; color: white; }
          .category-option:hover:not(.disabled-category) { background: #f3f4f6; }
          :global(.dark) .category-option:hover:not(.disabled-category) { background: rgba(6,182,212,0.15); }
          .disabled-category {
            opacity: 0.5;
            cursor: not-allowed;
          }
          .category-option input { display: none; }
          .posts-preview { font-size: 0.65rem; color: #1e40af; background: #eff6ff; padding: 0.4rem; border-radius: 8px; text-align: center; }
          :global(.dark) .posts-preview { color: #06b6d4; background: rgba(6,182,212,0.08); }
          .subscribe-button { width: 100%; padding: 0.75rem; background: #06b6d4; border: none; border-radius: 40px; color: white; font-weight: 600; font-size: 0.875rem; cursor: pointer; transition: all 0.2s; position: relative; overflow: hidden; }
          .subscribe-button:hover:not(:disabled) { background: #0891b2; transform: translateY(-1px); box-shadow: 0 8px 20px -6px rgba(6,182,212,0.4); }
          .subscribe-button:disabled { opacity: 0.5; cursor: not-allowed; }
          .signup-required-button {
            width: 100%;
            padding: 0.75rem;
            background: #f3f4f6;
            border: 2px solid #e5e7eb;
            border-radius: 40px;
            color: #374151;
            font-weight: 600;
            font-size: 0.875rem;
            cursor: pointer;
            transition: all 0.2s;
          }
          .signup-required-button:hover {
            background: #e5e7eb;
            border-color: #06b6d4;
            color: #06b6d4;
          }
          :global(.dark) .signup-required-button {
            background: rgba(255,255,255,0.08);
            border-color: rgba(255,255,255,0.15);
            color: rgba(255,255,255,0.7);
          }
          :global(.dark) .signup-required-button:hover {
            background: rgba(6,182,212,0.1);
            border-color: #06b6d4;
            color: #06b6d4;
          }
          .btn-spinner { display: inline-block; width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.6s linear infinite; }
          @keyframes spin { to { transform: rotate(360deg); } }
          .error-message { color: #ef4444; font-size: 0.7rem; margin: 0.5rem 0; text-align: center; }
          .footer-note { font-size: 0.65rem; color: #9ca3af; margin-top: 0.75rem; text-align: center; }
          :global(.dark) .footer-note { color: rgba(255,255,255,0.35); }
          @media (max-width: 968px) { 
            .newsletter-inner { grid-template-columns: 1fr; gap: 1rem; }
            .newsletter-header-section { margin-bottom: 1rem; }
          }
        `}</style>
      </div>

      {/* Auth Popup for non-authenticated users */}
      {showAuthPopup && variant !== 'footer' && (
        <div className="auth-popup">
          <div className="auth-popup-content">
            <div className="popup-icon">📬</div>
            <h4>Create a free account</h4>
            <p>Subscribe to our weekly newsletter</p>
            <div className="popup-actions">
              <button onClick={openSignupFromPopup} className="signup-btn">Sign up free →</button>
              <button onClick={() => setShowAuthPopup(false)} className="later-btn">Later</button>
            </div>
            <button onClick={() => setShowAuthPopup(false)} className="close-btn">✕</button>
          </div>
          <style jsx>{`
            .auth-popup { position: fixed; bottom: 24px; right: 24px; z-index: 10000; animation: slideIn 0.3s ease; }
            @keyframes slideIn { from { opacity: 0; transform: translateX(100px); } to { opacity: 1; transform: translateX(0); } }
            .auth-popup-content { background: white; border-radius: 20px; padding: 20px; width: 280px; position: relative; box-shadow: 0 20px 35px -10px rgba(0,0,0,0.2); text-align: center; }
            .popup-icon { font-size: 2rem; margin-bottom: 12px; }
            .auth-popup-content h4 { margin: 0 0 8px; color: #0f172a; }
            .auth-popup-content p { margin: 0 0 20px; font-size: 0.8rem; color: #64748b; }
            .popup-actions { display: flex; gap: 10px; }
            .signup-btn { flex: 2; padding: 10px; background: #06b6d4; color: white; border: none; border-radius: 40px; cursor: pointer; font-weight: 500; }
            .later-btn { flex: 1; padding: 10px; background: #f1f5f9; border: none; border-radius: 40px; cursor: pointer; }
            .close-btn { position: absolute; top: 12px; right: 12px; background: #f1f5f9; border: none; width: 24px; height: 24px; border-radius: 50%; cursor: pointer; font-size: 12px; }
            :global(.dark) .auth-popup-content { background: #1e293b; }
            :global(.dark) .auth-popup-content h4 { color: white; }
            :global(.dark) .auth-popup-content p { color: #94a3b8; }
            :global(.dark) .later-btn { background: #334155; color: white; }
            :global(.dark) .close-btn { background: #334155; color: white; }
          `}</style>
        </div>
      )}
    </>
  )
}