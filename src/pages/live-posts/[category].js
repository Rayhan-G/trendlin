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

import Toolbar from '../../components/Editor/Toolbar';
import CommentSection from '../../components/frontend/CommentSection';
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
      Placeholder.configure({ placeholder: 'Write anything... No limits, no rules. Just create.' }),
      TextStyle,
      Color,
      Highlight,
      Typography,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      LinkExtension.configure({ openOnClick: false, HTMLAttributes: { target: '_blank', rel: 'noopener noreferrer' } }),
      Image.configure({ inline: true, allowBase64: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      TaskList,
      TaskItem.configure({ nested: true }),
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

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

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

  // Save draft - NO validation, anything goes
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

  // Publish - NO validation, anything goes
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

  const handleSchedule = () => {
    alert('Schedule feature - pick date/time for publishing');
  };

  const handlePreview = () => {
    const previewWindow = window.open('', '_blank');
    previewWindow.document.write(`
      <html>
        <head>
          <title>Preview: ${title || 'Untitled'}</title>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body style="font-family: Inter, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 20px;">
          ${editor?.getHTML() || ''}
        </body>
      </html>
    `);
    previewWindow.document.close();
  };

  // Simple word count (just for display, no validation)
  const getWordCount = () => {
    const text = editor?.getText() || post?.content?.replace(/<[^>]*>/g, '') || '';
    return text.trim().split(/\s+/).filter(w => w.length > 0).length;
  };

  const getReadingTime = () => {
    const words = getWordCount();
    return Math.max(1, Math.ceil(words / 200));
  };

  const isUrgent = timeLeft && timeLeft.includes('h') && parseInt(timeLeft) < 1;

  if (!config) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Category Not Found</h1>
          <Link href="/" className="text-purple-600 hover:underline">← Back to Home</Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{post?.title || config.name} | ÉCLAT</title>
        <meta name="description" content="Create anything you want. No limits. No rules." />
      </Head>

      <div className={`min-h-screen bg-gradient-to-br ${config.bgGradient} transition-colors duration-300`}>
        {/* Header Banner */}
        <div className={`bg-gradient-to-r ${config.gradient} text-white`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Link href="/">
              <button className="mb-6 flex items-center gap-2 text-white/80 hover:text-white transition">← Back to Home</button>
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-6xl">{config.icon}</span>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold">{config.name}</h1>
                <p className="text-white/80 mt-2 text-lg">{config.description}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {post && !isEditing ? (
            // VIEW MODE - Display existing post
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden">
              <div className="p-6 md:p-8 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{config.icon}</span>
                    <span className="text-sm text-purple-600 dark:text-purple-400 font-medium">{config.name}</span>
                  </div>
                  {post.expires_at && (
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono ${isUrgent ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
                      <Clock size={14} /> <span>{timeLeft}</span>
                    </div>
                  )}
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">{post.title || 'Untitled'}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <span>📅 {post.published_at ? new Date(post.published_at).toLocaleDateString() : 'Not published'}</span>
                  <span>📖 {getWordCount()} words</span>
                  <span>⏱️ {getReadingTime()} min read</span>
                </div>
              </div>

              {/* Post Content - Rendered HTML */}
              <div className="p-6 md:p-8 prose prose-gray dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: post.content || '<p class="text-gray-500 italic">No content yet. Click Edit to add something.</p>' }} />

              {/* Media Carousel - if media exists */}
              {post.media_items?.length > 0 && (
                <div className="relative bg-black mx-6 md:mx-8 rounded-xl overflow-hidden">
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
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {post.media_items.map((_, idx) => (
                          <button key={idx} onClick={() => setCurrentSlide(idx)} className={`w-2 h-2 rounded-full transition ${idx === currentSlide ? 'w-6 bg-purple-500' : 'bg-white/50'}`} />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Engagement Section */}
              <div className="p-6 md:p-8 border-t border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-6 mb-6">
                  <button onClick={handleLike} className={`flex items-center gap-2 transition ${liked ? 'text-red-500' : 'text-gray-600 dark:text-gray-400 hover:text-red-500'}`}>
                    <Heart size={20} fill={liked ? 'currentColor' : 'none'} /> {post.likes || 0}
                  </button>
                  <button className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-purple-500 transition">
                    <MessageCircle size={20} /> {comments.length}
                  </button>
                  <button onClick={handleShare} className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-green-500 transition">
                    <Share2 size={20} /> {post.shares || 0}
                  </button>
                </div>
                <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 transition">
                  Edit Post
                </button>
              </div>

              <CommentSection postId={post.id} currentUser={{ id: 'visitor', name: 'Guest' }} isAdmin={true} />
            </div>
          ) : isEditing ? (
            // EDIT/CREATE MODE - Full Toolbar with ALL media modals
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">{config.icon}</span>
                  <span className="text-sm text-purple-600 dark:text-purple-400">{config.name}</span>
                </div>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Post Title (optional)..."
                  className="w-full text-3xl md:text-4xl font-bold bg-transparent border-0 focus:outline-none focus:ring-0 placeholder-gray-300 dark:placeholder-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* FULL TOOLBAR with ALL media modals integrated */}
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

              {/* EDITOR CONTENT - Write anything, no limits */}
              <EditorContent editor={editor} className="min-h-[500px]" />

              <div className="p-6 border-t border-gray-200 dark:border-gray-800 flex gap-3">
                <button onClick={() => setIsEditing(false)} className="px-6 py-2 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save Draft'}
                </button>
                <button onClick={handlePublish} disabled={saving} className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:opacity-90 transition disabled:opacity-50">
                  {saving ? 'Publishing...' : 'Publish (24h)'}
                </button>
              </div>
            </div>
          ) : (
            // NO POST - Create First Post
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-12 text-center">
              <div className="text-7xl mb-4">{config.icon}</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Active Post</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                Create anything you want. A single word. An image. A video. Or nothing at all.
              </p>
              <button onClick={() => setIsEditing(true)} className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:opacity-90 transition">
                <Sparkles size={18} />
                Create Post
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}