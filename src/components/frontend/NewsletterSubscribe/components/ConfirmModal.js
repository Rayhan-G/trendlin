// src/components/frontend/NewsletterSubscribe/components/ConfirmModal.js
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

export default function ConfirmModal({ state, dispatch, onConfirm }) {
  const deliveryDay = 'Sunday'
  const pendingSubscription = state.pendingSubscription
  
  if (!pendingSubscription) return null
  
  const categoriesList = CATEGORIES.filter(cat => 
    pendingSubscription.categories.includes(cat.id)
  )

  const handleConfirm = async () => {
    dispatch({ type: 'SET_LOADING', payload: true })
    dispatch({ type: 'SET_SHOW_CONFIRM_MODAL', payload: false })
    
    try {
      // Call the onConfirm callback which should handle the actual subscription
      await onConfirm(pendingSubscription)
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message })
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  return (
    <div className={styles.confirmModalOverlay} onClick={() => dispatch({ type: 'SET_SHOW_CONFIRM_MODAL', payload: false })}>
      <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
        <button 
          className={styles.confirmModalClose} 
          onClick={() => dispatch({ type: 'SET_SHOW_CONFIRM_MODAL', payload: false })}
        >
          ✕
        </button>
        
        <div className={styles.confirmModalIcon}>📬</div>
        <h3 className={styles.confirmModalTitle}>Confirm Your Subscription</h3>
        
        <div className={styles.confirmModalSummary}>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>📧 Email</span>
            <span className={styles.summaryValue}>{pendingSubscription.email}</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>📅 Delivery Day</span>
            <span className={styles.summaryValue}>Every {deliveryDay}</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>📬 Posts per week</span>
            <span className={styles.summaryValue}>
              {pendingSubscription.postCount} {pendingSubscription.postCount === 1 ? 'post' : 'posts'}
            </span>
          </div>
        </div>
        
        <div className={styles.confirmModalCategories}>
          <div className={styles.categoriesLabel}>Selected Categories:</div>
          <div className={styles.categoriesListConfirm}>
            {categoriesList.map(cat => (
              <span key={cat.id} className={styles.categoryConfirmPill}>
                {cat.icon} {cat.name}
              </span>
            ))}
          </div>
        </div>
        
        <div className={styles.confirmModalActions}>
          <button 
            onClick={handleConfirm} 
            className={styles.confirmBtn} 
            disabled={state.loading}
          >
            {state.loading ? 'Subscribing...' : '✓ Confirm Subscription'}
          </button>
          <button 
            onClick={() => dispatch({ type: 'SET_SHOW_CONFIRM_MODAL', payload: false })} 
            className={styles.cancelBtnModal}
          >
            Cancel
          </button>
        </div>
        <p className={styles.confirmModalNote}>You can unsubscribe or change preferences at any time.</p>
      </div>
    </div>
  )
}