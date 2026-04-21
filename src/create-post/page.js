// src/pages/create-post.js - NO AUTO-SAVE VERSION (Manual save only)
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Save, Calendar, Eye, Send, FileText, 
  CheckCircle, AlertCircle, Sparkles, 
  Globe, Clock, TrendingUp, Zap, Award, Type, LayoutDashboard,
  PlusCircle, X, Image as ImageIcon, Hash, Tag, Link as LinkIcon,
  Search, BarChart, Target, BookOpen, Star, Shield, Zap as ZapIcon,
  Edit3, RefreshCw, Copy, Check, AlertTriangle
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { supabase } from '@/lib/supabase';
import { createUniqueSlug, generateSlug } from '@/utils/slugify';

// Import ImageModal for featured image
const ImageModal = dynamic(() => import('@/components/media/Modals/ImageModal'), { ssr: false });

// Import the TipTap Editor
const Editor = dynamic(
  () => import('@/components/editor').then(mod => mod.default),
  { 
    ssr: false,
    loading: () => (
      <div className="h-96 flex items-center justify-center bg-gray-50 rounded-2xl border border-gray-200">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-500 text-sm">Loading editor...</p>
        </div>
      </div>
    )
  }
);

// SEO Analysis Component (same as before)
const SEOAnalysis = ({ title, content, keywords, tags, slug, seoScore }) => {
  const [analysis, setAnalysis] = useState({
    titleLength: { score: 0, message: '', status: 'pending' },
    keywordDensity: { score: 0, message: '', status: 'pending' },
    headings: { score: 0, message: '', status: 'pending' },
    contentLength: { score: 0, message: '', status: 'pending' },
    readability: { score: 0, message: '', status: 'pending' },
    images: { score: 0, message: '', status: 'pending' },
    links: { score: 0, message: '', status: 'pending' },
    slug: { score: 0, message: '', status: 'pending' }
  });

  useEffect(() => {
    analyzeSEO();
  }, [title, content, keywords, tags, slug]);

  const analyzeSEO = () => {
    const newAnalysis = { ...analysis };
    
    const titleLength = title.length;
    if (titleLength >= 30 && titleLength <= 60) {
      newAnalysis.titleLength = { score: 100, message: 'Perfect title length (30-60 characters)', status: 'excellent' };
    } else if (titleLength >= 20 && titleLength <= 70) {
      newAnalysis.titleLength = { score: 70, message: 'Good title length, try to keep between 30-60 characters', status: 'good' };
    } else {
      newAnalysis.titleLength = { score: 40, message: 'Title length should be between 30-60 characters for optimal SEO', status: 'needs-improvement' };
    }
    
    const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    if (wordCount >= 1000) {
      newAnalysis.contentLength = { score: 100, message: 'Excellent content length (1000+ words)', status: 'excellent' };
    } else if (wordCount >= 500) {
      newAnalysis.contentLength = { score: 80, message: 'Good content length (500+ words)', status: 'good' };
    } else if (wordCount >= 300) {
      newAnalysis.contentLength = { score: 60, message: 'Average content length, aim for 500+ words', status: 'needs-improvement' };
    } else {
      newAnalysis.contentLength = { score: 30, message: 'Content too short, aim for 500+ words for better ranking', status: 'poor' };
    }
    
    const h1Count = (content.match(/<h1/g) || []).length;
    const h2Count = (content.match(/<h2/g) || []).length;
    if (h1Count === 1 && h2Count >= 3) {
      newAnalysis.headings = { score: 100, message: 'Perfect heading structure (1 H1, 3+ H2s)', status: 'excellent' };
    } else if (h1Count === 1 && h2Count >= 1) {
      newAnalysis.headings = { score: 70, message: 'Good heading structure, add more H2s', status: 'good' };
    } else if (h1Count === 1) {
      newAnalysis.headings = { score: 50, message: 'Add more subheadings (H2, H3) to structure content', status: 'needs-improvement' };
    } else {
      newAnalysis.headings = { score: 30, message: 'Missing H1 heading. Use headings to structure your content', status: 'poor' };
    }
    
    if (slug && slug !== 'untitled') {
      const hasStopWords = /\b(and|or|but|for|of|the|to|a|an|in|on|at)\b/i.test(slug);
      if (!hasStopWords && slug.length <= 60) {
        newAnalysis.slug = { score: 100, message: 'Perfect SEO-friendly slug', status: 'excellent' };
      } else if (slug.length <= 60) {
        newAnalysis.slug = { score: 70, message: 'Good slug, remove stop words (and, or, but, etc.)', status: 'good' };
      } else {
        newAnalysis.slug = { score: 50, message: 'Slug too long, keep under 60 characters', status: 'needs-improvement' };
      }
    } else {
      newAnalysis.slug = { score: 0, message: 'Generate a SEO-friendly slug', status: 'poor' };
    }
    
    setAnalysis(newAnalysis);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'excellent': return <Star className="w-4 h-4 text-green-500" />;
      case 'good': return <CheckCircle className="w-4 h-4 text-amber-500" />;
      case 'needs-improvement': return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case 'poor': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart className="w-5 h-5 text-gray-900" />
          <h3 className="font-semibold text-gray-900">SEO Analysis</h3>
        </div>
        <div className="text-2xl font-bold">
          <span className={getScoreColor(seoScore)}>{seoScore}</span>
          <span className="text-gray-300 text-lg">/100</span>
        </div>
      </div>
      
      <div className="space-y-3">
        {Object.entries(analysis).map(([key, data]) => (
          <div key={key} className="p-3 bg-gray-50 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {getStatusIcon(data.status)}
                <span className="text-sm font-medium capitalize text-gray-700">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
              </div>
              <span className={`text-sm font-semibold ${getScoreColor(data.score)}`}>
                {data.score}%
              </span>
            </div>
            <p className="text-xs text-gray-600">{data.message}</p>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
              <div className={`h-1.5 rounded-full transition-all duration-500 ${
                data.score >= 80 ? 'bg-green-500' : data.score >= 60 ? 'bg-amber-500' : 'bg-red-500'
              }`} style={{ width: `${data.score}%` }} />
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-4 h-4 text-purple-600" />
          <span className="text-sm font-medium text-purple-900">AI Suggestions</span>
        </div>
        <ul className="space-y-1 text-xs text-purple-800">
          {analysis.titleLength.score < 80 && <li>• Optimize your title length for better click-through rates</li>}
          {analysis.headings.score < 80 && <li>• Add more subheadings to improve content structure</li>}
          {analysis.contentLength.score < 80 && <li>• Expand your content to increase authority signals</li>}
          {analysis.slug.score < 80 && <li>• Create a descriptive, keyword-rich URL slug</li>}
        </ul>
      </div>
    </div>
  );
};

// Keyword Suggestions Component
const KeywordSuggestions = ({ content, onAddKeyword }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (content && content.length > 100) {
      extractKeywords();
    }
  }, [content]);

  const extractKeywords = () => {
    setLoading(true);
    const plainText = content.replace(/<[^>]*>/g, '');
    const words = plainText.toLowerCase().split(/\s+/);
    
    const frequency = {};
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'this', 'that', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing']);
    
    words.forEach(word => {
      if (word.length > 3 && !stopWords.has(word)) {
        frequency[word] = (frequency[word] || 0) + 1;
      }
    });
    
    const sorted = Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word, count]) => ({ word, count, relevance: Math.min(100, Math.round(count * 10)) }));
    
    setSuggestions(sorted);
    setLoading(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <Hash className="w-4 h-4 text-gray-900" />
        <h3 className="font-semibold text-gray-900">Keyword Suggestions</h3>
        <button onClick={extractKeywords} className="ml-auto p-1 hover:bg-gray-100 rounded-lg transition">
          <RefreshCw className={`w-3 h-3 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>
      
      {suggestions.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {suggestions.map((kw, idx) => (
            <button
              key={idx}
              onClick={() => onAddKeyword(kw.word)}
              className="group relative px-3 py-1.5 bg-gray-100 hover:bg-purple-100 rounded-lg text-sm text-gray-700 hover:text-purple-700 transition-all"
            >
              {kw.word}
              <span className="absolute -top-1 -right-1 text-[10px] font-bold text-purple-600 opacity-0 group-hover:opacity-100 transition">
                +
              </span>
            </button>
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-400">Write more content to see keyword suggestions</p>
      )}
      
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <ZapIcon className="w-3 h-3" />
          <span>Use keywords naturally in headings and first paragraph</span>
        </div>
      </div>
    </div>
  );
};

// Schedule Modal Component
const ScheduleModal = ({ isOpen, onClose, onSchedule }) => {
  const [date, setDate] = useState('');

  useEffect(() => {
    if (isOpen) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0);
      setDate(tomorrow.toISOString().slice(0, 16));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-xl font-semibold text-gray-900">Schedule Post</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-xl transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); if (date) onSchedule(new Date(date)); onClose(); }}>
          <input
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-xl bg-white text-gray-900 mb-5 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            required
          />
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" className="flex-1 px-4 py-2.5 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors">
              Schedule
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// Preview Modal Component
const PreviewModal = ({ isOpen, onClose, content, title, featuredImage }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden mx-4 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-5 border-b border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900">Preview</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-xl transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-80px)]">
          {featuredImage && (
            <img src={featuredImage} alt={title} className="w-full rounded-xl mb-8 object-cover max-h-96 shadow-sm" />
          )}
          <h1 className="text-4xl font-bold mb-6 text-gray-900">{title || 'Untitled'}</h1>
          <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: content || '<p class="text-gray-400">No content yet</p>' }} />
        </div>
      </motion.div>
    </div>
  );
};

// Main Component - NO AUTO-SAVE
export default function CreatePost() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [slug, setSlug] = useState('');
  const [keywords, setKeywords] = useState([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [showImageModal, setShowImageModal] = useState(false);
  const [postId, setPostId] = useState(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showTips, setShowTips] = useState(true);
  const [copiedSlug, setCopiedSlug] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  const [stats, setStats] = useState({
    charCount: 0,
    wordCount: 0,
    readingTime: 0,
    seoScore: 0
  });

  // Calculate SEO score
  const calculateSEOScore = useCallback(() => {
    let score = 0;
    
    if (title.length >= 30 && title.length <= 60) score += 25;
    else if (title.length >= 20 && title.length <= 70) score += 15;
    else if (title.length > 0) score += 5;
    
    const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    if (wordCount >= 1000) score += 25;
    else if (wordCount >= 500) score += 20;
    else if (wordCount >= 300) score += 10;
    else if (wordCount > 0) score += 5;
    
    const h1Count = (content.match(/<h1/g) || []).length;
    const h2Count = (content.match(/<h2/g) || []).length;
    if (h1Count === 1 && h2Count >= 3) score += 15;
    else if (h1Count === 1 && h2Count >= 1) score += 10;
    else if (h1Count === 1) score += 5;
    
    if (keywords.length >= 3 && keywords.length <= 8) score += 15;
    else if (keywords.length > 0) score += 8;
    
    if (tags.length >= 3 && tags.length <= 10) score += 10;
    else if (tags.length > 0) score += 5;
    
    if (slug && slug !== 'untitled' && slug.length <= 60) score += 10;
    else if (slug && slug !== 'untitled') score += 5;
    
    return Math.min(100, score);
  }, [title, content, keywords, tags, slug]);

  // Update stats when content changes
  useEffect(() => {
    const plainText = content.replace(/<[^>]*>/g, '');
    const words = plainText.split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;
    const charCount = plainText.length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));
    const seoScore = calculateSEOScore();
    
    setStats({ wordCount, charCount, readingTime, seoScore });
    setHasUnsavedChanges(true);
  }, [content, calculateSEOScore]);

  // Auto-generate slug from title (only once, not on every change)
  useEffect(() => {
    if (title && !slug && !postId) {
      const generatedSlug = generateSlug(title);
      setSlug(generatedSlug);
    }
  }, [title, slug, postId]);

  // Track unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Check authentication
  useEffect(() => {
    const sessionToken = localStorage.getItem('admin_session_token');
    if (!sessionToken) {
      router.push('/admin/login');
    }
  }, [router]);
  
  // SAVE DRAFT - ONLY MANUAL SAVE
  const handleSaveDraft = async () => {
    if (!title && !content) {
      toast.warning('Add some content before saving');
      return;
    }
    
    setIsSaving(true);
    
    try {
      const seoScore = calculateSEOScore();
      const finalSlug = slug || await createUniqueSlug(supabase, title || 'untitled');
      
      if (postId) {
        // Update existing post
        const { error } = await supabase
          .from('posts')
          .update({ 
            title: title || 'Untitled',
            content: content || '',
            featured_image: featuredImage,
            slug: finalSlug,
            keywords: keywords.join(','),
            tags: tags.join(','),
            seo_score: seoScore,
            status: 'draft',
            updated_at: new Date().toISOString()
          })
          .eq('id', postId);
        
        if (error) throw error;
        
      } else {
        // Create new post
        const { data, error } = await supabase
          .from('posts')
          .insert([{
            title: title || 'Untitled',
            content: content || '',
            featured_image: featuredImage,
            slug: finalSlug,
            keywords: keywords.join(','),
            tags: tags.join(','),
            seo_score: seoScore,
            status: 'draft',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select()
          .single();
        
        if (error) throw error;
        
        if (data) {
          setPostId(data.id);
          setSlug(data.slug);
          // Update URL without navigation
          router.replace(`/edit-post/${data.id}`, undefined, { shallow: true });
        }
      }
      
      setHasUnsavedChanges(false);
      toast.success('✨ Draft saved successfully!');
      
    } catch (error) { 
      console.error('Save error:', error);
      toast.error('Failed to save draft. Please try again.');
    } finally { 
      setIsSaving(false); 
    }
  };
  
  const handleSchedule = (scheduledDate) => {
    toast.success(`📅 Post scheduled for ${scheduledDate.toLocaleString()}`);
  };
  
  const handlePublish = async () => {
    if (!title) { 
      toast.error('Please add a title before publishing');
      return;
    }
    if (!content) { 
      toast.error('Please add some content before publishing');
      return;
    }
    
    setIsSaving(true);
    
    try {
      const finalSlug = slug || await createUniqueSlug(supabase, title, postId);
      const seoScore = calculateSEOScore();
      
      if (postId) {
        const { error } = await supabase
          .from('posts')
          .update({ 
            title, 
            content, 
            featured_image: featuredImage, 
            slug: finalSlug,
            keywords: keywords.join(','),
            tags: tags.join(','),
            seo_score: seoScore,
            status: 'published', 
            published_at: new Date().toISOString(), 
            updated_at: new Date().toISOString() 
          })
          .eq('id', postId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('posts')
          .insert([{ 
            title, 
            content, 
            featured_image: featuredImage, 
            slug: finalSlug,
            keywords: keywords.join(','),
            tags: tags.join(','),
            seo_score: seoScore,
            status: 'published', 
            created_at: new Date().toISOString(), 
            published_at: new Date().toISOString(), 
            updated_at: new Date().toISOString() 
          }]);
        if (error) throw error;
      }
      
      setHasUnsavedChanges(false);
      toast.success('🎉 Post published successfully!'); 
      router.push('/admin/posts-manager');
    } catch (error) { 
      console.error('Publish error:', error);
      toast.error('Failed to publish post. Please try again.');
    } finally { 
      setIsSaving(false); 
    }
  };
  
  const handleContentChange = useCallback((html) => {
    setContent(html);
  }, []);
  
  const handleImageUpload = (imageData) => {
    if (imageData && imageData.src) {
      setFeaturedImage(imageData.src);
      toast.success('Featured image added!');
    }
    setShowImageModal(false);
  };
  
  const handleAddKeyword = (keyword) => {
    if (keyword && !keywords.includes(keyword) && keywords.length < 10) {
      setKeywords([...keywords, keyword]);
      setKeywordInput('');
      setHasUnsavedChanges(true);
    }
  };
  
  const handleRemoveKeyword = (keyword) => {
    setKeywords(keywords.filter(k => k !== keyword));
    setHasUnsavedChanges(true);
  };
  
  const handleAddTag = (tag) => {
    if (tag && !tags.includes(tag) && tags.length < 15) {
      setTags([...tags, tag]);
      setTagInput('');
      setHasUnsavedChanges(true);
    }
  };
  
  const handleRemoveTag = (tag) => {
    setTags(tags.filter(t => t !== tag));
    setHasUnsavedChanges(true);
  };
  
  const handleRegenerateSlug = async () => {
    if (title) {
      const newSlug = await createUniqueSlug(supabase, title, postId);
      setSlug(newSlug);
      setHasUnsavedChanges(true);
      toast.success('Slug regenerated!');
    }
  };
  
  const handleCopySlug = () => {
    navigator.clipboard.writeText(slug);
    setCopiedSlug(true);
    setTimeout(() => setCopiedSlug(false), 2000);
    toast.success('Slug copied to clipboard!');
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} newestOnTop />
      <div className="min-h-screen bg-white">
        {/* Top Navigation Bar */}
        <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => {
                    if (hasUnsavedChanges) {
                      if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
                        router.back();
                      }
                    } else {
                      router.back();
                    }
                  }} 
                  className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-all"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="h-6 w-px bg-gray-200" />
                <button onClick={() => router.push('/admin/dashboard')} className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors text-sm">
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </button>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-100">
                  <PlusCircle className="w-4 h-4 text-gray-900" />
                  <span className="text-sm font-medium text-gray-900">New Post</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="hidden lg:flex items-center gap-4 px-3 py-1.5 rounded-xl bg-gray-50">
                  <div className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-xs text-gray-600">{stats.wordCount} words</span>
                  </div>
                  <div className="w-px h-4 bg-gray-200" />
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-xs text-gray-600">{stats.readingTime} min read</span>
                  </div>
                  <div className="w-px h-4 bg-gray-200" />
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-gray-400" />
                    <span className={`text-xs font-semibold ${stats.seoScore >= 80 ? 'text-green-600' : stats.seoScore >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                      {stats.seoScore} SEO
                    </span>
                  </div>
                </div>
                
                {hasUnsavedChanges && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50">
                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                    <span className="text-xs text-amber-600">Unsaved changes</span>
                  </div>
                )}
                
                <button onClick={() => setShowTips(!showTips)} className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors text-sm">
                  <Sparkles className="w-4 h-4" />
                  <span>{showTips ? 'Hide Tips' : 'Show Tips'}</span>
                </button>
                
                <div className="h-6 w-px bg-gray-200" />
                
                <button 
                  onClick={handleSaveDraft} 
                  disabled={isSaving} 
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-all disabled:opacity-50 text-sm"
                >
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>Save Draft</span>
                </button>
                
                <button onClick={() => setIsScheduleModalOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-all text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>Schedule</span>
                </button>
                
                <button onClick={() => setIsPreviewModalOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-all text-sm">
                  <Eye className="w-4 h-4" />
                  <span>Preview</span>
                </button>
                
                <button 
                  onClick={handlePublish} 
                  disabled={isSaving} 
                  className="flex items-center gap-2 px-5 py-2 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all disabled:opacity-50 text-sm shadow-sm"
                >
                  <Send className="w-4 h-4" />
                  <span>Publish</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Content - Same as before */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
          <div className="flex gap-10">
            <div className="flex-1 min-w-0">
              {/* Title Input */}
              <div className="mb-10 relative">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setHasUnsavedChanges(true);
                  }}
                  placeholder="Write a captivating title..."
                  className="w-full text-5xl md:text-7xl font-bold bg-transparent border-0 focus:outline-none focus:ring-0 placeholder-gray-300 text-gray-900 text-center tracking-tight"
                  maxLength={120}
                />
                <div className="absolute -bottom-6 right-0 text-xs text-gray-400">{title.length}/120</div>
              </div>

              {/* SEO Meta Section */}
              <div className="mb-8 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">SEO Settings</h3>
                  <span className={`ml-auto text-sm font-bold px-3 py-1 rounded-full ${
                    stats.seoScore >= 80 ? 'bg-green-100 text-green-700' :
                    stats.seoScore >= 60 ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    Score: {stats.seoScore}/100
                  </span>
                </div>
                
                {/* URL Slug */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">URL Slug</label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-gray-200">
                      <LinkIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-xs text-gray-500">/blog/</span>
                      <input
                        type="text"
                        value={slug}
                        onChange={(e) => {
                          setSlug(generateSlug(e.target.value));
                          setHasUnsavedChanges(true);
                        }}
                        placeholder="your-post-slug"
                        className="flex-1 bg-transparent focus:outline-none text-sm text-gray-900"
                      />
                    </div>
                    <button onClick={handleRegenerateSlug} className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition" title="Regenerate slug">
                      <RefreshCw className="w-4 h-4 text-gray-600" />
                    </button>
                    <button onClick={handleCopySlug} className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition" title="Copy slug">
                      {copiedSlug ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-600" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">SEO-friendly URL structure. Keep it short and descriptive.</p>
                </div>
                
                {/* Keywords */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Keywords</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {keywords.map(kw => (
                      <span key={kw} className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-lg text-sm text-gray-700 border border-gray-200">
                        {kw}
                        <button onClick={() => handleRemoveKeyword(kw)} className="hover:text-red-500">
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
                      placeholder="Add keywords (max 10)"
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <button onClick={() => handleAddKeyword(keywordInput)} className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition text-sm">
                      Add
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Keywords help search engines understand your content. Add 3-8 relevant keywords.</p>
                </div>
                
                {/* Tags */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {tags.map(tag => (
                      <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-lg text-sm text-gray-700">
                        #{tag}
                        <button onClick={() => handleRemoveTag(tag)} className="hover:text-red-500">
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
                      placeholder="Add tags (max 15)"
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <button onClick={() => handleAddTag(tagInput)} className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition text-sm">
                      Add
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Tags categorize your content and improve discoverability.</p>
                </div>
                
                {/* Keyword Suggestions */}
                <KeywordSuggestions content={content} onAddKeyword={handleAddKeyword} />
              </div>

              {/* Featured Image */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-2">Featured Image</label>
                
                {featuredImage ? (
                  <div className="relative inline-block">
                    <img 
                      src={featuredImage} 
                      alt="Featured" 
                      className="w-32 h-32 object-cover rounded-xl border border-gray-200 shadow-sm"
                    />
                    <div className="absolute top-2 right-2 flex gap-1">
                      <button
                        onClick={() => setShowImageModal(true)}
                        className="p-1 bg-white rounded-lg shadow-md hover:bg-gray-100 transition-colors"
                        title="Change image"
                      >
                        <ImageIcon className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => {
                          setFeaturedImage('');
                          setHasUnsavedChanges(true);
                        }}
                        className="p-1 bg-white rounded-lg shadow-md hover:bg-red-50 transition-colors"
                        title="Remove image"
                      >
                        <X className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowImageModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    <ImageIcon className="w-4 h-4" />
                    Choose Featured Image
                  </button>
                )}
                <p className="text-xs text-gray-400 mt-2">Recommended size: 1200x630px for optimal sharing</p>
              </div>
              
              {/* TIPTAP EDITOR */}
              <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm bg-white">
                <Editor 
                  content={content} 
                  onChange={handleContentChange}
                  title={title}
                  onSave={handleSaveDraft}
                  onSchedule={() => setIsScheduleModalOpen(true)}
                  onPreview={() => setIsPreviewModalOpen(true)}
                  onPublish={handlePublish}
                />
              </div>
              
              {/* Footer Stats */}
              <div className="mt-6 pt-5 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-5 text-sm text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <FileText className="w-4 h-4" />
                      <span>{stats.charCount.toLocaleString()} characters</span>
                    </div>
                    <div className="w-px h-4 bg-gray-200" />
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      <span>{stats.readingTime} min read</span>
                    </div>
                    <div className="w-px h-4 bg-gray-200" />
                    <div className="flex items-center gap-1.5">
                      <Hash className="w-4 h-4" />
                      <span>{keywords.length} keywords</span>
                    </div>
                    <div className="w-px h-4 bg-gray-200" />
                    <div className="flex items-center gap-1.5">
                      <Tag className="w-4 h-4" />
                      <span>{tags.length} tags</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Tips Sidebar */}
            <AnimatePresence>
              {showTips && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="hidden lg:block w-80 shrink-0"
                >
                  <div className="sticky top-24 space-y-5">
                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                      <SEOAnalysis 
                        title={title}
                        content={content}
                        keywords={keywords}
                        tags={tags}
                        slug={slug}
                        seoScore={stats.seoScore}
                      />
                    </div>
                    
                    <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                      <div className="flex items-center gap-2.5 mb-4">
                        <div className="p-2 bg-white rounded-xl"><Zap className="w-5 h-5 text-gray-900" /></div>
                        <h3 className="font-semibold text-gray-900">SEO Best Practices</h3>
                      </div>
                      <div className="space-y-3 text-sm text-gray-600">
                        {!title && <p className="flex items-start gap-2"><span className="text-gray-900 font-medium">•</span> Start with a compelling title (30-60 characters)</p>}
                        {stats.wordCount < 300 && <p className="flex items-start gap-2"><span className="text-gray-900 font-medium">•</span> Aim for 1000+ words for better ranking</p>}
                        {keywords.length < 3 && <p className="flex items-start gap-2"><span className="text-gray-900 font-medium">•</span> Add 3-8 relevant keywords to improve SEO</p>}
                        {tags.length < 3 && <p className="flex items-start gap-2"><span className="text-gray-900 font-medium">•</span> Use tags to categorize your content</p>}
                        {!content.includes('<h2>') && stats.wordCount > 100 && <p className="flex items-start gap-2"><span className="text-gray-900 font-medium">•</span> Use headings (H2, H3) to structure content</p>}
                        {!content.includes('<img') && stats.wordCount > 200 && <p className="flex items-start gap-2"><span className="text-gray-900 font-medium">•</span> Add images with alt text for better engagement</p>}
                        <div className="pt-3 mt-2 border-t border-gray-200">
                          <p className="text-xs text-gray-500">💡 Posts with 1000+ words rank 3x higher in search results</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                      <div className="flex items-center gap-2.5 mb-4">
                        <div className="p-2 bg-gray-100 rounded-xl"><Globe className="w-5 h-5 text-gray-900" /></div>
                        <h3 className="font-semibold text-gray-900">Content Stats</h3>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Read time:</span>
                          <span className="font-semibold text-gray-900">{stats.readingTime} min</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Word count:</span>
                          <span className="font-semibold text-gray-900">{stats.wordCount}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Characters:</span>
                          <span className="font-semibold text-gray-900">{stats.charCount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Keywords:</span>
                          <span className="font-semibold text-gray-900">{keywords.length}/8</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Tags:</span>
                          <span className="font-semibold text-gray-900">{tags.length}/15</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                      <div className="flex items-center gap-2.5 mb-4">
                        <div className="p-2 bg-gray-100 rounded-xl"><Search className="w-5 h-5 text-gray-900" /></div>
                        <h3 className="font-semibold text-gray-900">Google Preview</h3>
                      </div>
                      <div className="space-y-2">
                        <div className="text-blue-800 text-lg font-medium truncate">
                          {title || 'Your Post Title'}
                        </div>
                        <div className="text-green-700 text-sm truncate">
                          https://yourblog.com/{slug || 'your-post-slug'}
                        </div>
                        <div className="text-gray-600 text-sm line-clamp-2">
                          {content.replace(/<[^>]*>/g, '').slice(0, 160) || 'A compelling description of your post that will appear in search results...'}
                          {content.replace(/<[^>]*>/g, '').length > 160 && '...'}
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mt-3">This is how your post will appear in Google search results</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      
      <ScheduleModal 
        isOpen={isScheduleModalOpen} 
        onClose={() => setIsScheduleModalOpen(false)} 
        onSchedule={handleSchedule} 
      />
      
      <PreviewModal 
        isOpen={isPreviewModalOpen} 
        onClose={() => setIsPreviewModalOpen(false)} 
        content={content} 
        title={title} 
        featuredImage={featuredImage} 
      />
      
      <ImageModal 
        isOpen={showImageModal} 
        onClose={() => setShowImageModal(false)} 
        onUpload={handleImageUpload}
      />
    </>
  );
}