// src/pages/admin/live-posts.js
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import Head from 'next/head';
import Link from 'next/link';
import { 
  Plus, Edit, Trash2, Eye, Clock, Heart, MessageCircle, Share2, X
} from 'lucide-react';

export default function AdminLivePosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('tech');
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const categories = [
    { id: 'tech', name: 'Technology', icon: '⚡', color: '#3b82f6' },
    { id: 'health', name: 'Wellness', icon: '🌿', color: '#10b981' },
    { id: 'entertainment', name: 'Culture', icon: '🎭', color: '#ec4899' },
    { id: 'wealth', name: 'Capital', icon: '💰', color: '#f59e0b' },
    { id: 'world', name: 'Horizons', icon: '🌍', color: '#06b6d4' },
    { id: 'lifestyle', name: 'Aesthetic', icon: '✨', color: '#f97316' },
    { id: 'growth', name: 'Evolution', icon: '🌱', color: '#8b5cf6' }
  ];

  const fetchPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('live_posts')
      .select('*')
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
      category: category,
      title: title || null,
      content: content || null,
      expires_at: expiresAt.toISOString(),
      updated_at: now.toISOString(),
      published_at: now.toISOString(),
      status: 'active',
      likes: 0,
      shares: 0,
      liked_by: []
    };

    let result;
    if (editingPost) {
      result = await supabase
        .from('live_posts')
        .update(postData)
        .eq('id', editingPost.id);
    } else {
      result = await supabase.from('live_posts').insert([postData]);
    }

    if (!result.error) {
      alert(editingPost ? 'Post updated!' : 'Post created!');
      setShowCreateModal(false);
      setEditingPost(null);
      setTitle('');
      setContent('');
      setCategory('tech');
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
    setContent(post.content || '');
    setCategory(post.category);
    setShowCreateModal(true);
  };

  const isActive = (post) => post.status === 'active' && new Date(post.expires_at) > new Date();

  return (
    <>
      <Head><title>Admin | Live Posts Manager</title></Head>
      <div className="min-h-screen bg-[#050505] p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Live Posts Manager</h1>
              <p className="text-gray-500">Create 24-hour posts. No limits. Anything goes.</p>
            </div>
            <button 
              onClick={() => { setEditingPost(null); setTitle(''); setContent(''); setCategory('tech'); setShowCreateModal(true); }} 
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700"
            >
              <Plus size={18} /> New Live Post
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-[#0f0f0f] border border-gray-800 rounded-xl p-4">
              <div className="text-2xl mb-2">⚡</div>
              <div className="text-2xl font-bold text-white">{posts.filter(p => isActive(p)).length}</div>
              <div className="text-xs text-gray-500">Active Posts</div>
            </div>
            <div className="bg-[#0f0f0f] border border-gray-800 rounded-xl p-4">
              <div className="text-2xl mb-2">📝</div>
              <div className="text-2xl font-bold text-white">{posts.length}</div>
              <div className="text-xs text-gray-500">Total Posts</div>
            </div>
            <div className="bg-[#0f0f0f] border border-gray-800 rounded-xl p-4">
              <div className="text-2xl mb-2">❤️</div>
              <div className="text-2xl font-bold text-white">{posts.reduce((sum, p) => sum + (p.likes || 0), 0)}</div>
              <div className="text-xs text-gray-500">Total Likes</div>
            </div>
            <div className="bg-[#0f0f0f] border border-gray-800 rounded-xl p-4">
              <div className="text-2xl mb-2">💬</div>
              <div className="text-2xl font-bold text-white">{posts.reduce((sum, p) => sum + (p.comments?.length || 0), 0)}</div>
              <div className="text-xs text-gray-500">Total Comments</div>
            </div>
          </div>

          {/* Posts Table */}
          <div className="bg-[#0f0f0f] border border-gray-800 rounded-xl overflow-x-auto">
            {loading ? (
              <div className="text-center py-20 text-gray-500">Loading...</div>
            ) : posts.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-white text-lg mb-2">No live posts yet</h3>
                <button onClick={() => setShowCreateModal(true)} className="px-4 py-2 bg-purple-600 text-white rounded-xl">Create Post</button>
              </div>
            ) : (
              <table className="w-full">
                <thead className="border-b border-gray-800">
                  <tr className="text-left text-gray-500 text-sm">
                    <th className="p-4">Post</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Engagement</th>
                    <th className="p-4">Time Left</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((post) => {
                    const active = isActive(post);
                    const timeLeft = getTimeRemaining(post.expires_at);
                    const cat = categories.find(c => c.id === post.category);
                    return (
                      <tr key={post.id} className="border-b border-gray-800">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div>
                              <div className="text-white font-medium">{post.title || 'Untitled'}</div>
                              <div className="text-xs text-gray-500">{post.content?.substring(0, 60)?.replace(/<[^>]*>/g, '') || 'No content'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-sm">{cat?.icon} {cat?.name}</span>
                        </td>
                        <td className="p-4">
                          <span className={`text-xs px-2 py-1 rounded-full ${active ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'}`}>
                            {active ? '● Active' : '○ Expired'}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-3 text-xs text-gray-500">
                            <span>❤️ {post.likes || 0}</span>
                            <span>💬 {post.comments?.length || 0}</span>
                            <span>🔄 {post.shares || 0}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`text-sm font-mono ${active && new Date(post.expires_at) - new Date() < 3600000 ? 'text-red-500' : 'text-yellow-500'}`}>
                            {active ? timeLeft : '—'}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <button onClick={() => window.open(`/live-posts/${post.category}`, '_blank')} className="p-1.5 rounded hover:bg-gray-800"><Eye size={16} className="text-gray-500" /></button>
                            <button onClick={() => editPost(post)} className="p-1.5 rounded hover:bg-gray-800"><Edit size={16} className="text-gray-500" /></button>
                            {active && <button onClick={() => forceExpire(post.id)} className="p-1.5 rounded hover:bg-gray-800"><Clock size={16} className="text-gray-500" /></button>}
                            <button onClick={() => setShowDeleteConfirm(post.id)} className="p-1.5 rounded hover:bg-gray-800"><Trash2 size={16} className="text-gray-500" /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Create/Edit Modal - Simple version without Toolbar */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4" onClick={() => setShowCreateModal(false)}>
          <div className="bg-[#0f0f0f] border border-gray-800 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b border-gray-800">
              <h2 className="text-xl font-bold text-white">{editingPost ? 'Edit Post' : 'Create New Post'}</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-500 hover:text-white"><X size={20} /></button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-3 bg-gray-900 border border-gray-800 rounded-xl text-white">
                  {categories.map(cat => (<option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Title (Optional)</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Any title you want..." className="w-full p-3 bg-gray-900 border border-gray-800 rounded-xl text-white" />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Content</label>
                <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write anything... No limits. Just create." rows={10} className="w-full p-3 bg-gray-900 border border-gray-800 rounded-xl text-white resize-none" />
                <p className="text-xs text-gray-500 mt-2">✨ Write anything. Add images, videos, audio, PDFs, embeds using HTML. No limits. No rules.</p>
              </div>
            </div>
            
            <div className="flex gap-3 p-6 border-t border-gray-800">
              <button onClick={() => setShowCreateModal(false)} className="flex-1 px-6 py-2 border border-gray-700 rounded-xl text-gray-400">Cancel</button>
              <button onClick={savePost} disabled={saving} className="flex-1 px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl">{saving ? 'Saving...' : (editingPost ? 'Update' : 'Publish (24h)')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50" onClick={() => setShowDeleteConfirm(null)}>
          <div className="bg-[#0f0f0f] border border-gray-800 rounded-2xl p-6 max-w-md text-center" onClick={e => e.stopPropagation()}>
            <div className="text-5xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold text-white mb-2">Delete Post?</h3>
            <p className="text-gray-500 mb-6">This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 px-6 py-2 border border-gray-700 rounded-xl text-gray-400">Cancel</button>
              <button onClick={() => deletePost(showDeleteConfirm)} className="flex-1 px-6 py-2 bg-red-600 text-white rounded-xl">Delete Forever</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}