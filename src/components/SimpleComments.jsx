// components/SimpleComments.jsx
import { useState, useEffect, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '../lib/supabase';

export default function SimpleComments({ postId, currentUser, isAdmin = false }) {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [userName, setUserName] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [replyCommentId, setReplyCommentId] = useState(null);
    const [adminReplyText, setAdminReplyText] = useState('');
    const [likedComments, setLikedComments] = useState(new Set());
    const [showNamePrompt, setShowNamePrompt] = useState(true);
    
    // Check if user has saved name in localStorage
    useEffect(() => {
        const savedName = localStorage.getItem('commenter_name');
        const savedEmail = localStorage.getItem('commenter_email');
        if (savedName) {
            setUserName(savedName);
            setUserEmail(savedEmail || '');
            setShowNamePrompt(false);
        }
    }, []);

    useEffect(() => {
        fetchComments();
        
        // Real-time subscription for new comments
        const subscription = supabase
            .channel(`comments:${postId}`)
            .on('postgres_changes', 
                { 
                    event: '*', 
                    schema: 'public', 
                    table: 'post_comments', 
                    filter: `post_id=eq.${postId}` 
                },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        addCommentToState(payload.new);
                    } else if (payload.eventType === 'UPDATE') {
                        updateCommentInState(payload.new);
                    }
                }
            )
            .subscribe();
            
        return () => subscription.unsubscribe();
    }, [postId]);

    const fetchComments = async () => {
        setLoading(true);
        
        const { data, error } = await supabase
            .from('post_comments')
            .select('*')
            .eq('post_id', postId)
            .eq('status', 'approved')
            .order('created_at', { ascending: false });
        
        if (!error) {
            setComments(data);
            // Load liked status from localStorage
            const liked = JSON.parse(localStorage.getItem(`liked_comments_${postId}`) || '[]');
            setLikedComments(new Set(liked));
        }
        
        setLoading(false);
    };

    const addCommentToState = (newComment) => {
        setComments(prev => [newComment, ...prev]);
    };

    const updateCommentInState = (updatedComment) => {
        setComments(prev => prev.map(c => 
            c.id === updatedComment.id ? updatedComment : c
        ));
    };

    const saveUserName = () => {
        if (!userName.trim()) {
            alert('Please enter your name');
            return;
        }
        localStorage.setItem('commenter_name', userName);
        localStorage.setItem('commenter_email', userEmail);
        setShowNamePrompt(false);
    };

    const submitComment = async () => {
        if (!newComment.trim()) {
            alert('Please write a comment');
            return;
        }
        
        if (!userName.trim()) {
            setShowNamePrompt(true);
            return;
        }
        
        const comment = {
            post_id: postId,
            user_name: userName,
            user_email: userEmail || null,
            content: newComment,
            status: isAdmin ? 'approved' : 'pending' // Admin comments auto-approve
        };
        
        const { data, error } = await supabase
            .from('post_comments')
            .insert([comment])
            .select()
            .single();
        
        if (!error) {
            setNewComment('');
            if (!isAdmin) {
                alert('Your comment has been submitted and will appear after approval');
            }
            fetchComments(); // Refresh to show new comment
        } else {
            alert('Error posting comment: ' + error.message);
        }
    };

    const likeComment = async (commentId) => {
        if (likedComments.has(commentId)) {
            // Unlike
            const { error } = await supabase.rpc('decrement_comment_likes', {
                comment_id: commentId
            });
            
            if (!error) {
                const newLiked = new Set(likedComments);
                newLiked.delete(commentId);
                setLikedComments(newLiked);
                localStorage.setItem(`liked_comments_${postId}`, JSON.stringify([...newLiked]));
                
                // Update local state
                setComments(prev => prev.map(c => 
                    c.id === commentId ? { ...c, likes: (c.likes || 1) - 1 } : c
                ));
            }
        } else {
            // Like
            const { error } = await supabase.rpc('increment_comment_likes', {
                comment_id: commentId
            });
            
            if (!error) {
                const newLiked = new Set(likedComments);
                newLiked.add(commentId);
                setLikedComments(newLiked);
                localStorage.setItem(`liked_comments_${postId}`, JSON.stringify([...newLiked]));
                
                // Update local state
                setComments(prev => prev.map(c => 
                    c.id === commentId ? { ...c, likes: (c.likes || 0) + 1 } : c
                ));
            }
        }
    };

    const submitAdminReply = async (commentId) => {
        if (!adminReplyText.trim()) return;
        
        const { error } = await supabase
            .from('post_comments')
            .update({
                admin_reply: adminReplyText,
                admin_replied_at: new Date().toISOString(),
                admin_name: currentUser?.name || 'Admin'
            })
            .eq('id', commentId);
        
        if (!error) {
            setReplyCommentId(null);
            setAdminReplyText('');
            fetchComments();
        }
    };

    const deleteComment = async (commentId) => {
        if (!confirm('Delete this comment?')) return;
        
        const { error } = await supabase
            .from('post_comments')
            .update({ status: 'hidden' })
            .eq('id', commentId);
        
        if (!error) {
            fetchComments();
        }
    };

    return (
        <div className="comments-container">
            <style jsx>{`
                .comments-container {
                    max-width: 800px;
                    margin: 0 auto;
                }
                
                .comments-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                    padding-bottom: 16px;
                    border-bottom: 2px solid rgba(255,255,255,0.1);
                }
                
                .comments-title {
                    font-size: 20px;
                    font-weight: 700;
                }
                
                .comments-count {
                    color: #8b5cf6;
                    font-weight: 600;
                }
                
                /* Name Prompt Modal */
                .name-prompt {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.9);
                    backdrop-filter: blur(20px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                }
                
                .name-prompt-content {
                    background: #1a1a1a;
                    padding: 32px;
                    border-radius: 24px;
                    max-width: 400px;
                    width: 90%;
                }
                
                .name-prompt input {
                    width: 100%;
                    padding: 12px 16px;
                    margin: 12px 0;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 12px;
                    color: white;
                }
                
                /* Comment Form */
                .comment-form {
                    background: #0f0f0f;
                    border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 20px;
                    padding: 20px;
                    margin-bottom: 32px;
                }
                
                .comment-form textarea {
                    width: 100%;
                    padding: 16px;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 16px;
                    color: white;
                    font-family: inherit;
                    font-size: 14px;
                    resize: vertical;
                    margin-bottom: 16px;
                }
                
                .comment-form textarea:focus {
                    outline: none;
                    border-color: #8b5cf6;
                }
                
                .form-actions {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .user-info {
                    display: flex;
                    gap: 12px;
                    font-size: 13px;
                    color: #a1a1aa;
                }
                
                .user-info span {
                    color: #8b5cf6;
                }
                
                .submit-btn {
                    padding: 10px 24px;
                    background: linear-gradient(135deg, #8b5cf6, #6366f1);
                    border: none;
                    border-radius: 40px;
                    color: white;
                    font-weight: 600;
                    cursor: pointer;
                }
                
                /* Comment Card */
                .comment-card {
                    background: #0f0f0f;
                    border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 20px;
                    padding: 20px;
                    margin-bottom: 16px;
                    transition: all 0.2s;
                }
                
                .comment-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 12px;
                }
                
                .commenter-info {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                
                .commenter-avatar {
                    width: 40px;
                    height: 40px;
                    background: linear-gradient(135deg, #8b5cf6, #ec4899);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    font-size: 16px;
                }
                
                .commenter-name {
                    font-weight: 600;
                    font-size: 15px;
                }
                
                .comment-time {
                    font-size: 11px;
                    color: #52525b;
                }
                
                .comment-content {
                    margin-bottom: 16px;
                    line-height: 1.6;
                    color: #d4d4d8;
                }
                
                .comment-actions {
                    display: flex;
                    gap: 20px;
                    align-items: center;
                }
                
                .like-btn {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    background: none;
                    border: none;
                    color: #a1a1aa;
                    cursor: pointer;
                    font-size: 13px;
                }
                
                .like-btn.liked {
                    color: #ef4444;
                }
                
                .reply-btn, .delete-btn {
                    background: none;
                    border: none;
                    color: #a1a1aa;
                    cursor: pointer;
                    font-size: 13px;
                }
                
                .reply-btn:hover {
                    color: #8b5cf6;
                }
                
                .delete-btn:hover {
                    color: #ef4444;
                }
                
                /* Admin Reply Section */
                .admin-reply {
                    margin-top: 16px;
                    padding-top: 16px;
                    border-top: 1px solid rgba(255,255,255,0.06);
                    background: rgba(139,92,246,0.05);
                    border-radius: 12px;
                    padding: 16px;
                }
                
                .admin-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    background: rgba(139,92,246,0.2);
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 11px;
                    font-weight: 600;
                    color: #8b5cf6;
                    margin-bottom: 8px;
                }
                
                .admin-reply-content {
                    color: #a1a1aa;
                    font-size: 14px;
                    line-height: 1.5;
                }
                
                .reply-form {
                    margin-top: 12px;
                    display: flex;
                    gap: 12px;
                }
                
                .reply-form input {
                    flex: 1;
                    padding: 10px 14px;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 40px;
                    color: white;
                }
                
                .empty-state {
                    text-align: center;
                    padding: 60px 20px;
                    color: #52525b;
                }
                
                .loading-spinner {
                    text-align: center;
                    padding: 40px;
                    color: #52525b;
                }
            `}</style>

            {/* Name Prompt Modal */}
            {showNamePrompt && (
                <div className="name-prompt">
                    <div className="name-prompt-content">
                        <h3 style={{ marginBottom: '16px' }}>Join the conversation</h3>
                        <p style={{ color: '#a1a1aa', fontSize: '13px', marginBottom: '20px' }}>
                            Please enter your name to comment
                        </p>
                        <input
                            type="text"
                            placeholder="Your name"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            autoFocus
                        />
                        <input
                            type="email"
                            placeholder="Email (optional, for notifications)"
                            value={userEmail}
                            onChange={(e) => setUserEmail(e.target.value)}
                        />
                        <button 
                            onClick={saveUserName}
                            style={{ marginTop: '20px', width: '100%', padding: '12px', background: '#8b5cf6', border: 'none', borderRadius: '40px', color: 'white', fontWeight: 600, cursor: 'pointer' }}
                        >
                            Continue
                        </button>
                    </div>
                </div>
            )}

            {/* Comments Header */}
            <div className="comments-header">
                <div className="comments-title">
                    💬 Discussion 
                    <span className="comments-count"> ({comments.length})</span>
                </div>
            </div>

            {/* Comment Form */}
            <div className="comment-form">
                <textarea
                    placeholder="What are your thoughts?"
                    rows="3"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                />
                <div className="form-actions">
                    <div className="user-info">
                        Commenting as <span>{userName || 'Guest'}</span>
                        <button 
                            onClick={() => setShowNamePrompt(true)}
                            style={{ background: 'none', border: 'none', color: '#8b5cf6', cursor: 'pointer' }}
                        >
                            (change)
                        </button>
                    </div>
                    <button className="submit-btn" onClick={submitComment}>
                        Post Comment
                    </button>
                </div>
            </div>

            {/* Comments List */}
            {loading ? (
                <div className="loading-spinner">Loading comments...</div>
            ) : comments.length === 0 ? (
                <div className="empty-state">
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>💭</div>
                    <div>No comments yet. Start the conversation!</div>
                </div>
            ) : (
                comments.map((comment) => (
                    <div key={comment.id} className="comment-card">
                        <div className="comment-header">
                            <div className="commenter-info">
                                <div className="commenter-avatar">
                                    {comment.user_name?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div className="commenter-name">{comment.user_name}</div>
                                    <div className="comment-time">
                                        {formatDistanceToNow(new Date(comment.created_at))} ago
                                    </div>
                                </div>
                            </div>
                            <div className="comment-actions">
                                <button 
                                    className={`like-btn ${likedComments.has(comment.id) ? 'liked' : ''}`}
                                    onClick={() => likeComment(comment.id)}
                                >
                                    {likedComments.has(comment.id) ? '❤️' : '🤍'} {comment.likes || 0}
                                </button>
                                <button 
                                    className="reply-btn"
                                    onClick={() => setReplyCommentId(replyCommentId === comment.id ? null : comment.id)}
                                >
                                    💬 Reply
                                </button>
                                {isAdmin && (
                                    <button 
                                        className="delete-btn"
                                        onClick={() => deleteComment(comment.id)}
                                    >
                                        🗑️ Delete
                                    </button>
                                )}
                            </div>
                        </div>
                        
                        <div className="comment-content">
                            {comment.content}
                        </div>

                        {/* Admin Reply Button for non-admin users */}
                        {!isAdmin && !comment.admin_reply && (
                            <button 
                                className="reply-btn"
                                onClick={() => setReplyCommentId(replyCommentId === comment.id ? null : comment.id)}
                                style={{ fontSize: '12px', marginTop: '8px' }}
                            >
                                Ask Admin for reply
                            </button>
                        )}

                        {/* Admin Reply Form */}
                        {replyCommentId === comment.id && isAdmin && (
                            <div className="reply-form">
                                <input
                                    type="text"
                                    placeholder="Write your reply as admin..."
                                    value={adminReplyText}
                                    onChange={(e) => setAdminReplyText(e.target.value)}
                                    autoFocus
                                />
                                <button 
                                    onClick={() => submitAdminReply(comment.id)}
                                    style={{ padding: '10px 20px', background: '#8b5cf6', border: 'none', borderRadius: '40px', color: 'white', cursor: 'pointer' }}
                                >
                                    Reply
                                </button>
                                <button 
                                    onClick={() => setReplyCommentId(null)}
                                    style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '40px', color: 'white', cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                            </div>
                        )}

                        {/* Admin Reply Display */}
                        {comment.admin_reply && (
                            <div className="admin-reply">
                                <div className="admin-badge">
                                    <span>👑</span> {comment.admin_name || 'Admin'} replied
                                    <span style={{ fontSize: '10px', marginLeft: '8px' }}>
                                        {comment.admin_replied_at && formatDistanceToNow(new Date(comment.admin_replied_at))} ago
                                    </span>
                                </div>
                                <div className="admin-reply-content">
                                    {comment.admin_reply}
                                </div>
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
    );
}