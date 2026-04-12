import { useState, useCallback, useEffect } from 'react'

export default function MediaUploader({ onUploadComplete, accept = "image/*" }) {
  const [uploads, setUploads] = useState([])
  const [dragActive, setDragActive] = useState(false)

  const uploadToCloudinary = async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET)

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      )
      const data = await res.json()
      return data.secure_url
    } catch (error) {
      console.error('Upload failed:', error)
      return null
    }
  }

  const handleFiles = async (files) => {
    const fileArray = Array.from(files)
    
    for (const file of fileArray) {
      // Add to UI immediately with loading state
      const tempId = Date.now() + Math.random()
      setUploads(prev => [...prev, {
        id: tempId,
        file,
        preview: URL.createObjectURL(file),
        url: null,
        uploading: true,
        progress: 0
      }])

      // Upload to Cloudinary
      const url = await uploadToCloudinary(file)
      
      if (url) {
        // Update with actual URL
        setUploads(prev => prev.map(item => 
          item.id === tempId 
            ? { ...item, url, uploading: false, progress: 100 }
            : item
        ))
        
        // Callback with the URL
        if (onUploadComplete) {
          onUploadComplete(url)
        }
      } else {
        // Remove failed upload
        setUploads(prev => prev.filter(item => item.id !== tempId))
      }
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      handleFiles(files)
    }
  }

  const handleFileSelect = (e) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFiles(files)
    }
  }

  const copyToClipboard = (url) => {
    navigator.clipboard.writeText(url)
    // Show temporary success message
    const btn = document.getElementById(`copy-${url}`)
    if (btn) {
      btn.textContent = 'Copied!'
      setTimeout(() => {
        btn.textContent = 'Copy URL'
      }, 2000)
    }
  }

  const insertIntoEditor = (url) => {
    // Insert image markdown or HTML into the content editor
    const contentArea = document.querySelector('textarea[name="content"]')
    if (contentArea) {
      const imgTag = `<img src="${url}" alt="Uploaded image" />`
      const start = contentArea.selectionStart
      const end = contentArea.selectionEnd
      const text = contentArea.value
      contentArea.value = text.substring(0, start) + imgTag + text.substring(end)
      // Trigger input event
      const event = new Event('input', { bubbles: true })
      contentArea.dispatchEvent(event)
    }
  }

  return (
    <div className="media-uploader">
      <div
        className={`drop-zone ${dragActive ? 'drag-active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-input"
          accept={accept}
          multiple
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        
        <div className="drop-content">
          <svg className="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M12 3v12m0 0-3-3m3 3 3-3M5 21h14" strokeWidth="1.5" strokeLinecap="round"/>
            <rect x="4" y="4" width="16" height="12" rx="2" strokeWidth="1.5"/>
          </svg>
          <p className="drop-text">Drag & drop images here</p>
          <p className="drop-subtext">or</p>
          <label htmlFor="file-input" className="browse-btn">
            Browse Files
          </label>
          <p className="drop-info">Auto-uploads instantly • Supports JPG, PNG, GIF</p>
        </div>
      </div>

      {/* Upload Progress */}
      {uploads.length > 0 && (
        <div className="uploads-list">
          <h4>Uploads ({uploads.filter(u => u.url).length}/{uploads.length})</h4>
          <div className="uploads-grid">
            {uploads.map((upload) => (
              <div key={upload.id} className="upload-item">
                <div className="upload-preview">
                  <img src={upload.preview} alt="Preview" />
                  {upload.uploading && (
                    <div className="upload-overlay">
                      <div className="spinner"></div>
                      <span>Uploading...</span>
                    </div>
                  )}
                  {upload.url && (
                    <div className="upload-success">
                      <span className="checkmark">✓</span>
                    </div>
                  )}
                </div>
                
                {upload.url && (
                  <div className="upload-actions">
                    <button 
                      id={`copy-${upload.url}`}
                      onClick={() => copyToClipboard(upload.url)}
                      className="action-btn copy"
                    >
                      Copy URL
                    </button>
                    <button 
                      onClick={() => insertIntoEditor(upload.url)}
                      className="action-btn insert"
                    >
                      Insert to Post
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .media-uploader {
          width: 100%;
        }

        .drop-zone {
          border: 2px dashed #cbd5e1;
          border-radius: 16px;
          padding: 2rem;
          text-align: center;
          transition: all 0.3s ease;
          background: #f8fafc;
          cursor: pointer;
        }

        :global(body.dark) .drop-zone {
          background: #1e293b;
          border-color: #475569;
        }

        .drop-zone.drag-active {
          border-color: #667eea;
          background: rgba(102, 126, 234, 0.05);
          transform: scale(0.98);
        }

        .drop-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .upload-icon {
          width: 48px;
          height: 48px;
          color: #667eea;
        }

        .drop-text {
          font-size: 1rem;
          font-weight: 500;
          color: #334155;
        }

        :global(body.dark) .drop-text {
          color: #e2e8f0;
        }

        .drop-subtext {
          font-size: 0.85rem;
          color: #94a3b8;
        }

        .browse-btn {
          display: inline-block;
          padding: 0.5rem 1.5rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 40px;
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .browse-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .drop-info {
          font-size: 0.7rem;
          color: #94a3b8;
          margin-top: 0.5rem;
        }

        .uploads-list {
          margin-top: 1.5rem;
        }

        .uploads-list h4 {
          font-size: 0.85rem;
          margin-bottom: 0.75rem;
          color: #64748b;
        }

        .uploads-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 1rem;
        }

        .upload-item {
          background: white;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid #e2e8f0;
          transition: all 0.2s;
        }

        :global(body.dark) .upload-item {
          background: #0f172a;
          border-color: #334155;
        }

        .upload-preview {
          position: relative;
          height: 120px;
          overflow: hidden;
          background: #f1f5f9;
        }

        .upload-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .upload-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          color: white;
          font-size: 0.75rem;
        }

        .spinner {
          width: 24px;
          height: 24px;
          border: 2px solid white;
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .upload-success {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 24px;
          height: 24px;
          background: #10b981;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .checkmark {
          color: white;
          font-size: 14px;
          font-weight: bold;
        }

        .upload-actions {
          display: flex;
          gap: 0.5rem;
          padding: 0.5rem;
        }

        .action-btn {
          flex: 1;
          padding: 0.25rem;
          border: none;
          border-radius: 4px;
          font-size: 0.7rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .action-btn.copy {
          background: #3b82f6;
          color: white;
        }

        .action-btn.insert {
          background: #10b981;
          color: white;
        }

        .action-btn:hover {
          opacity: 0.8;
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  )
}