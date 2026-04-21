// src/components/MediaModals/VideoModal.jsx - ENHANCED FOR MEDIACONTROLS INTEGRATION
import React, { useState, useCallback, useRef, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, Upload, Lock, Unlock, Maximize2, Check, Eye, Image as ImageIcon, 
  Play, Pause, Volume2, VolumeX, RefreshCw, Settings, Video, FileVideo,
  AlignLeft, AlignCenter, AlignRight, Type, Move
} from 'lucide-react'
import { toast } from 'react-toastify'

const VideoModal = ({ isOpen, onClose, onUpload, initialData = null }) => {
  // File state
  const [file, setFile] = useState(null)
  const [videoUrl, setVideoUrl] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [showSettings, setShowSettings] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const inputRef = useRef(null)
  
  // SEO & Alignment state
  const [caption, setCaption] = useState('')
  const [altText, setAltText] = useState('')
  const [title, setTitle] = useState('')
  const [alignment, setAlignment] = useState('center')
  const [videoWidth, setVideoWidth] = useState('100%')
  
  // Thumbnail state
  const [thumbnailFile, setThumbnailFile] = useState(null)
  const [thumbnailPreview, setThumbnailPreview] = useState(null)
  const [showVideo, setShowVideo] = useState(false)
  const [existingThumbnail, setExistingThumbnail] = useState(null)
  
  // Video dimensions
  const [displayWidth, setDisplayWidth] = useState('640')
  const [displayHeight, setDisplayHeight] = useState('360')
  const [lockAspect, setLockAspect] = useState(true)
  const [aspectRatio, setAspectRatio] = useState(16/9)
  const [originalWidth, setOriginalWidth] = useState(0)
  const [originalHeight, setOriginalHeight] = useState(0)
  const [sizePreset, setSizePreset] = useState('medium')
  
  // Playback settings
  const [autoplay, setAutoplay] = useState(false)
  const [loop, setLoop] = useState(false)
  const [controls, setControls] = useState(true)
  const [muted, setMuted] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  
  // Refs
  const videoRef = useRef(null)
  const objectUrlRef = useRef(null)
  const abortControllerRef = useRef(null)
  
  // Initialize with existing data if editing
  useEffect(() => {
    if (initialData) {
      setIsEditing(true)
      setCaption(initialData.caption || '')
      setAltText(initialData.alt || '')
      setTitle(initialData.title || '')
      setAlignment(initialData.alignment || 'center')
      setVideoWidth(initialData.width || '100%')
      setAutoplay(initialData.autoplay || false)
      setLoop(initialData.loop || false)
      setControls(initialData.controls !== false)
      setMuted(initialData.muted || false)
      
      if (initialData.poster) {
        setExistingThumbnail(initialData.poster)
      }
      
      if (initialData.originalWidth && initialData.originalHeight) {
        setDisplayWidth(initialData.originalWidth.toString())
        setDisplayHeight(initialData.originalHeight.toString())
        setOriginalWidth(initialData.originalWidth)
        setOriginalHeight(initialData.originalHeight)
        setAspectRatio(initialData.originalWidth / initialData.originalHeight)
      }
      
      // Set video URL for preview
      if (initialData.src) {
        setVideoUrl(initialData.src)
      }
    } else {
      setIsEditing(false)
    }
  }, [initialData])
  
  // Cleanup function for object URLs
  const cleanupObjectUrl = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = null
    }
  }, [])
  
  // Cleanup on unmount or modal close
  useEffect(() => {
    return () => {
      cleanupObjectUrl()
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [cleanupObjectUrl])
  
  // Reset modal state when closed
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        if (!isOpen) {
          cleanupObjectUrl()
          setFile(null)
          setVideoUrl(null)
          setThumbnailFile(null)
          setThumbnailPreview(null)
          setShowVideo(false)
          setUploadProgress(0)
          setIsUploading(false)
          setShowSettings(false)
          setAutoplay(false)
          setLoop(false)
          setControls(true)
          setMuted(false)
          setIsPlaying(false)
          setDisplayWidth('640')
          setDisplayHeight('360')
          setSizePreset('medium')
          setLockAspect(true)
          setAspectRatio(16/9)
          setCaption('')
          setAltText('')
          setTitle('')
          setAlignment('center')
          setVideoWidth('100%')
          setExistingThumbnail(null)
          setIsEditing(false)
        }
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [isOpen, cleanupObjectUrl])
  
  const handleFileSelect = (e) => {
    const f = e.target.files[0]
    if (!f) return
    
    const validTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo']
    if (!validTypes.includes(f.type) && !f.type.startsWith('video/')) {
      toast.error('Please select a valid video file (MP4, WebM, MOV, AVI)')
      return
    }
    
    if (f.size > 100 * 1024 * 1024) {
      toast.error('File size must be less than 100MB')
      return
    }
    
    cleanupObjectUrl()
    
    setFile(f)
    const url = URL.createObjectURL(f)
    objectUrlRef.current = url
    setVideoUrl(url)
    setShowVideo(false)
    setThumbnailFile(null)
    setThumbnailPreview(null)
    setUploadProgress(0)
    
    // Auto-set title from filename
    if (!title) {
      const nameWithoutExt = f.name.replace(/\.[^/.]+$/, '')
      setTitle(nameWithoutExt)
    }
    
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.src = url
    
    video.onloadedmetadata = () => {
      const ratio = video.videoWidth / video.videoHeight
      const width = video.videoWidth
      const height = video.videoHeight
      
      setAspectRatio(ratio)
      setOriginalWidth(width)
      setOriginalHeight(height)
      
      const defaultWidth = Math.min(640, width)
      const defaultHeight = Math.round(defaultWidth / ratio)
      setDisplayWidth(defaultWidth.toString())
      setDisplayHeight(defaultHeight.toString())
      
      toast.success(`Video loaded: ${width}x${height}`)
    }
    
    video.onerror = () => {
      toast.error('Failed to load video metadata')
    }
    
    toast.success(f.name)
  }
  
  const handleChangeFile = () => {
    inputRef.current?.click()
  }
  
  const onThumbnailDrop = useCallback((acceptedFiles) => {
    const f = acceptedFiles[0]
    if (!f) return
    
    const validImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
    if (!validImageTypes.includes(f.type)) {
      toast.error('Please select a valid image (JPEG, PNG, WebP)')
      return
    }
    
    if (f.size > 10 * 1024 * 1024) {
      toast.error('Thumbnail must be less than 10MB')
      return
    }
    
    setThumbnailFile(f)
    const reader = new FileReader()
    reader.onload = (e) => {
      setThumbnailPreview(e.target.result)
      setShowVideo(false)
    }
    reader.onerror = () => {
      toast.error('Failed to read thumbnail')
    }
    reader.readAsDataURL(f)
    toast.success('Thumbnail added')
  }, [])
  
  const { getRootProps: getThumbRootProps, getInputProps: getThumbInputProps } = useDropzone({ 
    onDrop: onThumbnailDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    maxFiles: 1
  })
  
  const playVideo = () => {
    setShowVideo(true)
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.play().catch(err => {
          console.warn('Autoplay prevented:', err)
          setIsPlaying(false)
        })
        setIsPlaying(true)
      }
    }, 100)
  }
  
  const removeThumbnail = () => {
    setThumbnailFile(null)
    setThumbnailPreview(null)
    setShowVideo(false)
    toast.info('Thumbnail removed')
  }
  
  const handleWidthChange = (e) => {
    const newWidth = e.target.value
    setDisplayWidth(newWidth)
    setSizePreset('custom')
    
    if (lockAspect && newWidth && aspectRatio) {
      const w = parseInt(newWidth)
      if (!isNaN(w) && w > 0) {
        const newHeight = Math.round(w / aspectRatio)
        setDisplayHeight(newHeight.toString())
      }
    }
  }
  
  const handleHeightChange = (e) => {
    const newHeight = e.target.value
    setDisplayHeight(newHeight)
    setSizePreset('custom')
    
    if (lockAspect && newHeight && aspectRatio) {
      const h = parseInt(newHeight)
      if (!isNaN(h) && h > 0) {
        const newWidth = Math.round(h * aspectRatio)
        setDisplayWidth(newWidth.toString())
      }
    }
  }
  
  const applyPreset = (name, width, height) => {
    setDisplayWidth(width.toString())
    setDisplayHeight(height.toString())
    setSizePreset(name)
  }
  
  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
        setIsPlaying(false)
      } else {
        videoRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(err => console.warn('Play failed:', err))
      }
    }
  }
  
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !muted
      setMuted(!muted)
    }
  }
  
  const reset = () => {
    if (objectUrlRef.current) {
      setVideoUrl(objectUrlRef.current)
      setShowVideo(false)
      
      if (originalWidth > 0 && originalHeight > 0) {
        const defaultWidth = Math.min(640, originalWidth)
        const defaultHeight = Math.round(defaultWidth / (originalWidth / originalHeight))
        setDisplayWidth(defaultWidth.toString())
        setDisplayHeight(defaultHeight.toString())
      } else {
        setDisplayWidth('640')
        setDisplayHeight('360')
      }
      
      setThumbnailFile(null)
      setThumbnailPreview(null)
      setAutoplay(false)
      setLoop(false)
      setControls(true)
      setMuted(false)
      setSizePreset('medium')
      toast.info('Reset to original')
    }
  }
  
  const uploadToCloudinary = async (fileToUpload, resourceType) => {
    return new Promise((resolve, reject) => {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
      
      if (!cloudName || !uploadPreset) {
        reject(new Error('Cloudinary is not configured. Please check environment variables.'))
        return
      }
      
      const formData = new FormData()
      formData.append('file', fileToUpload)
      formData.append('upload_preset', uploadPreset)
      formData.append('resource_type', resourceType)
      
      const xhr = new XMLHttpRequest()
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100)
          setUploadProgress(percent)
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
      
      xhr.onerror = () => {
        reject(new Error('Network error during upload'))
      }
      
      xhr.onabort = () => {
        reject(new Error('Upload cancelled'))
      }
      
      const apiUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`
      xhr.open('POST', apiUrl)
      xhr.send(formData)
    })
  }
  
  const handleUpload = async () => {
    // For editing mode without new file
    if (isEditing && !file) {
      onUpload({
        ...initialData,
        alt: altText,
        caption: caption,
        title: title,
        alignment: alignment,
        width: videoWidth,
        autoplay: autoplay,
        loop: loop,
        controls: controls,
        muted: muted,
      })
      toast.success('Video updated successfully!')
      onClose()
      return
    }
    
    if (!file) {
      toast.error('Please select a video file first')
      return
    }
    
    setIsUploading(true)
    setUploadProgress(0)
    abortControllerRef.current = new AbortController()
    
    try {
      const videoResult = await uploadToCloudinary(file, 'video')
      
      if (!videoResult.secure_url) {
        throw new Error('No secure URL returned from Cloudinary')
      }
      
      let thumbnailUrl = existingThumbnail || null
      if (thumbnailFile) {
        try {
          const thumbResult = await uploadToCloudinary(thumbnailFile, 'image')
          thumbnailUrl = thumbResult.secure_url
        } catch (thumbError) {
          console.warn('Thumbnail upload failed, continuing without thumbnail:', thumbError)
          toast.warning('Video uploaded, but thumbnail failed')
        }
      }
      
      const finalWidth = displayWidth && parseInt(displayWidth) > 0 ? parseInt(displayWidth) : 640
      const finalHeight = displayHeight && parseInt(displayHeight) > 0 ? parseInt(displayHeight) : 360
      
      // Pass all video data with metadata
      onUpload({
        src: videoResult.secure_url,
        poster: thumbnailUrl,
        alt: altText,
        caption: caption,
        title: title,
        alignment: alignment,
        width: videoWidth,
        controls: controls,
        autoplay: autoplay,
        loop: loop,
        muted: muted,
        originalWidth: finalWidth,
        originalHeight: finalHeight,
        aspectRatio: aspectRatio
      })
      
      toast.success(isEditing ? 'Video updated successfully!' : 'Video embedded successfully!')
      cleanupObjectUrl()
      onClose()
      
    } catch (err) {
      console.error('Upload error:', err)
      toast.error(err.message || 'Upload failed. Please try again.')
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
      abortControllerRef.current = null
    }
  }
  
  const getPresets = () => {
    const presets = [
      { name: 'Small', w: 320, h: Math.round(320 / aspectRatio) },
      { name: 'Medium', w: 640, h: Math.round(640 / aspectRatio) },
      { name: 'Large', w: 1280, h: Math.round(1280 / aspectRatio) }
    ]
    
    if (originalWidth > 0 && originalHeight > 0) {
      return presets.filter(p => p.w <= originalWidth)
    }
    
    return presets
  }
  
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <input 
          ref={inputRef} 
          type="file" 
          accept="video/mp4,video/webm,video/ogg,video/quicktime,video/x-msvideo" 
          onChange={handleFileSelect} 
          className="hidden" 
        />
        
        {/* Header */}
        <div className="flex-shrink-0 px-5 py-4 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                <FileVideo className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  {isEditing ? 'Edit Video' : 'Add Video'}
                </h2>
                <p className="text-[11px] text-gray-500">Upload, customize, and position</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/50 transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {!file && !isEditing ? (
            <div 
              onClick={() => inputRef.current?.click()} 
              className="group relative border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-purple-400 transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-purple-50 group-hover:bg-purple-100 flex items-center justify-center mx-auto mb-3 transition-all">
                <Upload className="w-5 h-5 text-purple-500 group-hover:text-purple-600" />
              </div>
              <p className="text-sm font-medium text-gray-700">Choose video file</p>
              <p className="text-xs text-gray-400 mt-1">MP4, WebM, MOV • 100MB max</p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* File info or existing video indicator */}
              {file ? (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center">
                    <FileVideo className="w-5 h-5 text-purple-500" />
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
                    <FileVideo className="w-5 h-5 text-purple-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Existing Video</p>
                    <p className="text-xs text-gray-500">{initialData?.title || 'Video file'}</p>
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
                  <h3 className="text-sm font-semibold text-gray-900">Video Settings & SEO</h3>
                </div>
                
                {/* Title */}
                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Title <span className="text-gray-400 ml-1">(For SEO)</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Video title..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                {/* ALT Text */}
                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    ALT Text <span className="text-red-500">*</span>
                    <span className="text-gray-400 ml-1">(For accessibility)</span>
                  </label>
                  <input
                    type="text"
                    value={altText}
                    onChange={(e) => setAltText(e.target.value)}
                    placeholder="Describe the video content..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <p className="text-xs text-gray-400 mt-1">Helps search engines and screen readers</p>
                </div>
                
                {/* Caption */}
                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Caption</label>
                  <input
                    type="text"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Video caption displayed below..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                {/* Alignment */}
                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Alignment</label>
                  <div className="flex gap-2">
                    {[
                      { value: 'left', icon: AlignLeft, label: 'Left' },
                      { value: 'center', icon: AlignCenter, label: 'Center' },
                      { value: 'right', icon: AlignRight, label: 'Right' },
                      { value: 'custom', icon: Move, label: 'Custom' }
                    ].map(align => (
                      <button
                        key={align.value}
                        type="button"
                        onClick={() => setAlignment(align.value)}
                        className={`flex-1 py-2 rounded-lg border flex items-center justify-center gap-2 transition ${
                          alignment === align.value 
                            ? 'bg-purple-600 text-white border-purple-600' 
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                        title={align.value === 'custom' ? 'Drag to position freely' : `Align ${align.label}`}
                      >
                        <align.icon size={14} />
                        <span className="text-sm">{align.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Width */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Display Width</label>
                  <div className="flex gap-2">
                    {['25%', '33%', '50%', '66%', '75%', '100%'].map(size => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setVideoWidth(size)}
                        className={`flex-1 py-2 rounded-lg border text-xs transition ${
                          videoWidth === size 
                            ? 'bg-purple-600 text-white border-purple-600' 
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Video preview */}
              {(videoUrl || initialData?.src) && (
                <div 
                  className="bg-black rounded-xl overflow-hidden relative mx-auto"
                  style={{ 
                    width: displayWidth ? `${parseInt(displayWidth)}px` : '100%', 
                    maxWidth: '100%',
                    aspectRatio: aspectRatio
                  }}
                >
                  <AnimatePresence mode="wait">
                    {!showVideo && (thumbnailPreview || existingThumbnail) ? (
                      <motion.div 
                        key="thumbnail" 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }} 
                        transition={{ duration: 0.3 }} 
                        className="relative w-full h-full cursor-pointer group"
                        onClick={playVideo}
                      >
                        <img 
                          src={thumbnailPreview || existingThumbnail} 
                          alt="Video thumbnail" 
                          className="w-full h-full object-cover" 
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:bg-white/30 transition-all duration-300 group-hover:scale-110">
                            <Play size={28} className="text-white ml-1" />
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.video 
                        key="video" 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }} 
                        transition={{ duration: 0.3 }} 
                        ref={videoRef} 
                        src={videoUrl || initialData?.src} 
                        className="w-full h-full" 
                        controls={controls} 
                        autoPlay={autoplay} 
                        loop={loop} 
                        muted={muted}
                        poster={existingThumbnail}
                        onPlay={() => setIsPlaying(true)} 
                        onPause={() => setIsPlaying(false)} 
                      />
                    )}
                  </AnimatePresence>
                </div>
              )}
              
              {/* Settings toggle */}
              <button 
                onClick={() => setShowSettings(!showSettings)} 
                className="w-full py-2 text-sm text-purple-600 hover:text-purple-700 flex items-center justify-center gap-2 border border-purple-200 rounded-lg hover:bg-purple-50 transition"
              >
                <Settings size={14} /> 
                {showSettings ? 'Hide Settings' : 'Show Advanced Settings'}
              </button>
              
              {/* Settings panel */}
              <AnimatePresence>
                {showSettings && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: 'auto' }} 
                    exit={{ opacity: 0, height: 0 }} 
                    className="space-y-4 overflow-hidden"
                  >
                    {/* Size settings */}
                    <div className="border-b pb-4">
                      <label className="text-xs font-semibold text-gray-500 uppercase block mb-3">Video Size (px)</label>
                      <div className="flex gap-3 mb-3">
                        <div className="flex-1">
                          <input 
                            type="number" 
                            value={displayWidth} 
                            onChange={handleWidthChange} 
                            placeholder="Width" 
                            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" 
                          />
                        </div>
                        <div className="flex-1">
                          <input 
                            type="number" 
                            value={displayHeight} 
                            onChange={handleHeightChange} 
                            placeholder="Height" 
                            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" 
                          />
                        </div>
                        <button 
                          onClick={() => setLockAspect(!lockAspect)} 
                          className={`px-3 py-2 border rounded-lg transition ${lockAspect ? 'bg-purple-600 text-white border-purple-600' : 'hover:bg-gray-50'}`}
                        >
                          {lockAspect ? <Lock size={14} /> : <Unlock size={14} />}
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {getPresets().map(preset => (
                          <button 
                            key={preset.name} 
                            onClick={() => applyPreset(preset.name, preset.w, preset.h)} 
                            className={`py-2 text-sm rounded-lg transition ${sizePreset === preset.name ? 'bg-purple-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                          >
                            {preset.name}
                            <span className="block text-[10px] opacity-70">{preset.w}×{preset.h}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Thumbnail settings */}
                    <div className="border-b pb-4">
                      <label className="text-xs font-semibold text-gray-500 uppercase block mb-3">Thumbnail</label>
                      <div {...getThumbRootProps()} className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:border-purple-400 transition">
                        <input {...getThumbInputProps()} />
                        <Upload size={20} className="mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-600">Upload thumbnail image</p>
                        <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP (max 10MB)</p>
                      </div>
                      {(thumbnailPreview || existingThumbnail) && (
                        <div className="flex items-center gap-3 mt-3 p-2 bg-gray-50 rounded-lg">
                          <div className="relative w-16 rounded overflow-hidden" style={{ aspectRatio: aspectRatio }}>
                            <img src={thumbnailPreview || existingThumbnail} alt="Thumbnail" className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm">Thumbnail ready</p>
                            <button onClick={removeThumbnail} className="text-red-500 text-sm hover:underline">
                              Remove
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Playback settings */}
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase block mb-3">Playback</label>
                      <div className="space-y-2">
                        <label className="flex items-center justify-between p-2 bg-gray-50 rounded-lg cursor-pointer">
                          <span className="text-sm">🔄 Loop</span>
                          <input type="checkbox" checked={loop} onChange={(e) => setLoop(e.target.checked)} className="w-4 h-4 rounded" />
                        </label>
                        <label className="flex items-center justify-between p-2 bg-gray-50 rounded-lg cursor-pointer">
                          <span className="text-sm">▶️ Autoplay</span>
                          <input type="checkbox" checked={autoplay} onChange={(e) => setAutoplay(e.target.checked)} className="w-4 h-4 rounded" />
                        </label>
                        <label className="flex items-center justify-between p-2 bg-gray-50 rounded-lg cursor-pointer">
                          <span className="text-sm">🎮 Controls</span>
                          <input type="checkbox" checked={controls} onChange={(e) => setControls(e.target.checked)} className="w-4 h-4 rounded" />
                        </label>
                        <label className="flex items-center justify-between p-2 bg-gray-50 rounded-lg cursor-pointer">
                          <span className="text-sm">🔇 Muted</span>
                          <input type="checkbox" checked={muted} onChange={(e) => setMuted(e.target.checked)} className="w-4 h-4 rounded" />
                        </label>
                      </div>
                      <div className="flex gap-3 mt-3">
                        <button onClick={togglePlayPause} className="flex-1 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-purple-700">
                          {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                          {isPlaying ? 'Pause' : 'Play'}
                        </button>
                        <button onClick={toggleMute} className="flex-1 py-2 border border-gray-300 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-50">
                          {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                          {muted ? 'Unmute' : 'Mute'}
                        </button>
                        <button onClick={reset} className="flex-1 py-2 border border-gray-300 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-50">
                          <RefreshCw size={14} />
                          Reset
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
        
        {/* Footer */}
        {(file || isEditing) && (
          <div className="flex-shrink-0 px-5 py-4 bg-gray-50 border-t border-gray-100">
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="flex-1 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm flex items-center justify-center gap-2"
              >
                {isUploading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Uploading {uploadProgress}%</span>
                  </>
                ) : (
                  isEditing ? 'Update Video' : 'Insert Video'
                )}
              </button>
            </div>
            {isUploading && uploadProgress > 0 && uploadProgress < 100 && (
              <div className="mt-2 w-full bg-gray-200 rounded-full h-1 overflow-hidden">
                <div 
                  className="bg-purple-600 h-1 rounded-full transition-all duration-300" 
                  style={{ width: `${uploadProgress}%` }} 
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default React.memo(VideoModal)