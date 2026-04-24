import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { supabase } from '../lib/supabase'

export default function Bookmarks() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [bookmarks, setBookmarks] = useState([])
  const [loading, setLoading] = useState(true)
  const [removing, setRemoving] = useState(null)

  useEffect(() => {
    const checkAuth = async () => {
      const res = await fetch('/api/auth/me')
      const data = await res.json()
      
      if (!data.authenticated) {
        router.push('/')
        return
      }
      
      setUser(data.user)
      await fetchBookmarks(data.user.id)
      setLoading(false)
    }
    
    checkAuth()
  }, [router])

  const fetchBookmarks = async (userId) => {
    try {
      // First get bookmarks
      const { data: bookmarksData, error: bookmarksError } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', userId)
        .order('bookmarked_at', { ascending: false })
      
      if (bookmarksError) throw bookmarksError
      
      if (!bookmarksData || bookmarksData.length === 0) {
        setBookmarks([])
        return
      }
      
      // Then fetch the full post details for each bookmark
      const postIds = bookmarksData.map(b => b.post_id)
      
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .in('id', postIds)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
      
      if (postsError) throw postsError
      
      // Combine bookmark date with post data
      const combinedData = bookmarksData.map(bookmark => {
        const post = postsData?.find(p => p.id === bookmark.post_id)
        return {
          ...post,
          bookmarked_at: bookmark.bookmarked_at,
          bookmark_id: bookmark.id
        }
      }).filter(item => item.id) // Remove any null posts
      
      setBookmarks(combinedData)
    } catch (error) {
      console.error('Error fetching bookmarks:', error)
      setBookmarks([])
    }
  }

  const removeBookmark = async (postId) => {
    setRemoving(postId)
    
    try {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('user_id', user.id)
        .eq('post_id', postId)
      
      if (error) throw error
      
      setBookmarks(bookmarks.filter(b => b.id !== postId))
    } catch (error) {
      console.error('Error removing bookmark:', error)
    } finally {
      setRemoving(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="spinner"></div>
          <p className="mt-4 text-gray-600">Loading your bookmarks...</p>
        </div>
        <style jsx>{`
          .spinner {
            width: 50px;
            height: 50px;
            border: 3px solid #e2e8f0;
            border-top-color: #6366f1;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">🔖</span>
            <h1 className="text-3xl font-bold text-gray-900">Your Bookmarks</h1>
            <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
              {bookmarks.length} {bookmarks.length === 1 ? 'item' : 'items'}
            </span>
          </div>
          <p className="text-gray-600">Posts you've saved to read later</p>
        </div>

        {/* Bookmarks Grid */}
        {bookmarks.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">📖</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No bookmarks yet</h2>
            <p className="text-gray-600 mb-6">Save your favorite articles while reading</p>
            <Link href="/" className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition">
              Browse Articles →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookmarks.map((post) => (
              <article key={post.id} className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
                {/* Featured Image */}
                {post.featured_image && (
                  <Link href={`/post/${post.slug || post.id}`}>
                    <div className="relative h-48 overflow-hidden cursor-pointer">
                      <img 
                        src={post.featured_image} 
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </Link>
                )}
                
                {/* Content */}
                <div className="p-5">
                  {/* Category */}
                  {post.category && (
                    <Link href={`/category/${post.category.toLowerCase()}`}>
                      <span className="inline-block text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-md mb-3 hover:bg-purple-100 transition cursor-pointer">
                        {post.category}
                      </span>
                    </Link>
                  )}
                  
                  {/* Title */}
                  <Link href={`/post/${post.slug || post.id}`}>
                    <h2 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 hover:text-purple-600 transition cursor-pointer">
                      {post.title}
                    </h2>
                  </Link>
                  
                  {/* Excerpt */}
                  {post.excerpt && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                  )}
                  
                  {/* Meta Info */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        📅 {new Date(post.created_at).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        🔖 Saved: {new Date(post.bookmarked_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <Link href={`/post/${post.slug || post.id}`}>
                      <span className="text-purple-600 text-sm font-medium hover:text-purple-700 transition cursor-pointer">
                        Read Article →
                      </span>
                    </Link>
                    
                    <button
                      onClick={() => removeBookmark(post.id)}
                      disabled={removing === post.id}
                      className="flex items-center gap-1 text-red-500 hover:text-red-700 transition text-sm disabled:opacity-50"
                    >
                      {removing === post.id ? (
                        <span className="inline-block w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>🗑️</span>
                          <span>Remove</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        :global(.dark) .bg-gray-50 {
          background: #0f172a;
        }
        
        :global(.dark) .bg-white {
          background: #1e293b;
        }
        
        :global(.dark) .text-gray-900 {
          color: #f1f5f9;
        }
        
        :global(.dark) .text-gray-600 {
          color: #94a3b8;
        }
        
        :global(.dark) .border-gray-100 {
          border-color: #334155;
        }
        
        :global(.dark) .bg-purple-50 {
          background: rgba(139, 92, 246, 0.15);
        }
        
        :global(.dark) .text-purple-600 {
          color: #a78bfa;
        }
        
        @media (max-width: 768px) {
          .grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
        }
      `}</style>
    </div>
  )
}