// src/components/frontend/AuthGuard.js
import { useState, useEffect } from 'react'

export default function AuthGuard({ children, message = "Create an account to access this feature" }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me')
        const data = await res.json()
        if (data.authenticated) {
          setUser(data.user)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
      } finally {
        setLoading(false)
      }
    }
    checkAuth()
  }, [])

  const openSignup = () => {
    window.dispatchEvent(new CustomEvent('openAuth', { detail: 'signup' }))
  }

  if (loading) {
    return (
      <div className="auth-guard-loading">
        <div className="spinner"></div>
        <style jsx>{`
          .auth-guard-loading {
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 2rem;
          }
          .spinner {
            width: 32px;
            height: 32px;
            border: 3px solid #e2e8f0;
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

  if (!user) {
    return (
      <div className="auth-guard">
        <div className="auth-guard-content">
          <div className="lock-icon">🔒</div>
          <h3>Account required</h3>
          <p>{message}</p>
          <button onClick={openSignup} className="auth-guard-btn">
            Create free account →
          </button>
          <p className="auth-guard-benefits">
            ✨ Free: Newsletter • Bookmarks • Ratings
          </p>
        </div>
        <style jsx>{`
          .auth-guard {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            border-radius: 24px;
            padding: 2rem;
            text-align: center;
            border: 1px solid #e2e8f0;
          }
          .lock-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
          }
          .auth-guard h3 {
            font-size: 1.25rem;
            font-weight: 600;
            color: #0f172a;
            margin-bottom: 0.5rem;
          }
          .auth-guard p {
            color: #64748b;
            font-size: 0.875rem;
            margin-bottom: 1.5rem;
          }
          .auth-guard-btn {
            padding: 0.6rem 1.5rem;
            background: linear-gradient(135deg, #06b6d4, #0891b2);
            border: none;
            border-radius: 40px;
            color: white;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
          }
          .auth-guard-btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(6, 182, 212, 0.3);
          }
          .auth-guard-benefits {
            font-size: 0.7rem;
            color: #94a3b8;
            margin-top: 1rem;
          }
        `}</style>
      </div>
    )
  }

  return children
}