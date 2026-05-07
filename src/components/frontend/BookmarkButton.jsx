// ============================================
// BOOKMARK BUTTON - COMPLETE WORKING VERSION
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
  variant = 'floating'
}) {
  const [userId, setUserId] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);

  // Function to check auth and bookmark status
  const checkAuthAndBookmark = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/me', {
        credentials: 'include',
        headers: { 'Cache-Control': 'no-cache' }
      });
      
      const data = await res.json();
      console.log('BookmarkButton auth check:', data.authenticated ? 'Logged in' : 'Not logged in');
      
      if (data.authenticated && data.user) {
        const uid = data.user.id;
        setUserId(uid);
        
        const { data: bookmark, error } = await supabase
          .from('bookmarks')
          .select('id')
          .eq('user_id', uid)
          .eq('post_id', parseInt(postId))
          .maybeSingle();
        
        if (!error) {
          setIsBookmarked(!!bookmark);
        }
      } else {
        setUserId(null);
        setIsBookmarked(false);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setUserId(null);
    } finally {
      setLoading(false);
    }
  };

  // Initial check
  useEffect(() => {
    if (postId) {
      checkAuthAndBookmark();
    }
  }, [postId]);

  // Listen for auth changes
  useEffect(() => {
    const handleAuthChange = () => {
      console.log('Auth change detected, rechecking...');
      checkAuthAndBookmark();
    };

    window.addEventListener('authComplete', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);
    
    return () => {
      window.removeEventListener('authComplete', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, [postId]);

  const handleBookmark = async () => {
    if (!userId) {
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
        toast.success('Saved to bookmarks!', { duration: 3000, icon: '✅' });
      } else {
        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', userId)
          .eq('post_id', parseInt(postId));
        
        if (error) throw error;
        
        setIsBookmarked(false);
        toast.success('Removed from bookmarks', { duration: 3000, icon: '🗑️' });
      }
    } catch (error) {
      console.error('Bookmark error:', error);
      toast.error('Failed to save bookmark', { duration: 4000, icon: '❌' });
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    const size = variant === 'compact' ? 16 : 20;
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
        <Loader2 size={size} className="animate-spin" color={variant === 'inline' ? '#666' : 'white'} />
      </button>
    );
  }

  const style = getButtonStyle();

  return (
    <button
      onClick={handleBookmark}
      aria-label={isBookmarked ? 'Remove bookmark' : 'Save bookmark'}
      style={style}
      onMouseEnter={(e) => { if (variant !== 'inline') e.currentTarget.style.transform = 'scale(1.05)'; }}
      onMouseLeave={(e) => { if (variant !== 'inline') e.currentTarget.style.transform = 'scale(1)'; }}
    >
      {isBookmarked ? (
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