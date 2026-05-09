// src/components/frontend/NewsletterSubscribe/hooks/useNewsletterAuth.js
import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../../../../lib/supabase'
import { useAuth } from '../../../../hooks/useAuth'

export function useNewsletterAuth({ dispatch, onSubscriptionChange }) {
  const { user: authUser, isAuthenticated } = useAuth()
  const [user, setUser] = useState(null)
  const [subscriptionStatus, setSubscriptionStatus] = useState(null)
  const [authChecked, setAuthChecked] = useState(false)
  const authCheckPromiseRef = useRef(null)
  const isMountedRef = useRef(true)

  const checkAuth = useCallback(async () => {
    // Only run on client side
    if (typeof window === 'undefined') {
      return { authenticated: false, user: null, newsletter: null }
    }

    // Deduplicate concurrent auth checks
    if (authCheckPromiseRef.current) {
      return authCheckPromiseRef.current
    }

    authCheckPromiseRef.current = (async () => {
      try {
        // Use the auth context user if available
        if (!isAuthenticated || !authUser) {
          if (isMountedRef.current) {
            setUser(null)
            setSubscriptionStatus(null)
            if (onSubscriptionChange?.current) {
              onSubscriptionChange.current(false)
            }
          }
          return { authenticated: false, user: null, newsletter: null }
        }

        const currentUser = authUser
        
        // Fetch newsletter preferences
        const { data: newsletterPrefs, error: prefsError } = await supabase
          .from('newsletter_preferences')
          .select('*')
          .eq('user_id', currentUser.id)
          .maybeSingle()

        if (prefsError && prefsError.code !== 'PGRST116') {
          console.error('Error fetching preferences:', prefsError)
        }

        const newsletter = newsletterPrefs || null
        const isSubscribed = newsletter?.is_subscribed === true

        if (isMountedRef.current) {
          setUser(currentUser)
          dispatch({ type: 'SET_ACCOUNT_EMAIL', payload: currentUser.email })
          
          if (isSubscribed) {
            setSubscriptionStatus('subscribed')
            dispatch({ type: 'SET_SUBSCRIPTION_STATUS', payload: 'subscribed' })
            dispatch({ type: 'SET_SELECTED_CATEGORIES', payload: newsletter.categories || [] })
            dispatch({ type: 'SET_ORIGINAL_CATEGORIES', payload: newsletter.categories || [] })
            
            const newsEmail = newsletter.newsletter_email || currentUser.email
            dispatch({ type: 'SET_NEWSLETTER_EMAIL', payload: newsEmail })
            dispatch({ type: 'SET_NEW_EMAIL_INPUT', payload: newsEmail })
            
            if (onSubscriptionChange?.current) {
              onSubscriptionChange.current(true)
            }
          } else {
            setSubscriptionStatus(null)
            if (onSubscriptionChange?.current) {
              onSubscriptionChange.current(false)
            }
          }
        }
        
        return { authenticated: true, user: currentUser, newsletter }
      } catch (err) {
        console.error('Auth check failed:', err)
        if (isMountedRef.current) {
          setUser(null)
          setSubscriptionStatus(null)
          if (onSubscriptionChange?.current) {
            onSubscriptionChange.current(false)
          }
        }
        return { authenticated: false, user: null, newsletter: null }
      } finally {
        if (isMountedRef.current) {
          setAuthChecked(true)
          dispatch({ type: 'SET_AUTH_CHECKED', payload: true })
        }
        authCheckPromiseRef.current = null
      }
    })()

    return authCheckPromiseRef.current
  }, [authUser, isAuthenticated, dispatch, onSubscriptionChange])

  const refreshSubscription = useCallback(async () => {
    // Only run on client side
    if (typeof window === 'undefined') return
    
    try {
      if (!isAuthenticated || !authUser) return
      
      const { data: newsletterPrefs } = await supabase
        .from('newsletter_preferences')
        .select('*')
        .eq('user_id', authUser.id)
        .maybeSingle()
      
      const isSubscribed = newsletterPrefs?.is_subscribed === true
      setSubscriptionStatus(isSubscribed ? 'subscribed' : null)
      dispatch({ type: 'SET_SUBSCRIPTION_STATUS', payload: isSubscribed ? 'subscribed' : null })
      
      if (isSubscribed && newsletterPrefs) {
        dispatch({ type: 'SET_SELECTED_CATEGORIES', payload: newsletterPrefs.categories || [] })
        dispatch({ type: 'SET_ORIGINAL_CATEGORIES', payload: newsletterPrefs.categories || [] })
        const newsEmail = newsletterPrefs.newsletter_email || authUser.email
        dispatch({ type: 'SET_NEWSLETTER_EMAIL', payload: newsEmail })
      }
    } catch (error) {
      console.error('Failed to refresh subscription:', error)
    }
  }, [authUser, isAuthenticated, dispatch])

  // Set up auth state listener
  useEffect(() => {
    isMountedRef.current = true
    
    // Listen for custom events
    const handleAuthChange = () => checkAuth()
    window.addEventListener('authComplete', handleAuthChange)
    window.addEventListener('subscriptionChange', handleAuthChange)
    
    // Initial auth check
    checkAuth()
    
    return () => {
      isMountedRef.current = false
      window.removeEventListener('authComplete', handleAuthChange)
      window.removeEventListener('subscriptionChange', handleAuthChange)
    }
  }, [checkAuth])

  return {
    user,
    subscriptionStatus,
    authChecked,
    refreshSubscription,
    checkAuth
  }
}