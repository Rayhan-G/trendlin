// src/components/frontend/LivePostCarousel.jsx
import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { 
  ChevronLeft, ChevronRight, Heart, MessageCircle, Share2, 
  Play, Volume2, VolumeX, Maximize2, CheckCircle,
  Zap, User, Send, X, Twitter, Facebook, Linkedin, Copy
} from 'lucide-react'

export default function LivePostCarousel({ posts, autoPlayInterval = 5000, onLike, onShare, sessionId }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [isHovering, setIsHovering] = useState(false)
  const [likedPosts, setLikedPosts] = useState({})
  const [showComments, setShowComments] = useState({})
  const [comments, setComments] = useState({})
  const [loadingComments, setLoadingComments] = useState({})
  const [commentName, setCommentName] = useState({})
  const [commentText, setCommentText] = useState({})
  const [submitting, setSubmitting] = useState({})
  const [expandedContent, setExpandedContent] = useState({})
  const [errorMsg, setErrorMsg] = useState({})
  const [successMsg, setSuccessMsg] = useState({})
  const [showShareModal, setShowShareModal] = useState({})
  const [shareCount, setShareCount] = useState({})
  const autoPlayRef = useRef(null)
  const shareModalRef = useRef(null)

  const getSessionId = useCallback(() => {
    if (sessionId) return sessionId
    let id = localStorage.getItem('visitor_id')
    if (!id) {
      id = `v_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
      localStorage.setItem('visitor_id', id)
    }
    return id
  }, [sessionId])

  // Load share counts from posts
  useEffect(() => {
    const counts = {}
    posts.forEach(post => {
      counts[post.id] = post.shares || 0
    })
    setShareCount(counts)
  }, [posts])

  // Set liked state from posts
  useEffect(() => {
    const liked = {}
    posts.forEach(post => {
      const likedBy = post.liked_by || []
      if (likedBy.includes(getSessionId())) {
        liked[post.id] = true
      }
    })
    setLikedPosts(liked)
  }, [posts, getSessionId])

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

  // Close share modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (shareModalRef.current && !shareModalRef.current.contains(event.target)) {
        setShowShareModal({})
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLike = async (postId) => {
    if (likedPosts[postId]) return
    
    const userId = getSessionId()
    
    setLikedPosts(prev => ({ ...prev, [postId]: true }))
    
    try {
      const response = await fetch(`/api/live-posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        setLikedPosts(prev => ({ ...prev, [postId]: false }))
        setErrorMsg(prev => ({ ...prev, [postId]: data.error || 'Unable to process like' }))
        setTimeout(() => setErrorMsg(prev => ({ ...prev, [postId]: null })), 3000)
      } else if (onLike && data.likes !== undefined) {
        onLike(postId, data.likes)
      }
    } catch (err) {
      setLikedPosts(prev => ({ ...prev, [postId]: false }))
      console.error('Like error:', err)
    }
  }

  // LOAD COMMENTS - Including admin replies
  const loadComments = async (postId) => {
    if (showComments[postId]) {
      setShowComments(prev => ({ ...prev, [postId]: false }))
      return
    }
    
    if (comments[postId] && comments[postId].length > 0) {
      setShowComments(prev => ({ ...prev, [postId]: true }))
      return
    }
    
    setLoadingComments(prev => ({ ...prev, [postId]: true }))
    
    try {
      const { data, error } = await supabase
        .from('live_post_comments')
        .select('*')
        .eq('live_post_id', postId)
        .order('created_at', { ascending: false })
        .limit(50)
      
      if (error) throw error
      
      setComments(prev => ({ ...prev, [postId]: data || [] }))
      setShowComments(prev => ({ ...prev, [postId]: true }))
    } catch (err) {
      console.error('Load comments error:', err)
      setErrorMsg(prev => ({ ...prev, [postId]: 'Failed to load comments' }))
      setTimeout(() => setErrorMsg(prev => ({ ...prev, [postId]: null })), 3000)
    } finally {
      setLoadingComments(prev => ({ ...prev, [postId]: false }))
    }
  }

  // SUBMIT COMMENT
  const submitComment = async (postId) => {
    const name = commentName[postId]?.trim()
    const text = commentText[postId]?.trim()
    
    if (!name) {
      setErrorMsg(prev => ({ ...prev, [postId]: 'Name is required' }))
      setTimeout(() => setErrorMsg(prev => ({ ...prev, [postId]: null })), 3000)
      return
    }
    
    if (!text) {
      setErrorMsg(prev => ({ ...prev, [postId]: 'Comment cannot be empty' }))
      setTimeout(() => setErrorMsg(prev => ({ ...prev, [postId]: null })), 3000)
      return
    }
    
    setSubmitting(prev => ({ ...prev, [postId]: true }))
    
    // Optimistic comment
    const optimisticComment = {
      id: `temp_${Date.now()}`,
      live_post_id: postId,
      user_name: name,
      content: text,
      created_at: new Date().toISOString(),
      admin_reply: null,
      admin_replied_at: null
    }
    
    setComments(prev => ({
      ...prev,
      [postId]: [optimisticComment, ...(prev[postId] || [])]
    }))
    
    setCommentText(prev => ({ ...prev, [postId]: '' }))
    
    try {
      const { data, error } = await supabase
        .from('live_post_comments')
        .insert([{
          live_post_id: postId,
          user_name: name,
          content: text,
          created_at: new Date().toISOString()
        }])
        .select()
        .single()
      
      if (error) throw error
      
      setComments(prev => ({
        ...prev,
        [postId]: prev[postId].map(c => 
          c.id === optimisticComment.id ? data : c
        )
      }))
      
      setSuccessMsg(prev => ({ ...prev, [postId]: 'Comment posted!' }))
      setTimeout(() => setSuccessMsg(prev => ({ ...prev, [postId]: null })), 2000)
      
    } catch (err) {
      console.error('Submit error:', err)
      setComments(prev => ({
        ...prev,
        [postId]: prev[postId].filter(c => c.id !== optimisticComment.id)
      }))
      setErrorMsg(prev => ({ ...prev, [postId]: 'Failed to post comment' }))
      setTimeout(() => setErrorMsg(prev => ({ ...prev, [postId]: null })), 3000)
    } finally {
      setSubmitting(prev => ({ ...prev, [postId]: false }))
    }
  }

  // FIXED SHARE FUNCTION - Opens social media share dialog
  const handleShareClick = (postId, platform) => {
    const url = `${window.location.origin}/live-posts/${postId}`
    const title = encodeURIComponent('Check out this post on Trendlin')
    let shareWindow
    
    switch (platform) {
      case 'twitter':
        shareWindow = window.open(
          `https://twitter.com/intent/tweet?text=${title}&url=${encodeURIComponent(url)}`,
          '_blank',
          'width=550,height=420,left=300,top=100'
        )
        break
      case 'facebook':
        shareWindow = window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
          '_blank',
          'width=550,height=520,left=300,top=100'
        )
        break
      case 'linkedin':
        shareWindow = window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
          '_blank',
          'width=550,height=520,left=300,top=100'
        )
        break
      case 'copy':
        navigator.clipboard.writeText(url)
        setSuccessMsg(prev => ({ ...prev, [postId]: 'Link copied!' }))
        setTimeout(() => setSuccessMsg(prev => ({ ...prev, [postId]: null })), 2000)
        setShowShareModal(prev => ({ ...prev, [postId]: false }))
        return
      default:
        if (navigator.share) {
          navigator.share({ title: 'Check this out!', url })
        }
        return
    }
    
    // Close modal and track share if window opened successfully
    setShowShareModal(prev => ({ ...prev, [postId]: false }))
    
    if (shareWindow && platform !== 'copy') {
      // Increment share count
      setShareCount(prev => ({ ...prev, [postId]: (prev[postId] || 0) + 1 }))
      
      // Track share in background
      fetch(`/api/live-posts/${postId}/share`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }).catch(err => console.error('Share track error:', err))
      
      if (onShare) onShare(postId)
    }
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
    const days = Math.floor(hours / 24)
    return `${days}d`
  }

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  if (!posts || posts.length === 0) return null

  const currentPost = posts[currentIndex]
  const isExpanded = expandedContent[currentPost.id]
  const displayContent = isExpanded ? currentPost.content : currentPost.content?.substring(0, 280)
  const currentComments = comments[currentPost.id] || []
  const isCommentsOpen = showComments[currentPost.id]
  const currentShareCount = shareCount[currentPost.id] || currentPost.shares || 0

  const getTimeLeft = () => {
    if (!currentPost.expires_at) return null
    const diff = new Date(currentPost.expires_at) - new Date()
    if (diff <= 0) return null
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % 3600000) / 60000)
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  return (
    <div 
      className="connected-carousel"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Connection Thread */}
      <div className="connection-thread">
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

      {/* Main Content */}
      <div className="content-node">
        {/* Category Header */}
        <div className="category-marker">
          <span className="category-dot" />
          <span className="category-name">{currentPost.category}</span>
          {getTimeLeft() && (
            <span className="time-mark">
              <Zap size={10} />
              {getTimeLeft()} remaining
            </span>
          )}
        </div>

        {/* Content */}
        <div className="content-block">
          {currentPost.content ? (
            <>
              <div className="content-text">
                <div dangerouslySetInnerHTML={{ __html: displayContent || currentPost.content }} />
              </div>
              {currentPost.content.length > 280 && (
                <button onClick={() => setExpandedContent(prev => ({ ...prev, [currentPost.id]: !prev[currentPost.id] }))} className="expand-link">
                  {isExpanded ? 'Show less' : 'Continue reading'}
                  <ChevronRight size={14} />
                </button>
              )}
            </>
          ) : (
            <p className="empty-content">No description provided</p>
          )}
        </div>

        {/* Media */}
        {currentPost.media_items && currentPost.media_items.length > 0 && (
          <div className="media-node">
            {currentPost.media_items.slice(0, 2).map((media, idx) => (
              <div key={idx} className={`media-piece ${currentPost.media_items.length === 1 ? 'single' : 'pair'}`}>
                <img src={media.url} alt="" loading="lazy" />
              </div>
            ))}
            {currentPost.media_items.length > 2 && (
              <div className="media-more">+{currentPost.media_items.length - 2}</div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="action-knots">
          <button 
            onClick={() => handleLike(currentPost.id)} 
            className={`knot like ${likedPosts[currentPost.id] ? 'active' : ''}`}
            aria-label="Like"
          >
            <Heart size={16} fill={likedPosts[currentPost.id] ? '#ef4444' : 'none'} />
            <span>{formatNumber((currentPost.likes || 0) + (likedPosts[currentPost.id] ? 1 : 0))}</span>
          </button>
          
          <button 
            onClick={() => loadComments(currentPost.id)} 
            className={`knot ${isCommentsOpen ? 'active' : ''}`}
            aria-label="Comments"
          >
            <MessageCircle size={16} />
            <span>{formatNumber(currentPost.comments_count || currentComments.length || 0)}</span>
          </button>
          
          <button 
            onClick={() => setShowShareModal(prev => ({ ...prev, [currentPost.id]: !prev[currentPost.id] }))} 
            className="knot"
            aria-label="Share"
          >
            <Share2 size={16} />
            <span>{formatNumber(currentShareCount)}</span>
          </button>
        </div>

        {/* Share Modal - FIXED */}
        {showShareModal[currentPost.id] && (
          <div className="share-modal" ref={shareModalRef}>
            <div className="share-modal-header">
              <span>Share this story</span>
              <button onClick={() => setShowShareModal(prev => ({ ...prev, [currentPost.id]: false }))}>
                <X size={16} />
              </button>
            </div>
            <div className="share-buttons">
              <button onClick={() => handleShareClick(currentPost.id, 'twitter')} className="share-btn twitter">
                <Twitter size={18} />
                <span>Twitter</span>
              </button>
              <button onClick={() => handleShareClick(currentPost.id, 'facebook')} className="share-btn facebook">
                <Facebook size={18} />
                <span>Facebook</span>
              </button>
              <button onClick={() => handleShareClick(currentPost.id, 'linkedin')} className="share-btn linkedin">
                <Linkedin size={18} />
                <span>LinkedIn</span>
              </button>
              <button onClick={() => handleShareClick(currentPost.id, 'copy')} className="share-btn copy">
                <Copy size={18} />
                <span>Copy link</span>
              </button>
            </div>
          </div>
        )}

        {/* Comments Section - WITH ADMIN REPLY */}
        {isCommentsOpen && (
          <div className="comment-thread">
            {errorMsg[currentPost.id] && (
              <div className="error-message">
                <X size={12} /> {errorMsg[currentPost.id]}
              </div>
            )}
            {successMsg[currentPost.id] && (
              <div className="success-message">
                <CheckCircle size={14} /> {successMsg[currentPost.id]}
              </div>
            )}

            <div className="comment-input-line">
              <div className="input-group">
                <User size={14} className="input-icon" />
                <input
                  type="text"
                  placeholder="Your name"
                  value={commentName[currentPost.id] || ''}
                  onChange={(e) => setCommentName(prev => ({ ...prev, [currentPost.id]: e.target.value }))}
                  className="name-field"
                />
              </div>
              <div className="input-group message-group">
                <textarea
                  placeholder="Add to the conversation..."
                  value={commentText[currentPost.id] || ''}
                  onChange={(e) => setCommentText(prev => ({ ...prev, [currentPost.id]: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      submitComment(currentPost.id)
                    }
                  }}
                  rows="1"
                />
                <button 
                  onClick={() => submitComment(currentPost.id)} 
                  disabled={submitting[currentPost.id]}
                  className="send-btn"
                >
                  {submitting[currentPost.id] ? <div className="spinner-small" /> : <Send size={14} />}
                </button>
              </div>
            </div>

            <div className="comment-list">
              {loadingComments[currentPost.id] ? (
                <div className="comment-placeholder">Loading comments...</div>
              ) : currentComments.length === 0 ? (
                <div className="comment-placeholder">No comments yet. Start the conversation.</div>
              ) : (
                <>
                  {currentComments.slice(0, 10).map((comment) => (
                    <div key={comment.id} className="comment-item">
                      <div className="comment-header">
                        <span className="comment-author">{comment.user_name || comment.author_name}</span>
                        <span className="comment-time">{timeAgo(comment.created_at)}</span>
                      </div>
                      <div className="comment-content-text">{comment.content}</div>
                      
                      {/* Admin Reply - FIXED to show */}
                      {comment.admin_reply && (
                        <div className="admin-reply">
                          <div className="admin-reply-header">
                            <span className="admin-badge">Admin Response</span>
                            <span className="admin-reply-time">
                              {comment.admin_replied_at && timeAgo(comment.admin_replied_at)}
                            </span>
                          </div>
                          <div className="admin-reply-content">{comment.admin_reply}</div>
                        </div>
                      )}
                    </div>
                  ))}
                  {currentComments.length > 10 && (
                    <button className="view-more" onClick={() => loadComments(currentPost.id)}>
                      View all {currentComments.length} comments →
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        {posts.length > 1 && (
          <div className="nav-controls">
            <button onClick={prevSlide} className="nav-prev" aria-label="Previous">
              <ChevronLeft size={20} />
            </button>
            <div className="position-mark">
              {currentIndex + 1} / {posts.length}
            </div>
            <button onClick={nextSlide} className="nav-next" aria-label="Next">
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

        .connection-thread {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
        }

        .thread-line {
          position: absolute;
          top: 8px;
          left: 10%;
          right: 10%;
          height: 1px;
          background: repeating-linear-gradient(90deg, #8b5cf6 0px, #8b5cf6 4px, transparent 4px, transparent 12px);
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
          transition: all 0.3s ease;
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

        .content-node {
          animation: fadeSlide 0.4s ease;
        }

        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .category-marker {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 1.5rem;
          font-size: 0.75rem;
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
          font-weight: 600;
          letter-spacing: 0.5px;
        }

        .time-mark {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #94a3b8;
          font-family: monospace;
          font-size: 0.7rem;
        }

        .content-block {
          margin-bottom: 2rem;
        }

        .content-text {
          font-size: 1rem;
          line-height: 1.7;
          color: #1e293b;
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
        }

        .media-piece.single {
          grid-column: span 2;
        }

        .media-piece img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .media-more {
          position: absolute;
          bottom: 12px;
          right: 12px;
          background: rgba(0,0,0,0.7);
          backdrop-filter: blur(8px);
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.7rem;
          color: white;
          font-weight: 500;
        }

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
          transition: all 0.2s;
          padding: 4px 8px;
          border-radius: 8px;
        }

        .knot:hover {
          color: #8b5cf6;
          background: rgba(139, 92, 246, 0.05);
        }

        .knot.like.active {
          color: #ef4444;
        }

        .knot.active {
          color: #8b5cf6;
        }

        /* Share Modal */
        .share-modal {
          position: absolute;
          bottom: 100%;
          right: 0;
          background: white;
          border-radius: 16px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.15);
          padding: 1rem;
          z-index: 20;
          margin-bottom: 8px;
          border: 1px solid #e2e8f0;
          min-width: 180px;
        }

        .share-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 0.75rem;
          margin-bottom: 0.75rem;
          border-bottom: 1px solid #e2e8f0;
          font-size: 0.8rem;
          font-weight: 600;
          color: #1e293b;
        }

        .share-modal-header button {
          background: none;
          border: none;
          cursor: pointer;
          color: #64748b;
          padding: 4px;
          border-radius: 6px;
        }

        .share-modal-header button:hover {
          background: #f1f5f9;
        }

        .share-buttons {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .share-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 12px;
          background: none;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.8rem;
          transition: all 0.2s;
          width: 100%;
          text-align: left;
        }

        .share-btn.twitter { color: #1DA1F2; }
        .share-btn.facebook { color: #4267B2; }
        .share-btn.linkedin { color: #0077B5; }
        .share-btn.copy { color: #64748b; }

        .share-btn:hover {
          background: #f1f5f9;
          transform: translateX(4px);
        }

        /* Comments Section */
        .comment-thread {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #f1f5f9;
        }

        .comment-input-line {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 1.5rem;
        }

        .input-group {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 0;
          color: #94a3b8;
        }

        .name-field {
          width: 100%;
          padding: 8px 0 8px 24px;
          border: none;
          border-bottom: 1px solid #e2e8f0;
          font-size: 0.8rem;
          background: transparent;
          outline: none;
          transition: border-color 0.2s;
        }

        .name-field:focus {
          border-bottom-color: #8b5cf6;
        }

        .message-group textarea {
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

        .message-group textarea:focus {
          border-bottom-color: #8b5cf6;
        }

        .send-btn {
          position: absolute;
          right: 0;
          bottom: 6px;
          background: none;
          border: none;
          color: #8b5cf6;
          cursor: pointer;
          padding: 4px;
        }

        .send-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .spinner-small {
          width: 14px;
          height: 14px;
          border: 2px solid #e2e8f0;
          border-top-color: #8b5cf6;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: #ef444410;
          border-radius: 8px;
          margin-bottom: 1rem;
          font-size: 0.7rem;
          color: #ef4444;
        }

        .success-message {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: #22c55e10;
          border-radius: 8px;
          margin-bottom: 1rem;
          font-size: 0.7rem;
          color: #22c55e;
        }

        .comment-list {
          max-height: 400px;
          overflow-y: auto;
        }

        .comment-placeholder {
          text-align: center;
          padding: 1.5rem;
          color: #94a3b8;
          font-size: 0.75rem;
        }

        .comment-item {
          margin-bottom: 1rem;
          padding: 0.75rem 0;
          border-bottom: 1px solid #f8fafc;
        }

        .comment-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 6px;
        }

        .comment-author {
          font-weight: 600;
          font-size: 0.75rem;
          color: #1e293b;
        }

        .comment-time {
          font-size: 0.65rem;
          color: #94a3b8;
        }

        .comment-content-text {
          font-size: 0.8rem;
          color: #475569;
          line-height: 1.5;
        }

        /* Admin Reply Styles */
        .admin-reply {
          margin-top: 8px;
          padding: 10px 12px;
          background: #f0fdf4;
          border-radius: 12px;
          border-left: 3px solid #22c55e;
        }

        :global(body.dark) .admin-reply {
          background: #064e3b;
        }

        .admin-reply-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 6px;
        }

        .admin-badge {
          font-size: 0.65rem;
          font-weight: 600;
          color: #22c55e;
        }

        .admin-reply-time {
          font-size: 0.6rem;
          color: #94a3b8;
        }

        .admin-reply-content {
          font-size: 0.75rem;
          color: #1e293b;
          line-height: 1.4;
        }

        :global(body.dark) .admin-reply-content {
          color: #e2e8f0;
        }

        .view-more {
          background: none;
          border: none;
          color: #8b5cf6;
          font-size: 0.7rem;
          cursor: pointer;
          margin-top: 0.5rem;
        }

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
          transform: scale(1.05);
        }

        .position-mark {
          font-size: 0.7rem;
          color: #94a3b8;
          font-family: monospace;
        }

        @media (prefers-color-scheme: dark) {
          .content-text { color: #e2e8f0; }
          .media-node { background: #1e293b; }
          .media-piece { background: #0f172a; }
          .action-knots { border-bottom-color: #1e293b; }
          .comment-thread { border-top-color: #1e293b; }
          .name-field, .message-group textarea { border-bottom-color: #334155; color: #e2e8f0; }
          .comment-item { border-bottom-color: #1e293b; }
          .comment-author { color: #e2e8f0; }
          .comment-content-text { color: #94a3b8; }
          .nav-prev, .nav-next { border-color: #334155; color: #94a3b8; }
          .share-modal {
            background: #1e293b;
            border-color: #334155;
          }
          .share-modal-header {
            border-bottom-color: #334155;
            color: #f1f5f9;
          }
          .share-btn:hover {
            background: #334155;
          }
        }

        @media (max-width: 640px) {
          .connected-carousel { max-width: 100%; margin: 1rem auto; padding-top: 1rem; }
          .action-knots { gap: 1rem; }
          .share-modal { right: -40px; min-width: 160px; }
        }
      `}</style>
    </div>
  )
}