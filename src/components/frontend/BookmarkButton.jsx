// src/components/frontend/BookmarkButton.jsx
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'

export default function BookmarkButton({ postId, postTitle = '', postSlug = '', postExcerpt = '', variant = 'floating' }) {
  const { user, loading: authLoading } = useAuth()
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [loading, setLoading] = useState(true)

  // Check if post is bookmarked
  useEffect(() => {
    if (!user || !postId) {
      setLoading(false)
      return
    }

    const checkBookmark = async () => {
      const { data } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('user_id', user.id)
        .eq('post_id', parseInt(postId))
        .maybeSingle()
      
      setIsBookmarked(!!data)
      setLoading(false)
    }

    checkBookmark()
  }, [user, postId])

  const handleClick = async () => {
    // NOT LOGGED IN - Show signup prompt
    if (!user) {
      window.dispatchEvent(new CustomEvent('openAuth', { detail: 'signup' }))
      return
    }

    setLoading(true)

    if (isBookmarked) {
      // Remove bookmark
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('user_id', user.id)
        .eq('post_id', parseInt(postId))
      
      if (!error) setIsBookmarked(false)
    } else {
      // Add bookmark
      const { error } = await supabase
        .from('bookmarks')
        .insert({
          user_id: user.id,
          post_id: parseInt(postId),
          post_title: postTitle,
          post_slug: postSlug,
          post_excerpt: postExcerpt || '',
          created_at: new Date().toISOString()
        })
      
      if (!error) setIsBookmarked(true)
    }

    setLoading(false)
  }

  if (authLoading || loading) {
    return <button className="bookmark-btn loading">...</button>
  }

  return (
    <button onClick={handleClick} className="bookmark-btn">
      {isBookmarked ? '📖 Saved' : '🔖 Save'}
    </button>
  )
}