// src/components/frontend/AuthModal.js
import { useState, useEffect } from 'react'

export default function AuthModal({ isOpen, mode, onClose, onLogin }) {
  const [activeMode, setActiveMode] = useState(mode || 'login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Update activeMode when mode prop changes
  useEffect(() => {
    if (mode) {
      setActiveMode(mode)
    }
  }, [mode])

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setEmail('')
      setPassword('')
      setError('')
      setLoading(false)
    }
  }, [isOpen])

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Login failed')
      }

      onLogin?.(data.user)
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Signup failed')
      }

      onLogin?.(data.user)
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const switchMode = (newMode) => {
    setActiveMode(newMode)
    setError('')
    setEmail('')
    setPassword('')
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop with blur */}
      <div className="modal-backdrop" onClick={onClose}>
        {/* Modal content */}
        <div className="modal-container" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close" onClick={onClose}>✕</button>
          
          <div className="modal-icon">{activeMode === 'login' ? '👋' : '📬'}</div>
          
          <h2 className="modal-title">
            {activeMode === 'login' ? 'Welcome back' : 'Create free account'}
          </h2>
          
          <p className="modal-subtitle">
            {activeMode === 'login' 
              ? 'Sign in to access your newsletter and bookmarks' 
              : 'Get free access to newsletter + bookmarks'}
          </p>

          {/* Mode Toggle Buttons */}
          <div className="mode-toggle">
            <button 
              className={`mode-btn ${activeMode === 'login' ? 'active' : ''}`}
              onClick={() => switchMode('login')}
            >
              Sign In
            </button>
            <button 
              className={`mode-btn ${activeMode === 'signup' ? 'active' : ''}`}
              onClick={() => switchMode('signup')}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={activeMode === 'login' ? handleLogin : handleSignup} className="auth-form">
            <div className="input-group">
              <label>Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                disabled={loading}
              />
            </div>

            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={activeMode === 'signup' ? 'At least 8 characters' : 'Enter your password'}
                required
                disabled={loading}
                minLength={activeMode === 'signup' ? 8 : undefined}
              />
            </div>

            {error && <p className="error-message">{error}</p>}

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading 
                ? (activeMode === 'login' ? 'Signing in...' : 'Creating account...') 
                : (activeMode === 'login' ? 'Sign in →' : 'Sign up →')}
            </button>

            {activeMode === 'login' && (
              <p className="forgot-password">
                <button type="button" onClick={() => {}} className="forgot-link">
                  Forgot password?
                </button>
              </p>
            )}
          </form>

          <div className="footer-note">
            {activeMode === 'login' ? (
              <>
                Don't have an account?{' '}
                <button onClick={() => switchMode('signup')} className="switch-link">
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button onClick={() => switchMode('login')} className="switch-link">
                  Sign in
                </button>
              </>
            )}
          </div>

          <p className="terms-text">
            By continuing, you agree to our Terms and Privacy Policy.
          </p>
        </div>
      </div>

      <style jsx>{`
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          animation: fadeIn 0.2s ease-out;
        }

        .modal-container {
          background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
          border-radius: 32px;
          padding: 2rem;
          max-width: 440px;
          width: 90%;
          position: relative;
          animation: slideUp 0.3s ease-out;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }

        .modal-close {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: rgba(255, 255, 255, 0.1);
          border: none;
          color: white;
          font-size: 1.25rem;
          cursor: pointer;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .modal-close:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: scale(1.05);
        }

        .modal-icon {
          font-size: 3rem;
          text-align: center;
          margin-bottom: 0.5rem;
        }

        .modal-title {
          color: white;
          font-size: 1.75rem;
          font-weight: 700;
          text-align: center;
          margin-bottom: 0.5rem;
        }

        .modal-subtitle {
          color: rgba(255, 255, 255, 0.6);
          text-align: center;
          font-size: 0.875rem;
          margin-bottom: 1.5rem;
        }

        .mode-toggle {
          display: flex;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.05);
          padding: 0.25rem;
          border-radius: 48px;
          margin-bottom: 1.5rem;
        }

        .mode-btn {
          flex: 1;
          padding: 0.6rem;
          background: transparent;
          border: none;
          border-radius: 40px;
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .mode-btn.active {
          background: #06b6d4;
          color: white;
          box-shadow: 0 2px 8px rgba(6, 182, 212, 0.3);
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .input-group label {
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.875rem;
          font-weight: 500;
        }

        .input-group input {
          padding: 0.875rem 1rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          color: white;
          font-size: 1rem;
          transition: all 0.2s;
        }

        .input-group input:focus {
          outline: none;
          border-color: #06b6d4;
          background: rgba(255, 255, 255, 0.15);
        }

        .input-group input::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }

        .error-message {
          color: #ef4444;
          font-size: 0.8rem;
          text-align: center;
          margin-top: -0.5rem;
        }

        .submit-btn {
          padding: 0.875rem;
          background: linear-gradient(135deg, #06b6d4, #0891b2);
          border: none;
          border-radius: 40px;
          color: white;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 0.5rem;
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px -5px rgba(6, 182, 212, 0.3);
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .forgot-password {
          text-align: center;
          margin-top: -0.5rem;
        }

        .forgot-link {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.75rem;
          cursor: pointer;
          transition: color 0.2s;
        }

        .forgot-link:hover {
          color: #06b6d4;
        }

        .footer-note {
          text-align: center;
          margin-top: 1.5rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.875rem;
        }

        .switch-link {
          background: none;
          border: none;
          color: #06b6d4;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.875rem;
        }

        .switch-link:hover {
          text-decoration: underline;
        }

        .terms-text {
          font-size: 0.7rem;
          color: rgba(255, 255, 255, 0.4);
          text-align: center;
          margin-top: 1rem;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
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
      `}</style>
    </>
  )
}