// src/pages/admin/login.js (COMPLETE FIXED FILE)

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Eye, EyeOff, Lock, Shield } from 'lucide-react'

export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [lockedUntil, setLockedUntil] = useState(null)
  const router = useRouter()

  // Check if already logged in
  useEffect(() => {
    const sessionToken = localStorage.getItem('admin_session_token')
    const sessionExpiry = localStorage.getItem('admin_session_expiry')
    
    if (sessionToken && sessionExpiry) {
      const now = Date.now()
      if (now < parseInt(sessionExpiry)) {
        router.push('/admin/dashboard')
      } else {
        // Clear expired session
        localStorage.removeItem('admin_session_token')
        localStorage.removeItem('admin_session_expiry')
      }
    }
    
    // Load failed attempts from localStorage
    const savedAttempts = localStorage.getItem('admin_login_attempts')
    const savedLockUntil = localStorage.getItem('admin_login_locked_until')
    
    if (savedAttempts) setAttempts(parseInt(savedAttempts))
    if (savedLockUntil) {
      const lockTime = parseInt(savedLockUntil)
      if (lockTime > Date.now()) {
        setLockedUntil(lockTime)
      } else {
        localStorage.removeItem('admin_login_attempts')
        localStorage.removeItem('admin_login_locked_until')
      }
    }
  }, [router])

  const handleLogin = async (e) => {
    e.preventDefault()
    
    // Check if locked
    if (lockedUntil && lockedUntil > Date.now()) {
      const minutesLeft = Math.ceil((lockedUntil - Date.now()) / 60000)
      setError(`Too many failed attempts. Please try again in ${minutesLeft} minute(s).`)
      return
    }
    
    if (!password.trim()) {
      setError('Please enter the admin password')
      return
    }
    
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })

      const data = await res.json()

      if (data.success && data.token) {
        // ✅ FIXED: Use token from server, not client-generated
        const expiry = data.expiresAt || (Date.now() + (24 * 60 * 60 * 1000))
        
        localStorage.setItem('admin_session_token', data.token)
        localStorage.setItem('admin_session_expiry', expiry.toString())
        
        // Clear failed attempts on successful login
        localStorage.removeItem('admin_login_attempts')
        localStorage.removeItem('admin_login_locked_until')
        
        router.push('/admin/dashboard')
      } else {
        // Track failed attempts
        const newAttempts = attempts + 1
        setAttempts(newAttempts)
        localStorage.setItem('admin_login_attempts', newAttempts.toString())
        
        // Lock after 5 failed attempts
        if (newAttempts >= 5) {
          const lockUntil = Date.now() + (15 * 60 * 1000) // 15 minutes
          setLockedUntil(lockUntil)
          localStorage.setItem('admin_login_locked_until', lockUntil.toString())
          setError('Too many failed attempts. Account locked for 15 minutes.')
        } else {
          setError(`Invalid password. ${5 - newAttempts} attempt(s) remaining.`)
        }
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const toggleShowPassword = () => {
    setShowPassword(!showPassword)
  }

  // Format lock timer
  useEffect(() => {
    if (!lockedUntil) return
    
    const interval = setInterval(() => {
      if (lockedUntil <= Date.now()) {
        setLockedUntil(null)
        setAttempts(0)
        localStorage.removeItem('admin_login_attempts')
        localStorage.removeItem('admin_login_locked_until')
        clearInterval(interval)
      }
    }, 1000)
    
    return () => clearInterval(interval)
  }, [lockedUntil])

  const getLockTimeRemaining = () => {
    if (!lockedUntil) return null
    const remaining = Math.max(0, lockedUntil - Date.now())
    const minutes = Math.floor(remaining / 60000)
    const seconds = Math.floor((remaining % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-icon-wrapper">
            <Shield size={40} className="login-icon" />
          </div>
          <h1>Admin Login</h1>
          <p>Enter your password to access the admin panel</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                required
                disabled={loading || (lockedUntil && lockedUntil > Date.now())}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={toggleShowPassword}
                tabIndex="-1"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && <div className="error">{error}</div>}
          
          {lockedUntil && lockedUntil > Date.now() && (
            <div className="lock-info">
              <Lock size={14} />
              <span>Account locked. Try again in {getLockTimeRemaining()}</span>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading || (lockedUntil && lockedUntil > Date.now())}
          >
            {loading ? (
              <span className="loading-spinner"></span>
            ) : (
              'Login'
            )}
          </button>
        </form>
        
        <div className="login-footer">
          <p className="security-note">
            🔒 Secure admin area
          </p>
        </div>
      </div>

      <style jsx>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 1rem;
        }
        
        .login-card {
          background: white;
          border-radius: 24px;
          padding: 2rem;
          width: 100%;
          max-width: 400px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          animation: fadeIn 0.5s ease;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        :global(body.dark) .login-card {
          background: #1e293b;
        }
        
        .login-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        
        .login-icon-wrapper {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 40px;
          margin-bottom: 1rem;
        }
        
        .login-icon {
          color: white;
        }
        
        .login-header h1 {
          font-size: 1.75rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .login-header p {
          color: #64748b;
          font-size: 0.875rem;
        }
        
        :global(body.dark) .login-header p {
          color: #94a3b8;
        }
        
        .input-group {
          margin-bottom: 1rem;
        }
        
        .password-input-wrapper {
          position: relative;
        }
        
        input {
          width: 100%;
          padding: 0.875rem 1rem;
          padding-right: 3rem;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-size: 1rem;
          transition: all 0.2s;
        }
        
        :global(body.dark) input {
          background: #0f172a;
          border-color: #334155;
          color: white;
        }
        
        input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        
        input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .password-toggle {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          color: #94a3b8;
          width: auto;
          margin: 0;
        }
        
        .password-toggle:hover {
          color: #667eea;
          transform: translateY(-50%);
          box-shadow: none;
        }
        
        button {
          width: 100%;
          padding: 0.875rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
        }
        
        button:active:not(:disabled) {
          transform: translateY(0);
        }
        
        button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .loading-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .error {
          color: #ef4444;
          font-size: 0.875rem;
          margin-bottom: 1rem;
          text-align: center;
          padding: 0.5rem;
          background: #fef2f2;
          border-radius: 8px;
        }
        
        :global(body.dark) .error {
          background: #7f1d1d;
          color: #fca5a5;
        }
        
        .lock-info {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-bottom: 1rem;
          padding: 0.5rem;
          background: #fef3c7;
          color: #d97706;
          border-radius: 8px;
          font-size: 0.875rem;
        }
        
        :global(body.dark) .lock-info {
          background: #78350f;
          color: #fbbf24;
        }
        
        .login-footer {
          margin-top: 1.5rem;
          text-align: center;
        }
        
        .security-note {
          font-size: 0.75rem;
          color: #94a3b8;
        }
        
        @media (max-width: 640px) {
          .login-card {
            padding: 1.5rem;
          }
          
          .login-header h1 {
            font-size: 1.5rem;
          }
          
          input, button {
            padding: 0.75rem;
          }
        }
      `}</style>
    </div>
  )
}