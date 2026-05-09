// contexts/SubscriptionContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const SubscriptionContext = createContext();

export function SubscriptionProvider({ children }) {
  const [isSubscribed, setIsSubscribed] = useState(null);
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      // Force fresh fetch with timestamp
      const res = await fetch('/api/auth/me?t=' + Date.now(), {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      const data = await res.json();
      
      if (data.authenticated && data.newsletter?.is_subscribed === true) {
        setIsSubscribed(true);
        setSubscriptionData(data.newsletter);
        // Update localStorage for cross-tab sync
        localStorage.setItem('newsletter_subscribed', 'true');
      } else {
        setIsSubscribed(false);
        setSubscriptionData(null);
        localStorage.setItem('newsletter_subscribed', 'false');
      }
    } catch (error) {
      console.error('Failed to refresh subscription:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Listen for events
  useEffect(() => {
    const handleSubscriptionChange = (event) => {
      if (event.detail?.isSubscribed !== undefined) {
        setIsSubscribed(event.detail.isSubscribed);
        setSubscriptionData(event.detail.data || null);
      } else {
        refresh(); // Full refresh if no detail
      }
    };
    
    const handleStorageChange = (e) => {
      if (e.key === 'newsletter_subscribed') {
        refresh();
      }
    };
    
    const handleFocus = () => refresh();
    
    window.addEventListener('subscriptionChange', handleSubscriptionChange);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('subscriptionChange', handleSubscriptionChange);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [refresh]);

  const updateSubscription = useCallback(async (action, data) => {
    try {
      const res = await fetch('/api/newsletter/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, data })
      });
      
      const result = await res.json();
      
      if (result.success) {
        setIsSubscribed(result.isSubscribed);
        setSubscriptionData(result.subscriptionData);
        localStorage.setItem('newsletter_subscribed', result.isSubscribed ? 'true' : 'false');
        
        // Dispatch event for other components
        window.dispatchEvent(new CustomEvent('subscriptionChange', {
          detail: { isSubscribed: result.isSubscribed, data: result.subscriptionData }
        }));
        
        return result;
      }
    } catch (error) {
      console.error('Update failed:', error);
      throw error;
    }
  }, []);

  return (
    <SubscriptionContext.Provider value={{ 
      isSubscribed, 
      subscriptionData, 
      loading, 
      refresh,
      updateSubscription 
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within SubscriptionProvider');
  }
  return context;
}