import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const [showAdminModal, setShowAdminModal] = useState(false)
  const [adminPassword, setAdminPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  // Check if already logged in
  useEffect(() => {
    const sessionToken = localStorage.getItem('admin_session_token')
    const sessionExpiry = localStorage.getItem('admin_session_expiry')
    
    if (sessionToken && sessionExpiry && Date.now() < parseInt(sessionExpiry)) {
      setIsAdmin(true)
    }
  }, [])

  const handleAdminLogin = async (e) => {
    e.preventDefault()
    setPasswordLoading(true)
    setPasswordError('')

    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPassword })
      })

      const data = await res.json()

      if (data.success) {
        const expiry = Date.now() + (24 * 60 * 60 * 1000)
        localStorage.setItem('admin_session_token', 'logged_in')
        localStorage.setItem('admin_session_expiry', expiry.toString())
        setIsAdmin(true)
        setShowAdminModal(false)
        setAdminPassword('')
        window.location.href = '/admin'
      } else {
        setPasswordError('Invalid password')
      }
    } catch (error) {
      setPasswordError('Network error. Please try again.')
    } finally {
      setPasswordLoading(false)
    }
  }

  const legalLinks = [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms & Conditions', href: '/terms' },
    { name: 'About Us', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ]

  const socialLinks = [
    { 
      name: 'X', 
      href: 'https://x.com/trendlinsocial', 
      brandClass: 'x',
      icon: (props) => (
        <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      )
    },
    { 
      name: 'Facebook', 
      href: 'https://www.facebook.com/trendlinsocial', 
      brandClass: 'facebook',
      icon: (props) => (
        <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      )
    },
    { 
      name: 'Instagram', 
      href: 'https://www.instagram.com/trendlinsocial/', 
      brandClass: 'instagram',
      icon: (props) => (
        <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z"/>
        </svg>
      )
    },
  ]

  return (
    <>
      <footer className="footer">
        <div className="footer-container">
          {/* Three Column Grid */}
          <div className="footer-grid">
            {/* Column 1: About */}
            <div className="footer-about">
              <Link href="/" className="footer-logo">
                <span className="logo-text">trendlin</span>
                <span className="logo-dot">.</span>
              </Link>
              <p className="about-text">
                Curating the latest trends and insights to help you stay ahead in a fast-changing world.
              </p>
            </div>

            {/* Column 2: Legal Links */}
            <div className="footer-legal">
              <h3>Legal</h3>
              <div className="footer-links">
                {legalLinks.map((link) => (
                  <Link key={link.name} href={link.href} className="footer-link">
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Column 3: Social Icons */}
            <div className="footer-social-col">
              <h3>Follow Us</h3>
              <div className="footer-social">
                {socialLinks.map((social) => {
                  const Icon = social.icon
                  return (
                    <a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`social-link ${social.brandClass}`}
                      aria-label={social.name}
                    >
                      <Icon />
                    </a>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Copyright with Tiny Admin Icon */}
          <div className="footer-copyright">
            <p>© {currentYear} trendlin. All rights reserved.</p>
            {/* Tiny unnoticeable admin icon */}
            <div className="admin-icon-container">
              {!isAdmin ? (
                <button 
                  onClick={() => setShowAdminModal(true)}
                  className="admin-icon"
                  title="Admin Access"
                >
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M5 20v-2a7 7 0 0 1 14 0v2" />
                  </svg>
                </button>
              ) : (
                <Link href="/admin" className="admin-icon" title="Go to Admin">
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M8 7h8M8 12h6M8 17h4" />
                  </svg>
                </Link>
              )}
            </div>
          </div>
        </div>
      </footer>

      {/* Admin Password Modal */}
      {showAdminModal && (
        <div className="modal-overlay" onClick={() => setShowAdminModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-icon">🔐</span>
              <h3>Admin Access</h3>
              <button className="modal-close" onClick={() => setShowAdminModal(false)}>×</button>
            </div>
            <form onSubmit={handleAdminLogin}>
              <div className="modal-body">
                <input
                  type="password"
                  placeholder="Enter admin password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  autoFocus
                  className="password-input"
                  disabled={passwordLoading}
                />
                {passwordError && <div className="error-message">{passwordError}</div>}
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowAdminModal(false)} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" disabled={passwordLoading} className="submit-btn">
                  {passwordLoading ? 'Verifying...' : 'Access Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .footer {
          background: #fafafa;
          border-top: 1px solid #e5e7eb;
          margin-top: 4rem;
        }
        
        :global(body.dark) .footer {
          background: #0f0f13;
          border-top-color: #1f1f2a;
        }
        
        .footer-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 3rem 2rem 2rem;
        }
        
        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 2rem;
          margin-bottom: 2rem;
        }
        
        /* Logo */
        .footer-logo {
          display: inline-flex;
          align-items: baseline;
          text-decoration: none;
          margin-bottom: 1rem;
        }
        
        .logo-text {
          font-size: 1.5rem;
          font-weight: 700;
          background: linear-gradient(135deg, #1a1a1a 0%, #404040 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          letter-spacing: -0.02em;
        }
        
        .logo-dot {
          font-size: 1.5rem;
          font-weight: 700;
          background: linear-gradient(135deg, #e11d48 0%, #f43f5e 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        
        :global(body.dark) .logo-text {
          background: linear-gradient(135deg, #e4e4e7 0%, #a1a1aa 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        
        :global(body.dark) .logo-dot {
          background: linear-gradient(135deg, #fb7185 0%, #f43f5e 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        
        .about-text {
          font-size: 0.85rem;
          line-height: 1.5;
          color: #6b7280;
          max-width: 280px;
        }
        
        :global(body.dark) .about-text {
          color: #9ca3af;
        }
        
        /* Column Headers */
        .footer-legal h3,
        .footer-social-col h3 {
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 1rem;
          color: #9ca3af;
        }
        
        :global(body.dark) .footer-legal h3,
        :global(body.dark) .footer-social-col h3 {
          color: #6b7280;
        }
        
        /* Legal Links */
        .footer-links {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .footer-link {
          font-size: 0.85rem;
          color: #6b7280;
          text-decoration: none;
          transition: color 0.2s;
        }
        
        .footer-link:hover {
          color: #111827;
          text-decoration: underline;
        }
        
        :global(body.dark) .footer-link {
          color: #9ca3af;
        }
        
        :global(body.dark) .footer-link:hover {
          color: #f9fafb;
        }
        
        /* Social Icons */
        .footer-social {
          display: flex;
          gap: 0.75rem;
        }
        
        .social-link {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: #f3f4f6;
          color: #4b5563;
          transition: all 0.2s;
        }
        
        :global(body.dark) .social-link {
          background: #1f1f2a;
          color: #9ca3af;
        }
        
        .social-link svg {
          width: 18px;
          height: 18px;
        }
        
        .social-link:hover {
          transform: translateY(-2px);
        }
        
        .social-link.x:hover {
          background: #000000;
          color: white;
        }
        
        .social-link.facebook:hover {
          background: #1877f2;
          color: white;
        }
        
        .social-link.instagram:hover {
          background: linear-gradient(135deg, #f58529, #dd2a7b, #8134af);
          color: white;
        }
        
        /* Copyright */
        .footer-copyright {
          text-align: center;
          padding-top: 2rem;
          border-top: 1px solid #e5e7eb;
          position: relative;
        }
        
        :global(body.dark) .footer-copyright {
          border-top-color: #1f1f2a;
        }
        
        .footer-copyright p {
          font-size: 0.75rem;
          color: #9ca3af;
        }
        
        :global(body.dark) .footer-copyright p {
          color: #6b7280;
        }
        
        /* Tiny Unnoticeable Admin Icon */
        .admin-icon-container {
          position: absolute;
          bottom: 0;
          right: 0;
          opacity: 0.15;
          transition: opacity 0.2s;
        }
        
        .admin-icon-container:hover {
          opacity: 0.5;
        }
        
        .admin-icon {
          background: none;
          border: none;
          cursor: pointer;
          color: #64748b;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
          transition: all 0.2s;
        }
        
        .admin-icon:hover {
          color: #667eea;
        }
        
        /* Modal */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .modal-content {
          background: white;
          border-radius: 12px;
          width: 90%;
          max-width: 380px;
        }
        
        :global(body.dark) .modal-content {
          background: #1e293b;
        }
        
        .modal-header {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 1rem 1.25rem;
          border-bottom: 1px solid #e2e8f0;
        }
        
        .modal-header h3 {
          flex: 1;
          font-size: 1rem;
        }
        
        .modal-close {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
        }
        
        .modal-body {
          padding: 1.25rem;
        }
        
        .password-input {
          width: 100%;
          padding: 10px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
        }
        
        .error-message {
          margin-top: 0.75rem;
          color: #ef4444;
          font-size: 0.75rem;
        }
        
        .modal-footer {
          display: flex;
          gap: 0.75rem;
          padding: 1rem 1.25rem;
          border-top: 1px solid #e2e8f0;
          justify-content: flex-end;
        }
        
        .cancel-btn {
          padding: 8px 16px;
          background: #f1f5f9;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }
        
        .submit-btn {
          padding: 8px 16px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }
        
        /* Mobile Responsive */
        @media (max-width: 768px) {
          .footer-container {
            padding: 2rem 1.5rem 1.5rem;
          }
          
          .footer-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
            text-align: center;
          }
          
          .about-text {
            max-width: 100%;
            margin: 0 auto;
          }
          
          .footer-links {
            align-items: center;
          }
          
          .footer-social {
            justify-content: center;
          }
          
          .admin-icon-container {
            opacity: 0.3;
          }
        }
      `}</style>
    </>
  )
}