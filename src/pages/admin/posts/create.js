import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  ArrowLeft, Save, Calendar, Eye, Send, FileText, 
  AlertCircle, Clock, TrendingUp, LayoutDashboard, PlusCircle, 
  X, Image as ImageIcon, LinkIcon, 
  RefreshCw, Copy, ChevronDown,
  ChevronUp, Settings, Loader2, FolderOpen
} from 'lucide-react';

import { supabase } from '../../../lib/supabase';

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
// DYNAMIC IMPORTS - WITH DEBUG
// ============================================================
const Editor = dynamic(
  () => import('../../../components/editor').then(mod => {
    console.log('✅ Editor module loaded:', mod);
    console.log('✅ Available exports:', Object.keys(mod));
    console.log('✅ Default export:', mod.default);
    return mod.default;
  }).catch(err => {
    console.error('❌ Editor load error:', err);
    console.error('❌ Error stack:', err.stack);
    return () => (
      <div className="p-8 bg-red-50 rounded-xl">
        <h3 className="text-red-600 font-bold">Editor Failed to Load</h3>
        <p className="text-sm text-gray-600 mt-2">Check the console (F12) for detailed error</p>
        <pre className="text-xs mt-2 p-2 bg-red-100 rounded overflow-auto max-h-40">
          {err.message}
        </pre>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Reload Page
        </button>
      </div>
    );
  }),
  { ssr: false, loading: () => <EditorSkeleton /> }
);

const ImageModal = dynamic(
  () => import('../../../components/media/Modals/ImageModal').then(mod => mod.default).catch(() => () => null),
  { ssr: false }
);

