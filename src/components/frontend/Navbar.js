// src/components/frontend/Navbar.js

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import AuthModal from './AuthModal'

export default function Navbar() {
  const [showDropdown, setShowDropdown] = useState(false) // For Explore dropdown
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const [user, setUser] = useState(null)
  const [showUserMenu, setShowUserMenu] = useState(false) // For three dots menu
  const dropdownRef = useRef(null)
  const threeDotsMenuRef = useRef(null)
  const mobileMenuRef = useRef(null)

  const categories = [
    { name: "Health", icon: "🌿", slug: "health" },
    { name: "Wealth", icon: "💰", slug: "wealth" },
    { name: "Tech", icon: "⚡", slug: "tech" },
    { name: "Growth", icon: "🌱", slug: "growth" },
    { name: "Entertainment", icon: "🎬", slug: "entertainment" },
    { name: "World", icon: "🌍", slug: "world" },
    { name: "Lifestyle", icon: "✨", slug: "lifestyle" }
  ]

  // Check auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me')
        const data = await res.json()
        if (data.authenticated) setUser(data.user)
      } catch (error) { console.error('Auth check failed:', error) }
    }
    checkAuth()
  }, [])

  // Theme setup
  useEffect(() => {
    const saved = localStorage.getItem('theme')
    const isDark = saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)
    setIsDarkMode(isDark)
    if (isDark) document.documentElement.classList.add('dark')
  }, [])

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowDropdown(false)
      if (threeDotsMenuRef.current && !threeDotsMenuRef.current.contains(e.target)) setShowUserMenu(false)
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target)) setShowMobileMenu(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Listen for global auth events
  useEffect(() => {
    const handleOpenAuth = (e) => {
      setAuthMode(e.detail)
      setShowAuthModal(true)
    }
    window.addEventListener('openAuth', handleOpenAuth)
    return () => window.removeEventListener('openAuth', handleOpenAuth)
  }, [])

  // Listen for auth complete event
  useEffect(() => {
    const handleAuthComplete = async () => {
      const res = await fetch('/api/auth/me')
      const data = await res.json()
      if (data.authenticated) setUser(data.user)
    }
    window.addEventListener('authComplete', handleAuthComplete)
    return () => window.removeEventListener('authComplete', handleAuthComplete)
  }, [])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (showMobileMenu) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [showMobileMenu])

  const toggleTheme = () => {
    const newMode = !isDarkMode
    setIsDarkMode(newMode)
    if (newMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    setShowUserMenu(false)
    setShowMobileMenu(false)
    window.dispatchEvent(new CustomEvent('showToast', { 
      detail: { message: 'Logged out successfully', type: 'success', duration: 3000 }
    }))
  }

  const openLogin = () => {
    setAuthMode('login')
    setShowAuthModal(true)
    setShowMobileMenu(false)
  }

  const openSignup = () => {
    setAuthMode('signup')
    setShowAuthModal(true)
    setShowMobileMenu(false)
  }

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.email) return 'U'
    return user.email.charAt(0).toUpperCase()
  }

  // Get user's display name
  const getDisplayName = () => {
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name
    if (user?.email) return user.email.split('@')[0]
    return 'User'
  }

  return (
    <>
      <nav style={{ 
        position: 'sticky', top: 0, 
        background: 'var(--navbar-bg, white)', 
        borderBottom: '1px solid var(--navbar-border, #eee)',
        padding: '0 16px', 
        zIndex: 100, 
        transition: 'all 0.3s ease'
      }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 64 }}>
          
          {/* LOGO */}
          <Link href="/" style={{ fontSize: 24, fontWeight: 'bold', textDecoration: 'none', color: 'var(--logo-color, #111)' }}>
            trendlin<span style={{ color: '#e11d48' }}>.</span>
          </Link>

          {/* Desktop Navigation - Visible on tablets and up */}
          <div className="desktop-nav">
            {/* EXPLORE DROPDOWN */}
            <div style={{ position: 'relative' }} ref={dropdownRef}>
              <button onClick={() => setShowDropdown(!showDropdown)} style={{
                background: 'transparent', color: 'var(--explore-color, #666)', border: 'none',
                padding: '8px 14px', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 500
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--explore-hover-bg, #f5f5f5)'; e.currentTarget.style.color = 'var(--explore-hover-color, #111)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--explore-color, #666)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
                <span>Explore</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  style={{ transition: 'transform 0.15s', transform: showDropdown ? 'rotate(180deg)' : 'rotate(0)' }}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {showDropdown && (
                <div style={{
                  position: 'absolute', top: 42, left: 0, minWidth: 180,
                  background: 'var(--dropdown-bg, white)', borderRadius: 12,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)', border: '1px solid var(--dropdown-border, #eaeaea)',
                  overflow: 'hidden', zIndex: 200
                }}>
                  {categories.map((cat) => (
                    <Link 
                      key={cat.name} 
                      href={`/category/${cat.slug}`}
                      onClick={() => setShowDropdown(false)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px',
                        textDecoration: 'none', color: 'var(--dropdown-item-color, #444)', fontSize: 13,
                        transition: 'background 0.2s', cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--dropdown-item-hover-bg, #f5f5f5)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <span style={{ fontSize: 16 }}>{cat.icon}</span>
                      <span>{cat.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* PROFILE AVATAR */}
            {!user ? (
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={openLogin} style={{
                  background: 'transparent', border: '1px solid var(--auth-btn-border, #ddd)',
                  padding: '6px 16px', borderRadius: 8, cursor: 'pointer', color: 'var(--auth-btn-color, #666)', fontSize: 13, fontWeight: 500
                }}>Sign In</button>
                <button onClick={openSignup} style={{
                  background: '#e11d48', border: 'none', padding: '6px 16px', borderRadius: 8,
                  cursor: 'pointer', color: 'white', fontSize: 13, fontWeight: 500
                }}>Sign Up</button>
              </div>
            ) : (
              <Link href="/profile" style={{ textDecoration: 'none' }}>
                <div className="profile-avatar" style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)' }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none' }}>
                  <span style={{ color: 'white', fontSize: 14, fontWeight: 600 }}>
                    {getUserInitials()}
                  </span>
                </div>
              </Link>
            )}

            {/* THREE DOTS BUTTON */}
            <div style={{ position: 'relative' }} ref={threeDotsMenuRef}>
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="three-dots-btn"
                style={{
                  background: 'transparent', border: 'none', padding: '8px',
                  borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', color: 'var(--icon-color, #666)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--icon-hover-bg, #f5f5f5)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="5" r="1.5" fill="currentColor" />
                  <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                  <circle cx="12" cy="19" r="1.5" fill="currentColor" />
                </svg>
              </button>

              {/* THREE DOTS MENU - Dark Mode, Bookmarks, Manage Newsletter, Edit Profile */}
              {showUserMenu && (
                <div style={{
                  position: 'absolute', top: 42, right: 0, minWidth: 220,
                  background: 'var(--dropdown-bg, white)', borderRadius: 12,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)', border: '1px solid var(--dropdown-border, #eaeaea)',
                  overflow: 'hidden', zIndex: 200
                }}>
                  {/* User info header */}
                  {user && (
                    <div style={{ 
                      padding: '12px 16px', 
                      borderBottom: '1px solid var(--user-info-border, #eaeaea)',
                      background: 'var(--user-info-bg, #fafafa)'
                    }}>
                      <div style={{ fontWeight: 600, color: 'var(--user-email-color, #111)', fontSize: 13 }}>
                        {getDisplayName()}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--user-plan-color, #999)', marginTop: 4 }}>
                        {user?.email}
                      </div>
                    </div>
                  )}

                  {/* Dark/Light Mode Toggle */}
                  <button 
                    onClick={() => {
                      toggleTheme()
                      setShowUserMenu(false)
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                      background: 'transparent', border: 'none', width: '100%', textAlign: 'left',
                      cursor: 'pointer', color: 'var(--dropdown-item-color, #444)', fontSize: 13,
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--dropdown-item-hover-bg, #f5f5f5)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <span style={{ fontSize: 18 }}>{isDarkMode ? '☀️' : '🌙'}</span>
                    <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
                  </button>

                  {/* Bookmarks */}
                  <Link 
                    href={user ? "/bookmarks" : "#"}
                    onClick={() => {
                      setShowUserMenu(false)
                      if (!user) {
                        window.dispatchEvent(new CustomEvent('openAuth', { detail: 'signup' }))
                      }
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                      textDecoration: 'none', color: 'var(--dropdown-item-color, #444)', fontSize: 13,
                      transition: 'background 0.2s', cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--dropdown-item-hover-bg, #f5f5f5)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <span style={{ fontSize: 18 }}>🔖</span>
                    <span>Bookmarks</span>
                  </Link>

                  {/* Manage Newsletter */}
                  <Link 
                    href={user ? "/newsletter/manage" : "#"}
                    onClick={() => {
                      setShowUserMenu(false)
                      if (!user) {
                        window.dispatchEvent(new CustomEvent('openAuth', { detail: 'signup' }))
                      }
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                      textDecoration: 'none', color: 'var(--dropdown-item-color, #444)', fontSize: 13,
                      transition: 'background 0.2s', cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--dropdown-item-hover-bg, #f5f5f5)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <span style={{ fontSize: 18 }}>📬</span>
                    <span>Manage Newsletter</span>
                  </Link>

                  {/* Edit Profile */}
                  <Link 
                    href="/settings"
                    onClick={() => setShowUserMenu(false)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                      textDecoration: 'none', color: 'var(--dropdown-item-color, #444)', fontSize: 13,
                      transition: 'background 0.2s', cursor: 'pointer',
                      borderTop: '1px solid var(--menu-border, #eaeaea)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--dropdown-item-hover-bg, #f5f5f5)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <span style={{ fontSize: 18 }}>✏️</span>
                    <span>Edit Profile</span>
                  </Link>

                  {/* Sign Out - only if logged in */}
                  {user && (
                    <button 
                      onClick={handleLogout}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                        background: 'transparent', border: 'none', width: '100%', textAlign: 'left',
                        cursor: 'pointer', color: '#ef4444', fontSize: 13,
                        transition: 'background 0.2s', borderTop: '1px solid var(--menu-border, #eaeaea)'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <span style={{ fontSize: 18 }}>🚪</span>
                      <span>Sign Out</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mobile Navigation Buttons */}
          <div className="mobile-nav-buttons">
            {/* Hamburger Menu Button */}
            <button 
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="mobile-menu-btn"
              style={{
                background: 'transparent',
                border: 'none',
                width: 36,
                height: 36,
                borderRadius: 8,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
                color: 'var(--icon-color, #666)'
              }}
            >
              {showMobileMenu ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu (Hamburger) */}
      {showMobileMenu && (
        <>
          <div className="mobile-menu-overlay" onClick={() => setShowMobileMenu(false)}></div>
          <div className="mobile-menu" ref={mobileMenuRef}>
            <div className="mobile-menu-header">
              <div style={{ fontWeight: 600, color: 'var(--logo-color, #111)' }}>Menu</div>
              <button 
                onClick={() => setShowMobileMenu(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: 20,
                  cursor: 'pointer',
                  color: 'var(--icon-color, #666)'
                }}
              >
                ✕
              </button>
            </div>

            {/* User info in mobile if logged in */}
            {user && (
              <div style={{ 
                padding: '16px', 
                borderBottom: '1px solid var(--menu-border, #eaeaea)',
                background: 'var(--user-info-bg, #fafafa)'
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 12 
                }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <span style={{ color: 'white', fontSize: 18, fontWeight: 600 }}>{getUserInitials()}</span>
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--user-email-color, #111)' }}>{getDisplayName()}</div>
                    <div style={{ fontSize: 12, color: 'var(--user-plan-color, #999)' }}>{user?.email}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Dark/Light Mode in Mobile */}
            <button 
              onClick={() => {
                toggleTheme()
                setShowMobileMenu(false)
              }}
              className="mobile-menu-item"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '14px 16px',
                textDecoration: 'none',
                color: 'var(--menu-item-color, #444)',
                fontSize: 15,
                borderBottom: '1px solid var(--menu-border, #eaeaea)',
                background: 'transparent',
                border: 'none',
                width: '100%',
                textAlign: 'left',
                cursor: 'pointer'
              }}
            >
              <span style={{ fontSize: 20 }}>{isDarkMode ? '☀️' : '🌙'}</span>
              <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </button>

            {/* Bookmarks in Mobile */}
            <Link 
              href={user ? "/bookmarks" : "#"}
              onClick={() => {
                setShowMobileMenu(false)
                if (!user) {
                  window.dispatchEvent(new CustomEvent('openAuth', { detail: 'signup' }))
                }
              }}
              className="mobile-menu-item"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '14px 16px',
                textDecoration: 'none',
                color: 'var(--menu-item-color, #444)',
                fontSize: 15,
                borderBottom: '1px solid var(--menu-border, #eaeaea)'
              }}
            >
              <span style={{ fontSize: 20 }}>🔖</span>
              <span>Bookmarks</span>
            </Link>

            {/* Manage Newsletter in Mobile */}
            <Link 
              href={user ? "/newsletter/manage" : "#"}
              onClick={() => {
                setShowMobileMenu(false)
                if (!user) {
                  window.dispatchEvent(new CustomEvent('openAuth', { detail: 'signup' }))
                }
              }}
              className="mobile-menu-item"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '14px 16px',
                textDecoration: 'none',
                color: 'var(--menu-item-color, #444)',
                fontSize: 15,
                borderBottom: '1px solid var(--menu-border, #eaeaea)'
              }}
            >
              <span style={{ fontSize: 20 }}>📬</span>
              <span>Manage Newsletter</span>
            </Link>

            {/* Edit Profile in Mobile */}
            <Link 
              href="/settings"
              onClick={() => setShowMobileMenu(false)}
              className="mobile-menu-item"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '14px 16px',
                textDecoration: 'none',
                color: 'var(--menu-item-color, #444)',
                fontSize: 15,
                borderBottom: '1px solid var(--menu-border, #eaeaea)'
              }}
            >
              <span style={{ fontSize: 20 }}>✏️</span>
              <span>Edit Profile</span>
            </Link>

            {/* Explore Categories in Mobile */}
            <div style={{ 
              padding: '8px 0',
              borderBottom: '1px solid var(--menu-border, #eaeaea)'
            }}>
              <div style={{ 
                padding: '8px 16px', 
                fontSize: 12, 
                fontWeight: 600, 
                color: 'var(--user-plan-color, #999)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Explore Categories
              </div>
              {categories.map((cat) => (
                <Link 
                  key={cat.name} 
                  href={`/category/${cat.slug}`}
                  onClick={() => setShowMobileMenu(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 16px',
                    textDecoration: 'none',
                    color: 'var(--menu-item-color, #444)',
                    fontSize: 14,
                    cursor: 'pointer'
                  }}
                >
                  <span style={{ fontSize: 18 }}>{cat.icon}</span>
                  <span>{cat.name}</span>
                </Link>
              ))}
            </div>

            {/* Auth Section in Mobile (if not logged in) */}
            {!user && (
              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button onClick={openLogin} style={{
                  width: '100%',
                  padding: '12px',
                  background: 'transparent',
                  border: '1px solid var(--auth-btn-border, #ddd)',
                  borderRadius: 8,
                  cursor: 'pointer',
                  color: 'var(--auth-btn-color, #666)',
                  fontSize: 14,
                  fontWeight: 500
                }}>Sign In</button>
                <button onClick={openSignup} style={{
                  width: '100%',
                  padding: '12px',
                  background: '#e11d48',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  color: 'white',
                  fontSize: 14,
                  fontWeight: 500
                }}>Sign Up</button>
              </div>
            )}

            {/* Sign Out in Mobile (if logged in) */}
            {user && (
              <button 
                onClick={handleLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '14px 16px',
                  color: '#ef4444',
                  fontSize: 15,
                  background: 'transparent',
                  border: 'none',
                  width: '100%',
                  textAlign: 'left',
                  cursor: 'pointer',
                  borderTop: '1px solid var(--menu-border, #eaeaea)',
                  marginTop: 8
                }}
              >
                <span style={{ fontSize: 20 }}>🚪</span>
                <span>Sign Out</span>
              </button>
            )}
          </div>
        </>
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal 
          isOpen={showAuthModal} 
          mode={authMode} 
          onClose={() => setShowAuthModal(false)} 
          onLogin={(userData) => { 
            setUser(userData)
            setShowAuthModal(false)
            window.dispatchEvent(new CustomEvent('authComplete'))
          }} 
        />
      )}

      <style jsx>{`
        /* Desktop Navigation - Visible on tablets and up */
        .desktop-nav {
          display: flex;
          gap: 16px;
          align-items: center;
        }
        
        /* Mobile Navigation Buttons */
        .mobile-nav-buttons {
          display: none;
          align-items: center;
          gap: 8px;
        }
        
        /* Mobile Styles */
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          
          .mobile-nav-buttons {
            display: flex !important;
          }
        }
        
        /* Profile Avatar Hover */
        .profile-avatar {
          transition: transform 0.2s, box-shadow 0.2s;
        }
        
        /* Three Dots Button Hover */
        .three-dots-btn {
          transition: background 0.2s;
        }
        
        /* Mobile Menu Overlay */
        .mobile-menu-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          z-index: 1000;
          animation: fadeIn 0.2s ease;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .mobile-menu {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          width: 80%;
          max-width: 320px;
          background: var(--navbar-bg, white);
          box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
          animation: slideIn 0.3s ease;
          overflow-y: auto;
          z-index: 1001;
        }
        
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        
        .mobile-menu-header {
          padding: 20px 16px;
          border-bottom: 1px solid var(--menu-border, #eaeaea);
          font-size: 18px;
          font-weight: 600;
          position: sticky;
          top: 0;
          background: var(--navbar-bg, white);
          z-index: 10;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        /* CSS Variables for theming */
        :root {
          --navbar-bg: #ffffff;
          --navbar-border: #eeeeee;
          --logo-color: #111111;
          --icon-color: #666666;
          --icon-hover-bg: #f5f5f5;
          --explore-color: #666666;
          --explore-hover-bg: #f5f5f5;
          --explore-hover-color: #111111;
          --dropdown-bg: #ffffff;
          --dropdown-border: #eaeaea;
          --dropdown-item-color: #444444;
          --dropdown-item-hover-bg: #f5f5f5;
          --auth-btn-border: #dddddd;
          --auth-btn-color: #666666;
          --user-info-border: #eaeaea;
          --user-info-bg: #fafafa;
          --user-email-color: #111111;
          --user-plan-color: #999999;
          --menu-item-color: #444444;
          --menu-border: #eaeaea;
        }
        
        /* Dark mode */
        :global(.dark) {
          --navbar-bg: #0a0a0a;
          --navbar-border: #2a2a2a;
          --logo-color: #ffffff;
          --icon-color: #e0e0e0;
          --icon-hover-bg: #1a1a1a;
          --explore-color: #e0e0e0;
          --explore-hover-bg: #1a1a1a;
          --explore-hover-color: #ffffff;
          --dropdown-bg: #1a1a1a;
          --dropdown-border: #2a2a2a;
          --dropdown-item-color: #e0e0e0;
          --dropdown-item-hover-bg: #2a2a2a;
          --auth-btn-border: #3a3a3a;
          --auth-btn-color: #e0e0e0;
          --user-info-border: #2a2a2a;
          --user-info-bg: #0f0f0f;
          --user-email-color: #ffffff;
          --user-plan-color: #666666;
          --menu-item-color: #e0e0e0;
          --menu-border: #2a2a2a;
        }
      `}</style>
    </>
  )
}