// src/components/frontend/NewsletterSubscribe.js

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

  // Function to detect current category from URL
  const detectCurrentCategory = () => {
    const path = window.location.pathname
    const matchedCategory = categories.find(cat => 
      path.includes(`/category/${cat.id}`) || path.includes(`/${cat.id}`)
    )
    return matchedCategory ? matchedCategory.id : null
  }

  // Reset selected categories based on current page and user subscription
  const resetCategoriesForPage = (currentCat, userSubscribed, existingPrefs = null) => {
    // If user is already subscribed, use their saved preferences
    if (userSubscribed && existingPrefs) {
      setSelectedCategories(existingPrefs)
      setOriginalCategories(existingPrefs)
      return
    }
    
    // If on a category page, preselect that category only (not subscribed yet)
    if (currentCat) {
      setSelectedCategories([currentCat])
      setOriginalCategories([currentCat])
    } else {
      // On homepage, no categories preselected
      setSelectedCategories([])
      setOriginalCategories([])
    }
  }

  // Detect current page category and reset selections when URL changes
  useEffect(() => {
    const handleUrlChange = () => {
      const newCategory = detectCurrentCategory()
      setCurrentPageCategory(newCategory)
      
      // Reset categories based on new page
      if (subscriptionStatus === 'subscribed' && user) {
        // User is subscribed, keep their preferences
        // Don't reset to page category
      } else {
        // User not subscribed, reset based on page
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

    // Listen for navigation changes
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

  // Check authentication status
  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated) {
          setUser(data.user)
          setNewEmail(data.user.email)
          if (data.newsletter && data.newsletter.is_subscribed) {
            setSubscriptionStatus('subscribed')
            setSelectedCategories(data.newsletter.categories || [])
            setOriginalCategories(data.newsletter.categories || [])
          } else {
            // Not subscribed - preset based on current page
            const currentCat = detectCurrentCategory()
            if (currentCat) {
              setSelectedCategories([currentCat])
              setOriginalCategories([currentCat])
            }
          }
        } else {
          // Not logged in - preset based on current page
          const currentCat = detectCurrentCategory()
          if (currentCat) {
            setSelectedCategories([currentCat])
            setOriginalCategories([currentCat])
          }
        }
        setAuthChecked(true)
      })
      .catch(err => {
        console.error('Auth check failed:', err)
        setAuthChecked(true)
      })
  }, [])

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

  const handleSubscribe = async (e) => {
    e.preventDefault()
    
    if (!user) {
      setShowAuthPopup(true)
      return
    }
    
    if (cooldown) {
      setError('Please wait a moment before trying again.')
      return
    }
    
    if (selectedCategories.length === 0) {
      setError('Please select at least one category')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Check if user already has newsletter preferences
      const { data: existingPrefs } = await supabase
        .from('newsletter_preferences')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()

      let result
      if (existingPrefs) {
        // Update existing
        result = await supabase
          .from('newsletter_preferences')
          .update({
            is_subscribed: true,
            categories: selectedCategories,
            delivery_frequency: 'weekly',
            max_posts_per_week: maxPostsPerWeek,
            post_format: 'digest',
            subscribed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
      } else {
        // Insert new
        result = await supabase
          .from('newsletter_preferences')
          .insert({
            user_id: user.id,
            is_subscribed: true,
            categories: selectedCategories,
            delivery_frequency: 'weekly',
            max_posts_per_week: maxPostsPerWeek,
            post_format: 'digest',
            subscribed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
      }

      if (result.error) throw result.error

      setSubscriptionStatus('subscribed')
      setOriginalCategories(selectedCategories)
      setShowSuccessModal(true)
      setCooldown(true)
      setTimeout(() => setCooldown(false), 30000)
    } catch (err) {
      console.error('Subscription error:', err)
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
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
          max_posts_per_week: maxPostsPerWeek,
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
    if (loading) return 'Saving...'
    if (cooldown) return 'Please wait...'
    return 'Subscribe →'
  }

  const openSignupFromPopup = () => {
    setShowAuthPopup(false)
    window.dispatchEvent(new CustomEvent('openAuth', { detail: 'signup' }))
  }

  const currentCategoryName = currentPageCategory 
    ? categories.find(c => c.id === currentPageCategory)?.name 
    : null

  // Show loading while checking auth
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

  // Show success modal
  if (showSuccessModal) {
    return (
      <div className="modal-overlay" onClick={() => setShowSuccessModal(false)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div style={{ fontSize: '48px', textAlign: 'center', marginBottom: '16px' }}>✅</div>
          <h3 style={{ textAlign: 'center', marginBottom: '12px' }}>Successfully Subscribed!</h3>
          <p style={{ textAlign: 'center' }}>You'll now receive our weekly newsletter at:</p>
          <p style={{ textAlign: 'center', fontWeight: 'bold' }}>{user?.email}</p>
          <button
            onClick={() => setShowSuccessModal(false)}
            style={{
              width: '100%',
              padding: '12px',
              background: '#06b6d4',
              color: 'white',
              border: 'none',
              borderRadius: '40px',
              marginTop: '16px',
              cursor: 'pointer'
            }}
          >
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
        `}</style>
      </div>
    )
  }

  // Show MANAGE SUBSCRIPTION view (after subscribed)
  if (subscriptionStatus === 'subscribed' && user) {
    return (
      <div className={`manage-wrapper ${className}`}>
        <div className="manage-header">
          <div className="manage-icon">📬</div>
          <h3 className="manage-title">Your Newsletter Subscription</h3>
          <p className="manage-email">{user.email}</p>
        </div>

        <div className="manage-section">
          <div className="section-header">
            <h4>📌 Selected Categories</h4>
            {!isEditing && (
              <button onClick={() => { setIsEditing(true); setSelectedCategories(originalCategories); }} className="edit-btn">
                Edit
              </button>
            )}
          </div>
          
          {!isEditing ? (
            <div className="categories-list">
              {originalCategories.length > 0 ? (
                originalCategories.map(catId => {
                  const cat = categories.find(c => c.id === catId)
                  return (
                    <span key={catId} className="category-tag">
                      {cat?.icon} {cat?.name}
                    </span>
                  )
                })
              ) : (
                <p className="no-categories">No categories selected</p>
              )}
              <div className="posts-info-display">
                📬 You receive {originalCategories.length} {originalCategories.length === 1 ? 'post' : 'posts'} per week
              </div>
            </div>
          ) : (
            <div className="edit-categories">
              <div className="categories-grid">
                {categories.map((category) => (
                  <label 
                    key={category.id} 
                    className={`category-option ${selectedCategories.includes(category.id) ? 'selected' : ''}`}
                  >
                    <input 
                      type="checkbox" 
                      checked={selectedCategories.includes(category.id)} 
                      onChange={() => handleCategoryToggle(category.id)} 
                      style={{ display: 'none' }}
                    />
                    <span>{category.icon}</span>
                    <span>{category.name}</span>
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

        <div className="manage-section">
          <h4>✉️ Email Address</h4>
          <div className="email-edit">
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="email-input"
            />
            <button onClick={handleUpdateEmail} disabled={emailLoading} className="update-email-btn">
              {emailLoading ? 'Updating...' : 'Update Email'}
            </button>
          </div>
          {emailError && <p className="error-msg">{emailError}</p>}
        </div>

        <div className="manage-section cancel-section">
          <button onClick={handleCancelSubscription} disabled={loading} className="cancel-subscription-btn">
            Cancel Subscription
          </button>
          <p className="cancel-note">You will no longer receive our newsletter.</p>
        </div>

        <style jsx>{`
          .manage-wrapper {
            background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
            border-radius: 24px;
            padding: 2rem;
          }
          .manage-header {
            text-align: center;
            margin-bottom: 2rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid rgba(255,255,255,0.1);
          }
          .manage-icon { font-size: 3rem; margin-bottom: 0.5rem; }
          .manage-title { color: white; font-size: 1.5rem; margin-bottom: 0.5rem; }
          .manage-email { color: rgba(255,255,255,0.6); font-size: 0.9rem; }
          .manage-section {
            background: rgba(255,255,255,0.05);
            border-radius: 16px;
            padding: 1.25rem;
            margin-bottom: 1rem;
            border: 1px solid rgba(255,255,255,0.1);
          }
          .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
          }
          .section-header h4 { color: white; margin: 0; }
          .edit-btn {
            background: rgba(6,182,212,0.2);
            border: 1px solid #06b6d4;
            color: #06b6d4;
            padding: 4px 12px;
            border-radius: 20px;
            cursor: pointer;
            font-size: 0.75rem;
          }
          .edit-btn:hover { background: rgba(6,182,212,0.3); }
          .categories-list { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; }
          .category-tag {
            background: rgba(6,182,212,0.2);
            border: 1px solid rgba(6,182,212,0.3);
            padding: 0.3rem 0.8rem;
            border-radius: 40px;
            font-size: 0.8rem;
            color: white;
          }
          .posts-info-display {
            font-size: 0.7rem;
            color: #06b6d4;
            background: rgba(6,182,212,0.1);
            padding: 0.3rem 0.8rem;
            border-radius: 20px;
            margin-left: 0.5rem;
          }
          .no-categories { color: rgba(255,255,255,0.5); margin: 0; }
          .edit-categories { margin-top: 0.5rem; }
          .categories-grid { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem; }
          .category-option {
            display: flex;
            align-items: center;
            gap: 0.4rem;
            padding: 0.4rem 1rem;
            background: rgba(255,255,255,0.1);
            border: 1px solid rgba(255,255,255,0.2);
            border-radius: 40px;
            cursor: pointer;
            font-size: 0.8rem;
            color: white;
          }
          .category-option.selected { background: rgba(6,182,212,0.3); border-color: #06b6d4; }
          .edit-actions { display: flex; gap: 0.5rem; }
          .save-btn {
            padding: 0.5rem 1.5rem;
            background: #06b6d4;
            border: none;
            border-radius: 40px;
            color: white;
            cursor: pointer;
          }
          .cancel-btn {
            padding: 0.5rem 1.5rem;
            background: rgba(255,255,255,0.1);
            border: 1px solid rgba(255,255,255,0.2);
            border-radius: 40px;
            color: white;
            cursor: pointer;
          }
          .email-edit { display: flex; gap: 0.5rem; }
          .email-input {
            flex: 1;
            padding: 0.6rem 1rem;
            background: rgba(255,255,255,0.1);
            border: 1px solid rgba(255,255,255,0.2);
            border-radius: 40px;
            color: white;
          }
          .email-input:focus { outline: none; border-color: #06b6d4; }
          .update-email-btn {
            padding: 0.5rem 1.5rem;
            background: rgba(6,182,212,0.2);
            border: 1px solid #06b6d4;
            border-radius: 40px;
            color: #06b6d4;
            cursor: pointer;
          }
          .cancel-section { text-align: center; border-color: rgba(239,68,68,0.3); }
          .cancel-subscription-btn {
            padding: 0.6rem 1.5rem;
            background: rgba(239,68,68,0.2);
            border: 1px solid #ef4444;
            border-radius: 40px;
            color: #ef4444;
            cursor: pointer;
            font-size: 0.9rem;
          }
          .cancel-subscription-btn:hover { background: rgba(239,68,68,0.3); }
          .cancel-note { font-size: 0.7rem; color: rgba(255,255,255,0.4); margin-top: 0.5rem; }
          .error-msg { color: #ef4444; font-size: 0.75rem; margin-top: 0.5rem; text-align: center; }
        `}</style>
      </div>
    )
  }

  // Main SUBSCRIBE form (not subscribed yet)
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
                Select your favorite categories below. You'll receive a weekly digest.
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
                    <label 
                      key={category.id} 
                      className={`category-option ${selectedCategories.includes(category.id) ? 'selected' : ''}`}
                    >
                      <input 
                        type="checkbox" 
                        checked={selectedCategories.includes(category.id)} 
                        onChange={() => handleCategoryToggle(category.id)} 
                        style={{ display: 'none' }}
                      />
                      <span>{category.icon}</span>
                      <span>{category.name}</span>
                    </label>
                  ))}
                </div>
                {selectedCategories.length > 0 && (
                  <div className="posts-info">
                    📬 You'll receive {selectedCategories.length} {selectedCategories.length === 1 ? 'post' : 'posts'} per week
                  </div>
                )}
              </div>

              {error && <p className="error-msg">{error}</p>}
              <button type="submit" className="subscribe-button" disabled={loading || cooldown}>
                {getButtonText()}
              </button>
              <p className="footer-note">
                Weekly digest • Unsubscribe anytime
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
          .newsletter-inner {
            max-width: 1280px;
            margin: 0 auto;
            display: grid;
            grid-template-columns: 1fr 1.2fr;
            gap: 2rem;
            align-items: start;
          }
          .newsletter-left { display: flex; gap: 1rem; }
          .newsletter-icon { font-size: 2.5rem; }
          .newsletter-text { flex: 1; }
          .newsletter-title { font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem; color: white; }
          .newsletter-description { font-size: 0.875rem; color: rgba(255,255,255,0.7); margin-bottom: 0.5rem; }
          .login-hint {
            display: inline-block;
            background: rgba(6, 182, 212, 0.2);
            padding: 0.3rem 0.8rem;
            border-radius: 40px;
            font-size: 0.7rem;
            color: #06b6d4;
          }
          .newsletter-right { width: 100%; }
          .categories-section { 
            margin-bottom: 1.25rem; 
            padding: 1rem; 
            background: rgba(255,255,255,0.05); 
            border-radius: 16px; 
            border: 1px solid rgba(255,255,255,0.1); 
          }
          .section-title { font-size: 0.8rem; font-weight: 600; color: rgba(255,255,255,0.8); }
          .select-all { background: none; border: none; color: #06b6d4; font-size: 0.7rem; cursor: pointer; }
          .categories-grid { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.75rem; }
          .category-option { 
            display: flex; 
            align-items: center; 
            gap: 0.4rem; 
            padding: 0.4rem 1rem; 
            background: rgba(255,255,255,0.1); 
            border: 1px solid rgba(255,255,255,0.2); 
            border-radius: 40px; 
            cursor: pointer; 
            font-size: 0.8rem; 
            color: white; 
          }
          .category-option.selected { background: rgba(6,182,212,0.3); border-color: #06b6d4; }
          .posts-info {
            font-size: 0.7rem;
            color: #06b6d4;
            background: rgba(6,182,212,0.1);
            padding: 0.5rem;
            border-radius: 8px;
            text-align: center;
          }
          .subscribe-button { 
            width: 100%; 
            padding: 0.875rem; 
            background: linear-gradient(135deg, #06b6d4, #0891b2); 
            border: none; 
            border-radius: 40px; 
            color: white; 
            font-weight: 700; 
            font-size: 1rem; 
            cursor: pointer; 
          }
          .subscribe-button:hover:not(:disabled) { transform: translateY(-2px); }
          .subscribe-button:disabled { opacity: 0.5; cursor: not-allowed; }
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
            <h4 style={{ margin: '0 0 8px', textAlign: 'center' }}>Create a free account</h4>
            <p style={{ margin: '0 0 20px', textAlign: 'center', fontSize: '0.8rem', color: '#64748b' }}>
              Subscribe to our weekly newsletter
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={openSignupFromPopup} style={{ flex: 2, padding: '10px', background: '#06b6d4', color: 'white', border: 'none', borderRadius: '40px', cursor: 'pointer' }}>
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
            .auth-popup {
              position: fixed;
              bottom: 24px;
              right: 24px;
              z-index: 10000;
              animation: slideIn 0.3s ease;
            }
            .auth-popup-content {
              background: white;
              border-radius: 20px;
              padding: 20px;
              width: 280px;
              position: relative;
              box-shadow: 0 20px 35px -10px rgba(0,0,0,0.2);
            }
            @keyframes slideIn {
              from { opacity: 0; transform: translateX(100px); }
              to { opacity: 1; transform: translateX(0); }
            }
            :global(.dark) .auth-popup-content {
              background: #1e293b;
            }
            :global(.dark) .auth-popup-content h4 {
              color: white;
            }
            :global(.dark) .auth-popup-content p {
              color: #94a3b8;
            }
          `}</style>
        </div>
      )}
    </>
  )
}