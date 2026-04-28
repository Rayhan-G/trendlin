// src/pages/live-posts/[category].js
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
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

// IMPORTANT: Use lowercase 'editor' - your folder name
import Toolbar from '../../components/editor/Toolbar';
import CommentSection from '../../components/frontend/CommentSection';
import { Heart, MessageCircle, Share2, Clock, Sparkles, Edit2, Save, Send, Eye } from 'lucide-react';

const categoryConfig = {
  health: { name: 'Health & Wellness', icon: '🌿', gradient: 'from-emerald-500 to-teal-500', bgGradient: 'from-emerald-50 to-teal-50', description: 'Your journey to better health starts here' },
  wealth: { name: 'Wealth & Finance', icon: '💰', gradient: 'from-amber-500 to-orange-500', bgGradient: 'from-amber-50 to-orange-50', description: 'Build your financial future' },
  tech: { name: 'Technology', icon: '⚡', gradient: 'from-blue-500 to-cyan-500', bgGradient: 'from-blue-50 to-cyan-50', description: 'Latest in tech and innovation' },
  growth: { name: 'Personal Growth', icon: '🌱', gradient: 'from-green-500 to-emerald-500', bgGradient: 'from-green-50 to-emerald-50', description: 'Become the best version of yourself' },
  entertainment: { name: 'Entertainment', icon: '🎬', gradient: 'from-pink-500 to-rose-500', bgGradient: 'from-pink-50 to-rose-50', description: 'Your daily dose of entertainment' },
  world: { name: 'World News', icon: '🌍', gradient: 'from-cyan-500 to-blue-500', bgGradient: 'from-cyan-50 to-blue-50', description: 'Global perspectives that matter' },
  lifestyle: { name: 'Lifestyle', icon: '✨', gradient: 'from-orange-500 to-red-500', bgGradient: 'from-orange-50 to-red-50', description: 'Live your best life' }
};

