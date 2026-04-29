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

// Import Toolbar and Comment Section
import Toolbar from '../../components/editor/Toolbar';
import CommentSection from '../../components/frontend/CommentSection';

// Import all icons
import { Heart, MessageCircle, Share2, Clock, Sparkles } from 'lucide-react';

// Category Configuration
const categoryConfig = {
  health: { name: 'Health & Wellness', icon: '🌿', gradient: 'from-emerald-500 to-teal-500', bgGradient: 'from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20', description: 'Your journey to better health starts here' },
  wealth: { name: 'Wealth & Finance', icon: '💰', gradient: 'from-amber-500 to-orange-500', bgGradient: 'from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20', description: 'Build your financial future' },
  tech: { name: 'Technology', icon: '⚡', gradient: 'from-blue-500 to-cyan-500', bgGradient: 'from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20', description: 'Latest in tech and innovation' },
  growth: { name: 'Personal Growth', icon: '🌱', gradient: 'from-green-500 to-emerald-500', bgGradient: 'from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20', description: 'Become the best version of yourself' },
  entertainment: { name: 'Entertainment', icon: '🎬', gradient: 'from-pink-500 to-rose-500', bgGradient: 'from-pink-50 to-rose-50 dark:from-pink-950/20 dark:to-rose-950/20', description: 'Your daily dose of entertainment' },
  world: { name: 'World News', icon: '🌍', gradient: 'from-cyan-500 to-blue-500', bgGradient: 'from-cyan-50 to-blue-50 dark:from-cyan-950/20 dark:to-blue-950/20', description: 'Global perspectives that matter' },
  lifestyle: { name: 'Lifestyle', icon: '✨', gradient: 'from-orange-500 to-red-500', bgGradient: 'from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20', description: 'Live your best life' }
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
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showRightBlock, setShowRightBlock] = useState(false);
  const [grammarlyEnabled, setGrammarlyEnabled] = useState(true);
  
  const timerRef = useRef(null);
  const config = categoryConfig[category];

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
    editorProps: { attributes: { class: 'prose prose-lg max-w-none focus:outline-none min-h-[400px] px-4 py-6 dark:prose-invert' } },
  });

  // Fetch post
  const fetchPost = useCallback(async () => {
    if (!category) return;
    setLoading(true);
    
    try {
      const response = await fetch(`/api/live-posts?category=${category}`);
      const data = await response.json();
      
      if (data.post) {
        setPost(data.post);
        setTitle(data.post.title || '');
        if (editor && data.post.content) {
          editor.commands.setContent(data.post.content);
        }
        setComments(data.post.comments || []);
        setLiked(data.post.liked_by?.includes('visitor') || false);
      } else {
        setPost(null);
        if (editor) editor.commands.setContent('');
        setTitle('');
      }
    } catch (error) {
      console.error('Error fetching post:', error);
      setPost(null);
    } finally {
      setLoading(false);
    }
  }, [category, editor]);

  useEffect(() => { fetchPost(); }, [fetchPost]);

  // Timer countdown
  useEffect(() => {
    if (!post?.expires_at) return;
    
    const updateTimer = () => {
      const diff = new Date(post.expires_at) - new Date();
      if (diff <= 0) {
        setTimeLeft('Expired');
        fetchPost();
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (3600000)) / 60000);
        setTimeLeft(hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`);
      }
    };
    
    updateTimer();
    timerRef.current = setInterval(updateTimer, 60000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [post, fetchPost]);

  // Like handler
  const handleLike = async () => {
    if (!post) return;
    const response = await fetch(`/api/live-posts/${post.id}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: 'visitor' })
    });
    const data = await response.json();
    if (response.ok) {
      setLiked(data.liked);
      setPost(prev => ({ ...prev, likes: data.likes }));
    }
  };

  // Share handler
  const handleShare = async () => {
    if (!post) return;
    await fetch(`/api/live-posts/${post.id}/share`, { method: 'POST' });
    setPost(prev => ({ ...prev, shares: (prev.shares || 0) + 1 }));
    alert('Post shared!');
  };

  // Save draft
  const handleSave = async () => {
    if (!editor) return;
    const content = editor.getHTML();
    
    setSaving(true);
    const response = await fetch(isEditing ? `/api/live-posts/${post.id}` : '/api/live-posts', {
      method: isEditing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category,
        title: title || null,
        content: content || null,
        status: 'draft'
      })
    });
    
    if (response.ok) {
      alert(isEditing ? 'Post saved!' : 'Draft created!');
      setIsEditing(false);
      fetchPost();
    } else {
      const error = await response.json();
      alert(error.error || 'Failed to save');
    }
    setSaving(false);
  };

  // Publish
  const handlePublish = async () => {
    if (!editor) return;
    const content = editor.getHTML();
    
    setSaving(true);
    const response = await fetch(isEditing ? `/api/live-posts/${post.id}` : '/api/live-posts', {
      method: isEditing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category,
        title: title || null,
        content: content || null,
        status: 'published'
      })
    });
    
    if (response.ok) {
      alert('Post published! Will expire in 24 hours');
      setIsEditing(false);
      fetchPost();
    } else {
      const error = await response.json();
      alert(error.error || 'Failed to publish');
    }
    setSaving(false);
  };

  const handleSchedule = () => { alert('Schedule feature - pick date/time'); };
  const handlePreview = () => { const w = window.open('', '_blank'); w.document.write(`<html><head><title>Preview</title><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"><script src="https://cdn.tailwindcss.com"></script></head><body style="font-family:Inter;max-width:800px;margin:0 auto;padding:40px 20px;">${editor?.getHTML() || ''}</body></html>`); w.document.close(); };
  const getWordCount = () => { const text = editor?.getText() || post?.content?.replace(/<[^>]*>/g, '') || ''; return text.trim().split(/\s+/).filter(w => w.length > 0).length; };
  const getReadingTime = () => Math.max(1, Math.ceil(getWordCount() / 200));
  const isUrgent = timeLeft && timeLeft.includes('h') && parseInt(timeLeft) < 1;

  if (!config) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center"><div className="text-6xl mb-4">🔍</div><h1 className="text-2xl font-bold mb-2">Category Not Found</h1><Link href="/" className="text-purple-600 hover:underline">← Back</Link></div>
      </div>
    );
  }

  if (loading) {
    return <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center"><div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <>
      <Head><title>{post?.title || config.name} | ÉCLAT</title></Head>
      <div className={`min-h-screen bg-gradient-to-br ${config.bgGradient} transition-colors`}>
        {/* Header */}
        <div className={`bg-gradient-to-r ${config.gradient} text-white`}>
          <div className="max-w-4xl mx-auto px-4 py-12">
            <Link href="/"><button className="mb-6 text-white/80 hover:text-white">← Back to Home</button></Link>
            <div className="flex items-center gap-4"><span className="text-6xl">{config.icon}</span><div><h1 className="text-4xl font-bold">{config.name}</h1><p className="text-white/80 mt-2">{config.description}</p></div></div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          {post && !isEditing ? (
            // VIEW MODE
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden">
              <div className="p-6 border-b">
                <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
                  <div className="flex items-center gap-2"><span className="text-2xl">{config.icon}</span><span className="text-purple-600">{config.name}</span></div>
                  {post.expires_at && <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${isUrgent ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}><Clock size={14} /> {timeLeft}</div>}
                </div>
                <h1 className="text-3xl font-bold mb-4">{post.title || 'Untitled'}</h1>
                <div className="flex gap-4 text-sm text-gray-500"><span>📅 {post.published_at ? new Date(post.published_at).toLocaleDateString() : 'Draft'}</span><span>📖 {getWordCount()} words</span><span>⏱️ {getReadingTime()} min read</span></div>
              </div>
              <div className="p-6 prose max-w-none" dangerouslySetInnerHTML={{ __html: post.content || '<p class="text-gray-400 italic">No content yet.</p>' }} />
              
              {/* Media Carousel */}
              {post.media_items?.length > 0 && (
                <div className="relative bg-black mx-6 rounded-xl overflow-hidden">
                  <div className="relative h-[400px]">
                    {post.media_items.map((item, idx) => (
                      <div key={idx} className={`absolute inset-0 transition-opacity duration-500 ${idx === currentSlide ? 'opacity-100' : 'opacity-0'}`}>
                        {item.type === 'image' && <img src={item.url} alt="" className="w-full h-full object-contain" />}
                        {item.type === 'video' && <video src={item.url} controls className="w-full h-full object-contain" />}
                        {item.type === 'audio' && <audio src={item.url} controls className="w-full absolute bottom-0" />}
                      </div>
                    ))}
                  </div>
                  {post.media_items.length > 1 && (
                    <>
                      <button onClick={() => setCurrentSlide((currentSlide - 1 + post.media_items.length) % post.media_items.length)} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white hover:bg-purple-600 transition">←</button>
                      <button onClick={() => setCurrentSlide((currentSlide + 1) % post.media_items.length)} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white hover:bg-purple-600 transition">→</button>
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">{post.media_items.map((_, idx) => (<button key={idx} onClick={() => setCurrentSlide(idx)} className={`w-2 h-2 rounded-full transition ${idx === currentSlide ? 'w-6 bg-purple-500' : 'bg-white/50'}`} />))}</div>
                    </>
                  )}
                </div>
              )}

              <div className="p-6 border-t">
                <div className="flex gap-6 mb-6">
                  <button onClick={handleLike} className={`flex gap-2 ${liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}><Heart size={20} /> {post.likes || 0}</button>
                  <button className="flex gap-2 text-gray-500 hover:text-purple-500"><MessageCircle size={20} /> {comments.length}</button>
                  <button onClick={handleShare} className="flex gap-2 text-gray-500 hover:text-green-500"><Share2 size={20} /> {post.shares || 0}</button>
                </div>
                <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-purple-600 text-white rounded-xl">✏️ Edit Post</button>
              </div>
              <CommentSection postId={post.id} currentUser={{ id: 'visitor', name: 'Guest' }} isAdmin={true} />
            </div>
          ) : isEditing ? (
            // EDIT MODE - WITH FULL TOOLBAR
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden">
              <div className="p-6 border-b">
                <div className="flex items-center gap-3 mb-4"><span className="text-2xl">{config.icon}</span><span className="text-purple-600">{config.name}</span></div>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Post Title (optional)..." className="w-full text-3xl font-bold bg-transparent border-0 focus:outline-none placeholder-gray-300" />
              </div>
              
              {/* FULL TOOLBAR WITH ALL MEDIA MODALS */}
              <Toolbar
                editor={editor}
                onSave={handleSave}
                onSchedule={handleSchedule}
                onPublish={handlePublish}
                onPreview={handlePreview}
                wordCount={getWordCount()}
                readingTime={getReadingTime()}
                seoScore={0}
                showRightBlock={showRightBlock}
                onToggleRightBlock={() => setShowRightBlock(!showRightBlock)}
                grammarlyEnabled={grammarlyEnabled}
                onToggleGrammarly={() => setGrammarlyEnabled(!grammarlyEnabled)}
              />
              
              <EditorContent editor={editor} className="min-h-[500px]" />
              
              <div className="p-6 border-t flex gap-3">
                <button onClick={() => setIsEditing(false)} className="px-6 py-2 border rounded-xl">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-gray-600 text-white rounded-xl">{saving ? 'Saving...' : 'Save Draft'}</button>
                <button onClick={handlePublish} disabled={saving} className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl">{saving ? 'Publishing...' : 'Publish (24h)'}</button>
              </div>
            </div>
          ) : (
            // NO POST - CREATE NEW
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-12 text-center">
              <div className="text-7xl mb-4">{config.icon}</div>
              <h2 className="text-2xl font-bold mb-2">No Active Post</h2>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">Create anything you want. A single word. An image. A video. Or nothing at all.</p>
              <button onClick={() => setIsEditing(true)} className="inline-flex gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl"><Sparkles size={18} /> Create Post</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}