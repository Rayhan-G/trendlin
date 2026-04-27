// src/contexts/SubscriptionContext.js
import { createContext, useContext, useState, useEffect } from 'react'

const SubscriptionContext = createContext()

export function SubscriptionProvider({ children }) {
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [loading, setLoading] = useState(true)

  const checkSubscription = async () => {
    try {
      const res = await fetch('/api/auth/me')
      const data = await res.json()
      
      if (data.authenticated && data.newsletter?.is_subscribed === true) {
        setIsSubscribed(true)
      } else {
        setIsSubscribed(false)
      }
    } catch (error) {
      console.error('Error checking subscription:', error)
      setIsSubscribed(false)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkSubscription()
  }, [])

  useEffect(() => {
    const handleSubscriptionChange = (event) => {
      setIsSubscribed(event.detail.isSubscribed)
    }
    
    window.addEventListener('subscriptionChange', handleSubscriptionChange)
    
    return () => {
      window.removeEventListener('subscriptionChange', handleSubscriptionChange)
    }
  }, [])

  return (
    <SubscriptionContext.Provider value={{ isSubscribed, loading, checkSubscription }}>
      {children}
    </SubscriptionContext.Provider>
  )
}

export function useSubscription() {
  return useContext(SubscriptionContext)
}