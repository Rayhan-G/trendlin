// components/LivePost/LivePostCarousel.jsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LivePostCarousel({ posts: initialPosts, sessionId }) {
  const [posts, setPosts] = useState(initialPosts || []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [userReactions, setUserReactions] = useState({});
  const [showEmojiPicker, setShowEmojiPicker] = useState(null);
  const [showShareMenu, setShowShareMenu] = useState(null);
  const [shareSuccess, setShareSuccess] = useState(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageCarouselIndex, setImageCarouselIndex] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const emojiPickerRef = useRef(null);
  const shareMenuRef = useRef(null);

  // Initialize user reactions from posts
  useEffect(() => {
    setPosts(initialPosts || []);
    const initialUserReactions = {};
    (initialPosts || []).forEach(post => {
      if (post.userReaction) {
        initialUserReactions[post.id] = post.userReaction;
      }
    });
    setUserReactions(initialUserReactions);
  }, [initialPosts]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(null);
      }
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target)) {
        setShowShareMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Clear error after 3 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const currentPost = posts[currentIndex];

  const handleReaction = async (postId, reactionType) => {
    if (isLoading) return;
    
    const isRemoving = userReactions[postId] === reactionType;
    const previousPosts = [...posts];
    const previousUserReactions = { ...userReactions };
    
    // Close emoji picker
    setShowEmojiPicker(null);
    setIsLoading(true);
    
    // Optimistic update
    setPosts(prevPosts => prevPosts.map(post => {
      if (post.id === postId) {
        const oldReaction = userReactions[postId];
        const newReactions = { ...post.reactions };
        
        if (isRemoving) {
          // Remove existing reaction
          if (oldReaction && newReactions[oldReaction]) {
            newReactions[oldReaction] = Math.max(0, newReactions[oldReaction] - 1);
            newReactions.total = Math.max(0, newReactions.total - 1);
          }
          return { ...post, reactions: newReactions, userReaction: null };
        } else {
          // Remove old reaction if exists and different
          if (oldReaction && oldReaction !== reactionType) {
            newReactions[oldReaction] = Math.max(0, (newReactions[oldReaction] || 0) - 1);
            newReactions.total = Math.max(0, (newReactions.total || 0) - 1);
          }
          
          // Add new reaction
          newReactions[reactionType] = (newReactions[reactionType] || 0) + 1;
          newReactions.total = (newReactions.total || 0) + 1;
          
          return { ...post, reactions: newReactions, userReaction: reactionType };
        }
      }
      return post;
    }));
    
    // Update userReactions state optimistically
    setUserReactions(prev => {
      if (isRemoving) {
        const newState = { ...prev };
        delete newState[postId];
        return newState;
      }
      return { ...prev, [postId]: reactionType };
    });

    try {
      const finalReactionType = isRemoving ? null : reactionType;
      
      const response = await fetch(`/api/live-posts/${postId}/react`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          reactionType: finalReactionType, 
          sessionId 
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to update reaction`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Update with server data
        setPosts(prevPosts => prevPosts.map(post => {
          if (post.id === postId) {
            return { 
              ...post, 
              reactions: data.reactions, 
              userReaction: data.userReaction 
            };
          }
          return post;
        }));
        
        // Update userReactions with server data
        setUserReactions(prev => {
          if (!data.userReaction) {
            const newState = { ...prev };
            delete newState[postId];
            return newState;
          }
          return { ...prev, [postId]: data.userReaction };
        });
      } else {
        throw new Error(data.error || 'Failed to update reaction');
      }
    } catch (err) {
      console.error('Reaction error:', err);
      // Rollback on error
      setPosts(previousPosts);
      setUserReactions(previousUserReactions);
      setError(err.message || 'Failed to update reaction. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async (postId, platform) => {
    const url = `${window.location.origin}/live-posts/${postId}`;
    const title = encodeURIComponent(currentPost?.title || 'Check out this post');
    
    if (platform === 'copy') {
      try {
        await navigator.clipboard.writeText(url);
        setShareSuccess(postId);
        setTimeout(() => setShareSuccess(null), 2000);
      } catch (err) {
        console.error('Copy failed:', err);
        setError('Failed to copy link');
      }
      setShowShareMenu(null);
      return;
    }
    
    let shareUrl = '';
    if (platform === 'twitter') {
      shareUrl = `https://twitter.com/intent/tweet?text=${title}&url=${encodeURIComponent(url)}`;
    } else if (platform === 'facebook') {
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    } else if (platform === 'whatsapp') {
      shareUrl = `https://wa.me/?text=${title}%20${encodeURIComponent(url)}`;
    } else if (platform === 'linkedin') {
      shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
      
      // Update share count optimistically
      setPosts(prevPosts => prevPosts.map(post => {
        if (post.id === postId) {
          return { ...post, share_count: (post.share_count || 0) + 1 };
        }
        return post;
      }));
    }
    setShowShareMenu(null);
  };

  const goToNext = useCallback(() => {
    if (isAnimating || posts.length === 0) return;
    setDirection(1);
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev + 1) % posts.length);
    setTimeout(() => setIsAnimating(false), 400);
  }, [isAnimating, posts.length]);

  const goToPrev = useCallback(() => {
    if (isAnimating || posts.length === 0) return;
    setDirection(-1);
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev - 1 + posts.length) % posts.length);
    setTimeout(() => setIsAnimating(false), 400);
  }, [isAnimating, posts.length]);

  const nextImage = (postId, currentIdx, totalImages) => {
    setImageCarouselIndex(prev => ({
      ...prev,
      [postId]: (currentIdx + 1) % totalImages
    }));
  };

  const prevImage = (postId, currentIdx, totalImages) => {
    setImageCarouselIndex(prev => ({
      ...prev,
      [postId]: (currentIdx - 1 + totalImages) % totalImages
    }));
  };

  const openImageModal = (images, index) => {
    setCurrentImageIndex(index);
    setImageModalOpen(true);
  };

  if (!posts || posts.length === 0) {
    return (
      <div className="no-posts">
        <div className="no-posts-icon">📭</div>
        <p>No live posts available</p>
        <p className="text-sm">Check back later for new stories</p>
        <style jsx>{`
          .no-posts { text-align: center; padding: 60px 20px; background: white; border-radius: 24px; color: #64748b; }
          .no-posts-icon { font-size: 64px; margin-bottom: 16px; }
          :global(.dark) .no-posts { background: #1e293b; }
        `}</style>
      </div>
    );
  }

  const slideVariants = {
    enter: (direction) => ({ x: direction > 0 ? 400 : -400, opacity: 0, scale: 0.95 }),
    center: { 
      x: 0, 
      opacity: 1, 
      scale: 1, 
      transition: { 
        x: { type: 'spring', stiffness: 300, damping: 30 }, 
        opacity: { duration: 0.2 } 
      } 
    },
    exit: (direction) => ({ 
      x: direction > 0 ? -400 : 400, 
      opacity: 0, 
      scale: 0.95, 
      transition: { 
        x: { type: 'spring', stiffness: 300, damping: 30 }, 
        opacity: { duration: 0.2 } 
      } 
    })
  };

  const reactionEmojis = {
    like: '👍', love: '❤️', laugh: '😂', wow: '😮', sad: '😢', angry: '😠'
  };

  const reactionLabels = {
    like: 'Like', love: 'Love', laugh: 'Laugh', wow: 'Wow', sad: 'Sad', angry: 'Angry'
  };

  const getCurrentImageIndex = (postId) => {
    return imageCarouselIndex[postId] || 0;
  };

  const images = currentPost?.media_items?.filter(m => m.type !== 'video') || [];
  const videos = currentPost?.media_items?.filter(m => m.type === 'video') || [];
  const currentImageIdx = getCurrentImageIndex(currentPost?.id);
  const hasMultipleImages = images.length > 1;

  return (
    <>
      {error && (
        <div className="error-toast">
          <span>⚠️</span>
          <span>{error}</span>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      <div className="carousel-container">
        <div className="carousel-header">
          <div className="live-badge">
            <span className="live-dot"></span>
            LIVE • {posts.length} Stories
          </div>
          <div className="carousel-counter">{currentIndex + 1} / {posts.length}</div>
        </div>

        <div className="carousel-wrapper">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div 
              key={currentIndex} 
              custom={direction} 
              variants={slideVariants} 
              initial="enter" 
              animate="center" 
              exit="exit" 
              className="carousel-slide"
            >
              <div className="post-card">
                {/* Header */}
                <div className="post-header">
                  <div className="post-author">
                    <div className="author-avatar">
                      {currentPost.author?.avatar ? (
                        <img src={currentPost.author.avatar} alt={currentPost.author?.name} />
                      ) : (
                        <span className="avatar-placeholder">📰</span>
                      )}
                    </div>
                    <div className="author-info">
                      <span className="author-name">{currentPost.author?.name || 'Trendlin'}</span>
                      <span className="post-time">
                        {new Date(currentPost.created_at).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="expiry-badge">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span>{currentPost.hoursRemaining}h left</span>
                  </div>
                </div>

                {/* Content */}
                <div className="post-content">
                  {currentPost.title && <h3 className="post-title">{currentPost.title}</h3>}
                  <p className="post-text">{currentPost.description || currentPost.content}</p>
                </div>

                {/* Image Carousel */}
                {images.length > 0 && (
                  <div className="image-carousel">
                    <div className="carousel-image-container">
                      <img 
                        src={images[currentImageIdx]?.url} 
                        alt={`Image ${currentImageIdx + 1}`} 
                        className="carousel-image"
                        onClick={() => openImageModal(images, currentImageIdx)}
                        loading="lazy"
                      />
                      
                      {hasMultipleImages && (
                        <>
                          <button 
                            className="carousel-nav prev" 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              prevImage(currentPost.id, currentImageIdx, images.length); 
                            }}
                            aria-label="Previous image"
                          >
                            ‹
                          </button>
                          <button 
                            className="carousel-nav next" 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              nextImage(currentPost.id, currentImageIdx, images.length); 
                            }}
                            aria-label="Next image"
                          >
                            ›
                          </button>
                          <div className="carousel-dots">
                            {images.map((_, idx) => (
                              <button
                                key={idx}
                                className={`dot ${idx === currentImageIdx ? 'active' : ''}`}
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  setImageCarouselIndex(prev => ({ ...prev, [currentPost.id]: idx })); 
                                }}
                                aria-label={`Go to image ${idx + 1}`}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Videos */}
                {videos.length > 0 && (
                  <div className="videos-section">
                    {videos.map((video, idx) => (
                      <video 
                        key={idx} 
                        src={video.url} 
                        controls 
                        className="video-player"
                        preload="metadata"
                      />
                    ))}
                  </div>
                )}

                {/* Reactions & Share */}
                <div className="actions-section">
                  {/* Reaction Button */}
                  <div className="reaction-wrapper" ref={emojiPickerRef}>
                    <button 
                      className={`reaction-trigger ${userReactions[currentPost.id] ? 'active' : ''}`}
                      onClick={() => setShowEmojiPicker(showEmojiPicker === currentPost.id ? null : currentPost.id)}
                      disabled={isLoading}
                      aria-label="Open reaction picker"
                    >
                      <span className="reaction-icon">
                        {userReactions[currentPost.id] ? reactionEmojis[userReactions[currentPost.id]] : '👍'}
                      </span>
                      <span>React</span>
                    </button>
                    
                    {showEmojiPicker === currentPost.id && (
                      <div className="emoji-picker">
                        {Object.entries(reactionEmojis).map(([type, emoji]) => (
                          <button
                            key={type}
                            className={`emoji-option ${userReactions[currentPost.id] === type ? 'active' : ''}`}
                            onClick={() => handleReaction(currentPost.id, type)}
                            title={reactionLabels[type]}
                            aria-label={`React with ${reactionLabels[type]}`}
                          >
                            <span className="emoji">{emoji}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Reaction Stats */}
                  {currentPost.reactions?.total > 0 && (
                    <div className="reaction-stats">
                      {Object.entries(currentPost.reactions)
                        .filter(([key, count]) => count > 0 && key !== 'total')
                        .slice(0, 3)
                        .map(([type, count]) => (
                          <span key={type} className="reaction-stat" title={`${count} ${reactionLabels[type]} reactions`}>
                            {reactionEmojis[type]} {count}
                          </span>
                        ))}
                      {currentPost.reactions.total > 3 && (
                        <span className="reaction-stat" title={`${currentPost.reactions.total - 3} more reactions`}>
                          +{currentPost.reactions.total - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Share Button */}
                  <div className="share-wrapper" ref={shareMenuRef}>
                    <button 
                      className="share-trigger" 
                      onClick={() => setShowShareMenu(showShareMenu === currentPost.id ? null : currentPost.id)}
                      aria-label="Share post"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                        <polyline points="16 6 12 2 8 6" />
                        <line x1="12" y1="2" x2="12" y2="15" />
                      </svg>
                      <span>Share</span>
                    </button>
                    
                    {showShareMenu === currentPost.id && (
                      <div className="share-dropdown">
                        <button onClick={() => handleShare(currentPost.id, 'copy')} className="share-option">
                          <span>🔗</span> {shareSuccess === currentPost.id ? 'Copied! ✓' : 'Copy link'}
                        </button>
                        <button onClick={() => handleShare(currentPost.id, 'twitter')} className="share-option">
                          <span>🐦</span> X (Twitter)
                        </button>
                        <button onClick={() => handleShare(currentPost.id, 'facebook')} className="share-option">
                          <span>📘</span> Facebook
                        </button>
                        <button onClick={() => handleShare(currentPost.id, 'whatsapp')} className="share-option">
                          <span>💬</span> WhatsApp
                        </button>
                        <button onClick={() => handleShare(currentPost.id, 'linkedin')} className="share-option">
                          <span>🔗</span> LinkedIn
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sources */}
                {currentPost.sources?.length > 0 && (
                  <div className="sources-section">
                    <div className="sources-header">🔗 Sources & References</div>
                    <div className="sources-list">
                      {currentPost.sources.map((source, idx) => (
                        <a 
                          key={idx} 
                          href={source.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="source-link"
                        >
                          {source.name}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Loading indicator */}
                {isLoading && (
                  <div className="loading-overlay">
                    <div className="spinner"></div>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Arrows */}
        {posts.length > 1 && (
          <>
            <button onClick={goToPrev} className="nav-btn prev" aria-label="Previous post">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button onClick={goToNext} className="nav-btn next" aria-label="Next post">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
            <div className="progress-dots">
              {posts.map((_, idx) => (
                <button 
                  key={idx} 
                  onClick={() => { 
                    if (!isAnimating && !isLoading) { 
                      setDirection(idx > currentIndex ? 1 : -1); 
                      setIsAnimating(true); 
                      setCurrentIndex(idx); 
                      setTimeout(() => setIsAnimating(false), 400); 
                    } 
                  }} 
                  className={`dot ${idx === currentIndex ? 'active' : ''}`}
                  aria-label={`Go to post ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Fullscreen Image Modal */}
      {imageModalOpen && images.length > 0 && (
        <div className="lightbox" onClick={() => setImageModalOpen(false)}>
          <div className="lightbox-content" onClick={e => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setImageModalOpen(false)} aria-label="Close">✕</button>
            {images.length > 1 && (
              <>
                <button className="lightbox-prev" onClick={() => setCurrentImageIndex(prev => (prev - 1 + images.length) % images.length)} aria-label="Previous">‹</button>
                <button className="lightbox-next" onClick={() => setCurrentImageIndex(prev => (prev + 1) % images.length)} aria-label="Next">›</button>
                <div className="lightbox-counter">{currentImageIndex + 1} / {images.length}</div>
              </>
            )}
            <img src={images[currentImageIndex]?.url} alt="Full size" loading="lazy" />
          </div>
        </div>
      )}

      <style jsx>{`
        .carousel-container { position: relative; max-width: 680px; margin: 0 auto; padding: 20px; }
        .carousel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding: 0 8px; }
        .live-badge { display: flex; align-items: center; gap: 8px; padding: 6px 14px; background: linear-gradient(135deg, #ef4444, #ec4899); border-radius: 40px; font-size: 12px; font-weight: 600; color: white; }
        .live-dot { width: 8px; height: 8px; background: white; border-radius: 50%; animation: pulse 1.5s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(0.8); } }
        .carousel-counter { font-size: 13px; font-weight: 500; color: #64748b; padding: 6px 12px; background: #f1f5f9; border-radius: 20px; }
        :global(.dark) .carousel-counter { background: #334155; color: #94a3b8; }
        .carousel-wrapper { position: relative; overflow: hidden; border-radius: 24px; background: white; box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08); }
        :global(.dark) .carousel-wrapper { background: #1e293b; box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3); }
        .carousel-slide { width: 100%; }
        .post-card { background: white; border-radius: 24px; overflow: hidden; position: relative; }
        :global(.dark) .post-card { background: #1e293b; }
        
        /* Header */
        .post-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid #eef2ff; }
        :global(.dark) .post-header { border-bottom-color: #334155; }
        .post-author { display: flex; align-items: center; gap: 12px; }
        .author-avatar { width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, #8b5cf6, #ec4899); display: flex; align-items: center; justify-content: center; font-size: 24px; overflow: hidden; }
        .author-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .author-info { display: flex; flex-direction: column; gap: 2px; }
        .author-name { font-weight: 700; font-size: 15px; color: #0f172a; }
        :global(.dark) .author-name { color: #f1f5f9; }
        .post-time { font-size: 12px; color: #64748b; }
        .expiry-badge { display: flex; align-items: center; gap: 4px; padding: 4px 10px; background: #fef3c7; border-radius: 20px; font-size: 11px; font-weight: 500; color: #d97706; }
        :global(.dark) .expiry-badge { background: #422006; color: #fbbf24; }
        
        /* Content */
        .post-content { padding: 20px 24px; }
        .post-title { font-size: 20px; font-weight: 700; margin-bottom: 12px; color: #0f172a; }
        :global(.dark) .post-title { color: #f1f5f9; }
        .post-text { font-size: 15px; line-height: 1.6; color: #334155; margin: 0; }
        :global(.dark) .post-text { color: #cbd5e1; }
        
        /* Image Carousel */
        .image-carousel { margin: 8px 0; }
        .carousel-image-container { position: relative; background: #f1f5f9; aspect-ratio: 16 / 9; overflow: hidden; }
        .carousel-image { width: 100%; height: 100%; object-fit: cover; cursor: pointer; }
        .carousel-nav { position: absolute; top: 50%; transform: translateY(-50%); width: 36px; height: 36px; border-radius: 50%; background: rgba(0, 0, 0, 0.5); color: white; border: none; cursor: pointer; font-size: 24px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; z-index: 10; }
        .carousel-nav:hover { background: rgba(0, 0, 0, 0.8); transform: translateY(-50%) scale(1.05); }
        .carousel-nav.prev { left: 12px; }
        .carousel-nav.next { right: 12px; }
        .carousel-dots { position: absolute; bottom: 12px; left: 50%; transform: translateX(-50%); display: flex; gap: 8px; z-index: 10; }
        .carousel-dots .dot { width: 6px; height: 6px; border-radius: 50%; background: rgba(255, 255, 255, 0.5); border: none; cursor: pointer; transition: all 0.2s; }
        .carousel-dots .dot.active { width: 20px; background: white; border-radius: 3px; }
        
        /* Videos */
        .videos-section { padding: 8px 0; }
        .video-player { width: 100%; max-height: 400px; border-radius: 12px; }
        
        /* Actions Section */
        .actions-section { display: flex; align-items: center; justify-content: space-between; padding: 12px 20px; border-top: 1px solid #eef2ff; border-bottom: 1px solid #eef2ff; flex-wrap: wrap; gap: 12px; position: relative; z-index: 5; }
        :global(.dark) .actions-section { border-color: #334155; }
        
        .reaction-wrapper { position: relative; }
        .reaction-trigger { display: flex; align-items: center; gap: 8px; padding: 8px 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 40px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
        .reaction-trigger:disabled { opacity: 0.6; cursor: not-allowed; }
        :global(.dark) .reaction-trigger { background: #334155; border-color: #475569; color: #e2e8f0; }
        .reaction-trigger.active { background: #ec489910; border-color: #ec4899; color: #ec4899; }
        .reaction-trigger:hover:not(:disabled) { transform: scale(1.02); }
        .reaction-icon { font-size: 18px; }
        
        .emoji-picker { position: absolute; bottom: 100%; left: 0; margin-bottom: 8px; background: white; border-radius: 40px; padding: 8px 12px; display: flex; gap: 8px; box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15); border: 1px solid #e2e8f0; z-index: 100; animation: fadeInUp 0.2s ease; }
        :global(.dark) .emoji-picker { background: #1e293b; border-color: #475569; }
        .emoji-option { display: flex; align-items: center; justify-content: center; padding: 8px; border-radius: 50%; background: none; border: none; cursor: pointer; transition: all 0.2s; font-size: 22px; }
        .emoji-option:hover { background: #f1f5f9; transform: scale(1.2); }
        :global(.dark) .emoji-option:hover { background: #334155; }
        .emoji-option.active { background: #ec489910; box-shadow: 0 0 0 2px #ec4899; }
        
        .reaction-stats { display: flex; gap: 12px; flex: 1; justify-content: center; }
        .reaction-stat { font-size: 13px; font-weight: 500; color: #475569; }
        
        .share-wrapper { position: relative; }
        .share-trigger { display: flex; align-items: center; gap: 8px; padding: 8px 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 40px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
        :global(.dark) .share-trigger { background: #334155; border-color: #475569; color: #e2e8f0; }
        .share-trigger:hover { background: #8b5cf6; border-color: #8b5cf6; color: white; }
        
        .share-dropdown { position: absolute; bottom: 100%; right: 0; margin-bottom: 8px; background: white; border-radius: 16px; padding: 8px; min-width: 150px; box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15); border: 1px solid #e2e8f0; z-index: 100; animation: fadeInUp 0.2s ease; }
        :global(.dark) .share-dropdown { background: #1e293b; border-color: #475569; }
        .share-option { display: flex; align-items: center; gap: 12px; width: 100%; padding: 8px 12px; background: none; border: none; border-radius: 12px; cursor: pointer; font-size: 13px; color: #0f172a; transition: all 0.2s; }
        :global(.dark) .share-option { color: #e2e8f0; }
        .share-option:hover { background: #f1f5f9; }
        :global(.dark) .share-option:hover { background: #334155; }
        
        /* Sources */
        .sources-section { padding: 16px 24px; }
        .sources-header { font-size: 12px; font-weight: 600; text-transform: uppercase; color: #64748b; margin-bottom: 12px; }
        .sources-list { display: flex; flex-wrap: wrap; gap: 10px; }
        .source-link { display: inline-block; padding: 6px 14px; background: #f1f5f9; border-radius: 20px; font-size: 12px; text-decoration: none; color: #3b82f6; transition: all 0.2s; }
        :global(.dark) .source-link { background: #334155; }
        .source-link:hover { background: #e2e8f0; transform: translateY(-1px); }
        
        /* Loading Overlay */
        .loading-overlay { position: absolute; inset: 0; background: rgba(255, 255, 255, 0.8); display: flex; align-items: center; justify-content: center; z-index: 10; }
        :global(.dark) .loading-overlay { background: rgba(0, 0, 0, 0.8); }
        .spinner { width: 40px; height: 40px; border: 3px solid #e2e8f0; border-top-color: #8b5cf6; border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        
        /* Error Toast */
        .error-toast { position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: #ef4444; color: white; padding: 12px 20px; border-radius: 12px; display: flex; align-items: center; gap: 12px; z-index: 1000; animation: slideDown 0.3s ease; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); }
        .error-toast button { background: none; border: none; color: white; font-size: 18px; cursor: pointer; margin-left: 8px; }
        @keyframes slideDown { from { opacity: 0; transform: translateX(-50%) translateY(-20px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
        
        /* Navigation */
        .nav-btn { position: absolute; top: 50%; transform: translateY(-50%); width: 44px; height: 44px; border-radius: 50%; background: white; border: 1px solid #e2e8f0; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; z-index: 10; }
        :global(.dark) .nav-btn { background: #1e293b; border-color: #475569; color: white; }
        .nav-btn:hover { background: #8b5cf6; border-color: #8b5cf6; color: white; transform: translateY(-50%) scale(1.05); }
        .nav-btn.prev { left: -22px; }
        .nav-btn.next { right: -22px; }
        
        .progress-dots { display: flex; justify-content: center; gap: 8px; margin-top: 20px; }
        .progress-dots .dot { width: 8px; height: 8px; border-radius: 50%; background: #cbd5e1; border: none; cursor: pointer; transition: all 0.2s; }
        :global(.dark) .progress-dots .dot { background: #475569; }
        .progress-dots .dot.active { width: 24px; background: #8b5cf6; border-radius: 4px; }
        .progress-dots .dot:hover { background: #8b5cf6; transform: scale(1.2); }
        
        /* Lightbox */
        .lightbox { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.95); z-index: 2000; display: flex; align-items: center; justify-content: center; animation: fadeIn 0.2s ease; }
        .lightbox-content { position: relative; max-width: 90vw; max-height: 90vh; }
        .lightbox-close { position: absolute; top: -48px; right: 0; background: none; border: none; color: white; font-size: 28px; cursor: pointer; padding: 8px; }
        .lightbox-prev, .lightbox-next { position: absolute; top: 50%; transform: translateY(-50%); background: rgba(255, 255, 255, 0.2); border: none; color: white; font-size: 32px; width: 48px; height: 48px; border-radius: 50%; cursor: pointer; transition: all 0.2s; }
        .lightbox-prev:hover, .lightbox-next:hover { background: rgba(255, 255, 255, 0.3); }
        .lightbox-prev { left: -60px; }
        .lightbox-next { right: -60px; }
        .lightbox-counter { position: absolute; bottom: -40px; left: 50%; transform: translateX(-50%); color: white; font-size: 14px; }
        .lightbox-content img { max-width: 85vw; max-height: 85vh; border-radius: 8px; }
        
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        
        @media (max-width: 768px) {
          .carousel-container { padding: 12px; }
          .post-header, .post-content, .sources-section { padding: 12px 16px; }
          .actions-section { padding: 10px 16px; }
          .author-avatar { width: 40px; height: 40px; font-size: 20px; }
          .reaction-stats { display: none; }
          .nav-btn { width: 36px; height: 36px; }
          .nav-btn.prev { left: -12px; }
          .nav-btn.next { right: -12px; }
          .emoji-option { padding: 6px; font-size: 18px; }
          .lightbox-prev, .lightbox-next { width: 36px; height: 36px; font-size: 24px; }
          .lightbox-prev { left: 10px; }
          .lightbox-next { right: 10px; }
        }
      `}</style>
    </>
  );
}