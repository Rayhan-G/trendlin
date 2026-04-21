// src/pages/admin/posts/edit/[id].js
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  ArrowLeft, Save, Calendar, Eye, Send, FileText, 
  AlertCircle, Clock, TrendingUp, LayoutDashboard, Edit3,
  X, Image as ImageIcon, LinkIcon, 
  RefreshCw, Copy, Check, ChevronDown,
  ChevronUp, Settings, Loader2, FolderOpen
} from 'lucide-react';

// ✅ CORRECTED IMPORT PATHS (4 levels up from src/pages/admin/posts/edit/)
import { supabase } from '../../../../lib/supabase';

// ============================================================
// UTILITY FUNCTIONS
// ============================================================
const generateSlug = (text) => {
  if (!text) return 'untitled';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

const createUniqueSlug = async (title, currentId = null) => {
  let baseSlug = generateSlug(title || 'untitled');
  let uniqueSlug = baseSlug;
  let counter = 1;
  
  try {
    let exists = true;
    while (exists) {
      const { data, error } = await supabase
        .from('posts')
        .select('id')
        .eq('slug', uniqueSlug)
        .maybeSingle();
      
      if (error || !data) {
        exists = false;
      } else if (data && currentId && data.id === currentId) {
        exists = false;
      } else if (data) {
        uniqueSlug = `${baseSlug}-${counter}`;
        counter++;
      } else {
        exists = false;
      }
    }
  } catch (err) {
    console.error('Error checking slug uniqueness:', err);
  }
  
  return uniqueSlug;
};

// ============================================================
// CATEGORIES
// ============================================================
const categoryOptions = [
  'entertainment',
  'growth',
  'health',
  'lifestyle',
  'tech',
  'wealth',
  'world'
];

// ============================================================
// EDITOR SKELETON
// ============================================================
const EditorSkeleton = () => (
  <div className="h-96 flex items-center justify-center bg-gray-50 rounded-2xl border border-gray-200">
    <div className="text-center">
      <Loader2 className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-3" />
      <p className="text-gray-500 text-sm">Loading editor...</p>
    </div>
  </div>
);

// ============================================================
// DYNAMIC IMPORTS WITH CORRECT PATHS
// ============================================================
const Editor = dynamic(
  () => import('../../../../components/editor').then(mod => mod.default).catch(err => {
    console.error('Failed to load editor:', err);
    return () => <div className="p-8 text-center text-red-600">Failed to load editor. Please check console.</div>;
  }),
  { ssr: false, loading: () => <EditorSkeleton /> }
);

const ImageModal = dynamic(
  () => import('../../../../components/media/Modals/ImageModal').catch(err => {
    console.error('Failed to load ImageModal:', err);
    return () => null;
  }),
  { ssr: false }
);

// ============================================================
// PREVIEW MODAL
// ============================================================
const PreviewModal = ({ isOpen, onClose, title, content, featuredImage }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] bg-black/90 flex items-center justify-center" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-[95vw] max-w-[1200px] h-[90vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white">Post Preview</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">{title || 'Untitled'}</h1>
            {featuredImage && (
              <img src={featuredImage} alt="Featured" className="w-full rounded-lg mb-6" />
            )}
            <div 
              className="prose prose-gray dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: content || '<p class="text-gray-500">No content yet...</p>' }} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// SCHEDULE MODAL
// ============================================================
const ScheduleModal = ({ isOpen, onClose, onSchedule, currentDate }) => {
  const [date, setDate] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (currentDate) {
        const d = new Date(currentDate);
        setDate(d.toISOString().slice(0, 16));
      } else {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(9, 0, 0, 0);
        setDate(tomorrow.toISOString().slice(0, 16));
      }
    }
  }, [isOpen, currentDate]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
        <h3 className="text-xl font-semibold mb-4">Schedule Post</h3>
        <input 
          type="datetime-local" 
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full p-3 border rounded-xl mb-4" 
          min={new Date().toISOString().slice(0, 16)}
        />
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2 border rounded-xl">
            Cancel
          </button>
          <button 
            onClick={() => { if (date) onSchedule(new Date(date)); onClose(); }} 
            disabled={!date}
            className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-xl disabled:opacity-50"
          >
            Schedule
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function EditPost() {
  const router = useRouter();
  const { id } = router.query;
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form state
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('');
  const [keywords, setKeywords] = useState([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  
  // UI state
  const [showImageModal, setShowImageModal] = useState(false);
  const [postId, setPostId] = useState(null);
  const [postStatus, setPostStatus] = useState('draft');
  const [scheduledDate, setScheduledDate] = useState(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showAdvancedSEO, setShowAdvancedSEO] = useState(false);
  const [errors, setErrors] = useState({});
  const [stats, setStats] = useState({ wordCount: 0, readingTime: 0, seoScore: 0 });

  // ============================================================
  // AUTH CHECK
  // ============================================================
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const sessionToken = localStorage.getItem('admin_session_token');
        const sessionExpiry = localStorage.getItem('admin_session_expiry');
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (session || (sessionToken && sessionExpiry && Date.now() < parseInt(sessionExpiry))) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          router.push('/admin/login');
        }
      } catch (err) {
        console.error('Auth check error:', err);
        setIsAuthenticated(false);
        router.push('/admin/login');
      } finally {
        setIsCheckingAuth(false);
      }
    };
    
    checkAuth();
  }, [router]);

  // ============================================================
  // FETCH POST DATA
  // ============================================================
  useEffect(() => {
    if (id && isAuthenticated) {
      fetchPost();
    }
  }, [id, isAuthenticated]);

  const fetchPost = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setTitle(data.title || '');
        setExcerpt(data.excerpt || '');
        setContent(data.content || '');
        setFeaturedImage(data.featured_image || '');
        setSlug(data.slug || '');
        setCategory(data.category || '');
        setKeywords(data.keywords ? data.keywords.split(',') : []);
        setTags(data.tags ? data.tags.split(',') : []);
        setMetaTitle(data.meta_title || '');
        setMetaDescription(data.meta_description || '');
        setPostId(data.id);
        setPostStatus(data.status || 'draft');
        setScheduledDate(data.scheduled_for || null);
      }
    } catch (error) {
      console.error('Error fetching post:', error);
      toast.error('Failed to load post');
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================
  // SEO SCORE CALCULATION
  // ============================================================
  const calculateSEOScore = useCallback(() => {
    let score = 0;
    if (title.length >= 30 && title.length <= 60) score += 25;
    else if (title.length > 0) score += 10;
    
    if (excerpt.length >= 120 && excerpt.length <= 160) score += 15;
    else if (excerpt.length > 0) score += 5;
    
    const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).filter(w => w.length > 0).length;
    if (wordCount >= 1000) score += 25;
    else if (wordCount >= 500) score += 20;
    else if (wordCount >= 300) score += 10;
    
    if (category) score += 10;
    if (keywords.length >= 3 && keywords.length <= 8) score += 10;
    if (tags.length >= 3 && tags.length <= 10) score += 5;
    if (slug && slug !== 'untitled' && slug.length <= 60) score += 5;
    
    return Math.min(100, score);
  }, [title, excerpt, content, category, keywords, tags, slug]);

  // ============================================================
  // UPDATE STATS
  // ============================================================
  useEffect(() => {
    const plainText = content.replace(/<[^>]*>/g, '');
    const words = plainText.split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));
    const seoScore = calculateSEOScore();
    
    setStats({ wordCount, readingTime, seoScore });
    setHasUnsavedChanges(true);
  }, [content, calculateSEOScore]);

  // ============================================================
  // VALIDATION
  // ============================================================
  useEffect(() => {
    const newErrors = {};
    if (title && title.length > 120) newErrors.title = 'Title must be less than 120 characters';
    if (slug && slug.length > 100) newErrors.slug = 'Slug must be less than 100 characters';
    if (keywords.length > 10) newErrors.keywords = 'Maximum 10 keywords allowed';
    if (tags.length > 15) newErrors.tags = 'Maximum 15 tags allowed';
    setErrors(newErrors);
  }, [title, slug, keywords, tags]);

  // ============================================================
  // UNSAVED CHANGES WARNING
  // ============================================================
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // ============================================================
  // UPDATE POST
  // ============================================================
  const updatePost = useCallback(async (status, additionalData = {}) => {
    if (!postId) return false;
    
    setIsSaving(true);
    try {
      let finalSlug = slug;
      if (status === 'published' && !finalSlug) {
        finalSlug = await createUniqueSlug(title, postId);
      }
      
      const postData = {
        title,
        excerpt: excerpt || null,
        content,
        featured_image: featuredImage || null,
        slug: finalSlug || slug,
        category: category || null,
        keywords: keywords.length > 0 ? keywords.join(',') : null,
        tags: tags.length > 0 ? tags.join(',') : null,
        meta_title: metaTitle || title || null,
        meta_description: metaDescription || excerpt || null,
        status: status,
        updated_at: new Date().toISOString(),
        ...additionalData
      };
      
      const { error } = await supabase
        .from('posts')
        .update(postData)
        .eq('id', postId);
      
      if (error) throw error;
      
      setHasUnsavedChanges(false);
      return true;
    } catch (error) {
      console.error('Update error:', error);
      toast.error(`Failed to update post: ${error.message}`);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [title, excerpt, content, featuredImage, slug, category, keywords, tags, metaTitle, metaDescription, postId]);

  // ============================================================
  // SAVE DRAFT
  // ============================================================
  const handleSaveDraft = async () => {
    const success = await updatePost('draft');
    if (success) {
      toast.success('✨ Draft saved successfully!');
    }
  };

  // ============================================================
  // PUBLISH POST
  // ============================================================
  const handlePublish = async () => {
    if (!title) {
      toast.error('Please add a title before publishing');
      return;
    }
    
    if (!content || content === '<p></p>') {
      toast.error('Please add some content before publishing');
      return;
    }
    
    const success = await updatePost('published', { published_at: new Date().toISOString() });
    if (success) {
      toast.success('🎉 Post published successfully!');
      router.push('/admin/posts-manager');
    }
  };

  // ============================================================
  // SCHEDULE POST
  // ============================================================
  const handleSchedule = async (scheduledDateTime) => {
    const success = await updatePost('scheduled', { scheduled_for: scheduledDateTime.toISOString() });
    if (success) {
      setPostStatus('scheduled');
      setScheduledDate(scheduledDateTime);
      toast.success(`📅 Post scheduled for ${scheduledDateTime.toLocaleString()}`);
      router.push('/admin/posts-manager');
    }
  };

  // ============================================================
  // HANDLERS
  // ============================================================
  const handleBack = () => {
    if (hasUnsavedChanges) {
      if (confirm('You have unsaved changes. Leave anyway?')) {
        router.push('/admin/posts-manager');
      }
    } else {
      router.push('/admin/posts-manager');
    }
  };

  const handleRegenerateSlug = async () => {
    if (title) {
      const newSlug = await createUniqueSlug(title, postId);
      setSlug(newSlug);
      toast.success('Slug regenerated!');
    }
  };

  const handleCopySlug = () => {
    navigator.clipboard.writeText(slug);
    toast.success('Slug copied!');
  };

  const handleAddKeyword = (keyword) => {
    const trimmed = keyword.trim();
    if (trimmed && !keywords.includes(trimmed) && keywords.length < 10) {
      setKeywords([...keywords, trimmed]);
      setKeywordInput('');
    }
  };

  const handleAddTag = (tag) => {
    const trimmed = tag.trim();
    if (trimmed && !tags.includes(trimmed) && tags.length < 15) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleImageUpload = (imageData) => {
    if (imageData && imageData.src) {
      setFeaturedImage(imageData.src);
      toast.success('Featured image added!');
    }
    setShowImageModal(false);
  };

  // ============================================================
  // LOADING STATE
  // ============================================================
  if (isCheckingAuth || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // ============================================================
  // MAIN RENDER
  // ============================================================
  return (
    <>
      <Head>
        <title>Edit Post - Admin Dashboard</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <button onClick={handleBack} className="p-2 rounded-xl text-gray-500 hover:bg-gray-100">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="h-6 w-px bg-gray-200" />
              <button onClick={() => router.push('/admin/dashboard')} className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-gray-600 hover:bg-gray-100 text-sm">
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </button>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-100">
                <Edit3 className="w-4 h-4 text-gray-900" />
                <span className="text-sm font-medium text-gray-900">Edit Post</span>
              </div>
              {postStatus === 'published' && (
                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">Published</span>
              )}
              {postStatus === 'scheduled' && (
                <span className="px-2 py-1 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">Scheduled</span>
              )}
              {postStatus === 'draft' && (
                <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">Draft</span>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              {/* Stats */}
              <div className="hidden lg:flex items-center gap-4 px-3 py-1.5 rounded-xl bg-gray-50">
                <div className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs text-gray-600">{stats.wordCount.toLocaleString()} words</span>
                </div>
                <div className="w-px h-4 bg-gray-200" />
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs text-gray-600">{stats.readingTime} min read</span>
                </div>
                <div className="w-px h-4 bg-gray-200" />
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-gray-400" />
                  <span className={`text-xs font-semibold ${
                    stats.seoScore >= 80 ? 'text-green-600' : 
                    stats.seoScore >= 60 ? 'text-amber-600' : 'text-red-600'
                  }`}>
                    {stats.seoScore} SEO
                  </span>
                </div>
              </div>
              
              {/* Unsaved indicator */}
              {hasUnsavedChanges && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50">
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-xs text-amber-600">Unsaved</span>
                </div>
              )}
              
              <div className="h-6 w-px bg-gray-200" />
              
              {/* Action Buttons */}
              <button 
                onClick={handleSaveDraft} 
                disabled={isSaving} 
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 text-sm"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save Draft</span>
              </button>
              
              <button 
                onClick={() => setIsScheduleModalOpen(true)} 
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 text-sm"
              >
                <Calendar className="w-4 h-4" />
                <span>Schedule</span>
              </button>
              
              <button 
                onClick={() => setIsPreviewModalOpen(true)} 
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 text-sm"
              >
                <Eye className="w-4 h-4" />
                <span>Preview</span>
              </button>
              
              <button 
                onClick={handlePublish} 
                disabled={isSaving} 
                className="flex items-center gap-2 px-5 py-2 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 disabled:opacity-50 text-sm shadow-sm"
              >
                <Send className="w-4 h-4" />
                <span>Publish</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
        {/* Errors */}
        {Object.keys(errors).length > 0 && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center gap-2 text-red-800 mb-2">
              <AlertCircle className="w-5 h-5" />
              <span className="font-semibold">Please fix the following errors:</span>
            </div>
            <ul className="list-disc list-inside text-sm text-red-700">
              {Object.values(errors).map((error, idx) => <li key={idx}>{error}</li>)}
            </ul>
          </div>
        )}
        
        {/* Title */}
        <div className="mb-4">
          <input 
            type="text" 
            value={title} 
            onChange={(e) => setTitle(e.target.value.slice(0, 120))} 
            placeholder="Edit your title..." 
            className="w-full text-4xl md:text-5xl font-bold bg-transparent border-0 focus:outline-none focus:ring-0 placeholder-gray-300 text-gray-900" 
            maxLength={120} 
          />
          <div className="mt-2 text-right text-xs text-gray-400">
            {title.length}/120 characters
          </div>
        </div>

        {/* Category Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FolderOpen className="w-4 h-4 inline mr-1" />
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm capitalize"
          >
            <option value="">Select a category...</option>
            {categoryOptions.map((cat) => (
              <option key={cat} value={cat} className="capitalize">
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Excerpt */}
        <div className="mb-6">
          <textarea 
            value={excerpt} 
            onChange={(e) => setExcerpt(e.target.value.slice(0, 160))} 
            placeholder="Write a compelling excerpt (meta description)..." 
            className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 text-gray-700 text-sm resize-none" 
            rows={2} 
            maxLength={160} 
          />
          <div className="mt-1 text-right text-xs text-gray-400">{excerpt.length}/160 characters</div>
        </div>

        {/* Featured Image */}
        <div className="mb-6">
          {featuredImage ? (
            <div className="relative inline-block group">
              <img src={featuredImage} alt="Featured" className="w-32 h-32 object-cover rounded-xl border border-gray-200 shadow-sm" />
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setShowImageModal(true)} className="p-1 bg-white rounded-lg shadow-md hover:bg-gray-100">
                  <ImageIcon className="w-4 h-4 text-gray-600" />
                </button>
                <button onClick={() => setFeaturedImage('')} className="p-1 bg-white rounded-lg shadow-md hover:bg-red-50">
                  <X className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowImageModal(true)} className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200">
              <ImageIcon className="w-4 h-4" />
              Choose Featured Image
            </button>
          )}
        </div>
        
        {/* Editor Container */}
        <div className="border border-gray-200 rounded-2xl shadow-sm bg-white overflow-hidden">
          <Editor 
            content={content} 
            onChange={setContent} 
            title={title} 
            onSave={handleSaveDraft} 
            onPublish={handlePublish} 
          />
        </div>
        
        {/* Advanced SEO */}
        <div className="mt-8 p-5 bg-gray-50 rounded-2xl border border-gray-200">
          <button onClick={() => setShowAdvancedSEO(!showAdvancedSEO)} className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-gray-700" />
              <h3 className="font-semibold text-gray-900">Advanced SEO & Meta Information</h3>
            </div>
            {showAdvancedSEO ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
          </button>
          
          {showAdvancedSEO && (
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
                <input 
                  type="text" 
                  value={metaTitle} 
                  onChange={(e) => setMetaTitle(e.target.value.slice(0, 60))} 
                  placeholder="SEO Title (defaults to post title)" 
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm" 
                  maxLength={60} 
                />
                <p className="text-xs text-gray-400 mt-1">{metaTitle.length}/60 characters</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
                <textarea 
                  value={metaDescription} 
                  onChange={(e) => setMetaDescription(e.target.value.slice(0, 160))} 
                  placeholder="SEO Description (defaults to excerpt)" 
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm resize-none" 
                  rows={2} 
                  maxLength={160} 
                />
                <p className="text-xs text-gray-400 mt-1">{metaDescription.length}/160 characters</p>
              </div>
            </div>
          )}
        </div>

        {/* Keywords & Tags */}
        <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">URL Slug</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-gray-200">
                <LinkIcon className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-500">/blog/</span>
                <input 
                  type="text" 
                  value={slug} 
                  onChange={(e) => setSlug(generateSlug(e.target.value))} 
                  placeholder="your-post-slug" 
                  className="flex-1 bg-transparent focus:outline-none text-sm text-gray-900" 
                />
              </div>
              <button onClick={handleRegenerateSlug} className="p-2 bg-white rounded-xl hover:bg-gray-100">
                <RefreshCw className="w-4 h-4 text-gray-600" />
              </button>
              <button onClick={handleCopySlug} className="p-2 bg-white rounded-xl hover:bg-gray-100">
                <Copy className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Keywords (Max 10)</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {keywords.map(kw => (
                <span key={kw} className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-lg text-sm text-gray-700 border border-gray-200">
                  {kw}
                  <button onClick={() => setKeywords(keywords.filter(k => k !== kw))} className="hover:text-red-500">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={keywordInput} 
                onChange={(e) => setKeywordInput(e.target.value)} 
                onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword(keywordInput)} 
                placeholder="Add keywords" 
                className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" 
              />
              <button onClick={() => handleAddKeyword(keywordInput)} className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm">
                Add
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tags (Max 15)</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map(tag => (
                <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-lg text-sm text-gray-700 border border-gray-200">
                  #{tag}
                  <button onClick={() => setTags(tags.filter(t => t !== tag))} className="hover:text-red-500">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={tagInput} 
                onChange={(e) => setTagInput(e.target.value)} 
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag(tagInput)} 
                placeholder="Add tags" 
                className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" 
              />
              <button onClick={() => handleAddTag(tagInput)} className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm">
                Add
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modals */}
      <PreviewModal 
        isOpen={isPreviewModalOpen} 
        onClose={() => setIsPreviewModalOpen(false)} 
        title={title} 
        content={content} 
        featuredImage={featuredImage} 
      />
      
      <ScheduleModal 
        isOpen={isScheduleModalOpen} 
        onClose={() => setIsScheduleModalOpen(false)} 
        onSchedule={handleSchedule}
        currentDate={scheduledDate}
      />
      
      <ImageModal 
        isOpen={showImageModal} 
        onClose={() => setShowImageModal(false)} 
        onUpload={handleImageUpload} 
      />
    </>
  );
}