// src/pages/newsletter/manage.js
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
          // Redirect to home if not authenticated
          router.push('/')
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
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#0f172a'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid rgba(255,255,255,0.2)',
          borderTopColor: '#06b6d4',
          borderRadius: '50%',
          animation: 'spin 0.6s linear infinite'
        }} />
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <button 
          onClick={() => router.back()}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#06b6d4',
            cursor: 'pointer',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          ← Back
        </button>
      </div>
      
      <NewsletterSubscribe />
    </div>
  )
}