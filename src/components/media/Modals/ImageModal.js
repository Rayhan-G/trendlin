// src/components/media/Modals/ImageModal.jsx - ENHANCED FOR MEDIACONTROLS INTEGRATION
import React, { useState, useCallback, useRef, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, Upload, Lock, Unlock, Maximize2, Check, Eye, 
  RefreshCw, Settings, AlignLeft, AlignCenter, AlignRight, Type, Crop, 
  RotateCw, Move, ImageIcon, Link2
} from 'lucide-react'
import { toast } from 'react-toastify'

const ImageModal = ({ isOpen, onClose, onUpload, initialData = null }) => {
  // File state
  const [file, setFile] = useState(null)
  const [originalFile, setOriginalFile] = useState(null)
  const [currentImageUrl, setCurrentImageUrl] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  
  // Crop state
  const [showCropTool, setShowCropTool] = useState(false)
  const [crop, setCrop] = useState({ unit: '%', width: 90, height: 90, x: 5, y: 5 })
  const [completedCrop, setCompletedCrop] = useState(null)
  const imgRef = useRef(null)
  
  // Resize state
  const [resizeW, setResizeW] = useState('')
  const [resizeH, setResizeH] = useState('')
  const [lockAspect, setLockAspect] = useState(true)
  const [aspect, setAspect] = useState(1)
  const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 })
  
  // Preview state
  const [previewImage, setPreviewImage] = useState(null)
  const [isPreviewing, setIsPreviewing] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  
  // SEO state
  const [altText, setAltText] = useState('')
  const [caption, setCaption] = useState('')
  const [imageTitle, setImageTitle] = useState('')
  const [imageAlignment, setImageAlignment] = useState('center')
  const [imageWidth, setImageWidth] = useState('100%')
  const [imageLink, setImageLink] = useState('')
  
  // History state
  const [history, setHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  
  // Refs
  const inputRef = useRef(null)
  
  // Initialize with existing data if editing
  useEffect(() => {
    if (initialData) {
      setIsEditing(true)
      setAltText(initialData.alt || '')
      setCaption(initialData.caption || '')
      setImageTitle(initialData.title || '')
      setImageAlignment(initialData.alignment || 'center')
      setImageWidth(initialData.width || '100%')
      setImageLink(initialData.link || '')
      
      if (initialData.src) {
        setCurrentImageUrl(initialData.src)
        // Get dimensions for existing image
        const img = new window.Image()
        img.onload = () => {
          setAspect(img.width / img.height)
          setOriginalDimensions({ width: img.width, height: img.height })
          setResizeW(img.width.toString())
          setResizeH(img.height.toString())
        }
        img.src = initialData.src
      }
    } else {
      setIsEditing(false)
    }
  }, [initialData])
  
  // Cleanup function for object URLs
  const cleanupObjectUrl = useCallback((url) => {
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url)
    }
  }, [])
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (currentImageUrl && currentImageUrl.startsWith('blob:')) {
        cleanupObjectUrl(currentImageUrl)
      }
    }
  }, [currentImageUrl, cleanupObjectUrl])
  
  // Reset modal state when closed
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        if (!isOpen) {
          setFile(null)
          setOriginalFile(null)
          if (currentImageUrl && currentImageUrl.startsWith('blob:')) {
            cleanupObjectUrl(currentImageUrl)
          }
          setCurrentImageUrl(null)
          setShowCropTool(false)
          setIsPreviewing(false)
          setPreviewImage(null)
          setResizeW('')
          setResizeH('')
          setHistory([])
          setHistoryIndex(-1)
          setCompletedCrop(null)
          setOriginalDimensions({ width: 0, height: 0 })
          setAspect(1)
          setLockAspect(true)
          setAltText('')
          setCaption('')
          setImageTitle('')
          setImageAlignment('center')
          setImageWidth('100%')
          setImageLink('')
          setIsEditing(false)
          setShowAdvanced(false)
        }
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [isOpen, cleanupObjectUrl])
  
  const handleFileSelect = (e) => {
    const f = e.target.files[0]
    if (!f) return
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg']
    if (!validTypes.includes(f.type)) {
      toast.error('Please select a valid image (JPG, PNG, WebP, GIF)')
      return
    }
    
    // Validate file size (10MB max)
    if (f.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB')
      return
    }
    
    // Clean up old object URL
    if (currentImageUrl && currentImageUrl.startsWith('blob:')) {
      cleanupObjectUrl(currentImageUrl)
    }
    
    setFile(f)
    setOriginalFile(f)
    
    const url = URL.createObjectURL(f)
    setCurrentImageUrl(url)
    
    // Auto-set title from filename if empty
    if (!imageTitle) {
      const nameWithoutExt = f.name.replace(/\.[^/.]+$/, '')
      setImageTitle(nameWithoutExt)
    }
    
    // Get image dimensions
    const img = new window.Image()
    img.onload = () => {
      const ratio = img.width / img.height
      setAspect(ratio)
      setOriginalDimensions({ width: img.width, height: img.height })
      setResizeW(img.width.toString())
      setResizeH(img.height.toString())
    }
    img.src = url
    
    // Initialize history
    setHistory([{ url, isBlob: true }])
    setHistoryIndex(0)
    setShowCropTool(false)
    setIsPreviewing(false)
    setPreviewImage(null)
    
    toast.success(`Loaded: ${f.name}`)
  }
  
  const handleChangeFile = () => {
    inputRef.current?.click()
  }
  
  const addToHistory = useCallback((newUrl, isBlob = true) => {
    const newHistory = history.slice(0, historyIndex + 1).slice(-20)
    newHistory.push({ url: newUrl, isBlob })
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }, [history, historyIndex])
  
  const onImageLoad = (e) => {
    imgRef.current = e.currentTarget
  }
  
  const startCropping = () => {
    if (!currentImageUrl) return
    setShowCropTool(true)
    setIsPreviewing(false)
    setPreviewImage(null)
    setCrop({ unit: '%', width: 90, height: 90, x: 5, y: 5 })
  }
  
  const cancelCropping = () => {
    setShowCropTool(false)
    setCompletedCrop(null)
  }
  
  const getCroppedImg = useCallback(async () => {
    if (!completedCrop || !imgRef.current) {
      toast.error('Please select a crop area first')
      return
    }
    
    setIsProcessing(true)
    
    try {
      const image = imgRef.current
      const canvas = document.createElement('canvas')
      const scaleX = image.naturalWidth / image.width
      const scaleY = image.naturalHeight / image.height
      
      const cropWidth = completedCrop.width * scaleX
      const cropHeight = completedCrop.height * scaleY
      const cropX = completedCrop.x * scaleX
      const cropY = completedCrop.y * scaleY
      
      if (cropWidth <= 0 || cropHeight <= 0) {
        throw new Error('Invalid crop dimensions')
      }
      
      canvas.width = cropWidth
      canvas.height = cropHeight
      
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        throw new Error('Could not get canvas context')
      }
      
      ctx.drawImage(
        image,
        cropX, cropY, cropWidth, cropHeight,
        0, 0, cropWidth, cropHeight
      )
      
      const blob = await new Promise((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob)
            else reject(new Error('Failed to create blob'))
          },
          'image/jpeg',
          0.95
        )
      })
      
      const croppedUrl = URL.createObjectURL(blob)
      setCurrentImageUrl(croppedUrl)
      addToHistory(croppedUrl, true)
      
      const croppedFile = new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' })
      setFile(croppedFile)
      
      // Update dimensions
      const img = new window.Image()
      img.onload = () => {
        setAspect(img.width / img.height)
        setOriginalDimensions({ width: img.width, height: img.height })
        setResizeW(img.width.toString())
        setResizeH(img.height.toString())
      }
      img.src = croppedUrl
      
      setCompletedCrop(null)
      setShowCropTool(false)
      setIsPreviewing(false)
      setPreviewImage(null)
      toast.success('Image cropped successfully!')
      
    } catch (error) {
      console.error('Crop error:', error)
      toast.error(error.message || 'Failed to crop image')
    } finally {
      setIsProcessing(false)
    }
  }, [completedCrop, addToHistory])
  
  const previewResize = useCallback((w, h) => {
    if (!currentImageUrl || isProcessing) return
    
    setIsProcessing(true)
    
    const img = new window.Image()
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        
        if (!ctx) {
          throw new Error('Could not get canvas context')
        }
        
        ctx.drawImage(img, 0, 0, w, h)
        const preview = canvas.toDataURL('image/jpeg', 0.9)
        setPreviewImage(preview)
        setIsPreviewing(true)
      } catch (error) {
        console.error('Preview error:', error)
        toast.error('Failed to generate preview')
      } finally {
        setIsProcessing(false)
      }
    }
    img.onerror = () => {
      setIsProcessing(false)
      toast.error('Failed to load image for preview')
    }
    img.src = currentImageUrl
  }, [currentImageUrl, isProcessing])
  
  const applyResize = useCallback(() => {
    const w = parseInt(resizeW)
    const h = parseInt(resizeH)
    
    if (isNaN(w) || isNaN(h) || w <= 0 || h <= 0) {
      toast.error('Please enter valid width and height')
      return
    }
    
    if (w > 4000 || h > 4000) {
      toast.error('Dimensions cannot exceed 4000px')
      return
    }
    
    setIsProcessing(true)
    
    const img = new window.Image()
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        
        if (!ctx) {
          throw new Error('Could not get canvas context')
        }
        
        ctx.drawImage(img, 0, 0, w, h)
        
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              throw new Error('Failed to create blob')
            }
            
            const resizedUrl = URL.createObjectURL(blob)
            
            if (currentImageUrl && currentImageUrl.startsWith('blob:')) {
              cleanupObjectUrl(currentImageUrl)
            }
            
            setCurrentImageUrl(resizedUrl)
            addToHistory(resizedUrl, true)
            
            const resizedFile = new File([blob], 'resized-image.jpg', { type: 'image/jpeg' })
            setFile(resizedFile)
            
            setAspect(w / h)
            setOriginalDimensions({ width: w, height: h })
            setResizeW(w.toString())
            setResizeH(h.toString())
            setIsPreviewing(false)
            setPreviewImage(null)
            
            toast.success(`Resized to ${w}×${h}px`)
          },
          'image/jpeg',
          0.92
        )
      } catch (error) {
        console.error('Resize error:', error)
        toast.error(error.message || 'Failed to resize image')
      } finally {
        setIsProcessing(false)
      }
    }
    img.onerror = () => {
      setIsProcessing(false)
      toast.error('Failed to load image for resize')
    }
    img.src = currentImageUrl
  }, [resizeW, resizeH, currentImageUrl, addToHistory, cleanupObjectUrl])
  
  const cancelPreview = () => {
    setIsPreviewing(false)
    setPreviewImage(null)
  }
  
  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      const previousState = history[newIndex]
      
      setHistoryIndex(newIndex)
      setCurrentImageUrl(previousState.url)
      setShowCropTool(false)
      setIsPreviewing(false)
      setPreviewImage(null)
      
      // Recalculate aspect ratio
      const img = new window.Image()
      img.onload = () => {
        setAspect(img.width / img.height)
        setOriginalDimensions({ width: img.width, height: img.height })
        setResizeW(img.width.toString())
        setResizeH(img.height.toString())
      }
      img.src = previousState.url
      
      toast.info('Undo')
    }
  }
  
  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      const nextState = history[newIndex]
      
      setHistoryIndex(newIndex)
      setCurrentImageUrl(nextState.url)
      setShowCropTool(false)
      setIsPreviewing(false)
      setPreviewImage(null)
      
      // Recalculate aspect ratio
      const img = new window.Image()
      img.onload = () => {
        setAspect(img.width / img.height)
        setOriginalDimensions({ width: img.width, height: img.height })
        setResizeW(img.width.toString())
        setResizeH(img.height.toString())
      }
      img.src = nextState.url
      
      toast.info('Redo')
    }
  }
  
  const reset = () => {
    if (originalFile) {
      if (currentImageUrl && currentImageUrl.startsWith('blob:')) {
        cleanupObjectUrl(currentImageUrl)
      }
      
      const newUrl = URL.createObjectURL(originalFile)
      setCurrentImageUrl(newUrl)
      setFile(originalFile)
      setHistory([{ url: newUrl, isBlob: true }])
      setHistoryIndex(0)
      setShowCropTool(false)
      setIsPreviewing(false)
      setPreviewImage(null)
      
      // Reset dimensions
      const img = new window.Image()
      img.onload = () => {
        setAspect(img.width / img.height)
        setOriginalDimensions({ width: img.width, height: img.height })
        setResizeW(img.width.toString())
        setResizeH(img.height.toString())
      }
      img.src = newUrl
      
      toast.info('Reset to original')
    }
  }
  
  const handleUpload = async () => {
    // For editing mode without new file
    if (isEditing && !file && initialData) {
      onUpload({
        ...initialData,
        alt: altText,
        caption: caption,
        title: imageTitle,
        alignment: imageAlignment,
        width: imageWidth,
        link: imageLink,
      })
      toast.success('Image updated successfully!')
      onClose()
      return
    }
    
    if (!file && !currentImageUrl) {
      toast.error('No image to upload')
      return
    }
    
    setUploading(true)
    const toastId = toast.loading('Processing image...')
    
    try {
      let fileToUpload = file
      
      if (historyIndex > 0 && currentImageUrl && currentImageUrl.startsWith('blob:')) {
        const response = await fetch(currentImageUrl)
        const blob = await response.blob()
        const originalName = file?.name || 'edited-image.jpg'
        const extension = originalName.split('.').pop() || 'jpg'
        fileToUpload = new File([blob], `edited-image.${extension}`, { type: blob.type || 'image/jpeg' })
      }
      
      if (!fileToUpload) {
        throw new Error('No file to upload')
      }
      
      // Simulate upload - replace with your actual upload logic
      const reader = new FileReader()
      const imageUrl = await new Promise((resolve) => {
        reader.onload = (e) => resolve(e.target.result)
        reader.readAsDataURL(fileToUpload)
      })
      
      toast.dismiss(toastId)
      toast.success(isEditing ? 'Image updated!' : 'Image ready!')
      
      // Pass all image metadata
      onUpload({
        src: imageUrl,
        alt: altText,
        caption: caption,
        title: imageTitle,
        alignment: imageAlignment,
        width: imageWidth,
        link: imageLink,
        originalWidth: originalDimensions.width,
        originalHeight: originalDimensions.height,
      })
      
      if (currentImageUrl && currentImageUrl.startsWith('blob:')) {
        cleanupObjectUrl(currentImageUrl)
      }
      onClose()
      
    } catch (error) {
      toast.dismiss(toastId)
      console.error('Upload error:', error)
      toast.error(error.message || 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }
  
  // Auto-preview on dimension change
  useEffect(() => {
    if (lockAspect && resizeW && !resizeH && aspect) {
      const w = parseInt(resizeW)
      if (!isNaN(w) && w > 0) {
        const newH = Math.round(w / aspect)
        setResizeH(newH.toString())
        if (isPreviewing && !isProcessing) {
          previewResize(w, newH)
        }
      }
    }
    if (lockAspect && resizeH && !resizeW && aspect) {
      const h = parseInt(resizeH)
      if (!isNaN(h) && h > 0) {
        const newW = Math.round(h * aspect)
        setResizeW(newW.toString())
        if (isPreviewing && !isProcessing) {
          previewResize(newW, h)
        }
      }
    }
  }, [resizeW, resizeH, lockAspect, aspect, isPreviewing, isProcessing, previewResize])
  
  if (!isOpen) return null
  
  const hasHistory = history.length > 0
  const canUndo = historyIndex > 0
  const canRedo = historyIndex < history.length - 1
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <input 
          ref={inputRef} 
          type="file" 
          accept="image/jpeg,image/png,image/webp,image/gif,image/jpg" 
          onChange={handleFileSelect} 
          className="hidden" 
        />
        
        {/* Header */}
        <div className="flex-shrink-0 px-5 py-4 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                <ImageIcon className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  {isEditing ? 'Edit Image' : 'Add Image'}
                </h2>
                <p className="text-[11px] text-gray-500">Crop, resize, and add metadata</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {currentImageUrl && (
                <>
                  <button 
                    onClick={reset} 
                    className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/50 transition-colors" 
                    title="Reset to original"
                  >
                    <RefreshCw size={14} className="text-gray-600" />
                  </button>
                  <button 
                    onClick={undo} 
                    disabled={!canUndo} 
                    className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/50 disabled:opacity-30 transition-colors" 
                    title="Undo"
                  >
                    <RotateCw size={14} className="text-gray-600" />
                  </button>
                  <button 
                    onClick={redo} 
                    disabled={!canRedo} 
                    className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/50 disabled:opacity-30 transition-colors" 
                    title="Redo"
                  >
                    <RotateCw size={14} className="text-gray-600 transform scale-x-[-1]" />
                  </button>
                </>
              )}
              <button 
                onClick={onClose} 
                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/50 transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
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
              <p className="text-sm font-medium text-gray-700">Choose image file</p>
              <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP, GIF • 10MB max</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* File info or existing image indicator */}
              {file ? (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center">
                    <ImageIcon className="w-5 h-5 text-purple-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                    <p className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    {originalDimensions.width > 0 && (
                      <p className="text-xs text-gray-400">{originalDimensions.width}×{originalDimensions.height}px</p>
                    )}
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
                    <ImageIcon className="w-5 h-5 text-purple-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Existing Image</p>
                    <p className="text-xs text-gray-500">{imageTitle || initialData?.title || 'Image'}</p>
                    {originalDimensions.width > 0 && (
                      <p className="text-xs text-gray-500">{originalDimensions.width}×{originalDimensions.height}px</p>
                    )}
                  </div>
                  <button 
                    onClick={handleChangeFile} 
                    className="text-xs text-purple-500 hover:text-purple-600 transition-colors"
                  >
                    Replace
                  </button>
                </div>
              )}
              
              {/* SEO Section */}
              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                <div className="flex items-center gap-2 mb-3">
                  <Type className="w-4 h-4 text-purple-600" />
                  <h3 className="text-sm font-semibold text-gray-900">Image Settings & SEO</h3>
                </div>
                
                {/* Title */}
                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Title <span className="text-gray-400 ml-1">(For SEO)</span>
                  </label>
                  <input
                    type="text"
                    value={imageTitle}
                    onChange={(e) => setImageTitle(e.target.value)}
                    placeholder="Image title..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                {/* ALT Text */}
                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    ALT Text <span className="text-red-500">*</span>
                    <span className="text-gray-400 ml-1">(Required for accessibility)</span>
                  </label>
                  <input
                    type="text"
                    value={altText}
                    onChange={(e) => setAltText(e.target.value)}
                    placeholder="Describe what's in the image..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1">Helps search engines and screen readers</p>
                </div>
                
                {/* Caption */}
                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Caption (Optional)</label>
                  <input
                    type="text"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Image caption displayed below..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                {/* Link */}
                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    <span className="flex items-center gap-1"><Link2 size={12} /> Link URL (Optional)</span>
                  </label>
                  <input
                    type="url"
                    value={imageLink}
                    onChange={(e) => setImageLink(e.target.value)}
                    placeholder="https://..."
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
                        onClick={() => setImageAlignment(align.value)}
                        className={`flex-1 py-2 rounded-lg border flex items-center justify-center gap-2 transition ${
                          imageAlignment === align.value 
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
                  <div className="grid grid-cols-6 gap-1">
                    {['25%', '33%', '50%', '66%', '75%', '100%'].map(size => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setImageWidth(size)}
                        className={`py-2 rounded-lg border text-xs transition ${
                          imageWidth === size 
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
              
              {/* Image editor - only show for new uploads, not for existing images in edit mode */}
              {currentImageUrl && file && (
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Image preview area */}
                  <div className="flex-1">
                    <div className="bg-gray-50 rounded-xl p-3 flex items-center justify-center min-h-[250px]">
                      {isProcessing && !showCropTool ? (
                        <div className="flex flex-col items-center gap-2">
                          <svg className="animate-spin w-8 h-8 text-purple-500" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          <span className="text-sm text-gray-500">Processing...</span>
                        </div>
                      ) : showCropTool ? (
                        <div className="relative max-h-[250px] overflow-auto">
                          <img 
                            src={currentImageUrl} 
                            onLoad={onImageLoad} 
                            style={{ maxHeight: '250px', maxWidth: '100%', objectFit: 'contain' }} 
                            alt="Edit" 
                          />
                        </div>
                      ) : (
                        <img 
                          src={isPreviewing ? previewImage : currentImageUrl} 
                          style={{ maxHeight: '250px', maxWidth: '100%', objectFit: 'contain' }} 
                          alt="Preview" 
                        />
                      )}
                    </div>
                    {isPreviewing && !showCropTool && (
                      <div className="mt-2 p-2 bg-purple-50 rounded-lg border border-purple-200">
                        <p className="text-xs text-purple-800 text-center">Preview: {resizeW} × {resizeH} px</p>
                        <p className="text-[10px] text-purple-600 text-center mt-1">Click "Apply Resize" to make permanent</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Controls panel */}
                  <div className="w-full md:w-64">
                    {!showCropTool ? (
                      <>
                        {/* Resize controls */}
                        <div className="mb-3">
                          <div className="flex gap-2 mb-2">
                            <div className="flex-1">
                              <label className="text-xs text-gray-500 block mb-1">Width (px)</label>
                              <input 
                                type="number" 
                                value={resizeW} 
                                onChange={e => { 
                                  setResizeW(e.target.value)
                                  if (e.target.value && resizeH && !isProcessing) {
                                    previewResize(parseInt(e.target.value), parseInt(resizeH))
                                  }
                                }} 
                                placeholder="Width" 
                                className="w-full px-2 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" 
                                min="1"
                                max="4000"
                              />
                            </div>
                            <div className="flex-1">
                              <label className="text-xs text-gray-500 block mb-1">Height (px)</label>
                              <input 
                                type="number" 
                                value={resizeH} 
                                onChange={e => { 
                                  setResizeH(e.target.value)
                                  if (resizeW && e.target.value && !isProcessing) {
                                    previewResize(parseInt(resizeW), parseInt(e.target.value))
                                  }
                                }} 
                                placeholder="Height" 
                                className="w-full px-2 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" 
                                min="1"
                                max="4000"
                              />
                            </div>
                            <button 
                              onClick={() => setLockAspect(!lockAspect)} 
                              className="mt-5 px-2 py-1.5 border rounded-lg hover:bg-gray-50 transition"
                              title={lockAspect ? "Aspect locked" : "Aspect unlocked"}
                            >
                              {lockAspect ? <Lock size={14} /> : <Unlock size={14} />}
                            </button>
                          </div>
                          
                          {/* Size presets */}
                          <div className="grid grid-cols-3 gap-1 mb-3">
                            {[
                              { name: 'Small', w: 400 },
                              { name: 'Medium', w: 800 },
                              { name: 'Large', w: 1200 }
                            ].map(preset => (
                              <button 
                                key={preset.name} 
                                onClick={() => { 
                                  const h = lockAspect ? Math.round(preset.w / aspect) : parseInt(resizeH) || 400
                                  setResizeW(preset.w.toString())
                                  setResizeH(h.toString())
                                  previewResize(preset.w, h)
                                }} 
                                className="py-1.5 text-xs bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                              >
                                {preset.name}<br/>
                                <span className="text-[10px] text-gray-500">{preset.w}px</span>
                              </button>
                            ))}
                          </div>
                          
                          {/* Action buttons */}
                          <div className="flex gap-2 mb-2">
                            {isPreviewing && (
                              <button 
                                onClick={cancelPreview} 
                                className="flex-1 py-1.5 bg-gray-500 text-white rounded-lg text-sm hover:bg-gray-600 transition"
                              >
                                Cancel
                              </button>
                            )}
                            <button 
                              onClick={applyResize} 
                              disabled={isProcessing}
                              className={`${isPreviewing ? 'flex-1' : 'w-full'} py-1.5 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                              {isProcessing ? 'Processing...' : 'Apply Resize'}
                            </button>
                          </div>
                        </div>
                        
                        {/* Crop button */}
                        <button 
                          onClick={startCropping} 
                          disabled={isProcessing}
                          className="w-full py-1.5 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Crop size={14} /> Crop Image
                        </button>
                      </>
                    ) : (
                      <div className="space-y-3">
                        <div className="text-xs text-gray-500 text-center p-3 bg-gray-50 rounded-lg">
                          Drag to select crop area
                        </div>
                        <button 
                          onClick={cancelCropping} 
                          className="w-full py-2 bg-gray-500 text-white rounded-lg text-sm hover:bg-gray-600 transition"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={getCroppedImg} 
                          disabled={isProcessing}
                          className="w-full py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isProcessing ? 'Processing...' : 'Apply Crop'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Existing image preview in edit mode */}
              {isEditing && currentImageUrl && !file && (
                <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-center">
                  <img 
                    src={currentImageUrl} 
                    alt={altText || 'Preview'} 
                    style={{ maxHeight: '200px', maxWidth: '100%', objectFit: 'contain' }}
                    className="rounded-lg"
                  />
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Footer */}
        {(file || isEditing) && (
          <div className="flex-shrink-0 px-5 py-4 bg-gray-50 border-t border-gray-100 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={uploading || isProcessing}
              className="flex-1 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </>
              ) : (
                isEditing ? 'Update Image' : 'Insert Image'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default React.memo(ImageModal)