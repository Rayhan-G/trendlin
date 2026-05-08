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
  variant = 'floating' 
}) {
  const { user, loading: authLoading } = useAuth();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if post is bookmarked
  useEffect(() => {
    if (!user || !postId) {
      setLoading(false);
      return;
    }

    const checkBookmark = async () => {
      try {
        const { data, error } = await supabase
          .from('bookmarks')
          .select('id')
          .eq('user_id', user.id)
          .eq('post_id', parseInt(postId))
          .maybeSingle();
        
        if (error) {
          console.error('Error checking bookmark:', error);
        } else {
          setIsBookmarked(!!data);
        }
      } catch (error) {
        console.error('Check bookmark error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkBookmark();
  }, [user, postId]);

  const handleClick = async () => {
    // NOT LOGGED IN
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
          .eq('post_id', parseInt(postId));
        
        if (error) throw error;
        
        setIsBookmarked(false);
        
        window.dispatchEvent(new CustomEvent('bookmarkUpdated', { 
          detail: { postId: parseInt(postId), isBookmarked: false }
        }));
        
        window.dispatchEvent(new CustomEvent('showToast', { 
          detail: { message: 'Removed from bookmarks', type: 'success', duration: 3000 }
        }));
      } else {
        // ADD bookmark
        const bookmarkData = {
          user_id: user.id,
          post_id: parseInt(postId),
          post_title: postTitle,
          post_slug: postSlug,
          post_excerpt: postExcerpt || '',
          featured_image_url: featuredImage || '',
          created_at: new Date().toISOString()
        };
        
        const { error } = await supabase
          .from('bookmarks')
          .insert(bookmarkData);
        
        if (error) throw error;
        
        setIsBookmarked(true);
        
        window.dispatchEvent(new CustomEvent('bookmarkUpdated', { 
          detail: { postId: parseInt(postId), isBookmarked: true }
        }));
        
        window.dispatchEvent(new CustomEvent('showToast', { 
          detail: { message: 'Saved to bookmarks!', type: 'success', duration: 3000 }
        }));
      }
    } catch (error) {
      console.error('Bookmark operation failed:', error);
      
      let errorMessage = 'Failed to save bookmark';
      if (error.code === '23505') {
        errorMessage = 'Bookmark already exists';
      } else if (error.code === '23503') {
        errorMessage = 'Invalid user or post reference';
      } else if (error.code === '42P01') {
        errorMessage = 'Bookmarks table not found';
      }
      
      window.dispatchEvent(new CustomEvent('showToast', { 
        detail: { message: errorMessage, type: 'error', duration: 4000 }
      }));
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <button className="bookmark-btn loading" disabled>
        <span className="icon">⏳</span>
        <style jsx>{`
          .bookmark-btn {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 6px 12px;
            background: #f3f4f6;
            border: 1px solid #e5e7eb;
            border-radius: 9999px;
            cursor: wait;
            opacity: 0.6;
            font-size: 13px;
            color: #6b7280;
          }
          .icon { font-size: 14px; }
        `}</style>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`bookmark-btn ${isBookmarked ? 'saved' : ''}`}
      aria-label={isBookmarked ? 'Remove bookmark' : 'Save bookmark'}
    >
      <span className="icon">{isBookmarked ? '📖' : '🔖'}</span>
      <span className="text">{isBookmarked ? 'Saved' : 'Save'}</span>
      
      <style jsx>{`
        .bookmark-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: ${isBookmarked ? '#dcfce7' : '#f3f4f6'};
          border: 1px solid ${isBookmarked ? '#86efac' : '#e5e7eb'};
          border-radius: 9999px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 13px;
          font-weight: 500;
          color: ${isBookmarked ? '#166534' : '#4b5563'};
        }
        .bookmark-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          background: ${isBookmarked ? '#bbf7d0' : '#e5e7eb'};
        }
        .bookmark-btn.saved {
          background: #dcfce7;
          border-color: #86efac;
          color: #166534;
        }
        .bookmark-btn.loading {
          opacity: 0.6;
          cursor: wait;
        }
        .icon { font-size: 14px; }
        .text { font-weight: 500; }
        @media (max-width: 640px) {
          .text { display: none; }
          .bookmark-btn { padding: 6px 10px; }
        }
      `}</style>
    </button>
  );
}