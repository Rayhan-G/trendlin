// src/pages/live-posts/[category].js
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import { Heart, MessageCircle, Share2, Clock, ArrowLeft, ChevronLeft, ChevronRight, Play, Pause, Volume2, VolumeX, Maximize2 } from 'lucide-react'

const categories = {
  tech: { name: 'Technology', icon: '⚡', color: '#3b82f6', description: 'Latest tech trends and innovations' },
  health: { name: 'Wellness', icon: '🌿', color: '#10b981', description: 'Health tips and wellness guides' },
  entertainment: { name: 'Culture', icon: '🎭', color: '#ec4899', description: 'Entertainment news and culture' },
  wealth: { name: 'Capital', icon: '💰', color: '#f59e0b', description: 'Financial insights and wealth building' },
  world: { name: 'Horizons', icon: '🌍', color: '#06b6d4', description: 'Global news and perspectives' },
  lifestyle: { name: 'Aesthetic', icon: '✨', color: '#f97316', description: 'Lifestyle and inspiration' },
  growth: { name: 'Evolution', icon: '🌱', color: '#8b5cf6', description: 'Personal development and growth' }
}

export default function LivePostCategory() {
  const router = useRouter()
  const { category } = router.query
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [userName, setUserName] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const [timeLeft, setTimeLeft] = useState(null)
  const [isMuted, setIsMuted] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const videoRef = useState(null)[0]
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const catInfo = categories[category] || categories.tech

  useEffect(() => {
    if (!category) return
    fetchPost()
    fetchComments()
  }, [category])

  useEffect(() => {
    const interval = setInterval(() => {
      if (post?.expires_at) {
        const diff = new Date(post.expires_at) - new Date()
        if (diff > 0) {
          const hours = Math.floor(diff / 3600000)
          const minutes = Math.floor((diff % 3600000) / 60000)
          const seconds = Math.floor((diff % 60000) / 1000)
          if (hours > 0) setTimeLeft(`${hours}h ${minutes}m`)
          else if (minutes > 0) setTimeLeft(`${minutes}m ${seconds}s`)
          else setTimeLeft(`${seconds}s`)
        } else {
          setTimeLeft('Expired')
        }
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [post?.expires_at])

  const fetchPost = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('live_posts')
      .select('*')
      .eq('category', category)
      .eq('status', 'published')
      .gt('expires_at', new Date().toISOString())
      .order('published_at', { ascending: false })
      .limit(1)
      .single()

    if (!error && data) {
      setPost(data)
      // Increment view count
      await fetch(`/api/live-posts/${data.id}/view`, { method: 'POST' })
    }
    setLoading(false)
  }

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from('live_post_comments')
      .select('*')
      .eq('live_post_id', post?.id)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })

    if (!error && data) setComments(data)
  }

  const handleLike = async () => {
    if (!post) return
    try {
      const res = await fetch(`/api/live-posts/${post.id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: localStorage.getItem('visitor_id') || 'anonymous' })
      })
      if (res.ok) {
        setLiked(true)
        setPost(prev => ({ ...prev, likes: (prev.likes || 0) + 1 }))
      }
    } catch (error) {}
  }

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      await navigator.share({ title: post?.title, url })
    } else {
      navigator.clipboard.writeText(url)
      alert('Link copied!')
    }
    if (post) {
      await fetch(`/api/live-posts/${post.id}/share`, { method: 'POST' })
      setPost(prev => ({ ...prev, shares: (prev.shares || 0) + 1 }))
    }
  }

  const submitComment = async () => {
    if (!newComment.trim() || !userName.trim()) return
    setSubmittingComment(true)
    try {
      const res = await fetch(`/api/live-posts/${post.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_name: userName, content: newComment })
      })
      if (res.ok) {
        setNewComment('')
        fetchComments()
      }
    } catch (error) {}
    setSubmittingComment(false)
  }

  const toggleMute = () => {
    if (videoRef) videoRef.muted = !videoRef.muted
    setIsMuted(!isMuted)
  }

  const togglePlay = () => {
    if (videoRef) {
      if (isPlaying) videoRef.pause()
      else videoRef.play()
      setIsPlaying(!isPlaying)
    }
  }

  const nextImage = () => {
    if (post?.media_items && currentImageIndex < post.media_items.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1)
    }
  }

  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1)
    }
  }

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
            background: #0a0a0a;
          }
          .loading-spinner {
            width: 50px;
            height: 50px;
            border: 3px solid #2a2a2a;
            border-top-color: #8b5cf6;
            border-radius: 50%;
            animation: spin 1s linear infinite;
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
      <div className="empty-container">
        <div className="empty-content">
          <div className="empty-icon">📭</div>
          <h2>No Active Post</h2>
          <p>There's no active post in {catInfo.name} right now.</p>
          <Link href="/" className="back-home">Back to Home</Link>
        </div>
        <style jsx>{`
          .empty-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #0a0a0a;
          }
          .empty-content {
            text-align: center;
            background: #111;
            padding: 3rem;
            border-radius: 2rem;
            border: 1px solid #2a2a2a;
          }
          .empty-icon { font-size: 4rem; margin-bottom: 1rem; }
          h2 { color: white; margin-bottom: 0.5rem; }
          p { color: #666; margin-bottom: 1.5rem; }
          .back-home {
            display: inline-block;
            padding: 0.75rem 1.5rem;
            background: #8b5cf6;
            color: white;
            border-radius: 2rem;
            text-decoration: none;
          }
        `}</style>
      </div>
    )
  }

  const mediaItems = post.media_items || []
  const currentMedia = mediaItems[currentImageIndex]
  const isVideo = currentMedia?.type === 'video'
  const isMultiple = mediaItems.length > 1

  return (
    <>
      <Head>
        <title>{post.title || catInfo.name} | Live Post</title>
        <meta name="description" content={post.content?.substring(0, 160)} />
      </Head>

      <div className="post-page">
        <div className="post-container">
          {/* Back Button */}
          <Link href="/" className="back-button">
            <ArrowLeft size={20} />
            Back to Home
          </Link>

          {/* Expiry Banner */}
          <div className={`expiry-banner ${timeLeft === 'Expired' ? 'expired' : ''}`}>
            <Clock size={16} />
            <span>
              {timeLeft === 'Expired' 
                ? 'This post has expired' 
                : `This post expires in ${timeLeft}`}
            </span>
          </div>

          {/* Media Display */}
          <div className="media-display">
            {isVideo ? (
              <div className="video-container">
                <video
                  ref={el => { if (el) Object.assign(videoRef || {}, el) }}
                  src={currentMedia.url}
                  poster={currentMedia.poster}
                  className="media-video"
                  controls={false}
                  autoPlay
                  muted={isMuted}
                  loop
                  playsInline
                />
                <div className="video-controls">
                  <button onClick={togglePlay} className="video-btn">
                    {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                  </button>
                  <button onClick={toggleMute} className="video-btn">
                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                  </button>
                </div>
              </div>
            ) : (
              <div className="image-container">
                <img src={currentMedia?.url} alt={post.title} className="media-image" />
                {isMultiple && (
                  <>
                    <button onClick={prevImage} className="image-nav prev" disabled={currentImageIndex === 0}>
                      <ChevronLeft size={24} />
                    </button>
                    <button onClick={nextImage} className="image-nav next" disabled={currentImageIndex === mediaItems.length - 1}>
                      <ChevronRight size={24} />
                    </button>
                    <div className="image-counter">
                      {currentImageIndex + 1} / {mediaItems.length}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Post Content */}
          <div className="post-content">
            <div className="content-header">
              <div className="category-tag" style={{ color: catInfo.color, background: `${catInfo.color}20` }}>
                {catInfo.icon} {catInfo.name}
              </div>
              <div className="post-date">
                {new Date(post.published_at).toLocaleDateString('en-US', { 
                  month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                })}
              </div>
            </div>

            {post.title && <h1 className="post-title">{post.title}</h1>}
            
            <div 
              className="post-body"
              dangerouslySetInnerHTML={{ __html: post.content || '<p>No content yet.</p>' }}
            />

            {/* Engagement Bar */}
            <div className="engagement-bar">
              <button onClick={handleLike} className={`action-btn like-btn ${liked ? 'liked' : ''}`}>
                <Heart size={22} fill={liked ? '#ef4444' : 'none'} />
                <span>{post.likes || 0}</span>
              </button>
              <button onClick={handleShare} className="action-btn share-btn">
                <Share2 size={22} />
                <span>{post.shares || 0}</span>
              </button>
              <button className="action-btn comment-btn">
                <MessageCircle size={22} />
                <span>{comments.length}</span>
              </button>
            </div>

            {/* Comments Section */}
            <div className="comments-section">
              <h3 className="comments-title">Discussion ({comments.length})</h3>
              
              <div className="comment-form">
                <input
                  type="text"
                  placeholder="Your name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="comment-input name-input"
                />
                <textarea
                  placeholder="Share your thoughts..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows="3"
                  className="comment-input text-input"
                />
                <button 
                  onClick={submitComment}
                  disabled={submittingComment || !newComment.trim() || !userName.trim()}
                  className="submit-comment"
                >
                  {submittingComment ? 'Posting...' : 'Post Comment'}
                </button>
              </div>

              <div className="comments-list">
                {comments.map(comment => (
                  <div key={comment.id} className="comment-item">
                    <div className="comment-header">
                      <span className="comment-author">{comment.user_name}</span>
                      <span className="comment-date">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="comment-text">{comment.content}</p>
                    {comment.admin_reply && (
                      <div className="admin-reply">
                        <div className="admin-badge">✓ Admin Response</div>
                        <p className="admin-text">{comment.admin_reply}</p>
                      </div>
                    )}
                  </div>
                ))}
                {comments.length === 0 && (
                  <p className="no-comments">No comments yet. Be the first!</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          .post-page {
            min-height: 100vh;
            background: #0a0a0a;
          }
          .post-container {
            max-width: 900px;
            margin: 0 auto;
            padding: 2rem 1.5rem;
          }
          .back-button {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            color: #888;
            text-decoration: none;
            margin-bottom: 1.5rem;
            transition: color 0.2s;
          }
          .back-button:hover {
            color: #8b5cf6;
          }
          .expiry-banner {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 1rem;
            background: #1a1a1a;
            border-radius: 2rem;
            font-size: 0.75rem;
            color: #fbbf24;
            margin-bottom: 1.5rem;
          }
          .expiry-banner.expired {
            color: #ef4444;
          }
          .media-display {
            border-radius: 1.5rem;
            overflow: hidden;
            background: #111;
            margin-bottom: 2rem;
          }
          .video-container {
            position: relative;
            aspect-ratio: 16 / 9;
          }
          .media-video {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          .video-controls {
            position: absolute;
            bottom: 1rem;
            right: 1rem;
            display: flex;
            gap: 0.5rem;
          }
          .video-btn {
            background: rgba(0, 0, 0, 0.6);
            border: none;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            cursor: pointer;
            transition: background 0.2s;
          }
          .video-btn:hover {
            background: #8b5cf6;
          }
          .image-container {
            position: relative;
            aspect-ratio: 16 / 9;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #111;
          }
          .media-image {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
          }
          .image-nav {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            background: rgba(0, 0, 0, 0.6);
            border: none;
            border-radius: 50%;
            width: 44px;
            height: 44px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            cursor: pointer;
            transition: background 0.2s;
          }
          .image-nav:hover:not(:disabled) {
            background: #8b5cf6;
          }
          .image-nav:disabled {
            opacity: 0.3;
            cursor: not-allowed;
          }
          .image-nav.prev { left: 1rem; }
          .image-nav.next { right: 1rem; }
          .image-counter {
            position: absolute;
            bottom: 1rem;
            right: 1rem;
            background: rgba(0, 0, 0, 0.6);
            padding: 0.25rem 0.75rem;
            border-radius: 2rem;
            font-size: 0.75rem;
            color: white;
          }
          .post-content {
            background: #111;
            border-radius: 1.5rem;
            padding: 2rem;
            border: 1px solid #222;
          }
          .content-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
            flex-wrap: wrap;
            gap: 0.5rem;
          }
          .category-tag {
            padding: 0.25rem 0.75rem;
            border-radius: 2rem;
            font-size: 0.75rem;
            font-weight: 600;
          }
          .post-date {
            font-size: 0.75rem;
            color: #666;
          }
          .post-title {
            font-size: 2rem;
            font-weight: 700;
            color: white;
            margin-bottom: 1rem;
          }
          .post-body {
            color: #d4d4d8;
            line-height: 1.7;
            font-size: 1rem;
          }
          .post-body :global(p) {
            margin-bottom: 1rem;
          }
          .post-body :global(img) {
            max-width: 100%;
            border-radius: 0.75rem;
            margin: 1rem 0;
          }
          .engagement-bar {
            display: flex;
            gap: 2rem;
            margin: 2rem 0;
            padding: 1rem 0;
            border-top: 1px solid #222;
            border-bottom: 1px solid #222;
          }
          .action-btn {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            background: none;
            border: none;
            color: #888;
            cursor: pointer;
            padding: 0.5rem 1rem;
            border-radius: 2rem;
            transition: all 0.2s;
          }
          .action-btn:hover {
            background: #1a1a1a;
            color: #fff;
          }
          .like-btn.liked {
            color: #ef4444;
          }
          .comments-section {
            margin-top: 2rem;
          }
          .comments-title {
            font-size: 1.25rem;
            font-weight: 600;
            color: white;
            margin-bottom: 1.5rem;
          }
          .comment-form {
            margin-bottom: 2rem;
          }
          .comment-input {
            width: 100%;
            background: #1a1a1a;
            border: 1px solid #2a2a2a;
            border-radius: 0.75rem;
            padding: 0.75rem 1rem;
            color: white;
            font-size: 0.875rem;
            margin-bottom: 0.75rem;
          }
          .comment-input:focus {
            outline: none;
            border-color: #8b5cf6;
          }
          .name-input {
            width: 200px;
          }
          .text-input {
            resize: vertical;
          }
          .submit-comment {
            padding: 0.75rem 1.5rem;
            background: linear-gradient(135deg, #8b5cf6, #6366f1);
            border: none;
            border-radius: 0.75rem;
            color: white;
            font-weight: 600;
            cursor: pointer;
            transition: opacity 0.2s;
          }
          .submit-comment:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
          .comments-list {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
          }
          .comment-item {
            padding: 1rem;
            background: #1a1a1a;
            border-radius: 1rem;
          }
          .comment-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 0.5rem;
          }
          .comment-author {
            font-weight: 600;
            color: #8b5cf6;
          }
          .comment-date {
            font-size: 0.7rem;
            color: #666;
          }
          .comment-text {
            color: #d4d4d8;
            font-size: 0.875rem;
            line-height: 1.5;
          }
          .admin-reply {
            margin-top: 0.75rem;
            padding: 0.75rem;
            background: rgba(139, 92, 246, 0.1);
            border-radius: 0.75rem;
            border-left: 3px solid #8b5cf6;
          }
          .admin-badge {
            font-size: 0.7rem;
            font-weight: 600;
            color: #8b5cf6;
            margin-bottom: 0.5rem;
          }
          .admin-text {
            color: #a1a1aa;
            font-size: 0.875rem;
          }
          .no-comments {
            text-align: center;
            color: #666;
            padding: 2rem;
          }
          @media (max-width: 768px) {
            .post-container {
              padding: 1rem;
            }
            .post-content {
              padding: 1.5rem;
            }
            .post-title {
              font-size: 1.5rem;
            }
          }
        `}</style>
      </div>
    </>
  )
}