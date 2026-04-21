// src/pages/admin/posts.js (FIXED - without BlockNoteEditor)

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { generateSlug, ensureUniqueSlug, createUniqueSlug } from '@/utils/slugify';
import toast, { Toaster } from 'react-hot-toast';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import AdminNavigation from '@/components/admin/AdminNavigation';

// Dynamic imports for client-side only components with error fallbacks
// REMOVED: PremiumEditor import since we're using a simple textarea instead

const MediaUploader = dynamic(
  () => import('@/components/shared/MediaUploader').catch(err => {
    console.error('Failed to load media uploader:', err);
    return () => <div className="media-error">Media uploader failed to load</div>;
  }), 
  { 
    ssr: false,
    loading: () => <div className="media-loading">Loading media uploader...</div>
  }
);

const PreviewModal = dynamic(
  () => import('@/components/shared/PreviewModal').catch(err => {
    console.error('Failed to load preview modal:', err);
    return () => null;
  }), 
  { ssr: false }
);

export default function PostEditor() {
  const router = useRouter();
  const { id } = router.query;
  const isEditMode = !!id;
  
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showSchedulePicker, setShowSchedulePicker] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  
  // Post Data
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [featuredImage, setFeaturedImage] = useState(null);
  const [featuredVideo, setFeaturedVideo] = useState(null);
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [status, setStatus] = useState('draft');
  const [scheduledDate, setScheduledDate] = useState(null);
  const [isFeatured, setIsFeatured] = useState(false);
  
  // SEO Data
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  
  const categories = ['Technology', 'Wealth', 'Health', 'Growth', 'Entertainment', 'World', 'Lifestyle'];

  // Fetch post on mount if in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      fetchPost();
    }
  }, [id, isEditMode]);

  // Check Supabase configuration
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      toast.error('Supabase is not configured. Please check your environment variables.');
    }
  }, []);

  const fetchPost = async () => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('Fetch error:', error);
        toast.error('Failed to load post: ' + error.message);
        router.push('/admin/dashboard');
        return;
      }

      if (!data) {
        toast.error('Post not found');
        router.push('/admin/dashboard');
        return;
      }

      setTitle(data.title || '');
      setSlug(data.slug || '');
      setContent(data.content || '');
      setExcerpt(data.excerpt || '');
      setCategory(data.category || '');
      setTags(data.tags || []);
      setStatus(data.status || 'draft');
      setIsFeatured(data.is_featured || false);
      
      if (data.scheduled_for) {
        setScheduledDate(new Date(data.scheduled_for));
      }
      
      setSeoTitle(data.seo_title || '');
      setSeoDescription(data.seo_description || '');
      
      if (data.featured_image) {
        setFeaturedImage({ url: data.featured_image });
      }
      
      if (data.featured_video) {
        setFeaturedVideo({ url: data.featured_video });
      }
      
      if (data.slug) {
        setSlugManuallyEdited(true);
      }
      
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('An unexpected error occurred');
      router.push('/admin/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    
    if (!slugManuallyEdited && (!isEditMode || !slug)) {
      setSlug(generateSlug(newTitle));
    }
  };

  const handleSlugChange = (e) => {
    const newSlug = generateSlug(e.target.value);
    setSlug(newSlug);
    setSlugManuallyEdited(true);
  };

  const addTag = () => {
    const trimmedTag = tagInput.trim().toLowerCase();
    
    if (!trimmedTag) {
      toast.error('Please enter a tag');
      return;
    }
    
    if (trimmedTag.length > 30) {
      toast.error('Tag must be less than 30 characters');
      return;
    }
    
    if (tags.includes(trimmedTag)) {
      toast.error('Tag already exists');
      return;
    }
    
    if (tags.length >= 10) {
      toast.error('Maximum 10 tags allowed');
      return;
    }
    
    setTags([...tags, trimmedTag]);
    setTagInput('');
    toast.success(`Tag added: ${trimmedTag}`);
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
    toast.success(`Tag removed: ${tagToRemove}`);
  };

  const validatePost = () => {
    if (!title.trim()) {
      toast.error('Please enter a title');
      return false;
    }
    
    if (!content || content.trim() === '') {
      toast.error('Please add some content to your post');
      return false;
    }
    
    if (excerpt.length > 160) {
      toast.error('Excerpt must be less than 160 characters');
      return false;
    }
    
    if (seoTitle && seoTitle.length > 60) {
      toast.error('SEO title must be less than 60 characters');
      return false;
    }
    
    if (seoDescription && seoDescription.length > 160) {
      toast.error('Meta description must be less than 160 characters');
      return false;
    }
    
    return true;
  };

  const savePost = async (publishStatus = null) => {
    if (!validatePost()) return;
    
    setSaving(true);
    
    try {
      let finalStatus = publishStatus || status;
      
      if (scheduledDate && publishStatus === null && finalStatus !== 'published') {
        finalStatus = 'scheduled';
        
        if (scheduledDate <= new Date()) {
          toast.error('Scheduled date must be in the future');
          setSaving(false);
          return;
        }
      }
      
      if (publishStatus === 'published') {
        setScheduledDate(null);
      }
      
      let uniqueSlug = slug || generateSlug(title);
      
      if (!slugManuallyEdited || !slug) {
        uniqueSlug = await createUniqueSlug(supabase, title, isEditMode ? id : null);
      } else {
        const existingSlug = await ensureUniqueSlug(supabase, slug, isEditMode ? id : null);
        if (existingSlug !== slug) {
          toast.custom((t) => (
            <div className="bg-yellow-100 text-yellow-800 p-3 rounded-lg">
              Slug "{slug}" is already taken. Using "{existingSlug}" instead.
              <button onClick={() => toast.dismiss(t.id)} className="ml-2 underline">Dismiss</button>
            </div>
          ), { duration: 5000 });
          uniqueSlug = existingSlug;
          setSlug(uniqueSlug);
        } else {
          uniqueSlug = slug;
        }
      }
      
      const postData = {
        title: title.trim(),
        slug: uniqueSlug,
        excerpt: excerpt || (title.length > 160 ? title.substring(0, 157) + '...' : title),
        content: content,
        category: category || null,
        tags: tags,
        status: finalStatus,
        is_featured: isFeatured,
        seo_title: seoTitle || title.substring(0, 60),
        seo_description: seoDescription || (excerpt || title).substring(0, 160),
        updated_at: new Date().toISOString(),
      };
      
      if (featuredImage?.url) {
        postData.featured_image = featuredImage.url;
      }
      
      if (featuredVideo?.url) {
        postData.featured_video = featuredVideo.url;
      }
      
      if (finalStatus === 'scheduled' && scheduledDate) {
        postData.scheduled_for = scheduledDate.toISOString();
      }
      
      if (finalStatus === 'published') {
        postData.published_at = new Date().toISOString();
      }
      
      let result;
      
      if (isEditMode) {
        result = await supabase
          .from('posts')
          .update(postData)
          .eq('id', id)
          .select()
          .single();
        
        if (result.error) throw result.error;
        
      } else {
        postData.created_at = new Date().toISOString();
        
        result = await supabase
          .from('posts')
          .insert([postData])
          .select()
          .single();
        
        if (result.error) throw result.error;
      }
      
      let successMessage = '';
      if (finalStatus === 'published') {
        successMessage = '🎉 Post published successfully!';
      } else if (finalStatus === 'scheduled') {
        const formattedDate = scheduledDate.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit'
        });
        successMessage = `📅 Post scheduled for ${formattedDate}!`;
      } else {
        successMessage = '💾 Draft saved successfully!';
      }
      
      toast.success(successMessage);
      
      if (!isEditMode) {
        router.push('/admin/dashboard');
      } else {
        await fetchPost();
      }
      
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save: ' + (error.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const autoSaveDraft = useCallback(() => {
    if (!title && !content) return;
    if (status === 'published') return;
    
    const timer = setTimeout(() => {
      savePost('draft');
    }, 30000);
    
    return () => clearTimeout(timer);
  }, [title, content, status]);

  useEffect(() => {
    const cleanup = autoSaveDraft();
    return () => {
      if (cleanup) cleanup();
    };
  }, [title, content, autoSaveDraft]);

  if (loading) {
    return (
      <AdminNavigation>
        <div className="loading-screen">
          <div className="loading-spinner"></div>
          <p>Loading your post...</p>
        </div>
        <style jsx>{`
          .loading-screen {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 16px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }
          .loading-spinner {
            width: 50px;
            height: 50px;
            border: 3px solid rgba(255,255,255,0.3);
            border-top-color: white;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </AdminNavigation>
    );
  }

  return (
    <AdminNavigation>
      <div className="post-editor">
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
              borderRadius: '12px',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        
        <header className="editor-header">
          <div className="header-container">
            <div className="header-left">
              <h1>{isEditMode ? 'Edit Post' : 'Create New Post'}</h1>
              {status === 'published' && <span className="published-badge">Published</span>}
              {status === 'scheduled' && <span className="scheduled-badge">Scheduled</span>}
            </div>
            
            <div className="header-actions">
              <button 
                onClick={() => savePost('draft')} 
                disabled={saving} 
                className="btn-draft"
              >
                💾 {saving ? 'Saving...' : 'Save Draft'}
              </button>
              <button 
                onClick={() => setShowSchedulePicker(true)} 
                disabled={saving} 
                className="btn-schedule"
              >
                📅 Schedule
              </button>
              <button 
                onClick={() => savePost('published')} 
                disabled={saving} 
                className="btn-publish"
              >
                🚀 {saving ? 'Publishing...' : 'Publish'}
              </button>
              <button 
                onClick={() => setShowPreview(true)} 
                className="btn-preview"
              >
                👁️ Preview
              </button>
            </div>
          </div>
        </header>

        {showSchedulePicker && (
          <div className="schedule-modal" onClick={() => setShowSchedulePicker(false)}>
            <div className="schedule-modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Schedule Post</h3>
              <DatePicker
                selected={scheduledDate}
                onChange={date => {
                  setScheduledDate(date);
                  setShowSchedulePicker(false);
                  toast.success(`Post scheduled for ${date.toLocaleString()}`);
                  setTimeout(() => savePost('scheduled'), 100);
                }}
                showTimeSelect
                minDate={new Date()}
                dateFormat="MMMM d, yyyy h:mm aa"
                inline
              />
              <button className="close-schedule" onClick={() => setShowSchedulePicker(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="title-section">
          <div className="title-container">
            <input
              type="text"
              placeholder="Add title"
              value={title}
              onChange={handleTitleChange}
              className="title-input"
            />
            <div className="slug-preview">
              <span>trendlin.com/blog/</span>
              <input
                type="text"
                value={slug}
                onChange={handleSlugChange}
                placeholder="post-url"
                className="slug-input"
              />
              <button 
                onClick={() => setSlug(generateSlug(title))}
                className="slug-generate"
                title="Generate from title"
              >
                ↻
              </button>
            </div>
          </div>
        </div>

        <div className="editor-grid">
          <div className="editor-column">
            <MediaUploader
              onImageUpload={setFeaturedImage}
              onVideoUpload={setFeaturedVideo}
              image={featuredImage}
              video={featuredVideo}
            />
            
            {/* REPLACED: PremiumEditor with a simple textarea */}
            <div className="editor-wrapper">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your post content here..."
                className="content-textarea"
                rows={20}
              />
            </div>
          </div>

          <div className="settings-column">
            <div className="settings-card">
              <h3>📊 Status</h3>
              <div className="status-buttons">
                <button 
                  onClick={() => setStatus('draft')} 
                  className={`status-draft ${status === 'draft' ? 'active' : ''}`}
                >
                  Draft
                </button>
                <button 
                  onClick={() => setStatus('published')} 
                  className={`status-published ${status === 'published' ? 'active' : ''}`}
                >
                  Published
                </button>
                <button 
                  onClick={() => setStatus('scheduled')} 
                  className={`status-scheduled ${status === 'scheduled' ? 'active' : ''}`}
                >
                  Scheduled
                </button>
              </div>
            </div>

            <div className="settings-card">
              <label className="featured-toggle">
                <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
                <span className="toggle-slider"></span>
                <span>⭐ Feature this post</span>
              </label>
              <p className="card-hint">Featured posts appear at the top of your blog</p>
            </div>

            <div className="settings-card">
              <h3>📁 Category</h3>
              <div className="category-list">
                {categories.map(cat => (
                  <button 
                    key={cat} 
                    onClick={() => setCategory(cat)} 
                    className={`category-item ${category === cat ? 'active' : ''}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="settings-card">
              <h3>🏷️ Tags</h3>
              <div className="tags-list">
                {tags.map(tag => (
                  <span key={tag} className="tag">
                    #{tag}
                    <button onClick={() => removeTag(tag)}>×</button>
                  </span>
                ))}
              </div>
              <div className="tag-input-group">
                <input 
                  type="text" 
                  value={tagInput} 
                  onChange={(e) => setTagInput(e.target.value)} 
                  onKeyPress={(e) => e.key === 'Enter' && addTag()} 
                  placeholder="Add a tag..." 
                  maxLength={30}
                />
                <button onClick={addTag}>Add</button>
              </div>
              <p className="card-hint">{tags.length}/10 tags used</p>
            </div>

            <div className="settings-card">
              <h3>🔍 SEO Settings</h3>
              <div className="seo-field">
                <label>SEO Title</label>
                <input 
                  type="text" 
                  value={seoTitle} 
                  onChange={(e) => setSeoTitle(e.target.value.slice(0, 60))} 
                  placeholder={title} 
                  maxLength={60}
                />
                <span className={`field-hint ${seoTitle?.length === 60 ? 'text-red-500' : ''}`}>
                  {seoTitle?.length || title?.length || 0}/60
                </span>
              </div>
              <div className="seo-field">
                <label>Meta Description</label>
                <textarea 
                  value={seoDescription} 
                  onChange={(e) => setSeoDescription(e.target.value.slice(0, 160))} 
                  placeholder={excerpt || title} 
                  rows="3"
                  maxLength={160}
                />
                <span className={`field-hint ${seoDescription?.length === 160 ? 'text-red-500' : ''}`}>
                  {seoDescription?.length || excerpt?.length || 0}/160
                </span>
              </div>
            </div>

            <div className="settings-card">
              <h3>📝 Excerpt</h3>
              <textarea 
                value={excerpt} 
                onChange={(e) => setExcerpt(e.target.value.slice(0, 160))} 
                placeholder="Write a compelling excerpt..." 
                rows="4"
                maxLength={160}
              />
              <span className={`field-hint ${excerpt.length === 160 ? 'text-red-500' : ''}`}>
                {excerpt.length}/160 characters
              </span>
            </div>
          </div>
        </div>

        {showPreview && (
          <PreviewModal
            title={title}
            content={content}
            featuredImage={featuredImage}
            featuredVideo={featuredVideo}
            onClose={() => setShowPreview(false)}
          />
        )}

        <style jsx>{`
          .post-editor { min-height: 100vh; background: #f5f7fb; }
          .editor-header { position: sticky; top: 0; z-index: 50; background: white; border-bottom: 1px solid #e2e8f0; padding: 16px 24px; }
          .header-container { max-width: 1400px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; }
          .header-left { display: flex; align-items: center; gap: 16px; }
          .header-left h1 { font-size: 24px; font-weight: 700; color: #1e293b; margin: 0; }
          .published-badge { background: #10b981; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; }
          .scheduled-badge { background: #f59e0b; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; }
          .header-actions { display: flex; gap: 12px; flex-wrap: wrap; }
          .header-actions button { display: flex; align-items: center; gap: 8px; padding: 10px 20px; border-radius: 40px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s; border: none; }
          .btn-draft { background: #f1f5f9; color: #475569; }
          .btn-draft:hover:not(:disabled) { background: #e2e8f0; transform: translateY(-1px); }
          .btn-schedule { background: #fef3c7; color: #d97706; }
          .btn-schedule:hover:not(:disabled) { background: #fde68a; transform: translateY(-1px); }
          .btn-publish { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
          .btn-publish:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4); }
          .btn-preview { background: transparent; border: 1px solid #cbd5e1; color: #64748b; }
          .btn-preview:hover { background: #f8fafc; border-color: #667eea; color: #667eea; }
          button:disabled { opacity: 0.6; cursor: not-allowed; }
          .schedule-modal { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
          .schedule-modal-content { background: white; border-radius: 24px; padding: 24px; max-width: 500px; width: 90%; text-align: center; }
          .schedule-modal-content h3 { font-size: 20px; margin-bottom: 16px; }
          .close-schedule { margin-top: 16px; padding: 8px 20px; background: #f1f5f9; border: none; border-radius: 40px; cursor: pointer; }
          .title-section { background: white; border-bottom: 1px solid #e2e8f0; padding: 24px; }
          .title-container { max-width: 1400px; margin: 0 auto; }
          .title-input { width: 100%; font-size: 48px; font-weight: 700; border: none; outline: none; padding: 0; margin-bottom: 16px; color: #1e293b; }
          .title-input::placeholder { color: #cbd5e1; }
          .slug-preview { display: flex; align-items: center; gap: 8px; padding: 8px 0; color: #64748b; font-size: 14px; flex-wrap: wrap; }
          .slug-preview span { color: #64748b; }
          .slug-input { border: none; outline: none; background: transparent; color: #667eea; font-size: 14px; padding: 4px 8px; border-radius: 4px; }
          .slug-input:focus { background: #f1f5f9; }
          .slug-generate { background: none; border: none; cursor: pointer; font-size: 16px; color: #94a3b8; padding: 4px 8px; border-radius: 4px; }
          .slug-generate:hover { background: #f1f5f9; color: #667eea; }
          .editor-grid { max-width: 1400px; margin: 0 auto; padding: 24px; display: grid; grid-template-columns: 1fr 360px; gap: 24px; }
          @media (max-width: 1024px) { .editor-grid { grid-template-columns: 1fr; } }
          .editor-column { display: flex; flex-direction: column; gap: 24px; }
          .editor-wrapper { background: white; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; }
          .content-textarea { width: 100%; padding: 20px; font-size: 16px; line-height: 1.6; border: none; outline: none; resize: vertical; font-family: inherit; min-height: 400px; }
          .content-textarea::placeholder { color: #cbd5e1; }
          .settings-column { display: flex; flex-direction: column; gap: 24px; }
          .settings-card { background: white; border-radius: 20px; padding: 20px; border: 1px solid #e2e8f0; }
          .settings-card h3 { font-size: 16px; font-weight: 600; color: #1e293b; margin-bottom: 16px; }
          .status-buttons { display: flex; gap: 8px; }
          .status-buttons button { flex: 1; padding: 8px; border-radius: 40px; border: none; cursor: pointer; font-weight: 500; transition: all 0.2s; }
          .status-draft { background: #f1f5f9; color: #475569; }
          .status-draft.active { background: #475569; color: white; }
          .status-published { background: #dcfce7; color: #166534; }
          .status-published.active { background: #10b981; color: white; }
          .status-scheduled { background: #fef3c7; color: #92400e; }
          .status-scheduled.active { background: #f59e0b; color: white; }
          .featured-toggle { display: flex; align-items: center; gap: 12px; cursor: pointer; }
          .featured-toggle input { display: none; }
          .toggle-slider { width: 44px; height: 24px; background: #cbd5e1; border-radius: 24px; position: relative; transition: all 0.3s; }
          .toggle-slider:before { content: ''; position: absolute; width: 20px; height: 20px; background: white; border-radius: 50%; top: 2px; left: 2px; transition: all 0.3s; }
          .featured-toggle input:checked + .toggle-slider { background: #667eea; }
          .featured-toggle input:checked + .toggle-slider:before { transform: translateX(20px); }
          .card-hint { font-size: 12px; color: #94a3b8; margin-top: 8px; }
          .category-list { display: flex; flex-wrap: wrap; gap: 8px; }
          .category-item { padding: 6px 14px; background: #f1f5f9; border: none; border-radius: 40px; font-size: 13px; cursor: pointer; transition: all 0.2s; }
          .category-item:hover { background: #e2e8f0; }
          .category-item.active { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
          .tags-list { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
          .tag { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; background: #f1f5f9; border-radius: 40px; font-size: 12px; color: #475569; }
          .tag button { background: none; border: none; cursor: pointer; font-size: 14px; color: #94a3b8; padding: 0 4px; }
          .tag button:hover { color: #ef4444; }
          .tag-input-group { display: flex; gap: 8px; }
          .tag-input-group input { flex: 1; padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 12px; font-size: 13px; }
          .tag-input-group input:focus { outline: none; border-color: #667eea; }
          .tag-input-group button { padding: 8px 16px; background: #f1f5f9; border: none; border-radius: 12px; cursor: pointer; }
          .tag-input-group button:hover { background: #e2e8f0; }
          .seo-field { margin-bottom: 16px; }
          .seo-field label { display: block; font-size: 13px; font-weight: 500; margin-bottom: 6px; color: #475569; }
          .seo-field input, .seo-field textarea { width: 100%; padding: 10px 12px; border: 1px solid #e2e8f0; border-radius: 12px; font-size: 13px; resize: none; font-family: inherit; }
          .seo-field input:focus, .seo-field textarea:focus { outline: none; border-color: #667eea; }
          .field-hint { display: block; font-size: 11px; color: #94a3b8; margin-top: 4px; }
          .text-red-500 { color: #ef4444; }
          .settings-card textarea { width: 100%; padding: 10px 12px; border: 1px solid #e2e8f0; border-radius: 12px; font-size: 13px; resize: none; font-family: inherit; }
          .settings-card textarea:focus { outline: none; border-color: #667eea; }
          @media (max-width: 768px) {
            .title-input { font-size: 32px; }
            .header-actions button span { display: none; }
            .header-actions button { padding: 10px 14px; }
            .editor-grid { padding: 16px; }
          }
        `}</style>
      </div>
    </AdminNavigation>
  );
}