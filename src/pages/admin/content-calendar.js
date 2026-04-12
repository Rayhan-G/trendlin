import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function ContentCalendar() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('month')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [posts, setPosts] = useState([])
  const [ideas, setIdeas] = useState([])
  const [showIdeaModal, setShowIdeaModal] = useState(false)
  const [toast, setToast] = useState({ show: false, message: '', type: '' })
  const [trends, setTrends] = useState([])
  
  const [ideaForm, setIdeaForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    source: '',
    notes: ''
  })

  useEffect(() => {
    checkAuth()
    fetchData()
    fetchTrends()
  }, [currentDate])

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000)
  }

  const checkAuth = () => {
    const sessionToken = localStorage.getItem('admin_session_token')
    const sessionExpiry = localStorage.getItem('admin_session_expiry')
    
    if (!sessionToken || !sessionExpiry) {
      router.push('/')
      return
    }
    
    const now = Date.now()
    if (now > parseInt(sessionExpiry)) {
      localStorage.removeItem('admin_session_token')
      localStorage.removeItem('admin_session_expiry')
      router.push('/')
    }
  }

  const fetchData = async () => {
    const { data: postsData } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
    
    const { data: ideasData } = await supabase
      .from('content_ideas')
      .select('*')
      .order('created_at', { ascending: false })
    
    setPosts(postsData || [])
    setIdeas(ideasData || [])
    setLoading(false)
  }

  const fetchTrends = async () => {
    // Fetch real trends from your trends table
    const { data: trendsData } = await supabase
      .from('trends')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(10)
    
    setTrends(trendsData || [])
  }

  const saveIdea = async () => {
    if (!ideaForm.title.trim()) {
      showToast('Please enter an idea title', 'error')
      return
    }
    
    const { error } = await supabase.from('content_ideas').insert([{
      title: ideaForm.title,
      description: ideaForm.description,
      priority: ideaForm.priority,
      source: ideaForm.source,
      notes: ideaForm.notes,
      status: 'pending',
      created_at: new Date().toISOString()
    }])
    
    if (error) {
      showToast('Error saving idea', 'error')
    } else {
      showToast('Idea saved successfully!')
      await fetchData()
      setShowIdeaModal(false)
      setIdeaForm({
        title: '',
        description: '',
        priority: 'medium',
        source: '',
        notes: ''
      })
    }
  }

  const createPostFromIdea = async (idea) => {
    const slug = idea.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
    
    const { error } = await supabase.from('posts').insert([{
      title: idea.title,
      slug: `${slug}-${Date.now()}`,
      excerpt: idea.description,
      content: idea.notes || '',
      status: 'draft',
      created_at: new Date().toISOString()
    }])
    
    if (error) {
      showToast('Error creating post', 'error')
    } else {
      await supabase.from('content_ideas').update({ status: 'converted' }).eq('id', idea.id)
      showToast('Post created from idea!')
      await fetchData()
      router.push('/admin/create')
    }
  }

  const deleteIdea = async (id) => {
    if (!confirm('Delete this idea?')) return
    
    const { error } = await supabase.from('content_ideas').delete().eq('id', id)
    
    if (!error) {
      showToast('Idea deleted')
      await fetchData()
    }
  }

  const getMonthDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
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

  const getWeekDays = () => {
    const today = new Date()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())
    
    const days = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      days.push(day)
    }
    return days
  }

  const getPostsForDate = (date) => {
    if (!date) return { published: [], scheduled: [], drafts: [] }
    const dateStr = date.toISOString().split('T')[0]
    
    return {
      published: posts.filter(p => p.status === 'published' && p.created_at?.split('T')[0] === dateStr),
      scheduled: posts.filter(p => p.scheduled_for?.split('T')[0] === dateStr && new Date(p.scheduled_for) > new Date()),
      drafts: posts.filter(p => p.status === 'draft' && p.created_at?.split('T')[0] === dateStr)
    }
  }

  const getContentGaps = () => {
    const gaps = []
    const sortedPosts = [...posts]
      .filter(p => p.status === 'published')
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    
    for (let i = 0; i < sortedPosts.length - 1; i++) {
      const currentDate = new Date(sortedPosts[i].created_at)
      const nextDate = new Date(sortedPosts[i + 1].created_at)
      const diffDays = Math.ceil((nextDate - currentDate) / (1000 * 60 * 60 * 24))
      
      if (diffDays > 7) {
        gaps.push({
          start: currentDate,
          end: nextDate,
          days: diffDays,
          message: `${diffDays} days without content`
        })
      }
    }
    
    return gaps
  }

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <style jsx>{`
          .loading-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f8fafc;
          }
          .loading-spinner {
            width: 48px;
            height: 48px;
            border: 3px solid #e2e8f0;
            border-top-color: #667eea;
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
    <div className="calendar-page">
      {toast.show && (
        <div className={`toast toast-${toast.type}`}>
          <span>{toast.type === 'error' ? '❌' : '✅'}</span>
          <span>{toast.message}</span>
        </div>
      )}

      <div className="calendar-header">
        <div className="header-left">
          <h1>Content Calendar</h1>
          <p>Plan, schedule, and manage your content pipeline</p>
        </div>
        <div className="header-right">
          <button onClick={() => setShowIdeaModal(true)} className="idea-btn">
            + Add Idea
          </button>
        </div>
      </div>

      <div className="stats-overview">
        <div className="stat-card">
          <span className="stat-icon">💡</span>
          <div>
            <div className="stat-value">{ideas.filter(i => i.status === 'pending').length}</div>
            <div className="stat-label">Ideas in Queue</div>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">📝</span>
          <div>
            <div className="stat-value">{posts.filter(p => p.status === 'draft').length}</div>
            <div className="stat-label">Drafts</div>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">📅</span>
          <div>
            <div className="stat-value">{posts.filter(p => p.scheduled_for && new Date(p.scheduled_for) > new Date()).length}</div>
            <div className="stat-label">Scheduled</div>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">📊</span>
          <div>
            <div className="stat-value">{posts.filter(p => p.status === 'published').length}</div>
            <div className="stat-label">Published</div>
          </div>
        </div>
      </div>

      <div className="view-toggle">
        <button className={view === 'month' ? 'active' : ''} onClick={() => setView('month')}>📅 Month</button>
        <button className={view === 'week' ? 'active' : ''} onClick={() => setView('week')}>📆 Week</button>
        <button className={view === 'ideas' ? 'active' : ''} onClick={() => setView('ideas')}>💡 Ideas</button>
        <button className={view === 'gaps' ? 'active' : ''} onClick={() => setView('gaps')}>⚠️ Gaps</button>
      </div>

      {view === 'month' && (
        <div className="month-view">
          <div className="month-nav">
            <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}>←</button>
            <h2>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
            <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}>→</button>
          </div>
          
          <div className="calendar-grid">
            {weekDays.map(day => <div key={day} className="calendar-weekday">{day}</div>)}
            {getMonthDays().map((date, index) => {
              const postsForDate = date ? getPostsForDate(date) : null
              return (
                <div key={index} className={`calendar-day ${!date ? 'empty' : ''} ${date && date.toDateString() === new Date().toDateString() ? 'today' : ''}`}>
                  {date && (
                    <>
                      <div className="day-number">{date.getDate()}</div>
                      <div className="day-posts">
                        {postsForDate.scheduled.slice(0, 2).map(post => (
                          <div key={post.id} className="day-post scheduled" title={post.title}>📅 {post.title.substring(0, 15)}</div>
                        ))}
                        {postsForDate.published.slice(0, 2).map(post => (
                          <div key={post.id} className="day-post published" title={post.title}>✓ {post.title.substring(0, 15)}</div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {view === 'week' && (
        <div className="week-view">
          <div className="week-grid">
            {getWeekDays().map(day => {
              const postsForDate = getPostsForDate(day)
              const isToday = day.toDateString() === new Date().toDateString()
              return (
                <div key={day.toISOString()} className={`week-day ${isToday ? 'today' : ''}`}>
                  <div className="week-day-header">
                    <div className="week-day-name">{weekDays[day.getDay()]}</div>
                    <div className="week-day-date">{day.getDate()}</div>
                  </div>
                  <div className="week-day-posts">
                    {postsForDate.scheduled.map(post => (
                      <div key={post.id} className="week-post scheduled">📅 {post.title}</div>
                    ))}
                    {postsForDate.published.map(post => (
                      <div key={post.id} className="week-post published">✓ {post.title}</div>
                    ))}
                    {postsForDate.drafts.map(post => (
                      <div key={post.id} className="week-post draft">✏️ {post.title}</div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {view === 'ideas' && (
        <div className="ideas-view">
          <div className="priority-columns">
            <div className="priority-column high">
              <div className="column-header">🔥 High Priority</div>
              {ideas.filter(i => i.priority === 'high').map(idea => (
                <div key={idea.id} className="idea-card">
                  <div className="idea-title">{idea.title}</div>
                  <div className="idea-description">{idea.description?.substring(0, 80)}</div>
                  <div className="idea-actions">
                    <button onClick={() => createPostFromIdea(idea)} className="create-post-btn">Create Post</button>
                    <button onClick={() => deleteIdea(idea.id)} className="delete-idea-btn">Delete</button>
                  </div>
                </div>
              ))}
              {ideas.filter(i => i.priority === 'high').length === 0 && <div className="empty-column">No high priority ideas</div>}
            </div>
            
            <div className="priority-column medium">
              <div className="column-header">📌 Medium Priority</div>
              {ideas.filter(i => i.priority === 'medium').map(idea => (
                <div key={idea.id} className="idea-card">
                  <div className="idea-title">{idea.title}</div>
                  <div className="idea-description">{idea.description?.substring(0, 80)}</div>
                  <div className="idea-actions">
                    <button onClick={() => createPostFromIdea(idea)} className="create-post-btn">Create Post</button>
                    <button onClick={() => deleteIdea(idea.id)} className="delete-idea-btn">Delete</button>
                  </div>
                </div>
              ))}
              {ideas.filter(i => i.priority === 'medium').length === 0 && <div className="empty-column">No medium priority ideas</div>}
            </div>
            
            <div className="priority-column low">
              <div className="column-header">📋 Low Priority</div>
              {ideas.filter(i => i.priority === 'low').map(idea => (
                <div key={idea.id} className="idea-card">
                  <div className="idea-title">{idea.title}</div>
                  <div className="idea-description">{idea.description?.substring(0, 80)}</div>
                  <div className="idea-actions">
                    <button onClick={() => createPostFromIdea(idea)} className="create-post-btn">Create Post</button>
                    <button onClick={() => deleteIdea(idea.id)} className="delete-idea-btn">Delete</button>
                  </div>
                </div>
              ))}
              {ideas.filter(i => i.priority === 'low').length === 0 && <div className="empty-column">No low priority ideas</div>}
            </div>
          </div>
        </div>
      )}

      {view === 'gaps' && (
        <div className="gaps-view">
          {getContentGaps().length === 0 ? (
            <div className="no-gaps">
              <span>🎉</span>
              <h4>No content gaps found!</h4>
              <p>Your publishing schedule is consistent</p>
            </div>
          ) : (
            getContentGaps().map((gap, index) => (
              <div key={index} className="gap-card">
                <div className="gap-icon">⚠️</div>
                <div className="gap-info">
                  <div className="gap-message">{gap.message} without content</div>
                  <div className="gap-dates">{gap.start.toLocaleDateString()} → {gap.end.toLocaleDateString()}</div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {showIdeaModal && (
        <div className="modal-overlay" onClick={() => setShowIdeaModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Content Idea</h2>
              <button className="close-btn" onClick={() => setShowIdeaModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Title *</label>
                <input type="text" value={ideaForm.title} onChange={(e) => setIdeaForm({...ideaForm, title: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea rows="3" value={ideaForm.description} onChange={(e) => setIdeaForm({...ideaForm, description: e.target.value})} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Priority</label>
                  <select value={ideaForm.priority} onChange={(e) => setIdeaForm({...ideaForm, priority: e.target.value})}>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Source</label>
                  <input type="text" value={ideaForm.source} onChange={(e) => setIdeaForm({...ideaForm, source: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label>Research Notes</label>
                <textarea rows="4" value={ideaForm.notes} onChange={(e) => setIdeaForm({...ideaForm, notes: e.target.value})} />
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowIdeaModal(false)} className="cancel-btn">Cancel</button>
              <button onClick={saveIdea} className="save-btn">Save Idea</button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .calendar-page {
          min-height: 100vh;
          background: #f8fafc;
          padding: 2rem;
        }
        
        :global(body.dark) .calendar-page {
          background: #0f172a;
        }
        
        .toast {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1.25rem;
          background: white;
          border-radius: 12px;
          z-index: 1100;
          animation: slideIn 0.3s ease;
        }
        
        .toast-error { border-left: 4px solid #ef4444; }
        .toast-success { border-left: 4px solid #10b981; }
        
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        .calendar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }
        
        .calendar-header h1 {
          font-size: 1.75rem;
          font-weight: 700;
          color: #0f172a;
        }
        
        :global(body.dark) .calendar-header h1 {
          color: #f1f5f9;
        }
        
        .calendar-header p {
          color: #64748b;
        }
        
        .idea-btn {
          padding: 0.6rem 1.25rem;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 10px;
          cursor: pointer;
        }
        
        .stats-overview {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }
        
        .stat-card {
          background: white;
          border-radius: 16px;
          padding: 1rem;
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        :global(body.dark) .stat-card {
          background: #1e293b;
        }
        
        .stat-icon { font-size: 2rem; }
        .stat-value { font-size: 1.5rem; font-weight: 700; }
        .stat-label { font-size: 0.75rem; color: #64748b; }
        
        .view-toggle {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }
        
        .view-toggle button {
          padding: 0.5rem 1rem;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          cursor: pointer;
        }
        
        .view-toggle button.active {
          background: #667eea;
          border-color: #667eea;
          color: white;
        }
        
        .month-view {
          background: white;
          border-radius: 20px;
          padding: 1rem;
        }
        
        .month-nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        
        .month-nav button {
          padding: 0.5rem 1rem;
          background: #f1f5f9;
          border: none;
          border-radius: 8px;
          cursor: pointer;
        }
        
        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 1px;
          background: #e2e8f0;
        }
        
        .calendar-weekday {
          background: #f8fafc;
          padding: 0.75rem;
          text-align: center;
          font-weight: 600;
        }
        
        .calendar-day {
          background: white;
          min-height: 100px;
          padding: 0.5rem;
        }
        
        .calendar-day.empty { background: #f8fafc; }
        .calendar-day.today { background: #eef2ff; }
        
        .day-number { font-weight: 600; margin-bottom: 0.5rem; }
        
        .day-post {
          font-size: 0.7rem;
          padding: 0.25rem;
          margin-bottom: 0.25rem;
          border-radius: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .day-post.scheduled { background: #dbeafe; color: #1e40af; }
        .day-post.published { background: #d1fae5; color: #065f46; }
        
        .week-view {
          background: white;
          border-radius: 20px;
          padding: 1rem;
        }
        
        .week-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 1rem;
        }
        
        .week-day {
          background: #f8fafc;
          border-radius: 12px;
          padding: 0.75rem;
        }
        
        .week-day.today {
          background: #eef2ff;
          border: 2px solid #667eea;
        }
        
        .week-day-header {
          text-align: center;
          margin-bottom: 0.75rem;
        }
        
        .week-day-name { font-weight: 600; }
        .week-day-date { font-size: 1.25rem; font-weight: 700; }
        
        .week-post {
          font-size: 0.7rem;
          padding: 0.25rem;
          margin-bottom: 0.25rem;
          border-radius: 4px;
        }
        
        .ideas-view {
          background: white;
          border-radius: 20px;
          padding: 1.5rem;
        }
        
        .priority-columns {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }
        
        .priority-column {
          background: #f8fafc;
          border-radius: 16px;
          padding: 1rem;
        }
        
        .column-header {
          font-weight: 700;
          padding-bottom: 0.75rem;
          margin-bottom: 1rem;
          border-bottom: 2px solid #e2e8f0;
        }
        
        .idea-card {
          background: white;
          border-radius: 12px;
          padding: 1rem;
          margin-bottom: 1rem;
        }
        
        .idea-title { font-weight: 600; margin-bottom: 0.5rem; }
        .idea-description { font-size: 0.8rem; color: #64748b; margin-bottom: 0.75rem; }
        
        .idea-actions { display: flex; gap: 0.5rem; }
        
        .create-post-btn, .delete-idea-btn {
          padding: 0.25rem 0.5rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.7rem;
        }
        
        .create-post-btn { background: #10b981; color: white; }
        .delete-idea-btn { background: #ef4444; color: white; }
        
        .empty-column { text-align: center; padding: 2rem; color: #64748b; }
        
        .gaps-view {
          background: white;
          border-radius: 20px;
          padding: 1.5rem;
        }
        
        .no-gaps { text-align: center; padding: 3rem; }
        .no-gaps span { font-size: 3rem; display: block; margin-bottom: 1rem; }
        
        .gap-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: #fef3c7;
          border-radius: 12px;
          margin-bottom: 1rem;
        }
        
        .gap-icon { font-size: 1.5rem; }
        .gap-message { font-weight: 600; }
        .gap-dates { font-size: 0.7rem; color: #92400e; }
        
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .modal-content {
          background: white;
          border-radius: 20px;
          width: 90%;
          max-width: 600px;
          max-height: 90vh;
          overflow: auto;
        }
        
        :global(body.dark) .modal-content { background: #1e293b; }
        
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid #e2e8f0;
        }
        
        .close-btn {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
        }
        
        .modal-body { padding: 1.5rem; }
        
        .form-group { margin-bottom: 1rem; }
        .form-group label { display: block; font-weight: 600; margin-bottom: 0.25rem; }
        .form-group input, .form-group textarea, .form-group select {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
        }
        
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        
        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          padding: 1rem 1.5rem;
          border-top: 1px solid #e2e8f0;
        }
        
        .cancel-btn, .save-btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 8px;
          cursor: pointer;
        }
        
        .cancel-btn { background: #ef4444; color: white; }
        .save-btn { background: #10b981; color: white; }
        
        @media (max-width: 768px) {
          .calendar-page { padding: 1rem; }
          .priority-columns { grid-template-columns: 1fr; }
          .week-grid { grid-template-columns: 1fr; }
          .form-row { grid-template-columns: 1fr; }
          .stats-overview { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>
    </div>
  )
}