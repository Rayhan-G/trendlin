import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'
import AdminNavigation from '@/components/admin/AdminNavigation'
import Link from 'next/link'
import { formatNumber } from '@/utils/formatters'

export default function ContentCalendar() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [showDayModal, setShowDayModal] = useState(false)
  const [posts, setPosts] = useState([])
  const [debug, setDebug] = useState(null)
  const [toast, setToast] = useState({ show: false, message: '', type: '' })
  
  // Stats
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    scheduled: 0
  })

  useEffect(() => {
    fetchAllData()
  }, [])

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000)
  }

  const fetchAllData = async () => {
    setLoading(true)
    try {
      // Fetch all posts
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (postsError) throw postsError
      
      const allPosts = postsData || []
      setPosts(allPosts)
      
      // Debug: Check date fields
      const samplePost = allPosts[0]
      if (samplePost) {
        setDebug({
          samplePost: {
            title: samplePost.title,
            status: samplePost.status,
            created_at: samplePost.created_at,
            published_at: samplePost.published_at,
            scheduled_for: samplePost.scheduled_for
          },
          totalPosts: allPosts.length,
          postsWithPublishedAt: allPosts.filter(p => p.published_at).length,
          postsWithCreatedAt: allPosts.filter(p => p.created_at).length
        })
      }
      
      // Calculate stats
      const published = allPosts.filter(p => p.status === 'published').length
      const draft = allPosts.filter(p => p.status === 'draft').length
      const scheduled = allPosts.filter(p => p.status === 'scheduled').length
      
      setStats({
        total: allPosts.length,
        published,
        draft,
        scheduled
      })
      
    } catch (error) {
      console.error('Error fetching data:', error)
      showToast('Failed to load data', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (post, newStatus) => {
    try {
      const updateData = { 
        status: newStatus, 
        updated_at: new Date().toISOString() 
      }
      if (newStatus === 'published') {
        updateData.published_at = new Date().toISOString()
        updateData.scheduled_for = null
      }
      
      const { error } = await supabase
        .from('posts')
        .update(updateData)
        .eq('id', post.id)
      
      if (error) throw error
      
      showToast(`Post ${newStatus === 'published' ? 'published' : 'updated'}`)
      fetchAllData()
      setShowDayModal(false)
    } catch (error) {
      console.error('Error updating status:', error)
      showToast('Failed to update status', 'error')
    }
  }

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const startingDayOfWeek = firstDay.getDay()
    
    const days = []
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }
    return days
  }

  const getDateKey = (date) => {
    return date.toISOString().split('T')[0]
  }

  const getPostsForDate = (date) => {
    if (!date) return []
    const dateStr = getDateKey(date)
    
    return posts.filter(post => {
      // For published posts - use published_at if exists, otherwise use created_at
      if (post.status === 'published') {
        const postDate = post.published_at || post.created_at
        if (postDate) {
          const postDateStr = new Date(postDate).toISOString().split('T')[0]
          if (postDateStr === dateStr) return true
        }
      }
      // For scheduled posts - use scheduled_for
      if (post.status === 'scheduled' && post.scheduled_for) {
        const scheduledDateStr = new Date(post.scheduled_for).toISOString().split('T')[0]
        if (scheduledDateStr === dateStr) return true
      }
      // For draft posts - use created_at
      if (post.status === 'draft' && post.created_at) {
        const createdDateStr = new Date(post.created_at).toISOString().split('T')[0]
        if (createdDateStr === dateStr) return true
      }
      return false
    })
  }

  const getCategoryIcon = (category) => {
    const icons = {
      health: '🌿',
      tech: '⚡',
      entertainment: '🎬',
      wealth: '💰',
      world: '🌍',
      lifestyle: '✨',
      growth: '🌱'
    }
    return icons[category] || '📄'
  }

  const getStatusIcon = (status) => {
    switch(status) {
      case 'published': return '✓'
      case 'scheduled': return '⏰'
      case 'draft': return '✎'
      default: return '📄'
    }
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'published': return '#10b981'
      case 'scheduled': return '#8b5cf6'
      case 'draft': return '#f59e0b'
      default: return '#6b7280'
    }
  }

  const getStatusBg = (status) => {
    switch(status) {
      case 'published': return '#ecfdf5'
      case 'scheduled': return '#f5f3ff'
      case 'draft': return '#fffbeb'
      default: return '#f5f5f5'
    }
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const days = getDaysInMonth(currentMonth)

  if (loading) {
    return (
      <AdminNavigation>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <div style={{ width: '40px', height: '40px', border: '2px solid #eaeaea', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }}></div>
        </div>
      </AdminNavigation>
    )
  }

  return (
    <AdminNavigation>
      <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Toast */}
        {toast.show && (
          <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000, background: toast.type === 'error' ? '#ef4444' : '#10b981', color: 'white', padding: '12px 20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
            {toast.message}
          </div>
        )}

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 600, margin: 0 }}>📅 Content Calendar</h1>
            <p style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>View all your content by date</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={fetchAllData} style={{ padding: '10px 20px', background: '#f5f5f5', border: '1px solid #eaeaea', borderRadius: '12px', cursor: 'pointer' }}>
              🔄 Refresh
            </button>
            <Link href="/create-post">
              <button style={{ padding: '10px 20px', background: '#000', color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 500 }}>
                + New Post
              </button>
            </Link>
          </div>
        </div>

        {/* Debug Info - Remove after fixing */}
        {debug && (
          <div style={{ background: '#fef3c7', border: '1px solid #fbbf24', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, margin: '0 0 8px 0', color: '#92400e' }}>📋 Debug Info:</h3>
            <p style={{ fontSize: '12px', color: '#92400e', marginBottom: '4px' }}>Total Posts: {debug.totalPosts}</p>
            <p style={{ fontSize: '12px', color: '#92400e', marginBottom: '4px' }}>Posts with published_at: {debug.postsWithPublishedAt}</p>
            <p style={{ fontSize: '12px', color: '#92400e', marginBottom: '4px' }}>Posts with created_at: {debug.postsWithCreatedAt}</p>
            <p style={{ fontSize: '12px', color: '#92400e', marginBottom: '4px' }}>Sample Post: {debug.samplePost.title}</p>
            <p style={{ fontSize: '12px', color: '#92400e', marginBottom: '4px' }}>Status: {debug.samplePost.status}</p>
            <p style={{ fontSize: '12px', color: '#92400e', marginBottom: '4px' }}>created_at: {debug.samplePost.created_at}</p>
            <p style={{ fontSize: '12px', color: '#92400e' }}>published_at: {debug.samplePost.published_at || 'NULL'}</p>
          </div>
        )}

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          <div style={{ background: '#fff', border: '1px solid #eaeaea', borderRadius: '16px', padding: '20px' }}>
            <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>Total Posts</div>
            <div style={{ fontSize: '32px', fontWeight: 700 }}>{stats.total}</div>
          </div>
          <div style={{ background: '#fff', border: '1px solid #eaeaea', borderRadius: '16px', padding: '20px' }}>
            <div style={{ fontSize: '12px', color: '#10b981', marginBottom: '8px' }}>Published</div>
            <div style={{ fontSize: '32px', fontWeight: 700, color: '#10b981' }}>{stats.published}</div>
          </div>
          <div style={{ background: '#fff', border: '1px solid #eaeaea', borderRadius: '16px', padding: '20px' }}>
            <div style={{ fontSize: '12px', color: '#f59e0b', marginBottom: '8px' }}>Drafts</div>
            <div style={{ fontSize: '32px', fontWeight: 700, color: '#f59e0b' }}>{stats.draft}</div>
          </div>
          <div style={{ background: '#fff', border: '1px solid #eaeaea', borderRadius: '16px', padding: '20px' }}>
            <div style={{ fontSize: '12px', color: '#8b5cf6', marginBottom: '8px' }}>Scheduled</div>
            <div style={{ fontSize: '32px', fontWeight: 700, color: '#8b5cf6' }}>{stats.scheduled}</div>
          </div>
        </div>

        {/* Calendar Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} style={{ padding: '10px 20px', background: '#f5f5f5', border: '1px solid #eaeaea', borderRadius: '10px', cursor: 'pointer' }}>
            ← Previous
          </button>
          <h2 style={{ fontSize: '22px', fontWeight: 600 }}>{currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2>
          <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} style={{ padding: '10px 20px', background: '#f5f5f5', border: '1px solid #eaeaea', borderRadius: '10px', cursor: 'pointer' }}>
            Next →
          </button>
        </div>

        {/* Calendar Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', background: '#eaeaea', border: '1px solid #eaeaea', borderRadius: '16px', overflow: 'hidden' }}>
          {weekDays.map(day => (
            <div key={day} style={{ background: '#fafafa', padding: '16px', textAlign: 'center', fontWeight: 600, fontSize: '13px', color: '#666' }}>
              {day}
            </div>
          ))}
          {days.map((date, index) => {
            const postsForDay = date ? getPostsForDate(date) : []
            const isToday = date && date.toDateString() === new Date().toDateString()
            const publishedCount = postsForDay.filter(p => p.status === 'published').length
            const scheduledCount = postsForDay.filter(p => p.status === 'scheduled').length
            const draftCount = postsForDay.filter(p => p.status === 'draft').length
            
            return (
              <div
                key={index}
                onClick={() => {
                  if (date && postsForDay.length > 0) {
                    setSelectedDate(date)
                    setShowDayModal(true)
                  }
                }}
                style={{
                  background: '#fff',
                  minHeight: '120px',
                  padding: '12px',
                  backgroundColor: isToday ? '#fef3c7' : '#fff',
                  cursor: date && postsForDay.length > 0 ? 'pointer' : 'default',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (date && postsForDay.length > 0) e.currentTarget.style.backgroundColor = '#f5f5f5'
                }}
                onMouseLeave={(e) => {
                  if (date && postsForDay.length > 0) e.currentTarget.style.backgroundColor = isToday ? '#fef3c7' : '#fff'
                }}
              >
                {date && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '14px', fontWeight: isToday ? 700 : 400, color: isToday ? '#d97706' : '#333' }}>
                        {date.getDate()}
                      </span>
                      {postsForDay.length > 0 && (
                        <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '10px', background: '#f0f0f0', color: '#666' }}>
                          {postsForDay.length}
                        </span>
                      )}
                    </div>
                    
                    {/* Show post count by type */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                      {publishedCount > 0 && (
                        <div style={{ fontSize: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ color: '#10b981' }}>✓</span>
                          <span style={{ color: '#666' }}>{publishedCount} published</span>
                        </div>
                      )}
                      {scheduledCount > 0 && (
                        <div style={{ fontSize: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ color: '#8b5cf6' }}>⏰</span>
                          <span style={{ color: '#666' }}>{scheduledCount} scheduled</span>
                        </div>
                      )}
                      {draftCount > 0 && (
                        <div style={{ fontSize: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ color: '#f59e0b' }}>✎</span>
                          <span style={{ color: '#666' }}>{draftCount} draft</span>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>

        {/* Day Modal - Show all posts for selected date */}
        {showDayModal && selectedDate && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }} onClick={() => setShowDayModal(false)}>
            <div style={{ background: '#fff', borderRadius: '20px', maxWidth: '600px', width: '100%', maxHeight: '80vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
              <div style={{ padding: '20px', borderBottom: '1px solid #eaeaea', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: '#fff' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600 }}>
                  {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </h3>
                <button onClick={() => setShowDayModal(false)} style={{ fontSize: '24px', background: 'none', border: 'none', cursor: 'pointer' }}>&times;</button>
              </div>
              <div style={{ padding: '20px' }}>
                {getPostsForDate(selectedDate).length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                    No posts for this date
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {getPostsForDate(selectedDate).map(post => (
                      <div key={post.id} style={{ 
                        padding: '16px', 
                        border: '1px solid #eaeaea', 
                        borderRadius: '12px',
                        background: '#fafafa'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                              <span style={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '4px',
                                padding: '2px 8px', 
                                borderRadius: '20px', 
                                fontSize: '10px', 
                                fontWeight: 500,
                                background: getStatusBg(post.status),
                                color: getStatusColor(post.status)
                              }}>
                                {getStatusIcon(post.status)} {post.status}
                              </span>
                              <span style={{ fontSize: '11px', color: '#888' }}>
                                {getCategoryIcon(post.category)} {post.category || 'Uncategorized'}
                              </span>
                              {post.views > 0 && (
                                <span style={{ fontSize: '11px', color: '#888' }}>👁️ {formatNumber(post.views)}</span>
                              )}
                            </div>
                            <h4 style={{ fontSize: '16px', fontWeight: 600, margin: '8px 0' }}>
                              <Link href={`/edit-post/${post.id}`} style={{ color: '#000', textDecoration: 'none' }}>
                                {post.title || 'Untitled'}
                              </Link>
                            </h4>
                            <div style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>
                              📅 Created: {new Date(post.created_at).toLocaleDateString()}
                            </div>
                            {post.scheduled_for && (
                              <div style={{ fontSize: '12px', color: '#8b5cf6', marginTop: '4px' }}>
                                ⏰ Scheduled for: {new Date(post.scheduled_for).toLocaleString()}
                              </div>
                            )}
                            {post.published_at && (
                              <div style={{ fontSize: '12px', color: '#10b981', marginTop: '4px' }}>
                                ✓ Published on: {new Date(post.published_at).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <Link href={`/edit-post/${post.id}`}>
                              <button style={{ padding: '4px 12px', fontSize: '12px', background: '#f5f5f5', border: '1px solid #eaeaea', borderRadius: '6px', cursor: 'pointer' }}>Edit</button>
                            </Link>
                            {post.status === 'scheduled' && (
                              <button 
                                onClick={() => handleStatusChange(post, 'published')}
                                style={{ padding: '4px 12px', fontSize: '12px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                              >
                                Publish Now
                              </button>
                            )}
                            {post.status === 'draft' && (
                              <button 
                                onClick={() => handleStatusChange(post, 'published')}
                                style={{ padding: '4px 12px', fontSize: '12px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                              >
                                Publish
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </AdminNavigation>
  )
}