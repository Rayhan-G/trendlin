// src/components/media/Modals/GalleryModal.jsx - WITH VIDEO SUPPORT
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, Upload, Image, Video, FileVideo, Plus, Trash2, Move, Grid, LayoutGrid,
  ChevronLeft, ChevronRight, ZoomIn, Download, Copy, Check,
  AlertCircle, Loader, Settings, GripVertical, Eye,
  Columns, Square, RectangleHorizontal, AlignCenter, AlignLeft, AlignRight,
  Sparkles, Wand2, Crop, RotateCw, FlipHorizontal, FlipVertical,
  Sun, Contrast, Droplet, Sliders, Palette, Type, Play, Pause, Volume2, VolumeX
} from 'lucide-react'
import { toast } from 'react-toastify'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'

// Mock upload function - replace with your actual upload logic
const uploadToCloudinary = async (file, options) => {
  // Simulate upload
  return new Promise((resolve) => {
    setTimeout(() => {
      const reader = new FileReader()
      reader.onload = (e) => {
        resolve({
          url: e.target.result,
          publicId: `mock-${Date.now()}`,
          width: 800,
          height: 600,
          duration: file.type.startsWith('video/') ? 30 : null
        })
      }
      reader.readAsDataURL(file)
    }, 1000)
  })
}

