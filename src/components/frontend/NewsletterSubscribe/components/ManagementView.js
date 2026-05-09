// src/components/frontend/NewsletterSubscribe/components/ManagementView.js
import { useState } from 'react'
import CategorySelector from './CategorySelector'
import EmailManager from './EmailManager'
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

export default function ManagementView({ state, dispatch, user, variant, onUnsubscribe, onRefresh }) {
  const [isEditing, setIsEditing] = useState(false)
  const deliveryDay = 'Sunday'

  const handleUpdatePreferences = async () => {
    if (state.selectedCategories.length === 0) {
      dispatch({ type: 'SET_ERROR', payload: 'Please select at least one category' })
      return
    }

    dispatch({ type: 'SET_LOADING', payload: true })
    dispatch({ type: 'SET_ERROR', payload: '' })

    try {
      const response = await fetch('/api/newsletter/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: user.id, 
          categories: state.selectedCategories 
        })
      })

      if (!response.ok) throw new Error('Failed to update preferences')

      dispatch({ type: 'SET_ORIGINAL_CATEGORIES', payload: state.selectedCategories })
      setIsEditing(false)
      
      window.dispatchEvent(new CustomEvent('showToast', { 
        detail: { message: 'Preferences updated successfully!', type: 'success' }
      }))
      
      await onRefresh()
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const deliveryInfo = () => {
    const postCount = state.originalCategories.length
    return `${postCount} ${postCount === 1 ? 'article' : 'articles'}/week on ${deliveryDay}`
  }

  return (
    <div className={`${styles.manageWrapper} ${styles[variant]}`}>
      <div className={styles.manageHeader}>
        <div className={styles.headerIcon}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        </div>
        <div className={styles.headerInfo}>
          <h3>Newsletter Active</h3>
          <p>Account: {state.accountEmail}</p>
        </div>
        <div className={styles.badge}>
          <span className={styles.badgeActive}>✓ Subscribed</span>
        </div>
      </div>

      {/* Categories Card */}
      <div className={styles.manageCard}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitle}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
            <h4>Your Categories</h4>
          </div>
          {!isEditing && (
            <button 
              onClick={() => {
                setIsEditing(true)
                dispatch({ type: 'SET_SELECTED_CATEGORIES', payload: state.originalCategories })
              }} 
              className={styles.editBtn}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M17 3l4 4-7 7H10v-4l7-7z" />
                <path d="M4 20h16" />
              </svg>
              Edit
            </button>
          )}
        </div>
        
        {!isEditing ? (
          <div className={styles.categoriesDisplay}>
            <div className={styles.categoriesList}>
              {state.originalCategories.map(catId => {
                const cat = CATEGORIES.find(c => c.id === catId)
                return (
                  <span key={catId} className={styles.categoryPill} style={{ borderColor: cat?.color + '40', backgroundColor: cat?.color + '10' }}>
                    <span className={styles.pillIcon}>{cat?.icon}</span>
                    <span>{cat?.name}</span>
                  </span>
                )
              })}
            </div>
            <div className={styles.deliveryInfo}>
              <div className={styles.infoItem}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span>Weekly on {deliveryDay}</span>
              </div>
              <div className={styles.infoItem}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <span>{deliveryInfo()}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.editMode}>
            <CategorySelector
              categories={CATEGORIES}
              selectedCategories={state.selectedCategories}
              onToggle={(categoryId) => dispatch({ type: 'TOGGLE_CATEGORY', payload: categoryId })}
              disabled={false}
              deliveryDay={deliveryDay}
              maxPostsPerWeek={state.selectedCategories.length}
              isCompact
            />
            <div className={styles.editActions}>
              <button 
                onClick={handleUpdatePreferences} 
                disabled={state.loading} 
                className={styles.saveBtn}
              >
                {state.loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button 
                onClick={() => { 
                  setIsEditing(false)
                  dispatch({ type: 'SET_SELECTED_CATEGORIES', payload: state.originalCategories })
                }} 
                className={styles.cancelBtn}
              >
                Cancel
              </button>
            </div>
            {state.error && <p className={styles.errorMsg}>{state.error}</p>}
          </div>
        )}
      </div>

      {/* Email Management */}
      <EmailManager state={state} dispatch={dispatch} userId={user?.id} />

      {/* Unsubscribe Button */}
      <button onClick={onUnsubscribe} disabled={state.loading} className={styles.unsubscribeBtn}>
        Unsubscribe
      </button>
    </div>
  )
}