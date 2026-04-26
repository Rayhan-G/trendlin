// src/pages/bookmarks.js

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const fetchUserAndBookmarks = async () => {
      try {
        const res = await fetch('/api/auth/me')
        const data = await res.json()
        
        if (!data.authenticated) {
          setLoading(false)
          return
        }
        
        setUser(data.user)
        
        const { data: bookmarksData, error } = await supabase
          .from('bookmarks')
          .select('*')
          .eq('user_id', data.user.id)
          .order('bookmarked_at', { ascending: false })
        
        if (error) throw error
        
        setBookmarks(bookmarksData || [])
      } catch (error) {
        console.error('Error fetching bookmarks:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchUserAndBookmarks()
  }, [])

  const removeBookmark = async (postId) => {
    try {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('user_id', user.id)
        .eq('post_id', postId)
      
      if (error) throw error
      
      setBookmarks(bookmarks.filter(b => b.post_id !== postId))
    } catch (error) {
      console.error('Error removing bookmark:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">🔖</div>
        <h1 className="text-2xl font-bold mb-2">Sign in to view bookmarks</h1>
        <p className="text-gray-500 mb-6">Save your favorite posts and access them anytime</p>
        <Link href="/login" className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
          Sign In
        </Link>
      </div>
    )
  }

  if (bookmarks.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">📚</div>
        <h1 className="text-2xl font-bold mb-2">No bookmarks yet</h1>
        <p className="text-gray-500 mb-6">Start saving posts you want to read later</p>
        <Link href="/" className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
          Browse Posts
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Your Bookmarks</h1>
        <p className="text-gray-500">{bookmarks.length} saved {bookmarks.length === 1 ? 'post' : 'posts'}</p>
      </div>

      <div className="space-y-3">
        {bookmarks.map((bookmark) => (
          <div key={bookmark.id} className="flex items-center justify-between p-4 bg-white rounded-lg border hover:shadow-sm transition">
            <Link href={`/blog/${bookmark.post_slug || bookmark.post_id}`} className="flex-1">
              <h3 className="font-medium text-gray-900 hover:text-purple-600">
                {bookmark.post_title || `Post #${bookmark.post_id}`}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Saved on {new Date(bookmark.bookmarked_at).toLocaleDateString()}
              </p>
            </Link>
            <button
              onClick={() => removeBookmark(bookmark.post_id)}
              className="ml-4 p-2 text-gray-400 hover:text-red-500 transition"
              aria-label="Remove bookmark"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}