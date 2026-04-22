// src/components/frontend/AuthModal.js
import { useState } from 'react'

export default function AuthModal({ isOpen, onClose, onLogin }) {
  const [mode, setMode] = useState('login') // 'login' or 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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

    const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/signup'
    const body = mode === 'login' 
      ? { email, password, rememberMe }
      : { email, password }

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })

    const data = await res.json()

    if (res.ok) {
      onLogin(data.user)
      onClose()
    } else {
      setError(data.error || 'Authentication failed')
    }

    setLoading(false)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        
        <div className="modal-header">
          <div className="modal-icon">📬</div>
          <h2>{mode === 'login' ? 'Welcome Back!' : 'Create Free Account'}</h2>
          <p>
            {mode === 'login' 
              ? 'Log in to subscribe to our newsletter' 
              : 'Sign up for free to subscribe to our newsletter'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          {mode === 'signup' && (
            <input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          )}

          {mode === 'login' && (
            <label className="remember-me">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Remember me
            </label>
          )}

          {error && <p className="error">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Log In →' : 'Sign Up →'}
          </button>
        </form>

        <div className="modal-footer">
          {mode === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button onClick={() => setMode('signup')} className="switch-mode">
                Sign up for free
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button onClick={() => setMode('login')} className="switch-mode">
                Log in
              </button>
            </p>
          )}
        </div>

        <p className="benefits">
          ✨ Free account includes: Newsletter subscription • Rate content • Bookmark posts (coming soon)
        </p>

        <style jsx>{`
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            backdrop-filter: blur(4px);
          }
          .modal-content {
            background: white;
            border-radius: 28px;
            padding: 2rem;
            max-width: 450px;
            width: 90%;
            position: relative;
            animation: slideUp 0.3s ease-out;
          }
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .close-btn {
            position: absolute;
            top: 1rem;
            right: 1rem;
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: #999;
          }
          .modal-header {
            text-align: center;
            margin-bottom: 1.5rem;
          }
          .modal-icon {
            font-size: 3rem;
            margin-bottom: 0.5rem;
          }
          .modal-header h2 {
            margin: 0 0 0.5rem;
            font-size: 1.5rem;
          }
          .modal-header p {
            margin: 0;
            color: #666;
            font-size: 0.85rem;
          }
          form input {
            width: 100%;
            padding: 0.75rem;
            margin-bottom: 1rem;
            border: 1px solid #ddd;
            border-radius: 12px;
            font-size: 1rem;
          }
          .remember-me {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 1rem;
            font-size: 0.85rem;
            color: #666;
          }
          .error {
            color: #ef4444;
            font-size: 0.8rem;
            margin-bottom: 1rem;
            text-align: center;
          }
          button[type="submit"] {
            width: 100%;
            padding: 0.75rem;
            background: linear-gradient(135deg, #06b6d4, #0891b2);
            color: white;
            border: none;
            border-radius: 40px;
            font-weight: 600;
            font-size: 1rem;
            cursor: pointer;
          }
          .modal-footer {
            text-align: center;
            margin-top: 1.5rem;
            padding-top: 1rem;
            border-top: 1px solid #eee;
          }
          .switch-mode {
            background: none;
            border: none;
            color: #06b6d4;
            cursor: pointer;
            font-weight: 600;
          }
          .benefits {
            text-align: center;
            font-size: 0.7rem;
            color: #999;
            margin-top: 1rem;
          }
        `}</style>
      </div>
    </div>
  )
}