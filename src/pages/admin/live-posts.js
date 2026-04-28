// src/pages/admin/live-posts.js
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { 
  Plus, Edit, Trash2, Eye, Clock, Heart, MessageCircle, Share2, 
  X, AlertCircle, RefreshCw
} from 'lucide-react';

// Import the full Toolbar with media modals
import Toolbar from '../../components/editor/Toolbar';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TextStyle from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Typography from '@tiptap/extension-typography';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import LinkExtension from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';

export default function AdminLivePosts() {
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showRightBlock, setShowRightBlock] = useState(false);
  const [grammarlyEnabled, setGrammarlyEnabled] = useState(true);

  const categories = [
    { id: 'tech', name: 'Technology', icon: '⚡', color: '#3b82f6' },
    { id: 'health', name: 'Wellness', icon: '🌿', color: '#10b981' },
    { id: 'entertainment', name: 'Culture', icon: '🎭', color: '#ec4899' },
    { id: 'wealth', name: 'Capital', icon: '💰', color: '#f59e0b' },
    { id: 'world', name: 'Horizons', icon: '🌍', color: '#06b6d4' },
    { id: 'lifestyle', name: 'Aesthetic', icon: '✨', color: '#f97316' },
    { id: 'growth', name: 'Evolution', icon: '🌱', color: '#8b5cf6' }
  ];

  const [formData, setFormData] = useState({
    category: 'tech',
    media_items: []
  });

  // Initialize TipTap Editor
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Placeholder.configure({ placeholder: 'Write anything... No limits. No rules. Just create.' }),
      TextStyle, Color, Highlight, Typography, Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      LinkExtension.configure({ openOnClick: false, HTMLAttributes: { target: '_blank', rel: 'noopener noreferrer' } }),
      Image.configure({ inline: true, allowBase64: true }),
      Table.configure({ resizable: true }), TableRow, TableCell, TableHeader,
      TaskList, TaskItem.configure({ nested: true }),
    ],
    content: '',
    editorProps: { attributes: { class: 'prose prose-lg max-w-none focus:outline-none min-h-[400px] px-4 py-6' } },
  });

  const fetchPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('live_posts')
      .select('*, comments:live_post_comments(count)')
      .order('created_at', { ascending: false });

    if (!error) setPosts(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, []);

  const savePost = async () => {
    setSaving(true);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const postData = {
      category: formData.category,
      title: title || null,
      content: editor?.getHTML() || null,
      media_items: formData.media_items || [],
      expires_at: expiresAt.toISOString(),
      updated_at: now.toISOString()
    };

    let result;
    if (editingPost) {
      result = await supabase
        .from('live_posts')
        .update(postData)
        .eq('id', editingPost.id);
    } else {
      postData.published_at = now.toISOString();
      postData.status = 'active';
      postData.likes = 0;
      postData.shares = 0;
      postData.liked_by = [];
      result = await supabase.from('live_posts').insert([postData]);
    }

    if (!result.error) {
      alert(editingPost ? 'Post updated!' : 'Post created!');
      setShowCreateModal(false);
      setEditingPost(null);
      setTitle('');
      if (editor) editor.commands.setContent('');
      setFormData({ category: 'tech', media_items: [] });
      fetchPosts();
    } else {
      alert('Error: ' + result.error.message);
    }
    setSaving(false);
  };

  const deletePost = async (id) => {
    await supabase.from('live_posts').delete().eq('id', id);
    fetchPosts();
    setShowDeleteConfirm(null);
  };

  const forceExpire = async (id) => {
    await supabase.from('live_posts').update({ status: 'expired', expires_at: new Date().toISOString() }).eq('id', id);
    fetchPosts();
  };

  const getTimeRemaining = (expiresAt) => {
    const diff = new Date(expiresAt) - new Date();
    if (diff <= 0) return 'Expired';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % 3600000) / 60000);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const editPost = (post) => {
    setEditingPost(post);
    setTitle(post.title || '');
    if (editor && post.content) editor.commands.setContent(post.content);
    setFormData({ category: post.category, media_items: post.media_items || [] });
    setShowCreateModal(true);
  };

  const isActive = (post) => post.status === 'active' && new Date(post.expires_at) > new Date();

  const getWordCount = () => {
    const text = editor?.getText() || '';
    return text.trim().split(/\s+/).filter(w => w.length > 0).length;
  };

  const getReadingTime = () => Math.max(1, Math.ceil(getWordCount() / 200));

  return (
    <>
      <Head><title>Admin | Live Posts Manager</title></Head>
      <div className="admin-container">
        <div className="admin-header">
          <div><h1>Live Posts Manager</h1><p>Create 24-hour posts. No limits. Anything goes.</p></div>
          <button className="create-btn" onClick={() => { setEditingPost(null); setTitle(''); if(editor) editor.commands.setContent(''); setFormData({ category: 'tech', media_items: [] }); setShowCreateModal(true); }}><Plus size={18} /> New Live Post</button>
        </div>

        <div className="stats-grid">
          <div className="stat-card"><div className="stat-icon purple">⚡</div><div><div className="stat-value">{posts.filter(p => isActive(p)).length}</div><div className="stat-label">Active Posts</div></div></div>
          <div className="stat-card"><div className="stat-icon blue">📝</div><div><div className="stat-value">{posts.length}</div><div className="stat-label">Total Posts</div></div></div>
          <div className="stat-card"><div className="stat-icon green">❤️</div><div><div className="stat-value">{posts.reduce((sum, p) => sum + (p.likes || 0), 0)}</div><div className="stat-label">Total Likes</div></div></div>
          <div className="stat-card"><div className="stat-icon orange">💬</div><div><div className="stat-value">{posts.reduce((sum, p) => sum + (p.comments?.length || 0), 0)}</div><div className="stat-label">Total Comments</div></div></div>
        </div>

        <div className="posts-table-container">
          {loading ? <div className="loading-state">Loading...</div> : posts.length === 0 ? <div className="empty-state"><span className="empty-icon">📭</span><h3>No live posts yet</h3><button className="create-btn" onClick={() => setShowCreateModal(true)}><Plus size={18} /> Create Post</button></div> : (
            <table className="posts-table">
              <thead><tr><th>Post</th><th>Category</th><th>Status</th><th>Engagement</th><th>Time Left</th><th>Actions</th></tr></thead>
              <tbody>
                {posts.map((post) => {
                  const active = isActive(post);
                  const timeLeft = getTimeRemaining(post.expires_at);
                  const category = categories.find(c => c.id === post.category);
                  const isUrgent = active && new Date(post.expires_at) - new Date() < 3600000;
                  return (
                    <tr key={post.id} className={!active ? 'expired-row' : ''}>
                      <td className="post-cell"><div className="post-preview">{post.media_items?.[0] && <img src={post.media_items[0].url} alt="" className="post-thumb" />}<div><div className="post-title">{post.title || 'Untitled'}</div><div className="post-description-preview">{post.content?.substring(0, 60)?.replace(/<[^>]*>/g, '') || 'No content'}...</div></div></div></td>
                      <td><span className="category-badge" style={{ background: `${category?.color}20`, color: category?.color }}>{category?.icon} {category?.name}</span></td>
                      <td><span className={`status-badge ${active ? 'active' : 'expired'}`}>{active ? '● Active' : '○ Expired'}</span></td>
                      <td><div className="engagement-stats"><span><Heart size={12} /> {post.likes || 0}</span><span><MessageCircle size={12} /> {post.comments?.length || 0}</span><span><Share2 size={12} /> {post.shares || 0}</span></div></td>
                      <td><div className={`time-cell ${isUrgent ? 'urgent' : ''}`}><Clock size={12} /><span>{active ? timeLeft : '—'}</span></div></td>
                      <td><div className="action-buttons"><button className="action-btn view" onClick={() => window.open(`/live-posts/${post.category}`, '_blank')}><Eye size={16} /></button><button className="action-btn edit" onClick={() => editPost(post)}><Edit size={16} /></button>{active && <button className="action-btn expire" onClick={() => forceExpire(post.id)}><Clock size={16} /></button>}<button className="action-btn delete" onClick={() => setShowDeleteConfirm(post.id)}><Trash2 size={16} /></button></div></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Create/Edit Modal with FULL TOOLBAR */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h2>{editingPost ? 'Edit Post' : 'Create New Post'}</h2><button className="close-btn" onClick={() => setShowCreateModal(false)}><X size={20} /></button></div>
            <div className="modal-body">
              <div className="form-group"><label>Category</label><select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="form-select">{categories.map(cat => (<option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>))}</select></div>
              <div className="form-group"><label>Title (Optional)</label><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Any title you want..." className="form-input" /></div>
              
              {/* FULL TOOLBAR WITH MEDIA MODALS */}
              <Toolbar editor={editor} onSave={() => {}} onSchedule={() => {}} onPublish={() => {}} onPreview={() => {}} wordCount={getWordCount()} readingTime={getReadingTime()} seoScore={0} showRightBlock={showRightBlock} onToggleRightBlock={() => setShowRightBlock(!showRightBlock)} grammarlyEnabled={grammarlyEnabled} onToggleGrammarly={() => setGrammarlyEnabled(!grammarlyEnabled)} />
              
              {/* EDITOR CONTENT - Write anything, no limits */}
              <EditorContent editor={editor} className="min-h-[400px]" />
              <p className="hint">✨ Write anything. Add images, videos, audio, PDFs, embeds, galleries. No limits. No rules.</p>
            </div>
            <div className="modal-footer"><button className="cancel-btn" onClick={() => setShowCreateModal(false)}>Cancel</button><button className="save-btn" onClick={savePost} disabled={saving}>{saving ? 'Saving...' : (editingPost ? 'Update' : 'Publish (24h)')}</button></div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (<div className="modal-overlay" onClick={() => setShowDeleteConfirm(null)}><div className="confirm-modal" onClick={(e) => e.stopPropagation()}><div className="confirm-icon">⚠️</div><h3>Delete Post?</h3><p>This cannot be undone.</p><div className="confirm-actions"><button className="cancel-btn" onClick={() => setShowDeleteConfirm(null)}>Cancel</button><button className="delete-btn" onClick={() => deletePost(showDeleteConfirm)}>Delete Forever</button></div></div></div>)}

      <style jsx>{`
        .admin-container { max-width: 1400px; margin: 0 auto; padding: 2rem; min-height: 100vh; background: #050505; }
        .admin-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; }
        .admin-header h1 { font-size: 2rem; font-weight: 700; color: white; margin-bottom: 0.25rem; }
        .admin-header p { color: #64748b; }
        .create-btn { display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem; background: linear-gradient(135deg, #8b5cf6, #6366f1); border: none; border-radius: 40px; color: white; font-weight: 600; cursor: pointer; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
        .stat-card { background: #0f0f0f; border: 1px solid #1e293b; border-radius: 20px; padding: 1.25rem; display: flex; align-items: center; gap: 1rem; }
        .stat-icon { width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; }
        .stat-icon.purple { background: rgba(139,92,246,0.2); }
        .stat-icon.blue { background: rgba(59,130,246,0.2); }
        .stat-icon.green { background: rgba(34,197,94,0.2); }
        .stat-icon.orange { background: rgba(245,158,11,0.2); }
        .stat-value { font-size: 1.75rem; font-weight: 700; color: white; }
        .stat-label { font-size: 0.75rem; color: #64748b; }
        .posts-table-container { background: #0f0f0f; border: 1px solid #1e293b; border-radius: 20px; overflow-x: auto; }
        .posts-table { width: 100%; border-collapse: collapse; }
        .posts-table th { text-align: left; padding: 1rem; color: #64748b; font-weight: 500; border-bottom: 1px solid #1e293b; }
        .posts-table td { padding: 1rem; border-bottom: 1px solid #1e293b; }
        .expired-row { opacity: 0.6; }
        .post-cell { min-width: 300px; }
        .post-preview { display: flex; gap: 0.75rem; align-items: center; }
        .post-thumb { width: 50px; height: 50px; border-radius: 12px; object-fit: cover; }
        .post-title { font-weight: 600; color: white; margin-bottom: 0.25rem; }
        .post-description-preview { font-size: 0.75rem; color: #64748b; }
        .category-badge { display: inline-flex; align-items: center; gap: 0.25rem; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.75rem; font-weight: 500; }
        .status-badge { display: inline-flex; align-items: center; gap: 0.25rem; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.75rem; font-weight: 500; }
        .status-badge.active { background: rgba(34,197,94,0.2); color: #22c55e; }
        .status-badge.expired { background: rgba(100,116,139,0.2); color: #64748b; }
        .engagement-stats { display: flex; gap: 1rem; font-size: 0.75rem; color: #64748b; }
        .engagement-stats span { display: flex; align-items: center; gap: 0.25rem; }
        .time-cell { display: flex; align-items: center; gap: 0.5rem; font-family: monospace; font-size: 0.875rem; color: #fbbf24; }
        .time-cell.urgent { color: #ef4444; animation: pulse 1s infinite; }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.7; } }
        .action-buttons { display: flex; gap: 0.5rem; }
        .action-btn { padding: 0.5rem; background: rgba(255,255,255,0.05); border: none; border-radius: 8px; color: #64748b; cursor: pointer; }
        .action-btn.view:hover { color: #3b82f6; }
        .action-btn.edit:hover { color: #f59e0b; }
        .action-btn.expire:hover { color: #fbbf24; }
        .action-btn.delete:hover { color: #ef4444; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.95); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .modal-content { background: #0f0f0f; border: 1px solid #1e293b; border-radius: 24px; width: 90%; max-width: 900px; max-height: 85vh; overflow-y: auto; }
        .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem; border-bottom: 1px solid #1e293b; }
        .modal-header h2 { color: white; font-size: 1.5rem; }
        .close-btn { background: none; border: none; color: #64748b; cursor: pointer; }
        .modal-body { padding: 1.5rem; }
        .form-group { margin-bottom: 1.5rem; }
        .form-group label { display: block; color: #e2e8f0; font-weight: 500; margin-bottom: 0.5rem; }
        .form-input, .form-select { width: 100%; padding: 0.75rem; background: rgba(255,255,255,0.05); border: 1px solid #1e293b; border-radius: 12px; color: white; }
        .hint { font-size: 0.75rem; color: #64748b; margin-top: 0.5rem; text-align: center; }
        .modal-footer { display: flex; gap: 1rem; padding: 1.5rem; border-top: 1px solid #1e293b; }
        .cancel-btn, .save-btn, .delete-btn { flex: 1; padding: 0.75rem; border-radius: 40px; font-weight: 600; cursor: pointer; }
        .cancel-btn { background: rgba(255,255,255,0.05); border: 1px solid #1e293b; color: #64748b; }
        .save-btn { background: linear-gradient(135deg, #8b5cf6, #6366f1); border: none; color: white; }
        .delete-btn { background: #ef4444; border: none; color: white; }
        .confirm-modal { background: #0f0f0f; border: 1px solid #1e293b; border-radius: 24px; padding: 2rem; text-align: center; max-width: 400px; }
        .confirm-icon { font-size: 3rem; margin-bottom: 1rem; }
        .confirm-modal h3 { color: white; margin-bottom: 0.5rem; }
        .confirm-modal p { color: #64748b; margin-bottom: 1.5rem; }
        .confirm-actions { display: flex; gap: 1rem; }
        .empty-state { text-align: center; padding: 4rem; }
        .empty-icon { font-size: 4rem; display: block; margin-bottom: 1rem; }
        .empty-state h3 { color: white; margin-bottom: 0.5rem; }
        .loading-state { text-align: center; padding: 4rem; color: #64748b; }
        @media (max-width: 768px) { .admin-container { padding: 1rem; } .admin-header h1 { font-size: 1.5rem; } .stats-grid { grid-template-columns: repeat(2, 1fr); } .modal-content { max-width: 95%; } }
      `}</style>
    </>
  );
}