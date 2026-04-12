import { useState, useCallback } from 'react'

export default function MediaUploader({ onUploadComplete, className = '' }) {
  const [image, setImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState(null)
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const file = e.dataTransfer.files?.[0]
    if (file) {
      validateAndSetImage(file)
    }
  }, [])

  const handleFileSelect = useCallback((e) => {
    const file = e.target.files?.[0]
    if (file) {
      validateAndSetImage(file)
    }
  }, [])

  const validateAndSetImage = (file) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPEG, PNG, GIF, WebP)')
      return
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      setError('Image must be less than 5MB')
      return
    }

    setError('')
    setImage(file)
    setPreview(URL.createObjectURL(file))
  }

  const uploadImage = async () => {
    if (!image) {
      setError('Please select an image')
      return
    }

    setLoading(true)
    setError('')

    const formData = new FormData()
    formData.append('file', image)
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET)

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      )

      const data = await res.json()
      
      if (!res.ok) throw new Error(data.error?.message || 'Upload failed')
      
      const optimizedUrl = data.secure_url.replace(
        '/upload/',
        '/upload/f_auto,q_auto,w_auto,c_limit/'
      )
      
      onUploadComplete?.(optimizedUrl)
      setImage(null)
      setPreview(null)
    } catch (err) {
      setError(err.message || 'Upload failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const clearSelection = () => {
    setImage(null)
    setPreview(null)
    setError('')
  }

  return (
    <div className={`media-uploader ${className}`}>
      {!preview ? (
        <div
          className={`drop-zone ${dragActive ? 'drag-active' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-input')?.click()}
        >
          <input
            id="file-input"
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          
          <div className="drop-content">
            <div className="upload-icon">📸</div>
            <p className="drop-title">Drop your image here</p>
            <p className="drop-subtitle">or click to browse</p>
            <p className="drop-hint">JPEG, PNG, GIF, WebP • Max 5MB</p>
          </div>
        </div>
      ) : (
        <div className="preview-container">
          <img src={preview} alt="Preview" className="preview-image" />
          <button
            type="button"
            onClick={clearSelection}
            className="remove-btn"
            aria-label="Remove image"
          >
            ×
          </button>
        </div>
      )}

      {preview && !loading && (
        <button
          onClick={uploadImage}
          className="upload-btn"
        >
          Upload to Cloudinary
        </button>
      )}

      {loading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <span>Uploading...</span>
        </div>
      )}

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      <style jsx>{`
        .media-uploader {
          width: 100%;
        }

        /* Drop Zone */
        .drop-zone {
          border: 2px dashed #cbd5e1;
          border-radius: 16px;
          padding: 2rem;
          text-align: center;
          transition: all 0.2s ease;
          background: #f8fafc;
          cursor: pointer;
        }

        .drop-zone:hover {
          border-color: #667eea;
          background: rgba(102, 126, 234, 0.05);
        }

        .drop-zone.drag-active {
          border-color: #667eea;
          background: rgba(102, 126, 234, 0.1);
          transform: scale(0.98);
        }

        :global(body.dark) .drop-zone {
          background: #0f172a;
          border-color: #334155;
        }

        :global(body.dark) .drop-zone:hover {
          border-color: #818cf8;
          background: rgba(129, 140, 248, 0.1);
        }

        .drop-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .upload-icon {
          font-size: 3rem;
          opacity: 0.7;
        }

        .drop-title {
          font-size: 1rem;
          font-weight: 500;
          color: #334155;
          margin: 0;
        }

        :global(body.dark) .drop-title {
          color: #e2e8f0;
        }

        .drop-subtitle {
          font-size: 0.875rem;
          color: #64748b;
          margin: 0;
        }

        .drop-hint {
          font-size: 0.75rem;
          color: #94a3b8;
          margin: 0;
        }

        /* Preview */
        .preview-container {
          position: relative;
          display: inline-block;
          width: 100%;
          border-radius: 12px;
          overflow: hidden;
          background: #f1f5f9;
        }

        .preview-image {
          width: 100%;
          max-height: 200px;
          object-fit: cover;
          display: block;
        }

        .remove-btn {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 32px;
          height: 32px;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          border: none;
          border-radius: 50%;
          font-size: 1.25rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .remove-btn:hover {
          background: rgba(0, 0, 0, 0.9);
          transform: scale(1.05);
        }

        /* Upload Button */
        .upload-btn {
          width: 100%;
          margin-top: 1rem;
          padding: 0.75rem;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .upload-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
        }

        /* Loading State */
        .loading-state {
          margin-top: 1rem;
          padding: 0.75rem;
          background: #f1f5f9;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          color: #475569;
        }

        :global(body.dark) .loading-state {
          background: #1e293b;
          color: #94a3b8;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid #cbd5e1;
          border-top-color: #10b981;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Error Message */
        .error-message {
          margin-top: 1rem;
          padding: 0.75rem;
          background: #fef2f2;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: #dc2626;
        }

        :global(body.dark) .error-message {
          background: #7f1d1d;
          color: #fca5a5;
        }

        .error-icon {
          font-size: 1rem;
        }
      `}</style>
    </div>
  )
}