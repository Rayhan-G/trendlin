// pages/admin/login.js
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Check if already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/admin/verify')
        if (response.ok) {
          router.push('/admin/dashboard')
        }
      } catch (err) {
        // Not logged in, stay on login page
      }
    }
    checkAuth()
  }, [router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (response.ok) {
        router.push('/admin/dashboard')
      } else {
        setError(data.error || 'Login failed')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="login-header">
          <div className="login-icon">🔐</div>
          <h1>Admin Login</h1>
          <p>Enter your credentials to access the dashboard</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="admin@trendlin.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button type="submit" disabled={loading} className="login-btn">
            {loading ? 'Verifying...' : 'Access Dashboard'}
          </button>

          {error && <div className="error-message">{error}</div>}
        </form>

        <div className="login-footer">
          <a href="/">← Return to Homepage</a>
        </div>
      </div>

      <style jsx>{`
        .admin-login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
        }
        
        .admin-login-card {
          background: white;
          border-radius: 24px;
          padding: 48px;
          width: 100%;
          max-width: 440px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
        
        .login-header {
          text-align: center;
          margin-bottom: 32px;
        }
        
        .login-icon {
          font-size: 56px;
          margin-bottom: 16px;
        }
        
        .login-header h1 {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 8px;
          color: #1e293b;
        }
        
        .login-header p {
          color: #64748b;
          font-size: 14px;
        }
        
        .input-group {
          margin-bottom: 20px;
        }
        
        .input-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #334155;
          font-size: 14px;
        }
        
        .input-group input {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          font-size: 16px;
          transition: all 0.2s;
        }
        
        .input-group input:focus {
          outline: none;
          border-color: #8b5cf6;
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
        }
        
        .login-btn {
          width: 100%;
          padding: 12px;
          background: #8b5cf6;
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .login-btn:hover:not(:disabled) {
          background: #7c3aed;
          transform: translateY(-1px);
        }
        
        .login-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .error-message {
          margin-top: 16px;
          padding: 12px;
          background: #fef2f2;
          border-radius: 8px;
          color: #ef4444;
          font-size: 14px;
          text-align: center;
        }
        
        .login-footer {
          margin-top: 24px;
          text-align: center;
          padding-top: 24px;
          border-top: 1px solid #e2e8f0;
        }
        
        .login-footer a {
          color: #64748b;
          text-decoration: none;
          font-size: 14px;
          transition: color 0.2s;
        }
        
        .login-footer a:hover {
          color: #8b5cf6;
        }
      `}</style>
    </div>
  )
}