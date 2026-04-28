// components/PostSystem.jsx
import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

const categories = [
    { id: 'tech', name: 'TECHNOLOGY', icon: '⚡', color: '#3b82f6', preview: '/images/tech-preview.jpg' },
    { id: 'health', name: 'WELLNESS', icon: '🌿', color: '#10b981', preview: '/images/health-preview.jpg' },
    { id: 'entertainment', name: 'CULTURE', icon: '🎭', color: '#ec4899', preview: '/images/entertainment-preview.jpg' },
    { id: 'wealth', name: 'CAPITAL', icon: '💰', color: '#f59e0b', preview: '/images/wealth-preview.jpg' },
    { id: 'world', name: 'HORIZONS', icon: '🌍', color: '#06b6d4', preview: '/images/world-preview.jpg' },
    { id: 'lifestyle', name: 'AESTHETIC', icon: '✨', color: '#f97316', preview: '/images/lifestyle-preview.jpg' },
    { id: 'growth', name: 'EVOLUTION', icon: '🌱', color: '#8b5cf6', preview: '/images/growth-preview.jpg' }
];

export default function PostSystem() {
    const [activeCategory, setActiveCategory] = useState('tech');
    const [activePost, setActivePost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [description, setDescription] = useState('');
    const [overlayHeadline, setOverlayHeadline] = useState('');
    const [mediaItems, setMediaItems] = useState([{ type: 'image', url: '' }]);
    const [liked, setLiked] = useState(false);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [showComments, setShowComments] = useState(false);
    const [wordCount, setWordCount] = useState(0);
    const timerRef = useRef(null);

    const currentUser = { name: 'LUMINA CREATIVE', initial: 'LC' };

    // Count words
    const countWords = (text) => {
        return text.trim().split(/\s+/).filter(w => w.length > 0).length;
    };

    // Get time remaining
    const getTimeRemaining = (expiresAt) => {
        const diff = new Date(expiresAt) - new Date();
        if (diff <= 0) return null;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (3600000)) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        if (hours > 0) return `${hours}h ${minutes}m`;
        if (minutes > 0) return `${minutes}m ${seconds}s`;
        return `${seconds}s`;
    };

    // Fetch active post
    const fetchActivePost = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/posts?category=${activeCategory}`);
            setActivePost(response.data.post);
            if (response.data.post) {
                setComments(response.data.post.comments || []);
                setLiked(response.data.post.user_liked || false);
            }
        } catch (error) {
            console.error('Error fetching post:', error);
        } finally {
            setLoading(false);
        }
    }, [activeCategory]);

    useEffect(() => {
        fetchActivePost();
    }, [fetchActivePost]);

    // Start timer
    useEffect(() => {
        if (!activePost?.expires_at) return;
        
        if (timerRef.current) clearInterval(timerRef.current);
        
        timerRef.current = setInterval(() => {
            const timeLeft = getTimeRemaining(activePost.expires_at);
            const timerElement = document.getElementById('liveTimer');
            if (timerElement && timeLeft) {
                timerElement.textContent = timeLeft;
            }
            if (!timeLeft) {
                clearInterval(timerRef.current);
                fetchActivePost();
            }
        }, 1000);
        
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [activePost]);

    // Like post
    const handleLike = async () => {
        if (!activePost) return;
        try {
            await axios.post(`/api/posts/${activePost.id}/like`);
            setActivePost(prev => ({ ...prev, likes: (prev?.likes || 0) + 1 }));
            setLiked(true);
        } catch (error) {
            console.error('Error liking post:', error);
        }
    };

    // Add comment
    const handleAddComment = async () => {
        if (!newComment.trim() || !activePost) return;
        
        try {
            const response = await axios.post(`/api/posts/${activePost.id}/comment`, {
                author: currentUser.name,
                text: newComment
            });
            setComments(prev => [...prev, response.data.comment]);
            setNewComment('');
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };

    // Create post
    const handleCreatePost = async () => {
        const wordCount = countWords(description);
        
        if (wordCount < 50) {
            alert(`Please write at least 50 words (currently ${wordCount})`);
            return;
        }
        if (wordCount > 60) {
            alert(`Maximum 60 words allowed (currently ${wordCount})`);
            return;
        }
        
        const validMedia = mediaItems.filter(m => m.url.trim());
        if (validMedia.length === 0) {
            alert('Please add at least one image or video');
            return;
        }
        
        try {
            await axios.post('/api/posts', {
                category: activeCategory,
                description,
                overlay_headline: overlayHeadline,
                media_items: validMedia
            });
            
            setShowCreateModal(false);
            setDescription('');
            setOverlayHeadline('');
            setMediaItems([{ type: 'image', url: '' }]);
            fetchActivePost();
        } catch (error) {
            console.error('Error creating post:', error);
            alert(error.response?.data?.error || 'Failed to create post');
        }
    };

    // Check if can create post
    const canCreatePost = !activePost;

    return (
        <div className="post-system">
            <style jsx>{`
                .post-system {
                    max-width: 1300px;
                    margin: 0 auto;
                    padding: 40px 32px;
                    font-family: 'Space Grotesk', monospace;
                }
                
                .category-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 24px;
                    margin-bottom: 48px;
                }
                
                .category-card {
                    background: #0f0f0f;
                    border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 32px;
                    overflow: hidden;
                    cursor: pointer;
                    transition: all 0.4s;
                }
                
                .category-card:hover {
                    transform: translateY(-4px);
                    border-color: rgba(139,92,246,0.3);
                }
                
                .category-card.active {
                    border-color: #8b5cf6;
                    box-shadow: 0 0 0 1px #8b5cf6;
                }
                
                .category-preview {
                    height: 160px;
                    position: relative;
                    overflow: hidden;
                    background: #1a1a1a;
                }
                
                .category-preview img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                
                .category-overlay {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(to top, #0f0f0f, transparent);
                }
                
                .category-icon {
                    position: absolute;
                    bottom: 16px;
                    left: 20px;
                    font-size: 32px;
                }
                
                .category-info {
                    padding: 20px;
                }
                
                .category-name {
                    font-size: 18px;
                    font-weight: 600;
                    margin-bottom: 8px;
                }
                
                .category-status {
                    display: flex;
                    justify-content: space-between;
                    font-size: 12px;
                    color: #a1a1aa;
                }
                
                .status-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    display: inline-block;
                    margin-right: 6px;
                }
                
                .status-dot.active { background: #22c55e; }
                .status-dot.none { background: #52525b; }
                
                .create-btn {
                    width: 100%;
                    padding: 14px;
                    background: rgba(139,92,246,0.1);
                    border: none;
                    color: #8b5cf6;
                    font-weight: 600;
                    cursor: pointer;
                    border-top: 1px solid rgba(255,255,255,0.06);
                }
                
                .disabled-btn {
                    width: 100%;
                    padding: 14px;
                    background: rgba(255,255,255,0.02);
                    border: none;
                    color: #52525b;
                    border-top: 1px solid rgba(255,255,255,0.06);
                }
                
                .post-card {
                    background: #0f0f0f;
                    border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 48px;
                    overflow: hidden;
                }
                
                .post-header {
                    padding: 28px 32px;
                    display: flex;
                    justify-content: space-between;
                    border-bottom: 1px solid rgba(255,255,255,0.06);
                }
                
                .avatar {
                    width: 56px;
                    height: 56px;
                    background: linear-gradient(135deg, #8b5cf6, #ec4899);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    font-size: 20px;
                }
                
                .timer {
                    background: rgba(0,0,0,0.5);
                    padding: 10px 20px;
                    border-radius: 60px;
                    font-family: monospace;
                    font-size: 18px;
                }
                
                .description {
                    padding: 32px 32px 0;
                    font-size: 20px;
                    line-height: 1.6;
                }
                
                .carousel {
                    margin: 32px;
                    position: relative;
                    height: 500px;
                    overflow: hidden;
                    border-radius: 24px;
                }
                
                .carousel-slide {
                    position: absolute;
                    width: 100%;
                    height: 100%;
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
                
                .overlay {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
                    padding: 40px 24px 20px;
                }
                
                .overlay h2 {
                    font-size: 28px;
                    font-weight: 700;
                }
                
                .carousel-btn {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    background: rgba(0,0,0,0.6);
                    border: none;
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    color: white;
                    cursor: pointer;
                }
                
                .carousel-prev { left: 20px; }
                .carousel-next { right: 20px; }
                
                .actions {
                    padding: 20px 32px;
                    display: flex;
                    gap: 24px;
                    border-bottom: 1px solid rgba(255,255,255,0.06);
                }
                
                .action-btn {
                    flex: 1;
                    padding: 12px;
                    background: none;
                    border: none;
                    border-radius: 60px;
                    color: #a1a1aa;
                    font-weight: 600;
                    cursor: pointer;
                }
                
                .action-btn.liked {
                    color: #ef4444;
                }
                
                .modal {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.95);
                    backdrop-filter: blur(20px);
                    display: none;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                }
                
                .modal.active {
                    display: flex;
                }
                
                .modal-content {
                    max-width: 700px;
                    width: 90%;
                    max-height: 85vh;
                    overflow-y: auto;
                    background: #0f0f0f;
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 40px;
                    padding: 32px;
                }
                
                .modal input, .modal textarea, .modal select {
                    width: 100%;
                    padding: 14px;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 20px;
                    color: white;
                    font-family: inherit;
                    margin-bottom: 16px;
                }
                
                .word-counter {
                    text-align: right;
                    font-size: 12px;
                    color: #a1a1aa;
                    margin-top: -12px;
                    margin-bottom: 16px;
                }
                
                .word-counter.warning {
                    color: #ef4444;
                }
                
                @media (max-width: 768px) {
                    .post-system {
                        padding: 20px 16px;
                    }
                    .carousel {
                        height: 300px;
                    }
                }
            `}</style>

            {/* Category Grid */}
            <div className="category-grid">
                {categories.map(cat => {
                    const isActive = activeCategory === cat.id;
                    const hasActivePost = activePost?.category === cat.id;
                    
                    return (
                        <div 
                            key={cat.id}
                            className={`category-card ${isActive ? 'active' : ''}`}
                            onClick={() => setActiveCategory(cat.id)}
                        >
                            <div className="category-preview">
                                <img src={cat.preview} alt={cat.name} />
                                <div className="category-overlay" />
                                <div className="category-icon">{cat.icon}</div>
                            </div>
                            <div className="category-info">
                                <div className="category-name">{cat.name}</div>
                                <div className="category-status">
                                    <span>
                                        <span className={`status-dot ${hasActivePost ? 'active' : 'none'}`}></span>
                                        {hasActivePost ? 'LIVE' : 'READY'}
                                    </span>
                                    <span>{hasActivePost ? 'Active' : 'Available'}</span>
                                </div>
                            </div>
                            {hasActivePost ? (
                                <div className="disabled-btn">⏳ Post Active</div>
                            ) : (
                                <button 
                                    className="create-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowCreateModal(true);
                                    }}
                                >
                                    ✧ CREATE POST ✧
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Active Post Display */}
            {activePost && (
                <div className="post-card">
                    <div className="post-header">
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                            <div className="avatar">{currentUser.initial}</div>
                            <div>
                                <div style={{ fontWeight: 600 }}>{currentUser.name}</div>
                                <div style={{ fontSize: '13px', color: '#a1a1aa' }}>
                                    {categories.find(c => c.id === activePost.category)?.name}
                                </div>
                            </div>
                        </div>
                        <div className="timer">
                            <span id="liveTimer">{getTimeRemaining(activePost.expires_at)}</span>
                        </div>
                    </div>

                    <div className="description">
                        "{activePost.description}"
                        <div style={{ fontSize: '12px', color: '#52525b', marginTop: '12px' }}>
                            {countWords(activePost.description)} words
                        </div>
                    </div>

                    {/* Carousel */}
                    <div className="carousel" id="carousel">
                        {activePost.media_items?.map((item, idx) => (
                            <div key={idx} className={`carousel-slide ${idx === 0 ? 'active' : ''}`} data-slide={idx}>
                                {item.type === 'image' ? (
                                    <img src={item.url} alt={`Slide ${idx + 1}`} />
                                ) : (
                                    <video src={item.url} controls />
                                )}
                                {activePost.overlay_headline && (
                                    <div className="overlay">
                                        <h2>{activePost.overlay_headline}</h2>
                                    </div>
                                )}
                            </div>
                        ))}
                        {activePost.media_items?.length > 1 && (
                            <>
                                <button className="carousel-btn carousel-prev" onClick={() => {
                                    const slides = document.querySelectorAll('.carousel-slide');
                                    const active = document.querySelector('.carousel-slide.active');
                                    const index = Array.from(slides).indexOf(active);
                                    const newIndex = (index - 1 + slides.length) % slides.length;
                                    slides.forEach(s => s.classList.remove('active'));
                                    slides[newIndex].classList.add('active');
                                }}>←</button>
                                <button className="carousel-btn carousel-next" onClick={() => {
                                    const slides = document.querySelectorAll('.carousel-slide');
                                    const active = document.querySelector('.carousel-slide.active');
                                    const index = Array.from(slides).indexOf(active);
                                    const newIndex = (index + 1) % slides.length;
                                    slides.forEach(s => s.classList.remove('active'));
                                    slides[newIndex].classList.add('active');
                                }}>→</button>
                            </>
                        )}
                    </div>

                    {/* Stats & Actions */}
                    <div className="actions">
                        <button 
                            className={`action-btn ${liked ? 'liked' : ''}`}
                            onClick={handleLike}
                        >
                            ❤️ {activePost.likes || 0} Likes
                        </button>
                        <button 
                            className="action-btn"
                            onClick={() => setShowComments(!showComments)}
                        >
                            💬 {comments.length} Comments
                        </button>
                        <button 
                            className="action-btn"
                            onClick={async () => {
                                await axios.post(`/api/posts/${activePost.id}/like`);
                                setActivePost(prev => ({ ...prev, shares: (prev?.shares || 0) + 1 }));
                            }}
                        >
                            🔁 Share
                        </button>
                    </div>

                    {/* Comments */}
                    {showComments && (
                        <div style={{ padding: '24px 32px', background: 'rgba(0,0,0,0.3)' }}>
                            {comments.map(comment => (
                                <div key={comment.id} style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                                    <div style={{ width: '32px', height: '32px', background: 'rgba(139,92,246,0.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {comment.author?.charAt(0)}
                                    </div>
                                    <div style={{ flex: 1, background: 'rgba(255,255,255,0.04)', padding: '10px 14px', borderRadius: '16px' }}>
                                        <div style={{ fontWeight: 600, fontSize: '13px' }}>{comment.author}</div>
                                        <div style={{ fontSize: '14px', marginTop: '4px' }}>{comment.text}</div>
                                        <div style={{ fontSize: '10px', color: '#52525b', marginTop: '6px' }}>
                                            {new Date(comment.created_at).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                                <input 
                                    type="text"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Write a comment..."
                                    style={{ flex: 1, padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '40px', color: 'white' }}
                                />
                                <button onClick={handleAddComment} style={{ padding: '0 20px', background: '#8b5cf6', border: 'none', borderRadius: '40px', color: 'white', fontWeight: 600 }}>
                                    Post
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Create Modal */}
            <div className={`modal ${showCreateModal ? 'active' : ''}`}>
                <div className="modal-content">
                    <h2 style={{ fontSize: '28px', marginBottom: '24px' }}>Create Masterpiece</h2>
                    
                    <textarea
                        placeholder="Description (50-60 words)..."
                        rows={6}
                        value={description}
                        onChange={(e) => {
                            setDescription(e.target.value);
                            setWordCount(countWords(e.target.value));
                        }}
                    />
                    <div className={`word-counter ${wordCount < 50 || wordCount > 60 ? 'warning' : ''}`}>
                        {wordCount} / 50-60 words
                    </div>
                    
                    <input
                        type="text"
                        placeholder="Overlay Headline (optional)"
                        value={overlayHeadline}
                        onChange={(e) => setOverlayHeadline(e.target.value)}
                    />
                    
                    <h3 style={{ marginBottom: '12px' }}>Media Items</h3>
                    {mediaItems.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                            <select 
                                value={item.type}
                                onChange={(e) => {
                                    const newItems = [...mediaItems];
                                    newItems[idx].type = e.target.value;
                                    setMediaItems(newItems);
                                }}
                                style={{ width: '100px' }}
                            >
                                <option value="image">Image</option>
                                <option value="video">Video</option>
                            </select>
                            <input
                                type="text"
                                placeholder="Media URL"
                                value={item.url}
                                onChange={(e) => {
                                    const newItems = [...mediaItems];
                                    newItems[idx].url = e.target.value;
                                    setMediaItems(newItems);
                                }}
                                style={{ flex: 1 }}
                            />
                            {mediaItems.length > 1 && (
                                <button onClick={() => setMediaItems(mediaItems.filter((_, i) => i !== idx))}>
                                    ✕
                                </button>
                            )}
                        </div>
                    ))}
                    
                    <button 
                        onClick={() => setMediaItems([...mediaItems, { type: 'image', url: '' }])}
                        style={{ width: '100%', padding: '12px', background: 'rgba(139,92,246,0.1)', border: '1px dashed #8b5cf6', borderRadius: '20px', color: '#8b5cf6', marginBottom: '24px' }}
                    >
                        + Add Media
                    </button>
                    
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button onClick={() => setShowCreateModal(false)} style={{ flex: 1, padding: '14px', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '40px', color: '#a1a1aa' }}>
                            Cancel
                        </button>
                        <button onClick={handleCreatePost} style={{ flex: 1, padding: '14px', background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', border: 'none', borderRadius: '40px', color: 'white', fontWeight: 700 }}>
                            Publish (24h)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}