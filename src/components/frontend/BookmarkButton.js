// src/components/frontend/BookmarkButton.jsx

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

// Icons
import { 
  Bookmark, 
  BookmarkCheck, 
  Loader2, 
  FolderPlus, 
  Tag, 
  Star,
  MoreHorizontal,
  Share2
} from 'lucide-react'

export default function BookmarkButton({ 
  postId, 
  postTitle = '', 
  postSlug = '', 
  postExcerpt = '',
  featuredImage = '',
  className = '',
  variant = 'floating' // floating, inline, compact
}) {
  const [user, setUser] = useState(null)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [importance, setImportance] = useState(3)
  const [notes, setNotes] = useState('')
  const [showNotes, setShowNotes] = useState(false)
  const [bookmarkId, setBookmarkId] = useState(null)
  const menuRef = useRef(null)

  // Fetch user and bookmark status
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/auth/me')
        const data = await res.json()
        
        if (data.authenticated) {
          setUser(data.user)
          
          // Fetch bookmark details
          const { data: bookmark } = await supabase
            .from('bookmarks')
            .select('id, category_id, importance_level, notes')
            .eq('user_id', data.user.id)
            .eq('post_id', postId)
            .maybeSingle()
          
          if (bookmark) {
            setIsBookmarked(true)
            setBookmarkId(bookmark.id)
            setSelectedCategory(bookmark.category_id)
            setImportance(bookmark.importance_level || 3)
            setNotes(bookmark.notes || '')
          }
          
          // Fetch user categories
          const { data: userCategories } = await supabase
            .from('bookmark_categories')
            .select('id, name, icon, color')
            .eq('user_id', data.user.id)
            .order('position', { ascending: true })
          
          setCategories(userCategories || [])
        }
      } catch (error) {
        console.error('Error:', error)
      }
    }
    
    fetchData()
  }, [postId])

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false)
        setShowNotes(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleBookmark = async () => {
    if (!user) {
      toast.error('Sign in to save bookmarks', {
        icon: '🔖',
        duration: 4000
      })
      return
    }

    setLoading(true)
    
    try {
      if (!isBookmarked) {
        // Create bookmark with advanced metadata
        const { data, error } = await supabase
          .from('bookmarks')
          .insert({
            user_id: user.id,
            post_id: parseInt(postId),
            post_title: postTitle,
            post_slug: postSlug,
            post_excerpt: postExcerpt,
            featured_image_url: featuredImage,
            category_id: selectedCategory,
            importance_level: importance,
            notes: notes,
            custom_metadata: {
              bookmarked_from: window.location.pathname,
              bookmarked_at_device: navigator.userAgent,
              referrer: document.referrer
            }
          })
          .select()
          .single()
        
        if (error) throw error
        
        setBookmarkId(data.id)
        setIsBookmarked(true)
        toast.success('Saved to bookmarks', {
          duration: 3000,
          icon: '✅'
        })
      } else {
        // Update existing bookmark with new metadata
        const { error } = await supabase
          .from('bookmarks')
          .update({
            category_id: selectedCategory,
            importance_level: importance,
            notes: notes,
            updated_at: new Date().toISOString()
          })
          .eq('id', bookmarkId)
        
        if (error) throw error
        
        toast.success('Bookmark updated', {
          duration: 2000,
          icon: '✏️'
        })
      }
      
      setShowMenu(false)
    } catch (error) {
      console.error('Bookmark error:', error)
      toast.error('Failed to save bookmark', {
        duration: 4000,
        icon: '❌'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async () => {
    if (!bookmarkId) return
    
    setLoading(true)
    
    try {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('id', bookmarkId)
      
      if (error) throw error
      
      setIsBookmarked(false)
      setBookmarkId(null)
      setSelectedCategory(null)
      setImportance(3)
      setNotes('')
      setShowMenu(false)
      
      toast.success('Removed from bookmarks', {
        duration: 3000,
        icon: '🗑️'
      })
    } catch (error) {
      console.error('Remove error:', error)
      toast.error('Failed to remove bookmark', {
        duration: 4000,
        icon: '❌'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleShare = async () => {
    if (!bookmarkId) return
    
    try {
      const shareData = {
        title: postTitle,
        text: `Check out this post I bookmarked: ${postTitle}`,
        url: `${window.location.origin}/blog/${postSlug}`
      }
      
      if (navigator.share) {
        await navigator.share(shareData)
        toast.success('Shared successfully!', { icon: '🔗' })
      } else {
        await navigator.clipboard.writeText(shareData.url)
        toast.success('Link copied to clipboard!', { icon: '📋' })
      }
      
      // Track share analytics
      await supabase.from('bookmark_analytics').insert({
        user_id: user.id,
        bookmark_id: bookmarkId,
        event_type: 'share',
        device_info: { userAgent: navigator.userAgent, platform: navigator.platform }
      })
    } catch (error) {
      console.error('Share error:', error)
    }
  }

  // Animation variants
  const menuVariants = {
    hidden: { opacity: 0, scale: 0.95, y: -10 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.2 } },
    exit: { opacity: 0, scale: 0.95, y: -10, transition: { duration: 0.15 } }
  }

  const buttonVariants = {
    initial: { scale: 1 },
    tap: { scale: 0.9 },
    hover: { scale: 1.05, transition: { duration: 0.2 } }
  }

  return (
    <div className={`bookmark-system ${variant}`} ref={menuRef}>
      {/* Main Bookmark Button */}
      <motion.button
        variants={buttonVariants}
        initial="initial"
        whileTap="tap"
        whileHover="hover"
        onClick={() => isBookmarked ? setShowMenu(!showMenu) : handleBookmark()}
        disabled={loading}
        className={`
          bookmark-trigger
          ${isBookmarked ? 'active' : ''}
          ${variant === 'floating' ? 'floating' : ''}
          ${variant === 'compact' ? 'compact' : ''}
          ${className}
        `}
        aria-label={isBookmarked ? 'Manage bookmark' : 'Save bookmark'}
      >
        {loading ? (
          <Loader2 className="animate-spin" size={variant === 'compact' ? 16 : 20} />
        ) : (
          isBookmarked ? (
            <BookmarkCheck size={variant === 'compact' ? 16 : 20} />
          ) : (
            <Bookmark size={variant === 'compact' ? 16 : 20} />
          )
        )}
        
        {variant === 'inline' && (
          <span className="ml-2 text-sm font-medium">
            {isBookmarked ? 'Saved' : 'Save'}
          </span>
        )}
      </motion.button>

      {/* Advanced Menu Modal */}
      <AnimatePresence>
        {showMenu && isBookmarked && (
          <motion.div
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bookmark-menu"
          >
            <div className="menu-header">
              <h4>Manage Bookmark</h4>
              <button onClick={() => setShowMenu(false)} className="close-btn">×</button>
            </div>

            <div className="menu-content">
              {/* Category Selection */}
              <div className="menu-section">
                <label className="section-label">
                  <FolderPlus size={14} />
                  Category
                </label>
                <select 
                  value={selectedCategory || ''} 
                  onChange={(e) => setSelectedCategory(e.target.value || null)}
                  className="menu-select"
                >
                  <option value="">Uncategorized</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Importance Rating */}
              <div className="menu-section">
                <label className="section-label">
                  <Star size={14} />
                  Importance
                </label>
                <div className="importance-rating">
                  {[1, 2, 3, 4, 5].map(level => (
                    <button
                      key={level}
                      onClick={() => setImportance(level)}
                      className={`importance-btn ${importance >= level ? 'active' : ''}`}
                    >
                      ⭐
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="menu-section">
                <button 
                  onClick={() => setShowNotes(!showNotes)}
                  className="section-label-toggle"
                >
                  <span className="section-label">
                    📝 Notes
                  </span>
                  <span className="toggle-indicator">{showNotes ? '−' : '+'}</span>
                </button>
                
                {showNotes && (
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add private notes about this post..."
                    className="notes-input"
                    rows={3}
                  />
                )}
              </div>

              {/* Actions */}
              <div className="menu-actions">
                <button onClick={handleShare} className="action-btn share">
                  <Share2 size={14} />
                  Share
                </button>
                <button onClick={handleRemove} className="action-btn remove">
                  Remove
                </button>
                <button onClick={handleBookmark} className="action-btn save">
                  Save Changes
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .bookmark-system {
          position: relative;
          display: inline-block;
        }

        /* Bookmark Trigger Button */
        .bookmark-trigger {
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          cursor: pointer;
          color: white;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          outline: none;
          position: relative;
        }

        .bookmark-trigger.floating {
          width: 44px;
          height: 44px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .bookmark-trigger.compact {
          width: 32px;
          height: 32px;
          background: rgba(0, 0, 0, 0.6);
        }

        .bookmark-trigger.inline {
          width: auto;
          height: auto;
          background: transparent;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 8px 16px;
          color: #1e293b;
          gap: 8px;
        }

        .bookmark-trigger.active {
          color: #f59e0b;
          background: rgba(0, 0, 0, 0.85);
          border-color: rgba(245, 158, 11, 0.5);
        }

        .bookmark-trigger.inline.active {
          background: #fef3c7;
          border-color: #f59e0b;
          color: #d97706;
        }

        .bookmark-trigger:hover:not(:disabled) {
          transform: scale(1.05);
        }

        .bookmark-trigger:active:not(:disabled) {
          transform: scale(0.95);
        }

        /* Advanced Menu */
        .bookmark-menu {
          position: absolute;
          top: calc(100% + 12px);
          right: 0;
          width: 320px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 35px -8px rgba(0, 0, 0, 0.3);
          border: 1px solid #e2e8f0;
          z-index: 1000;
          overflow: hidden;
        }

        :global(.dark) .bookmark-menu {
          background: #1e293b;
          border-color: #334155;
        }

        .menu-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          border-bottom: 1px solid #e2e8f0;
        }

        :global(.dark) .menu-header {
          border-bottom-color: #334155;
        }

        .menu-header h4 {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
          color: #1e293b;
        }

        :global(.dark) .menu-header h4 {
          color: white;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #94a3b8;
          padding: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
        }

        .close-btn:hover {
          background: #f1f5f9;
        }

        .menu-content {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .menu-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .section-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 500;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .section-label-toggle {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
        }

        .toggle-indicator {
          font-size: 18px;
          color: #94a3b8;
        }

        .menu-select {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
          background: white;
          cursor: pointer;
        }

        :global(.dark) .menu-select {
          background: #0f172a;
          border-color: #334155;
          color: white;
        }

        .importance-rating {
          display: flex;
          gap: 8px;
        }

        .importance-btn {
          background: none;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 6px 12px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
          opacity: 0.5;
        }

        .importance-btn.active {
          opacity: 1;
          background: #fef3c7;
          border-color: #f59e0b;
        }

        .notes-input {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 13px;
          font-family: inherit;
          resize: vertical;
        }

        :global(.dark) .notes-input {
          background: #0f172a;
          border-color: #334155;
          color: white;
        }

        .menu-actions {
          display: flex;
          gap: 8px;
          margin-top: 8px;
          padding-top: 8px;
          border-top: 1px solid #e2e8f0;
        }

        :global(.dark) .menu-actions {
          border-top-color: #334155;
        }

        .action-btn {
          flex: 1;
          padding: 8px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .action-btn.share {
          background: #eff6ff;
          color: #3b82f6;
          border: none;
        }

        .action-btn.remove {
          background: #fef2f2;
          color: #ef4444;
          border: none;
        }

        .action-btn.save {
          background: #10b981;
          color: white;
          border: none;
        }

        .action-btn:hover {
          transform: translateY(-1px);
        }

        /* Responsive */
        @media (max-width: 640px) {
          .bookmark-menu {
            position: fixed;
            top: auto;
            bottom: 20px;
            left: 20px;
            right: 20px;
            width: auto;
            max-width: none;
          }
        }
      `}</style>
    </div>
  )
}