import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

export default function AuthModal({ isOpen, mode: propMode, onClose, onLogin }) {
  const router = useRouter()
  const [mode, setMode] = useState(propMode || 'login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (propMode) setMode(propMode)
  }, [propMode])

  useEffect(() => {
    if (isOpen) {
      setEmail('')
      setPassword('')
      setRememberMe(false)
      setError('')
      setShowPassword(false)
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen])

  if (!isOpen) return null

  const callApi = async (endpoint, data) => {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include' // Important: include cookies
      })

      const result = await response.json()
      
      if (!response.ok) {
        return { success: false, error: result.error || 'Request failed' }
      }
      
      return { success: true, data: result }
    } catch (error) {
      console.error('API Error:', error)
      return { success: false, error: 'Unable to connect. Please check your network.' }
    }
  }

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Email and password are required')
      return
    }

    setLoading(true)
    setError('')

    const result = await callApi('/api/auth/login', { email, password, rememberMe })

    if (result.success) {
      // Close modal first
      onClose()
      
      // Call onLogin callback if provided
      if (onLogin) {
        onLogin(result.data.user)
      }
      
      // Check if admin
      const isAdmin = result.data.isAdmin === true || result.data.user?.is_admin === true
      
      // Redirect admin to dashboard
      if (isAdmin) {
        // Use window.location for most reliable redirect
        window.location.href = '/admin/dashboard'
      }
    } else {
      setError(result.error)
    }
    
    setLoading(false)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    handleLogin()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        
        <div className="modal-header">
          <div className="logo-icon">🔐</div>
          <h2>Admin Login</h2>
          <p className="subtitle">Sign in to access the admin panel</p>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            autoComplete="email"
          />
          
          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              autoComplete="current-password"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <span>Remember me</span>
          </label>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100000;
          padding: 20px;
        }

        .modal-container {
          background: white;
          border-radius: 24px;
          padding: 32px;
          width: 100%;
          max-width: 420px;
          position: relative;
          animation: slideUp 0.3s ease;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .close-btn {
          position: absolute;
          top: 16px;
          right: 16px;
          background: #f1f5f9;
          border: none;
          font-size: 24px;
          cursor: pointer;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
          transition: all 0.2s;
        }

        .close-btn:hover {
          background: #e2e8f0;
          transform: scale(1.05);
        }

        .modal-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .logo-icon {
          font-size: 48px;
          margin-bottom: 12px;
        }

        .modal-header h2 {
          margin: 0 0 8px 0;
          font-size: 28px;
          font-weight: 700;
          color: #0f172a;
        }

        .subtitle {
          color: #64748b;
          font-size: 14px;
          margin: 0;
        }

        input {
          width: 100%;
          padding: 12px 16px;
          margin-bottom: 16px;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          font-size: 15px;
          transition: all 0.2s;
          box-sizing: border-box;
          background: white;
          color: #0f172a;
        }

        input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .password-wrapper {
          position: relative;
          margin-bottom: 16px;
        }

        .password-wrapper input {
          margin-bottom: 0;
          padding-right: 48px;
        }

        .password-toggle {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: transparent;
          border: none;
          cursor: pointer;
          font-size: 20px;
          padding: 0;
          opacity: 0.6;
          transition: opacity 0.2s;
        }

        .password-toggle:hover {
          opacity: 1;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 24px;
          cursor: pointer;
          color: #64748b;
          font-size: 14px;
        }

        .checkbox-label input {
          width: 18px;
          height: 18px;
          margin: 0;
          cursor: pointer;
        }

        .error-message {
          background: #fef2f2;
          color: #dc2626;
          padding: 12px;
          border-radius: 12px;
          font-size: 13px;
          margin-bottom: 20px;
          text-align: center;
          border: 1px solid #fecaca;
        }

        .submit-btn {
          width: 100%;
          padding: 12px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .submit-btn:hover:not(:disabled) {
          background: #2563eb;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @media (prefers-color-scheme: dark) {
          .modal-container {
            background: #1e293b;
          }
          .modal-header h2 {
            color: #f1f5f9;
          }
          input {
            background: #0f172a;
            border-color: #334155;
            color: #f1f5f9;
          }
          .close-btn {
            background: #334155;
            color: #cbd5e1;
          }
          .close-btn:hover {
            background: #475569;
          }
        }
      `}</style>
    </div>
  )
}