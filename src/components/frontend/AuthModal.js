// src/components/frontend/AuthModal.js
import { useState, useEffect } from 'react'

export default function AuthModal({ isOpen, mode: propMode, onClose, onLogin }) {
  const [mode, setMode] = useState(propMode || 'login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (propMode) setMode(propMode)
  }, [propMode])

  useEffect(() => {
    if (isOpen) {
      setEmail('')
      setPassword('')
      setConfirmPassword('')
      setError('')
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (mode === 'signup' && password.length < 8) {
      setError('Password must be 8+ characters')
      setLoading(false)
      return
    }

    const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/signup'
    
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await res.json()

      if (res.ok) {
        onLogin(data.user)
        onClose()
      } else {
        setError(data.error || 'Authentication failed')
      }
    } catch (err) {
      setError('Network error')
    }
    setLoading(false)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>✕</button>
        
        <div className="modal-header">
          <div className="logo-icon">📬</div>
          <h2>{mode === 'login' ? 'Welcome back' : 'Sign up free'}</h2>
        </div>

        <div className="mode-toggle">
          <button 
            className={`mode-btn ${mode === 'login' ? 'active' : ''}`}
            onClick={() => setMode('login')}
            type="button"
          >
            Sign in
          </button>
          <button 
            className={`mode-btn ${mode === 'signup' ? 'active' : ''}`}
            onClick={() => setMode('signup')}
            type="button"
          >
            Sign up
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
          
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />

          {mode === 'signup' && (
            <input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
            />
          )}

          {error && <div className="error">{error}</div>}

          <button type="submit" disabled={loading}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign in →' : 'Sign up →'}
          </button>
        </form>

        <p className="benefits">
          ✨ Free account includes: Newsletter • Bookmarks
        </p>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: var(--overlay-bg, rgba(0, 0, 0, 0.5));
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 99999;
        }

        .modal-container {
          background: var(--modal-bg, #ffffff);
          border-radius: 24px;
          padding: 1.5rem;
          width: 340px;
          position: relative;
          animation: slideUp 0.25s ease;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
          border: var(--modal-border, none);
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .close-btn {
          position: absolute;
          top: 12px;
          right: 12px;
          background: var(--close-btn-bg, #f1f5f9);
          border: none;
          font-size: 16px;
          cursor: pointer;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--close-btn-color, #64748b);
          transition: all 0.2s;
        }

        .close-btn:hover {
          background: var(--close-btn-hover-bg, #e2e8f0);
          color: var(--close-btn-hover-color, #000000);
        }

        .modal-header {
          text-align: center;
          margin-bottom: 1.25rem;
        }

        .logo-icon {
          font-size: 2rem;
          margin-bottom: 0.25rem;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--title-color, #0f172a);
        }

        .mode-toggle {
          display: flex;
          gap: 0.5rem;
          background: var(--toggle-bg, #f1f5f9);
          padding: 0.25rem;
          border-radius: 40px;
          margin-bottom: 1.25rem;
        }

        .mode-btn {
          flex: 1;
          padding: 0.4rem;
          background: transparent;
          border: none;
          border-radius: 40px;
          color: var(--toggle-btn-color, #64748b);
          font-size: 0.8rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .mode-btn.active {
          background: var(--toggle-active-bg, #ffffff);
          color: var(--toggle-active-color, #06b6d4);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }

        input {
          width: 100%;
          padding: 0.6rem 0.75rem;
          margin-bottom: 0.75rem;
          border: 1.5px solid var(--input-border, #e2e8f0);
          border-radius: 10px;
          font-size: 0.85rem;
          transition: all 0.2s;
          box-sizing: border-box;
          background: var(--input-bg, #ffffff);
          color: var(--input-text, #0f172a);
        }

        input::placeholder {
          color: var(--placeholder-color, #94a3b8);
        }

        input:focus {
          outline: none;
          border-color: var(--input-focus, #06b6d4);
        }

        .error {
          background: var(--error-bg, #fef2f2);
          color: var(--error-text, #ef4444);
          padding: 0.5rem;
          border-radius: 8px;
          font-size: 0.7rem;
          margin-bottom: 0.75rem;
          text-align: center;
        }

        button[type="submit"] {
          width: 100%;
          padding: 0.6rem;
          background: var(--submit-bg, #06b6d4);
          color: var(--submit-text, #ffffff);
          border: none;
          border-radius: 40px;
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 0.25rem;
        }

        button[type="submit"]:hover:not(:disabled) {
          background: var(--submit-hover-bg, #0891b2);
          transform: translateY(-1px);
        }

        button[type="submit"]:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .benefits {
          text-align: center;
          font-size: 0.65rem;
          color: var(--benefits-color, #94a3b8);
          margin-top: 1rem;
          padding-top: 0.75rem;
          border-top: 1px solid var(--benefits-border, #f1f5f9);
        }

        /* Default light mode variables */
        :root {
          --overlay-bg: rgba(0, 0, 0, 0.5);
          --modal-bg: #ffffff;
          --modal-border: none;
          --close-btn-bg: #f1f5f9;
          --close-btn-color: #64748b;
          --close-btn-hover-bg: #e2e8f0;
          --close-btn-hover-color: #000000;
          --title-color: #0f172a;
          --toggle-bg: #f1f5f9;
          --toggle-btn-color: #64748b;
          --toggle-active-bg: #ffffff;
          --toggle-active-color: #06b6d4;
          --input-border: #e2e8f0;
          --input-bg: #ffffff;
          --input-text: #0f172a;
          --placeholder-color: #94a3b8;
          --input-focus: #06b6d4;
          --error-bg: #fef2f2;
          --error-text: #ef4444;
          --submit-bg: #06b6d4;
          --submit-text: #ffffff;
          --submit-hover-bg: #0891b2;
          --benefits-color: #94a3b8;
          --benefits-border: #f1f5f9;
        }

        /* Dark mode - System preference */
        @media (prefers-color-scheme: dark) {
          :root {
            --overlay-bg: rgba(0, 0, 0, 0.8);
            --modal-bg: #1e293b;
            --modal-border: 1px solid #334155;
            --close-btn-bg: #334155;
            --close-btn-color: #cbd5e1;
            --close-btn-hover-bg: #475569;
            --close-btn-hover-color: #ffffff;
            --title-color: #f1f5f9;
            --toggle-bg: #0f172a;
            --toggle-btn-color: #94a3b8;
            --toggle-active-bg: #1e293b;
            --toggle-active-color: #06b6d4;
            --input-border: #334155;
            --input-bg: #0f172a;
            --input-text: #f1f5f9;
            --placeholder-color: #64748b;
            --input-focus: #06b6d4;
            --error-bg: #450a0a;
            --error-text: #f87171;
            --submit-bg: #06b6d4;
            --submit-text: #ffffff;
            --submit-hover-bg: #0891b2;
            --benefits-color: #94a3b8;
            --benefits-border: #334155;
          }
        }

        /* Dark mode - Manual toggle with .dark class */
        :global(.dark) {
          --overlay-bg: rgba(0, 0, 0, 0.8);
          --modal-bg: #1e293b;
          --modal-border: 1px solid #334155;
          --close-btn-bg: #334155;
          --close-btn-color: #cbd5e1;
          --close-btn-hover-bg: #475569;
          --close-btn-hover-color: #ffffff;
          --title-color: #f1f5f9;
          --toggle-bg: #0f172a;
          --toggle-btn-color: #94a3b8;
          --toggle-active-bg: #1e293b;
          --toggle-active-color: #06b6d4;
          --input-border: #334155;
          --input-bg: #0f172a;
          --input-text: #f1f5f9;
          --placeholder-color: #64748b;
          --input-focus: #06b6d4;
          --error-bg: #450a0a;
          --error-text: #f87171;
          --submit-bg: #06b6d4;
          --submit-text: #ffffff;
          --submit-hover-bg: #0891b2;
          --benefits-color: #94a3b8;
          --benefits-border: #334155;
        }
      `}</style>
    </div>
  )
}