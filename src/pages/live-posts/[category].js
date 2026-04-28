// src/pages/live-posts/[category].js
import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import CommentSection from '../../components/frontend/CommentSection'
import { Heart, MessageCircle, Share2, Clock, ChevronLeft, ChevronRight } from 'lucide-react'

const categoryConfig = {
  tech: { name: 'Technology', icon: '⚡', gradient: 'from-blue-500 to-cyan-500', description: 'Latest tech innovations and insights' },
  health: { name: 'Wellness', icon: '🌿', gradient: 'from-emerald-500 to-teal-500', description: 'Health, wellness & mindfulness' },
  entertainment: { name: 'Culture', icon: '🎭', gradient: 'from-pink-500 to-rose-500', description: 'Entertainment & cultural trends' },
  wealth: { name: 'Capital', icon: '💰', gradient: 'from-amber-500 to-orange-500', description: 'Finance, investing & wealth' },
  world: { name: 'Horizons', icon: '🌍', gradient: 'from-cyan-500 to-blue-500', description: 'Global perspectives' },
  lifestyle: { name: 'Aesthetic', icon: '✨', gradient: 'from-orange-500 to-red-500', description: 'Lifestyle & design' },
  growth: { name: 'Evolution', icon: '🌱', gradient: 'from-purple-500 to-violet-500', description: 'Personal development' }
}

