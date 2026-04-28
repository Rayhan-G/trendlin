// src/pages/admin/comments.js
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import AdminNavigation from '../../components/admin/AdminNavigation';
import { Heart, Trash2, Reply, CheckCircle, Clock } from 'lucide-react';

export default function AdminComments() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [stats, setStats] = useState({ total: 0, pending: 0, replied: 0 });

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from('live_post_comments')
      .select('*, live_posts(title, category)')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setComments(data);
      setStats({
        total: data.length,
        pending: data.filter(c => !c.admin_reply).length,
        replied: data.filter(c => c.admin_reply).length
      });
    }
    setLoading(false);
  };

  const handleAdminReply = async (commentId) => {
    if (!replyText.trim()) return;
    const { error } = await supabase
      .from('live_post_comments')
      .update({ admin_reply: replyText, admin_replied_at: new Date().toISOString(), admin_name: 'Admin' })
      .eq('id', commentId);
    if (!error) { setReplyingTo(null); setReplyText(''); fetchComments(); }
  };

  const deleteComment = async (id) => {
    if (!confirm('Delete this comment?')) return;
    await supabase.from('live_post_comments').delete().eq('id', id);
    fetchComments();
  };

  return (
    <AdminNavigation>
      <div className="comments-page">
        <div className="page-header">
          <h1>Comment Management</h1>
          <p>Manage and respond to comments on live posts</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card"><div className="stat-icon">💬</div><div><div className="stat-value">{stats.total}</div><div className="stat-label">Total Comments</div></div></div>
          <div className="stat-card"><div className="stat-icon">⏳</div><div><div className="stat-value">{stats.pending}</div><div className="stat-label">Pending Reply</div></div></div>
          <div className="stat-card"><div className="stat-icon">✅</div><div><div className="stat-value">{stats.replied}</div><div className="stat-label">Replied</div></div></div>
        </div>

        <div className="comments-list">
          {loading ? <div className="loading">Loading comments...</div> : comments.length === 0 ? <div className="empty">No comments yet</div> : comments.map(comment => (
            <div key={comment.id} className="comment-card">
              <div className="comment-header">
                <div><div className="commenter-name">{comment.user_name}</div><div className="comment-meta">on {comment.live_posts?.title} • {comment.live_posts?.category}</div></div>
                <div className="comment-actions">
                  <button className="action-btn delete" onClick={() => deleteComment(comment.id)}><Trash2 size={14} /> Delete</button>
                  <button className="action-btn reply" onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}><Reply size={14} /> Reply</button>
                </div>
              </div>
              <div className="comment-content">{comment.content}</div>
              {comment.admin_reply && <div className="admin-reply"><div className="admin-badge">✓ Admin Response</div>{comment.admin_reply}</div>}
              {replyingTo === comment.id && <div className="reply-form"><textarea placeholder="Write admin response..." value={replyText} onChange={(e) => setReplyText(e.target.value)} rows="2" /><div className="reply-actions"><button onClick={() => setReplyingTo(null)}>Cancel</button><button onClick={() => handleAdminReply(comment.id)}>Send Reply</button></div></div>}
            </div>
          ))}
        </div>

        <style jsx>{`
          .comments-page { padding: 2rem; max-width: 1000px; margin: 0 auto; }
          .page-header { margin-bottom: 2rem; }
          .page-header h1 { font-size: 2rem; font-weight: 700; color: #1e293b; margin-bottom: 0.25rem; }
          :global(body.dark) .page-header h1 { color: white; }
          .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 2rem; }
          .stat-card { background: white; border-radius: 16px; padding: 1rem; display: flex; align-items: center; gap: 1rem; border: 1px solid #e2e8f0; }
          :global(body.dark) .stat-card { background: #1e293b; border-color: #334155; }
          .stat-icon { font-size: 2rem; }
          .stat-value { font-size: 1.5rem; font-weight: 700; color: #1e293b; }
          :global(body.dark) .stat-value { color: white; }
          .stat-label { font-size: 0.75rem; color: #64748b; }
          .comments-list { display: flex; flex-direction: column; gap: 1rem; }
          .comment-card { background: white; border-radius: 16px; padding: 1.25rem; border: 1px solid #e2e8f0; }
          :global(body.dark) .comment-card { background: #1e293b; border-color: #334155; }
          .comment-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem; flex-wrap: wrap; gap: 0.5rem; }
          .commenter-name { font-weight: 600; color: #1e293b; }
          :global(body.dark) .commenter-name { color: white; }
          .comment-meta { font-size: 0.7rem; color: #64748b; margin-top: 0.25rem; }
          .comment-content { color: #475569; margin-bottom: 1rem; line-height: 1.5; }
          :global(body.dark) .comment-content { color: #cbd5e1; }
          .admin-reply { margin-top: 1rem; padding: 1rem; background: #f0fdf4; border-radius: 12px; border-left: 3px solid #22c55e; }
          :global(body.dark) .admin-reply { background: #064e3b; }
          .admin-badge { font-size: 0.7rem; font-weight: 600; color: #22c55e; margin-bottom: 0.5rem; }
          .reply-form { margin-top: 1rem; }
          .reply-form textarea { width: 100%; padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: 12px; background: #f8fafc; margin-bottom: 0.5rem; resize: vertical; }
          :global(body.dark) .reply-form textarea { background: #334155; border-color: #475569; color: white; }
          .reply-actions { display: flex; gap: 0.5rem; justify-content: flex-end; }
          .reply-actions button { padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer; }
          .reply-actions button:first-child { background: #f1f5f9; border: none; }
          .reply-actions button:last-child { background: #3b82f6; border: none; color: white; }
          .action-btn { display: inline-flex; align-items: center; gap: 0.25rem; padding: 0.25rem 0.5rem; background: none; border: none; border-radius: 8px; font-size: 0.7rem; cursor: pointer; }
          .action-btn.delete { color: #ef4444; }
          .action-btn.reply { color: #3b82f6; }
          .empty, .loading { text-align: center; padding: 3rem; color: #64748b; }
        `}</style>
      </div>
    </AdminNavigation>
  );
}