// src/components/frontend/LivePostCarousel.jsx (Complete with Interactions)
import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { useInteractions } from '../../hooks/useInteractions'
import { 
  ChevronLeft, ChevronRight, Heart, MessageCircle, Share2, 
  Play, Volume2, VolumeX, Maximize2, CheckCircle,
  Zap, User, Send, X, Twitter, Facebook, Linkedin, Copy, Clock
} from 'lucide-react'

export default function LivePostCarousel({ posts, autoPlayInterval = 5000, onLike, onShare, sessionId }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [isHovering, setIsHovering] = useState(false)
  const [showComments, setShowComments] = useState({})
  const [comments, setComments] = useState({})
  const [commentCounts, setCommentCounts] = useState({})
  const [loadingComments, setLoadingComments] = useState({})
  const [commentName, setCommentName] = useState({})
  const [commentText, setCommentText] = useState({})
  const [submitting, setSubmitting] = useState({})
  const [expandedContent, setExpandedContent] = useState({})
  const [errorMsg, setErrorMsg] = useState({})
  const [successMsg, setSuccessMsg] = useState({})
  const [showShareModal, setShowShareModal] = useState({})
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

  // Load comment counts
  useEffect(() => {
    const loadAllCommentCounts = async () => {
      const counts = {}
      for (const post of posts) {
        const { count } = await supabase
          .from('live_post_comments')
          .select('*', { count: 'exact', head: true })
          .eq('live_post_id', post.id)
        counts[post.id] = count || 0
      }
      setCommentCounts(counts)
    }
    if (posts.length > 0) loadAllCommentCounts()
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

  // LOAD COMMENTS
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
    } finally {
      setLoadingComments(prev => ({ ...prev, [postId]: false }))
    }
  }

  // SUBMIT COMMENT
  const submitComment = async (postId) => {
    const name = commentName[postId]?.trim()
    const text = commentText[postId]?.trim()
    
    if (!name || !text) return
    
    setSubmitting(prev => ({ ...prev, [postId]: true }))
    
    const optimisticComment = {
      id: `temp_${Date.now()}`,
      user_name: name,
      content: text,
      created_at: new Date().toISOString()
    }
    
    setComments(prev => ({
      ...prev,
      [postId]: [optimisticComment, ...(prev[postId] || [])]
    }))
    setCommentCounts(prev => ({ ...prev, [postId]: (prev[postId] || 0) + 1 }))
    setCommentText(prev => ({ ...prev, [postId]: '' }))
    
    try {
      const { data, error } = await supabase
        .from('live_post_comments')
        .insert([{
          live_post_id: postId,
          user_name: name,
          content: text,
          user_id: getSessionId(),
          created_at: new Date().toISOString()
        }])
        .select()
        .single()
      
      if (error) throw error
      
      setComments(prev => ({
        ...prev,
        [postId]: prev[postId].map(c => c.id === optimisticComment.id ? data : c)
      }))
      
      setSuccessMsg(prev => ({ ...prev, [postId]: 'Comment posted!' }))
      setTimeout(() => setSuccessMsg(prev => ({ ...prev, [postId]: null })), 2000)
      
    } catch (err) {
      setComments(prev => ({
        ...prev,
        [postId]: prev[postId].filter(c => c.id !== optimisticComment.id)
      }))
      setCommentCounts(prev => ({ ...prev, [postId]: (prev[postId] || 1) - 1 }))
    } finally {
      setSubmitting(prev => ({ ...prev, [postId]: false }))
    }
  }

  // SHARE FUNCTION
  const handleShareClick = (postId, platform) => {
    const url = `${window.location.origin}/live-posts/${postId}`
    const title = encodeURIComponent('Check out this post on Trendlin')
    
    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${title}&url=${encodeURIComponent(url)}`, '_blank', 'width=550,height=420')
        break
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank', 'width=550,height=520')
        break
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank', 'width=550,height=520')
        break
      case 'copy':
        navigator.clipboard.writeText(url)
        setSuccessMsg(prev => ({ ...prev, [postId]: 'Link copied!' }))
        setTimeout(() => setSuccessMsg(prev => ({ ...prev, [postId]: null })), 2000)
        setShowShareModal(prev => ({ ...prev, [postId]: false }))
        return
    }
    
    setShowShareModal(prev => ({ ...prev, [postId]: false }))
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
  const currentCommentCount = commentCounts[currentPost.id] ?? currentPost.comments_count ?? 0

  // Use the interactions hook for the current post
  const {
    likes: liveLikes,
    shares: liveShares,
    hasLiked: userHasLiked,
    pendingLike,
    pendingShare,
    isSyncing: isSyncingInteractions,
    toggleLike,
    incrementShare
  } = useInteractions(currentPost.id, getSessionId())

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

        {/* Actions with Interactions */}
        <div className="action-knots">
          <button 
            onClick={toggleLike} 
            className={`knot like ${userHasLiked ? 'active' : ''}`}
            disabled={isSyncingInteractions}
          >
            <Heart size={16} fill={userHasLiked ? '#ef4444' : 'none'} />
            <span>{formatNumber(liveLikes)}</span>
            {pendingLike !== undefined && (
              <span className="pending-indicator" title="Will be saved soon">
                <Clock size={10} />
              </span>
            )}
          </button>
          
          <button onClick={() => loadComments(currentPost.id)} className={`knot ${isCommentsOpen ? 'active' : ''}`}>
            <MessageCircle size={16} />
            <span>{formatNumber(currentCommentCount)}</span>
          </button>
          
          <button onClick={() => setShowShareModal(prev => ({ ...prev, [currentPost.id]: !prev[currentPost.id] }))} className="knot">
            <Share2 size={16} />
            <span>{formatNumber(liveShares)}</span>
            {pendingShare !== undefined && (
              <span className="pending-indicator" title="Will be saved soon">
                <Clock size={10} />
              </span>
            )}
          </button>
        </div>

        {/* Sync Status */}
        {(pendingLike !== undefined || pendingShare !== undefined) && (
          <div className="sync-status-bar">
            <div className="sync-status-content">
              {isSyncingInteractions ? (
                <>
                  <div className="sync-spinner-small" />
                  <span>Saving your interaction...</span>
                </>
              ) : (
                <>
                  <Clock size={12} />
                  <span>Will be saved in background</span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Share Modal */}
        {showShareModal[currentPost.id] && (
          <div className="share-modal" ref={shareModalRef}>
            <div className="share-modal-header">
              <span>Share this story</span>
              <button onClick={() => setShowShareModal(prev => ({ ...prev, [currentPost.id]: false }))}>
                <X size={16} />
              </button>
            </div>
            <div className="share-buttons">
              <button onClick={() => {
                incrementShare()
                handleShareClick(currentPost.id, 'twitter')
              }} className="share-btn twitter">
                <Twitter size={18} />
                <span>Twitter</span>
              </button>
              <button onClick={() => {
                incrementShare()
                handleShareClick(currentPost.id, 'facebook')
              }} className="share-btn facebook">
                <Facebook size={18} />
                <span>Facebook</span>
              </button>
              <button onClick={() => {
                incrementShare()
                handleShareClick(currentPost.id, 'linkedin')
              }} className="share-btn linkedin">
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

        {/* Comments Section */}
        {isCommentsOpen && (
          <div className="comment-thread">
            {errorMsg[currentPost.id] && (
              <div className="error-message"><X size={12} /> {errorMsg[currentPost.id]}</div>
            )}
            {successMsg[currentPost.id] && (
              <div className="success-message"><CheckCircle size={14} /> {successMsg[currentPost.id]}</div>
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
                currentComments.slice(0, 10).map((comment) => (
                  <div key={comment.id} className="comment-item">
                    <div className="comment-header">
                      <span className="comment-author">{comment.user_name}</span>
                      <span className="comment-time">{timeAgo(comment.created_at)}</span>
                    </div>
                    <div className="comment-text">{comment.content}</div>
                    {comment.admin_reply && (
                      <div className="admin-reply">
                        <div className="admin-reply-header">
                          <span className="admin-badge">✓ Admin Response</span>
                        </div>
                        <div className="admin-reply-content">{comment.admin_reply}</div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        {posts.length > 1 && (
          <div className="nav-controls">
            <button onClick={prevSlide} className="nav-prev"><ChevronLeft size={20} /></button>
            <div className="position-mark">{currentIndex + 1} / {posts.length}</div>
            <button onClick={nextSlide} className="nav-next"><ChevronRight size={20} /></button>
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
          margin-bottom: 1rem;
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
          position: relative;
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

        .knot:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .pending-indicator {
          display: inline-flex;
          margin-left: 2px;
          color: #f59e0b;
          animation: pulse 1s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .sync-status-bar {
          margin: 8px 0;
          padding: 6px 12px;
          background: #fef3c7;
          border-radius: 8px;
          font-size: 0.7rem;
          color: #d97706;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .sync-status-content {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .sync-spinner-small {
          width: 12px;
          height: 12px;
          border: 2px solid #d97706;
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
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

        /* Comments */
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

        .comment-text {
          font-size: 0.8rem;
          color: #475569;
          line-height: 1.5;
        }

        .admin-reply {
          margin-top: 8px;
          padding: 10px 12px;
          background: #f0fdf4;
          border-radius: 12px;
          border-left: 3px solid #22c55e;
        }

        .admin-reply-header {
          margin-bottom: 6px;
        }

        .admin-badge {
          font-size: 0.65rem;
          font-weight: 600;
          color: #22c55e;
        }

        .admin-reply-content {
          font-size: 0.75rem;
          color: #1e293b;
          line-height: 1.4;
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
          .comment-text { color: #94a3b8; }
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
          .sync-status-bar {
            background: #451a03;
            color: #fbbf24;
          }
          .sync-spinner-small {
            border-color: #fbbf24;
            border-top-color: transparent;
          }
          .admin-reply {
            background: #064e3b;
          }
          .admin-reply-content {
            color: #e2e8f0;
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