// Media Editor Component
const MediaEditor = ({ media, onSave, onClose }) => {
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [saturation, setSaturation] = useState(100)
  const [rotation, setRotation] = useState(0)
  const [flipX, setFlipX] = useState(false)
  const [flipY, setFlipY] = useState(false)
  const [altText, setAltText] = useState(media.alt || '')
  const [caption, setCaption] = useState(media.caption || '')
  const [title, setTitle] = useState(media.title || '')
  
  // Video specific settings
  const [autoplay, setAutoplay] = useState(media.autoplay || false)
  const [loop, setLoop] = useState(media.loop || false)
  const [muted, setMuted] = useState(media.muted || false)
  const [controls, setControls] = useState(media.controls !== false)
  
  const isVideo = media.type === 'video'

  const applyFilters = () => {
    return `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`
  }

  const resetFilters = () => {
    setBrightness(100)
    setContrast(100)
    setSaturation(100)
    setRotation(0)
    setFlipX(false)
    setFlipY(false)
  }

  const handleSave = () => {
    onSave({
      ...media,
      alt: altText,
      caption: caption,
      title: title,
      autoplay,
      loop,
      muted,
      controls,
      edits: { brightness, contrast, saturation, rotation, flipX, flipY }
    })
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-5 border-b dark:border-gray-700">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Wand2 size={20} /> Edit {isVideo ? 'Video' : 'Image'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl">
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col md:flex-row p-6 gap-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden flex items-center justify-center min-h-[300px] md:min-h-[400px]">
            {isVideo ? (
              <video
                src={media.url}
                controls={controls}
                autoPlay={autoplay}
                loop={loop}
                muted={muted}
                style={{
                  filter: applyFilters(),
                  transform: `rotate(${rotation}deg) scaleX(${flipX ? -1 : 1}) scaleY(${flipY ? -1 : 1})`,
                  maxWidth: '100%',
                  maxHeight: '400px',
                  objectFit: 'contain'
                }}
                className="rounded-lg"
              />
            ) : (
              <img
                src={media.url}
                alt={altText}
                style={{
                  filter: applyFilters(),
                  transform: `rotate(${rotation}deg) scaleX(${flipX ? -1 : 1}) scaleY(${flipY ? -1 : 1})`,
                  transition: 'all 0.2s ease',
                  maxWidth: '100%',
                  maxHeight: '400px',
                  objectFit: 'contain'
                }}
              />
            )}
          </div>

          <div className="w-full md:w-80 space-y-4">
            {/* SEO Settings */}
            <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <Type size={14} className="text-purple-600" />
                <span className="text-sm font-medium">SEO Settings</span>
              </div>
              
              {isVideo && (
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Title (SEO)"
                  className="w-full px-3 py-2 text-sm border rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800"
                />
              )}
              
              <input
                type="text"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                placeholder={`ALT Text ${isVideo ? '' : '(SEO)'}`}
                className="w-full px-3 py-2 text-sm border rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800"
              />
              
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Caption"
                className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800"
              />
            </div>

            {/* Video Settings */}
            {isVideo && (
              <div className="p-3 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <Video size={14} className="text-blue-600" />
                  <span className="text-sm font-medium">Video Settings</span>
                </div>
                
                <label className="flex items-center justify-between p-2 hover:bg-white/50 rounded-lg cursor-pointer">
                  <span className="text-sm">🎮 Show Controls</span>
                  <input type="checkbox" checked={controls} onChange={(e) => setControls(e.target.checked)} className="w-4 h-4 rounded" />
                </label>
                
                <label className="flex items-center justify-between p-2 hover:bg-white/50 rounded-lg cursor-pointer">
                  <span className="text-sm">▶️ Autoplay</span>
                  <input type="checkbox" checked={autoplay} onChange={(e) => setAutoplay(e.target.checked)} className="w-4 h-4 rounded" />
                </label>
                
                <label className="flex items-center justify-between p-2 hover:bg-white/50 rounded-lg cursor-pointer">
                  <span className="text-sm">🔄 Loop</span>
                  <input type="checkbox" checked={loop} onChange={(e) => setLoop(e.target.checked)} className="w-4 h-4 rounded" />
                </label>
                
                <label className="flex items-center justify-between p-2 hover:bg-white/50 rounded-lg cursor-pointer">
                  <span className="text-sm">🔇 Muted</span>
                  <input type="checkbox" checked={muted} onChange={(e) => setMuted(e.target.checked)} className="w-4 h-4 rounded" />
                </label>
              </div>
            )}

            {/* Image Filters */}
            <div>
              <label className="text-sm font-medium flex items-center gap-2 mb-2">
                <Sun size={14} /> Brightness ({brightness}%)
              </label>
              <input
                type="range"
                min="0"
                max="200"
                value={brightness}
                onChange={(e) => setBrightness(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm font-medium flex items-center gap-2 mb-2">
                <Contrast size={14} /> Contrast ({contrast}%)
              </label>
              <input
                type="range"
                min="0"
                max="200"
                value={contrast}
                onChange={(e) => setContrast(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm font-medium flex items-center gap-2 mb-2">
                <Droplet size={14} /> Saturation ({saturation}%)
              </label>
              <input
                type="range"
                min="0"
                max="200"
                value={saturation}
                onChange={(e) => setSaturation(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button onClick={() => setRotation(prev => prev + 90)} className="flex-1 py-2 border rounded-lg text-sm hover:bg-gray-50 flex items-center justify-center gap-1">
                <RotateCw size={14} /> Rotate
              </button>
              <button onClick={() => setFlipX(!flipX)} className={`flex-1 py-2 border rounded-lg text-sm hover:bg-gray-50 ${flipX ? 'bg-purple-50 border-purple-300' : ''}`}>
                <FlipHorizontal size={14} className="inline mr-1" /> Flip H
              </button>
              <button onClick={() => setFlipY(!flipY)} className={`flex-1 py-2 border rounded-lg text-sm hover:bg-gray-50 ${flipY ? 'bg-purple-50 border-purple-300' : ''}`}>
                <FlipVertical size={14} className="inline mr-1" /> Flip V
              </button>
            </div>

            <button onClick={resetFilters} className="w-full py-2 text-sm text-gray-600 hover:text-gray-900">
              Reset all filters
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-5 border-t dark:border-gray-700">
          <button onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
            Apply Changes
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// Layout Options
const LAYOUT_OPTIONS = [
  { id: 'grid', icon: Grid, label: 'Grid', cols: 3, description: 'Standard grid layout' },
  { id: 'masonry', icon: LayoutGrid, label: 'Masonry', cols: 3, description: 'Pinterest-style layout' },
  { id: 'two-column', icon: Columns, label: '2 Columns', cols: 2, description: 'Split into two columns' },
  { id: 'carousel', icon: RectangleHorizontal, label: 'Carousel', cols: 1, description: 'Sliding carousel' },
]

// Media Type Tabs
const MEDIA_TYPES = [
  { id: 'all', label: 'All Media' },
  { id: 'image', label: 'Images', icon: Image },
  { id: 'video', label: 'Videos', icon: Video },
]

// Main Gallery Modal
const GalleryModal = ({ isOpen, onClose, onInsert, initialData = null }) => {
  const [mediaItems, setMediaItems] = useState([])
  const [selectedMedia, setSelectedMedia] = useState(new Set())
  const [uploading, setUploading] = useState(false)
  const [galleryTitle, setGalleryTitle] = useState('')
  const [galleryCaption, setGalleryCaption] = useState('')
  const [layout, setLayout] = useState('grid')
  const [mediaSize, setMediaSize] = useState('medium')
  const [mediaGap, setMediaGap] = useState('medium')
  const [galleryAlignment, setGalleryAlignment] = useState('center')
  const [galleryWidth, setGalleryWidth] = useState('100%')
  const [showLightbox, setShowLightbox] = useState(null)
  const [editingMedia, setEditingMedia] = useState(null)
  const [dragEnabled, setDragEnabled] = useState(true)
  const [uploadProgress, setUploadProgress] = useState({})
  const [activeTab, setActiveTab] = useState('all')
  const [isEditing, setIsEditing] = useState(false)
  
  const fileInputRef = useRef(null)
  const videoInputRef = useRef(null)

  // Initialize with existing data if editing
  useEffect(() => {
    if (initialData) {
      setIsEditing(true)
      setGalleryTitle(initialData.title || '')
      setGalleryCaption(initialData.caption || '')
      setLayout(initialData.layout || 'grid')
      setMediaSize(initialData.settings?.mediaSize || 'medium')
      setMediaGap(initialData.settings?.gap || 'medium')
      setGalleryAlignment(initialData.alignment || 'center')
      setGalleryWidth(initialData.width || '100%')
      
      if (initialData.media) {
        setMediaItems(initialData.media.map(m => ({
          ...m,
          id: m.id || Date.now() + Math.random()
        })))
      }
    } else {
      setIsEditing(false)
    }
  }, [initialData])

  const gapSizes = {
    small: 'gap-2',
    medium: 'gap-4',
    large: 'gap-6'
  }

  const sizeClasses = {
    small: 'h-32',
    medium: 'h-48',
    large: 'h-64'
  }

  const filteredMedia = mediaItems.filter(item => {
    if (activeTab === 'all') return true
    return item.type === activeTab
  })

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return
    
    setUploading(true)
    const newMedia = []
    
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image`)
        continue
      }
      
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 10MB`)
        continue
      }
      
      setUploadProgress(prev => ({ ...prev, [file.name]: 0 }))
      
      try {
        const result = await uploadToCloudinary(file, { 
          folder: 'blog/galleries',
        })
        
        const dimensions = await new Promise((resolve) => {
          const img = new Image()
          img.onload = () => resolve({ width: img.width, height: img.height })
          img.src = result.url
        })
        
        newMedia.push({
          id: Date.now() + Math.random(),
          type: 'image',
          url: result.url,
          publicId: result.publicId,
          name: file.name,
          size: file.size,
          caption: '',
          alt: file.name.replace(/\.[^/.]+$/, ''),
          width: dimensions.width,
          height: dimensions.height
        })
        
        setUploadProgress(prev => {
          const newProgress = { ...prev }
          delete newProgress[file.name]
          return newProgress
        })
      } catch (error) {
        console.error('Upload failed:', error)
        toast.error(`Failed to upload ${file.name}`)
      }
    }
    
    setMediaItems(prev => [...prev, ...newMedia])
    setUploading(false)
    
    if (newMedia.length > 0) {
      toast.success(`Added ${newMedia.length} image${newMedia.length > 1 ? 's' : ''}`)
    }
  }

  const handleVideoUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return
    
    setUploading(true)
    const newMedia = []
    
    for (const file of files) {
      if (!file.type.startsWith('video/')) {
        toast.error(`${file.name} is not a video`)
        continue
      }
      
      if (file.size > 100 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 100MB`)
        continue
      }
      
      setUploadProgress(prev => ({ ...prev, [file.name]: 0 }))
      
      try {
        const result = await uploadToCloudinary(file, { 
          folder: 'blog/galleries',
          resource_type: 'video'
        })
        
        newMedia.push({
          id: Date.now() + Math.random(),
          type: 'video',
          url: result.url,
          publicId: result.publicId,
          name: file.name,
          size: file.size,
          caption: '',
          alt: file.name.replace(/\.[^/.]+$/, ''),
          title: file.name.replace(/\.[^/.]+$/, ''),
          width: result.width || 640,
          height: result.height || 360,
          duration: result.duration || 0,
          controls: true,
          autoplay: false,
          loop: false,
          muted: false
        })
        
        setUploadProgress(prev => {
          const newProgress = { ...prev }
          delete newProgress[file.name]
          return newProgress
        })
      } catch (error) {
        console.error('Upload failed:', error)
        toast.error(`Failed to upload ${file.name}`)
      }
    }
    
    setMediaItems(prev => [...prev, ...newMedia])
    setUploading(false)
    
    if (newMedia.length > 0) {
      toast.success(`Added ${newMedia.length} video${newMedia.length > 1 ? 's' : ''}`)
    }
  }

  const removeMedia = (mediaId) => {
    setMediaItems(prev => prev.filter(item => item.id !== mediaId))
    setSelectedMedia(prev => {
      const newSet = new Set(prev)
      newSet.delete(mediaId)
      return newSet
    })
    toast.success('Media removed')
  }

  const toggleSelect = (mediaId) => {
    setSelectedMedia(prev => {
      const newSet = new Set(prev)
      if (newSet.has(mediaId)) {
        newSet.delete(mediaId)
      } else {
        newSet.add(mediaId)
      }
      return newSet
    })
  }

  const selectAll = () => {
    const filteredIds = filteredMedia.map(item => item.id)
    if (selectedMedia.size === filteredIds.length) {
      setSelectedMedia(new Set())
    } else {
      setSelectedMedia(new Set(filteredIds))
    }
  }

  const deleteSelected = () => {
    setMediaItems(prev => prev.filter(item => !selectedMedia.has(item.id)))
    setSelectedMedia(new Set())
    toast.success(`Removed ${selectedMedia.size} item${selectedMedia.size > 1 ? 's' : ''}`)
  }

  const updateMediaCaption = (mediaId, caption) => {
    setMediaItems(prev => prev.map(item => 
      item.id === mediaId ? { ...item, caption } : item
    ))
  }

  const updateMediaAlt = (mediaId, alt) => {
    setMediaItems(prev => prev.map(item => 
      item.id === mediaId ? { ...item, alt } : item
    ))
  }

  const onDragEnd = (result) => {
    if (!result.destination) return
    
    const items = Array.from(mediaItems)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)
    
    setMediaItems(items)
  }

  const insertGallery = () => {
    if (mediaItems.length === 0) {
      toast.error('Please add at least one image or video')
      return
    }
    
    const galleryData = {
      type: 'gallery',
      layout: layout,
      title: galleryTitle,
      caption: galleryCaption,
      alignment: galleryAlignment,
      width: galleryWidth,
      media: mediaItems.map(item => ({
        id: item.id,
        type: item.type,
        src: item.url,
        alt: item.alt,
        caption: item.caption,
        title: item.title,
        width: item.width,
        height: item.height,
        duration: item.duration,
        controls: item.controls,
        autoplay: item.autoplay,
        loop: item.loop,
        muted: item.muted,
        edits: item.edits
      })),
      settings: {
        mediaSize: mediaSize,
        gap: mediaGap
      }
    }
    
    onInsert(galleryData)
    toast.success(`Gallery inserted with ${mediaItems.length} items`)
    onClose()
  }

  const copyMediaToClipboard = async (mediaUrl) => {
    try {
      const response = await fetch(mediaUrl)
      const blob = await response.blob()
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob
        })
      ])
      toast.success('Copied to clipboard!')
    } catch (err) {
      toast.error('Failed to copy')
    }
  }

  const downloadMedia = (mediaUrl, filename) => {
    const link = document.createElement('a')
    link.href = mediaUrl
    link.download = filename
    link.click()
    toast.success('Download started!')
  }

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setMediaItems([])
        setSelectedMedia(new Set())
        setGalleryTitle('')
        setGalleryCaption('')
        setLayout('grid')
        setMediaSize('medium')
        setMediaGap('medium')
        setGalleryAlignment('center')
        setGalleryWidth('100%')
        setShowLightbox(null)
        setEditingMedia(null)
        setActiveTab('all')
        setIsEditing(false)
      }, 300)
    }
  }, [isOpen])

  if (!isOpen) return null

  const imageCount = mediaItems.filter(i => i.type === 'image').length
  const videoCount = mediaItems.filter(i => i.type === 'video').length

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex-shrink-0 px-6 py-5 border-b dark:border-gray-700 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <LayoutGrid className="w-6 h-6 text-purple-600" />
                    {isEditing ? 'Edit Gallery' : 'Media Gallery'}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Create beautiful galleries with images and videos
                    {(imageCount > 0 || videoCount > 0) && (
                      <span className="ml-2">
                        ({imageCount} images, {videoCount} videos)
                      </span>
                    )}
                  </p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/50 rounded-xl transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {/* Gallery Settings */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Gallery Title</label>
                  <input
                    type="text"
                    placeholder="Gallery Title (optional)"
                    value={galleryTitle}
                    onChange={(e) => setGalleryTitle(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Gallery Caption</label>
                  <input
                    type="text"
                    placeholder="Caption (optional)"
                    value={galleryCaption}
                    onChange={(e) => setGalleryCaption(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-700"
                  />
                </div>
              </div>

              {/* Layout Options */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Layout Style</label>
                <div className="flex flex-wrap gap-2">
                  {LAYOUT_OPTIONS.map(opt => {
                    const Icon = opt.icon
                    return (
                      <button
                        key={opt.id}
                        onClick={() => setLayout(opt.id)}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${layout === opt.id ? 'bg-purple-600 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200'}`}
                      >
                        <Icon size={16} />
                        {opt.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Gallery Alignment & Width */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Gallery Alignment</label>
                  <div className="flex gap-2">
                    {[
                      { value: 'left', icon: AlignLeft, label: 'Left' },
                      { value: 'center', icon: AlignCenter, label: 'Center' },
                      { value: 'right', icon: AlignRight, label: 'Right' }
                    ].map(align => (
                      <button
                        key={align.value}
                        onClick={() => setGalleryAlignment(align.value)}
                        className={`flex-1 py-2 rounded-lg border flex items-center justify-center gap-2 transition ${
                          galleryAlignment === align.value 
                            ? 'bg-purple-600 text-white border-purple-600' 
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <align.icon size={14} />
                        <span className="text-sm">{align.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Gallery Width</label>
                  <div className="flex gap-2">
                    {['50%', '75%', '100%'].map(size => (
                      <button
                        key={size}
                        onClick={() => setGalleryWidth(size)}
                        className={`flex-1 py-2 rounded-lg border text-sm transition ${
                          galleryWidth === size 
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

              {/* Media Settings */}
              <div className="mb-6 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Media Size</label>
                  <div className="flex gap-2">
                    {['small', 'medium', 'large'].map(size => (
                      <button
                        key={size}
                        onClick={() => setMediaSize(size)}
                        className={`flex-1 py-2 rounded-lg capitalize transition-all ${mediaSize === size ? 'bg-purple-600 text-white' : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200'}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Media Gap</label>
                  <div className="flex gap-2">
                    {['small', 'medium', 'large'].map(gap => (
                      <button
                        key={gap}
                        onClick={() => setMediaGap(gap)}
                        className={`flex-1 py-2 rounded-lg capitalize transition-all ${mediaGap === gap ? 'bg-purple-600 text-white' : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200'}`}
                      >
                        {gap}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Upload Areas */}
              <div className="mb-6 grid grid-cols-2 gap-4">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-6 text-center cursor-pointer hover:border-purple-500 transition-all"
                >
                  <Image className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 dark:text-gray-400">Upload Images</p>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG, GIF, WebP (Max 10MB)</p>
                </div>
                <div
                  onClick={() => videoInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-6 text-center cursor-pointer hover:border-purple-500 transition-all"
                >
                  <Video className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 dark:text-gray-400">Upload Videos</p>
                  <p className="text-xs text-gray-400 mt-1">MP4, WebM, MOV (Max 100MB)</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  multiple
                  onChange={handleVideoUpload}
                  className="hidden"
                />
              </div>

              {/* Upload Progress */}
              {Object.keys(uploadProgress).length > 0 && (
                <div className="mb-4 space-y-2">
                  {Object.entries(uploadProgress).map(([name, progress]) => (
                    <div key={name} className="bg-gray-100 dark:bg-gray-800 rounded-lg p-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="truncate">{name}</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-300 rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Media Type Tabs */}
              {mediaItems.length > 0 && (
                <div className="mb-4 flex gap-2 border-b">
                  {MEDIA_TYPES.map(tab => {
                    const Icon = tab.icon
                    const count = tab.id === 'all' 
                      ? mediaItems.length 
                      : mediaItems.filter(i => i.type === tab.id).length
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 text-sm font-medium flex items-center gap-2 transition-all ${
                          activeTab === tab.id 
                            ? 'text-purple-600 border-b-2 border-purple-600' 
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        {Icon && <Icon size={14} />}
                        {tab.label} ({count})
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Media Controls */}
              {filteredMedia.length > 0 && (
                <div className="mb-4 flex justify-between items-center flex-wrap gap-2">
                  <div className="flex gap-2">
                    <button onClick={selectAll} className="px-3 py-1 text-sm border rounded-lg hover:bg-gray-50">
                      {selectedMedia.size === filteredMedia.length ? 'Deselect All' : 'Select All'}
                    </button>
                    {selectedMedia.size > 0 && (
                      <button onClick={deleteSelected} className="px-3 py-1 text-sm bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100">
                        Delete Selected ({selectedMedia.size})
                      </button>
                    )}
                    <button
                      onClick={() => setDragEnabled(!dragEnabled)}
                      className="px-3 py-1 text-sm border rounded-lg hover:bg-gray-50 flex items-center gap-1"
                    >
                      <Move size={14} />
                      {dragEnabled ? 'Drag Mode ON' : 'Drag Mode OFF'}
                    </button>
                  </div>
                  <div className="text-sm text-gray-500">{filteredMedia.length} items</div>
                </div>
              )}

              {/* Gallery Grid with Drag & Drop */}
              {uploading && Object.keys(uploadProgress).length === 0 && mediaItems.length === 0 && (
                <div className="flex items-center justify-center py-12">
                  <Loader className="w-8 h-8 animate-spin text-purple-600" />
                  <span className="ml-2">Processing media...</span>
                </div>
              )}

              {filteredMedia.length > 0 && (
                <DragDropContext onDragEnd={onDragEnd}>
                  <Droppable droppableId="gallery" direction="horizontal">
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`grid ${gapSizes[mediaGap]} ${
                          layout === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' :
                          layout === 'two-column' ? 'grid-cols-1 md:grid-cols-2' :
                          layout === 'carousel' ? 'grid-cols-1' :
                          'grid-cols-2 md:grid-cols-3'
                        }`}
                      >
                        {filteredMedia.map((item, index) => (
                          <Draggable key={item.id} draggableId={String(item.id)} index={index} isDragDisabled={!dragEnabled}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`relative group rounded-xl overflow-hidden border-2 transition-all ${
                                  selectedMedia.has(item.id) ? 'border-purple-500 shadow-lg' : 'border-gray-200 dark:border-gray-700'
                                } ${snapshot.isDragging ? 'shadow-2xl rotate-3 scale-105' : ''}`}
                              >
                                <div {...provided.dragHandleProps} className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity cursor-move">
                                  <GripVertical className="w-5 h-5 text-white drop-shadow-lg" />
                                </div>
                                
                                {/* Media Type Badge */}
                                <div className="absolute top-2 left-2 z-10">
                                  {item.type === 'video' ? (
                                    <Video className="w-5 h-5 text-white drop-shadow-lg" />
                                  ) : null}
                                </div>
                                
                                {/* Media Preview */}
                                {item.type === 'video' ? (
                                  <video
                                    src={item.url}
                                    className={`w-full ${sizeClasses[mediaSize]} object-cover`}
                                    poster={item.poster}
                                    muted
                                  />
                                ) : (
                                  <img
                                    src={item.url}
                                    alt={item.alt}
                                    className={`w-full ${sizeClasses[mediaSize]} object-cover`}
                                  />
                                )}
                                
                                {/* Play indicator for videos */}
                                {item.type === 'video' && (
                                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="w-12 h-12 bg-black/50 rounded-full flex items-center justify-center">
                                      <Play size={24} className="text-white ml-1" />
                                    </div>
                                  </div>
                                )}
                                
                                {/* Overlay Controls */}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => setShowLightbox({ url: item.url, type: item.type })}
                                    className="p-2 bg-white rounded-lg hover:bg-gray-100"
                                    title="Preview"
                                  >
                                    <Eye size={16} />
                                  </button>
                                  <button
                                    onClick={() => copyMediaToClipboard(item.url)}
                                    className="p-2 bg-white rounded-lg hover:bg-gray-100"
                                    title="Copy URL"
                                  >
                                    <Copy size={16} />
                                  </button>
                                  <button
                                    onClick={() => downloadMedia(item.url, item.name)}
                                    className="p-2 bg-white rounded-lg hover:bg-gray-100"
                                    title="Download"
                                  >
                                    <Download size={16} />
                                  </button>
                                  <button
                                    onClick={() => setEditingMedia(item)}
                                    className="p-2 bg-white rounded-lg hover:bg-gray-100"
                                    title="Edit Media"
                                  >
                                    <Wand2 size={16} />
                                  </button>
                                  <button
                                    onClick={() => removeMedia(item.id)}
                                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                                    title="Remove"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                                
                                {/* Selection Checkbox */}
                                <div className="absolute top-2 right-2 z-10">
                                  <input
                                    type="checkbox"
                                    checked={selectedMedia.has(item.id)}
                                    onChange={() => toggleSelect(item.id)}
                                    className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                  />
                                </div>
                                
                                {/* Duration badge for videos */}
                                {item.type === 'video' && item.duration && (
                                  <div className="absolute bottom-20 right-2 z-10 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                    {Math.floor(item.duration / 60)}:{String(Math.floor(item.duration % 60)).padStart(2, '0')}
                                  </div>
                                )}
                                
                                {/* Caption & ALT Inputs */}
                                <div className="p-2 bg-white dark:bg-gray-800 space-y-1">
                                  <input
                                    type="text"
                                    placeholder={item.type === 'video' ? 'Title' : 'ALT Text (SEO)'}
                                    value={item.type === 'video' ? (item.title || '') : item.alt}
                                    onChange={(e) => item.type === 'video' 
                                      ? setMediaItems(prev => prev.map(m => m.id === item.id ? {...m, title: e.target.value} : m))
                                      : updateMediaAlt(item.id, e.target.value)
                                    }
                                    className="w-full text-xs border-0 focus:ring-0 focus:outline-none bg-transparent placeholder-gray-400"
                                  />
                                  <input
                                    type="text"
                                    placeholder="Caption"
                                    value={item.caption}
                                    onChange={(e) => updateMediaCaption(item.id, e.target.value)}
                                    className="w-full text-xs border-0 focus:ring-0 focus:outline-none bg-transparent placeholder-gray-400"
                                  />
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              )}
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <div className="text-xs text-gray-500">
                {mediaItems.length > 0 && `${mediaItems.length} item${mediaItems.length > 1 ? 's' : ''} ready`}
              </div>
              <div className="flex gap-3">
                <button onClick={onClose} className="px-5 py-2 border rounded-xl hover:bg-gray-50 transition-all">
                  Cancel
                </button>
                <button
                  onClick={insertGallery}
                  disabled={mediaItems.length === 0}
                  className="px-6 py-2 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <LayoutGrid size={16} />
                  {isEditing ? 'Update Gallery' : 'Insert Gallery'} ({mediaItems.length})
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Lightbox Modal */}
      {showLightbox && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90" onClick={() => setShowLightbox(null)}>
          <div className="relative max-w-5xl max-h-[90vh]">
            {showLightbox.type === 'video' ? (
              <video
                src={showLightbox.url}
                controls
                autoPlay
                className="max-w-full max-h-[90vh] object-contain"
              />
            ) : (
              <img src={showLightbox.url} alt="Lightbox" className="max-w-full max-h-[90vh] object-contain" />
            )}
            <button
              onClick={() => setShowLightbox(null)}
              className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70"
            >
              <X size={24} />
            </button>
          </div>
        </div>
      )}

      {/* Media Editor Modal */}
      {editingMedia && (
        <MediaEditor
          media={editingMedia}
          onSave={(updatedMedia) => {
            setMediaItems(prev => prev.map(item => 
              item.id === updatedMedia.id ? updatedMedia : item
            ))
            setEditingMedia(null)
            toast.success('Media updated!')
          }}
          onClose={() => setEditingMedia(null)}
        />
      )}
    </AnimatePresence>
  )
}

export default GalleryModal