// src/components/frontend/BookmarkButton.js

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function BookmarkButton({ postId, postTitle = '', postSlug = '', className = '' }) {
  const [user, setUser] = useState(null)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)
  const [tooltipText, setTooltipText] = useState('')

  useEffect(() => {
    const checkAuthAndBookmark = async () => {
      try {
        const res = await fetch('/api/auth/me')
        const data = await res.json()
        
        if (data.authenticated) {
          setUser(data.user)
          
          // Check if bookmark exists - try multiple column names
          let bookmarkExists = false
          
          // Try with post_id only (simple table)
          const { data: bookmark, error } = await supabase
            .from('bookmarks')
            .select('id')
            .eq('user_id', data.user.id)
            .eq('post_id', postId)
            .maybeSingle()
          
          bookmarkExists = !!bookmark
          setIsBookmarked(bookmarkExists)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
      }
    }
    
    if (postId) {
      checkAuthAndBookmark()
    }
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
        // Remove bookmark
        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', postId)
        
        if (error) throw error
        
        setIsBookmarked(false)
        displayTooltip('❌ Removed from bookmarks')
      } else {
        // Add bookmark - try to save with available data
        const bookmarkData = {
          user_id: user.id,
          post_id: postId,
          bookmarked_at: new Date().toISOString()
        }
        
        // Add optional fields if they exist (table might have these columns)
        if (postTitle) bookmarkData.post_title = postTitle
        if (postSlug) bookmarkData.post_slug = postSlug
        
        const { error } = await supabase
          .from('bookmarks')
          .insert(bookmarkData)
        
        if (error) throw error
        
        setIsBookmarked(true)
        displayTooltip('✅ Saved to bookmarks')
      }
    } catch (error) {
      console.error('Bookmark error:', error)
      displayTooltip('❌ Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bookmark-container">
      <button
        onClick={toggleBookmark}
        disabled={loading}
        className={`bookmark-btn ${isBookmarked ? 'active' : ''} ${className}`}
        aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
      >
        <svg 
          width="18" 
          height="18" 
          viewBox="0 0 24 24" 
          fill={isBookmarked ? 'currentColor' : 'none'} 
          stroke="currentColor" 
          strokeWidth="1.5"
        >
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
        </svg>
        {loading && <span className="loading-spinner" />}
      </button>

      {showTooltip && (
        <div className="tooltip" role="alert">
          <div className="tooltip-content">
            <span className="tooltip-text">{tooltipText}</span>
          </div>
        </div>
      )}

      <style jsx>{`
        .bookmark-container {
          position: relative;
          display: inline-block;
          isolation: isolate;
        }
        
        button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          cursor: pointer;
          color: white;
          transition: all 0.2s ease;
          position: relative;
          outline: none;
        }
        
        button:active {
          transform: scale(0.95);
        }
        
        button.active {
          color: #f59e0b;
          background: rgba(0, 0, 0, 0.7);
          border-color: rgba(245, 158, 11, 0.5);
        }
        
        button:hover:not(:disabled) {
          background: rgba(0, 0, 0, 0.8);
          transform: scale(1.05);
        }
        
        button:disabled {
          cursor: not-allowed;
          opacity: 0.7;
        }
        
        .loading-spinner {
          position: absolute;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: #f59e0b;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        /* Tooltip Styles */
        .tooltip {
          position: fixed;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 999;
          animation: slideUp 0.3s ease;
          pointer-events: none;
        }
        
        .tooltip-content {
          background: #1e293b;
          color: white;
          padding: 10px 16px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 500;
          text-align: center;
          white-space: nowrap;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
        
        @media (min-width: 768px) {
          .tooltip {
            position: absolute;
            bottom: auto;
            top: 100%;
            left: 50%;
            transform: translateX(-50%);
            margin-top: 8px;
          }
          
          .tooltip-content {
            padding: 6px 12px;
            font-size: 12px;
          }
          
          .tooltip::before {
            content: '';
            position: absolute;
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            width: 0;
            height: 0;
            border-left: 6px solid transparent;
            border-right: 6px solid transparent;
            border-bottom: 6px solid #1e293b;
          }
        }
        
        @media (max-width: 480px) {
          .tooltip-content {
            white-space: normal;
            max-width: 280px;
          }
        }
      `}</style>
    </div>
  )
}