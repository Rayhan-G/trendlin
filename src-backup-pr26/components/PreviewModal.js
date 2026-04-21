import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Smartphone, Tablet, Monitor, Maximize2, Minimize2, RefreshCw } from 'lucide-react'

const PreviewModal = ({ isOpen, onClose, content, title }) => {
  const [device, setDevice] = useState('mobile')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  
  const deviceConfig = {
    mobile: { width: 375, icon: Smartphone, label: 'Mobile', bgColor: 'bg-gray-900' },
    tablet: { width: 768, icon: Tablet, label: 'Tablet', bgColor: 'bg-gray-800' },
    desktop: { width: '100%', icon: Monitor, label: 'Desktop', bgColor: 'bg-white' },
  }
  
  const currentDevice = deviceConfig[device]
  const DeviceIcon = currentDevice.icon
  
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
  
  if (!isOpen) return null
  
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
            {/* Header with Gradient */}
            <div className="gradient-primary px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Live Preview</h2>
                
                <div className="flex items-center gap-2">
                  {/* Device Toggle */}
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
            
            {/* Device Frame */}
            <div className={`p-6 ${currentDevice.bgColor} transition-all duration-300 overflow-auto max-h-[80vh]`}>
              <div 
                className="mx-auto transition-all duration-300"
                style={{ width: currentDevice.width }}
              >
                {/* Mobile Frame */}
                {device === 'mobile' && (
                  <div className="bg-black rounded-3xl overflow-hidden shadow-2xl">
                    <div className="bg-gray-900 text-white px-4 py-2 text-xs flex justify-between items-center">
                      <span className="font-semibold">9:41</span>
                      <div className="flex gap-1">
                        <span>📶</span>
                        <span>🔋 100%</span>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-900 min-h-[600px]">
                      <div className="p-6">
                        {title && (
                          <h1 className="text-3xl font-bold mb-6 gradient-primary bg-clip-text text-transparent">
                            {title}
                          </h1>
                        )}
                        <div 
                          className="prose prose-lg dark:prose-invert max-w-none"
                          dangerouslySetInnerHTML={{ __html: content || '<p class="text-gray-400 text-center py-12">No content to preview</p>' }}
                        />
                      </div>
                    </div>
                    <div className="bg-gray-900 h-1 w-32 mx-auto rounded-full my-2"></div>
                  </div>
                )}
                
                {/* Tablet Frame */}
                {device === 'tablet' && (
                  <div className="bg-gray-800 rounded-2xl overflow-hidden shadow-2xl p-2">
                    <div className="bg-white dark:bg-gray-900 rounded-xl min-h-[600px]">
                      <div className="p-8">
                        {title && (
                          <h1 className="text-4xl font-bold mb-6 gradient-primary bg-clip-text text-transparent">
                            {title}
                          </h1>
                        )}
                        <div 
                          className="prose prose-lg dark:prose-invert max-w-none"
                          dangerouslySetInnerHTML={{ __html: content || '<p class="text-gray-400 text-center py-12">No content to preview</p>' }}
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Desktop View */}
                {device === 'desktop' && (
                  <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl">
                    <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-3 bg-gray-50 dark:bg-gray-800 rounded-t-xl flex items-center gap-2">
                      <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      </div>
                      <div className="flex-1 text-center text-sm text-gray-500">preview.trendlin.com</div>
                    </div>
                    <div className="p-8">
                      {title && (
                        <h1 className="text-5xl font-bold mb-8 gradient-primary bg-clip-text text-transparent">
                          {title}
                        </h1>
                      )}
                      <div 
                        className="prose prose-lg dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: content || '<p class="text-gray-400 text-center py-12">No content to preview</p>' }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <button
                onClick={onClose}
                className="w-full px-6 py-2 gradient-primary text-white rounded-xl font-semibold
                         hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg"
              >
                Close Preview
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default React.memo(PreviewModal)