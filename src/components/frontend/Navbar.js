// src/components/frontend/Navbar.js

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'

export default function Navbar() {
  const [show, setShow] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const dropdownRef = useRef(null)

  const categories = [
    { name: "Health", icon: "🌿", href: "/category/health" },
    { name: "Wealth", icon: "💰", href: "/category/wealth" },
    { name: "Tech", icon: "⚡", href: "/category/tech" },
    { name: "Growth", icon: "🌱", href: "/category/growth" },
    { name: "Entertainment", icon: "🎬", href: "/category/entertainment" },
    { name: "World", icon: "🌍", href: "/category/world" },
    { name: "Lifestyle", icon: "✨", href: "/category/lifestyle" }
  ]

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    const isDark = saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)
    setIsDarkMode(isDark)
    if (isDark) document.documentElement.classList.add('dark')
  }, [])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShow(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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

  return (
    <div style={{ 
      position: 'sticky', 
      top: 0, 
      background: isDarkMode ? '#0a0a0a' : 'white', 
      borderBottom: `1px solid ${isDarkMode ? '#2a2a2a' : '#eee'}`,
      padding: '0 32px',
      zIndex: 100,
      transition: 'all 0.3s ease'
    }}>
      <div style={{ 
        maxWidth: 1400, 
        margin: '0 auto', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        height: 64
      }}>
        <Link href="/" style={{ 
          fontSize: 24, 
          fontWeight: 'bold', 
          textDecoration: 'none', 
          color: isDarkMode ? '#fff' : '#111' 
        }}>
          trendlin<span style={{ color: '#e11d48' }}>.</span>
        </Link>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {/* Dark Mode Toggle */}
          <button 
            onClick={toggleTheme}
            style={{
              background: isDarkMode ? '#1a1a1a' : '#f5f5f5',
              border: 'none',
              width: 32,
              height: 32,
              borderRadius: 8,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
              transition: 'all 0.15s ease'
            }}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>

          {/* Figma-Style Explore Button */}
          <div style={{ position: 'relative' }} ref={dropdownRef}>
            <button 
              onClick={() => setShow(!show)}
              style={{
                background: 'transparent',
                color: isDarkMode ? '#e0e0e0' : '#666',
                border: 'none',
                padding: '6px 12px',
                borderRadius: 6,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 13,
                fontWeight: 450,
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = isDarkMode ? '#1a1a1a' : '#f5f5f5'
                e.currentTarget.style.color = isDarkMode ? '#fff' : '#111'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = isDarkMode ? '#e0e0e0' : '#666'
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
              <span>Explore</span>
              <svg 
                width="10" 
                height="10" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="1.8"
                style={{ 
                  transition: 'transform 0.15s',
                  transform: show ? 'rotate(180deg)' : 'rotate(0)'
                }}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {/* Dropdown - Same for all devices */}
            {show && (
              <div style={{
                position: 'absolute',
                top: 36,
                right: 0,
                minWidth: 170,
                background: isDarkMode ? '#1a1a1a' : 'white',
                borderRadius: 10,
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                border: `1px solid ${isDarkMode ? '#2a2a2a' : '#eaeaea'}`,
                overflow: 'hidden',
                zIndex: 200
              }}>
                {categories.map((cat) => (
                  <Link
                    key={cat.name}
                    href={cat.href}
                    onClick={() => setShow(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '8px 14px',
                      textDecoration: 'none',
                      color: isDarkMode ? '#e0e0e0' : '#444',
                      fontSize: 13,
                      transition: 'all 0.1s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = isDarkMode ? '#2a2a2a' : '#f5f5f5'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <span style={{ fontSize: 15 }}>{cat.icon}</span>
                    <span>{cat.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}