// ============================================================
// FLOATING PREVIEW BUTTON
// ============================================================
const FloatingPreviewButton = ({ title, content, excerpt, featuredImage, tags, category, readingTime }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all hover:scale-105 z-50"
      >
        <Eye size={24} />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/90 z-[2000] flex items-center justify-center" onClick={() => setIsOpen(false)}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-[95vw] max-w-[1200px] h-[90vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h3 className="font-semibold">Post Preview</h3>
          <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-auto p-6">
          <article className="prose prose-lg max-w-4xl mx-auto">
            <h1>{title || 'Untitled'}</h1>
            {featuredImage && (
              <img src={featuredImage} alt="Featured" className="w-full rounded-lg" />
            )}
            <div dangerouslySetInnerHTML={{ __html: content || '<p>No content yet...</p>' }} />
          </article>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// MAIN COMPONENT
// ============================================================
function CreatePost() {
  const router = useRouter();
  
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
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showAdvancedSEO, setShowAdvancedSEO] = useState(false);
  const [errors, setErrors] = useState({});
  const [scheduledDate, setScheduledDate] = useState('');
  const [stats, setStats] = useState({ wordCount: 0, readingTime: 0, seoScore: 0 });

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
    
    if (!excerpt && wordCount > 50) {
      const firstPara = plainText.slice(0, 160).trim();
      if (firstPara) setExcerpt(firstPara + (plainText.length > 160 ? '...' : ''));
    }
  }, [content, calculateSEOScore, excerpt]);

  // ============================================================
  // AUTO-GENERATE SLUG
  // ============================================================
  useEffect(() => {
    if (title && !slug && !postId) {
      setSlug(generateSlug(title));
    }
  }, [title, slug, postId]);

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
  // SAVE DRAFT
  // ============================================================
  const saveDraft = useCallback(async () => {
    if (!title && (!content || content === '<p></p>')) {
      toast.warning('Add a title or some content before saving');
      return false;
    }
    
    setIsSaving(true);
    try {
      const finalSlug = slug || await createUniqueSlug(title || 'untitled', postId);
      
      const postData = {
        title: title || 'Untitled',
        excerpt: excerpt || null,
        content: content || '',
        featured_image: featuredImage || null,
        slug: finalSlug,
        category: category || null,
        keywords: keywords.length > 0 ? keywords.join(',') : null,
        tags: tags.length > 0 ? tags.join(',') : null,
        meta_title: metaTitle || title || null,
        meta_description: metaDescription || excerpt || null,
        status: 'draft',
        updated_at: new Date().toISOString()
      };
      
      let result;
      
      if (postId) {
        result = await supabase
          .from('posts')
          .update(postData)
          .eq('id', postId)
          .select()
          .single();
          
        if (result.error) throw result.error;
        toast.success('✨ Draft updated successfully!');
      } else {
        result = await supabase
          .from('posts')
          .insert([{
            ...postData,
            created_at: new Date().toISOString()
          }])
          .select()
          .single();
          
        if (result.error) throw result.error;
        
        if (result.data) {
          setPostId(result.data.id);
          setSlug(result.data.slug);
          toast.success('✨ Draft saved successfully!');
          router.replace(`/admin/posts/edit/${result.data.id}`, undefined, { shallow: true });
        }
      }
      
      setHasUnsavedChanges(false);
      return true;
    } catch (error) {
      console.error('Save error:', error);
      toast.error(`Failed to save draft: ${error.message}`);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [title, excerpt, content, featuredImage, slug, category, keywords, tags, metaTitle, metaDescription, postId, router]);

  // ============================================================
  // PUBLISH POST
  // ============================================================
  const handlePublish = useCallback(async () => {
    if (!title) { 
      toast.error('Please add a title before publishing'); 
      return; 
    }
    
    if (!content || content === '<p></p>') { 
      toast.error('Please add some content before publishing'); 
      return; 
    }
    
    setIsSaving(true);
    try {
      const finalSlug = slug || await createUniqueSlug(title, postId);
      
      const postData = {
        title,
        excerpt: excerpt || null,
        content,
        featured_image: featuredImage || null,
        slug: finalSlug,
        category: category || null,
        keywords: keywords.length > 0 ? keywords.join(',') : null,
        tags: tags.length > 0 ? tags.join(',') : null,
        meta_title: metaTitle || title,
        meta_description: metaDescription || excerpt,
        status: 'published',
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      let result;
      
      if (postId) {
        result = await supabase
          .from('posts')
          .update(postData)
          .eq('id', postId);
          
        if (result.error) throw result.error;
      } else {
        result = await supabase
          .from('posts')
          .insert([{
            ...postData,
            created_at: new Date().toISOString()
          }]);
          
        if (result.error) throw result.error;
      }
      
      setHasUnsavedChanges(false);
      toast.success('🎉 Post published successfully!');
      router.push('/admin/posts-manager');
    } catch (error) {
      console.error('Publish error:', error);
      toast.error(`Failed to publish post: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  }, [title, excerpt, content, featuredImage, slug, category, keywords, tags, metaTitle, metaDescription, postId, router]);

  // ============================================================
  // SCHEDULE POST
  // ============================================================
  const handleSchedule = useCallback(async () => {
    if (!scheduledDate) {
      toast.error('Please select a date and time');
      return;
    }
    
    if (!title) {
      toast.error('Please add a title before scheduling');
      return;
    }
    
    setIsSaving(true);
    try {
      const finalSlug = slug || await createUniqueSlug(title, postId);
      
      const postData = {
        title,
        excerpt: excerpt || null,
        content: content || '',
        featured_image: featuredImage || null,
        slug: finalSlug,
        category: category || null,
        keywords: keywords.length > 0 ? keywords.join(',') : null,
        tags: tags.length > 0 ? tags.join(',') : null,
        meta_title: metaTitle || title,
        meta_description: metaDescription || excerpt,
        status: 'scheduled',
        scheduled_for: new Date(scheduledDate).toISOString(),
        updated_at: new Date().toISOString()
      };
      
      let result;
      
      if (postId) {
        result = await supabase
          .from('posts')
          .update(postData)
          .eq('id', postId);
      } else {
        result = await supabase
          .from('posts')
          .insert([{
            ...postData,
            created_at: new Date().toISOString()
          }]);
      }
      
      if (result.error) throw result.error;
      
      setHasUnsavedChanges(false);
      toast.success(`📅 Post scheduled for ${new Date(scheduledDate).toLocaleString()}`);
      router.push('/admin/posts-manager');
    } catch (error) {
      console.error('Schedule error:', error);
      toast.error(`Failed to schedule post: ${error.message}`);
    } finally {
      setIsSaving(false);
      setIsScheduleModalOpen(false);
      setScheduledDate('');
    }
  }, [title, excerpt, content, featuredImage, slug, category, keywords, tags, metaTitle, metaDescription, scheduledDate, postId, router]);

  // ============================================================
  // HANDLERS
  // ============================================================
  const handleBack = useCallback(() => {
    if (hasUnsavedChanges) {
      if (confirm('You have unsaved changes. Leave anyway?')) {
        router.back();
      }
    } else {
      router.back();
    }
  }, [hasUnsavedChanges, router]);

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
  // MAIN RENDER
  // ============================================================
  return (
    <>
      <Head>
        <title>Create New Post - Admin Dashboard</title>
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
                <PlusCircle className="w-4 h-4 text-gray-900" />
                <span className="text-sm font-medium text-gray-900">New Post</span>
              </div>
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
                onClick={saveDraft} 
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
            placeholder="Write a captivating title..." 
            className="w-full text-4xl md:text-5xl font-bold bg-transparent border-0 focus:outline-none focus:ring-0 placeholder-gray-300 text-gray-900" 
            maxLength={120} 
          />
          <div className="mt-2 text-right text-xs text-gray-400">
            {title.length}/120 characters
            {title.length > 60 && title.length <= 70 && <span className="ml-2 text-amber-600">⚠️ Title is long</span>}
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
          <p className="mt-1 text-xs text-gray-400">Choose a category for better organization</p>
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
            onSave={saveDraft} 
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
      
      {/* Floating Preview Button */}
      <FloatingPreviewButton 
        title={title}
        content={content}
        excerpt={excerpt}
        featuredImage={featuredImage}
        tags={tags}
        category={category}
        readingTime={stats.readingTime}
      />
      
      {/* Schedule Modal */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50" onClick={() => setIsScheduleModalOpen(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-semibold mb-4">Schedule Post</h3>
            <input 
              type="datetime-local" 
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="w-full p-3 border rounded-xl mb-4" 
              min={new Date().toISOString().slice(0, 16)}
            />
            <div className="flex gap-3">
              <button onClick={() => setIsScheduleModalOpen(false)} className="flex-1 px-4 py-2 border rounded-xl">
                Cancel
              </button>
              <button 
                onClick={handleSchedule} 
                disabled={!scheduledDate}
                className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-xl disabled:opacity-50"
              >
                Schedule
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Image Modal */}
      {showImageModal && (
        <ImageModal 
          isOpen={showImageModal} 
          onClose={() => setShowImageModal(false)} 
          onUpload={handleImageUpload} 
        />
      )}
    </>
  );
}

export default CreatePost;