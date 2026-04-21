// src/components/admin/AdminLayout.js - WITHOUT NAVIGATION SIDEBAR

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

export default function AdminLayout({ children, title }) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check authentication
  useEffect(() => {
    const checkAuth = () => {
      const sessionToken = localStorage.getItem('admin_session_token')
      const sessionExpiry = localStorage.getItem('admin_session_expiry')
      
      if (sessionToken && sessionExpiry) {
        const now = Date.now()
        if (now < parseInt(sessionExpiry)) {
          setIsAuthenticated(true)
        } else {
          localStorage.removeItem('admin_session_token')
          localStorage.removeItem('admin_session_expiry')
          router.push('/admin/login')
        }
      } else {
        router.push('/admin/login')
      }
    }
    
    checkAuth()
  }, [router])

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="admin-layout">
      <main className="main-content">
        <div className="top-bar">
          <div className="top-bar-title">
            <h2>{title || 'Admin Dashboard'}</h2>
          </div>
          <button 
            onClick={() => {
              localStorage.removeItem('admin_session_token')
              localStorage.removeItem('admin_session_expiry')
              router.push('/')
            }}
            className="logout-btn"
          >
            Logout
          </button>
        </div>
        
        <div className="content-area">
          {children}
        </div>
      </main>

      <style jsx>{`
        .admin-layout {
          min-height: 100vh;
          background: #f8fafc;
        }
        
        :global(body.dark) .admin-layout {
          background: #0f172a;
        }
        
        .main-content {
          width: 100%;
          min-height: 100vh;
        }
        
        .top-bar {
          background: white;
          border-bottom: 1px solid #e2e8f0;
          padding: 0.75rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 100;
        }
        
        :global(body.dark) .top-bar {
          background: #1e293b;
          border-bottom-color: #334155;
        }
        
        .top-bar-title h2 {
          font-size: 1.1rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0;
        }
        
        :global(body.dark) .top-bar-title h2 {
          color: #f1f5f9;
        }
        
        .logout-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.4rem 1rem;
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .logout-btn:hover {
          background: #dc2626;
          transform: translateY(-1px);
        }
        
        .content-area {
          padding: 1.5rem;
          max-width: 1600px;
          margin: 0 auto;
        }
        
        @media (max-width: 768px) {
          .top-bar {
            padding: 0.6rem 1rem;
          }
          
          .content-area {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  )
}