// src/components/frontend/LivePostCarousel.jsx
import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { 
  ChevronLeft, ChevronRight, Clock, Heart, MessageCircle, Share2, 
  Play, Pause, Volume2, VolumeX, Maximize2, X, CheckCircle,
  User, Mail, AlertCircle, Send, Bookmark, MoreHorizontal, Eye
} from 'lucide-react'

export default function LivePostCarousel({ posts, autoPlayInterval = 5000, onLike, onShare }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [timeLeft, setTimeLeft] = useState({})
  const [isHovering, setIsHovering] = useState(false)
  const [muted, setMuted] = useState(true)
  const [likedPosts, setLikedPosts] = useState({})
  const [showComments, setShowComments] = useState({})
  const [comments, setComments] = useState({})
  const [loadingComments, setLoadingComments] = useState({})
  const [commentName, setCommentName] = useState({})
  const [commentEmail, setCommentEmail] = useState({})
  const [commentText, setCommentText] = useState({})
  const [submittingComment, setSubmittingComment] = useState({})
  const [showShareMenu, setShowShareMenu] = useState({})
  const [copySuccess, setCopySuccess] = useState({})
  const [expandedContent, setExpandedContent] = useState({})
  const [visitorId, setVisitorId] = useState(null)
  const videoRefs = useRef({})
  const autoPlayRef = useRef(null)

  // Get visitor ID for anonymous interactions
  useEffect(() => {
    let vid = localStorage.getItem('visitor_id')
    if (!vid) {
      vid = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('visitor_id', vid)
    }
    setVisitorId(vid)
  }, [])

  // Set liked posts from props
  useEffect(() => {
    const liked = {}
    posts.forEach(post => {
      if (post.user_has_liked) {
        liked[post.id] = true
      }
    })
    setLikedPosts(liked)
  }, [posts])

  // Calculate time remaining
  useEffect(() => {
    const updateTimers = () => {
      const newTimeLeft = {}
      posts.forEach(post => {
        if (!post.expires_at) return
        
        const diff = new Date(post.expires_at) - new Date()
        if (diff > 0) {
          const hours = Math.floor(diff / (1000 * 60 * 60))
          const minutes = Math.floor((diff % 3600000) / 60000)
          const seconds = Math.floor((diff % 60000) / 1000)
          
          if (hours > 0) {
            newTimeLeft[post.id] = `${hours}h ${minutes}m`
          } else if (minutes > 0) {
            newTimeLeft[post.id] = `${minutes}m ${seconds}s`
          } else {
            newTimeLeft[post.id] = `${seconds}s`
          }
        } else {
          newTimeLeft[post.id] = 'Expired'
        }
      })
      setTimeLeft(newTimeLeft)
    }

    updateTimers()
    const interval = setInterval(updateTimers, 1000)
    return () => clearInterval(interval)
  }, [posts])

  // Auto-play carousel
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

  // Handle video playback
  useEffect(() => {
    Object.values(videoRefs.current).forEach(video => {
      if (video) video.pause()
    })
    
    const currentPost = posts[currentIndex]
    const videoKey = `${currentPost?.id}_0`
    const video = videoRefs.current[videoKey]
    if (video && !isHovering) {
      video.play().catch(e => console.log('Autoplay prevented:', e))
    }
  }, [currentIndex, posts, isHovering])

  const handleLike = async (postId) => {
    if (likedPosts[postId] || !visitorId) return
    
    // Optimistic update
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
      const { data, error } = await supabase
        .from('live_post_comments')
        .select('*')
        .eq('live_post_id', postId)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(50)
      
      if (!error && data) {
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
        body: JSON.stringify({
          author_name: name,
          author_email: commentEmail[postId] || null,
          content: text
        })
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
      console.error('Error submitting comment:', error)
    } finally {
      setSubmittingComment(prev => ({ ...prev, [postId]: false }))
    }
  }

  const handleShare = async (postId) => {
    const url = `${window.location.origin}/live-posts/${postId}`
    
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Check this out!', url })
      } catch (e) {}
    } else {
      await navigator.clipboard.writeText(url)
      setCopySuccess(prev => ({ ...prev, [postId]: true }))
      setTimeout(() => setCopySuccess(prev => ({ ...prev, [postId]: false })), 2000)
    }
    await onShare?.(postId)
  }

  const toggleMute = (postId, e) => {
    e.stopPropagation()
    const videoKey = `${postId}_0`
    const video = videoRefs.current[videoKey]
    if (video) {
      video.muted = !video.muted
      setMuted(!video.muted)
    }
  }

  const toggleFullscreen = (postId, e) => {
    e.stopPropagation()
    const videoKey = `${postId}_0`
    const video = videoRefs.current[videoKey]
    if (video && video.requestFullscreen) {
      video.requestFullscreen()
    }
  }

  const goToSlide = useCallback((index) => {
    setCurrentIndex(index)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }, [])

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % posts.length)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }, [posts.length])

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + posts.length) % posts.length)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }, [posts.length])

  const timeAgo = (date) => {
    if (!date) return ''
    const seconds = Math.floor((new Date() - new Date(date)) / 1000)
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  if (!posts || posts.length === 0) return null

  const currentPost = posts[currentIndex]
  const isUrgent = currentPost.expires_at && (new Date(currentPost.expires_at) - new Date() < 3600000)
  const isExpanded = expandedContent[currentPost.id]
  const displayContent = isExpanded 
    ? currentPost.content 
    : currentPost.content?.substring(0, 300)

  const categoryColors = {
    tech: { text: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20', gradient: 'from-blue-500 to-indigo-600' },
    health: { text: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', gradient: 'from-emerald-500 to-teal-600' },
    entertainment: { text: 'text-pink-500', bg: 'bg-pink-500/10', border: 'border-pink-500/20', gradient: 'from-pink-500 to-rose-600' },
    wealth: { text: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', gradient: 'from-amber-500 to-orange-600' },
    world: { text: 'text-cyan-500', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', gradient: 'from-cyan-500 to-blue-600' },
    lifestyle: { text: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20', gradient: 'from-orange-500 to-red-600' },
    growth: { text: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20', gradient: 'from-purple-500 to-violet-600' }
  }

  const colors = categoryColors[currentPost.category] || categoryColors.tech

  return (
    <div 
      className="live-carousel"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Main Card */}
      <div className="carousel-card">
        {/* Header */}
        <div className="card-header">
          <div className="user-info">
            <div className={`avatar ${colors.bg}`}>
              <span className={colors.text}>T</span>
            </div>
            <div className="user-details">
              <div className="user-name">
                Trendlin
                <CheckCircle size={14} className="verified" />
              </div>
              <div className="post-meta">
                <span className={`category-badge ${colors.text} ${colors.bg}`}>
                  {currentPost.category}
                </span>
                <span className="dot">•</span>
                <span className={`time-badge ${isUrgent ? 'urgent' : ''}`}>
                  <Clock size={12} />
                  {timeLeft[currentPost.id] || 'Expiring'}
                </span>
              </div>
            </div>
          </div>
          <button className="more-btn">
            <MoreHorizontal size={18} />
          </button>
        </div>

        {/* Content Section - TEXT FIRST */}
        <div className="card-content">
          {currentPost.content ? (
            <>
              <div className="content-text">
                <div dangerouslySetInnerHTML={{ __html: displayContent }} />
              </div>
              {currentPost.content.length > 300 && (
                <button onClick={() => setExpandedContent(prev => ({ ...prev, [currentPost.id]: !prev[currentPost.id] }))} className="expand-btn">
                  {isExpanded ? 'Show less' : 'Show more'}
                </button>
              )}
            </>
          ) : (
            <div className="no-content">No description provided</div>
          )}
        </div>

        {/* Media Gallery - UNDERNEATH TEXT */}
        {currentPost.media_items && currentPost.media_items.length > 0 && (
          <div className={`media-gallery ${currentPost.media_items.length === 1 ? 'single' : 'grid'} media-count-${currentPost.media_items.length}`}>
            {currentPost.media_items.map((media, idx) => (
              <div key={idx} className="media-item">
                {media.type === 'image' || (!media.type && !media.url?.match(/\.(mp4|webm|mov)$/i)) ? (
                  <img src={media.url} alt="" className="media-img" loading="lazy" />
                ) : (
                  <div className="video-container">
                    <video
                      ref={el => { if (el) videoRefs.current[`${currentPost.id}_${idx}`] = el }}
                      src={media.url}
                      muted={muted}
                      loop
                      playsInline
                      className="video-player"
                      poster={media.thumbnail}
                    />
                    <button 
                      className="video-play-btn" 
                      onClick={() => {
                        const video = videoRefs.current[`${currentPost.id}_${idx}`]
                        if (video) video.paused ? video.play() : video.pause()
                      }}
                    >
                      <Play size={24} fill="white" />
                    </button>
                    <button className="video-mute-btn" onClick={(e) => toggleMute(currentPost.id, e)}>
                      {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                    </button>
                    <button className="video-fullscreen-btn" onClick={(e) => toggleFullscreen(currentPost.id, e)}>
                      <Maximize2 size={16} />
                    </button>
                  </div>
                )}
                {currentPost.media_items.length > 1 && idx === 0 && (
                  <div className="media-count-badge">
                    +{currentPost.media_items.length - 1}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Stats Bar */}
        <div className="stats-bar">
          <div className="stats-left">
            <button className="stat" onClick={() => handleLike(currentPost.id)}>
              <Heart size={16} fill={likedPosts[currentPost.id] ? '#ef4444' : 'none'} color={likedPosts[currentPost.id] ? '#ef4444' : '#6b7280'} />
              <span>{((currentPost.likes || 0) + (likedPosts[currentPost.id] ? 1 : 0)).toLocaleString()}</span>
            </button>
            <button className="stat" onClick={() => loadComments(currentPost.id)}>
              <MessageCircle size={16} />
              <span>{(currentPost.comments_count || 0).toLocaleString()}</span>
            </button>
            <button className="stat">
              <Eye size={16} />
              <span>{(currentPost.view_count || 0).toLocaleString()}</span>
            </button>
          </div>
          <button className="save-btn">
            <Bookmark size={16} />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button onClick={() => handleLike(currentPost.id)} className={`action-btn ${likedPosts[currentPost.id] ? 'liked' : ''}`}>
            <Heart size={20} />
            <span>Like</span>
          </button>
          <button onClick={() => loadComments(currentPost.id)} className="action-btn">
            <MessageCircle size={20} />
            <span>Comment</span>
          </button>
          <button onClick={() => setShowShareMenu(prev => ({ ...prev, [currentPost.id]: !prev[currentPost.id] }))} className="action-btn">
            <Share2 size={20} />
            <span>Share</span>
          </button>
          <button className="action-btn">
            <Send size={20} />
            <span>Send</span>
          </button>
        </div>

        {/* Comments Section */}
        {showComments[currentPost.id] && (
          <div className="comments-section">
            <div className="comment-input-wrapper">
              <div className={`comment-avatar ${colors.bg}`}>
                <span className={colors.text}>?</span>
              </div>
              <div className="comment-form">
                <div className="comment-fields">
                  <input
                    type="text"
                    placeholder="Your name *"
                    value={commentName[currentPost.id] || ''}
                    onChange={(e) => setCommentName(prev => ({ ...prev, [currentPost.id]: e.target.value }))}
                    className="comment-name"
                  />
                  <input
                    type="email"
                    placeholder="Your email (optional)"
                    value={commentEmail[currentPost.id] || ''}
                    onChange={(e) => setCommentEmail(prev => ({ ...prev, [currentPost.id]: e.target.value }))}
                    className="comment-email"
                  />
                </div>
                <div className="comment-textarea-wrapper">
                  <textarea
                    placeholder="Write a comment..."
                    value={commentText[currentPost.id] || ''}
                    onChange={(e) => setCommentText(prev => ({ ...prev, [currentPost.id]: e.target.value }))}
                    className="comment-textarea"
                    rows="2"
                  />
                  <button 
                    onClick={() => submitComment(currentPost.id)} 
                    disabled={submittingComment[currentPost.id] || !commentName[currentPost.id] || !commentText[currentPost.id]}
                    className="comment-submit"
                  >
                    {submittingComment[currentPost.id] ? 'Posting...' : 'Post'}
                  </button>
                </div>
              </div>
            </div>

            <div className="comments-list">
              {loadingComments[currentPost.id] ? (
                <div className="comments-loading">Loading comments...</div>
              ) : !comments[currentPost.id] || comments[currentPost.id].length === 0 ? (
                <div className="no-comments">No comments yet. Be the first!</div>
              ) : (
                comments[currentPost.id].map((comment) => (
                  <div key={comment.id} className="comment-item">
                    <div className={`comment-avatar-small ${colors.bg}`}>
                      <span className={colors.text}>
                        {comment.author_name?.[0]?.toUpperCase() || '?'}
                      </span>
                    </div>
                    <div className="comment-content">
                      <div className="comment-header">
                        <span className="comment-author">{comment.author_name}</span>
                        <span className="comment-time">{timeAgo(comment.created_at)}</span>
                      </div>
                      <div className="comment-text">{comment.content}</div>
                      <button className="comment-like-btn">Like</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Share Menu */}
        {showShareMenu[currentPost.id] && (
          <div className="share-menu" onClick={(e) => e.stopPropagation()}>
            <div className="share-header">
              <span>Share this post</span>
              <button onClick={() => setShowShareMenu(prev => ({ ...prev, [currentPost.id]: false }))}>
                <X size={16} />
              </button>
            </div>
            <div className="share-options">
              <button onClick={() => handleShare(currentPost.id)}>📋 Copy link</button>
              <button>🐦 Twitter</button>
              <button>📘 Facebook</button>
              <button>💬 WhatsApp</button>
            </div>
            {copySuccess[currentPost.id] && (
              <div className="copy-success">
                <CheckCircle size={14} />
                Link copied!
              </div>
            )}
          </div>
        )}

        {/* Read More Link */}
        <Link href={`/live-posts/${currentPost.category}`} className="read-more-link">
          Read full story
          <ChevronRight size={16} />
        </Link>
      </div>

      {/* Navigation Buttons */}
      {posts.length > 1 && (
        <>
          <button className="nav-arrow prev" onClick={prevSlide}>
            <ChevronLeft size={24} />
          </button>
          <button className="nav-arrow next" onClick={nextSlide}>
            <ChevronRight size={24} />
          </button>
        </>
      )}

      {/* Progress Bar */}
      {posts.length > 1 && isAutoPlaying && !isHovering && (
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ animationDuration: `${autoPlayInterval}ms` }} onAnimationEnd={nextSlide} />
        </div>
      )}

      {/* Dot Indicators */}
      <div className="dot-indicators">
        {posts.map((_, idx) => (
          <button
            key={idx}
            className={`dot ${idx === currentIndex ? 'active' : ''}`}
            onClick={() => goToSlide(idx)}
            style={{ background: idx === currentIndex ? '#8b5cf6' : 'rgba(255,255,255,0.3)' }}
          />
        ))}
      </div>

      <style jsx>{`
        .live-carousel {
          position: relative;
          max-width: 680px;
          margin: 0 auto;
        }

        .carousel-card {
          background: white;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .carousel-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);
        }

        /* Header */
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid #eef2f6;
        }

        .user-info {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: 600;
        }

        .user-details {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .user-name {
          font-weight: 700;
          font-size: 15px;
          color: #1e293b;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .verified {
          color: #3b82f6;
        }

        .post-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #64748b;
        }

        .category-badge {
          padding: 2px 8px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
        }

        .time-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          font-family: monospace;
        }

        .time-badge.urgent {
          color: #ef4444;
          font-weight: 600;
          animation: pulse 1s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        .dot {
          color: #cbd5e1;
        }

        .more-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          color: #64748b;
          cursor: pointer;
        }

        .more-btn:hover {
          background: #f1f5f9;
        }

        /* Content */
        .card-content {
          padding: 20px;
        }

        .content-text {
          font-size: 15px;
          line-height: 1.6;
          color: #1e293b;
        }

        .no-content {
          color: #94a3b8;
          font-style: italic;
        }

        .expand-btn {
          margin-top: 8px;
          color: #8b5cf6;
          font-size: 13px;
          font-weight: 500;
          background: none;
          border: none;
          cursor: pointer;
        }

        /* Media Gallery */
        .media-gallery {
          margin: 0 16px 16px;
          border-radius: 16px;
          overflow: hidden;
          background: #0f0f0f;
        }

        .media-gallery.single {
          max-height: 500px;
        }

        .media-gallery.grid {
          display: grid;
          gap: 2px;
        }

        .media-count-2 {
          grid-template-columns: repeat(2, 1fr);
        }

        .media-count-3, .media-count-4 {
          grid-template-columns: repeat(2, 1fr);
        }

        .media-count-3 .media-item:first-child {
          grid-row: span 2;
        }

        .media-item {
          position: relative;
          background: #000;
          cursor: pointer;
        }

        .media-img {
          width: 100%;
          height: auto;
          display: block;
        }

        .video-container {
          position: relative;
          background: #000;
          aspect-ratio: 16/9;
        }

        .video-player {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .video-play-btn {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.7);
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: white;
          transition: all 0.2s;
          opacity: 0;
        }

        .video-container:hover .video-play-btn {
          opacity: 1;
        }

        .video-play-btn:hover {
          transform: translate(-50%, -50%) scale(1.1);
        }

        .video-mute-btn, .video-fullscreen-btn {
          position: absolute;
          bottom: 12px;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.6);
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: white;
          backdrop-filter: blur(4px);
        }

        .video-mute-btn {
          right: 52px;
        }

        .video-fullscreen-btn {
          right: 12px;
        }

        .media-count-badge {
          position: absolute;
          bottom: 12px;
          right: 12px;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(8px);
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 12px;
          color: white;
          font-weight: 500;
        }

        /* Stats */
        .stats-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 20px;
          border-top: 1px solid #eef2f6;
          border-bottom: 1px solid #eef2f6;
        }

        .stats-left {
          display: flex;
          gap: 16px;
        }

        .stat {
          display: flex;
          align-items: center;
          gap: 6px;
          background: none;
          border: none;
          font-size: 13px;
          color: #64748b;
          cursor: pointer;
        }

        .save-btn {
          background: none;
          border: none;
          color: #64748b;
          cursor: pointer;
        }

        /* Action Buttons */
        .action-buttons {
          display: flex;
          justify-content: space-around;
          padding: 12px 20px;
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 20px;
          background: none;
          border: none;
          border-radius: 40px;
          color: #64748b;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .action-btn:hover {
          background: #f1f5f9;
        }

        .action-btn.liked {
          color: #ef4444;
        }

        /* Comments */
        .comments-section {
          padding: 16px 20px;
          border-top: 1px solid #eef2f6;
          background: #fafbfc;
        }

        .comment-input-wrapper {
          display: flex;
          gap: 12px;
          margin-bottom: 20px;
        }

        .comment-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          flex-shrink: 0;
        }

        .comment-form {
          flex: 1;
        }

        .comment-fields {
          display: flex;
          gap: 8px;
          margin-bottom: 8px;
        }

        .comment-name, .comment-email {
          flex: 1;
          padding: 8px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          font-size: 13px;
          outline: none;
        }

        .comment-name:focus, .comment-email:focus {
          border-color: #8b5cf6;
        }

        .comment-textarea-wrapper {
          position: relative;
        }

        .comment-textarea {
          width: 100%;
          padding: 10px 80px 10px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          font-size: 14px;
          resize: none;
          outline: none;
          font-family: inherit;
        }

        .comment-textarea:focus {
          border-color: #8b5cf6;
        }

        .comment-submit {
          position: absolute;
          right: 8px;
          bottom: 8px;
          padding: 4px 12px;
          background: #8b5cf6;
          color: white;
          border: none;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
        }

        .comment-submit:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .comments-list {
          max-height: 400px;
          overflow-y: auto;
        }

        .comments-loading, .no-comments {
          text-align: center;
          padding: 20px;
          color: #94a3b8;
          font-size: 13px;
        }

        .comment-item {
          display: flex;
          gap: 12px;
          margin-bottom: 16px;
        }

        .comment-avatar-small {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
          flex-shrink: 0;
        }

        .comment-content {
          flex: 1;
        }

        .comment-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;
        }

        .comment-author {
          font-weight: 600;
          font-size: 13px;
          color: #1e293b;
        }

        .comment-time {
          font-size: 11px;
          color: #94a3b8;
        }

        .comment-text {
          font-size: 14px;
          color: #334155;
          margin-bottom: 4px;
        }

        .comment-like-btn {
          background: none;
          border: none;
          font-size: 11px;
          color: #64748b;
          cursor: pointer;
        }

        /* Share Menu */
        .share-menu {
          position: absolute;
          bottom: 100%;
          right: 20px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          padding: 12px;
          min-width: 180px;
          z-index: 20;
          margin-bottom: 8px;
        }

        .share-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 8px;
          margin-bottom: 8px;
          border-bottom: 1px solid #eef2f6;
          font-weight: 500;
          font-size: 13px;
        }

        .share-header button {
          background: none;
          border: none;
          cursor: pointer;
          color: #64748b;
        }

        .share-options {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .share-options button {
          padding: 8px 12px;
          background: none;
          border: none;
          border-radius: 8px;
          text-align: left;
          cursor: pointer;
          font-size: 13px;
        }

        .share-options button:hover {
          background: #f1f5f9;
        }

        .copy-success {
          margin-top: 8px;
          padding: 6px;
          background: #22c55e;
          color: white;
          border-radius: 8px;
          font-size: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
        }

        /* Read More */
        .read-more-link {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 16px;
          text-align: center;
          color: #8b5cf6;
          text-decoration: none;
          font-weight: 500;
          font-size: 14px;
          border-top: 1px solid #eef2f6;
          transition: background 0.2s;
        }

        .read-more-link:hover {
          background: rgba(139, 92, 246, 0.05);
        }

        /* Navigation */
        .nav-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: white;
          border: 1px solid #eef2f6;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #1e293b;
          transition: all 0.2s;
          z-index: 10;
        }

        .nav-arrow.prev {
          left: -20px;
        }

        .nav-arrow.next {
          right: -20px;
        }

        .nav-arrow:hover {
          background: #8b5cf6;
          color: white;
          border-color: #8b5cf6;
        }

        /* Progress Bar */
        .progress-bar-container {
          position: absolute;
          bottom: -4px;
          left: 20px;
          right: 20px;
          height: 3px;
          background: rgba(0, 0, 0, 0.1);
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #8b5cf6, #ec4899);
          width: 0%;
          animation: progress linear forwards;
        }

        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }

        /* Dot Indicators */
        .dot-indicators {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-top: 20px;
        }

        .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          padding: 0;
        }

        .dot.active {
          width: 24px;
          border-radius: 3px;
        }

        /* Dark Mode */
        @media (prefers-color-scheme: dark) {
          .carousel-card {
            background: #1e1e2e;
          }
          .card-header {
            border-bottom-color: #2d2d3d;
          }
          .user-name, .content-text, .comment-author {
            color: #f1f5f9;
          }
          .comment-text {
            color: #cbd5e1;
          }
          .comments-section {
            background: #16162a;
            border-top-color: #2d2d3d;
          }
          .action-btn:hover, .more-btn:hover {
            background: #2d2d3d;
          }
          .comment-name, .comment-email, .comment-textarea {
            background: #2d2d3d;
            border-color: #3d3d4d;
            color: #f1f5f9;
          }
          .share-menu {
            background: #1e1e2e;
            border-color: #2d2d3d;
          }
          .nav-arrow {
            background: #1e1e2e;
            border-color: #2d2d3d;
            color: #f1f5f9;
          }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .nav-arrow.prev {
            left: -8px;
          }
          .nav-arrow.next {
            right: -8px;
          }
          .nav-arrow {
            width: 32px;
            height: 32px;
          }
          .action-btn span {
            display: none;
          }
          .action-btn {
            padding: 8px 12px;
          }
          .comment-fields {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  )
}