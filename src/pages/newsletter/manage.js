// pages/newsletter/manage.js
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import NewsletterSubscribe from '@/components/frontend/NewsletterSubscribe'

export default function NewsletterManagePage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me')
        const data = await res.json()
        
        if (data.authenticated) {
          setIsAuthenticated(true)
        } else {
          // Store return URL and redirect to home with auth modal
          sessionStorage.setItem('redirectAfterAuth', '/newsletter/manage')
          router.push('/?auth=signup')
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        router.push('/')
      } finally {
        setLoading(false)
      }
    }
    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <style jsx>{`
          .loading-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
          }
          .loading-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid rgba(255,255,255,0.2);
            border-top-color: #06b6d4;
            border-radius: 50%;
            animation: spin 0.6s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="manage-page">
      <div className="manage-page-container">
        <div className="page-header">
          <button onClick={() => router.back()} className="back-button">
            ← Back
          </button>
          <div className="header-content">
            <h1>Newsletter Settings</h1>
            <p>Manage your subscription preferences</p>
          </div>
        </div>
        
        <NewsletterSubscribe />
      </div>
      
      <style jsx>{`
        .manage-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
        }
        .manage-page-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 2rem 1rem;
        }
        .page-header {
          margin-bottom: 2rem;
        }
        .back-button {
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 40px;
          cursor: pointer;
          font-size: 0.875rem;
          margin-bottom: 1rem;
          transition: all 0.2s;
        }
        .back-button:hover {
          background: rgba(255,255,255,0.2);
        }
        .header-content h1 {
          color: white;
          font-size: 2rem;
          font-weight: 700;
          margin: 0 0 0.5rem 0;
        }
        .header-content p {
          color: rgba(255,255,255,0.6);
          margin: 0;
        }
        @media (max-width: 640px) {
          .header-content h1 {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  )
}