// src/components/media/Modals/PDFModal.jsx - ENHANCED FOR MEDIACONTROLS INTEGRATION
import React, { useState, useRef, useEffect, useCallback } from 'react'
import { X, Upload, FileText, AlignLeft, AlignCenter, AlignRight, Type, Move, Settings, ChevronDown, ChevronUp } from 'lucide-react'
import { toast } from 'react-toastify'

const PDFModal = ({ isOpen, onClose, onUpload, initialData = null }) => {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isEditing, setIsEditing] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const inputRef = useRef(null)
  const abortControllerRef = useRef(null)
  
  // PDF Settings
  const [pdfTitle, setPdfTitle] = useState('')
  const [pdfCaption, setPdfCaption] = useState('')
  const [alignment, setAlignment] = useState('center')
  const [pdfWidth, setPdfWidth] = useState('100%')
  const [pdfHeight, setPdfHeight] = useState('600')
  const [showToolbar, setShowToolbar] = useState(true)
  const [allowDownload, setAllowDownload] = useState(true)
  const [allowPrint, setAllowPrint] = useState(true)
  
  // Initialize with existing data if editing
  useEffect(() => {
    if (initialData) {
      setIsEditing(true)
      setPdfTitle(initialData.title || '')
      setPdfCaption(initialData.caption || '')
      setAlignment(initialData.alignment || 'center')
      setPdfWidth(initialData.width || '100%')
      setPdfHeight(initialData.height || '600')
      setShowToolbar(initialData.showToolbar !== false)
      setAllowDownload(initialData.allowDownload !== false)
      setAllowPrint(initialData.allowPrint !== false)
    } else {
      setIsEditing(false)
    }
  }, [initialData])
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])
  
  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        if (!isOpen) {
          setFile(null)
          setUploadProgress(0)
          setUploading(false)
          setShowAdvanced(false)
          setPdfTitle('')
          setPdfCaption('')
          setAlignment('center')
          setPdfWidth('100%')
          setPdfHeight('600')
          setShowToolbar(true)
          setAllowDownload(true)
          setAllowPrint(true)
          setIsEditing(false)
        }
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [isOpen])
  
  const handleFileSelect = (e) => {
    const f = e.target.files[0]
    if (!f) return
    
    if (f.type !== 'application/pdf') {
      toast.error('Please select a valid PDF file')
      return
    }
    
    if (f.size > 50 * 1024 * 1024) {
      toast.error('File size must be less than 50MB')
      return
    }
    
    setFile(f)
    
    // Auto-set title from filename if empty
    if (!pdfTitle) {
      const nameWithoutExt = f.name.replace(/\.[^/.]+$/, '')
      setPdfTitle(nameWithoutExt)
    }
    
    toast.success(`Selected: ${f.name}`)
  }
  
  const handleChangeFile = () => {
    inputRef.current?.click()
  }
  
  const generatePdfHtml = (pdfUrl) => {
    const pdfId = `pdf-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    // Build Google Docs Viewer URL parameters
    const viewerParams = []
    if (!showToolbar) viewerParams.push('toolbar=0')
    if (!allowDownload) viewerParams.push('download=0')
    if (!allowPrint) viewerParams.push('print=0')
    
    const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true${viewerParams.length ? '&' + viewerParams.join('&') : ''}`
    
    return `<div class="pdf-wrapper" data-media-type="pdf" data-id="${pdfId}" style="width: 100%;">
      <iframe 
        src="${viewerUrl}" 
        width="100%" 
        height="${pdfHeight}px" 
        frameborder="0"
        title="${pdfTitle || 'PDF Document'}"
        style="border: none; border-radius: 8px;"
      ></iframe>
      ${pdfCaption ? `<div class="pdf-caption" style="text-align: center; margin-top: 8px;">${pdfCaption}</div>` : ''}
    </div>`
  }
  
  const handleUpload = async () => {
    // For editing mode without new file
    if (isEditing && !file) {
      onUpload({
        ...initialData,
        title: pdfTitle,
        caption: pdfCaption,
        alignment: alignment,
        width: pdfWidth,
        height: pdfHeight,
        showToolbar: showToolbar,
        allowDownload: allowDownload,
        allowPrint: allowPrint,
      })
      toast.success('PDF updated successfully!')
      onClose()
      return
    }
    
    if (!file) {
      toast.error('Please select a PDF file first')
      return
    }
    
    setUploading(true)
    setUploadProgress(0)
    abortControllerRef.current = new AbortController()
    
    const toastId = toast.loading('Uploading PDF...', { autoClose: false })
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'ml_default')
      formData.append('resource_type', 'raw')
      formData.append('format', 'pdf')
      
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
      if (!cloudName) {
        throw new Error('Cloudinary cloud name is not configured')
      }
      
      const url = `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`
      
      // Use XMLHttpRequest for progress tracking
      const uploadPromise = new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100)
            setUploadProgress(percent)
            toast.update(toastId, { 
              render: `Uploading PDF... ${percent}%`,
              isLoading: percent < 100
            })
          }
        })
        
        xhr.onload = () => {
          if (xhr.status === 200) {
            try {
              const data = JSON.parse(xhr.responseText)
              resolve(data)
            } catch (err) {
              reject(new Error('Failed to parse server response'))
            }
          } else {
            try {
              const errorData = JSON.parse(xhr.responseText)
              reject(new Error(errorData.error?.message || `Upload failed with status ${xhr.status}`))
            } catch {
              reject(new Error(`Upload failed with status ${xhr.status}`))
            }
          }
        }
        
        xhr.onerror = () => reject(new Error('Network error during upload'))
        xhr.onabort = () => reject(new Error('Upload cancelled'))
        
        xhr.open('POST', url)
        xhr.send(formData)
      })
      
      const data = await uploadPromise
      
      if (data.secure_url) {
        toast.dismiss(toastId)
        toast.success(isEditing ? 'PDF updated successfully!' : 'PDF uploaded successfully!')
        
        const pdfHtml = generatePdfHtml(data.secure_url)
        
        onUpload({
          html: pdfHtml,
          url: data.secure_url,
          public_id: data.public_id,
          bytes: data.bytes,
          original_filename: data.original_filename,
          title: pdfTitle,
          caption: pdfCaption,
          alignment: alignment,
          width: pdfWidth,
          height: pdfHeight,
          showToolbar: showToolbar,
          allowDownload: allowDownload,
          allowPrint: allowPrint,
        })
        
        // Reset state
        setFile(null)
        setUploadProgress(0)
        onClose()
      } else {
        throw new Error('No secure URL returned from Cloudinary')
      }
    } catch (err) {
      toast.dismiss(toastId)
      console.error('Upload error:', err)
      
      let errorMessage = 'Upload failed'
      if (err.message.includes('upload preset')) {
        errorMessage = 'Upload preset is not configured correctly'
      } else if (err.message.includes('cloud name')) {
        errorMessage = 'Cloudinary is not configured'
      } else if (err.message.includes('Network')) {
        errorMessage = 'Network error. Please check your connection'
      } else if (err.message.includes('cancelled')) {
        errorMessage = 'Upload was cancelled'
      } else {
        errorMessage = err.message || 'Upload failed. Please try again.'
      }
      
      toast.error(errorMessage)
    } finally {
      setUploading(false)
      setUploadProgress(0)
      abortControllerRef.current = null
    }
  }
  
  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    onClose()
  }
  
  const alignmentOptions = [
    { value: 'left', icon: AlignLeft, label: 'Left' },
    { value: 'center', icon: AlignCenter, label: 'Center' },
    { value: 'right', icon: AlignRight, label: 'Right' },
    { value: 'custom', icon: Move, label: 'Custom' }
  ]
  
  const widthPresets = ['25%', '33%', '50%', '66%', '75%', '100%']
  const heightPresets = ['400', '500', '600', '700', '800', '900']
  
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleCancel} />
      
      <div className="relative bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <input 
          ref={inputRef} 
          type="file" 
          accept="application/pdf" 
          onChange={handleFileSelect} 
          className="hidden" 
        />
        
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                <FileText className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  {isEditing ? 'Edit PDF' : 'Add PDF Document'}
                </h2>
                <p className="text-[11px] text-gray-500">Upload and customize PDF display</p>
              </div>
            </div>
            <button 
              onClick={handleCancel} 
              className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/50 transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>
        
        <div className="p-5 space-y-4">
          {!file && !isEditing ? (
            <div
              onClick={() => inputRef.current?.click()}
              className="group relative border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-purple-400 transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-purple-50 group-hover:bg-purple-100 flex items-center justify-center mx-auto mb-3 transition-all">
                <Upload className="w-5 h-5 text-purple-500 group-hover:text-purple-600" />
              </div>
              <p className="text-sm font-medium text-gray-700">Choose PDF file</p>
              <p className="text-xs text-gray-400 mt-1">PDF Document • 50MB max</p>
            </div>
          ) : (
            <>
              {/* File info or existing PDF indicator */}
              {file ? (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center">
                    <FileText className="w-5 h-5 text-purple-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                    <p className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <button
                    onClick={handleChangeFile}
                    className="text-xs text-purple-500 hover:text-purple-600 transition-colors"
                  >
                    Change
                  </button>
                </div>
              ) : isEditing && (
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center">
                    <FileText className="w-5 h-5 text-purple-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Existing PDF</p>
                    <p className="text-xs text-gray-500">{initialData?.title || initialData?.original_filename || 'PDF Document'}</p>
                  </div>
                  <button
                    onClick={handleChangeFile}
                    className="text-xs text-purple-500 hover:text-purple-600 transition-colors"
                  >
                    Replace
                  </button>
                </div>
              )}
              
              {/* SEO & Alignment Section */}
              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                <div className="flex items-center gap-2 mb-3">
                  <Type className="w-4 h-4 text-purple-600" />
                  <h3 className="text-sm font-semibold text-gray-900">PDF Settings & SEO</h3>
                </div>
                
                {/* Title */}
                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Title <span className="text-gray-400 ml-1">(For SEO & accessibility)</span>
                  </label>
                  <input
                    type="text"
                    value={pdfTitle}
                    onChange={(e) => setPdfTitle(e.target.value)}
                    placeholder="Document title..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                {/* Caption */}
                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Caption</label>
                  <input
                    type="text"
                    value={pdfCaption}
                    onChange={(e) => setPdfCaption(e.target.value)}
                    placeholder="Caption displayed below the PDF..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                {/* Alignment */}
                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Alignment</label>
                  <div className="flex gap-2">
                    {alignmentOptions.map(({ value, icon: Icon, label }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setAlignment(value)}
                        className={`flex-1 py-2 rounded-lg border flex items-center justify-center gap-2 transition ${
                          alignment === value 
                            ? 'bg-purple-600 text-white border-purple-600' 
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                        title={value === 'custom' ? 'Drag to position freely' : `Align ${label}`}
                      >
                        <Icon size={14} />
                        <span className="text-sm">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Width */}
                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Display Width</label>
                  <div className="grid grid-cols-6 gap-1">
                    {widthPresets.map(size => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setPdfWidth(size)}
                        className={`py-2 rounded-lg border text-xs transition ${
                          pdfWidth === size 
                            ? 'bg-purple-600 text-white border-purple-600' 
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Height */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Height (px)</label>
                  <div className="grid grid-cols-6 gap-1">
                    {heightPresets.map(size => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setPdfHeight(size)}
                        className={`py-2 rounded-lg border text-xs transition ${
                          pdfHeight === size 
                            ? 'bg-purple-600 text-white border-purple-600' 
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                  <div className="mt-2">
                    <input
                      type="number"
                      value={pdfHeight}
                      onChange={(e) => setPdfHeight(e.target.value)}
                      min="200"
                      max="1200"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Custom height"
                    />
                  </div>
                </div>
              </div>
              
              {/* Advanced Settings Toggle */}
              <button 
                onClick={() => setShowAdvanced(!showAdvanced)} 
                className="w-full py-2 text-sm text-purple-600 hover:text-purple-700 flex items-center justify-center gap-2 border border-purple-200 rounded-lg hover:bg-purple-50 transition"
              >
                <Settings size={14} /> 
                {showAdvanced ? 'Hide Advanced Settings' : 'Show Advanced Settings'}
                {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              
              {/* Advanced Settings Panel */}
              {showAdvanced && (
                <div className="space-y-3 p-4 bg-gray-50 rounded-xl">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Viewer Settings</h4>
                  
                  <label className="flex items-center justify-between p-2 bg-white rounded-lg cursor-pointer">
                    <span className="text-sm">📋 Show Toolbar</span>
                    <input 
                      type="checkbox" 
                      checked={showToolbar} 
                      onChange={(e) => setShowToolbar(e.target.checked)} 
                      className="w-4 h-4 rounded"
                    />
                  </label>
                  
                  <label className="flex items-center justify-between p-2 bg-white rounded-lg cursor-pointer">
                    <span className="text-sm">⬇️ Allow Download</span>
                    <input 
                      type="checkbox" 
                      checked={allowDownload} 
                      onChange={(e) => setAllowDownload(e.target.checked)} 
                      className="w-4 h-4 rounded"
                    />
                  </label>
                  
                  <label className="flex items-center justify-between p-2 bg-white rounded-lg cursor-pointer">
                    <span className="text-sm">🖨️ Allow Print</span>
                    <input 
                      type="checkbox" 
                      checked={allowPrint} 
                      onChange={(e) => setAllowPrint(e.target.checked)} 
                      className="w-4 h-4 rounded"
                    />
                  </label>
                  
                  <div className="pt-2 text-xs text-gray-400">
                    <p>PDF will be displayed using Google Docs Viewer</p>
                    <p className="mt-1">• Disabling options removes them from viewer toolbar</p>
                  </div>
                </div>
              )}
              
              {/* Upload Progress */}
              {uploading && uploadProgress > 0 && (
                <div className="space-y-2">
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-600 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 text-center">{uploadProgress}% uploaded</p>
                </div>
              )}
            </>
          )}
        </div>
        
        {/* Footer */}
        {(file || isEditing) && (
          <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex gap-3 sticky bottom-0">
            <button
              onClick={handleCancel}
              className="flex-1 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="flex-1 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {uploadProgress > 0 ? `${uploadProgress}%` : 'Uploading...'}
                </>
              ) : (
                isEditing ? 'Update PDF' : 'Insert PDF'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default PDFModal