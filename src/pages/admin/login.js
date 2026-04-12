import { useState } from 'react'
import { useRouter } from 'next/router'

// Use PascalCase for component name (AdminLogin, not adminLogin)
export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Use a named function for better Fast Refresh support
  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Option 1: API Route (Recommended)
    const res = await fetch('/api/admin/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    })

    const data = await res.json()

    if (data.success) {
      localStorage.setItem('admin_logged_in', 'true')
      localStorage.setItem('admin_login_time', Date.now().toString())
      router.push('/admin')
    } else {
      setError('Invalid password')
    }
    setLoading(false)
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <span className="login-icon">🟣</span>
          <h1>Admin Login</h1>
          <p>Enter your password to access the admin panel</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
          </div>

          {error && <div className="error">{error}</div>}

          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
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
          border-radius: 16px;
          padding: 2rem;
          width: 100%;
          max-width: 400px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }
        
        :global(body.dark) .login-card {
          background: #1e293b;
        }
        
        .login-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        
        .login-icon {
          font-size: 3rem;
          display: block;
          margin-bottom: 1rem;
        }
        
        .login-header h1 {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
          color: #1e293b;
        }
        
        :global(body.dark) .login-header h1 {
          color: #f1f5f9;
        }
        
        .login-header p {
          color: #64748b;
          font-size: 0.85rem;
        }
        
        .input-group {
          margin-bottom: 1rem;
        }
        
        input {
          width: 100%;
          padding: 12px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 1rem;
          transition: all 0.2s;
        }
        
        input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        
        button {
          width: 100%;
          padding: 12px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        button:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }
        
        button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .error {
          color: #dc2626;
          font-size: 0.85rem;
          margin-bottom: 1rem;
          text-align: center;
        }
      `}</style>
    </div>
  )
}