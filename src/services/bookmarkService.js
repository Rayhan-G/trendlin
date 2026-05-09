// lib/subscriptionService.js
class SubscriptionService {
  constructor() {
    this.listeners = new Set()
    this.currentState = {
      isSubscribed: false,
      subscriptionData: null,
      user: null,
      loading: true,
      lastSync: null
    }
    this.isInitialized = false
  }

  // Subscribe to state changes
  subscribe(listener) {
    this.listeners.add(listener)
    // Immediately notify of current state
    listener(this.currentState)
    return () => this.listeners.delete(listener)
  }

  // Notify all listeners of state change
  notify() {
    this.listeners.forEach(listener => listener(this.currentState))
  }

  // Update state locally and broadcast
  updateState(newState) {
    this.currentState = { ...this.currentState, ...newState }
    this.notify()
  }

  // Fetch from server and update state
  async sync() {
    try {
      this.updateState({ loading: true })
      
      const res = await fetch('/api/auth/me?t=' + Date.now(), {
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
      })
      const data = await res.json()
      
      if (data.authenticated) {
        const isSubscribed = data.newsletter?.is_subscribed === true
        this.updateState({
          isSubscribed,
          subscriptionData: isSubscribed ? data.newsletter : null,
          user: data.user,
          loading: false,
          lastSync: Date.now()
        })
      } else {
        this.updateState({
          isSubscribed: false,
          subscriptionData: null,
          user: null,
          loading: false,
          lastSync: Date.now()
        })
      }
    } catch (error) {
      console.error('Sync failed:', error)
      this.updateState({ loading: false, error: error.message })
    }
  }

  // Subscribe to newsletter
  async subscribe(categories, email) {
    try {
      const res = await fetch('/api/newsletter/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'subscribe',
          data: { categories, newsletterEmail: email }
        })
      })
      
      const result = await res.json()
      
      if (result.success) {
        await this.sync() // Force fresh sync after subscription
        return result
      }
      throw new Error('Subscription failed')
    } catch (error) {
      console.error('Subscribe error:', error)
      throw error
    }
  }

  // Unsubscribe
  async unsubscribe() {
    try {
      const res = await fetch('/api/newsletter/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'unsubscribe' })
      })
      
      const result = await res.json()
      
      if (result.success) {
        await this.sync()
        return result
      }
      throw new Error('Unsubscribe failed')
    } catch (error) {
      console.error('Unsubscribe error:', error)
      throw error
    }
  }

  // Update preferences
  async updatePreferences(categories) {
    try {
      const res = await fetch('/api/newsletter/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updatePreferences',
          data: { categories }
        })
      })
      
      const result = await res.json()
      
      if (result.success) {
        await this.sync()
        return result
      }
      throw new Error('Update failed')
    } catch (error) {
      console.error('Update error:', error)
      throw error
    }
  }

  // Initialize service
  init() {
    if (this.isInitialized) return
    this.isInitialized = true
    
    // Initial sync
    this.sync()
    
    // Listen for storage events (cross-tab)
    window.addEventListener('storage', (e) => {
      if (e.key === 'subscription_sync') {
        this.sync()
      }
    })
    
    // Listen for focus events (user returns to tab)
    window.addEventListener('focus', () => this.sync())
    
    // Sync every 30 seconds as fallback
    setInterval(() => this.sync(), 30000)
  }
}

// Export singleton instance
export const subscriptionService = new SubscriptionService()