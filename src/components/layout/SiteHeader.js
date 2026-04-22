// In your header or footer component
import { useState, useEffect } from 'react'
import AuthModal from '../components/frontend/AuthModal'
import NewsletterAccount from '../components/frontend/NewsletterAccount'

export default function SiteHeader() {
  const [user, setUser] = useState(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check session on load
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated) {
          setUser(data)
        }
        setLoading(false)
      })
  }, [])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
  }

  return (
    <>
      <header>
        <div className="logo">Your Site</div>
        <div className="auth-section">
          {loading ? (
            <span>...</span>
          ) : user ? (
            <div className="user-menu">
              <span>{user.user.email}</span>
              <button onClick={handleLogout}>Logout</button>
            </div>
          ) : (
            <button onClick={() => setShowAuthModal(true)} className="signup-btn">
              Sign up for newsletter →
            </button>
          )}
        </div>
      </header>

      {/* Show newsletter preferences only for logged-in users */}
      {user && (
        <div className="newsletter-section">
          <NewsletterAccount user={user} onSubscribeChange={(subscribed) => {
            console.log('Newsletter subscription changed:', subscribed)
          }} />
        </div>
      )}

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        onLogin={(userData) => {
          setUser({ authenticated: true, user: userData, newsletter: { is_subscribed: false } })
        }}
      />
    </>
  )
}