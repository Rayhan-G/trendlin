// src/components/frontend/NewsletterSubscribe/components/SubscriptionForm.js
import { useEffect } from 'react'
import CategorySelector from './CategorySelector'
import styles from '../styles/newsletter.module.css'

const CATEGORIES = [
  { id: 'health', name: 'Health & Wellness', icon: '🌿', color: '#10b981' },
  { id: 'entertainment', name: 'Entertainment', icon: '🎬', color: '#f59e0b' },
  { id: 'growth', name: 'Personal Growth', icon: '🌱', color: '#8b5cf6' },
  { id: 'lifestyle', name: 'Lifestyle', icon: '✨', color: '#ec4899' },
  { id: 'tech', name: 'Technology', icon: '⚡', color: '#06b6d4' },
  { id: 'wealth', name: 'Wealth', icon: '💰', color: '#22c55e' },
  { id: 'world', name: 'World News', icon: '🌍', color: '#3b82f6' }
]

export default function SubscriptionForm({ state, dispatch, user, variant, onSubscribeSuccess }) {
  const deliveryDay = 'Sunday'
  const maxPostsPerWeek = state.selectedCategories.length

  const detectCurrentCategory = () => {
    if (typeof window === 'undefined') return null
    const path = window.location.pathname
    const matchedCategory = CATEGORIES.find(cat => 
      path.includes(`/category/${cat.id}`) || path.includes(`/${cat.id}`)
    )
    return matchedCategory ? matchedCategory.id : null
  }

  useEffect(() => {
    const currentCat = detectCurrentCategory()
    dispatch({ type: 'SET_CURRENT_PAGE_CATEGORY', payload: currentCat })
    
    if (!user && currentCat && state.selectedCategories.length === 0) {
      dispatch({ type: 'SET_SELECTED_CATEGORIES', payload: [currentCat] })
      dispatch({ type: 'SET_ORIGINAL_CATEGORIES', payload: [currentCat] })
    }
  }, [user])

  const handleSelectAll = () => {
    if (state.selectedCategories.length === CATEGORIES.length) {
      dispatch({ type: 'SET_SELECTED_CATEGORIES', payload: [] })
    } else {
      dispatch({ type: 'SET_SELECTED_CATEGORIES', payload: CATEGORIES.map(c => c.id) })
    }
    dispatch({ type: 'SET_ERROR', payload: '' })
  }

  const handleSubscribe = () => {
    if (!user) {
      dispatch({ type: 'SET_SHOW_AUTH_POPUP', payload: true })
      return
    }
    
    if (state.selectedCategories.length === 0) {
      dispatch({ type: 'SET_ERROR', payload: 'Please select at least one category' })
      return
    }

    dispatch({ 
      type: 'SET_PENDING_SUBSCRIPTION', 
      payload: {
        categories: [...state.selectedCategories],
        email: user.email,
        postCount: state.selectedCategories.length
      }
    })
    dispatch({ type: 'SET_SHOW_CONFIRM_MODAL', payload: true })
  }

  const currentCategoryName = state.currentPageCategory 
    ? CATEGORIES.find(c => c.id === state.currentPageCategory)?.name 
    : null

  const getButtonText = () => {
    if (state.loading) return 'Processing...'
    if (state.cooldown) return 'Please wait...'
    if (state.selectedCategories.length === 0) return 'Select categories first'
    return 'Review Subscription →'
  }

  return (
    <div className={`${styles.wrapper} ${styles[variant]}`}>
      <div className={styles.inner}>
        <div className={styles.headerSection}>
          <div className={styles.icon}>📬</div>
          <div className={styles.text}>
            <h3>
              {currentCategoryName 
                ? `Get ${currentCategoryName} Updates` 
                : 'Weekly Newsletter'}
            </h3>
            <p>
              {currentCategoryName 
                ? `Subscribe for the latest ${currentCategoryName?.toLowerCase()} trends` 
                : 'Get the week\'s best content, curated just for you'}
            </p>
            {!user && variant !== 'footer' && (
              <div className={styles.authBadge}>🔒 Sign in required to subscribe</div>
            )}
          </div>
        </div>

        <div className={styles.formSection}>
          <CategorySelector
            categories={CATEGORIES}
            selectedCategories={state.selectedCategories}
            onToggle={(categoryId) => dispatch({ type: 'TOGGLE_CATEGORY', payload: categoryId })}
            onSelectAll={handleSelectAll}
            disabled={!user}
            deliveryDay={deliveryDay}
            maxPostsPerWeek={maxPostsPerWeek}
          />

          {state.error && <div className={styles.errorMessage}>{state.error}</div>}
          
          {!user ? (
            <button 
              onClick={() => {
                dispatch({ type: 'SET_SHOW_AUTH_POPUP', payload: true })
                window.dispatchEvent(new CustomEvent('openAuth', { detail: 'signup' }))
              }}
              className={styles.signupButton}
            >
              🔒 Sign up free to subscribe →
            </button>
          ) : (
            <button 
              onClick={handleSubscribe}
              className={styles.subscribeButton}
              disabled={state.loading || state.cooldown || state.selectedCategories.length === 0}
            >
              {state.loading ? <span className={styles.spinner}></span> : getButtonText()}
            </button>
          )}
          
          <p className={styles.footerNote}>
            Weekly on {deliveryDay} • Unsubscribe anytime
            {!user && " • Create a free account to subscribe"}
          </p>
        </div>
      </div>
    </div>
  )
}