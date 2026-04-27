// pages/admin/posts/edit/[id].js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  ArrowLeft, Save, Calendar, Eye, Send, FileText, 
  AlertCircle, Clock, TrendingUp, LayoutDashboard, Edit3,
  X, Image as ImageIcon, LinkIcon, 
  RefreshCw, Copy, ChevronDown,
  ChevronUp, Settings, Loader2, FolderOpen, Heart, Share2, Bookmark, User
} from 'lucide-react';

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
    while (exists && counter < 20) {
      const { data, error } = await supabase
        .from('posts')
        .select('id')
        .eq('slug', uniqueSlug)
        .limit(1)
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
// OPTIMIZE CONTENT
// ============================================================
const optimizeContent = (html) => {
  if (!html) return '';
  let optimized = html
    .replace(/\s+/g, ' ')
    .replace(/>\s+</g, '><')
    .trim();
  optimized = optimized.replace(/<p>\s*<\/p>/g, '');
  optimized = optimized.replace(/data-[^=]+="[^"]*"/g, '');
  return optimized;
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
// ENHANCED PREVIEW MODAL - FIXED HEADER VERSION
// ============================================================
const PreviewModal = ({ isOpen, onClose, title, content, featuredImage, category, tags, readingTime, publishedDate }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  if (!isOpen) return null;
  
  const formatDate = (date) => {
    if (!date) return new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `Check out this article: ${title}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };
  
  return (
    <div className="fixed inset-0 z-[2000] bg-black/90 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-[1200px] h-[90vh] flex flex-col overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Modal Header - Fixed */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Eye className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Post Preview</h3>
            <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-full">
              How readers will see it
            </span>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Category Tag */}
            {category && (
              <div className="mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-semibold rounded-full">
                  <FolderOpen className="w-3.5 h-3.5" />
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </span>
              </div>
            )}
            
            {/* Title - Fixed Header */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              {title || 'Untitled Post'}
            </h1>
            
            {/* Meta Info Bar */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-8 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white text-sm font-semibold">
                  {title ? title.charAt(0).toUpperCase() : 'A'}
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Admin</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Author</div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(publishedDate)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span>{readingTime || 5} min read</span>
                </div>
              </div>
            </div>
            
            {/* Featured Image */}
            {featuredImage && (
              <div className="mb-10 rounded-xl overflow-hidden shadow-lg">
                <img 
                  src={featuredImage} 
                  alt={title || 'Featured image'} 
                  className="w-full h-auto object-cover"
                />
              </div>
            )}
            
            {/* Tags Section */}
            {tags && tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">Tags:</span>
                {tags.map((tag, index) => (
                  <span 
                    key={index} 
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm rounded-full"
                  >
                    <LinkIcon className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>
            )}
            
            {/* Main Content - Enhanced Prose Classes */}
            <div className="mt-8">
              <div 
                className="
                  prose prose-lg max-w-none
                  prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white
                  prose-h1:text-4xl prose-h1:font-bold prose-h1:mt-8 prose-h1:mb-4 prose-h1:border-b prose-h1:border-gray-200 dark:prose-h1:border-gray-700 prose-h1:pb-2
                  prose-h2:text-3xl prose-h2:font-bold prose-h2:mt-6 prose-h2:mb-3
                  prose-h3:text-2xl prose-h3:font-semibold prose-h3:mt-5 prose-h3:mb-2
                  prose-h4:text-xl prose-h4:font-semibold prose-h4:mt-4 prose-h4:mb-2
                  prose-h5:text-lg prose-h5:font-semibold prose-h5:mt-3 prose-h5:mb-1
                  prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-4
                  prose-a:text-purple-600 dark:prose-a:text-purple-400 prose-a:no-underline hover:prose-a:underline
                  prose-strong:text-gray-900 dark:prose-strong:text-white prose-strong:font-semibold
                  prose-em:text-gray-600 dark:prose-em:text-gray-400
                  prose-img:rounded-lg prose-img:shadow-md prose-img:mx-auto prose-img:my-6
                  prose-img:max-w-full prose-img:h-auto
                  prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1.5 prose-code:py-0.5 
                  prose-code:rounded prose-code:text-sm prose-code:font-mono prose-code:text-purple-600 dark:prose-code:text-purple-400
                  prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:p-4 prose-pre:rounded-xl
                  prose-pre:overflow-x-auto
                  prose-blockquote:border-l-4 prose-blockquote:border-purple-500 
                  prose-blockquote:pl-4 prose-blockquote:py-1 prose-blockquote:my-4 
                  prose-blockquote:italic prose-blockquote:text-gray-600 dark:prose-blockquote:text-gray-400
                  prose-ul:list-disc prose-ul:pl-6 prose-ul:my-4
                  prose-ol:list-decimal prose-ol:pl-6 prose-ol:my-4
                  prose-li:text-gray-700 dark:prose-li:text-gray-300 prose-li:my-1
                  prose-table:border-collapse prose-table:w-full prose-table:my-6
                  prose-th:border prose-th:border-gray-300 dark:prose-th:border-gray-700 
                  prose-th:p-3 prose-th:bg-gray-100 dark:prose-th:bg-gray-800 
                  prose-th:font-semibold prose-th:text-left
                  prose-td:border prose-td:border-gray-300 dark:prose-td:border-gray-700 
                  prose-td:p-3 prose-td:text-gray-700 dark:prose-td:text-gray-300
                  prose-hr:my-8 prose-hr:border-gray-200 dark:prose-hr:border-gray-700
                  
                  /* Image alignment */
                  [&_.image-left]:float-left [&_.image-left]:mr-6 [&_.image-left]:mb-4 [&_.image-left]:max-w-md
                  [&_.image-right]:float-right [&_.image-right]:ml-6 [&_.image-right]:mb-4 [&_.image-right]:max-w-md
                  [&_.image-center]:mx-auto [&_.image-center]:block [&_.image-center]:my-6
                  
                  /* Gallery styles */
                  [&_.gallery]:grid [&_.gallery]:grid-cols-2 [&_.gallery]:md:grid-cols-3 [&_.gallery]:gap-4 [&_.gallery]:my-8
                  [&_.gallery-item]:rounded-lg [&_.gallery-item]:overflow-hidden [&_.gallery-item]:shadow-md
                  [&_.gallery-item]:cursor-pointer [&_.gallery-item]:hover:scale-105 [&_.gallery-item]:transition-transform
                  [&_.gallery-item_img]:w-full [&_.gallery-item_img]:h-48 [&_.gallery-item_img]:object-cover
                  
                  /* Video wrapper */
                  [&_.video-wrapper]:relative [&_.video-wrapper]:pb-[56.25%] [&_.video-wrapper]:h-0 [&_.video-wrapper]:my-6
                  [&_.video-wrapper_iframe]:absolute [&_.video-wrapper_iframe]:top-0 [&_.video-wrapper_iframe]:left-0 
                  [&_.video-wrapper_iframe]:w-full [&_.video-wrapper_iframe]:h-full [&_.video-wrapper_iframe]:rounded-lg
                  
                  /* Table container */
                  [&_.table-container]:overflow-x-auto [&_.table-container]:my-6
                  
                  /* Code blocks */
                  [&_pre]:overflow-x-auto [&_pre]:p-4 [&_pre]:rounded-xl [&_pre]:bg-gray-900
                  [&_code]:font-mono [&_code]:text-sm
                  
                  /* Iframes and videos */
                  [&_iframe]:w-full [&_iframe]:aspect-video [&_iframe]:rounded-lg [&_iframe]:shadow-md
                  [&_video]:w-full [&_video]:rounded-lg [&_video]:shadow-md
                "
                dangerouslySetInnerHTML={{ 
                  __html: content || '<div class="text-center py-12"><p class="text-gray-400">No content yet. Start writing your post...</p></div>' 
                }} 
              />
            </div>
            
            {/* Social Interaction Bar */}
            <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setIsLiked(!isLiked)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 group"
                  >
                    <Heart className={`w-5 h-5 transition-colors ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600 dark:text-gray-400 group-hover:text-red-500'}`} />
                    <span className={`text-sm font-medium ${isLiked ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'}`}>
                      {isLiked ? 'Liked' : 'Like'}
                    </span>
                  </button>
                  
                  <button 
                    onClick={handleShare}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 group"
                  >
                    <Share2 className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-blue-500 transition-colors" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-500">Share</span>
                  </button>
                  
                  <button 
                    onClick={() => setIsBookmarked(!isBookmarked)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 group"
                  >
                    <Bookmark className={`w-5 h-5 transition-colors ${isBookmarked ? 'fill-purple-500 text-purple-500' : 'text-gray-600 dark:text-gray-400 group-hover:text-purple-500'}`} />
                    <span className={`text-sm font-medium ${isBookmarked ? 'text-purple-500' : 'text-gray-700 dark:text-gray-300'}`}>
                      {isBookmarked ? 'Saved' : 'Save'}
                    </span>
                  </button>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{readingTime || 5} min read</span>
                  </div>
                  <div className="w-px h-4 bg-gray-300 dark:bg-gray-600" />
                  <div className="flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    <span>{content?.replace(/<[^>]*>/g, '').split(/\s+/).filter(w => w.length > 0).length || 0} words</span>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </div>
        
        {/* Modal Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 sticky bottom-0">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span>Live Preview - This is exactly how your post will appear when published</span>
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold
                       hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200"
            >
              Close Preview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

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
// DYNAMIC IMPORTS
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
          className="w-full p-3 border rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-purple-600" 
          min={new Date().toISOString().slice(0, 16)}
        />
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2 border rounded-xl hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button 
            onClick={() => { if (date) onSchedule(new Date(date)); onClose(); }} 
            disabled={!date}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl disabled:opacity-50 hover:shadow-lg transition-all"
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
  const [saveProgress, setSaveProgress] = useState(0);

  const saveTimeoutRef = useRef(null);
  const contentSizeRef = useRef(0);

  // ============================================================
  // FETCH POST DATA
  // ============================================================
  useEffect(() => {
    if (id) {
      fetchPost();
    }
  }, [id]);

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
    contentSizeRef.current = content.length;
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
    setSaveProgress(10);
    
    try {
      setSaveProgress(30);
      const optimizedContent = optimizeContent(content);
      setSaveProgress(50);
      
      let finalSlug = slug;
      if (status === 'published' && !finalSlug) {
        finalSlug = await createUniqueSlug(title, postId);
      }
      
      const postData = {
        title: title || 'Untitled',
        excerpt: excerpt || null,
        content: optimizedContent,
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
      
      setSaveProgress(70);
      
      const { error } = await supabase
        .from('posts')
        .update(postData)
        .eq('id', postId);
      
      if (error) throw error;
      
      setSaveProgress(100);
      setHasUnsavedChanges(false);
      
      if (slug !== finalSlug && finalSlug) {
        setSlug(finalSlug);
      }
      
      setTimeout(() => setSaveProgress(0), 1000);
      return true;
    } catch (error) {
      console.error('Update error:', error);
      toast.error(`Failed to update post: ${error.message}`);
      setSaveProgress(0);
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
  // AUTO-SAVE DRAFT
  // ============================================================
  useEffect(() => {
    if (hasUnsavedChanges && postId && (title || (content && content !== '<p></p>'))) {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        console.log('Auto-saving draft...');
        updatePost('draft');
      }, 30000);
    }
    
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [title, content, hasUnsavedChanges, postId, updatePost]);

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
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
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
      
      {/* Save Progress Bar */}
      {saveProgress > 0 && (
        <div className="fixed top-0 left-0 right-0 h-1 bg-purple-100 z-[100]">
          <div 
            className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-300"
            style={{ width: `${saveProgress}%` }}
          />
        </div>
      )}
      
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <button onClick={handleBack} className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="h-6 w-px bg-gray-200" />
              <button onClick={() => router.push('/admin/dashboard')} className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-gray-600 hover:bg-gray-100 text-sm transition-colors">
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
              {/* Content Size Warning */}
              {contentSizeRef.current > 500000 && (
                <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-yellow-50">
                  <AlertCircle className="w-3.5 h-3.5 text-yellow-600" />
                  <span className="text-xs text-yellow-600">Large content ({Math.round(contentSizeRef.current / 1024)}KB)</span>
                </div>
              )}
              
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
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 text-sm transition-colors"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{isSaving ? 'Saving...' : 'Save Draft'}</span>
              </button>
              
              <button 
                onClick={() => setIsScheduleModalOpen(true)} 
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 text-sm transition-colors"
              >
                <Calendar className="w-4 h-4" />
                <span>Schedule</span>
              </button>
              
              <button 
                onClick={() => setIsPreviewModalOpen(true)} 
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 text-sm transition-colors"
              >
                <Eye className="w-4 h-4" />
                <span>Preview</span>
              </button>
              
              <button 
                onClick={handlePublish} 
                disabled={isSaving} 
                className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg disabled:opacity-50 text-sm transition-all"
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
            className="w-full text-4xl md:text-5xl font-bold bg-transparent border-0 focus:outline-none focus:ring-0 placeholder-gray-300 text-gray-900 dark:text-white" 
            maxLength={120} 
          />
          <div className="mt-2 text-right text-xs text-gray-400">
            {title.length}/120 characters
            {title.length > 60 && title.length <= 70 && <span className="ml-2 text-amber-600">⚠️ Title is long</span>}
          </div>
        </div>

        {/* Category Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <FolderOpen className="w-4 h-4 inline mr-1" />
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 text-sm capitalize"
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
            className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-600 text-gray-700 dark:text-gray-300 text-sm resize-none" 
            rows={2} 
            maxLength={160} 
          />
          <div className="mt-1 text-right text-xs text-gray-400">{excerpt.length}/160 characters</div>
        </div>

        {/* Featured Image */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Featured Image
          </label>
          {featuredImage ? (
            <div className="relative inline-block group">
              <img 
                src={featuredImage} 
                alt="Featured" 
                className="w-32 h-32 object-cover rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm" 
              />
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => setShowImageModal(true)} 
                  className="p-1 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:bg-gray-100 dark:hover:bg-gray-700"
                  title="Change image"
                >
                  <ImageIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>
                <button 
                  onClick={() => {
                    setFeaturedImage('');
                    toast.info('Featured image removed');
                  }} 
                  className="p-1 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:bg-red-50 dark:hover:bg-red-900/20"
                  title="Remove image"
                >
                  <X className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => setShowImageModal(true)} 
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <ImageIcon className="w-4 h-4" />
              Choose Featured Image
            </button>
          )}
          <p className="mt-2 text-xs text-gray-400">Click to open media library. You can crop, resize, and add SEO data.</p>
        </div>
        
        {/* Editor Container */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm bg-white dark:bg-gray-900 overflow-hidden">
          <Editor 
            content={content} 
            onChange={setContent} 
            title={title} 
            onSave={handleSaveDraft} 
            onPublish={handlePublish} 
          />
        </div>
        
        {/* Advanced SEO */}
        <div className="mt-8 p-5 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700">
          <button onClick={() => setShowAdvancedSEO(!showAdvancedSEO)} className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Advanced SEO & Meta Information</h3>
            </div>
            {showAdvancedSEO ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
          </button>
          
          {showAdvancedSEO && (
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Meta Title</label>
                <input 
                  type="text" 
                  value={metaTitle} 
                  onChange={(e) => setMetaTitle(e.target.value.slice(0, 60))} 
                  placeholder="SEO Title (defaults to post title)" 
                  className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 text-sm" 
                  maxLength={60} 
                />
                <p className="text-xs text-gray-400 mt-1">{metaTitle.length}/60 characters</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Meta Description</label>
                <textarea 
                  value={metaDescription} 
                  onChange={(e) => setMetaDescription(e.target.value.slice(0, 160))} 
                  placeholder="SEO Description (defaults to excerpt)" 
                  className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 text-sm resize-none" 
                  rows={2} 
                  maxLength={160} 
                />
                <p className="text-xs text-gray-400 mt-1">{metaDescription.length}/160 characters</p>
              </div>
            </div>
          )}
        </div>

        {/* Keywords & Tags */}
        <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-2xl border border-blue-100 dark:border-blue-900">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">URL Slug</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                <LinkIcon className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-500">/blog/</span>
                <input 
                  type="text" 
                  value={slug} 
                  onChange={(e) => setSlug(generateSlug(e.target.value))} 
                  placeholder="your-post-slug" 
                  className="flex-1 bg-transparent focus:outline-none text-sm text-gray-900 dark:text-white" 
                />
              </div>
              <button onClick={handleRegenerateSlug} className="p-2 bg-white dark:bg-gray-900 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800">
                <RefreshCw className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
              <button onClick={handleCopySlug} className="p-2 bg-white dark:bg-gray-900 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800">
                <Copy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Keywords (Max 10)</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {keywords.map(kw => (
                <span key={kw} className="inline-flex items-center gap-1 px-2 py-1 bg-white dark:bg-gray-900 rounded-lg text-sm text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
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
                className="flex-1 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" 
              />
              <button onClick={() => handleAddKeyword(keywordInput)} className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm transition-colors">
                Add
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tags (Max 15)</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map(tag => (
                <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-white dark:bg-gray-900 rounded-lg text-sm text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
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
                className="flex-1 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" 
              />
              <button onClick={() => handleAddTag(tagInput)} className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm transition-colors">
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
        category={category}
        tags={tags}
        readingTime={stats.readingTime}
        publishedDate={scheduledDate || new Date().toISOString()}
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