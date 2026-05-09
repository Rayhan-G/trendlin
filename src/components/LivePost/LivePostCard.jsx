// ============================================
// PART 3: FRONTEND COMPONENTS
// ============================================

// components/LivePost/LivePostCard.jsx - Main post component
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Heart, MessageCircle, Share2, ChevronDown, ChevronUp, Play, Volume2 } from 'lucide-react';


export default function LivePostCard({ post, sessionId, onLike, onShare }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(post.likes_count || 0);
    const [isLiking, setIsLiking] = useState(false);
    const [showShareMenu, setShowShareMenu] = useState(false);
    const [timeLeft, setTimeLeft] = useState('');
    const shareMenuRef = useRef(null);
    
    const text = post.content || '';
    const shouldTruncate = text.length > 300;
    const displayText = isExpanded ? text : text.slice(0, 300);
    
    // Countdown timer for 24h expiry
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
            
            if (hours > 0) {
                setTimeLeft(`${hours}h ${minutes}m left`);
            } else {
                setTimeLeft(`${minutes}m left`);
            }
        };
        
        updateTimer();
        const interval = setInterval(updateTimer, 60000);
        return () => clearInterval(interval);
    }, [post.expires_at]);
    
    const handleLike = async () => {
        if (isLiking) return;
        setIsLiking(true);
        
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
            }
        } catch (error) {
            console.error('Like error:', error);
        } finally {
            setIsLiking(false);
        }
    };
    
    const handleShare = async (platform) => {
        const url = `${window.location.origin}/post/${post.id}`;
        const text = encodeURIComponent(post.title || post.content?.slice(0, 100));
        
        if (platform === 'copy') {
            await navigator.clipboard.writeText(url);
            alert('Link copied!');
        } else if (platform === 'twitter') {
            window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`, '_blank');
        }
        
        // Track share
        await fetch(`/api/live-posts/${post.id}/share`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: sessionId, platform })
        });
        
        setShowShareMenu(false);
        if (onShare) onShare(post.id);
    };
    
    // Close share menu on click outside
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
                        <img src={media.url} alt="Post media" className="media-image" />
                    </div>
                );
            case 'video':
                return (
                    <div className="media-container video-container">
                        <video controls className="media-video" poster={media.thumbnail}>
                            <source src={media.url} type="video/mp4" />
                        </video>
                    </div>
                );
            case 'audio':
                return (
                    <div className="media-container audio-container">
                        <audio controls className="media-audio">
                            <source src={media.url} type="audio/mpeg" />
                        </audio>
                    </div>
                );
            default:
                return null;
        }
    };
    
    return (
        <div className="live-post-card">
            {/* Category Badge & Timer */}
            <div className="card-header">
                <div className="category-badge">
                    <span className="category-icon">{post.category?.icon || '📝'}</span>
                    <span className="category-name">{post.category?.name || 'General'}</span>
                </div>
                <div className="timer-badge">
                    <span className="timer-icon">⏱️</span>
                    <span className="timer-text">{timeLeft}</span>
                </div>
            </div>
            
            {/* Title */}
            {post.title && (
                <h3 className="post-title">{post.title}</h3>
            )}
            
            {/* Content with See More */}
            <div className="post-content">
                <div className="content-text" dangerouslySetInnerHTML={{ __html: displayText }} />
                {shouldTruncate && (
                    <button onClick={() => setIsExpanded(!isExpanded)} className="see-more-btn">
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
                <span>❤️ {likesCount.toLocaleString()} loves</span>
                <span>💬 {(post.comments_count || 0).toLocaleString()} comments</span>
                <span>🔄 {(post.shares_count || 0).toLocaleString()} shares</span>
            </div>
            
            {/* Action Buttons */}
            <div className="action-buttons">
                <button 
                    onClick={handleLike} 
                    className={`action-btn like-btn ${isLiked ? 'active' : ''}`}
                    disabled={isLiking}
                >
                    <Heart size={24} fill={isLiked ? '#ef4444' : 'none'} />
                    <span>Love</span>
                </button>
                
                <button 
                    onClick={() => setShowComments(!showComments)} 
                    className={`action-btn comment-btn ${showComments ? 'active' : ''}`}
                >
                    <MessageCircle size={24} />
                    <span>Comment</span>
                </button>
                
                <div className="share-wrapper" ref={shareMenuRef}>
                    <button 
                        onClick={() => setShowShareMenu(!showShareMenu)} 
                        className="action-btn share-btn"
                    >
                        <Share2 size={24} />
                        <span>Share</span>
                    </button>
                    
                    {showShareMenu && (
                        <div className="share-menu">
                            <button onClick={() => handleShare('copy')}>
                                📋 Copy Link
                            </button>
                            <button onClick={() => handleShare('twitter')}>
                                𝕏 Share on Twitter
                            </button>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Comments Section */}
            {showComments && (
                <div className="comments-wrapper">
                    <CommentSection postId={post.id} sessionId={sessionId} />
                </div>
            )}
            
            <style jsx>{`
                .live-post-card {
                    background: var(--card-bg);
                    border-radius: 20px;
                    padding: 1.5rem;
                    margin-bottom: 1.5rem;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
                    transition: all 0.3s ease;
                    border: 1px solid var(--border-color);
                }
                
                .live-post-card:hover {
                    box-shadow: 0 8px 24px rgba(0,0,0,0.1);
                    transform: translateY(-2px);
                }
                
                .card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                }
                
                .category-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.25rem 0.75rem;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-radius: 20px;
                    color: white;
                    font-size: 0.75rem;
                    font-weight: 600;
                }
                
                .timer-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.25rem;
                    padding: 0.25rem 0.75rem;
                    background: var(--timer-bg);
                    border-radius: 20px;
                    font-size: 0.75rem;
                    color: var(--timer-color);
                }
                
                .post-title {
                    font-size: 1.25rem;
                    font-weight: 700;
                    margin-bottom: 0.75rem;
                    color: var(--text-primary);
                }
                
                .post-content {
                    margin-bottom: 1rem;
                }
                
                .content-text {
                    font-size: 1rem;
                    line-height: 1.6;
                    color: var(--text-primary);
                }
                
                .see-more-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.25rem;
                    margin-top: 0.5rem;
                    color: #8b5cf6;
                    background: none;
                    border: none;
                    cursor: pointer;
                    font-size: 0.875rem;
                    font-weight: 500;
                }
                
                .media-container {
                    margin: 1rem 0;
                    border-radius: 16px;
                    overflow: hidden;
                    background: #f1f5f9;
                }
                
                .media-image {
                    width: 100%;
                    max-height: 400px;
                    object-fit: cover;
                }
                
                .media-video {
                    width: 100%;
                    max-height: 400px;
                }
                
                .media-audio {
                    width: 100%;
                    padding: 1rem;
                }
                
                .post-stats {
                    display: flex;
                    gap: 1rem;
                    padding: 0.75rem 0;
                    border-top: 1px solid var(--border-color);
                    border-bottom: 1px solid var(--border-color);
                    font-size: 0.75rem;
                    color: var(--text-secondary);
                    margin-bottom: 1rem;
                }
                
                .action-buttons {
                    display: flex;
                    gap: 2rem;
                    margin-bottom: 1rem;
                }
                
                .action-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 0.5rem 1rem;
                    border-radius: 40px;
                    font-size: 0.875rem;
                    font-weight: 500;
                    color: var(--text-secondary);
                    transition: all 0.2s;
                }
                
                .action-btn:hover {
                    background: var(--hover-bg);
                    transform: scale(1.02);
                }
                
                .like-btn.active {
                    color: #ef4444;
                }
                
                .comment-btn.active {
                    color: #8b5cf6;
                }
                
                .share-wrapper {
                    position: relative;
                }
                
                .share-menu {
                    position: absolute;
                    bottom: calc(100% + 8px);
                    right: 0;
                    background: var(--dropdown-bg);
                    border-radius: 12px;
                    box-shadow: 0 8px 20px rgba(0,0,0,0.15);
                    padding: 0.5rem;
                    min-width: 160px;
                    z-index: 100;
                    border: 1px solid var(--border-color);
                }
                
                .share-menu button {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    width: 100%;
                    padding: 0.5rem 1rem;
                    background: none;
                    border: none;
                    cursor: pointer;
                    border-radius: 8px;
                    font-size: 0.875rem;
                    color: var(--text-primary);
                }
                
                .share-menu button:hover {
                    background: var(--hover-bg);
                }
                
                .comments-wrapper {
                    margin-top: 1rem;
                    padding-top: 1rem;
                    border-top: 1px solid var(--border-color);
                }
                
                :root {
                    --card-bg: #ffffff;
                    --text-primary: #1e293b;
                    --text-secondary: #64748b;
                    --border-color: #e2e8f0;
                    --hover-bg: #f1f5f9;
                    --dropdown-bg: #ffffff;
                    --timer-bg: #fef3c7;
                    --timer-color: #d97706;
                }
                
                .dark {
                    --card-bg: #1e293b;
                    --text-primary: #f1f5f9;
                    --text-secondary: #94a3b8;
                    --border-color: #334155;
                    --hover-bg: #334155;
                    --dropdown-bg: #1e293b;
                    --timer-bg: #422006;
                    --timer-color: #f59e0b;
                }
                
                @media (max-width: 640px) {
                    .live-post-card {
                        padding: 1rem;
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
                }
            `}</style>
        </div>
    );
}