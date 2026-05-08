import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../../lib/supabase'
import { useInteractions } from '../../hooks/useInteractions'
import PostCard from './LivePostCard'
import Navigation from './LivePostNavigation'
import CommentSection from '../comments/CommentSystem'

export default function LivePostCarousel({ posts, sessionId }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [uiState, setUiState] = useState({})
  const [commentCounts, setCommentCounts] = useState({})
  const [localShareCount, setLocalShareCount] = useState({})
  const [isAnimating, setIsAnimating] = useState(false)
  const [slideDirection, setSlideDirection] = useState('right')
  const animationTimeoutRef = useRef(null)

  const getSessionId = useCallback(() => {
    if (sessionId) return sessionId
    let id = localStorage.getItem('visitor_id')
    if (!id) {
      id = `v_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
      localStorage.setItem('visitor_id', id)
    }
    return id
  }, [sessionId])

  // Optimized parallel comment count loading
  useEffect(() => {
    if (posts.length === 0) return
    
    const loadAllCommentCounts = async () => {
      try {
        const results = await Promise.all(
          posts.map(post =>
            supabase
              .from('live_post_comments')
              .select('*', { count: 'exact', head: true })
              .eq('live_post_id', post.id)
          )
        )
        
        const counts = {}
        posts.forEach((post, index) => {
          counts[post.id] = results[index].count || 0
        })
        setCommentCounts(counts)
      } catch (error) {
        console.error('Error loading comment counts:', error)
      }
    }
    
    loadAllCommentCounts()
  }, [posts])

  // Initialize share counts
  useEffect(() => {
    const counts = {}
    posts.forEach(post => {
      counts[post.id] = post.shares || 0
    })
    setLocalShareCount(counts)
  }, [posts])

  // Cleanup animation timeout
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current)
      }
    }
  }, [])

  const handleShare = async (postId, platform) => {
    const currentPostData = posts.find(p => p.id === postId)
    if (!currentPostData) return
    
    const url = `${window.location.origin}/live-posts/${postId}`
    const title = encodeURIComponent(currentPostData?.content?.substring(0, 100) || 'Check out this post')
    
    if (platform === 'copy') {
      await navigator.clipboard.writeText(url)
      setUiState(prev => ({ 
        ...prev, 
        [postId]: { 
          ...prev[postId], 
          successMsg: 'Link copied!' 
        } 
      }))
      setTimeout(() => {
        setUiState(prev => ({ 
          ...prev, 
          [postId]: { 
            ...prev[postId], 
            successMsg: null 
          } 
        }))
      }, 3000)
      return
    }
    
    window.open(`https://twitter.com/intent/tweet?text=${title}&url=${encodeURIComponent(url)}`, '_blank')
    
    setLocalShareCount(prev => ({ 
      ...prev, 
      [postId]: (prev[postId] || 0) + 1 
    }))
    
    try { 
      await fetch(`/api/live-posts/${postId}/share`, { method: 'POST' })
    } catch (err) {}
  }

  const goToSlide = useCallback((index) => {
    if (isAnimating) return
    const direction = index > currentIndex ? 'right' : 'left'
    setSlideDirection(direction)
    setIsAnimating(true)
    setCurrentIndex(index)
    
    animationTimeoutRef.current = setTimeout(() => {
      setIsAnimating(false)
    }, 400)
  }, [isAnimating, currentIndex])

  const nextSlide = useCallback(() => {
    if (isAnimating) return
    setSlideDirection('right')
    setIsAnimating(true)
    setCurrentIndex((prev) => (prev + 1) % posts.length)
    
    animationTimeoutRef.current = setTimeout(() => {
      setIsAnimating(false)
    }, 400)
  }, [isAnimating, posts.length])

  const prevSlide = useCallback(() => {
    if (isAnimating) return
    setSlideDirection('left')
    setIsAnimating(true)
    setCurrentIndex((prev) => (prev - 1 + posts.length) % posts.length)
    
    animationTimeoutRef.current = setTimeout(() => {
      setIsAnimating(false)
    }, 400)
  }, [isAnimating, posts.length])

  const handleCommentToggle = useCallback((postId) => {
    setUiState(prev => ({
      ...prev,
      [postId]: {
        ...prev[postId],
        showComments: !prev[postId]?.showComments
      }
    }))
  }, [])

  const handleExpandContent = useCallback((postId) => {
    setUiState(prev => ({
      ...prev,
      [postId]: {
        ...prev[postId],
        isExpanded: !prev[postId]?.isExpanded
      }
    }))
  }, [])

  // Memoized current post data
  const currentPost = useMemo(() => posts[currentIndex], [posts, currentIndex])
  
  if (!posts || posts.length === 0) return null

  const isExpanded = uiState[currentPost?.id]?.isExpanded || false
  const showComments = uiState[currentPost?.id]?.showComments || false
  const currentCommentCount = commentCounts[currentPost?.id] ?? currentPost?.comments_count ?? 0
  const currentShareCount = localShareCount[currentPost?.id] ?? currentPost?.shares ?? 0

  const {
    likes: liveLikes,
    hasLiked: userHasLiked,
    pendingLike,
    isSyncing: isSyncingInteractions,
    toggleLike,
  } = useInteractions(currentPost?.id, getSessionId())

  // Slide animation variants
  const slideVariants = {
    enter: (direction) => ({
      x: direction === 'right' ? 300 : -300,
      opacity: 0,
      scale: 0.95
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
        scale: { duration: 0.2 }
      }
    },
    exit: (direction) => ({
      x: direction === 'right' ? -300 : 300,
      opacity: 0,
      scale: 0.95,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
        scale: { duration: 0.2 }
      }
    })
  }

  return (
    <div className="carousel">
      <AnimatePresence mode="wait" custom={slideDirection}>
        <motion.div
          key={currentIndex}
          custom={slideDirection}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="card-wrapper"
        >
          <div className="card">
            <PostCard
              post={currentPost}
              isExpanded={isExpanded}
              onToggleExpand={() => handleExpandContent(currentPost.id)}
              onLike={toggleLike}
              onCommentToggle={() => handleCommentToggle(currentPost.id)}
              onShare={() => {}}
              showComments={showComments}
              commentCount={currentCommentCount}
              shareCount={currentShareCount}
              likes={liveLikes}
              hasLiked={userHasLiked}
              isSyncing={isSyncingInteractions}
              pendingLike={pendingLike}
              sessionId={getSessionId()}
            />

            {uiState[currentPost.id]?.successMsg && (
              <motion.div 
                className="message success"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <span>{uiState[currentPost.id].successMsg}</span>
              </motion.div>
            )}

            <AnimatePresence>
              {showComments && (
                <motion.div 
                  className="comments"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                  <CommentSection 
                    postId={currentPost.id}
                    sessionId={getSessionId()}
                    commentCount={currentCommentCount}
                    onCommentCountChange={(newCount) => {
                      setCommentCounts(prev => ({ ...prev, [currentPost.id]: newCount }))
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </AnimatePresence>

      {posts.length > 1 && (
        <Navigation
          currentIndex={currentIndex}
          totalSlides={posts.length}
          onPrev={prevSlide}
          onNext={nextSlide}
          onGoToSlide={goToSlide}
        />
      )}

      <style jsx>{`
        .carousel {
          max-width: 680px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .card-wrapper {
          position: relative;
          margin-bottom: 20px;
        }
        
        .card {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 32px;
          overflow: hidden;
          box-shadow: 
            0 10px 30px rgba(0, 0, 0, 0.08),
            0 2px 8px rgba(0, 0, 0, 0.04),
            inset 0 1px 0 rgba(255, 255, 255, 0.08);
          transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
        }
        
        .card:hover {
          transform: translateY(-4px);
          box-shadow: 
            0 25px 40px rgba(0, 0, 0, 0.12),
            0 8px 20px rgba(0, 0, 0, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.12);
        }
        
        .message {
          margin: 0 20px 20px 20px;
          padding: 12px 16px;
          border-radius: 16px;
          font-size: 13px;
          font-weight: 500;
          backdrop-filter: blur(10px);
        }
        
        .message.success {
          background: rgba(34, 197, 94, 0.12);
          color: #22c55e;
          border: 1px solid rgba(34, 197, 94, 0.2);
        }
        
        .comments {
          border-top: 1px solid rgba(0, 0, 0, 0.06);
          margin-top: 8px;
          background: rgba(0, 0, 0, 0.02);
        }
        
        /* Premium CSS Variables */
        :root {
          --card-bg: rgba(255, 255, 255, 0.85);
          --card-bg-solid: #ffffff;
          --text-primary: #0f172a;
          --text-secondary: #475569;
          --border-color: rgba(203, 213, 225, 0.4);
          --btn-bg: rgba(255, 255, 255, 0.9);
          --hover-bg: rgba(0, 0, 0, 0.04);
          --dropdown-bg: rgba(255, 255, 255, 0.98);
          --primary: #7c3aed;
          --primary-hover: #8b5cf6;
          --surface-2: #f8fafc;
        }
        
        :global(.dark) {
          --card-bg: rgba(17, 24, 39, 0.9);
          --card-bg-solid: #111827;
          --text-primary: #f9fafb;
          --text-secondary: #9ca3af;
          --border-color: rgba(55, 65, 81, 0.5);
          --btn-bg: rgba(31, 41, 55, 0.9);
          --hover-bg: rgba(255, 255, 255, 0.06);
          --dropdown-bg: rgba(17, 24, 39, 0.98);
          --surface-2: #1f2937;
        }
        
        /* Responsive */
        @media (max-width: 768px) {
          .carousel {
            max-width: 100%;
            padding: 12px;
          }
          
          .card {
            border-radius: 24px;
          }
        }
        
        /* Smooth scroll behavior */
        @media (prefers-reduced-motion: reduce) {
          .card {
            transition: none;
          }
        }
      `}</style>
    </div>
  )
}