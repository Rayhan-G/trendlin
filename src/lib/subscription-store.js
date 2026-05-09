// src/lib/subscription-store.js
class SubscriptionStore {
  constructor() {
    this.listeners = new Set()
    this.state = {
      isSubscribed: false,
      subscriptionData: null,
      user: null,
      loading: true,
      initialized: false
    }
  }

  subscribe(listener) {
    this.listeners.add(listener)
    listener(this.state)
    return () => this.listeners.delete(listener)
  }

  setState(newState) {
    this.state = { ...this.state, ...newState }
    this.listeners.forEach(listener => listener(this.state))
  }

  async load() {
    if (this.state.initialized) return
    
    this.setState({ loading: true })
    
    try {
      const res = await fetch('/api/auth/me?t=' + Date.now())
      const data = await res.json()
      
      if (data.authenticated) {
        this.setState({
          isSubscribed: data.newsletter?.is_subscribed === true,
          subscriptionData: data.newsletter,
          user: data.user,
          loading: false,
          initialized: true
        })
      } else {
        this.setState({
          isSubscribed: false,
          subscriptionData: null,
          user: null,
          loading: false,
          initialized: true
        })
      }
    } catch (error) {
      console.error('Failed to load:', error)
      this.setState({ loading: false, error: error.message })
    }
  }

  async refresh() {
    this.setState({ loading: true })
    
    try {
      const res = await fetch('/api/auth/me?t=' + Date.now())
      const data = await res.json()
      
      if (data.authenticated) {
        this.setState({
          isSubscribed: data.newsletter?.is_subscribed === true,
          subscriptionData: data.newsletter,
          user: data.user,
          loading: false
        })
      } else {
        this.setState({
          isSubscribed: false,
          subscriptionData: null,
          user: null,
          loading: false
        })
      }
    } catch (error) {
      console.error('Failed to refresh:', error)
      this.setState({ loading: false, error: error.message })
    }
  }
}

export const subscriptionStore = new SubscriptionStore()