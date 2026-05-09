// src/hooks/useSubscriptionSync.js
import { useEffect } from 'react';
import { useSubscription } from '@/contexts/SubscriptionContext';

export const useSubscriptionSync = () => {
  const { refreshSubscription } = useSubscription();

  useEffect(() => {
    const handleSubscriptionChange = () => {
      refreshSubscription();
    };

    const handleAuthComplete = () => {
      refreshSubscription();
    };

    const handleStorageChange = (event) => {
      if (event.key === 'newsletter_subscribed') {
        refreshSubscription();
      }
    };

    window.addEventListener('subscriptionChange', handleSubscriptionChange);
    window.addEventListener('authComplete', handleAuthComplete);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('subscriptionChange', handleSubscriptionChange);
      window.removeEventListener('authComplete', handleAuthComplete);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [refreshSubscription]);
};