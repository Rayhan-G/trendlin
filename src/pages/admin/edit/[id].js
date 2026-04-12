import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'
import Layout from '@/components/Layout'
import MediaUploader from '@/components/MediaUploader'

export default function EditPost() {
  const router = useRouter()
  const { id } = router.query
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [saving, setSaving] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: 'tech',
    author: 'Admin'
  })

  // Check authentication
  useEffect(() => {
    const sessionToken = localStorage.getItem('admin_session_token')
    const sessionExpiry = localStorage.getItem('admin_session_expiry')
    
    if (!sessionToken || !sessionExpiry) {
      router.push('/')
      return
    }
    
    const now = Date.now()
    if (now > parseInt(sessionExpiry)) {
      localStorage.removeItem('admin_session_token')
      localStorage.removeItem('admin_session_expiry')
      router.push('/')
    }
  }, [router])

  // Fetch post data
  useEffect(() => {
    if (id) fetchPost()
  }, [id])

  const fetchPost = async () => {
    setFetching(true)
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      console.error('Error fetching post:', error)
      router.push('/admin/posts')
      return
    }
    
    if (data) {
      setFormData({
        title: data.title || '',
        excerpt: data.excerpt || '',
        content: data.content || '',
        category: data.category || 'tech',
        author: data.author || 'Admin'
      })
      setImageUrl(data.image_url || '')
    }
    setFetching(false)
  }

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    const updateData = {
      title: formData.title.trim(),
      slug: generateSlug(formData.title),
      excerpt: formData.excerpt.trim(),
      content: formData.content,
      category: formData.category,
      author: formData.author.trim() || 'Admin',
      image_url: imageUrl,
      updated_at: new Date().toISOString()
    }

    const { error } = await supabase
      .from('posts')
      .update(updateData)
      .eq('id', id)

    if (error) {
      alert('Error: ' + error.message)
    } else {
      router.push('/admin')
    }
    setSaving(false)
  }

  if (fetching) {
    return (
      <Layout>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading post...</p>
        </div>
        <style jsx>{`
          .loading-container {
            min-height: 60vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 1rem;
          }
          .loading-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid #e2e8f0;
            border-top-color: #667eea;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="edit-container">
        {/* Header */}
        <div className="page-header">
          <button onClick={() => router.push('/admin')} className="back-btn">
            ← Back to Dashboard
          </button>
          <h1>Edit Post</h1>
          <p>Update your content and publish changes</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="edit-form">
          <div className="form-group">
            <label>
              Title <span className="required">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Enter post title"
              className="title-input"
            />
            <small>
              🔗 URL: /blog/{generateSlug(formData.title) || 'your-post-slug'}
            </small>
          </div>

          <div className="form-group">
            <label>
              Excerpt <span className="required">*</span>
            </label>
            <textarea
              required
              rows="3"
              value={formData.excerpt}
              onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
              placeholder="Write a compelling summary (150-200 characters)"
              className="excerpt-input"
            />
            <small>
              {formData.excerpt.length}/200 characters
            </small>
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

          <div className="form-group">
            <label>Featured Image</label>
            {imageUrl ? (
              <div className="image-preview">
                <img src={imageUrl} alt="Featured" />
                <button 
                  type="button" 
                  onClick={() => setImageUrl('')} 
                  className="remove-img"
                  title="Remove image"
                >
                  ×
                </button>
              </div>
            ) : (
              <MediaUploader onUploadComplete={setImageUrl} />
            )}
          </div>

          <div className="form-group">
            <label>
              Content <span className="required">*</span>
            </label>
            <textarea
              required
              rows="20"
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              placeholder="Write your post content in HTML...
              
Example:
<h2>Heading</h2>
<p>Paragraph text...</p>
<ul><li>Bullet point</li></ul>"
              className="content-editor"
            />
            <small>
              💡 Supports HTML: &lt;p&gt;, &lt;h2&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;img&gt;
            </small>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              onClick={() => router.push('/admin')} 
              className="btn-cancel"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={saving} 
              className="btn-submit"
            >
              {saving ? (
                <>
                  <div className="spinner"></div>
                  Saving...
                </>
              ) : (
                '💾 Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .edit-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 2rem 1rem;
        }
        
        .page-header {
          margin-bottom: 2rem;
          text-align: center;
          position: relative;
        }
        
        .back-btn {
          position: absolute;
          left: 0;
          top: 0;
          padding: 0.5rem 1rem;
          background: #f1f5f9;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.85rem;
          transition: all 0.2s;
        }
        
        .back-btn:hover {
          background: #e2e8f0;
        }
        
        :global(body.dark) .back-btn {
          background: #334155;
          color: white;
        }
        
        :global(body.dark) .back-btn:hover {
          background: #475569;
        }
        
        .page-header h1 {
          font-size: 1.75rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }
        
        .page-header p {
          color: #64748b;
        }
        
        .edit-form {
          background: white;
          border-radius: 20px;
          padding: 2rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
        }
        
        :global(body.dark) .edit-form {
          background: #1e293b;
        }
        
        .form-group {
          margin-bottom: 1.5rem;
        }
        
        label {
          display: block;
          font-weight: 600;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
        }
        
        .required {
          color: #ef4444;
        }
        
        input, textarea, select {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          font-size: 0.95rem;
          font-family: inherit;
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
        
        .title-input {
          font-size: 1.1rem;
          font-weight: 500;
        }
        
        .excerpt-input {
          resize: vertical;
        }
        
        .content-editor {
          font-family: 'Courier New', monospace;
          line-height: 1.6;
          resize: vertical;
        }
        
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        
        .image-preview {
          position: relative;
          display: inline-block;
          border-radius: 12px;
          overflow: hidden;
        }
        
        .image-preview img {
          max-width: 100%;
          max-height: 200px;
          object-fit: cover;
          border-radius: 12px;
        }
        
        .remove-img {
          position: absolute;
          top: 8px;
          right: 8px;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          border: none;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 1.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        
        .remove-img:hover {
          background: rgba(0, 0, 0, 0.9);
          transform: scale(1.05);
        }
        
        small {
          display: block;
          margin-top: 0.5rem;
          font-size: 0.75rem;
          color: #64748b;
        }
        
        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid #e2e8f0;
        }
        
        :global(body.dark) .form-actions {
          border-top-color: #334155;
        }
        
        .btn-cancel {
          padding: 0.75rem 1.5rem;
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }
        
        .btn-cancel:hover {
          background: #dc2626;
          transform: translateY(-1px);
        }
        
        .btn-submit {
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.2s;
        }
        
        .btn-submit:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }
        
        .btn-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid white;
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
          .edit-container {
            padding: 1rem;
          }
          
          .edit-form {
            padding: 1.25rem;
          }
          
          .form-row {
            grid-template-columns: 1fr;
          }
          
          .form-actions {
            flex-direction: column;
          }
          
          .btn-cancel, .btn-submit {
            width: 100%;
            justify-content: center;
          }
          
          .back-btn {
            position: static;
            margin-bottom: 1rem;
            width: 100%;
          }
          
          .page-header {
            text-align: left;
          }
        }
      `}</style>
    </Layout>
  )
}