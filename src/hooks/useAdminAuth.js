// src/hooks/useAdminAuth.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export function useAdminAuth() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const sessionToken = localStorage.getItem('admin_session_token');
        const sessionExpiry = localStorage.getItem('admin_session_expiry');
        
        if (!sessionToken) {
          router.push('/admin/login');
          return false;
        }
        
        // Check if session is expired
        if (sessionExpiry && new Date().getTime() > parseInt(sessionExpiry)) {
          localStorage.removeItem('admin_session_token');
          localStorage.removeItem('admin_session_expiry');
          router.push('/admin/login');
          return false;
        }
        
        setIsAuthenticated(true);
        return true;
      } catch (error) {
        console.error('Auth check error:', error);
        router.push('/admin/login');
        return false;
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  return { isAuthenticated, isLoading };
}