export default function LivePostPage() {
  const router = useRouter();
  const { category } = router.query;
  
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');
  const [showRightBlock, setShowRightBlock] = useState(false);
  
  const timerRef = useRef(null);
  const config = categoryConfig[category];

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Placeholder.configure({ placeholder: 'Write anything... No limits. Just create.' }),
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

  const fetchPost = useCallback(async () => {
    if (!category) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/live-posts?category=${category}`);
      const data = await response.json();
      if (data.post) {
        setPost(data.post);
        setTitle(data.post.title || '');
        if (editor && data.post.content) editor.commands.setContent(data.post.content);
        setComments(data.post.comments || []);
        setLiked(data.post.liked_by?.includes('visitor') || false);
      } else {
        setPost(null);
        if (editor) editor.commands.setContent('');
        setTitle('');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, [category, editor]);

  useEffect(() => { fetchPost(); }, [fetchPost]);

  useEffect(() => {
    if (!post?.expires_at) return;
    const updateTimer = () => {
      const diff = new Date(post.expires_at) - new Date();
      if (diff <= 0) { setTimeLeft('Expired'); fetchPost(); }
      else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % 3600000) / 60000);
        setTimeLeft(hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`);
      }
    };
    updateTimer();
    timerRef.current = setInterval(updateTimer, 60000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [post, fetchPost]);

  const handleLike = async () => {
    if (!post) return;
    const response = await fetch(`/api/live-posts/${post.id}/like`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: 'visitor' })
    });
    const data = await response.json();
    if (response.ok) { setLiked(data.liked); setPost(prev => ({ ...prev, likes: data.likes })); }
  };

  const handleShare = async () => {
    if (!post) return;
    await fetch(`/api/live-posts/${post.id}/share`, { method: 'POST' });
    setPost(prev => ({ ...prev, shares: (prev.shares || 0) + 1 }));
    alert('Post shared!');
  };

  const handleSave = async () => {
    if (!editor) return;
    setSaving(true);
    const response = await fetch(isEditing ? `/api/live-posts/${post.id}` : '/api/live-posts', {
      method: isEditing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, title: title || null, content: editor.getHTML() || null, status: 'draft' })
    });
    if (response.ok) {
      alert(isEditing ? 'Saved!' : 'Draft created!');
      setIsEditing(false);
      fetchPost();
    } else { alert('Failed to save'); }
    setSaving(false);
  };

  const handlePublish = async () => {
    if (!editor) return;
    setSaving(true);
    const response = await fetch(isEditing ? `/api/live-posts/${post.id}` : '/api/live-posts', {
      method: isEditing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, title: title || null, content: editor.getHTML() || null, status: 'published' })
    });
    if (response.ok) {
      alert('Published! Expires in 24 hours');
      setIsEditing(false);
      fetchPost();
    } else { alert('Failed to publish'); }
    setSaving(false);
  };

  const getWordCount = () => {
    const text = editor?.getText() || '';
    return text.trim().split(/\s+/).filter(w => w.length > 0).length;
  };

  const getReadingTime = () => Math.max(1, Math.ceil(getWordCount() / 200));

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center"><div className="text-6xl mb-4">🔍</div><h1 className="text-2xl font-bold mb-2">Category Not Found</h1><Link href="/" className="text-purple-600">← Back</Link></div>
      </div>
    );
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <>
      <Head><title>{post?.title || config.name} | ÉCLAT</title></Head>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className={`bg-gradient-to-r ${config.gradient} text-white`}>
          <div className="max-w-4xl mx-auto px-4 py-12">
            <Link href="/"><button className="mb-6 text-white/80 hover:text-white">← Back to Home</button></Link>
            <div className="flex items-center gap-4"><span className="text-6xl">{config.icon}</span><div><h1 className="text-4xl font-bold">{config.name}</h1><p className="text-white/80 mt-2">{config.description}</p></div></div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          {post && !isEditing ? (
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden">
              <div className="p-6 border-b">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2"><span className="text-2xl">{config.icon}</span><span className="text-purple-600">{config.name}</span></div>
                  {post.expires_at && <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-sm"><Clock size={14} /> {timeLeft}</div>}
                </div>
                <h1 className="text-3xl font-bold mb-4">{post.title || 'Untitled'}</h1>
                <div className="flex gap-4 text-sm text-gray-500"><span>📅 {post.published_at ? new Date(post.published_at).toLocaleDateString() : 'Draft'}</span><span>📖 {getWordCount()} words</span><span>⏱️ {getReadingTime()} min read</span></div>
              </div>
              <div className="p-6 prose max-w-none" dangerouslySetInnerHTML={{ __html: post.content || '<p class="text-gray-400 italic">No content yet.</p>' }} />
              <div className="p-6 border-t">
                <div className="flex gap-6 mb-6">
                  <button onClick={handleLike} className={`flex gap-2 ${liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}><Heart size={20} /> {post.likes || 0}</button>
                  <button className="flex gap-2 text-gray-500 hover:text-purple-500"><MessageCircle size={20} /> {comments.length}</button>
                  <button onClick={handleShare} className="flex gap-2 text-gray-500 hover:text-green-500"><Share2 size={20} /> {post.shares || 0}</button>
                </div>
                <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-purple-600 text-white rounded-xl">✏️ Edit Post</button>
              </div>
              <CommentSection postId={post.id} currentUser={{ name: 'Guest' }} isAdmin={true} />
            </div>
          ) : isEditing ? (
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden">
              <div className="p-6 border-b">
                <div className="flex items-center gap-3 mb-4"><span className="text-2xl">{config.icon}</span><span className="text-purple-600">{config.name}</span></div>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Post Title..." className="w-full text-3xl font-bold bg-transparent border-0 focus:outline-none focus:ring-0 placeholder-gray-300" />
              </div>
              <Toolbar editor={editor} onSave={handleSave} onSchedule={() => alert('Schedule')} onPublish={handlePublish} onPreview={() => { const w = window.open('', '_blank'); w.document.write(`<html><body style="padding:40px;max-width:800px;margin:0 auto">${editor?.getHTML()}</body></html>`); }} wordCount={getWordCount()} readingTime={getReadingTime()} seoScore={0} showRightBlock={showRightBlock} onToggleRightBlock={() => setShowRightBlock(!showRightBlock)} />
              <EditorContent editor={editor} className="min-h-[400px]" />
              <div className="p-6 border-t flex gap-3">
                <button onClick={() => setIsEditing(false)} className="px-6 py-2 border rounded-xl">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-gray-600 text-white rounded-xl">{saving ? 'Saving...' : 'Save Draft'}</button>
                <button onClick={handlePublish} disabled={saving} className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl">{saving ? 'Publishing...' : 'Publish (24h)'}</button>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-12 text-center">
              <div className="text-7xl mb-4">{config.icon}</div>
              <h2 className="text-2xl font-bold mb-2">No Active Post</h2>
              <p className="text-gray-500 mb-6">Create anything you want. A single word. An image. Or nothing at all.</p>
              <button onClick={() => setIsEditing(true)} className="inline-flex gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl"><Sparkles size={18} /> Create Post</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}