// src/components/frontend/BookmarkButton.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

export default function BookmarkButton({ 
  postId, 
  postTitle = '', 
  postSlug = '', 
  postExcerpt = '',
  featuredImage = '',
  tags = [],
  variant = 'floating' 
}) {
  const { user, loading: authLoading } = useAuth();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if post is bookmarked
  useEffect(() => {
    if (!user || !postSlug) {
      setLoading(false);
      return;
    }

    const checkBookmark = async () => {
      try {
        const { data, error } = await supabase
          .from('bookmarks')
          .select('id')
          .eq('user_id', user.id)
          .eq('post_slug', postSlug)
          .maybeSingle();
        
        if (!error && data) {
          setIsBookmarked(true);
        }
      } catch (error) {
        console.error('Check bookmark error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkBookmark();
  }, [user, postSlug]);

  const handleClick = async () => {
    if (!user) {
      window.dispatchEvent(new CustomEvent('openAuth', { detail: 'signup' }));
      window.dispatchEvent(new CustomEvent('showToast', { 
        detail: { message: 'Sign in to save bookmarks', type: 'info', duration: 3000 }
      }));
      return;
    }

    setLoading(true);

    try {
      if (isBookmarked) {
        // REMOVE bookmark
        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('post_slug', postSlug);
        
        if (error) throw error;
        
        setIsBookmarked(false);
        
        // Dispatch event for real-time update
        window.dispatchEvent(new CustomEvent('bookmarkChanged'));
        
        window.dispatchEvent(new CustomEvent('showToast', { 
          detail: { message: 'Removed from bookmarks', type: 'success', duration: 3000 }
        }));
      } else {
        // ADD bookmark
        const bookmarkData = {
          user_id: user.id,
          post_id: postId,
          post_title: postTitle,
          post_slug: postSlug,
          post_excerpt: postExcerpt || '',
          featured_image_url: featuredImage || '',
          custom_tags: tags,
          created_at: new Date().toISOString(),
          is_favorite: false,
          read_later: false,
          archived: false
        };
        
        const { error } = await supabase
          .from('bookmarks')
          .insert(bookmarkData);
        
        if (error) throw error;
        
        setIsBookmarked(true);
        
        // Dispatch event for real-time update
        window.dispatchEvent(new CustomEvent('bookmarkChanged'));
        
        window.dispatchEvent(new CustomEvent('showToast', { 
          detail: { message: 'Saved to bookmarks!', type: 'success', duration: 3000 }
        }));
      }
    } catch (error) {
      console.error('Bookmark operation failed:', error);
      
      window.dispatchEvent(new CustomEvent('showToast', { 
        detail: { message: `Error: ${error.message}`, type: 'error', duration: 4000 }
      }));
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <button className="bookmark-btn loading" disabled>
        <svg className="icon-spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
          <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
        </svg>
        <style jsx>{`
          .bookmark-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            width: 36px;
            height: 36px;
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(8px);
            border: 1px solid rgba(203, 213, 225, 0.5);
            border-radius: 12px;
            cursor: wait;
            opacity: 0.6;
            font-size: 13px;
            color: #64748b;
            transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          }
          .icon-spinner {
            width: 18px;
            height: 18px;
            animation: spin 0.8s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`bookmark-btn ${isBookmarked ? 'saved' : ''}`}
      aria-label={isBookmarked ? 'Remove bookmark' : 'Save bookmark'}
      title={isBookmarked ? 'Remove from bookmarks' : 'Save to bookmarks'}
    >
      <svg className="bookmark-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        {isBookmarked ? (
          <path d="M5 3h14a2 2 0 0 1 2 2v16l-7-4-7 4V5a2 2 0 0 1 2-2z" fill="currentColor" stroke="currentColor" />
        ) : (
          <path d="M5 3h14a2 2 0 0 1 2 2v16l-7-4-7 4V5a2 2 0 0 1 2-2z" />
        )}
      </svg>
      
      <style jsx>{`
        .bookmark-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(203, 213, 225, 0.4);
          border-radius: 14px;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          color: #64748b;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02);
        }
        
        .bookmark-btn:hover {
          transform: scale(1.08);
          background: white;
          border-color: rgba(139, 92, 246, 0.3);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
          color: #8b5cf6;
        }
        
        .bookmark-btn.saved {
          background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
          border-color: rgba(139, 92, 246, 0.5);
          color: white;
          box-shadow: 0 6px 16px rgba(139, 92, 246, 0.25);
        }
        
        .bookmark-btn.saved:hover {
          transform: scale(1.08);
          background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
          box-shadow: 0 10px 24px rgba(139, 92, 246, 0.35);
        }
        
        .bookmark-icon {
          width: 18px;
          height: 18px;
          transition: transform 0.2s ease;
        }
        
        .bookmark-btn:hover .bookmark-icon {
          transform: scale(1.02);
        }
        
        .bookmark-btn.saved .bookmark-icon {
          filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
        }
        
        /* Dark mode */
        :global(.dark) .bookmark-btn {
          background: rgba(30, 41, 59, 0.9);
          backdrop-filter: blur(12px);
          border-color: rgba(71, 85, 105, 0.5);
          color: #94a3b8;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }
        
        :global(.dark) .bookmark-btn:hover {
          background: rgba(51, 65, 85, 0.95);
          color: #a78bfa;
          border-color: rgba(139, 92, 246, 0.4);
        }
        
        :global(.dark) .bookmark-btn.saved {
          background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
          color: white;
        }
        
        /* Loading state */
        .bookmark-btn.loading {
          cursor: wait;
          opacity: 0.7;
          transform: none;
        }
        
        /* Mobile tap optimization */
        @media (hover: none) and (pointer: coarse) {
          .bookmark-btn {
            background: rgba(255, 255, 255, 0.98);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          }
          .bookmark-btn:active {
            transform: scale(0.96);
          }
          :global(.dark) .bookmark-btn {
            background: rgba(30, 41, 59, 0.98);
          }
        }
        
        /* Reduced motion preference */
        @media (prefers-reduced-motion: reduce) {
          .bookmark-btn,
          .bookmark-btn:hover,
          .bookmark-icon {
            transition: none;
          }
          .bookmark-btn:hover {
            transform: none;
          }
        }
      `}</style>
    </button>
  );
}