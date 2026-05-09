// src/hooks/useSubscription.js
import { useEffect, useState } from 'react'
import { subscriptionStore } from '../lib/subscription-store'

export function useSubscription() {
  const [state, setState] = useState(subscriptionStore.state)

  useEffect(() => {
    subscriptionStore.load()
    const unsubscribe = subscriptionStore.subscribe(setState)
    return unsubscribe
  }, [])

  return {
    ...state,
    refresh: () => subscriptionStore.refresh()
  }
}