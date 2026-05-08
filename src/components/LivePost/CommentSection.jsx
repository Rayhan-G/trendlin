// components/LivePost/CommentSection.jsx - Twitter-style threaded comments
import { useState, useEffect } from 'react';
import { Heart, Reply, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

export default function CommentSection({ postId, sessionId }) {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [userName, setUserName] = useState('');
    const [loading, setLoading] = useState(true);
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyContent, setReplyContent] = useState('');
    const [expandedReplies, setExpandedReplies] = useState({});
    
    // Load user name from localStorage
    useEffect(() => {
        const savedName = localStorage.getItem('comment_name');
        if (savedName) setUserName(savedName);
    }, []);
    
    // Load comments
    const loadComments = async () => {
        try {
            const res = await fetch(`/api/live-posts/${postId}/comments`);
            const data = await res.json();
            if (data.success) {
                setComments(data.comments);
            }
        } catch (error) {
            console.error('Error loading comments:', error);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        if (postId) loadComments();
    }, [postId]);
    
    const handleSubmitComment = async (parentId = null) => {
        const content = parentId ? replyContent : newComment;
        if (!content.trim() || !userName.trim()) return;
        
        try {
            const res = await fetch(`/api/live-posts/${postId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_name: userName,
                    content,
                    parent_id: parentId
                })
            });
            
            const data = await res.json();
            if (data.success) {
                if (parentId) {
                    setReplyContent('');
                    setReplyingTo(null);
                } else {
                    setNewComment('');
                }
                loadComments(); // Reload to show new comment
            }
        } catch (error) {
            console.error('Error posting comment:', error);
        }
    };
    
    const handleLikeComment = async (commentId) => {
        try {
            const res = await fetch(`/api/live-posts/comments/${commentId}/like`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: sessionId })
            });
            
            if (res.ok) {
                loadComments(); // Reload to update likes
            }
        } catch (error) {
            console.error('Error liking comment:', error);
        }
    };
    
    const formatTimeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        if (seconds < 60) return `${seconds}s`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h`;
        const days = Math.floor(hours / 24);
        return `${days}d`;
    };
    
    const toggleReplies = (commentId) => {
        setExpandedReplies(prev => ({
            ...prev,
            [commentId]: !prev[commentId]
        }));
    };
    
    const CommentItem = ({ comment, isReply = false }) => {
        const [showReplyInput, setShowReplyInput] = useState(false);
        const [replyText, setReplyText] = useState('');
        
        const handleReply = async () => {
            if (!replyText.trim()) return;
            
            try {
                const res = await fetch(`/api/live-posts/${postId}/comments`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        user_name: userName,
                        content: replyText,
                        parent_id: comment.id
                    })
                });
                
                if (res.ok) {
                    setReplyText('');
                    setShowReplyInput(false);
                    loadComments();
                }
            } catch (error) {
                console.error('Error posting reply:', error);
            }
        };
        
        return (
            <div className={`comment-item ${isReply ? 'reply' : ''}`}>
                <div className="comment-avatar">
                    <div className="avatar">
                        {comment.user_name?.[0]?.toUpperCase() || '?'}
                    </div>
                </div>
                <div className="comment-body">
                    <div className="comment-header">
                        <span className="comment-author">{comment.user_name}</span>
                        <span className="comment-time">{formatTimeAgo(comment.created_at)}</span>
                    </div>
                    <div className="comment-content">{comment.content}</div>
                    <div className="comment-actions">
                        <button 
                            onClick={() => handleLikeComment(comment.id)}
                            className="comment-action like"
                        >
                            <Heart size={14} />
                            <span>{comment.likes_count || 0}</span>
                        </button>
                        <button 
                            onClick={() => setShowReplyInput(!showReplyInput)}
                            className="comment-action"
                        >
                            <Reply size={14} />
                            <span>Reply</span>
                        </button>
                    </div>
                    
                    {showReplyInput && (
                        <div className="reply-input">
                            <textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Write a reply..."
                                rows={2}
                            />
                            <div className="reply-actions">
                                <button onClick={() => setShowReplyInput(false)}>Cancel</button>
                                <button onClick={handleReply}>Reply</button>
                            </div>
                        </div>
                    )}
                    
                    {comment.replies && comment.replies.length > 0 && (
                        <div className="replies-section">
                            <button 
                                onClick={() => toggleReplies(comment.id)}
                                className="toggle-replies"
                            >
                                {expandedReplies[comment.id] ? (
                                    <><ChevronUp size={14} /> Hide replies</>
                                ) : (
                                    <><ChevronDown size={14} /> Show {comment.replies.length} replies</>
                                )}
                            </button>
                            
                            {expandedReplies[comment.id] && (
                                <div className="replies-list">
                                    {comment.replies.map(reply => (
                                        <CommentItem key={reply.id} comment={reply} isReply={true} />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
                
                <style jsx>{`
                    .comment-item {
                        display: flex;
                        gap: 0.75rem;
                        margin-bottom: 1rem;
                    }
                    
                    .comment-item.reply {
                        margin-left: 2.5rem;
                    }
                    
                    .avatar {
                        width: 36px;
                        height: 36px;
                        border-radius: 50%;
                        background: linear-gradient(135deg, #8b5cf6, #6366f1);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: white;
                        font-weight: 600;
                        font-size: 14px;
                    }
                    
                    .comment-body {
                        flex: 1;
                    }
                    
                    .comment-header {
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                        margin-bottom: 0.25rem;
                    }
                    
                    .comment-author {
                        font-weight: 600;
                        font-size: 0.875rem;
                        color: var(--text-primary);
                    }
                    
                    .comment-time {
                        font-size: 0.75rem;
                        color: var(--text-secondary);
                    }
                    
                    .comment-content {
                        font-size: 0.875rem;
                        line-height: 1.5;
                        color: var(--text-primary);
                        margin-bottom: 0.5rem;
                    }
                    
                    .comment-actions {
                        display: flex;
                        gap: 1rem;
                    }
                    
                    .comment-action {
                        display: flex;
                        align-items: center;
                        gap: 0.25rem;
                        background: none;
                        border: none;
                        font-size: 0.75rem;
                        color: var(--text-secondary);
                        cursor: pointer;
                        padding: 0.25rem 0.5rem;
                        border-radius: 20px;
                    }
                    
                    .comment-action:hover {
                        background: var(--hover-bg);
                    }
                    
                    .reply-input {
                        margin-top: 0.5rem;
                    }
                    
                    .reply-input textarea {
                        width: 100%;
                        padding: 0.5rem;
                        border: 1px solid var(--border-color);
                        border-radius: 8px;
                        font-size: 0.875rem;
                        font-family: inherit;
                        background: var(--input-bg);
                        color: var(--text-primary);
                    }
                    
                    .reply-actions {
                        display: flex;
                        gap: 0.5rem;
                        margin-top: 0.5rem;
                    }
                    
                    .reply-actions button {
                        padding: 0.25rem 0.75rem;
                        border-radius: 16px;
                        font-size: 0.75rem;
                        cursor: pointer;
                    }
                    
                    .reply-actions button:first-child {
                        background: var(--hover-bg);
                        border: none;
                    }
                    
                    .reply-actions button:last-child {
                        background: #8b5cf6;
                        border: none;
                        color: white;
                    }
                    
                    .replies-section {
                        margin-top: 0.75rem;
                    }
                    
                    .toggle-replies {
                        display: inline-flex;
                        align-items: center;
                        gap: 0.25rem;
                        background: none;
                        border: none;
                        font-size: 0.75rem;
                        color: #8b5cf6;
                        cursor: pointer;
                        padding: 0.25rem 0;
                    }
                    
                    .replies-list {
                        margin-top: 0.75rem;
                    }
                `}</style>
            </div>
        );
    };
    
    if (loading) {
        return <div className="loading">Loading comments...</div>;
    }
    
    return (
        <div className="comment-section">
            {/* Comment Input */}
            <div className="comment-input-area">
                <div className="input-header">
                    <input
                        type="text"
                        placeholder="Your name"
                        value={userName}
                        onChange={(e) => {
                            setUserName(e.target.value);
                            localStorage.setItem('comment_name', e.target.value);
                        }}
                        className="name-input"
                    />
                </div>
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    rows={3}
                    className="comment-textarea"
                />
                <button 
                    onClick={() => handleSubmitComment()}
                    disabled={!newComment.trim() || !userName.trim()}
                    className="submit-comment"
                >
                    Post Comment
                </button>
            </div>
            
            {/* Comments List */}
            <div className="comments-list">
                {comments.length === 0 ? (
                    <div className="no-comments">
                        <p>No comments yet. Be the first!</p>
                    </div>
                ) : (
                    comments.map(comment => (
                        <CommentItem key={comment.id} comment={comment} />
                    ))
                )}
            </div>
            
            <style jsx>{`
                .comment-section {
                    margin-top: 1rem;
                }
                
                .comment-input-area {
                    margin-bottom: 1.5rem;
                }
                
                .input-header {
                    margin-bottom: 0.5rem;
                }
                
                .name-input {
                    padding: 0.5rem;
                    border: 1px solid var(--border-color);
                    border-radius: 8px;
                    font-size: 0.875rem;
                    width: 200px;
                    background: var(--input-bg);
                    color: var(--text-primary);
                }
                
                .comment-textarea {
                    width: 100%;
                    padding: 0.75rem;
                    border: 1px solid var(--border-color);
                    border-radius: 12px;
                    font-size: 0.875rem;
                    font-family: inherit;
                    resize: vertical;
                    background: var(--input-bg);
                    color: var(--text-primary);
                    margin-bottom: 0.5rem;
                }
                
                .comment-textarea:focus {
                    outline: none;
                    border-color: #8b5cf6;
                }
                
                .submit-comment {
                    padding: 0.5rem 1.5rem;
                    background: #8b5cf6;
                    color: white;
                    border: none;
                    border-radius: 40px;
                    font-size: 0.875rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                
                .submit-comment:hover:not(:disabled) {
                    background: #7c3aed;
                    transform: scale(1.02);
                }
                
                .submit-comment:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                
                .no-comments {
                    text-align: center;
                    padding: 2rem;
                    color: var(--text-secondary);
                }
                
                .loading {
                    text-align: center;
                    padding: 1rem;
                    color: var(--text-secondary);
                }
            `}</style>
        </div>
    );
}