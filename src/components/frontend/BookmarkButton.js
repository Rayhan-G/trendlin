// src/components/frontend/BookmarkButton.js
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function BookmarkButton({ postId, postTitle, postSlug, className = '' }) {
  const [user, setUser] = useState(null)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)
  const [tooltipText, setTooltipText] = useState('')

  useEffect(() => {
    const checkAuth = async () => {
      const res = await fetch('/api/auth/me')
      const data = await res.json()
      if (data.authenticated) {
        setUser(data.user)
        const { data: bookmark } = await supabase
          .from('bookmarks')
          .select('id')
          .eq('user_id', data.user.id)
          .eq('post_id', postId)
          .maybeSingle()
        setIsBookmarked(!!bookmark)
      }
    }
    checkAuth()
  }, [postId])

  useEffect(() => {
    const handleAuthComplete = async () => {
      const res = await fetch('/api/auth/me')
      const data = await res.json()
      if (data.authenticated) {
        setUser(data.user)
        const { data: bookmark } = await supabase
          .from('bookmarks')
          .select('id')
          .eq('user_id', data.user.id)
          .eq('post_id', postId)
          .maybeSingle()
        setIsBookmarked(!!bookmark)
      }
    }
    window.addEventListener('authComplete', handleAuthComplete)
    return () => window.removeEventListener('authComplete', handleAuthComplete)
  }, [postId])

  useEffect(() => {
    if (showTooltip) {
      const timer = setTimeout(() => setShowTooltip(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [showTooltip])

  const displayTooltip = (msg) => {
    setTooltipText(msg)
    setShowTooltip(true)
  }

  const toggleBookmark = async () => {
    if (!user) {
      displayTooltip('🔖 Sign in to save bookmarks')
      return
    }

    setLoading(true)
    try {
      if (isBookmarked) {
        await supabase.from('bookmarks').delete().eq('user_id', user.id).eq('post_id', postId)
        setIsBookmarked(false)
        displayTooltip('❌ Removed from bookmarks')
      } else {
        await supabase.from('bookmarks').insert({
          user_id: user.id,
          post_id: postId,
          post_title: postTitle,
          post_slug: postSlug,
          bookmarked_at: new Date().toISOString()
        })
        setIsBookmarked(true)
        displayTooltip('✅ Saved to bookmarks')
      }
    } catch (error) {
      displayTooltip('❌ Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={toggleBookmark}
        disabled={loading}
        className={`bookmark-btn ${isBookmarked ? 'active' : ''} ${className}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '36px',
          height: '36px',
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '50%',
          cursor: 'pointer',
          color: 'white',
          transition: 'all 0.2s',
          position: 'relative'
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
        </svg>
        {loading && (
          <span style={{
            position: 'absolute',
            width: '16px',
            height: '16px',
            border: '2px solid rgba(255,255,255,0.3)',
            borderTopColor: '#f59e0b',
            borderRadius: '50%',
            animation: 'spin 0.6s linear infinite'
          }} />
        )}
      </button>

      {/* Tooltip under the button - Dark mode supportive */}
      {showTooltip && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginTop: '8px',
          background: 'var(--tooltip-bg, #1e293b)',
          color: 'var(--tooltip-text, white)',
          padding: '6px 12px',
          borderRadius: '8px',
          fontSize: '12px',
          fontWeight: '500',
          whiteSpace: 'nowrap',
          zIndex: 10001,
          animation: 'fadeInUp 0.2s ease',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          pointerEvents: 'none',
          backdropFilter: 'var(--tooltip-blur, none)',
          border: 'var(--tooltip-border, none)'
        }}>
          {tooltipText}
          {/* Tooltip arrow */}
          <div style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderBottom: `6px solid var(--tooltip-arrow, #1e293b)`
          }} />
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(5px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
        
        /* Default light mode variables */
        :root {
          --tooltip-bg-light: #1e293b;
          --tooltip-text-light: #ffffff;
          --tooltip-arrow-light: #1e293b;
          --tooltip-bg-dark: #0f172a;
          --tooltip-text-dark: #f1f5f9;
          --tooltip-arrow-dark: #0f172a;
        }
        
        /* Light mode (default) */
        .bookmark-btn {
          --tooltip-bg: var(--tooltip-bg-light);
          --tooltip-text: var(--tooltip-text-light);
          --tooltip-arrow: var(--tooltip-arrow-light);
        }
        
        /* Dark mode detection */
        @media (prefers-color-scheme: dark) {
          .bookmark-btn {
            --tooltip-bg: var(--tooltip-bg-dark);
            --tooltip-text: var(--tooltip-text-dark);
            --tooltip-arrow: var(--tooltip-arrow-dark);
          }
          
          button {
            background: rgba(15, 23, 42, 0.8) !important;
            border-color: rgba(255, 255, 255, 0.1) !important;
          }
          
          button.active {
            background: rgba(15, 23, 42, 0.9) !important;
            border-color: rgba(245, 158, 11, 0.5) !important;
          }
          
          button:hover:not(:disabled) {
            background: rgba(15, 23, 42, 0.95) !important;
          }
        }
        
        /* Optional: Add class-based dark mode support for manual toggling */
        .dark .bookmark-btn {
          --tooltip-bg: var(--tooltip-bg-dark);
          --tooltip-text: var(--tooltip-text-dark);
          --tooltip-arrow: var(--tooltip-arrow-dark);
        }
        
        .dark button {
          background: rgba(15, 23, 42, 0.8) !important;
          border-color: rgba(255, 255, 255, 0.1) !important;
        }
        
        .dark button.active {
          background: rgba(15, 23, 42, 0.9) !important;
          border-color: rgba(245, 158, 11, 0.5) !important;
        }
        
        .dark button:hover:not(:disabled) {
          background: rgba(15, 23, 42, 0.95) !important;
        }
        
        button.active {
          color: #f59e0b !important;
          background: rgba(0, 0, 0, 0.7) !important;
          border-color: rgba(245, 158, 11, 0.5) !important;
        }
        
        button:hover:not(:disabled) {
          background: rgba(0, 0, 0, 0.8) !important;
          transform: scale(1.05);
        }
        
        button:disabled {
          cursor: not-allowed;
          opacity: 0.7;
        }
      `}</style>
    </div>
  )
}