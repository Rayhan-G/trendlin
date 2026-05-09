// src/components/frontend/NewsletterSubscribe/index.js
import { useReducer, useEffect, useCallback, useRef, useState } from 'react'
import { useSubscription } from '../../../hooks/useSubscription'
import { newsletterReducer, initialState } from './utils/newsletterReducer'
import { useNewsletterAuth } from './hooks/useNewsletterAuth'
import SubscriptionForm from './components/SubscriptionForm'
import ManagementView from './components/ManagementView'
import ConfirmModal from './components/ConfirmModal'
import SuccessModal from './components/SuccessModal'
import LoadingSkeleton from './components/LoadingSkeleton'
import AuthPopup from './components/AuthPopup'

export default function NewsletterSubscribe({ variant = 'default', onSubscriptionChange }) {
  const [mounted, setMounted] = useState(false)
  const [state, dispatch] = useReducer(newsletterReducer, initialState)
  const { refresh: refreshGlobal } = useSubscription()
  const onSubscriptionChangeRef = useRef(onSubscriptionChange)
  
  // Set mounted after initial render to prevent SSR mismatch
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Update ref when callback changes
  useEffect(() => {
    onSubscriptionChangeRef.current = onSubscriptionChange
  }, [onSubscriptionChange])

  const {
    user,
    subscriptionStatus,
    authChecked,
    handleAuthComplete,
    refreshSubscription
  } = useNewsletterAuth({ dispatch, onSubscriptionChange: onSubscriptionChangeRef })

  // Handle subscription success
  const handleSubscriptionSuccess = useCallback(async (subscriptionData) => {
    dispatch({ type: 'SET_SUBSCRIPTION_STATUS', payload: 'subscribed' })
    dispatch({ type: 'SET_SELECTED_CATEGORIES', payload: subscriptionData.categories })
    dispatch({ type: 'SET_ORIGINAL_CATEGORIES', payload: subscriptionData.categories })
    dispatch({ type: 'SET_NEWSLETTER_EMAIL', payload: subscriptionData.email })
    dispatch({ type: 'SET_SHOW_SUCCESS_MODAL', payload: true })
    
    // Small cooldown to prevent spam
    dispatch({ type: 'SET_COOLDOWN', payload: true })
    setTimeout(() => dispatch({ type: 'SET_COOLDOWN', payload: false }), 30000)
    
    await refreshGlobal()
    
    if (onSubscriptionChangeRef.current) {
      onSubscriptionChangeRef.current(true)
    }
    
    window.dispatchEvent(new CustomEvent('showToast', { 
      detail: { message: 'Successfully subscribed to newsletter!', type: 'success' }
    }))
  }, [refreshGlobal])

  // Handle unsubscribe
  const handleUnsubscribe = useCallback(async () => {
    if (!confirm('Are you sure you want to unsubscribe? You will no longer receive our newsletter.')) {
      return
    }

    dispatch({ type: 'SET_LOADING', payload: true })

    try {
      const response = await fetch('/api/newsletter/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id })
      })

      if (!response.ok) throw new Error('Failed to unsubscribe')

      dispatch({ type: 'SET_SUBSCRIPTION_STATUS', payload: null })
      dispatch({ type: 'SET_SELECTED_CATEGORIES', payload: [] })
      dispatch({ type: 'SET_ORIGINAL_CATEGORIES', payload: [] })
      
      await refreshGlobal()
      
      if (onSubscriptionChangeRef.current) {
        onSubscriptionChangeRef.current(false)
      }
      
      window.dispatchEvent(new CustomEvent('showToast', { 
        detail: { message: 'You have been unsubscribed.', type: 'info' }
      }))
    } catch (error) {
      console.error('Unsubscribe error:', error)
      dispatch({ type: 'SET_ERROR', payload: error.message })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [user, refreshGlobal])

  // Don't render anything during SSR to prevent auth issues
  if (!mounted) {
    return <LoadingSkeleton variant={variant} />
  }
  
  // Loading state
  if (!authChecked) {
    return <LoadingSkeleton variant={variant} />
  }

  // Subscribed user view
  if (subscriptionStatus === 'subscribed' && user) {
    return (
      <>
        <ManagementView 
          state={state}
          dispatch={dispatch}
          user={user}
          variant={variant}
          onUnsubscribe={handleUnsubscribe}
          onRefresh={refreshSubscription}
        />
        {state.showSuccessModal && (
          <SuccessModal 
            onClose={() => dispatch({ type: 'SET_SHOW_SUCCESS_MODAL', payload: false })} 
            email={state.newsletterEmail || state.accountEmail}
          />
        )}
        {state.showConfirmModal && (
          <ConfirmModal 
            state={state}
            dispatch={dispatch}
            onConfirm={handleSubscriptionSuccess}
          />
        )}
      </>
    )
  }

  // Non-subscribed view
  return (
    <>
      <SubscriptionForm 
        state={state}
        dispatch={dispatch}
        user={user}
        variant={variant}
        onSubscribeSuccess={handleSubscriptionSuccess}
      />
      {state.showConfirmModal && (
        <ConfirmModal 
          state={state}
          dispatch={dispatch}
          onConfirm={handleSubscriptionSuccess}
        />
      )}
      {state.showAuthPopup && variant !== 'footer' && (
        <AuthPopup onClose={() => dispatch({ type: 'SET_SHOW_AUTH_POPUP', payload: false })} />
      )}
      {state.showSuccessModal && (
        <SuccessModal 
          onClose={() => dispatch({ type: 'SET_SHOW_SUCCESS_MODAL', payload: false })} 
          email={state.newsletterEmail || state.accountEmail}
        />
      )}
    </>
  )
}