// src/components/shared/PreviewModal.jsx
import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, Smartphone, Tablet, Monitor, Maximize2, Minimize2, 
  RefreshCw, Eye, Calendar, User, Clock, Tag, FolderOpen, Heart, Share2, Bookmark 
} from 'lucide-react'

const PreviewModal = ({ isOpen, onClose, content, title, featuredImage, category, tags, readingTime, publishedDate }) => {
  const [device, setDevice] = useState('desktop')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  
  const deviceConfig = {
    mobile: { width: 375, icon: Smartphone, label: 'Mobile', bgColor: 'bg-gray-100' },
    tablet: { width: 768, icon: Tablet, label: 'Tablet', bgColor: 'bg-gray-100' },
    desktop: { width: '100%', icon: Monitor, label: 'Desktop', bgColor: 'bg-gray-100' },
  }
  
  const currentDevice = deviceConfig[device]
  const DeviceIcon = currentDevice.icon
  
  // Format date
  const formatDate = (date) => {
    if (!date) return new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }
  
  const toggleFullscreen = () => {
    const element = document.getElementById('preview-modal-content')
    if (!isFullscreen) {
      if (element.requestFullscreen) {
        element.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
    setIsFullscreen(!isFullscreen)
  }
  
  const refreshPreview = () => {
    setRefreshKey(prev => prev + 1)
  }
  
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])
  
  // Share functionality
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `Check out this article: ${title}`,
          url: window.location.href,
        })
      } catch (err) {
        console.log('Error sharing:', err)
      }
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }
  
  if (!isOpen) return null
  
  // Article content with proper styling
  const ArticleContent = () => (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Category Tag */}
      {category && (
        <div className="mb-4">
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-semibold rounded-full">
            <FolderOpen className="w-3 h-3" />
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </span>
        </div>
      )}
      
      {/* Title */}
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
        {title || 'Untitled Post'}
      </h1>
      
      {/* Meta Info */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-8 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-1.5">
          <User className="w-4 h-4" />
          <span>Admin</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar className="w-4 h-4" />
          <span>{formatDate(publishedDate)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-4 h-4" />
          <span>{readingTime || 5} min read</span>
        </div>
      </div>
      
      {/* Featured Image */}
      {featuredImage && (
        <div className="mb-8 rounded-xl overflow-hidden shadow-lg">
          <img 
            src={featuredImage} 
            alt={title || 'Featured image'} 
            className="w-full h-auto object-cover"
          />
        </div>
      )}
      
      {/* Tags */}
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {tags.map((tag, index) => (
            <span key={index} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded-lg">
              <Tag className="w-3 h-3" />
              {tag}
            </span>
          ))}
        </div>
      )}
      
      {/* Main Content */}
      <div 
        className="prose prose-lg prose-purple max-w-none
                   prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white
                   prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl
                   prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed
                   prose-a:text-purple-600 dark:prose-a:text-purple-400 prose-a:no-underline hover:prose-a:underline
                   prose-strong:text-gray-900 dark:prose-strong:text-white prose-strong:font-semibold
                   prose-img:rounded-lg prose-img:shadow-md prose-img:mx-auto
                   prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
                   prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-xl
                   prose-blockquote:border-l-4 prose-blockquote:border-purple-500 prose-blockquote:pl-4 prose-blockquote:italic
                   prose-ul:list-disc prose-ul:pl-6
                   prose-ol:list-decimal prose-ol:pl-6
                   prose-li:text-gray-700 dark:prose-li:text-gray-300
                   prose-table:border-collapse prose-table:w-full
                   prose-th:border prose-th:border-gray-300 dark:prose-th:border-gray-700 prose-th:p-2 prose-th:bg-gray-100 dark:prose-th:bg-gray-800
                   prose-td:border prose-td:border-gray-300 dark:prose-td:border-gray-700 prose-td:p-2
                   prose-hr:border-gray-200 dark:prose-hr:border-gray-700
                   [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg
                   [&_iframe]:w-full [&_iframe]:aspect-video [&_iframe]:rounded-lg [&_iframe]:shadow-md
                   [&_video]:w-full [&_video]:rounded-lg
                   [&_.image-left]:float-left [&_.image-left]:mr-6 [&_.image-left]:mb-4
                   [&_.image-right]:float-right [&_.image-right]:ml-6 [&_.image-right]:mb-4
                   [&_.image-center]:mx-auto [&_.image-center]:block
                   [&_.gallery]:grid [&_.gallery]:grid-cols-3 [&_.gallery]:gap-4 [&_.gallery]:my-8
                   [&_.gallery-item]:rounded-lg [&_.gallery-item]:overflow-hidden [&_.gallery-item]:shadow-md
                   [&_.gallery-item_img]:w-full [&_.gallery-item_img]:h-48 [&_.gallery-item_img]:object-cover
                   [&_.table-container]:overflow-x-auto [&_.table-container]:my-6
                   [&_pre]:overflow-x-auto [&_pre]:p-4 [&_pre]:rounded-xl [&_pre]:bg-gray-900
                   [&_code]:font-mono [&_code]:text-sm"
        dangerouslySetInnerHTML={{ 
          __html: content || '<p class="text-gray-400 text-center py-12">No content to preview</p>' 
        }} 
      />
      
      {/* Social Interaction Bar */}
      <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsLiked(!isLiked)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600 dark:text-gray-400'}`} />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {isLiked ? 'Liked' : 'Like'}
              </span>
            </button>
            
            <button 
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <Share2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Share</span>
            </button>
            
            <button 
              onClick={() => setIsBookmarked(!isBookmarked)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-purple-500 text-purple-500' : 'text-gray-600 dark:text-gray-400'}`} />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {isBookmarked ? 'Saved' : 'Save'}
              </span>
            </button>
          </div>
          
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {Math.ceil((content?.replace(/<[^>]*>/g, '').split(/\s+/).filter(w => w.length > 0).length || 0) / 200)} min read
          </div>
        </div>
      </div>
    </article>
  )
  
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div
            id="preview-modal-content"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-6xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-white" />
                  <h2 className="text-xl font-bold text-white">Live Preview</h2>
                  <span className="ml-2 px-2 py-0.5 bg-white/20 text-white text-xs rounded-full">
                    How readers will see it
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  {Object.entries(deviceConfig).map(([key, config]) => {
                    const Icon = config.icon
                    return (
                      <button
                        key={key}
                        onClick={() => setDevice(key)}
                        className={`
                          p-2 rounded-lg transition-all duration-200
                          ${device === key 
                            ? 'bg-white/20 text-white shadow-lg' 
                            : 'text-white/70 hover:bg-white/10 hover:text-white'
                          }
                        `}
                        title={config.label}
                      >
                        <Icon className="w-4 h-4" />
                      </button>
                    )
                  })}
                  
                  <div className="w-px h-6 bg-white/30 mx-1" />
                  
                  <button
                    onClick={refreshPreview}
                    className="p-2 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-all duration-200"
                    title="Refresh Preview"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={toggleFullscreen}
                    className="p-2 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-all duration-200"
                    title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                  >
                    {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </button>
                  
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-all duration-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Preview Content */}
            <div className={`${currentDevice.bgColor} transition-all duration-300 overflow-auto max-h-[80vh]`}>
              <div 
                className="mx-auto transition-all duration-300 bg-white dark:bg-gray-900"
                style={{ 
                  width: currentDevice.width,
                  maxWidth: '100%'
                }}
              >
                {device === 'mobile' && (
                  <div className="bg-black rounded-3xl overflow-hidden shadow-2xl mx-auto" style={{ maxWidth: 375 }}>
                    {/* Mobile Status Bar */}
                    <div className="bg-black text-white px-4 py-2 text-xs flex justify-between items-center">
                      <span className="font-semibold">9:41</span>
                      <div className="flex gap-1">
                        <span>📶</span>
                        <span>🔋 100%</span>
                      </div>
                    </div>
                    
                    {/* Mobile Content */}
                    <div className="bg-white dark:bg-gray-900 min-h-[600px] overflow-y-auto" style={{ maxHeight: '70vh' }}>
                      <ArticleContent />
                    </div>
                    
                    {/* Mobile Home Indicator */}
                    <div className="bg-black h-1 w-32 mx-auto rounded-full my-2"></div>
                  </div>
                )}
                
                {device === 'tablet' && (
                  <div className="bg-gray-800 rounded-2xl overflow-hidden shadow-2xl p-2 mx-auto" style={{ maxWidth: 768 }}>
                    <div className="bg-white dark:bg-gray-900 rounded-xl min-h-[600px] overflow-y-auto" style={{ maxHeight: '70vh' }}>
                      <ArticleContent />
                    </div>
                  </div>
                )}
                
                {device === 'desktop' && (
                  <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl">
                    {/* Browser Chrome */}
                    <div className="sticky top-0 z-10 border-b border-gray-200 dark:border-gray-700 px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-t-xl flex items-center gap-2">
                      <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      </div>
                      <div className="flex-1 mx-4">
                        <div className="bg-white dark:bg-gray-900 rounded-lg px-3 py-1 text-sm text-gray-500 text-center truncate">
                          trendlin.com/blog/{title?.toLowerCase().replace(/\s+/g, '-') || 'preview'}
                        </div>
                      </div>
                    </div>
                    
                    {/* Desktop Content */}
                    <div className="overflow-y-auto" style={{ maxHeight: '70vh' }}>
                      <ArticleContent />
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  <span className="font-medium">Preview Mode</span> - This is exactly how your post will appear when published
                </div>
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold
                           hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default React.memo(PreviewModal)