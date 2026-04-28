// src/components/frontend/CommentSection.jsx
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { formatDistanceToNow } from 'date-fns'
import { Heart, MessageCircle, Star } from 'lucide-react'

export default function CommentSection({ postId, currentUser, isAdmin }) {
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [userName, setUserName] = useState('')
  const [loading, setLoading] = useState(true)
  const [replyTo, setReplyTo] = useState(null)
  const [adminReplyText, setAdminReplyText] = useState('')

  useEffect(() => {
    fetchComments()
    
    // Load saved name
    const savedName = localStorage.getItem('commenter_name')
    if (savedName) setUserName(savedName)
  }, [postId])

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from('live_post_comments')
      .select('*')
      .eq('live_post_id', postId)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })

    if (!error) setComments(data || [])
    setLoading(false)
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return
    if (!userName.trim()) {
      alert('Please enter your name')
      return
    }

    // Save name to localStorage
    localStorage.setItem('commenter_name', userName)

    const { data, error } = await supabase
      .from('live_post_comments')
      .insert([{
        live_post_id: postId,
        user_name: userName,
        content: newComment,
        status: 'approved'
      }])
      .select()
      .single()

    if (!error) {
      setComments([data, ...comments])
      setNewComment('')
    }
  }

  const handleAdminReply = async (commentId) => {
    if (!adminReplyText.trim()) return

    const { error } = await supabase
      .from('live_post_comments')
      .update({
        admin_reply: adminReplyText,
        admin_replied_at: new Date().toISOString(),
        admin_name: isAdmin ? currentUser.name : 'Admin'
      })
      .eq('id', commentId)

    if (!error) {
      setComments(comments.map(c =>
        c.id === commentId
          ? { ...c, admin_reply: adminReplyText, admin_replied_at: new Date().toISOString() }
          : c
      ))
      setReplyTo(null)
      setAdminReplyText('')
    }
  }

  const handleLike = async (commentId) => {
    const comment = comments.find(c => c.id === commentId)
    const hasLiked = comment.liked_by?.includes(currentUser.id)

    const { error } = await supabase
      .from('live_post_comments')
      .update({
        likes: hasLiked ? (comment.likes - 1) : (comment.likes + 1),
        liked_by: hasLiked
          ? comment.liked_by.filter(id => id !== currentUser.id)
          : [...(comment.liked_by || []), currentUser.id]
      })
      .eq('id', commentId)

    if (!error) {
      setComments(comments.map(c =>
        c.id === commentId
          ? {
              ...c,
              likes: hasLiked ? c.likes - 1 : c.likes + 1,
              liked_by: hasLiked
                ? c.liked_by.filter(id => id !== currentUser.id)
                : [...(c.liked_by || []), currentUser.id]
            }
          : c
      ))
    }
  }

  if (loading) {
    return <div className="comments-loading">Loading comments...</div>
  }

  return (
    <div className="comments-section">
      <h3 className="comments-title">
        <MessageCircle size={18} />
        Discussion ({comments.length})
      </h3>

      {/* Add Comment Form */}
      <div className="add-comment">
        <input
          type="text"
          placeholder="Your name"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          className="name-input"
        />
        <textarea
          placeholder="Share your thoughts..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          rows="3"
          className="comment-input"
        />
        <button onClick={handleAddComment} className="submit-btn">
          Post Comment
        </button>
      </div>

      {/* Comments List */}
      <div className="comments-list">
        {comments.length === 0 ? (
          <div className="no-comments">
            <span>💭</span>
            <p>No comments yet. Start the conversation!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="comment-card">
              <div className="comment-header">
                <div className="commenter-info">
                  <div className="avatar">
                    {comment.user_name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="commenter-name">{comment.user_name}</div>
                    <div className="comment-time">
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </div>
                  </div>
                </div>
                <button
                  className={`like-btn ${comment.liked_by?.includes(currentUser.id) ? 'liked' : ''}`}
                  onClick={() => handleLike(comment.id)}
                >
                  <Heart size={14} />
                  <span>{comment.likes || 0}</span>
                </button>
              </div>

              <div className="comment-content">{comment.content}</div>

              {/* Admin Reply */}
              {comment.admin_reply && (
                <div className="admin-reply">
                  <div className="admin-badge">
                    <Star size={12} />
                    Admin Response
                  </div>
                  <div className="admin-reply-text">{comment.admin_reply}</div>
                  <div className="admin-reply-time">
                    {formatDistanceToNow(new Date(comment.admin_replied_at), { addSuffix: true })}
                  </div>
                </div>
              )}

              {/* Admin Reply Button */}
              {isAdmin && !comment.admin_reply && (
                <div className="admin-action">
                  {replyTo === comment.id ? (
                    <div className="reply-form">
                      <input
                        type="text"
                        placeholder="Write admin reply..."
                        value={adminReplyText}
                        onChange={(e) => setAdminReplyText(e.target.value)}
                        autoFocus
                      />
                      <button onClick={() => handleAdminReply(comment.id)}>Reply</button>
                      <button onClick={() => setReplyTo(null)}>Cancel</button>
                    </div>
                  ) : (
                    <button className="reply-btn" onClick={() => setReplyTo(comment.id)}>
                      Reply as Admin
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        .comments-section {
          margin-top: 2rem;
          padding: 1rem 0;
        }
        
        .comments-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.125rem;
          font-weight: 600;
          color: white;
          margin-bottom: 1.5rem;
        }
        
        .add-comment {
          background: #0f0f0f;
          border: 1px solid #1e293b;
          border-radius: 20px;
          padding: 1.25rem;
          margin-bottom: 2rem;
        }
        
        .name-input {
          width: 100%;
          padding: 0.75rem;
          background: rgba(255,255,255,0.05);
          border: 1px solid #1e293b;
          border-radius: 12px;
          color: white;
          margin-bottom: 1rem;
        }
        
        .comment-input {
          width: 100%;
          padding: 0.75rem;
          background: rgba(255,255,255,0.05);
          border: 1px solid #1e293b;
          border-radius: 12px;
          color: white;
          resize: vertical;
          margin-bottom: 1rem;
        }
        
        .submit-btn {
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #8b5cf6, #6366f1);
          border: none;
          border-radius: 40px;
          color: white;
          font-weight: 600;
          cursor: pointer;
        }
        
        .comments-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .comment-card {
          background: #0f0f0f;
          border: 1px solid #1e293b;
          border-radius: 20px;
          padding: 1.25rem;
        }
        
        .comment-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.75rem;
        }
        
        .commenter-info {
          display: flex;
          gap: 0.75rem;
        }
        
        .avatar {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #8b5cf6, #ec4899);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
        }
        
        .commenter-name {
          font-weight: 600;
          color: white;
        }
        
        .comment-time {
          font-size: 0.75rem;
          color: #64748b;
        }
        
        .like-btn {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          background: none;
          border: none;
          color: #64748b;
          cursor: pointer;
          font-size: 0.75rem;
        }
        
        .like-btn.liked {
          color: #ef4444;
        }
        
        .comment-content {
          color: #cbd5e1;
          line-height: 1.5;
          margin-bottom: 0.75rem;
        }
        
        .admin-reply {
          margin-top: 1rem;
          padding: 1rem;
          background: rgba(139,92,246,0.1);
          border-radius: 16px;
          border-left: 3px solid #8b5cf6;
        }
        
        .admin-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.25rem 0.5rem;
          background: #8b5cf6;
          border-radius: 20px;
          font-size: 0.7rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }
        
        .admin-reply-text {
          color: #d4d4d8;
          font-size: 0.875rem;
          margin-bottom: 0.25rem;
        }
        
        .admin-reply-time {
          font-size: 0.7rem;
          color: #64748b;
        }
        
        .admin-action {
          margin-top: 0.75rem;
        }
        
        .reply-btn {
          padding: 0.25rem 0.75rem;
          background: rgba(139,92,246,0.2);
          border: none;
          border-radius: 20px;
          color: #a78bfa;
          font-size: 0.75rem;
          cursor: pointer;
        }
        
        .reply-form {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }
        
        .reply-form input {
          flex: 1;
          padding: 0.5rem;
          background: rgba(255,255,255,0.05);
          border: 1px solid #1e293b;
          border-radius: 12px;
          color: white;
        }
        
        .reply-form button {
          padding: 0.5rem 1rem;
          background: #8b5cf6;
          border: none;
          border-radius: 12px;
          color: white;
          cursor: pointer;
        }
        
        .no-comments {
          text-align: center;
          padding: 3rem;
          color: #64748b;
        }
        
        .no-comments span {
          font-size: 3rem;
          display: block;
          margin-bottom: 1rem;
        }
        
        .comments-loading {
          text-align: center;
          padding: 2rem;
          color: #64748b;
        }
      `}</style>
    </div>
  )
}