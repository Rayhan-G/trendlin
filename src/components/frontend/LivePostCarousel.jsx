// src/components/frontend/LivePostCarousel.jsx
import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { 
  ChevronLeft, ChevronRight, Heart, MessageCircle, Share2, 
  Play, Volume2, VolumeX, Maximize2, X, CheckCircle,
  Link2, Sparkles, Zap
} from 'lucide-react'

export default function LivePostCarousel({ posts, autoPlayInterval = 5000, onLike, onShare }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [timeLeft, setTimeLeft] = useState({})
  const [isHovering, setIsHovering] = useState(false)
  const [likedPosts, setLikedPosts] = useState({})
  const [showComments, setShowComments] = useState({})
  const [comments, setComments] = useState({})
  const [loadingComments, setLoadingComments] = useState({})
  const [commentName, setCommentName] = useState({})
  const [commentText, setCommentText] = useState({})
  const [submittingComment, setSubmittingComment] = useState({})
  const [expandedContent, setExpandedContent] = useState({})
  const [showConnectionLines, setShowConnectionLines] = useState(true)
  const [visitorId, setVisitorId] = useState(null)
  const videoRefs = useRef({})
  const autoPlayRef = useRef(null)
  const cardRef = useRef(null)

  // Get visitor ID
  useEffect(() => {
    let vid = localStorage.getItem('visitor_id')
    if (!vid) {
      vid = `v_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
      localStorage.setItem('visitor_id', vid)
    }
    setVisitorId(vid)
  }, [])

  // Set liked state
  useEffect(() => {
    const liked = {}
    posts.forEach(post => {
      if (post.user_has_liked) liked[post.id] = true
    })
    setLikedPosts(liked)
  }, [posts])

  // Time remaining
  useEffect(() => {
    const updateTimers = () => {
      const newTimeLeft = {}
      posts.forEach(post => {
        if (!post.expires_at) return
        const diff = new Date(post.expires_at) - new Date()
        if (diff > 0) {
          const hours = Math.floor(diff / (1000 * 60 * 60))
          const minutes = Math.floor((diff % 3600000) / 60000)
          if (hours > 0) newTimeLeft[post.id] = `${hours}h`
          else newTimeLeft[post.id] = `${minutes}m`
        } else {
          newTimeLeft[post.id] = ''
        }
      })
      setTimeLeft(newTimeLeft)
    }
    updateTimers()
    const interval = setInterval(updateTimers, 60000)
    return () => clearInterval(interval)
  }, [posts])

  // Auto-play
  useEffect(() => {
    if (isAutoPlaying && posts.length > 1 && !isHovering) {
      autoPlayRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % posts.length)
      }, autoPlayInterval)
    }
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current)
    }
  }, [isAutoPlaying, posts.length, autoPlayInterval, isHovering])

  const handleLike = async (postId) => {
    if (likedPosts[postId] || !visitorId) return
    setLikedPosts(prev => ({ ...prev, [postId]: true }))
    await onLike?.(postId)
  }

  const loadComments = async (postId) => {
    if (comments[postId]?.length > 0) {
      setShowComments(prev => ({ ...prev, [postId]: !prev[postId] }))
      return
    }
    
    setLoadingComments(prev => ({ ...prev, [postId]: true }))
    try {
      const { data } = await supabase
        .from('live_post_comments')
        .select('*')
        .eq('live_post_id', postId)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(30)
      
      if (data) {
        setComments(prev => ({ ...prev, [postId]: data }))
        setShowComments(prev => ({ ...prev, [postId]: true }))
      }
    } catch (error) {
      console.error('Error loading comments:', error)
    } finally {
      setLoadingComments(prev => ({ ...prev, [postId]: false }))
    }
  }

  const submitComment = async (postId) => {
    const name = commentName[postId]?.trim()
    const text = commentText[postId]?.trim()
    if (!name || !text) return
    
    setSubmittingComment(prev => ({ ...prev, [postId]: true }))
    try {
      const response = await fetch(`/api/live-posts/${postId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author_name: name, content: text })
      })
      
      if (response.ok) {
        const { comment } = await response.json()
        setComments(prev => ({
          ...prev,
          [postId]: [comment, ...(prev[postId] || [])]
        }))
        setCommentText(prev => ({ ...prev, [postId]: '' }))
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setSubmittingComment(prev => ({ ...prev, [postId]: false }))
    }
  }

  const handleShare = async (postId) => {
    const url = `${window.location.origin}/p/${postId}`
    await navigator.clipboard.writeText(url)
    await onShare?.(postId)
  }

  const goToSlide = (index) => {
    setCurrentIndex(index)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % posts.length)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + posts.length) % posts.length)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  const timeAgo = (date) => {
    if (!date) return ''
    const minutes = Math.floor((new Date() - new Date(date)) / 60000)
    if (minutes < 1) return 'just now'
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h`
    return `${Math.floor(hours / 24)}d`
  }

  if (!posts || posts.length === 0) return null

  const currentPost = posts[currentIndex]
  const isExpanded = expandedContent[currentPost.id]
  const displayContent = isExpanded ? currentPost.content : currentPost.content?.substring(0, 280)

  return (
    <div 
      className="connected-carousel"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Connection Thread Line - Visual connector between cards */}
      <div className={`connection-thread ${showConnectionLines ? 'visible' : ''}`}>
        <div className="thread-line"></div>
        <div className="thread-dots">
          {posts.map((_, idx) => (
            <div 
              key={idx} 
              className={`thread-dot ${idx === currentIndex ? 'active' : ''}`}
              onClick={() => goToSlide(idx)}
            />
          ))}
        </div>
      </div>

      {/* Main Content Node */}
      <div className="content-node" ref={cardRef}>
        {/* Category Identifier */}
        <div className="category-marker">
          <span className="category-dot" />
          <span className="category-name">{currentPost.category}</span>
          {timeLeft[currentPost.id] && (
            <span className="time-mark">
              <Zap size={10} />
              {timeLeft[currentPost.id]}
            </span>
          )}
        </div>

        {/* Content Block - Clean, Text First */}
        <div className="content-block">
          {currentPost.content ? (
            <>
              <div className="content-text">
                <div dangerouslySetInnerHTML={{ __html: displayContent }} />
              </div>
              {currentPost.content.length > 280 && (
                <button onClick={() => setExpandedContent(prev => ({ ...prev, [currentPost.id]: !prev[currentPost.id] }))} className="expand-link">
                  {isExpanded ? 'Collapse' : 'Continue reading'}
                  <ChevronRight size={14} />
                </button>
              )}
            </>
          ) : (
            <p className="empty-content">No description</p>
          )}
        </div>

        {/* Media Node - Clean, Underneath */}
        {currentPost.media_items && currentPost.media_items.length > 0 && (
          <div className="media-node">
            {currentPost.media_items.slice(0, 2).map((media, idx) => (
              <div key={idx} className={`media-piece ${currentPost.media_items.length === 1 ? 'single' : 'pair'}`}>
                {media.type === 'image' || !media.url?.match(/\.(mp4|webm)$/i) ? (
                  <img src={media.url} alt="" loading="lazy" />
                ) : (
                  <div className="video-piece">
                    <video
                      ref={el => { if (el) videoRefs.current[`${currentPost.id}_${idx}`] = el }}
                      src={media.url}
                      muted
                      loop
                      playsInline
                    />
                    <div className="video-hint">
                      <Play size={20} />
                    </div>
                  </div>
                )}
              </div>
            ))}
            {currentPost.media_items.length > 2 && (
              <div className="media-more">
                +{currentPost.media_items.length - 2}
              </div>
            )}
          </div>
        )}

        {/* Action Knots - Minimal Interaction Points */}
        <div className="action-knots">
          <button 
            onClick={() => handleLike(currentPost.id)} 
            className={`knot like ${likedPosts[currentPost.id] ? 'active' : ''}`}
          >
            <Heart size={16} />
            <span>{((currentPost.likes || 0) + (likedPosts[currentPost.id] ? 1 : 0)).toLocaleString()}</span>
          </button>
          
          <button 
            onClick={() => loadComments(currentPost.id)} 
            className="knot"
          >
            <MessageCircle size={16} />
            <span>{(currentPost.comments_count || 0).toLocaleString()}</span>
          </button>
          
          <button 
            onClick={() => handleShare(currentPost.id)} 
            className="knot"
          >
            <Link2 size={16} />
          </button>
        </div>

        {/* Comment Thread - Expands below */}
        {showComments[currentPost.id] && (
          <div className="comment-thread">
            <div className="comment-input-line">
              <input
                type="text"
                placeholder="Your name"
                value={commentName[currentPost.id] || ''}
                onChange={(e) => setCommentName(prev => ({ ...prev, [currentPost.id]: e.target.value }))}
                className="name-field"
              />
              <div className="message-field-wrapper">
                <textarea
                  placeholder="Add to the conversation..."
                  value={commentText[currentPost.id] || ''}
                  onChange={(e) => setCommentText(prev => ({ ...prev, [currentPost.id]: e.target.value }))}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && submitComment(currentPost.id)}
                  rows="1"
                />
                <button 
                  onClick={() => submitComment(currentPost.id)} 
                  disabled={!commentName[currentPost.id] || !commentText[currentPost.id] || submittingComment[currentPost.id]}
                >
                  {submittingComment[currentPost.id] ? '...' : '→'}
                </button>
              </div>
            </div>

            <div className="comment-list">
              {loadingComments[currentPost.id] ? (
                <div className="comment-placeholder">loading...</div>
              ) : !comments[currentPost.id] || comments[currentPost.id].length === 0 ? (
                <div className="comment-placeholder">be the first</div>
              ) : (
                comments[currentPost.id].slice(0, 3).map((comment) => (
                  <div key={comment.id} className="comment-line">
                    <span className="comment-author">{comment.author_name}</span>
                    <span className="comment-time">{timeAgo(comment.created_at)}</span>
                    <p className="comment-text">{comment.content}</p>
                  </div>
                ))
              )}
              {comments[currentPost.id]?.length > 3 && (
                <button className="more-comments">view all {comments[currentPost.id].length} →</button>
              )}
            </div>
          </div>
        )}

        {/* Navigation Controls - Minimal */}
        {posts.length > 1 && (
          <div className="nav-controls">
            <button onClick={prevSlide} className="nav-prev">
              <ChevronLeft size={20} />
            </button>
            <div className="position-mark">
              {currentIndex + 1} / {posts.length}
            </div>
            <button onClick={nextSlide} className="nav-next">
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .connected-carousel {
          position: relative;
          max-width: 580px;
          margin: 2rem auto;
          padding-top: 2rem;
        }

        /* Connection Thread - The "Connected" visual */
        .connection-thread {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          opacity: 0.4;
          transition: opacity 0.3s;
        }

        .connection-thread.visible {
          opacity: 1;
        }

        .thread-line {
          position: absolute;
          top: 8px;
          left: 10%;
          right: 10%;
          height: 1px;
          background: repeating-linear-gradient(
            90deg,
            #8b5cf6 0px,
            #8b5cf6 4px,
            transparent 4px,
            transparent 12px
          );
        }

        .thread-dots {
          display: flex;
          justify-content: center;
          gap: 12px;
          position: relative;
          z-index: 2;
        }

        .thread-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #cbd5e1;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.2, 0.8, 0.4, 1);
        }

        .thread-dot.active {
          width: 24px;
          border-radius: 3px;
          background: #8b5cf6;
        }

        .thread-dot:hover {
          background: #8b5cf6;
          transform: scale(1.2);
        }

        /* Content Node - The Card */
        .content-node {
          background: transparent;
          position: relative;
          animation: fadeSlide 0.4s ease;
        }

        @keyframes fadeSlide {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Category Marker */
        .category-marker {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 1.5rem;
          font-size: 0.75rem;
          letter-spacing: 0.5px;
        }

        .category-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #8b5cf6;
        }

        .category-name {
          color: #64748b;
          text-transform: uppercase;
          font-weight: 500;
        }

        .time-mark {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #94a3b8;
          font-family: monospace;
        }

        /* Content Block */
        .content-block {
          margin-bottom: 2rem;
        }

        .content-text {
          font-size: 1rem;
          line-height: 1.7;
          color: #1e293b;
          font-weight: 400;
        }

        .empty-content {
          color: #94a3b8;
          font-style: italic;
        }

        .expand-link {
          margin-top: 0.75rem;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          color: #8b5cf6;
          font-size: 0.8rem;
          background: none;
          border: none;
          cursor: pointer;
          transition: gap 0.2s;
        }

        .expand-link:hover {
          gap: 8px;
        }

        /* Media Node - Clean grid */
        .media-node {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1px;
          background: #f1f5f9;
          border-radius: 16px;
          overflow: hidden;
          margin-bottom: 2rem;
        }

        .media-piece {
          background: #f8fafc;
          aspect-ratio: 16/9;
          overflow: hidden;
          position: relative;
        }

        .media-piece.single {
          grid-column: span 2;
        }

        .media-piece img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .video-piece {
          position: relative;
          width: 100%;
          height: 100%;
          background: #0f0f0f;
          cursor: pointer;
        }

        .video-piece video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .video-hint {
          position: absolute;
          bottom: 12px;
          right: 12px;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          opacity: 0;
          transition: opacity 0.2s;
        }

        .video-piece:hover .video-hint {
          opacity: 1;
        }

        .media-more {
          position: absolute;
          bottom: 12px;
          right: 12px;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(8px);
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.7rem;
          color: white;
        }

        /* Action Knots */
        .action-knots {
          display: flex;
          gap: 2rem;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #f1f5f9;
        }

        .knot {
          display: flex;
          align-items: center;
          gap: 6px;
          background: none;
          border: none;
          color: #94a3b8;
          font-size: 0.8rem;
          cursor: pointer;
          transition: color 0.2s;
        }

        .knot:hover {
          color: #8b5cf6;
        }

        .knot.like.active {
          color: #ef4444;
        }

        /* Comment Thread */
        .comment-thread {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #f1f5f9;
        }

        .comment-input-line {
          display: flex;
          gap: 8px;
          margin-bottom: 1.5rem;
        }

        .name-field {
          width: 100px;
          padding: 8px 0;
          border: none;
          border-bottom: 1px solid #e2e8f0;
          font-size: 0.8rem;
          background: transparent;
          outline: none;
        }

        .name-field:focus {
          border-bottom-color: #8b5cf6;
        }

        .message-field-wrapper {
          flex: 1;
          position: relative;
        }

        .message-field-wrapper textarea {
          width: 100%;
          padding: 8px 32px 8px 0;
          border: none;
          border-bottom: 1px solid #e2e8f0;
          font-size: 0.8rem;
          resize: none;
          background: transparent;
          outline: none;
          font-family: inherit;
        }

        .message-field-wrapper textarea:focus {
          border-bottom-color: #8b5cf6;
        }

        .message-field-wrapper button {
          position: absolute;
          right: 0;
          bottom: 6px;
          background: none;
          border: none;
          color: #8b5cf6;
          font-size: 1.2rem;
          cursor: pointer;
        }

        .message-field-wrapper button:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .comment-list {
          max-height: 300px;
          overflow-y: auto;
        }

        .comment-placeholder {
          text-align: center;
          padding: 1.5rem;
          color: #94a3b8;
          font-size: 0.75rem;
        }

        .comment-line {
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #f8fafc;
        }

        .comment-author {
          font-weight: 500;
          font-size: 0.75rem;
          color: #1e293b;
        }

        .comment-time {
          margin-left: 8px;
          font-size: 0.65rem;
          color: #94a3b8;
        }

        .comment-text {
          margin-top: 4px;
          font-size: 0.8rem;
          color: #475569;
          line-height: 1.5;
        }

        .more-comments {
          background: none;
          border: none;
          color: #8b5cf6;
          font-size: 0.7rem;
          cursor: pointer;
        }

        /* Navigation Controls */
        .nav-controls {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 1.5rem;
        }

        .nav-prev, .nav-next {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: transparent;
          border: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #64748b;
          transition: all 0.2s;
        }

        .nav-prev:hover, .nav-next:hover {
          background: #8b5cf6;
          border-color: #8b5cf6;
          color: white;
        }

        .position-mark {
          font-size: 0.7rem;
          color: #94a3b8;
          font-family: monospace;
        }

        /* Dark Mode */
        @media (prefers-color-scheme: dark) {
          .content-text {
            color: #e2e8f0;
          }
          .media-node {
            background: #1e293b;
          }
          .media-piece {
            background: #0f172a;
          }
          .action-knots {
            border-bottom-color: #1e293b;
          }
          .comment-thread {
            border-top-color: #1e293b;
          }
          .name-field, .message-field-wrapper textarea {
            border-bottom-color: #334155;
            color: #e2e8f0;
          }
          .comment-line {
            border-bottom-color: #1e293b;
          }
          .comment-author {
            color: #e2e8f0;
          }
          .comment-text {
            color: #94a3b8;
          }
          .nav-prev, .nav-next {
            border-color: #334155;
            color: #94a3b8;
          }
        }

        /* Responsive */
        @media (max-width: 640px) {
          .connected-carousel {
            max-width: 100%;
            margin: 1rem auto;
            padding-top: 1rem;
          }
          .action-knots {
            gap: 1rem;
          }
          .comment-input-line {
            flex-direction: column;
            gap: 8px;
          }
          .name-field {
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}