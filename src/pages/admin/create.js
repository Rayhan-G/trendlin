import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'
import AdminLayout from '@/components/AdminLayout'
import MediaUploader from '@/components/MediaUploader'

export default function CreatePost() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: 'tech',
    author: 'Admin'
  })

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('admin_logged_in')
    if (!isLoggedIn) router.push('/admin/login')
  }, [])

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }

  const handleImageUpload = (url) => {
    setImageUrl(url)
    // Auto-insert image into content if it's empty or at cursor position
    const contentArea = document.querySelector('textarea[name="content"]')
    if (contentArea) {
      const imgTag = `<img src="${url}" alt="Uploaded image" class="featured-image" />\n\n`
      const start = contentArea.selectionStart
      const end = contentArea.selectionEnd
      const text = contentArea.value
      const newText = text.substring(0, start) + imgTag + text.substring(end)
      setFormData(prev => ({ ...prev, content: newText }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const postData = {
      title: formData.title,
      slug: generateSlug(formData.title),
      excerpt: formData.excerpt,
      content: formData.content,
      category: formData.category,
      author: formData.author,
      image_url: imageUrl,
      published: true,
      views: 0,
      created_at: new Date().toISOString()
    }

    const { error } = await supabase.from('posts').insert([postData])

    if (error) {
      alert('Error: ' + error.message)
    } else {
      router.push('/admin/posts')
    }
    setLoading(false)
  }

  return (
    <AdminLayout title="Create New Post">
      <div className="create-post">
        <div className="form-header">
          <h1>Write New Post</h1>
          <p>Just drag & drop images - everything else is automatic</p>
        </div>

        <form onSubmit={handleSubmit} className="post-form">
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="What's on your mind?"
              autoFocus
            />
            <small>URL: /blog/{generateSlug(formData.title) || 'your-post-slug'}</small>
          </div>

          <div className="form-group">
            <label>Excerpt *</label>
            <textarea
              required
              rows="3"
              value={formData.excerpt}
              onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
              placeholder="Write a compelling summary (150-200 characters)"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                <option value="tech">⚡ Technology</option>
                <option value="wealth">💰 Wealth</option>
                <option value="health">🌿 Health</option>
                <option value="growth">🌱 Growth</option>
                <option value="entertainment">🎬 Entertainment</option>
                <option value="world">🌍 World</option>
                <option value="lifestyle">✨ Lifestyle</option>
              </select>
            </div>

            <div className="form-group">
              <label>Author</label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => setFormData({...formData, author: e.target.value})}
                placeholder="Author name"
              />
            </div>
          </div>

          {/* Featured Image Section */}
          <div className="form-group">
            <label>Featured Image (Optional)</label>
            <div className="featured-image-area">
              {imageUrl ? (
                <div className="featured-preview">
                  <img src={imageUrl} alt="Featured" />
                  <button type="button" onClick={() => setImageUrl('')} className="remove-featured">
                    Remove
                  </button>
                </div>
              ) : (
                <div className="featured-placeholder">
                  <p>Upload a featured image for this post</p>
                  <MediaUploader onUploadComplete={handleImageUpload} />
                </div>
              )}
            </div>
          </div>

          {/* Content Editor with Auto Media Upload */}
          <div className="form-group">
            <label>Content *</label>
            <div className="editor-toolbar">
              <span className="toolbar-hint">💡 Tip: Drag & drop images directly here - they'll upload automatically!</span>
            </div>
            <textarea
              name="content"
              required
              rows="20"
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              placeholder="Write your post content here...
              
You can drag & drop images anywhere in this textarea - they'll upload automatically and insert the image tag!"

              className="content-editor"
            />
            <small>Supports HTML: &lt;p&gt;, &lt;h2&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;img&gt;</small>
          </div>

          {/* Quick Media Uploader */}
          <div className="form-group">
            <label>Quick Media Uploader</label>
            <MediaUploader onUploadComplete={(url) => {
              // Just show a notification that URL is ready
              alert(`Image uploaded! URL copied to clipboard.\n\n${url}`)
              navigator.clipboard.writeText(url)
            }} />
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => router.back()} className="btn-cancel">Cancel</button>
            <button type="submit" disabled={loading} className="btn-submit">
              {loading ? 'Publishing...' : '✨ Publish Post'}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .create-post {
          max-width: 900px;
          margin: 0 auto;
        }
        
        .form-header {
          margin-bottom: 2rem;
        }
        
        .form-header h1 {
          font-size: 1.75rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }
        
        .form-header p {
          color: #64748b;
        }
        
        .post-form {
          background: white;
          border-radius: 16px;
          padding: 2rem;
        }
        
        :global(body.dark) .post-form {
          background: #1e293b;
        }
        
        .form-group {
          margin-bottom: 1.5rem;
        }
        
        label {
          display: block;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }
        
        input, textarea, select {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 0.95rem;
          transition: all 0.2s;
        }
        
        :global(body.dark) input,
        :global(body.dark) textarea,
        :global(body.dark) select {
          background: #0f172a;
          border-color: #334155;
          color: white;
        }
        
        input:focus, textarea:focus, select:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        
        .content-editor {
          font-family: 'Courier New', monospace;
          line-height: 1.6;
        }
        
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        
        .editor-toolbar {
          background: #f1f5f9;
          padding: 0.5rem;
          border-radius: 8px;
          margin-bottom: 0.5rem;
        }
        
        :global(body.dark) .editor-toolbar {
          background: #0f172a;
        }
        
        .toolbar-hint {
          font-size: 0.8rem;
          color: #64748b;
        }
        
        .featured-image-area {
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 1rem;
          text-align: center;
        }
        
        .featured-preview {
          position: relative;
          display: inline-block;
        }
        
        .featured-preview img {
          max-width: 100%;
          max-height: 200px;
          border-radius: 8px;
        }
        
        .remove-featured {
          position: absolute;
          top: 8px;
          right: 8px;
          background: rgba(0,0,0,0.7);
          color: white;
          border: none;
          padding: 4px 8px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.75rem;
        }
        
        .featured-placeholder p {
          color: #64748b;
          margin-bottom: 1rem;
        }
        
        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 2rem;
          padding-top: 1rem;
          border-top: 1px solid #e2e8f0;
        }
        
        .btn-cancel {
          padding: 0.75rem 1.5rem;
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
        }
        
        .btn-submit {
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
        }
        
        .btn-submit:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        small {
          display: block;
          margin-top: 0.25rem;
          font-size: 0.75rem;
          color: #64748b;
        }
        
        @media (max-width: 768px) {
          .post-form {
            padding: 1rem;
          }
          
          .form-row {
            grid-template-columns: 1fr;
          }
          
          .form-actions {
            flex-direction: column;
          }
          
          .btn-cancel, .btn-submit {
            width: 100%;
          }
        }
      `}</style>
    </AdminLayout>
  )
}