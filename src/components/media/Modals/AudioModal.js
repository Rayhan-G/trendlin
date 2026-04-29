// src/components/media/Modals/AudioModal.jsx
import React, { useState, useRef, useEffect } from 'react'
import { X, Upload, Music, AlignLeft, AlignCenter, AlignRight, Type } from 'lucide-react'
import { toast } from 'react-toastify'

const AudioModal = ({ isOpen, onClose, onUpload, initialData = null }) => {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  
  // Audio settings
  const [audioTitle, setAudioTitle] = useState('')
  const [audioCaption, setAudioCaption] = useState('')
  const [alignment, setAlignment] = useState('center')
  const [width, setWidth] = useState('100%')
  const [showAdvanced, setShowAdvanced] = useState(false)
  
  const inputRef = useRef(null)
  const objectUrlRef = useRef(null)
  const abortControllerRef = useRef(null)
  
  // Initialize with existing data if editing
  useEffect(() => {
    if (initialData) {
      setAudioTitle(initialData.title || '')
      setAudioCaption(initialData.caption || '')
      setAlignment(initialData.alignment || 'center')
      setWidth(initialData.width || '100%')
    }
  }, [initialData])
  
  // Cleanup object URL on unmount or when file changes
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current)
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])
  
  const handleFileSelect = (e) => {
    const f = e.target.files[0]
    if (!f) return
    
    // Clean up previous object URL
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = null
    }
    
    // Validate file type
    const validAudioTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/m4a', 'audio/aac']
    if (!validAudioTypes.includes(f.type) && !f.type.includes('audio')) {
      toast.error('Please select a valid audio file (MP3, WAV, OGG, M4A, AAC)')
      return
    }
    
    // Validate file size (50MB max)
    if (f.size > 50 * 1024 * 1024) {
      toast.error('File size must be less than 50MB')
      return
    }
    
    setFile(f)
    // Auto-set title from filename if empty
    if (!audioTitle) {
      const nameWithoutExt = f.name.replace(/\.[^/.]+$/, '')
      setAudioTitle(nameWithoutExt)
    }
    toast.success(`Selected: ${f.name}`)
  }
  
  const handleChangeFile = () => {
    inputRef.current?.click()
  }
  
  const generateAudioHtml = (audioUrl) => {
    const audioId = `audio-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    return `<div class="audio-wrapper" data-media-type="audio" data-id="${audioId}">
      <audio controls src="${audioUrl}" title="${audioTitle || 'Audio'}" style="width: 100%;">
        <source src="${audioUrl}" type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
      ${audioCaption ? `<div class="audio-caption">${audioCaption}</div>` : ''}
    </div>`
  }
  
  const handleUpload = async () => {
    if (!file) return
    
    setUploading(true)
    setUploadProgress(0)
    
    const toastId = toast.loading('Uploading audio...', { autoClose: false })
    
    // Create abort controller for cancelation
    abortControllerRef.current = new AbortController()
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'trendlin_audio')
      formData.append('resource_type', 'video')  // Cloudinary treats audio as 'video' type
      formData.append('format', 'auto')
      
      // Get cloud name with better error handling
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
      if (!cloudName) {
        throw new Error('Cloudinary cloud name is not configured. Please check your environment variables.')
      }
      
      // Use video endpoint for audio files
      const url = `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`
      
      // Create upload promise with progress tracking
      const uploadPromise = new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100)
            setUploadProgress(percent)
            toast.update(toastId, { 
              render: `Uploading audio... ${percent}%`,
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
        toast.success('Audio uploaded successfully!')
        
        // Generate HTML and return with all attributes
        const audioHtml = generateAudioHtml(data.secure_url)
        
        onUpload({
          html: audioHtml,
          url: data.secure_url,
          public_id: data.public_id,
          duration: data.duration || null,
          format: data.format,
          bytes: data.bytes,
          original_filename: data.original_filename,
          // Include all settings for MediaControls
          title: audioTitle,
          caption: audioCaption,
          alignment: alignment,
          width: width,
        })
        
        // Reset state
        setFile(null)
        setUploadProgress(0)
        setAudioTitle('')
        setAudioCaption('')
        setAlignment('center')
        setWidth('100%')
        if (objectUrlRef.current) {
          URL.revokeObjectURL(objectUrlRef.current)
          objectUrlRef.current = null
        }
        onClose()
      } else {
        throw new Error('No secure URL returned from Cloudinary')
      }
    } catch (err) {
      toast.dismiss(toastId)
      console.error('Upload error:', err)
      
      // Provide user-friendly error messages
      let errorMessage = 'Upload failed'
      if (err.message.includes('upload preset')) {
        errorMessage = 'Upload preset is not configured correctly. Please contact support.'
      } else if (err.message.includes('cloud name')) {
        errorMessage = 'Cloudinary is not configured. Please check environment variables.'
      } else if (err.message.includes('Network')) {
        errorMessage = 'Network error. Please check your connection and try again.'
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
    setFile(null)
    setUploadProgress(0)
    setAudioTitle('')
    setAudioCaption('')
    setAlignment('center')
    setWidth('100%')
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = null
    }
    onClose()
  }
  
  const alignmentOptions = [
    { value: 'left', icon: AlignLeft, label: 'Left' },
    { value: 'center', icon: AlignCenter, label: 'Center' },
    { value: 'right', icon: AlignRight, label: 'Right' }
  ]
  
  const widthPresets = ['33%', '50%', '75%', '100%']
  
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleCancel} />
      
      <div className="relative bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <input 
          ref={inputRef} 
          type="file" 
          accept="audio/mpeg,audio/wav,audio/ogg,audio/mp4,audio/m4a,audio/aac" 
          onChange={handleFileSelect} 
          className="hidden" 
        />
        
        <div className="px-5 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center">
                <Music className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  {initialData ? 'Edit Audio' : 'Add Audio'}
                </h2>
                <p className="text-[11px] text-gray-400">Upload MP3, WAV, OGG (max 50MB)</p>
              </div>
            </div>
            <button 
              onClick={handleCancel} 
              className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
        
        <div className="p-5 space-y-4">
          {!file && !initialData ? (
            <div
              onClick={() => inputRef.current?.click()}
              className="group relative border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-purple-400 transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-purple-50 group-hover:bg-purple-100 flex items-center justify-center mx-auto mb-3 transition-all">
                <Upload className="w-5 h-5 text-purple-500 group-hover:text-purple-600" />
              </div>
              <p className="text-sm font-medium text-gray-700">Choose audio file</p>
              <p className="text-xs text-gray-400 mt-1">MP3, WAV, OGG, M4A, AAC • 50MB max</p>
            </div>
          ) : file ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center">
                  <Music className="w-5 h-5 text-purple-500" />
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
              
              <div className="bg-gray-50 rounded-xl p-3">
                <audio 
                  src={URL.createObjectURL(file)} 
                  controls 
                  className="w-full [&::-webkit-media-controls-panel]:bg-white [&::-webkit-media-controls-current-time-display]:text-xs [&::-webkit-media-controls-time-remaining-display]:text-xs"
                />
              </div>
            </div>
          ) : initialData && (
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-sm text-gray-600 mb-2">Current audio: {initialData.original_filename || 'Audio file'}</p>
              <audio 
                src={initialData.url} 
                controls 
                className="w-full"
              />
            </div>
          )}
          
          {/* Advanced Settings Toggle */}
          {(file || initialData) && (
            <>
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700"
              >
                <Type size={14} />
                {showAdvanced ? 'Hide' : 'Show'} Advanced Settings
              </button>
              
              {/* Advanced Settings Panel */}
              {showAdvanced && (
                <div className="space-y-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Title (SEO)</label>
                    <input
                      type="text"
                      value={audioTitle}
                      onChange={(e) => setAudioTitle(e.target.value)}
                      placeholder="Audio title..."
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Caption</label>
                    <input
                      type="text"
                      value={audioCaption}
                      onChange={(e) => setAudioCaption(e.target.value)}
                      placeholder="Audio caption (optional)..."
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">Alignment</label>
                    <div className="flex gap-2">
                      {alignmentOptions.map(({ value, icon: Icon, label }) => (
                        <button
                          key={value}
                          onClick={() => setAlignment(value)}
                          className={`flex-1 py-2 rounded-lg border flex items-center justify-center gap-2 transition ${
                            alignment === value 
                              ? 'bg-purple-600 text-white border-purple-600' 
                              : 'bg-white hover:bg-gray-50 border-gray-200'
                          }`}
                        >
                          <Icon size={14} />
                          <span className="text-xs">{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">Width</label>
                    <div className="flex gap-2">
                      {widthPresets.map(w => (
                        <button
                          key={w}
                          onClick={() => setWidth(w)}
                          className={`flex-1 py-2 rounded-lg border text-xs transition ${
                            width === w 
                              ? 'bg-purple-600 text-white border-purple-600' 
                              : 'bg-white hover:bg-gray-50 border-gray-200'
                          }`}
                        >
                          {w}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
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
        
        {(file || initialData) && (
          <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex gap-3 sticky bottom-0">
            <button
              onClick={handleCancel}
              className="flex-1 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            {file ? (
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="flex-1 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                {uploading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    {uploadProgress > 0 ? `${uploadProgress}%` : 'Uploading...'}
                  </span>
                ) : (
                  'Upload Audio'
                )}
              </button>
            ) : (
              <button
                onClick={() => {
                  // Handle update for existing audio
                  onUpload({
                    ...initialData,
                    title: audioTitle,
                    caption: audioCaption,
                    alignment: alignment,
                    width: width,
                  })
                  onClose()
                }}
                className="flex-1 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 transition-all shadow-sm"
              >
                Update Audio
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default AudioModal