export default function LivePostPage() {
  const router = useRouter()
  const { category } = router.query
  
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [timeLeft, setTimeLeft] = useState('')
  const [comments, setComments] = useState([])
  
  const timerRef = useRef(null)
  const currentUser = { id: 'visitor', name: 'Guest', isAdmin: false }
  
  const config = categoryConfig[category] || { name: category, icon: '📁', gradient: 'from-gray-500 to-gray-700', description: '' }

  // Fetch post
  const fetchPost = useCallback(async () => {
    if (!category) return
    setLoading(true)
    
    try {
      const { data, error } = await supabase
        .from('live_posts')
        .select('*')
        .eq('category', category)
        .eq('status', 'active')
        .gt('expires_at', new Date().toISOString())
        .single()
      
      if (!error && data) {
        setPost(data)
        
        // Fetch comments
        const { data: commentsData } = await supabase
          .from('live_post_comments')
          .select('*')
          .eq('live_post_id', data.id)
          .eq('status', 'approved')
          .order('created_at', { ascending: false })
        
        setComments(commentsData || [])
      } else {
        setPost(null)
      }
    } catch (error) {
      console.error('Error fetching post:', error)
      setPost(null)
    } finally {
      setLoading(false)
    }
  }, [category])

  useEffect(() => {
    fetchPost()
  }, [fetchPost])

  // Timer countdown
  useEffect(() => {
    if (!post?.expires_at) return
    
    const updateTimer = () => {
      const diff = new Date(post.expires_at) - new Date()
      if (diff <= 0) {
        setTimeLeft('Expired')
        fetchPost()
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (3600000)) / 60000)
        setTimeLeft(hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`)
      }
    }
    
    updateTimer()
    timerRef.current = setInterval(updateTimer, 60000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [post, fetchPost])

  // Like handler
  const handleLike = async () => {
    if (!post) return
    
    const hasLiked = post.liked_by?.includes(currentUser.id)
    
    const { error } = await supabase
      .from('live_posts')
      .update({
        likes: hasLiked ? (post.likes - 1) : (post.likes + 1),
        liked_by: hasLiked 
          ? post.liked_by.filter(id => id !== currentUser.id)
          : [...(post.liked_by || []), currentUser.id]
      })
      .eq('id', post.id)
    
    if (!error) {
      setPost(prev => ({
        ...prev,
        likes: hasLiked ? prev.likes - 1 : prev.likes + 1,
        liked_by: hasLiked
          ? prev.liked_by.filter(id => id !== currentUser.id)
          : [...(prev.liked_by || []), currentUser.id]
      }))
      setLiked(!hasLiked)
    }
  }

  // Share handler
  const handleShare = async () => {
    if (!post) return
    
    await supabase
      .from('live_posts')
      .update({ shares: (post.shares || 0) + 1 })
      .eq('id', post.id)
    
    setPost(prev => ({ ...prev, shares: (prev.shares || 0) + 1 }))
    alert('Post shared!')
  }

  const isUrgent = timeLeft && timeLeft.includes('h') && parseInt(timeLeft) < 1

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <style jsx>{`
          .loading-container {
            min-height: 60vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .spinner {
            width: 48px;
            height: 48px;
            border: 3px solid #1e293b;
            border-top-color: #8b5cf6;
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

  if (!post) {
    return (
      <>
        <Head>
          <title>{config.name} | ÉCLAT Live Post</title>
        </Head>
        <div className="empty-container">
          <div className="empty-card">
            <span className="empty-icon">📭</span>
            <h2>No Active Post</h2>
            <p>{config.name} doesn't have an active 24-hour post right now.</p>
            <Link href="/">
              <button className="back-btn">← Back to Home</button>
            </Link>
          </div>
        </div>
        <style jsx>{`
          .empty-container {
            min-height: 60vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
          }
          .empty-card {
            text-align: center;
            background: #0f0f0f;
            border: 1px solid #1e293b;
            border-radius: 32px;
            padding: 3rem;
            max-width: 500px;
          }
          .empty-icon { font-size: 64px; display: block; margin-bottom: 1rem; }
          .empty-card h2 { font-size: 24px; margin-bottom: 0.5rem; color: white; }
          .empty-card p { color: #64748b; margin-bottom: 1.5rem; }
          .back-btn { padding: 0.75rem 1.5rem; background: #8b5cf6; border: none; border-radius: 40px; color: white; cursor: pointer; }
        `}</style>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>{post.title} | {config.name} • ÉCLAT</title>
        <meta name="description" content={post.description?.substring(0, 160)} />
      </Head>

      <div className="post-page">
        <div className="post-container">
          {/* Header */}
          <div className="post-header">
            <Link href="/">
              <button className="back-button">← Back to Home</button>
            </Link>
            <div className="header-info">
              <div className="category-badge">
                <span>{config.icon}</span>
                <span>{config.name}</span>
              </div>
              <div className={`time-badge ${isUrgent ? 'urgent' : ''}`}>
                <Clock size={14} />
                <span>{timeLeft}</span>
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="post-title">{post.title}</h1>

          {/* Description with quotes */}
          <div className="post-description">
            <span className="quote-start">"</span>
            {post.description}
            <span className="quote-end">"</span>
          </div>
          <div className="word-count">{post.description?.split(/\s+/).length} words</div>

          {/* Media Carousel */}
          {post.media_items?.length > 0 && (
            <div className="media-carousel">
              <div className="carousel-container">
                <div className="carousel-slides">
                  {post.media_items.map((item, idx) => (
                    <div
                      key={idx}
                      className={`carousel-slide ${idx === currentSlide ? 'active' : ''}`}
                    >
                      {item.type === 'image' ? (
                        <img src={item.url} alt={`Slide ${idx + 1}`} />
                      ) : (
                        <video src={item.url} controls />
                      )}
                      {post.overlay_headline && idx === currentSlide && (
                        <div className="media-overlay">
                          <h3>{post.overlay_headline}</h3>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                {post.media_items.length > 1 && (
                  <>
                    <button
                      className="carousel-nav prev"
                      onClick={() => setCurrentSlide((currentSlide - 1 + post.media_items.length) % post.media_items.length)}
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      className="carousel-nav next"
                      onClick={() => setCurrentSlide((currentSlide + 1) % post.media_items.length)}
                    >
                      <ChevronRight size={24} />
                    </button>
                    <div className="carousel-dots">
                      {post.media_items.map((_, idx) => (
                        <button
                          key={idx}
                          className={`dot ${idx === currentSlide ? 'active' : ''}`}
                          onClick={() => setCurrentSlide(idx)}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Stats & Actions */}
          <div className="stats-bar">
            <span><Heart size={16} /> {post.likes || 0} likes</span>
            <span><MessageCircle size={16} /> {comments.length} comments</span>
            <span><Share2 size={16} /> {post.shares || 0} shares</span>
          </div>

          <div className="action-buttons">
            <button className={`action-btn like-btn ${liked ? 'liked' : ''}`} onClick={handleLike}>
              {liked ? '❤️ Liked' : '🤍 Like'}
            </button>
            <button className="action-btn" onClick={handleShare}>
              🔁 Share
            </button>
          </div>

          {/* Comments Section */}
          <CommentSection postId={post.id} currentUser={currentUser} isAdmin={false} />
        </div>
      </div>

      <style jsx>{`
        .post-page {
          min-height: 100vh;
          background: #050505;
        }
        
        .post-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 2rem;
        }
        
        .post-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }
        
        .back-button {
          padding: 0.5rem 1rem;
          background: rgba(255,255,255,0.05);
          border: 1px solid #1e293b;
          border-radius: 40px;
          color: #94a3b8;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .back-button:hover {
          background: rgba(255,255,255,0.1);
          color: white;
        }
        
        .header-info {
          display: flex;
          gap: 1rem;
          align-items: center;
        }
        
        .category-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: linear-gradient(135deg, #8b5cf6, #6366f1);
          border-radius: 40px;
          font-size: 0.875rem;
          font-weight: 600;
        }
        
        .time-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: #1e293b;
          border-radius: 40px;
          font-size: 0.875rem;
          font-family: monospace;
        }
        
        .time-badge.urgent {
          background: #ef4444;
          animation: pulse 1s infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        .post-title {
          font-size: 3rem;
          font-weight: 700;
          color: white;
          margin-bottom: 1.5rem;
          line-height: 1.2;
        }
        
        .post-description {
          font-size: 1.25rem;
          line-height: 1.6;
          color: #d4d4d8;
          margin-bottom: 0.5rem;
          position: relative;
        }
        
        .quote-start, .quote-end {
          font-size: 3rem;
          color: #8b5cf6;
          opacity: 0.5;
          font-family: serif;
          line-height: 0;
          vertical-align: middle;
        }
        
        .quote-start {
          margin-right: 0.25rem;
        }
        
        .quote-end {
          margin-left: 0.25rem;
        }
        
        .word-count {
          text-align: right;
          font-size: 0.75rem;
          color: #475569;
          margin-bottom: 2rem;
        }
        
        .media-carousel {
          margin: 2rem 0;
          border-radius: 24px;
          overflow: hidden;
          background: #000;
        }
        
        .carousel-container {
          position: relative;
        }
        
        .carousel-slides {
          position: relative;
          height: 500px;
        }
        
        .carousel-slide {
          position: absolute;
          inset: 0;
          opacity: 0;
          transition: opacity 0.5s;
        }
        
        .carousel-slide.active {
          opacity: 1;
        }
        
        .carousel-slide img, .carousel-slide video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .media-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
          padding: 2rem;
        }
        
        .media-overlay h3 {
          color: white;
          font-size: 1.5rem;
          font-weight: 700;
        }
        
        .carousel-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 44px;
          height: 44px;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(10px);
          border: none;
          border-radius: 50%;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .carousel-nav:hover {
          background: #8b5cf6;
        }
        
        .carousel-nav.prev { left: 1rem; }
        .carousel-nav.next { right: 1rem; }
        
        .carousel-dots {
          position: absolute;
          bottom: 1rem;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 0.75rem;
        }
        
        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255,255,255,0.5);
          cursor: pointer;
        }
        
        .dot.active {
          width: 24px;
          border-radius: 4px;
          background: #8b5cf6;
        }
        
        .stats-bar {
          display: flex;
          gap: 2rem;
          padding: 1rem 0;
          border-bottom: 1px solid #1e293b;
          color: #94a3b8;
          font-size: 0.875rem;
        }
        
        .stats-bar span {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .action-buttons {
          display: flex;
          gap: 1rem;
          padding: 1rem 0;
          border-bottom: 1px solid #1e293b;
        }
        
        .action-btn {
          flex: 1;
          padding: 0.75rem;
          background: rgba(255,255,255,0.05);
          border: none;
          border-radius: 40px;
          color: #94a3b8;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .action-btn:hover {
          background: rgba(255,255,255,0.1);
          color: white;
        }
        
        .like-btn.liked {
          background: rgba(239,68,68,0.2);
          color: #ef4444;
        }
        
        @media (max-width: 768px) {
          .post-container {
            padding: 1rem;
          }
          .post-title {
            font-size: 1.75rem;
          }
          .post-description {
            font-size: 1rem;
          }
          .carousel-slides {
            height: 300px;
          }
        }
      `}</style>
    </>
  )
}