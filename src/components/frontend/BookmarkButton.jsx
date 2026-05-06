// ============================================
// BOOKMARK BUTTON - SAVE POSTS TO BOOKMARKS
// ============================================
// FILE: src/components/frontend/BookmarkButton.jsx

import { useState, useEffect } from 'react';
import { Bookmark, BookmarkCheck, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

export default function BookmarkButton({ 
  postId, 
  postTitle = '', 
  postSlug = '', 
  postExcerpt = '',
  featuredImage = '',
  variant = 'floating' // floating, inline, compact
}) {
  const [userId, setUserId] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check authentication and bookmark status
  useEffect(() => {
    const checkAuthAndBookmark = async () => {
      try {
        // Get current user from API
        const res = await fetch('/api/auth/me', {
          credentials: 'include',
          headers: { 'Cache-Control': 'no-cache' }
        });
        
        const data = await res.json();
        
        if (data.authenticated && data.user) {
          const uid = data.user.id;
          setUserId(uid);
          
          // Check if already bookmarked
          const { data: bookmark, error } = await supabase
            .from('bookmarks')
            .select('id')
            .eq('user_id', uid)
            .eq('post_id', parseInt(postId))
            .maybeSingle();
          
          if (!error) {
            setIsBookmarked(!!bookmark);
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (postId) {
      checkAuthAndBookmark();
    }
  }, [postId]);

  const handleBookmark = async () => {
    if (!userId) {
      // Trigger auth modal from navbar
      window.dispatchEvent(new CustomEvent('openAuth', { detail: 'signup' }));
      toast.error('Sign in to save bookmarks', {
        icon: '🔖',
        duration: 4000
      });
      return;
    }

    setLoading(true);
    
    try {
      if (!isBookmarked) {
        // Create bookmark
        const { error } = await supabase
          .from('bookmarks')
          .insert({
            user_id: userId,
            post_id: parseInt(postId),
            post_title: postTitle,
            post_slug: postSlug,
            post_excerpt: postExcerpt,
            featured_image_url: featuredImage,
            importance_level: 3,
            created_at: new Date().toISOString()
          });
        
        if (error) throw error;
        
        setIsBookmarked(true);
        toast.success('Saved to bookmarks!', {
          duration: 3000,
          icon: '✅'
        });
      } else {
        // Remove bookmark
        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', userId)
          .eq('post_id', parseInt(postId));
        
        if (error) throw error;
        
        setIsBookmarked(false);
        toast.success('Removed from bookmarks', {
          duration: 3000,
          icon: '🗑️'
        });
      }
    } catch (error) {
      console.error('Bookmark error:', error);
      toast.error('Failed to save bookmark', {
        duration: 4000,
        icon: '❌'
      });
    } finally {
      setLoading(false);
    }
  };

  // Button styles based on variant
  const getButtonStyle = () => {
    const baseStyle = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      border: 'none',
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
    };

    if (variant === 'floating') {
      return {
        ...baseStyle,
        width: '44px',
        height: '44px',
        borderRadius: '50%',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        color: isBookmarked ? '#f59e0b' : 'white',
      };
    }
    
    if (variant === 'compact') {
      return {
        ...baseStyle,
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        background: 'rgba(0, 0, 0, 0.6)',
        color: isBookmarked ? '#f59e0b' : 'white',
      };
    }
    
    // inline variant
    return {
      ...baseStyle,
      padding: '8px 16px',
      borderRadius: '8px',
      background: '#f3f4f6',
      border: '1px solid #e5e7eb',
      gap: '8px',
      width: 'auto',
      height: 'auto',
      color: isBookmarked ? '#f59e0b' : '#374151',
    };
  };

  // Show loading state
  if (loading) {
    return (
      <button
        disabled
        style={{
          width: variant === 'floating' ? '44px' : variant === 'compact' ? '32px' : 'auto',
          height: variant === 'floating' ? '44px' : variant === 'compact' ? '32px' : 'auto',
          padding: variant === 'inline' ? '8px 16px' : 0,
          borderRadius: variant === 'inline' ? '8px' : '50%',
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'wait',
          border: 'none'
        }}
      >
        <Loader2 size={variant === 'compact' ? 16 : 20} className="animate-spin" color={variant === 'inline' ? '#666' : 'white'} />
        {variant === 'inline' && <span style={{ marginLeft: 8, fontSize: 14 }}>Loading...</span>}
      </button>
    );
  }

  const style = getButtonStyle();

  return (
    <button
      onClick={handleBookmark}
      disabled={loading}
      aria-label={isBookmarked ? 'Remove bookmark' : 'Save bookmark'}
      style={style}
      onMouseEnter={(e) => {
        if (variant !== 'inline') {
          e.currentTarget.style.transform = 'scale(1.05)';
        }
      }}
      onMouseLeave={(e) => {
        if (variant !== 'inline') {
          e.currentTarget.style.transform = 'scale(1)';
        }
      }}
    >
      {loading ? (
        <Loader2 size={variant === 'compact' ? 16 : 20} className="animate-spin" />
      ) : isBookmarked ? (
        <BookmarkCheck size={variant === 'compact' ? 16 : 20} />
      ) : (
        <Bookmark size={variant === 'compact' ? 16 : 20} />
      )}
      
      {variant === 'inline' && (
        <span style={{ fontSize: '14px', fontWeight: 500, marginLeft: 8 }}>
          {isBookmarked ? 'Saved' : 'Save'}
        </span>
      )}
    </button>
  );
}