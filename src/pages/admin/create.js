// pages/admin/create.js - Premium Enhanced Version
import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'
import Typography from '@tiptap/extension-typography'
import {
  FiBold, FiItalic, FiStrikethrough, FiCode, FiLink, FiImage,
  FiList, FiListOrdered, FiAlignLeft, FiAlignCenter, FiAlignRight,
  FiAlignJustify, FiChevronDown, FiSave, FiEye, FiClock, FiStar,
  FiTag, FiFolder, FiHash, FiCalendar, FiGlobe, FiArrowLeft,
  FiCheckCircle, FiAlertCircle, FiInfo, FiX, FiPlus, FiTrash2
} from 'react-icons/fi'

export default function CreatePost() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: 'technology',
    tags: [],
    status: 'draft',
    seo_title: '',
    seo_description: '',
    seo_slug: '',
    scheduled_for: null,
    is_featured: false,
    featured_image: null,
    reading_time: 0
  })
  const [tagInput, setTagInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [imageUploading, setImageUploading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [unsavedChanges, setUnsavedChanges] = useState(false)
  const [notification, setNotification] = useState(null)
  const [slugPreview, setSlugPreview] = useState('')
  const fileInputRef = useRef(null)
  const titleInputRef = useRef(null)

  // Premium Rich Text Editor with TipTap
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Write your amazing story here... Use / for commands',
        emptyEditorClass: 'placeholder-text'
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { target: '_blank', rel: 'noopener noreferrer' }
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: { class: 'editor-image' }
      }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Highlight,
      Typography
    ],
    content: formData.content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      setFormData(prev => ({ ...prev, content: html }))
      setUnsavedChanges(true)
      // Calculate reading time
      const text = editor.getText()
      const wordsPerMinute = 200
      const wordCount = text.trim().split(/\s+/).length
      const readingTime = Math.max(1, Math.ceil(wordCount / wordsPerMinute))
      setFormData(prev => ({ ...prev, reading_time: readingTime }))
    }
  })

  const categories = [
    { value: 'technology', label: '💻 Technology', icon: '🚀', color: '#6366f1' },
    { value: 'wealth', label: '💰 Wealth', icon: '💎', color: '#f59e0b' },
    { value: 'health', label: '💪 Health', icon: '🧘', color: '#10b981' },
    { value: 'growth', label: '🌱 Growth', icon: '📈', color: '#8b5cf6' },
    { value: 'entertainment', label: '🎬 Entertainment', icon: '🎭', color: '#ec4899' },
    { value: 'world', label: '🌍 World', icon: '🌎', color: '#06b6d4' },
    { value: 'lifestyle', label: '✨ Lifestyle', icon: '🌟', color: '#f97316' }
  ]

  const generateSlug = useCallback((title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 200)
  }, [])

  useEffect(() => {
    if (formData.title && !formData.seo_slug) {
      setSlugPreview(generateSlug(formData.title))
    } else if (formData.seo_slug) {
      setSlugPreview(formData.seo_slug)
    }
  }, [formData.title, formData.seo_slug, generateSlug])

  // Auto-save draft every 30 seconds
  useEffect(() => {
    if (!unsavedChanges || formData.status === 'published') return
    
    const autoSaveInterval = setInterval(async () => {
      if (formData.title || formData.content) {
        await saveToLocalStorage()
      }
    }, 30000)
    
    return () => clearInterval(autoSaveInterval)
  }, [formData, unsavedChanges])

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (unsavedChanges) {
        e.preventDefault()
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?'
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [unsavedChanges])

  const saveToLocalStorage = async () => {
    const draft = {
      ...formData,
      saved_at: new Date().toISOString()
    }
    localStorage.setItem('post_draft', JSON.stringify(draft))
    showNotification('Draft saved locally', 'success')
    setUnsavedChanges(false)
  }

  const loadFromLocalStorage = () => {
    const draft = localStorage.getItem('post_draft')
    if (draft) {
      const parsed = JSON.parse(draft)
      if (confirm('Load auto-saved draft?')) {
        setFormData(parsed)
        if (editor && parsed.content) {
          editor.commands.setContent(parsed.content)
        }
        showNotification('Draft restored', 'info')
      }
    }
  }

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 4000)
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim().toLowerCase())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim().toLowerCase()]
      })
      setTagInput('')
      setUnsavedChanges(true)
    }
  }

  const handleRemoveTag = (tag) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tag)
    })
    setUnsavedChanges(true)
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    if (!file.type.startsWith('image/')) {
      showNotification('Please upload an image file', 'error')
      return
    }
    
    if (file.size > 5 * 1024 * 1024) {
      showNotification('Image must be less than 5MB', 'error')
      return
    }
    
    setImageUploading(true)
    
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `post-images/${fileName}`
      
      const { error: uploadError, data } = await supabase.storage
        .from('blog-images')
        .upload(filePath, file)
      
      if (uploadError) throw uploadError
      
      const { data: { publicUrl } } = supabase.storage
        .from('blog-images')
        .getPublicUrl(filePath)
      
      if (editor) {
        editor.chain().focus().setImage({ src: publicUrl }).run()
      }
      
      showNotification('Image uploaded successfully', 'success')
    } catch (error) {
      console.error('Upload error:', error)
      showNotification('Failed to upload image', 'error')
    } finally {
      setImageUploading(false)
    }
  }

  const handleSubmit = async (e, publishImmediately = false) => {
    e.preventDefault()
    setSaving(true)
    
    if (!formData.title.trim()) {
      showNotification('Please enter a post title', 'error')
      setSaving(false)
      return
    }
    
    if (!formData.content.trim()) {
      showNotification('Please add some content to your post', 'error')
      setSaving(false)
      return
    }
    
    const slug = formData.seo_slug || generateSlug(formData.title)
    
    // Check if slug already exists
    const { data: existing } = await supabase
      .from('posts')
      .select('slug')
      .eq('slug', slug)
      .single()
    
    if (existing) {
      showNotification('Slug already exists. Please use a different slug.', 'error')
      setSaving(false)
      return
    }
    
    const finalStatus = publishImmediately ? 'published' : formData.status
    
    const postData = {
      title: formData.title.trim(),
      slug,
      excerpt: formData.excerpt.trim() || formData.content.replace(/<[^>]*>/g, '').substring(0, 160),
      content: formData.content,
      category: formData.category,
      tags: formData.tags,
      status: finalStatus,
      seo_title: formData.seo_title || formData.title,
      seo_description: formData.seo_description || formData.excerpt?.substring(0, 160),
      is_featured: formData.is_featured,
      scheduled_for: formData.scheduled_for,
      reading_time: formData.reading_time,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    const { error } = await supabase.from('posts').insert([postData])
    
    if (error) {
      showNotification('Error: ' + error.message, 'error')
      setSaving(false)
    } else {
      localStorage.removeItem('post_draft')
      showNotification(finalStatus === 'published' ? 'Post published successfully!' : 'Draft saved successfully!', 'success')
      setTimeout(() => router.push('/admin'), 1500)
    }
  }

  const ToolbarButton = ({ onClick, isActive, icon: Icon, label }) => (
    <button
      type="button"
      onClick={onClick}
      className={`toolbar-btn ${isActive ? 'active' : ''}`}
      title={label}
    >
      <Icon size={18} />
    </button>
  )

  return (
    <div className="create-post-premium">
      {/* Premium Header */}
      <header className="premium-header">
        <div className="header-left">
          <button onClick={() => router.push('/admin')} className="back-btn">
            <FiArrowLeft size={20} />
            <span>Back to Dashboard</span>
          </button>
          <div className="post-status">
            <span className={`status-badge ${formData.status}`}>
              {formData.status === 'draft' && '📝 Draft'}
              {formData.status === 'review' && '🔍 Review'}
              {formData.status === 'published' && '✅ Published'}
            </span>
            {formData.reading_time > 0 && (
              <span className="reading-time">
                <FiClock size={14} />
                {formData.reading_time} min read
              </span>
            )}
          </div>
        </div>
        
        <div className="header-right">
          <button onClick={loadFromLocalStorage} className="header-btn" title="Load Draft">
            <FiSave size={18} />
            <span>Load Draft</span>
          </button>
          <button onClick={() => setShowPreview(!showPreview)} className="header-btn">
            <FiEye size={18} />
            <span>{showPreview ? 'Edit' : 'Preview'}</span>
          </button>
          <button onClick={() => handleSubmit(new Event('submit'), false)} disabled={saving} className="save-btn">
            <FiSave size={18} />
            {saving ? 'Saving...' : 'Save Draft'}
          </button>
          <button onClick={(e) => handleSubmit(e, true)} disabled={saving} className="publish-btn">
            <FiCheckCircle size={18} />
            Publish
          </button>
        </div>
      </header>

      {/* Toast Notification */}
      {notification && (
        <div className={`toast-notification ${notification.type}`}>
          {notification.type === 'success' && <FiCheckCircle />}
          {notification.type === 'error' && <FiAlertCircle />}
          {notification.type === 'info' && <FiInfo />}
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)}><FiX /></button>
        </div>
      )}

      <div className="premium-container">
        {!showPreview ? (
          <form onSubmit={(e) => handleSubmit(e, false)} className="post-form">
            {/* Main Content Area */}
            <div className="main-content">
              {/* Title Input with Character Count */}
              <div className="title-wrapper">
                <input
                  ref={titleInputRef}
                  type="text"
                  placeholder="Write an amazing title..."
                  value={formData.title}
                  onChange={(e) => {
                    setFormData({...formData, title: e.target.value})
                    setUnsavedChanges(true)
                  }}
                  className="premium-title-input"
                />
                <div className="title-character-count">
                  {formData.title.length}/120
                </div>
              </div>
              
              {/* Featured Image Upload */}
              <div className="featured-image-area">
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="upload-image-btn"
                  disabled={imageUploading}
                >
                  <FiImage size={24} />
                  {imageUploading ? 'Uploading...' : 'Upload Featured Image'}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
              </div>
              
              {/* Rich Text Editor Toolbar */}
              {editor && (
                <div className="editor-toolbar">
                  <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    isActive={editor.isActive('bold')}
                    icon={FiBold}
                    label="Bold"
                  />
                  <ToolbarButton
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    isActive={editor.isActive('italic')}
                    icon={FiItalic}
                    label="Italic"
                  />
                  <ToolbarButton
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    isActive={editor.isActive('strike')}
                    icon={FiStrikethrough}
                    label="Strikethrough"
                  />
                  <ToolbarButton
                    onClick={() => editor.chain().focus().toggleCode().run()}
                    isActive={editor.isActive('code')}
                    icon={FiCode}
                    label="Code"
                  />
                  <div className="toolbar-divider" />
                  <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    isActive={editor.isActive('heading', { level: 1 })}
                    icon={() => <span className="heading-icon">H1</span>}
                    label="Heading 1"
                  />
                  <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    isActive={editor.isActive('heading', { level: 2 })}
                    icon={() => <span className="heading-icon">H2</span>}
                    label="Heading 2"
                  />
                  <div className="toolbar-divider" />
                  <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    isActive={editor.isActive('bulletList')}
                    icon={FiList}
                    label="Bullet List"
                  />
                  <ToolbarButton
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    isActive={editor.isActive('orderedList')}
                    icon={FiListOrdered}
                    label="Numbered List"
                  />
                  <div className="toolbar-divider" />
                  <ToolbarButton
                    onClick={() => editor.chain().focus().setTextAlign('left').run()}
                    isActive={editor.isActive({ textAlign: 'left' })}
                    icon={FiAlignLeft}
                    label="Align Left"
                  />
                  <ToolbarButton
                    onClick={() => editor.chain().focus().setTextAlign('center').run()}
                    isActive={editor.isActive({ textAlign: 'center' })}
                    icon={FiAlignCenter}
                    label="Center"
                  />
                  <ToolbarButton
                    onClick={() => editor.chain().focus().setTextAlign('right').run()}
                    isActive={editor.isActive({ textAlign: 'right' })}
                    icon={FiAlignRight}
                    label="Align Right"
                  />
                  <div className="toolbar-divider" />
                  <ToolbarButton
                    onClick={() => {
                      const url = window.prompt('Enter URL:')
                      if (url) {
                        editor.chain().focus().setLink({ href: url }).run()
                      }
                    }}
                    isActive={editor.isActive('link')}
                    icon={FiLink}
                    label="Add Link"
                  />
                </div>
              )}
              
              {/* Editor Content */}
              <div className="editor-wrapper">
                <EditorContent editor={editor} className="premium-editor" />
              </div>
              
              {/* Excerpt Input with Live Preview */}
              <div className="excerpt-section">
                <label>Post Excerpt</label>
                <textarea
                  placeholder="Write a compelling summary that appears in blog listings and social shares..."
                  value={formData.excerpt}
                  onChange={(e) => {
                    setFormData({...formData, excerpt: e.target.value})
                    setUnsavedChanges(true)
                  }}
                  rows="3"
                  className="excerpt-textarea"
                  maxLength="200"
                />
                <div className="excerpt-footer">
                  <span className="excerpt-count">{formData.excerpt.length}/200 characters</span>
                  <span className="excerpt-hint">Appears in blog listings and SEO meta descriptions</span>
                </div>
              </div>
            </div>
            
            {/* Premium Sidebar Settings */}
            <div className="settings-sidebar-premium">
              {/* Publish Card */}
              <div className="setting-card">
                <div className="card-header">
                  <FiCalendar size={18} />
                  <h3>Publishing</h3>
                </div>
                <div className="setting-field">
                  <label>Status</label>
                  <div className="status-options">
                    {['draft', 'review', 'published'].map(status => (
                      <button
                        key={status}
                        type="button"
                        className={`status-option ${formData.status === status ? 'active' : ''}`}
                        onClick={() => setFormData({...formData, status})}
                      >
                        {status === 'draft' && '📝 Draft'}
                        {status === 'review' && '🔍 Review'}
                        {status === 'published' && '✅ Published'}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="setting-field">
                  <label>Schedule for later</label>
                  <input
                    type="datetime-local"
                    value={formData.scheduled_for || ''}
                    onChange={(e) => setFormData({...formData, scheduled_for: e.target.value})}
                    className="premium-input"
                  />
                </div>
                <div className="setting-field checkbox-field">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.is_featured}
                      onChange={(e) => setFormData({...formData, is_featured: e.target.checked})}
                    />
                    <span className="checkbox-custom"></span>
                    <span className="checkbox-text">
                      <FiStar size={16} />
                      Feature this post
                    </span>
                  </label>
                  <p className="field-hint">Featured posts appear at the top of your blog</p>
                </div>
              </div>
              
              {/* Category Card */}
              <div className="setting-card">
                <div className="card-header">
                  <FiFolder size={18} />
                  <h3>Category</h3>
                </div>
                <div className="category-grid">
                  {categories.map(cat => (
                    <button
                      key={cat.value}
                      type="button"
                      className={`category-option ${formData.category === cat.value ? 'active' : ''}`}
                      style={{ '--cat-color': cat.color }}
                      onClick={() => setFormData({...formData, category: cat.value})}
                    >
                      <span className="category-icon">{cat.icon}</span>
                      <span className="category-name">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Tags Card */}
              <div className="setting-card">
                <div className="card-header">
                  <FiTag size={18} />
                  <h3>Tags</h3>
                </div>
                <div className="tags-input-wrapper">
                  <div className="tags-input-group">
                    <FiHash size={16} className="input-icon" />
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                      placeholder="Add tags (e.g., react, nextjs, design)"
                      className="tags-input-field"
                    />
                    <button type="button" onClick={handleAddTag} className="add-tag-btn">
                      <FiPlus size={16} />
                    </button>
                  </div>
                  <div className="tags-container">
                    {formData.tags.map(tag => (
                      <span key={tag} className="premium-tag">
                        #{tag}
                        <button type="button" onClick={() => handleRemoveTag(tag)}>
                          <FiX size={12} />
                        </button>
                      </span>
                    ))}
                    {formData.tags.length === 0 && (
                      <span className="empty-tags-hint">No tags added yet</span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* SEO Card */}
              <div className="setting-card seo-card">
                <div className="card-header">
                  <FiGlobe size={18} />
                  <h3>SEO & Social</h3>
                </div>
                <div className="setting-field">
                  <label>Meta Title</label>
                  <input
                    type="text"
                    placeholder="SEO optimized title"
                    value={formData.seo_title}
                    onChange={(e) => setFormData({...formData, seo_title: e.target.value})}
                    className="premium-input"
                    maxLength="60"
                  />
                  <div className="field-counter">{formData.seo_title?.length || 0}/60</div>
                </div>
                <div className="setting-field">
                  <label>Meta Description</label>
                  <textarea
                    placeholder="Compelling description for search results (150-160 characters)"
                    value={formData.seo_description}
                    onChange={(e) => setFormData({...formData, seo_description: e.target.value})}
                    rows="2"
                    className="premium-textarea"
                    maxLength="160"
                  />
                  <div className="field-counter">{formData.seo_description?.length || 0}/160</div>
                </div>
                <div className="setting-field">
                  <label>Custom Slug / URL</label>
                  <div className="slug-preview">
                    <span className="slug-domain">yourblog.com/blog/</span>
                    <input
                      type="text"
                      placeholder="custom-url-slug"
                      value={formData.seo_slug}
                      onChange={(e) => {
                        const cleanSlug = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')
                        setFormData({...formData, seo_slug: cleanSlug})
                      }}
                      className="slug-input"
                    />
                  </div>
                  <p className="field-hint">URL slug: {slugPreview || '...'}</p>
                </div>
              </div>
              
              {/* Preview Card */}
              <div className="setting-card preview-card">
                <div className="card-header">
                  <FiEye size={18} />
                  <h3>Live Preview</h3>
                </div>
                <div className="preview-content">
                  <h4>{formData.title || 'Your Post Title'}</h4>
                  <div className="preview-meta">
                    <span>{categories.find(c => c.value === formData.category)?.label || 'Category'}</span>
                    <span>{formData.reading_time} min read</span>
                  </div>
                  <p className="preview-excerpt">{formData.excerpt || formData.content?.replace(/<[^>]*>/g, '').substring(0, 120) || 'Your post excerpt will appear here...'}</p>
                </div>
              </div>
            </div>
          </form>
        ) : (
          // Live Preview Mode
          <div className="preview-mode">
            <div className="preview-header">
              <h2>Live Preview</h2>
              <p>How your post will appear to readers</p>
            </div>
            <article className="post-preview">
              <h1 className="preview-title">{formData.title || 'Untitled Post'}</h1>
              <div className="preview-metadata">
                <span className="preview-category">{categories.find(c => c.value === formData.category)?.label}</span>
                <span className="preview-date">{new Date().toLocaleDateString()}</span>
                <span className="preview-reading-time">{formData.reading_time} min read</span>
              </div>
              {formData.featured_image && (
                <img src={formData.featured_image} alt="Featured" className="preview-featured-image" />
              )}
              <div className="preview-content" dangerouslySetInnerHTML={{ __html: formData.content }} />
            </article>
          </div>
        )}
      </div>
      
      <style jsx>{`
        .create-post-premium {
          background: linear-gradient(135deg, #f5f7fa 0%, #f8f9fc 100%);
          min-height: 100vh;
        }
        
        .premium-header {
          position: sticky;
          top: 0;
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
          padding: 1rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          z-index: 100;
          box-shadow: var(--shadow-sm);
        }
        
        .header-left, .header-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .back-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: transparent;
          border: none;
          border-radius: 12px;
          color: var(--gray-600);
          cursor: pointer;
          transition: all 0.2s;
          font-weight: 500;
        }
        
        .back-btn:hover {
          background: var(--gray-100);
          color: var(--gray-900);
        }
        
        .post-status {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        
        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          background: var(--gray-100);
          color: var(--gray-700);
        }
        
        .status-badge.draft { background: #fef3c7; color: #d97706; }
        .status-badge.review { background: #dbeafe; color: #2563eb; }
        .status-badge.published { background: #d1fae5; color: #059669; }
        
        .reading-time {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.75rem;
          color: var(--gray-500);
        }
        
        .header-btn, .save-btn, .publish-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1.25rem;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.875rem;
        }
        
        .header-btn {
          background: transparent;
          color: var(--gray-600);
        }
        
        .header-btn:hover {
          background: var(--gray-100);
          color: var(--gray-900);
        }
        
        .save-btn {
          background: var(--gray-100);
          color: var(--gray-700);
        }
        
        .save-btn:hover {
          background: var(--gray-200);
        }
        
        .publish-btn {
          background: linear-gradient(135deg, var(--primary-600), var(--primary-700));
          color: white;
          box-shadow: var(--shadow-sm);
        }
        
        .publish-btn:hover {
          transform: translateY(-1px);
          box-shadow: var(--shadow-md);
        }
        
        .toast-notification {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 1.5rem;
          background: white;
          border-radius: 16px;
          box-shadow: var(--shadow-lg);
          z-index: 1000;
          animation: slideIn 0.3s ease;
        }
        
        .toast-notification.success { border-left: 4px solid var(--success); }
        .toast-notification.error { border-left: 4px solid var(--error); }
        .toast-notification.info { border-left: 4px solid var(--primary-500); }
        
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .premium-container {
          max-width: 1600px;
          margin: 0 auto;
          padding: 2rem;
        }
        
        .post-form {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 2rem;
        }
        
        .main-content {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        
        .title-wrapper {
          position: relative;
        }
        
        .premium-title-input {
          width: 100%;
          font-size: 2.5rem;
          font-weight: 700;
          padding: 1rem 0;
          border: none;
          background: transparent;
          outline: none;
          color: var(--gray-900);
          font-family: inherit;
        }
        
        .premium-title-input::placeholder {
          color: var(--gray-300);
        }
        
        .title-character-count {
          position: absolute;
          bottom: 0.5rem;
          right: 0;
          font-size: 0.75rem;
          color: var(--gray-400);
        }
        
        .featured-image-area {
          margin-bottom: 1rem;
        }
        
        .upload-image-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: white;
          border: 2px dashed var(--gray-300);
          border-radius: 16px;
          color: var(--gray-600);
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .upload-image-btn:hover {
          border-color: var(--primary-500);
          color: var(--primary-600);
          background: var(--primary-50);
        }
        
        .editor-toolbar {
          display: flex;
          flex-wrap: wrap;
          gap: 0.25rem;
          padding: 0.75rem;
          background: white;
          border: 1px solid var(--gray-200);
          border-radius: 16px 16px 0 0;
          border-bottom: none;
        }
        
        .toolbar-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.5rem;
          min-width: 2rem;
          background: transparent;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          color: var(--gray-600);
          transition: all 0.2s;
        }
        
        .toolbar-btn:hover {
          background: var(--gray-100);
          color: var(--gray-900);
        }
        
        .toolbar-btn.active {
          background: var(--primary-100);
          color: var(--primary-700);
        }
        
        .toolbar-divider {
          width: 1px;
          height: 24px;
          background: var(--gray-200);
          margin: 0 0.25rem;
        }
        
        .heading-icon {
          font-weight: 700;
          font-size: 0.75rem;
        }
        
        .editor-wrapper {
          background: white;
          border: 1px solid var(--gray-200);
          border-radius: 0 0 16px 16px;
          overflow: hidden;
        }
        
        .excerpt-section {
          background: white;
          border-radius: 16px;
          padding: 1.5rem;
          border: 1px solid var(--gray-200);
        }
        
        .excerpt-section label {
          display: block;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: var(--gray-700);
        }
        
        .excerpt-textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid var(--gray-200);
          border-radius: 12px;
          font-family: inherit;
          resize: vertical;
          transition: all 0.2s;
        }
        
        .excerpt-textarea:focus {
          outline: none;
          border-color: var(--primary-500);
          box-shadow: 0 0 0 3px var(--primary-100);
        }
        
        .excerpt-footer {
          display: flex;
          justify-content: space-between;
          margin-top: 0.5rem;
          font-size: 0.75rem;
          color: var(--gray-400);
        }
        
        .settings-sidebar-premium {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        
        .setting-card {
          background: white;
          border-radius: 20px;
          padding: 1.25rem;
          border: 1px solid var(--gray-200);
          box-shadow: var(--shadow-sm);
          transition: all 0.2s;
        }
        
        .setting-card:hover {
          box-shadow: var(--shadow-md);
        }
        
        .card-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
          padding-bottom: 0.75rem;
          border-bottom: 2px solid var(--gray-100);
        }
        
        .card-header h3 {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--gray-700);
          margin: 0;
        }
        
        .setting-field {
          margin-bottom: 1rem;
        }
        
        .setting-field label {
          display: block;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--gray-500);
          margin-bottom: 0.5rem;
        }
        
        .status-options {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.5rem;
        }
        
        .status-option {
          padding: 0.5rem;
          text-align: center;
          background: var(--gray-50);
          border: 1px solid var(--gray-200);
          border-radius: 10px;
          cursor: pointer;
          font-size: 0.75rem;
          font-weight: 500;
          transition: all 0.2s;
        }
        
        .status-option.active {
          background: var(--primary-500);
          color: white;
          border-color: var(--primary-500);
        }
        
        .premium-input, .premium-textarea {
          width: 100%;
          padding: 0.625rem;
          border: 1px solid var(--gray-200);
          border-radius: 10px;
          font-family: inherit;
          transition: all 0.2s;
        }
        
        .premium-input:focus, .premium-textarea:focus {
          outline: none;
          border-color: var(--primary-500);
          box-shadow: 0 0 0 3px var(--primary-100);
        }
        
        .checkbox-field {
          margin-top: 1rem;
        }
        
        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
        }
        
        .checkbox-label input {
          display: none;
        }
        
        .checkbox-custom {
          width: 1rem;
          height: 1rem;
          border: 2px solid var(--gray-300);
          border-radius: 4px;
          position: relative;
          transition: all 0.2s;
        }
        
        .checkbox-label input:checked + .checkbox-custom {
          background: var(--primary-500);
          border-color: var(--primary-500);
        }
        
        .checkbox-label input:checked + .checkbox-custom::after {
          content: '✓';
          position: absolute;
          color: white;
          font-size: 0.75rem;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
        
        .checkbox-text {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.875rem;
          font-weight: 500;
        }
        
        .field-hint {
          font-size: 0.7rem;
          color: var(--gray-400);
          margin-top: 0.25rem;
        }
        
        .category-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.5rem;
        }
        
        .category-option {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem;
          background: var(--gray-50);
          border: 1px solid var(--gray-200);
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.75rem;
        }
        
        .category-option.active {
          background: var(--primary-50);
          border-color: var(--primary-500);
          color: var(--primary-700);
        }
        
        .tags-input-wrapper {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .tags-input-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--gray-50);
          border: 1px solid var(--gray-200);
          border-radius: 12px;
          padding: 0.25rem 0.5rem;
        }
        
        .input-icon {
          color: var(--gray-400);
        }
        
        .tags-input-field {
          flex: 1;
          border: none;
          background: transparent;
          padding: 0.5rem 0;
          outline: none;
        }
        
        .add-tag-btn {
          padding: 0.25rem;
          background: transparent;
          border: none;
          cursor: pointer;
          color: var(--gray-500);
          border-radius: 6px;
        }
        
        .add-tag-btn:hover {
          background: var(--gray-200);
        }
        
        .tags-container {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        
        .premium-tag {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.25rem 0.5rem;
          background: var(--primary-50);
          color: var(--primary-700);
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 500;
        }
        
        .premium-tag button {
          background: none;
          border: none;
          cursor: pointer;
          color: inherit;
          padding: 0;
          display: flex;
          align-items: center;
        }
        
        .empty-tags-hint {
          font-size: 0.75rem;
          color: var(--gray-400);
        }
        
        .slug-preview {
          display: flex;
          align-items: center;
          background: var(--gray-50);
          border: 1px solid var(--gray-200);
          border-radius: 10px;
          overflow: hidden;
        }
        
        .slug-domain {
          padding: 0.5rem;
          background: var(--gray-100);
          font-size: 0.75rem;
          color: var(--gray-500);
          white-space: nowrap;
        }
        
        .slug-input {
          flex: 1;
          padding: 0.5rem;
          border: none;
          background: transparent;
          outline: none;
        }
        
        .preview-card .preview-content {
          margin-top: 0.5rem;
        }
        
        .preview-content h4 {
          font-size: 1rem;
          margin: 0 0 0.5rem 0;
          line-height: 1.3;
        }
        
        .preview-meta {
          display: flex;
          gap: 0.5rem;
          font-size: 0.7rem;
          color: var(--gray-500);
          margin-bottom: 0.5rem;
        }
        
        .preview-excerpt {
          font-size: 0.75rem;
          color: var(--gray-600);
          line-height: 1.4;
        }
        
        .preview-mode {
          max-width: 900px;
          margin: 0 auto;
        }
        
        .preview-header {
          text-align: center;
          margin-bottom: 3rem;
        }
        
        .preview-header h2 {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }
        
        .post-preview {
          background: white;
          border-radius: 24px;
          padding: 3rem;
          box-shadow: var(--shadow-xl);
        }
        
        .preview-title {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }
        
        .preview-metadata {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--gray-200);
          color: var(--gray-500);
          font-size: 0.875rem;
        }
        
        .preview-featured-image {
          width: 100%;
          border-radius: 16px;
          margin-bottom: 2rem;
        }
        
        @media (max-width: 1024px) {
          .post-form {
            grid-template-columns: 1fr;
          }
          
          .premium-header {
            flex-direction: column;
            gap: 1rem;
            padding: 1rem;
          }
          
          .premium-container {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  )
}