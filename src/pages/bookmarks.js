// pages/bookmarks.js
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { supabase } from '../lib/supabase'

export default function Bookmarks() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [bookmarks, setBookmarks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const res = await fetch('/api/auth/me')
      const data = await res.json()
      if (!data.authenticated) router.push('/')
      else {
        setUser(data.user)
        const { data: books } = await supabase.from('bookmarks').select('*').eq('user_id', data.user.id).order('bookmarked_at', { ascending: false })
        setBookmarks(books || [])
      }
      setLoading(false)
    }
    checkAuth()
  }, [router])

  const removeBookmark = async (postId) => {
    await supabase.from('bookmarks').delete().eq('user_id', user.id).eq('post_id', postId)
    setBookmarks(bookmarks.filter(b => b.post_id !== postId))
  }

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>
  if (!user) return null

  return (
    <div style={{ maxWidth: 800, margin: '40px auto', padding: '0 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}><span style={{ fontSize: 32 }}>🔖</span><h1 style={{ margin: 0 }}>Your Bookmarks</h1></div>
      {bookmarks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, background: '#f5f5f5', borderRadius: 16, color: '#666' }}>
          <span style={{ fontSize: 48 }}>📖</span><p style={{ marginTop: 16 }}>No bookmarks yet</p>
          <Link href="/" style={{ display: 'inline-block', marginTop: 16, color: '#06b6d4' }}>Browse articles →</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {bookmarks.map(bookmark => (
            <div key={bookmark.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16, background: 'white', borderRadius: 12, border: '1px solid #eaeaea' }}>
              <Link href={`/post/${bookmark.post_slug}`} style={{ flex: 1, textDecoration: 'none', color: '#111' }}>
                <div style={{ fontWeight: 500 }}>{bookmark.post_title}</div>
                <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>Bookmarked on {new Date(bookmark.bookmarked_at).toLocaleDateString()}</div>
              </Link>
              <button onClick={() => removeBookmark(bookmark.post_id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, padding: 8, borderRadius: 8 }}>❌</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}