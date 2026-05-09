// components/LivePost/LivePostCard.jsx
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { Heart, MessageCircle, Share2, ChevronDown, ChevronUp, Play, Volume2, X, Check, Link2, Twitter, Copy, MoreHorizontal } from 'lucide-react';

export default function LivePostCard({ post, sessionId, onLike, onShare, priority = false }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(post.likes_count || 0);
    const [isLiking, setIsLiking] = useState(false);
    const [showShareMenu, setShowShareMenu] = useState(false);
    const [showCopied, setShowCopied] = useState(false);
    const [timeLeft, setTimeLeft] = useState('');
    const [imageLoaded, setImageLoaded] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const shareMenuRef = useRef(null);
    const videoRef = useRef(null);
    
    const text = post.content || '';
    const shouldTruncate = text.length > 300;
    const displayText = isExpanded ? text : text.slice(0, 300);
    
    // Memoized category style
    const categoryStyle = useMemo(() => {
        const colors = {
            health: { bg: '#dcfce7', text: '#166534', icon: '🌿' },
            wealth: { bg: '#fed7aa', text: '#9a3412', icon: '💰' },
            tech: { bg: '#dbeafe', text: '#1e40af', icon: '⚡' },
            growth: { bg: '#e9d5ff', text: '#4c1d95', icon: '🌱' },
            entertainment: { bg: '#fecdd3', text: '#9f1239', icon: '🎬' },
            world: { bg: '#cffafe', text: '#155e75', icon: '🌍' },
            lifestyle: { bg: '#fce7f3', text: '#9d174d', icon: '✨' }
        };
        return colors[post.category?.slug] || colors.tech;
    }, [post.category]);
    
    // Timer effect
    useEffect(() => {
        const updateTimer = () => {
            const expiresAt = new Date(post.expires_at);
            const now = new Date();
            const diff = expiresAt - now;
            
            if (diff <= 0) {
                setTimeLeft('Expired');
                return;
            }
            
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (3600000)) / 60000);
            
            if (hours > 24) {
                const days = Math.floor(hours / 24);
                setTimeLeft(`${days}d ${hours % 24}h left`);
            } else if (hours > 0) {
                setTimeLeft(`${hours}h ${minutes}m left`);
            } else {
                setTimeLeft(`${minutes}m left`);
            }
        };
        
        updateTimer();
        const interval = setInterval(updateTimer, 60000);
        return () => clearInterval(interval);
    }, [post.expires_at]);
    
    // Video play/pause on scroll
    useEffect(() => {
        if (!videoRef.current || !post.media_items?.[0]?.type === 'video') return;
        
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && isPlaying) {
                        videoRef.current?.play();
                    } else if (!entry.isIntersecting && isPlaying) {
                        videoRef.current?.pause();
                    }
                });
            },
            { threshold: 0.5 }
        );
        
        observer.observe(videoRef.current);
        return () => observer.disconnect();
    }, [isPlaying, post.media_items]);
    
    const handleLike = useCallback(async () => {
        if (isLiking) return;
        setIsLiking(true);
        
        // Optimistic update
        const previousLiked = isLiked;
        const previousCount = likesCount;
        setIsLiked(!isLiked);
        setLikesCount(prev => previousLiked ? prev - 1 : prev + 1);
        
        try {
            const res = await fetch(`/api/live-posts/${post.id}/like`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: sessionId })
            });
            
            const data = await res.json();
            if (data.success) {
                setIsLiked(data.liked);
                setLikesCount(data.likes_count);
                if (onLike) onLike(post.id, data.likes_count);
            } else {
                // Rollback on error
                setIsLiked(previousLiked);
                setLikesCount(previousCount);
            }
        } catch (error) {
            console.error('Like error:', error);
            setIsLiked(previousLiked);
            setLikesCount(previousCount);
        } finally {
            setIsLiking(false);
        }
    }, [post.id, sessionId, isLiked, likesCount, isLiking, onLike]);
    
    const handleShare = useCallback(async (platform) => {
        const url = `${window.location.origin}/post/${post.slug || post.id}`;
        const title = encodeURIComponent(post.title || 'Check this out');
        
        try {
            if (platform === 'copy') {
                await navigator.clipboard.writeText(url);
                setShowCopied(true);
                setTimeout(() => setShowCopied(false), 2000);
            } else if (platform === 'twitter') {
                window.open(`https://twitter.com/intent/tweet?text=${title}&url=${encodeURIComponent(url)}`, '_blank', 'width=550,height=420');
            } else if (platform === 'facebook') {
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank', 'width=550,height=420');
            }
            
            // Track share
            await fetch(`/api/live-posts/${post.id}/share`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: sessionId, platform })
            });
        } catch (error) {
            console.error('Share error:', error);
        }
        
        setShowShareMenu(false);
        if (onShare) onShare(post.id);
    }, [post.id, post.slug, post.title, sessionId, onShare]);
    
    // Close share menu
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (shareMenuRef.current && !shareMenuRef.current.contains(event.target)) {
                setShowShareMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    const renderMedia = () => {
        if (!post.media_items || post.media_items.length === 0) return null;
        
        const media = post.media_items[0];
        
        switch (media.type) {
            case 'image':
                return (
                    <div className="media-container image-container">
                        <div className={`image-skeleton ${imageLoaded ? 'hidden' : ''}`} />
                        <img 
                            src={media.url} 
                            alt={post.title || 'Post media'} 
                            className={`media-image ${imageLoaded ? 'loaded' : ''}`}
                            onLoad={() => setImageLoaded(true)}
                            loading={priority ? 'eager' : 'lazy'}
                        />
                        {media.caption && (
                            <div className="media-caption">{media.caption}</div>
                        )}
                    </div>
                );
                
            case 'video':
                return (
                    <div className="media-container video-container">
                        <video 
                            ref={videoRef}
                            className="media-video"
                            poster={media.thumbnail}
                            controls
                            playsInline
                            onPlay={() => setIsPlaying(true)}
                            onPause={() => setIsPlaying(false)}
                        >
                            <source src={media.url} type="video/mp4" />
                        </video>
                        <button 
                            className="video-mute-btn"
                            onClick={() => {
                                if (videoRef.current) {
                                    videoRef.current.muted = !isMuted;
                                    setIsMuted(!isMuted);
                                }
                            }}
                        >
                            {isMuted ? <Volume2 size={16} /> : <Volume2 size={16} />}
                        </button>
                    </div>
                );
                
            case 'audio':
                return (
                    <div className="media-container audio-container">
                        <div className="audio-waveform">
                            <div className="waveform-bars">
                                {[...Array(20)].map((_, i) => (
                                    <div key={i} className="waveform-bar" style={{ animationDelay: `${i * 0.05}s` }} />
                                ))}
                            </div>
                            <audio controls className="media-audio">
                                <source src={media.url} type="audio/mpeg" />
                            </audio>
                        </div>
                    </div>
                );
                
            case 'gallery':
                return (
                    <div className="media-container gallery-container">
                        <div className="gallery-grid">
                            {post.media_items.slice(0, 4).map((item, idx) => (
                                <div key={idx} className="gallery-item">
                                    <img src={item.url} alt={`Gallery ${idx + 1}`} />
                                    {idx === 3 && post.media_items.length > 4 && (
                                        <div className="gallery-overlay">
                                            +{post.media_items.length - 4}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                );
                
            default:
                return null;
        }
    };
    
    return (
        <article className="live-post-card">
            {/* Header */}
            <div className="card-header">
                <div className="header-left">
                    <div className="category-badge" style={{ background: categoryStyle.bg, color: categoryStyle.text }}>
                        <span className="category-icon">{categoryStyle.icon}</span>
                        <span className="category-name">{post.category?.name || 'General'}</span>
                    </div>
                    {post.is_pinned && (
                        <div className="pinned-badge">
                            📌 Pinned
                        </div>
                    )}
                </div>
                
                <div className="header-right">
                    <div className={`timer-badge ${timeLeft === 'Expired' ? 'expired' : ''}`}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                        </svg>
                        <span>{timeLeft}</span>
                    </div>
                    <button className="more-btn">
                        <MoreHorizontal size={16} />
                    </button>
                </div>
            </div>
            
            {/* Author Info */}
            <div className="author-info">
                <div className="author-avatar">
                    {post.author?.avatar ? (
                        <img src={post.author.avatar} alt="" />
                    ) : (
                        <div className="avatar-placeholder">
                            {post.author?.name?.[0] || 'A'}
                        </div>
                    )}
                </div>
                <div className="author-details">
                    <div className="author-name">{post.author?.name || 'Trendlin'}</div>
                    <div className="post-time">
                        {new Date(post.created_at).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            hour: 'numeric',
                            minute: 'numeric'
                        })}
                    </div>
                </div>
            </div>
            
            {/* Title */}
            {post.title && (
                <h3 className="post-title">{post.title}</h3>
            )}
            
            {/* Content */}
            <div className="post-content">
                <div 
                    className="content-text" 
                    dangerouslySetInnerHTML={{ __html: displayText }}
                />
                {shouldTruncate && (
                    <button 
                        onClick={() => setIsExpanded(!isExpanded)} 
                        className="see-more-btn"
                    >
                        {isExpanded ? (
                            <>Show less <ChevronUp size={14} /></>
                        ) : (
                            <>See more <ChevronDown size={14} /></>
                        )}
                    </button>
                )}
            </div>
            
            {/* Media */}
            {renderMedia()}
            
            {/* Stats */}
            <div className="post-stats">
                <div className="stat-item">
                    <span className="stat-emoji">❤️</span>
                    <span>{likesCount.toLocaleString()}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-emoji">💬</span>
                    <span>{(post.comments_count || 0).toLocaleString()}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-emoji">🔄</span>
                    <span>{(post.shares_count || 0).toLocaleString()}</span>
                </div>
            </div>
            
            {/* Actions */}
            <div className="action-buttons">
                <button 
                    onClick={handleLike} 
                    className={`action-btn like-btn ${isLiked ? 'active' : ''}`}
                    disabled={isLiking}
                >
                    <Heart 
                        size={20} 
                        fill={isLiked ? '#ef4444' : 'none'}
                        stroke={isLiked ? '#ef4444' : 'currentColor'}
                    />
                    <span>Love</span>
                </button>
                
                <button 
                    onClick={() => setShowComments(!showComments)} 
                    className={`action-btn comment-btn ${showComments ? 'active' : ''}`}
                >
                    <MessageCircle size={20} />
                    <span>Comment</span>
                </button>
                
                <div className="share-wrapper" ref={shareMenuRef}>
                    <button 
                        onClick={() => setShowShareMenu(!showShareMenu)} 
                        className="action-btn share-btn"
                    >
                        <Share2 size={20} />
                        <span>Share</span>
                    </button>
                    
                    {showShareMenu && (
                        <div className="share-menu">
                            <button onClick={() => handleShare('copy')} className="share-option">
                                <Copy size={16} />
                                Copy link
                            </button>
                            <button onClick={() => handleShare('twitter')} className="share-option">
                                <Twitter size={16} />
                                Twitter
                            </button>
                            <button onClick={() => handleShare('facebook')} className="share-option">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                                </svg>
                                Facebook
                            </button>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Comments Section */}
            {showComments && (
                <div className="comments-wrapper">
                    {/* CommentSection component would go here */}
                    <div className="comments-placeholder">
                        <p>Comments coming soon...</p>
                    </div>
                </div>
            )}
            
            {/* Copied Toast */}
            {showCopied && (
                <div className="copied-toast">
                    <Check size={16} />
                    <span>Link copied to clipboard!</span>
                </div>
            )}
            
            <style jsx>{`
                .live-post-card {
                    position: relative;
                    background: var(--card-bg);
                    border-radius: 24px;
                    padding: 1.5rem;
                    margin-bottom: 1.5rem;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    border: 1px solid var(--border-color);
                }
                
                .live-post-card:hover {
                    box-shadow: 0 8px 30px rgba(0,0,0,0.08);
                    transform: translateY(-1px);
                    border-color: var(--hover-border);
                }
                
                /* Header */
                .card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                }
                
                .header-left {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    flex-wrap: wrap;
                }
                
                .category-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.375rem;
                    padding: 0.25rem 0.75rem;
                    border-radius: 100px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    backdrop-filter: blur(4px);
                }
                
                .pinned-badge {
                    font-size: 0.7rem;
                    padding: 0.25rem 0.5rem;
                    background: var(--bg-tertiary);
                    border-radius: 6px;
                    color: var(--text-secondary);
                }
                
                .header-right {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                
                .timer-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.375rem;
                    padding: 0.25rem 0.75rem;
                    background: rgba(245, 158, 11, 0.1);
                    border-radius: 100px;
                    font-size: 0.75rem;
                    font-weight: 500;
                    color: #f59e0b;
                }
                
                .timer-badge.expired {
                    background: rgba(239, 68, 68, 0.1);
                    color: #ef4444;
                }
                
                .more-btn {
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    padding: 0.25rem;
                    border-radius: 8px;
                    color: var(--text-secondary);
                    transition: all 0.2s;
                }
                
                .more-btn:hover {
                    background: var(--hover-bg);
                }
                
                /* Author */
                .author-info {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    margin-bottom: 1rem;
                }
                
                .author-avatar {
                    width: 40px;
                    height: 40px;
                    border-radius: 100px;
                    overflow: hidden;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                }
                
                .author-avatar img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                
                .avatar-placeholder {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 600;
                    color: white;
                }
                
                .author-details {
                    flex: 1;
                }
                
                .author-name {
                    font-weight: 600;
                    font-size: 0.875rem;
                    color: var(--text-primary);
                }
                
                .post-time {
                    font-size: 0.7rem;
                    color: var(--text-tertiary);
                    margin-top: 0.125rem;
                }
                
                /* Title & Content */
                .post-title {
                    font-size: 1.25rem;
                    font-weight: 700;
                    margin-bottom: 0.75rem;
                    line-height: 1.4;
                    color: var(--text-primary);
                }
                
                .post-content {
                    margin-bottom: 1rem;
                }
                
                .content-text {
                    font-size: 0.9375rem;
                    line-height: 1.6;
                    color: var(--text-secondary);
                }
                
                .content-text :global(p) {
                    margin-bottom: 0.75rem;
                }
                
                .see-more-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.25rem;
                    margin-top: 0.5rem;
                    color: var(--accent-color);
                    background: none;
                    border: none;
                    cursor: pointer;
                    font-size: 0.875rem;
                    font-weight: 500;
                    transition: opacity 0.2s;
                }
                
                .see-more-btn:hover {
                    opacity: 0.8;
                }
                
                /* Media */
                .media-container {
                    margin: 1rem 0;
                    border-radius: 20px;
                    overflow: hidden;
                    background: var(--bg-tertiary);
                    position: relative;
                }
                
                .image-container {
                    position: relative;
                    min-height: 200px;
                }
                
                .image-skeleton {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(90deg, var(--bg-tertiary) 25%, var(--border-color) 50%, var(--bg-tertiary) 75%);
                    background-size: 200% 100%;
                    animation: shimmer 1.5s infinite;
                }
                
                @keyframes shimmer {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
                
                .media-image {
                    width: 100%;
                    max-height: 500px;
                    object-fit: cover;
                    opacity: 0;
                    transition: opacity 0.3s;
                }
                
                .media-image.loaded {
                    opacity: 1;
                }
                
                .media-caption {
                    padding: 0.75rem;
                    font-size: 0.75rem;
                    color: var(--text-tertiary);
                    background: var(--bg-secondary);
                    text-align: center;
                }
                
                .video-container {
                    position: relative;
                }
                
                .media-video {
                    width: 100%;
                    max-height: 500px;
                    background: #000;
                }
                
                .video-mute-btn {
                    position: absolute;
                    bottom: 1rem;
                    right: 1rem;
                    background: rgba(0,0,0,0.5);
                    backdrop-filter: blur(4px);
                    border: none;
                    border-radius: 100px;
                    padding: 0.5rem;
                    cursor: pointer;
                    color: white;
                    transition: background 0.2s;
                }
                
                .video-mute-btn:hover {
                    background: rgba(0,0,0,0.7);
                }
                
                .audio-container {
                    padding: 1rem;
                }
                
                .audio-waveform {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }
                
                .waveform-bars {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 2px;
                    height: 40px;
                }
                
                .waveform-bar {
                    width: 3px;
                    background: var(--accent-color);
                    border-radius: 2px;
                    animation: bounce 0.8s ease-in-out infinite;
                    transform-origin: bottom;
                }
                
                @keyframes bounce {
                    0%, 100% { height: 8px; }
                    50% { height: 32px; }
                }
                
                .waveform-bar:nth-child(1) { animation-delay: 0s; }
                .waveform-bar:nth-child(2) { animation-delay: 0.1s; }
                /* ... continue pattern ... */
                
                .media-audio {
                    width: 100%;
                }
                
                .gallery-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 2px;
                    aspect-ratio: 16/9;
                }
                
                .gallery-item {
                    position: relative;
                    overflow: hidden;
                }
                
                .gallery-item img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                
                .gallery-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0,0,0,0.6);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: white;
                }
                
                /* Stats */
                .post-stats {
                    display: flex;
                    gap: 1rem;
                    padding: 0.75rem 0;
                    border-top: 1px solid var(--border-color);
                    border-bottom: 1px solid var(--border-color);
                    margin-bottom: 1rem;
                }
                
                .stat-item {
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                    font-size: 0.75rem;
                    color: var(--text-tertiary);
                }
                
                .stat-emoji {
                    font-size: 0.875rem;
                }
                
                /* Actions */
                .action-buttons {
                    display: flex;
                    gap: 1rem;
                }
                
                .action-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    padding: 0.5rem 1rem;
                    border-radius: 40px;
                    font-size: 0.875rem;
                    font-weight: 500;
                    color: var(--text-secondary);
                    transition: all 0.2s ease;
                }
                
                .action-btn:hover {
                    background: var(--hover-bg);
                    transform: scale(1.02);
                }
                
                .action-btn:active {
                    transform: scale(0.98);
                }
                
                .like-btn.active {
                    color: #ef4444;
                }
                
                .comment-btn.active {
                    color: var(--accent-color);
                }
                
                .share-wrapper {
                    position: relative;
                }
                
                .share-menu {
                    position: absolute;
                    bottom: calc(100% + 8px);
                    right: 0;
                    background: var(--dropdown-bg);
                    backdrop-filter: blur(12px);
                    border-radius: 16px;
                    box-shadow: 0 8px 30px rgba(0,0,0,0.12);
                    padding: 0.5rem;
                    min-width: 160px;
                    z-index: 100;
                    border: 1px solid var(--border-color);
                    animation: menuFadeIn 0.15s ease;
                }
                
                @keyframes menuFadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(-4px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .share-option {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    width: 100%;
                    padding: 0.625rem 1rem;
                    background: none;
                    border: none;
                    cursor: pointer;
                    border-radius: 10px;
                    font-size: 0.8125rem;
                    font-weight: 500;
                    color: var(--text-primary);
                    transition: all 0.15s;
                }
                
                .share-option:hover {
                    background: var(--hover-bg);
                    transform: translateX(2px);
                }
                
                /* Comments */
                .comments-wrapper {
                    margin-top: 1rem;
                    padding-top: 1rem;
                    border-top: 1px solid var(--border-color);
                }
                
                .comments-placeholder {
                    padding: 2rem;
                    text-align: center;
                    color: var(--text-tertiary);
                }
                
                /* Toast */
                .copied-toast {
                    position: fixed;
                    bottom: 2rem;
                    left: 50%;
                    transform: translateX(-50%);
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.75rem 1.25rem;
                    background: #1e293b;
                    color: white;
                    border-radius: 100px;
                    font-size: 0.875rem;
                    font-weight: 500;
                    z-index: 1000;
                    animation: toastIn 0.2s ease;
                }
                
                @keyframes toastIn {
                    from {
                        opacity: 0;
                        transform: translateX(-50%) translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(-50%) translateY(0);
                    }
                }
                
                /* Variables */
                :root {
                    --card-bg: #ffffff;
                    --text-primary: #0f172a;
                    --text-secondary: #334155;
                    --text-tertiary: #64748b;
                    --border-color: #e2e8f0;
                    --hover-border: #cbd5e1;
                    --hover-bg: #f8fafc;
                    --bg-secondary: #f1f5f9;
                    --bg-tertiary: #f8fafc;
                    --dropdown-bg: rgba(255, 255, 255, 0.98);
                    --accent-color: #8b5cf6;
                }
                
                :global(.dark) {
                    --card-bg: #1e293b;
                    --text-primary: #f1f5f9;
                    --text-secondary: #cbd5e1;
                    --text-tertiary: #94a3b8;
                    --border-color: #334155;
                    --hover-border: #475569;
                    --hover-bg: #334155;
                    --bg-secondary: #0f172a;
                    --bg-tertiary: #1e293b;
                    --dropdown-bg: rgba(30, 41, 59, 0.98);
                }
                
                /* Responsive */
                @media (max-width: 640px) {
                    .live-post-card {
                        padding: 1rem;
                        border-radius: 20px;
                    }
                    
                    .action-buttons {
                        gap: 0.5rem;
                    }
                    
                    .action-btn span {
                        display: none;
                    }
                    
                    .action-btn {
                        padding: 0.5rem;
                    }
                    
                    .post-title {
                        font-size: 1.125rem;
                    }
                    
                    .content-text {
                        font-size: 0.875rem;
                    }
                }
            `}</style>
        </article>
    );
}