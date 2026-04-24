// src/components/frontend/Navbar.js

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import AuthModal from './AuthModal'

export default function Navbar() {
  const [show, setShow] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const [user, setUser] = useState(null)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showAuthPopup, setShowAuthPopup] = useState(false)
  const dropdownRef = useRef(null)
  const userMenuRef = useRef(null)
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
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShow(false)
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setShowUserMenu(false)
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target)) setShowMobileMenu(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Listen for global auth events
  useEffect(() => {
    const handleOpenAuth = (e) => {
      console.log('Navbar received event:', e.detail)
      setAuthMode(e.detail)
      setShowAuthModal(true)
    }
    window.addEventListener('openAuth', handleOpenAuth)
    return () => window.removeEventListener('openAuth', handleOpenAuth)
  }, [])

  // Auto-hide auth popup after 4 seconds
  useEffect(() => {
    if (showAuthPopup) {
      const timer = setTimeout(() => {
        setShowAuthPopup(false)
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [showAuthPopup])

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
  }

  const openLogin = () => {
    console.log('Opening login modal')
    setAuthMode('login')
    setShowAuthModal(true)
    setShowMobileMenu(false)
  }

  const openSignup = () => {
    console.log('Opening signup modal')
    setAuthMode('signup')
    setShowAuthModal(true)
    setShowMobileMenu(false)
  }

  // Handle bookmark click - if logged in, go to bookmarks page; if not, show popup
  const handleBookmarkClick = (e) => {
    if (!user) {
      e.preventDefault()
      setShowAuthPopup(true)
      setShowMobileMenu(false)
    }
  }

  const openSignupFromPopup = () => {
    setShowAuthPopup(false)
    openSignup()
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
          
          <Link href="/" style={{ fontSize: 24, fontWeight: 'bold', textDecoration: 'none', color: 'var(--logo-color, #111)' }}>
            trendlin<span style={{ color: '#e11d48' }}>.</span>
          </Link>

          {/* Desktop Navigation - Visible on tablets and up */}
          <div className="desktop-nav">
            {/* Bookmark Icon */}
            <Link 
              href={user ? "/bookmarks" : "#"} 
              style={{ textDecoration: 'none' }}
              onClick={handleBookmarkClick}
            >
              <button className="nav-icon-btn" style={{
                background: 'transparent', border: 'none', width: 36, height: 36, borderRadius: 8,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, color: 'var(--icon-color, #666)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--icon-hover-bg, #f5f5f5)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                🔖
              </button>
            </Link>

            {/* Dark Mode Toggle */}
            <button className="nav-icon-btn" onClick={toggleTheme} style={{
              background: 'var(--theme-btn-bg, #f5f5f5)', border: 'none', width: 36, height: 36,
              borderRadius: 8, cursor: 'pointer', fontSize: 16, color: 'var(--theme-btn-color, #666)'
            }}>{isDarkMode ? '☀️' : '🌙'}</button>

            {/* Explore Dropdown - DESKTOP VERSION */}
            <div style={{ position: 'relative' }} ref={dropdownRef}>
              <button onClick={() => setShow(!show)} style={{
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
                  style={{ transition: 'transform 0.15s', transform: show ? 'rotate(180deg)' : 'rotate(0)' }}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {show && (
                <div style={{
                  position: 'absolute', top: 42, right: 0, minWidth: 180,
                  background: 'var(--dropdown-bg, white)', borderRadius: 12,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)', border: '1px solid var(--dropdown-border, #eaeaea)',
                  overflow: 'hidden', zIndex: 200
                }}>
                  {categories.map((cat) => (
                    <Link 
                      key={cat.name} 
                      href={`/category/${cat.slug}`}
                      onClick={() => {
                        console.log('Desktop: Clicked', cat.slug);
                        setShow(false);
                      }}
                      style={{
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 10, 
                        padding: '10px 16px',
                        textDecoration: 'none', 
                        color: 'var(--dropdown-item-color, #444)', 
                        fontSize: 13,
                        transition: 'background 0.2s',
                        cursor: 'pointer'
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

            {/* Auth Section */}
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
              <div style={{ position: 'relative' }} ref={userMenuRef}>
                <button onClick={() => setShowUserMenu(!showUserMenu)} style={{
                  background: 'var(--user-btn-bg, #f5f5f5)', border: 'none', padding: '6px 12px',
                  borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                  color: 'var(--user-btn-color, #444)', fontSize: 13, fontWeight: 500
                }}>
                  <span>👤</span>
                  <span>{user?.email?.split('@')[0]}</span>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    style={{ transition: 'transform 0.15s', transform: showUserMenu ? 'rotate(180deg)' : 'rotate(0)' }}>
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {showUserMenu && (
                  <div style={{
                    position: 'absolute', top: 42, right: 0, minWidth: 200,
                    background: 'var(--dropdown-bg, white)', borderRadius: 12,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)', border: '1px solid var(--dropdown-border, #eaeaea)',
                    overflow: 'hidden', zIndex: 200
                  }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--user-info-border, #eaeaea)', background: 'var(--user-info-bg, #fafafa)' }}>
                      <div style={{ fontWeight: 600, color: 'var(--user-email-color, #111)', fontSize: 13 }}>{user?.email}</div>
                      <div style={{ fontSize: 11, color: 'var(--user-plan-color, #999)', marginTop: 4 }}>Free Account</div>
                    </div>
                    <Link href="/settings" onClick={() => setShowUserMenu(false)} style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px',
                      textDecoration: 'none', color: 'var(--menu-item-color, #444)', fontSize: 13
                    }}><span>⚙️</span><span>Settings</span></Link>
                    <Link href="/newsletter/manage" onClick={() => setShowUserMenu(false)} style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px',
                      textDecoration: 'none', color: 'var(--menu-item-color, #444)', fontSize: 13,
                      borderTop: '1px solid var(--menu-border, #eaeaea)'
                    }}><span>📬</span><span>Newsletter</span></Link>
                    <button onClick={handleLogout} style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px',
                      color: '#ef4444', fontSize: 13, background: 'transparent', border: 'none',
                      width: '100%', textAlign: 'left', cursor: 'pointer',
                      borderTop: '1px solid var(--menu-border, #eaeaea)'
                    }}><span>🚪</span><span>Sign Out</span></button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Navigation - Only Explore button + Hamburger */}
          <div className="mobile-nav-buttons">
            {/* Explore Button - MOBILE VERSION */}
            <div style={{ position: 'relative' }}>
              <button onClick={() => setShow(!show)} style={{
                background: 'transparent', color: 'var(--explore-color, #666)', border: 'none',
                padding: '6px 10px', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
                <span>Explore</span>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  style={{ transition: 'transform 0.15s', transform: show ? 'rotate(180deg)' : 'rotate(0)' }}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {show && (
                <div style={{
                  position: 'absolute', top: 42, right: 0, minWidth: 180,
                  background: 'var(--dropdown-bg, white)', borderRadius: 12,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)', border: '1px solid var(--dropdown-border, #eaeaea)',
                  overflow: 'hidden', zIndex: 200
                }}>
                  {categories.map((cat) => (
                    <Link 
                      key={cat.name} 
                      href={`/category/${cat.slug}`}
                      onClick={() => {
                        console.log('Mobile: Clicked', cat.slug);
                        setShow(false);
                      }} 
                      style={{
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 10, 
                        padding: '10px 16px',
                        textDecoration: 'none', 
                        color: 'var(--dropdown-item-color, #444)', 
                        fontSize: 13,
                        cursor: 'pointer'
                      }}
                    >
                      <span style={{ fontSize: 16 }}>{cat.icon}</span>
                      <span>{cat.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

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
            
            {/* Bookmark in Mobile */}
            <Link 
              href={user ? "/bookmarks" : "#"} 
              className="mobile-menu-item"
              onClick={handleBookmarkClick}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 16px',
                textDecoration: 'none',
                color: 'var(--menu-item-color, #444)',
                fontSize: 15,
                borderBottom: '1px solid var(--menu-border, #eaeaea)'
              }}
            >
              <span style={{ fontSize: 20 }}>🔖</span>
              <span>Bookmarks</span>
            </Link>

            {/* Dark Mode in Mobile */}
            <button 
              onClick={() => {
                toggleTheme();
                setShowMobileMenu(false);
              }}
              className="mobile-menu-item"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 16px',
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

            {/* Categories in Mobile */}
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

            {/* Auth Section in Mobile */}
            {!user ? (
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
            ) : (
              <div style={{ padding: '16px' }}>
                <div style={{ 
                  padding: '12px', 
                  background: 'var(--user-info-bg, #fafafa)',
                  borderRadius: 8,
                  marginBottom: 12
                }}>
                  <div style={{ fontWeight: 600, color: 'var(--user-email-color, #111)', fontSize: 13, wordBreak: 'break-all' }}>
                    {user?.email}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--user-plan-color, #999)', marginTop: 4 }}>Free Account</div>
                </div>
                <Link href="/settings" onClick={() => setShowMobileMenu(false)} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '12px',
                  textDecoration: 'none',
                  color: 'var(--menu-item-color, #444)',
                  fontSize: 14,
                  borderRadius: 8
                }}><span>⚙️</span><span>Settings</span></Link>
                <Link href="/newsletter/manage" onClick={() => setShowMobileMenu(false)} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '12px',
                  textDecoration: 'none',
                  color: 'var(--menu-item-color, #444)',
                  fontSize: 14,
                  borderRadius: 8
                }}><span>📬</span><span>Newsletter</span></Link>
                <button onClick={handleLogout} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '12px',
                  color: '#ef4444',
                  fontSize: 14,
                  background: 'transparent',
                  border: 'none',
                  width: '100%',
                  textAlign: 'left',
                  cursor: 'pointer',
                  borderRadius: 8,
                  marginTop: 8
                }}><span>🚪</span><span>Sign Out</span></button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Auth Popup for Navbar Bookmark */}
      {showAuthPopup && (
        <div className="nav-auth-popup">
          <div className="nav-auth-popup-content">
            <div className="nav-auth-popup-icon">🔖</div>
            <div className="nav-auth-popup-text">
              <h4>Save your favorite articles</h4>
              <p>Create a free account to bookmark posts and subscribe to our newsletter</p>
            </div>
            <div className="nav-auth-popup-buttons">
              <button onClick={openSignupFromPopup} className="nav-auth-popup-btn-primary">
                Sign up free →
              </button>
              <button onClick={() => setShowAuthPopup(false)} className="nav-auth-popup-btn-secondary">
                Maybe later
              </button>
            </div>
            <button onClick={() => setShowAuthPopup(false)} className="nav-auth-popup-close">
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal 
          isOpen={showAuthModal} 
          mode={authMode} 
          onClose={() => {
            console.log('Closing modal')
            setShowAuthModal(false)
          }} 
          onLogin={(userData) => { 
            console.log('Login successful:', userData)
            setUser(userData); 
            setShowAuthModal(false);
            window.dispatchEvent(new CustomEvent('authComplete'));
          }} 
        />
      )}

      <style jsx>{`
        /* Desktop Navigation - Visible on tablets and desktop */
        .desktop-nav {
          display: flex;
          gap: 12px;
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
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
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
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
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
        
        .mobile-menu-item {
          transition: background 0.2s;
        }
        
        .mobile-menu-item:active {
          background: var(--dropdown-item-hover-bg, #f5f5f5);
        }
        
        /* Navbar Auth Popup Styles */
        .nav-auth-popup {
          position: fixed;
          top: 80px;
          right: 16px;
          left: 16px;
          z-index: 10000;
          animation: slideDownPopup 0.3s ease;
        }
        
        @media (min-width: 640px) {
          .nav-auth-popup {
            left: auto;
            right: 24px;
          }
        }
        
        @keyframes slideDownPopup {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .nav-auth-popup-content {
          background: var(--popup-bg, white);
          border-radius: 20px;
          padding: 20px;
          width: 100%;
          max-width: 320px;
          margin: 0 auto;
          box-shadow: 0 20px 35px -10px rgba(0, 0, 0, 0.2);
          border: 1px solid var(--popup-border, #e2e8f0);
          position: relative;
        }
        
        @media (min-width: 640px) {
          .nav-auth-popup-content {
            width: 320px;
            margin: 0;
          }
        }
        
        .nav-auth-popup-icon {
          font-size: 2.5rem;
          text-align: center;
          margin-bottom: 12px;
        }
        
        .nav-auth-popup-text h4 {
          margin: 0 0 8px 0;
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--popup-title-color, #0f172a);
          text-align: center;
        }
        
        .nav-auth-popup-text p {
          margin: 0 0 20px 0;
          font-size: 0.8rem;
          color: var(--popup-text-color, #64748b);
          text-align: center;
          line-height: 1.4;
        }
        
        .nav-auth-popup-buttons {
          display: flex;
          gap: 10px;
          flex-direction: column;
        }
        
        @media (min-width: 480px) {
          .nav-auth-popup-buttons {
            flex-direction: row;
          }
        }
        
        .nav-auth-popup-btn-primary {
          flex: 2;
          padding: 10px;
          background: linear-gradient(135deg, #06b6d4, #0891b2);
          border: none;
          border-radius: 40px;
          color: white;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .nav-auth-popup-btn-primary:active {
          transform: translateY(0);
        }
        
        .nav-auth-popup-btn-secondary {
          flex: 1;
          padding: 10px;
          background: var(--popup-btn-secondary-bg, #f1f5f9);
          border: none;
          border-radius: 40px;
          color: var(--popup-btn-secondary-color, #64748b);
          font-size: 0.8rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .nav-auth-popup-close {
          position: absolute;
          top: 12px;
          right: 12px;
          background: var(--popup-close-bg, #f1f5f9);
          border: none;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          font-size: 11px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--popup-close-color, #64748b);
          transition: all 0.2s;
        }
        
        /* CSS Variables for theming */
        :root {
          --navbar-bg: #ffffff;
          --navbar-border: #eeeeee;
          --logo-color: #111111;
          --icon-color: #666666;
          --icon-hover-bg: #f5f5f5;
          --theme-btn-bg: #f5f5f5;
          --theme-btn-color: #666666;
          --explore-color: #666666;
          --explore-hover-bg: #f5f5f5;
          --explore-hover-color: #111111;
          --dropdown-bg: #ffffff;
          --dropdown-border: #eaeaea;
          --dropdown-item-color: #444444;
          --dropdown-item-hover-bg: #f5f5f5;
          --auth-btn-border: #dddddd;
          --auth-btn-color: #666666;
          --user-btn-bg: #f5f5f5;
          --user-btn-color: #444444;
          --user-info-border: #eaeaea;
          --user-info-bg: #fafafa;
          --user-email-color: #111111;
          --user-plan-color: #999999;
          --menu-item-color: #444444;
          --menu-border: #eaeaea;
          --popup-bg: #ffffff;
          --popup-border: #e2e8f0;
          --popup-title-color: #0f172a;
          --popup-text-color: #64748b;
          --popup-btn-secondary-bg: #f1f5f9;
          --popup-btn-secondary-color: #64748b;
          --popup-close-bg: #f1f5f9;
          --popup-close-color: #64748b;
        }
        
        /* Dark mode */
        :global(.dark) {
          --navbar-bg: #0a0a0a;
          --navbar-border: #2a2a2a;
          --logo-color: #ffffff;
          --icon-color: #e0e0e0;
          --icon-hover-bg: #1a1a1a;
          --theme-btn-bg: #1a1a1a;
          --theme-btn-color: #e0e0e0;
          --explore-color: #e0e0e0;
          --explore-hover-bg: #1a1a1a;
          --explore-hover-color: #ffffff;
          --dropdown-bg: #1a1a1a;
          --dropdown-border: #2a2a2a;
          --dropdown-item-color: #e0e0e0;
          --dropdown-item-hover-bg: #2a2a2a;
          --auth-btn-border: #3a3a3a;
          --auth-btn-color: #e0e0e0;
          --user-btn-bg: #1a1a1a;
          --user-btn-color: #e0e0e0;
          --user-info-border: #2a2a2a;
          --user-info-bg: #0f0f0f;
          --user-email-color: #ffffff;
          --user-plan-color: #666666;
          --menu-item-color: #e0e0e0;
          --menu-border: #2a2a2a;
          --popup-bg: #1e293b;
          --popup-border: #334155;
          --popup-title-color: #ffffff;
          --popup-text-color: #94a3b8;
          --popup-btn-secondary-bg: #334155;
          --popup-btn-secondary-color: #94a3b8;
          --popup-close-bg: #334155;
          --popup-close-color: #94a3b8;
        }
        
        /* Desktop hover effects */
        @media (min-width: 769px) {
          .nav-icon-btn:hover {
            background: var(--icon-hover-bg, #f5f5f5) !important;
          }
          
          .nav-auth-popup-btn-primary:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(6, 182, 212, 0.3);
          }
          
          .nav-auth-popup-btn-secondary:hover {
            background: var(--popup-btn-secondary-hover-bg, #e2e8f0);
            color: var(--popup-btn-secondary-hover-color, #0f172a);
          }
          
          .nav-auth-popup-close:hover {
            background: var(--popup-close-hover-bg, #e2e8f0);
            color: var(--popup-close-hover-color, #0f172a);
          }
        }
      `}</style>
    </>
  )
}