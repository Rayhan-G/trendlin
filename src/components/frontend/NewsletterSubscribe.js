import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function NewsletterSubscribe({ presetCategory = null, className = '' }) {
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

  const categories = [
    { id: 'health', name: 'Health & Wellness', icon: '🌿' },
    { id: 'entertainment', name: 'Entertainment', icon: '🎬' },
    { id: 'growth', name: 'Personal Growth', icon: '🌱' },
    { id: 'lifestyle', name: 'Lifestyle', icon: '✨' },
    { id: 'tech', name: 'Technology', icon: '⚡' },
    { id: 'wealth', name: 'Wealth', icon: '💰' },
    { id: 'world', name: 'World News', icon: '🌍' }
  ]

  const maxPostsPerWeek = selectedCategories.length
  const deliveryDay = 'Sunday'

  const detectCurrentCategory = () => {
    const path = window.location.pathname
    const matchedCategory = categories.find(cat => 
      path.includes(`/category/${cat.id}`) || path.includes(`/${cat.id}`)
    )
    return matchedCategory ? matchedCategory.id : null
  }

  // ============================================================
  // CHECK AUTHENTICATION AND SUBSCRIPTION STATUS
  // ============================================================
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me')
        const data = await res.json()
        
        console.log('Auth check result:', data)
        
        if (data.authenticated) {
          setUser(data.user)
          setNewEmail(data.user.email)
          
          // Check if user is subscribed to newsletter
          if (data.newsletter && data.newsletter.is_subscribed === true) {
            setSubscriptionStatus('subscribed')
            setSelectedCategories(data.newsletter.categories || [])
            setOriginalCategories(data.newsletter.categories || [])
          } else {
            setSubscriptionStatus(null)
            const currentCat = detectCurrentCategory()
            if (currentCat) {
              setSelectedCategories([currentCat])
              setOriginalCategories([currentCat])
            }
          }
        } else {
          setUser(null)
          setSubscriptionStatus(null)
          const currentCat = detectCurrentCategory()
          if (currentCat) {
            setSelectedCategories([currentCat])
            setOriginalCategories([currentCat])
          }
        }
      } catch (err) {
        console.error('Auth check failed:', err)
      } finally {
        setAuthChecked(true)
      }
    }
    
    checkAuth()
  }, [])

  // Detect current page category
  useEffect(() => {
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
    
    const originalPushState = history.pushState
    const originalReplaceState = history.replaceState
    
    history.pushState = function(...args) {
      originalPushState.apply(this, args)
      window.dispatchEvent(new Event('navigation'))
    }
    
    history.replaceState = function(...args) {
      originalReplaceState.apply(this, args)
      window.dispatchEvent(new Event('navigation'))
    }
    
    window.addEventListener('navigation', handleUrlChange)
    
    return () => {
      window.removeEventListener('popstate', handleUrlChange)
      window.removeEventListener('navigation', handleUrlChange)
      history.pushState = originalPushState
      history.replaceState = originalReplaceState
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
            }
          }
        })
        .catch(err => console.error('Auth refresh failed:', err))
    }

    window.addEventListener('authComplete', handleAuthComplete)
    return () => window.removeEventListener('authComplete', handleAuthComplete)
  }, [])

  // Auto-hide auth popup after 4 seconds
  useEffect(() => {
    if (showAuthPopup) {
      const timer = setTimeout(() => setShowAuthPopup(false), 4000)
      return () => clearTimeout(timer)
    }
  }, [showAuthPopup])

  // ============================================================
  // SUBSCRIPTION HANDLERS
  // ============================================================
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
    } catch (err) {
      console.error('Subscription error:', err)
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
      setPendingSubscription(null)
    }
  }

  // ============================================================
  // PREFERENCE MANAGEMENT
  // ============================================================
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
      alert('Preferences updated successfully!')
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
      alert('You have been unsubscribed.')
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
      alert('Email updated successfully!')
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
      <div className={`loading-placeholder ${className}`}>
        <div className="spinner"></div>
        <style jsx>{`
          .loading-placeholder {
            background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
            border-radius: 24px;
            padding: 2rem;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 200px;
          }
          .spinner {
            width: 40px;
            height: 40px;
            border: 3px solid rgba(255,255,255,0.2);
            border-top-color: #06b6d4;
            border-radius: 50%;
            animation: spin 0.6s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  // ============================================================
  // CONFIRMATION MODAL
  // ============================================================
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
            background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
            border-radius: 32px;
            max-width: 480px;
            width: 100%;
            padding: 2rem;
            position: relative;
            border: 1px solid rgba(255,255,255,0.1);
            box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
          }
          .confirm-modal-close {
            position: absolute;
            top: 20px;
            right: 20px;
            background: rgba(255,255,255,0.1);
            border: none;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            color: rgba(255,255,255,0.6);
            cursor: pointer;
            font-size: 14px;
            transition: all 0.2s;
          }
          .confirm-modal-close:hover { background: rgba(255,255,255,0.2); color: white; }
          .confirm-modal-icon { font-size: 48px; text-align: center; margin-bottom: 16px; }
          .confirm-modal-title { font-size: 1.5rem; font-weight: 700; text-align: center; color: white; margin: 0 0 24px 0; }
          .confirm-modal-summary { background: rgba(255,255,255,0.05); border-radius: 20px; padding: 1rem; margin-bottom: 20px; }
          .summary-item { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.08); }
          .summary-item:last-child { border-bottom: none; }
          .summary-label { font-size: 0.875rem; color: rgba(255,255,255,0.6); }
          .summary-value { font-size: 0.875rem; font-weight: 600; color: white; }
          .confirm-modal-categories { margin-bottom: 24px; }
          .categories-label { font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: rgba(255,255,255,0.5); margin-bottom: 12px; }
          .categories-list-confirm { display: flex; flex-wrap: wrap; gap: 8px; }
          .category-confirm-pill { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; background: rgba(6,182,212,0.15); border: 1px solid rgba(6,182,212,0.3); border-radius: 40px; font-size: 0.8rem; color: #06b6d4; }
          .confirm-modal-actions { display: flex; gap: 12px; margin-top: 8px; }
          .confirm-btn { flex: 2; padding: 12px; background: linear-gradient(135deg, #06b6d4, #0891b2); border: none; border-radius: 40px; color: white; font-weight: 600; font-size: 0.875rem; cursor: pointer; transition: all 0.2s; }
          .confirm-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 20px -5px rgba(6,182,212,0.3); }
          .confirm-btn:disabled { opacity: 0.5; cursor: not-allowed; }
          .cancel-btn-modal { flex: 1; padding: 12px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); border-radius: 40px; color: rgba(255,255,255,0.7); font-size: 0.875rem; cursor: pointer; transition: all 0.2s; }
          .cancel-btn-modal:hover { background: rgba(255,255,255,0.12); color: white; }
          .confirm-modal-note { font-size: 0.7rem; text-align: center; color: rgba(255,255,255,0.4); margin: 20px 0 0 0; }
          @media (max-width: 480px) { .confirm-modal { padding: 1.5rem; } .confirm-modal-title { font-size: 1.25rem; } .confirm-modal-actions { flex-direction: column; } }
        `}</style>
      </div>
    )
  }

  // ============================================================
  // SUCCESS MODAL
  // ============================================================
  if (showSuccessModal) {
    return (
      <div className="modal-overlay" onClick={() => setShowSuccessModal(false)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div style={{ fontSize: '48px', textAlign: 'center', marginBottom: '16px' }}>✅</div>
          <h3 style={{ textAlign: 'center', marginBottom: '12px', color: '#0f172a' }}>Successfully Subscribed!</h3>
          <p style={{ textAlign: 'center', color: '#64748b' }}>You'll now receive our weekly newsletter at:</p>
          <p style={{ textAlign: 'center', fontFamily: 'monospace', fontWeight: 'bold', color: '#06b6d4' }}>{user?.email}</p>
          <button onClick={() => setShowSuccessModal(false)} style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, #06b6d4, #0891b2)', color: 'white', border: 'none', borderRadius: '40px', marginTop: '16px', cursor: 'pointer', fontWeight: '600' }}>
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
          }
          :global(.dark) .modal-content { background: #1e293b; }
          :global(.dark) .modal-content h3 { color: white; }
          :global(.dark) .modal-content p { color: #94a3b8; }
        `}</style>
      </div>
    )
  }

  // ============================================================
  // MANAGEMENT VIEW (FOR SUBSCRIBED USERS)
  // ============================================================
  if (subscriptionStatus === 'subscribed' && user) {
    return (
      <div className={`manage-wrapper ${className}`}>
        <div className="manage-header">
          <div className="manage-header-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </div>
          <div>
            <h3 className="manage-title">Newsletter Settings</h3>
            <p className="manage-email">{user.email}</p>
          </div>
          <div className="manage-badge">
            <span className="badge-active">Subscribed</span>
          </div>
        </div>

        <div className="manage-card">
          <div className="card-header">
            <div className="card-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
              <h4>Your Categories</h4>
            </div>
            {!isEditing && (
              <button onClick={() => { setIsEditing(true); setSelectedCategories(originalCategories); }} className="edit-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
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
                        <span key={catId} className="category-pill">
                          <span className="pill-icon">{cat?.icon}</span>
                          <span>{cat?.name}</span>
                        </span>
                      )
                    })}
                  </div>
                  <div className="delivery-info">
                    <div className="info-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      <span>Weekly digest every {deliveryDay}</span>
                    </div>
                    <div className="info-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                      <span>{originalCategories.length} {originalCategories.length === 1 ? 'article' : 'articles'} per week</span>
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

        <div className="manage-card">
          <div className="card-header">
            <div className="card-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <h4>Email Address</h4>
            </div>
          </div>
          <div className="email-section">
            <div className="email-display">
              <span className="email-value">{user.email}</span>
            </div>
            <div className="email-edit-form">
              <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="New email address" className="email-input" />
              <button onClick={handleUpdateEmail} disabled={emailLoading} className="update-btn">
                {emailLoading ? 'Updating...' : 'Change Email'}
              </button>
            </div>
            {emailError && <p className="error-msg">{emailError}</p>}
          </div>
        </div>

        <div className="danger-card">
          <div className="card-header">
            <div className="card-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <circle cx="12" cy="16" r="0.5" fill="currentColor" stroke="none" />
              </svg>
              <h4 style={{ color: '#ef4444' }}>Unsubscribe</h4>
            </div>
          </div>
          <p className="danger-description">
            Unsubscribe from our newsletter. You will no longer receive weekly updates.
          </p>
          <button onClick={handleCancelSubscription} disabled={loading} className="unsubscribe-btn">
            Unsubscribe
          </button>
        </div>

        <style jsx>{`
          .manage-wrapper {
            background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
            border-radius: 32px;
            padding: 2rem;
          }
          .manage-header { display: flex; align-items: center; gap: 1rem; padding-bottom: 1.5rem; margin-bottom: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.1); }
          .manage-header-icon { width: 48px; height: 48px; background: rgba(6,182,212,0.15); border-radius: 16px; display: flex; align-items: center; justify-content: center; color: #06b6d4; }
          .manage-title { font-size: 1.25rem; font-weight: 600; color: white; margin: 0 0 4px 0; }
          .manage-email { font-size: 0.875rem; color: rgba(255,255,255,0.6); margin: 0; }
          .manage-badge { margin-left: auto; }
          .badge-active { background: rgba(34,197,94,0.15); color: #22c55e; padding: 4px 12px; border-radius: 40px; font-size: 0.75rem; font-weight: 500; }
          .manage-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 1.25rem; margin-bottom: 1rem; }
          .danger-card { background: rgba(239,68,68,0.05); border: 1px solid rgba(239,68,68,0.2); border-radius: 20px; padding: 1.25rem; margin-top: 1rem; }
          .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
          .card-title { display: flex; align-items: center; gap: 0.5rem; }
          .card-title svg { color: #06b6d4; }
          .card-title h4 { font-size: 0.875rem; font-weight: 600; color: white; margin: 0; text-transform: uppercase; letter-spacing: 0.5px; }
          .edit-btn { background: transparent; border: 1px solid rgba(6,182,212,0.3); color: #06b6d4; padding: 6px 14px; border-radius: 40px; font-size: 0.75rem; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: all 0.2s; }
          .edit-btn:hover { background: rgba(6,182,212,0.1); border-color: #06b6d4; }
          .categories-display { display: flex; flex-direction: column; gap: 1rem; }
          .categories-list { display: flex; flex-wrap: wrap; gap: 0.75rem; }
          .category-pill { display: inline-flex; align-items: center; gap: 8px; padding: 6px 14px; background: rgba(255,255,255,0.08); border-radius: 40px; font-size: 0.875rem; color: white; }
          .delivery-info { display: flex; gap: 1.5rem; flex-wrap: wrap; padding-top: 0.75rem; border-top: 1px solid rgba(255,255,255,0.08); }
          .info-item { display: flex; align-items: center; gap: 8px; font-size: 0.75rem; color: rgba(255,255,255,0.5); }
          .info-item svg { color: #06b6d4; }
          .empty-state { color: rgba(255,255,255,0.4); font-size: 0.875rem; margin: 0; }
          .edit-mode { margin-top: 0.5rem; }
          .categories-grid-edit { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 1.25rem; }
          .category-checkbox { display: flex; align-items: center; gap: 8px; padding: 8px 16px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 40px; cursor: pointer; transition: all 0.2s; }
          .category-checkbox.checked { background: rgba(6,182,212,0.2); border-color: #06b6d4; }
          .category-checkbox input { display: none; }
          .checkbox-icon { font-size: 1rem; }
          .checkbox-label { font-size: 0.875rem; color: white; }
          .edit-actions { display: flex; gap: 0.75rem; }
          .save-btn { padding: 8px 20px; background: #06b6d4; border: none; border-radius: 40px; color: white; font-weight: 500; font-size: 0.875rem; cursor: pointer; transition: all 0.2s; }
          .save-btn:hover:not(:disabled) { background: #0891b2; transform: translateY(-1px); }
          .cancel-btn { padding: 8px 20px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); border-radius: 40px; color: rgba(255,255,255,0.7); font-size: 0.875rem; cursor: pointer; }
          .email-section { display: flex; flex-direction: column; gap: 0.75rem; }
          .email-display { padding: 0.75rem; background: rgba(255,255,255,0.05); border-radius: 12px; }
          .email-value { font-family: monospace; font-size: 0.875rem; color: white; }
          .email-edit-form { display: flex; gap: 0.75rem; }
          .email-input { flex: 1; padding: 10px 16px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.1); border-radius: 40px; color: white; font-size: 0.875rem; }
          .email-input:focus { outline: none; border-color: #06b6d4; }
          .update-btn { padding: 10px 20px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.15); border-radius: 40px; color: white; font-size: 0.875rem; cursor: pointer; }
          .danger-description { font-size: 0.75rem; color: rgba(239,68,68,0.7); margin: 0 0 1rem 0; }
          .unsubscribe-btn { padding: 8px 20px; background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.3); border-radius: 40px; color: #ef4444; font-size: 0.875rem; cursor: pointer; }
          .error-msg { color: #ef4444; font-size: 0.75rem; margin-top: 0.75rem; }
          @media (max-width: 640px) {
            .manage-wrapper { padding: 1.25rem; }
            .manage-header { flex-wrap: wrap; }
            .manage-badge { margin-left: 0; }
            .email-edit-form { flex-direction: column; }
            .delivery-info { flex-direction: column; gap: 0.5rem; }
          }
        `}</style>
      </div>
    )
  }

  // ============================================================
  // SUBSCRIPTION FORM (FOR NON-SUBSCRIBED USERS)
  // ============================================================
  return (
    <>
      <div className={`newsletter-wrapper ${className}`}>
        <div className="newsletter-inner">
          <div className="newsletter-left">
            <div className="newsletter-icon">📬</div>
            <div className="newsletter-text">
              <h3 className="newsletter-title">
                {currentPageCategory 
                  ? `Subscribe for ${currentCategoryName} Updates` 
                  : 'Subscribe to Weekly Newsletter'}
              </h3>
              <p className="newsletter-description">
                Select your favorite categories below. You'll receive a weekly digest every {deliveryDay}.
              </p>
              {!user && (
                <div className="login-hint">
                  🔒 Sign in to subscribe - it's free!
                </div>
              )}
            </div>
          </div>

          <div className="newsletter-right">
            <form onSubmit={handleSubscribe}>
              <div className="categories-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span className="section-title">Select categories</span>
                  <button type="button" onClick={handleSelectAll} className="select-all">
                    {selectedCategories.length === categories.length ? 'Deselect all' : 'Select all'}
                  </button>
                </div>
                <div className="categories-grid">
                  {categories.map((category) => (
                    <label key={category.id} className={`category-option ${selectedCategories.includes(category.id) ? 'selected' : ''}`}>
                      <input type="checkbox" checked={selectedCategories.includes(category.id)} onChange={() => handleCategoryToggle(category.id)} style={{ display: 'none' }} />
                      <span>{category.icon}</span>
                      <span>{category.name}</span>
                    </label>
                  ))}
                </div>
                {selectedCategories.length > 0 && (
                  <div className="posts-info">
                    📬 You'll receive {selectedCategories.length} {selectedCategories.length === 1 ? 'post' : 'posts'} every {deliveryDay}
                  </div>
                )}
              </div>

              {error && <p className="error-msg">{error}</p>}
              <button type="submit" className="subscribe-button" disabled={loading || cooldown || selectedCategories.length === 0}>
                {getButtonText()}
              </button>
              <p className="footer-note">
                Weekly digest on {deliveryDay}s • Unsubscribe anytime
                {!user && " • Sign in to subscribe."}
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
          .newsletter-inner { max-width: 1280px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1.2fr; gap: 2rem; align-items: start; }
          .newsletter-left { display: flex; gap: 1rem; }
          .newsletter-icon { font-size: 2.5rem; }
          .newsletter-text { flex: 1; }
          .newsletter-title { font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem; color: white; }
          .newsletter-description { font-size: 0.875rem; color: rgba(255,255,255,0.7); margin-bottom: 0.5rem; }
          .login-hint { display: inline-block; background: rgba(6,182,212,0.2); padding: 0.3rem 0.8rem; border-radius: 40px; font-size: 0.7rem; color: #06b6d4; }
          .newsletter-right { width: 100%; }
          .categories-section { margin-bottom: 1.25rem; padding: 1rem; background: rgba(255,255,255,0.05); border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); }
          .section-title { font-size: 0.8rem; font-weight: 600; color: rgba(255,255,255,0.8); }
          .select-all { background: none; border: none; color: #06b6d4; font-size: 0.7rem; cursor: pointer; }
          .categories-grid { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.75rem; }
          .category-option { display: flex; align-items: center; gap: 0.4rem; padding: 0.4rem 1rem; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 40px; cursor: pointer; font-size: 0.8rem; color: white; }
          .category-option.selected { background: rgba(6,182,212,0.3); border-color: #06b6d4; }
          .posts-info { font-size: 0.7rem; color: #06b6d4; background: rgba(6,182,212,0.1); padding: 0.5rem; border-radius: 8px; text-align: center; }
          .subscribe-button { width: 100%; padding: 0.875rem; background: linear-gradient(135deg, #06b6d4, #0891b2); border: none; border-radius: 40px; color: white; font-weight: 700; font-size: 1rem; cursor: pointer; transition: all 0.2s; }
          .subscribe-button:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 20px -5px rgba(6,182,212,0.3); }
          .subscribe-button:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
          .error-msg { color: #ef4444; font-size: 0.75rem; margin: 0.75rem 0; text-align: center; }
          .footer-note { font-size: 0.7rem; color: rgba(255,255,255,0.4); margin-top: 1rem; text-align: center; }
          @media (max-width: 968px) { 
            .newsletter-inner { grid-template-columns: 1fr; gap: 1.5rem; } 
            .newsletter-left { text-align: center; flex-direction: column; align-items: center; }
          }
        `}</style>
      </div>

      {showAuthPopup && (
        <div className="auth-popup">
          <div className="auth-popup-content">
            <div style={{ fontSize: '2rem', textAlign: 'center', marginBottom: '12px' }}>📬</div>
            <h4 style={{ margin: '0 0 8px', textAlign: 'center', color: '#0f172a' }}>Create a free account</h4>
            <p style={{ margin: '0 0 20px', textAlign: 'center', fontSize: '0.8rem', color: '#64748b' }}>
              Subscribe to our weekly newsletter
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={openSignupFromPopup} style={{ flex: 2, padding: '10px', background: '#06b6d4', color: 'white', border: 'none', borderRadius: '40px', cursor: 'pointer', fontWeight: '500' }}>
                Sign up free →
              </button>
              <button onClick={() => setShowAuthPopup(false)} style={{ flex: 1, padding: '10px', background: '#f1f5f9', border: 'none', borderRadius: '40px', cursor: 'pointer' }}>
                Later
              </button>
            </div>
            <button onClick={() => setShowAuthPopup(false)} style={{ position: 'absolute', top: '8px', right: '8px', background: '#f1f5f9', border: 'none', width: '24px', height: '24px', borderRadius: '50%', cursor: 'pointer' }}>
              ✕
            </button>
          </div>
          <style jsx>{`
            .auth-popup { position: fixed; bottom: 24px; right: 24px; z-index: 10000; animation: slideIn 0.3s ease; }
            .auth-popup-content { background: white; border-radius: 20px; padding: 20px; width: 280px; position: relative; box-shadow: 0 20px 35px -10px rgba(0,0,0,0.2); }
            @keyframes slideIn { from { opacity: 0; transform: translateX(100px); } to { opacity: 1; transform: translateX(0); } }
            :global(.dark) .auth-popup-content { background: #1e293b; }
            :global(.dark) .auth-popup-content h4 { color: white; }
            :global(.dark) .auth-popup-content p { color: #94a3b8; }
          `}</style>
        </div>
      )}
    </>
  )
}