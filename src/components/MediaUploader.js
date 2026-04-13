import { useState, useCallback, useRef } from 'react'

export default function MediaUploader({ onUploadComplete, className = '', multiple = false, maxSize = 10 }) {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef(null)

  const validateFile = (file) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
    const maxBytes = maxSize * 1024 * 1024

    if (!validTypes.includes(file.type)) {
      return 'Invalid file type. Please upload JPEG, PNG, GIF, WebP, or SVG.'
    }
    if (file.size > maxBytes) {
      return `File too large. Maximum size is ${maxSize}MB.`
    }
    return null
  }

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
    
    const droppedFiles = Array.from(e.dataTransfer.files)
    if (droppedFiles.length > 0) {
      processFiles(droppedFiles)
    }
  }, [])

  const handleFileSelect = useCallback((e) => {
    const selectedFiles = Array.from(e.target.files)
    if (selectedFiles.length > 0) {
      processFiles(selectedFiles)
    }
  }, [])

  const processFiles = (newFiles) => {
    const validFiles = []
    const errors = []

    newFiles.forEach(file => {
      const validationError = validateFile(file)
      if (validationError) {
        errors.push(`${file.name}: ${validationError}`)
      } else {
        validFiles.push({
          file,
          id: Date.now() + Math.random(),
          preview: URL.createObjectURL(file),
          progress: 0,
          status: 'pending'
        })
      }
    })

    if (errors.length > 0) {
      setError(errors.join('\n'))
    }

    if (validFiles.length > 0) {
      setFiles(prev => multiple ? [...prev, ...validFiles] : validFiles)
      setError('')
    }
  }

  const uploadSingleFile = async (fileItem) => {
    const formData = new FormData()
    formData.append('file', fileItem.file)
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET)

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100)
          setFiles(prev => prev.map(f => 
            f.id === fileItem.id ? { ...f, progress: percent } : f
          ))
        }
      })

      xhr.onload = () => {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText)
          const optimizedUrl = data.secure_url.replace(
            '/upload/',
            '/upload/f_auto,q_auto,w_auto,c_limit/'
          )
          resolve(optimizedUrl)
        } else {
          reject(new Error('Upload failed'))
        }
      }

      xhr.onerror = () => reject(new Error('Network error'))
      
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`)
      xhr.send(formData)
    })
  }

  const uploadAllFiles = async () => {
    if (files.length === 0) {
      setError('Please select files to upload')
      return
    }

    setLoading(true)
    setUploadProgress(0)
    
    const results = []
    let completed = 0

    for (const fileItem of files) {
      try {
        const url = await uploadSingleFile(fileItem)
        results.push({ success: true, url, name: fileItem.file.name })
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id ? { ...f, status: 'success', url } : f
        ))
        onUploadComplete?.(url)
      } catch (err) {
        results.push({ success: false, error: err.message, name: fileItem.file.name })
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id ? { ...f, status: 'error', error: err.message } : f
        ))
      }
      completed++
      setUploadProgress(Math.round((completed / files.length) * 100))
    }

    setLoading(false)
    
    const successCount = results.filter(r => r.success).length
    const failCount = results.filter(r => !r.success).length
    
    if (failCount === 0) {
      if (!multiple && results[0]?.success) {
        // Auto-clear for single upload mode
        setTimeout(() => {
          setFiles([])
        }, 2000)
      }
    }
  }

  const removeFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  const clearAll = () => {
    files.forEach(f => URL.revokeObjectURL(f.preview))
    setFiles([])
    setError('')
  }

  return (
    <div className={`media-uploader ${className}`}>
      {/* Drop Zone */}
      <div
        className={`drop-zone ${dragActive ? 'drag-active' : ''} ${files.length > 0 ? 'has-files' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
          onChange={handleFileSelect}
          multiple={multiple}
          style={{ display: 'none' }}
        />
        
        <div className="drop-content">
          <div className="upload-icon">🖼️</div>
          <p className="drop-title">Drag & drop images here</p>
          <p className="drop-subtitle">or click to browse</p>
          <p className="drop-hint">PNG, JPG, GIF, WebP, SVG • Up to {maxSize}MB</p>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="files-list">
          <div className="files-header">
            <span className="files-count">{files.length} file{files.length !== 1 ? 's' : ''} selected</span>
            <button onClick={clearAll} className="clear-all" type="button">Clear all</button>
          </div>
          
          {files.map((fileItem) => (
            <div key={fileItem.id} className={`file-item ${fileItem.status}`}>
              <div className="file-preview">
                <img src={fileItem.preview} alt="Preview" />
                {fileItem.status === 'success' && (
                  <div className="file-success">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                )}
                {fileItem.status === 'error' && (
                  <div className="file-error">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="file-info">
                <div className="file-name">{fileItem.file.name}</div>
                <div className="file-size">
                  {(fileItem.file.size / 1024 / 1024).toFixed(2)} MB
                </div>
                {fileItem.status === 'pending' && fileItem.progress > 0 && (
                  <div className="file-progress">
                    <div className="progress-bar" style={{ width: `${fileItem.progress}%` }}></div>
                  </div>
                )}
                {fileItem.status === 'error' && (
                  <div className="file-error-msg">{fileItem.error}</div>
                )}
                {fileItem.status === 'success' && fileItem.url && (
                  <div className="file-url">
                    <input type="text" readOnly value={fileItem.url} onClick={(e) => e.target.select()} />
                  </div>
                )}
              </div>
              <button onClick={() => removeFile(fileItem.id)} className="file-remove" type="button">
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      {files.length > 0 && !loading && (
        <button onClick={uploadAllFiles} className="upload-btn">
          <span>Upload {files.length} file{files.length !== 1 ? 's' : ''}</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 3v12m0 0-3-3m3 3 3-3M5 21h14" />
          </svg>
        </button>
      )}

      {/* Loading State */}
      {loading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <div className="loading-info">
            <span>Uploading... {uploadProgress}%</span>
            <div className="global-progress">
              <div className="global-progress-bar" style={{ width: `${uploadProgress}%` }}></div>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{error}</span>
          <button onClick={() => setError('')} className="error-close">×</button>
        </div>
      )}

      <style jsx>{`
        .media-uploader {
          width: 100%;
        }

        /* Drop Zone */
        .drop-zone {
          border: 2px dashed #cbd5e1;
          border-radius: 20px;
          padding: 2.5rem 2rem;
          text-align: center;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }

        .drop-zone::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.08), transparent);
          transition: left 0.5s;
        }

        .drop-zone:hover::before {
          left: 100%;
        }

        .drop-zone:hover {
          border-color: #667eea;
          background: linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%);
          transform: translateY(-2px);
        }

        .drop-zone.drag-active {
          border-color: #667eea;
          background: rgba(102, 126, 234, 0.05);
          transform: scale(0.98);
        }

        :global(body.dark) .drop-zone {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          border-color: #334155;
        }

        :global(body.dark) .drop-zone:hover {
          border-color: #818cf8;
          background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
        }

        .drop-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          position: relative;
          z-index: 1;
        }

        .upload-icon {
          font-size: 3.5rem;
          filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
          animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        .drop-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0;
        }

        :global(body.dark) .drop-title {
          color: #f1f5f9;
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

        /* Files List */
        .files-list {
          margin-top: 1.5rem;
          border-radius: 16px;
          background: white;
          overflow: hidden;
        }

        :global(body.dark) .files-list {
          background: #1e293b;
        }

        .files-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1rem;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
        }

        :global(body.dark) .files-header {
          background: #0f172a;
          border-bottom-color: #334155;
        }

        .files-count {
          font-size: 0.8rem;
          font-weight: 500;
          color: #475569;
        }

        .clear-all {
          font-size: 0.75rem;
          color: #ef4444;
          background: none;
          border: none;
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .clear-all:hover {
          opacity: 0.7;
        }

        .file-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          border-bottom: 1px solid #e2e8f0;
          transition: background 0.2s;
        }

        .file-item:hover {
          background: #f8fafc;
        }

        :global(body.dark) .file-item {
          border-bottom-color: #334155;
        }

        :global(body.dark) .file-item:hover {
          background: #0f172a;
        }

        .file-preview {
          position: relative;
          width: 60px;
          height: 60px;
          border-radius: 12px;
          overflow: hidden;
          background: #f1f5f9;
          flex-shrink: 0;
        }

        .file-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .file-success {
          position: absolute;
          inset: 0;
          background: rgba(16, 185, 129, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .file-success svg {
          width: 24px;
          height: 24px;
          color: white;
        }

        .file-error {
          position: absolute;
          inset: 0;
          background: rgba(239, 68, 68, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .file-error svg {
          width: 24px;
          height: 24px;
          color: white;
        }

        .file-info {
          flex: 1;
          min-width: 0;
        }

        .file-name {
          font-size: 0.85rem;
          font-weight: 500;
          color: #0f172a;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        :global(body.dark) .file-name {
          color: #f1f5f9;
        }

        .file-size {
          font-size: 0.7rem;
          color: #64748b;
          margin-top: 0.25rem;
        }

        .file-progress {
          margin-top: 0.5rem;
          height: 4px;
          background: #e2e8f0;
          border-radius: 2px;
          overflow: hidden;
        }

        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #667eea, #764ba2);
          border-radius: 2px;
          transition: width 0.3s;
        }

        .file-error-msg {
          font-size: 0.7rem;
          color: #ef4444;
          margin-top: 0.25rem;
        }

        .file-url {
          margin-top: 0.5rem;
        }

        .file-url input {
          width: 100%;
          font-size: 0.65rem;
          padding: 0.25rem 0.5rem;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          background: #f8fafc;
          cursor: pointer;
        }

        .file-remove {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #f1f5f9;
          border: none;
          cursor: pointer;
          font-size: 1.2rem;
          color: #64748b;
          transition: all 0.2s;
          flex-shrink: 0;
        }

        .file-remove:hover {
          background: #fee2e2;
          color: #ef4444;
          transform: scale(1.1);
        }

        /* Upload Button */
        .upload-btn {
          width: 100%;
          margin-top: 1rem;
          padding: 0.9rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 14px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .upload-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s;
        }

        .upload-btn:hover::before {
          left: 100%;
        }

        .upload-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
        }

        .upload-btn svg {
          width: 20px;
          height: 20px;
        }

        /* Loading State */
        .loading-state {
          margin-top: 1rem;
          padding: 1rem;
          background: #f8fafc;
          border-radius: 14px;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        :global(body.dark) .loading-state {
          background: #1e293b;
        }

        .spinner {
          width: 24px;
          height: 24px;
          border: 2px solid #e2e8f0;
          border-top-color: #667eea;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        .loading-info {
          flex: 1;
        }

        .loading-info span {
          font-size: 0.85rem;
          color: #475569;
        }

        .global-progress {
          margin-top: 0.5rem;
          height: 4px;
          background: #e2e8f0;
          border-radius: 2px;
          overflow: hidden;
        }

        .global-progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #667eea, #764ba2);
          border-radius: 2px;
          transition: width 0.3s;
        }

        /* Error Message */
        .error-message {
          margin-top: 1rem;
          padding: 0.75rem 1rem;
          background: #fef2f2;
          border-radius: 14px;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.85rem;
          color: #dc2626;
        }

        :global(body.dark) .error-message {
          background: #7f1d1d;
          color: #fca5a5;
        }

        .error-message svg {
          width: 18px;
          height: 18px;
          flex-shrink: 0;
        }

        .error-close {
          margin-left: auto;
          background: none;
          border: none;
          font-size: 1.2rem;
          cursor: pointer;
          color: inherit;
          opacity: 0.7;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 640px) {
          .file-item {
            flex-wrap: wrap;
          }
          
          .file-url {
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}