// src/components/media/Modals/EmbedModal.jsx - ENHANCED FOR MEDIACONTROLS INTEGRATION
import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'

// Simple icon components
const XIcon = () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>)
const LinkIcon = () => (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.102m3.172-3.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.102" /></svg>)
const CodeIcon = () => (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>)
const EyeIcon = () => (<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>)
const CopyIcon = () => (<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>)
const CheckIcon = () => (<svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>)
const RefreshIcon = () => (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>)
const ExternalLinkIcon = () => (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>)
const AlignLeftIcon = () => (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10M4 18h16" /></svg>)
const AlignCenterIcon = () => (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M8 12h8M4 18h16" /></svg>)
const AlignRightIcon = () => (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M14 12h6M4 18h16" /></svg>)
const MoveIcon = () => (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" /></svg>)
const TypeIcon = () => (<svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>)
const MonitorIcon = () => (<svg className="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>)
const ChevronDownIcon = () => (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>)
const ChevronUpIcon = () => (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>)
const SparklesIcon = () => (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>)

const EmbedModal = ({ isOpen, onClose, onUpload, initialData = null }) => {
  const [embedUrl, setEmbedUrl] = useState('')
  const [embedCode, setEmbedCode] = useState('')
  const [embedType, setEmbedType] = useState('url')
  
  // Size options
  const [sizePreset, setSizePreset] = useState('responsive')
  const [customWidth, setCustomWidth] = useState('560')
  const [customHeight, setCustomHeight] = useState('315')
  const [aspectRatio, setAspectRatio] = useState('16/9')
  
  const [autoplay, setAutoplay] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [detectedPlatform, setDetectedPlatform] = useState(null)
  
  // SEO & Alignment state
  const [embedTitle, setEmbedTitle] = useState('')
  const [embedCaption, setEmbedCaption] = useState('')
  const [embedAlignment, setEmbedAlignment] = useState('center')
  const [embedWidth, setEmbedWidth] = useState('100%')
  const [copied, setCopied] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  
  const urlInputRef = useRef(null)
  
  // Size presets
  const sizePresets = {
    responsive: { label: 'Responsive', width: '100%', height: 'auto', icon: <MonitorIcon /> },
    small: { label: 'Small', width: '400', height: '225', icon: null },
    medium: { label: 'Medium', width: '560', height: '315', icon: null },
    large: { label: 'Large', width: '800', height: '450', icon: null },
    custom: { label: 'Custom', width: customWidth, height: customHeight, icon: null }
  }
  
  const aspectRatios = {
    '16/9': { label: '16:9 (YouTube)', padding: '56.25%' },
    '4/3': { label: '4:3 (Standard)', padding: '75%' },
    '1/1': { label: '1:1 (Square)', padding: '100%' },
    '21/9': { label: '21:9 (Ultrawide)', padding: '42.86%' }
  }
  
  // Initialize with existing data if editing
  useEffect(() => {
    if (initialData) {
      setIsEditing(true)
      setEmbedTitle(initialData.title || '')
      setEmbedCaption(initialData.caption || '')
      setEmbedAlignment(initialData.alignment || 'center')
      setEmbedWidth(initialData.width || '100%')
      
      // Try to extract URL or code from existing embed
      if (initialData.src) {
        setEmbedUrl(initialData.src)
        setEmbedType('url')
        setDetectedPlatform(detectPlatform(initialData.src))
      } else if (initialData.html) {
        setEmbedCode(initialData.html)
        setEmbedType('code')
      }
      
      if (initialData.platform) {
        setDetectedPlatform(initialData.platform)
      }
    } else {
      setIsEditing(false)
    }
  }, [initialData])
  
  useEffect(() => {
    if (isOpen && embedType === 'url' && urlInputRef.current) {
      setTimeout(() => urlInputRef.current?.focus(), 100)
    }
  }, [isOpen, embedType])
  
  const detectPlatform = (url) => {
    if (!url) return null
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YouTube'
    if (url.includes('vimeo.com')) return 'Vimeo'
    if (url.includes('twitter.com') || url.includes('x.com')) return 'Twitter'
    if (url.includes('instagram.com')) return 'Instagram'
    if (url.includes('spotify.com')) return 'Spotify'
    if (url.includes('soundcloud.com')) return 'SoundCloud'
    if (url.includes('tiktok.com')) return 'TikTok'
    if (url.includes('facebook.com')) return 'Facebook'
    return 'Link'
  }
  
  const getEmbedUrl = (url) => {
    if (!url) return ''
    
    // YouTube
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0]
      return `https://www.youtube.com/embed/${videoId}`
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0]
      return `https://www.youtube.com/embed/${videoId}`
    }
    
    // Vimeo
    if (url.includes('vimeo.com/')) {
      const videoId = url.split('vimeo.com/')[1]?.split('?')[0]
      return `https://player.vimeo.com/video/${videoId}`
    }
    
    // Spotify
    if (url.includes('spotify.com/track/')) {
      const trackId = url.split('/track/')[1]?.split('?')[0]
      return `https://open.spotify.com/embed/track/${trackId}`
    }
    
    // Twitter/X
    if (url.includes('twitter.com/') || url.includes('x.com/')) {
      return url // Twitter/X embed will be handled via embed code
    }
    
    return url
  }
  
  const generateEmbedHtml = () => {
    if (embedType === 'code') return embedCode
    if (!embedUrl) return ''
    
    const embedSrc = getEmbedUrl(embedUrl)
    const isResponsive = sizePreset === 'responsive'
    
    // For Twitter/X, generate proper embed
    if (detectedPlatform === 'Twitter' && embedUrl) {
      return `<blockquote class="twitter-tweet"><a href="${embedUrl}"></a></blockquote><script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>`
    }
    
    if (isResponsive) {
      const padding = aspectRatios[aspectRatio]?.padding || '56.25%'
      return `<div style="position: relative; padding-bottom: ${padding}; height: 0; overflow: hidden; border-radius: 12px;">
        <iframe 
          style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" 
          src="${embedSrc}" 
          frameborder="0" 
          allowfullscreen
          ${autoplay ? 'allow="autoplay"' : ''}
        ></iframe>
      </div>`
    }
    
    const finalWidth = sizePreset === 'custom' ? customWidth : sizePresets[sizePreset]?.width || '560'
    const finalHeight = sizePreset === 'custom' ? customHeight : sizePresets[sizePreset]?.height || '315'
    
    return `<iframe 
      src="${embedSrc}" 
      width="${finalWidth}" 
      height="${finalHeight}" 
      frameborder="0" 
      allowfullscreen
      ${autoplay ? 'allow="autoplay"' : ''}
      style="border-radius: 12px;"
    ></iframe>`
  }
  
  const handleEmbed = () => {
    if (embedType === 'url' && !embedUrl) {
      toast.error('Please enter a URL')
      return
    }
    if (embedType === 'code' && !embedCode) {
      toast.error('Please enter embed code')
      return
    }
    
    const embedHtml = generateEmbedHtml()
    if (!embedHtml) {
      toast.error('Unable to generate embed code')
      return
    }
    
    onUpload({
      html: embedHtml,
      type: embedType,
      platform: detectPlatform(embedUrl) || initialData?.platform,
      title: embedTitle,
      caption: embedCaption,
      alignment: embedAlignment,
      width: embedWidth,
      src: embedUrl || initialData?.src,
    })
    
    toast.success(isEditing 
      ? `✓ Embed updated successfully!` 
      : `✓ ${detectPlatform(embedUrl) || 'Content'} embedded successfully!`
    )
    
    // Reset form
    resetForm()
    onClose()
  }
  
  const resetForm = () => {
    setEmbedUrl('')
    setEmbedCode('')
    setEmbedTitle('')
    setEmbedCaption('')
    setEmbedAlignment('center')
    setEmbedWidth('100%')
    setSizePreset('responsive')
    setCustomWidth('560')
    setCustomHeight('315')
    setShowPreview(false)
    setShowAdvanced(false)
    setDetectedPlatform(null)
    setIsEditing(false)
  }
  
  const copyToClipboard = async () => {
    const embedHtml = generateEmbedHtml()
    if (!embedHtml) return
    await navigator.clipboard.writeText(embedHtml)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Copied to clipboard!')
  }
  
  const getPlatformColor = () => {
    const platform = detectPlatform(embedUrl) || detectedPlatform
    switch(platform) {
      case 'YouTube': return 'text-red-500'
      case 'Twitter': return 'text-blue-400'
      case 'Instagram': return 'text-pink-500'
      case 'Vimeo': return 'text-blue-500'
      case 'Spotify': return 'text-green-500'
      case 'TikTok': return 'text-gray-800'
      default: return 'text-gray-500'
    }
  }
  
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b bg-gradient-to-r from-purple-50 to-pink-50 flex-shrink-0">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {isEditing ? 'Edit Embed' : 'Embed Content'}
              </h2>
              <p className="text-sm text-gray-500">
                {isEditing ? 'Update your embedded content' : 'Embed videos, social posts, and more'}
              </p>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-white/50 rounded-lg transition-colors">
              <XIcon />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b">
            <button
              onClick={() => setEmbedType('url')}
              className={`pb-2 px-3 text-sm font-medium flex items-center gap-1 transition-colors ${embedType === 'url' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500'}`}
            >
              <LinkIcon /> URL
            </button>
            <button
              onClick={() => setEmbedType('code')}
              className={`pb-2 px-3 text-sm font-medium flex items-center gap-1 transition-colors ${embedType === 'code' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500'}`}
            >
              <CodeIcon /> Embed Code
            </button>
          </div>
          
          {embedType === 'url' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Enter URL</label>
                <div className="relative">
                  <input
                    ref={urlInputRef}
                    type="url"
                    value={embedUrl}
                    onChange={(e) => {
                      setEmbedUrl(e.target.value)
                      setDetectedPlatform(detectPlatform(e.target.value))
                    }}
                    placeholder="https://www.youtube.com/watch?v=... or https://twitter.com/..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                {(embedUrl || detectedPlatform) && (
                  <p className={`text-xs mt-2 flex items-center gap-1 ${getPlatformColor()}`}>
                    ✓ {detectedPlatform || detectPlatform(embedUrl)} detected
                  </p>
                )}
              </div>
              
              {/* Advanced Options Button */}
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center justify-between w-full py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                <span className="flex items-center gap-2"><SparklesIcon /> Advanced Options</span>
                {showAdvanced ? <ChevronUpIcon /> : <ChevronDownIcon />}
              </button>
              
              {/* Advanced Options Panel */}
              {showAdvanced && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4 overflow-hidden">
                  {/* Size Presets */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">SIZE PRESETS</label>
                    <div className="flex flex-wrap gap-2">
                      {['responsive', 'small', 'medium', 'large', 'custom'].map(preset => (
                        <button
                          key={preset}
                          onClick={() => setSizePreset(preset)}
                          className={`px-3 py-1.5 rounded-lg text-xs capitalize transition-all flex items-center gap-1 ${
                            sizePreset === preset 
                              ? 'bg-purple-600 text-white shadow-md' 
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {preset === 'responsive' && <MonitorIcon />}
                          {preset === 'small' && '📱 Small'}
                          {preset === 'medium' && '💻 Medium'}
                          {preset === 'large' && '🖥️ Large'}
                          {preset === 'custom' && '⚙️ Custom'}
                          {preset !== 'responsive' && preset !== 'custom' && ` (${sizePresets[preset]?.width}×${sizePresets[preset]?.height})`}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Aspect Ratio (for responsive) */}
                  {sizePreset === 'responsive' && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">ASPECT RATIO</label>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(aspectRatios).map(([key, ratio]) => (
                          <button
                            key={key}
                            onClick={() => setAspectRatio(key)}
                            className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                              aspectRatio === key 
                                ? 'bg-purple-600 text-white' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {ratio.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Custom Dimensions */}
                  {sizePreset === 'custom' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Width (px)</label>
                        <input
                          type="number"
                          value={customWidth}
                          onChange={(e) => setCustomWidth(e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                          min="100"
                          max="3840"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Height (px)</label>
                        <input
                          type="number"
                          value={customHeight}
                          onChange={(e) => setCustomHeight(e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                          min="100"
                          max="2160"
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Autoplay */}
                  <label className="flex items-center gap-3 cursor-pointer py-2">
                    <input
                      type="checkbox"
                      checked={autoplay}
                      onChange={(e) => setAutoplay(e.target.checked)}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm text-gray-600">🔊 Autoplay (if supported)</span>
                  </label>
                </motion.div>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Embed Code</label>
              <textarea
                value={embedCode}
                onChange={(e) => setEmbedCode(e.target.value)}
                placeholder="<iframe src='https://www.youtube.com/embed/...'></iframe>"
                rows={6}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-xs text-gray-400 mt-2">Paste any iframe, script, or embed code from any platform</p>
            </div>
          )}
          
          {/* SEO & Alignment Section */}
          <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
            <div className="flex items-center gap-2 mb-3">
              <TypeIcon />
              <h3 className="text-sm font-semibold text-gray-900">Embed Settings & SEO</h3>
            </div>
            
            <div className="mb-3">
              <input
                type="text"
                value={embedTitle}
                onChange={(e) => setEmbedTitle(e.target.value)}
                placeholder="Title (optional - for SEO)"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <div className="mb-3">
              <input
                type="text"
                value={embedCaption}
                onChange={(e) => setEmbedCaption(e.target.value)}
                placeholder="Caption (optional)"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <div className="mb-3">
              <label className="block text-xs text-gray-600 mb-2">Alignment</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setEmbedAlignment('left')}
                  className={`flex-1 py-2 rounded-lg border flex items-center justify-center gap-2 transition ${
                    embedAlignment === 'left' 
                      ? 'bg-purple-600 text-white border-purple-600' 
                      : 'bg-white hover:bg-gray-50 border-gray-200'
                  }`}
                >
                  <AlignLeftIcon /> Left
                </button>
                <button
                  onClick={() => setEmbedAlignment('center')}
                  className={`flex-1 py-2 rounded-lg border flex items-center justify-center gap-2 transition ${
                    embedAlignment === 'center' 
                      ? 'bg-purple-600 text-white border-purple-600' 
                      : 'bg-white hover:bg-gray-50 border-gray-200'
                  }`}
                >
                  <AlignCenterIcon /> Center
                </button>
                <button
                  onClick={() => setEmbedAlignment('right')}
                  className={`flex-1 py-2 rounded-lg border flex items-center justify-center gap-2 transition ${
                    embedAlignment === 'right' 
                      ? 'bg-purple-600 text-white border-purple-600' 
                      : 'bg-white hover:bg-gray-50 border-gray-200'
                  }`}
                >
                  <AlignRightIcon /> Right
                </button>
                <button
                  onClick={() => setEmbedAlignment('custom')}
                  className={`flex-1 py-2 rounded-lg border flex items-center justify-center gap-2 transition ${
                    embedAlignment === 'custom' 
                      ? 'bg-purple-600 text-white border-purple-600' 
                      : 'bg-white hover:bg-gray-50 border-gray-200'
                  }`}
                  title="Custom Position (drag to move)"
                >
                  <MoveIcon /> Custom
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-xs text-gray-600 mb-2">Display Width</label>
              <div className="flex gap-2">
                {['25%', '33%', '50%', '66%', '75%', '100%'].map(size => (
                  <button
                    key={size}
                    onClick={() => setEmbedWidth(size)}
                    className={`flex-1 py-2 rounded-lg border text-xs transition ${
                      embedWidth === size 
                        ? 'bg-purple-600 text-white border-purple-600' 
                        : 'bg-white hover:bg-gray-50 border-gray-200'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Preview */}
          {(embedUrl || embedCode) && (
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Preview</span>
                <div className="flex gap-3">
                  <button onClick={() => setShowPreview(!showPreview)} className="text-xs text-gray-500 flex items-center gap-1 hover:text-gray-700">
                    <EyeIcon /> {showPreview ? 'Hide' : 'Show'}
                  </button>
                  <button onClick={copyToClipboard} className="text-xs text-gray-500 flex items-center gap-1 hover:text-gray-700">
                    {copied ? <CheckIcon /> : <CopyIcon />} Copy
                  </button>
                </div>
              </div>
              {showPreview && (
                <div className="bg-gray-50 rounded-xl p-4 border min-h-[200px] overflow-auto">
                  <div dangerouslySetInnerHTML={{ __html: generateEmbedHtml() }} />
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-between flex-shrink-0">
          <button
            onClick={resetForm}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-gray-700"
          >
            <RefreshIcon /> Clear all
          </button>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-5 py-2 border rounded-xl text-gray-600 hover:bg-gray-100 transition">
              Cancel
            </button>
            <button onClick={handleEmbed} className="px-6 py-2 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition flex items-center gap-2">
              <ExternalLinkIcon /> {isEditing ? 'Update Embed' : 'Embed Content'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default EmbedModal