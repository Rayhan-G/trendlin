// src/components/editor/VideoComponent.jsx - SIMPLIFIED FOR MEDIACONTROLS
import React, { useState, useRef, useEffect } from 'react'
import { NodeViewWrapper } from '@tiptap/react'
import { Play, Pause, Volume2, VolumeX, Maximize2, Image as ImageIcon } from 'lucide-react'

const VideoComponent = ({ node }) => {
  const [isHovered, setIsHovered] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(node.attrs.muted || false)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  
  const videoRef = useRef(null)

  const alignment = node.attrs.alignment || 'center'
  const width = node.attrs.width || '100%'
  const caption = node.attrs.caption || ''
  const alt = node.attrs.alt || ''
  const title = node.attrs.title || ''
  const poster = node.attrs.poster || null
  const duration = node.attrs.duration || null

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted
    }
  }, [isMuted])

  const getAlignmentStyle = () => {
    const baseStyle = { 
      maxWidth: width, 
      width: width,
      transition: 'all 0.2s ease'
    }
    
    switch(alignment) {
      case 'left':
        return { ...baseStyle, float: 'left', marginRight: '1.5rem', marginBottom: '1rem' }
      case 'right':
        return { ...baseStyle, float: 'right', marginLeft: '1.5rem', marginBottom: '1rem' }
      case 'custom':
        return {
          ...baseStyle,
          position: 'absolute',
          left: node.attrs.customX || 0,
          top: node.attrs.customY || 0,
        }
      default:
        return { ...baseStyle, marginLeft: 'auto', marginRight: 'auto', display: 'block' }
    }
  }

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen()
      }
    }
  }

  const formatDuration = (seconds) => {
    if (!seconds) return null
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <NodeViewWrapper 
      className="video-node-wrapper"
      style={getAlignmentStyle()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative group rounded-xl overflow-hidden bg-black/5">
        {/* Selection indicator */}
        {isHovered && (
          <div className="absolute -inset-0.5 border-2 border-purple-400 rounded-xl pointer-events-none z-10" />
        )}
        
        {/* Loading state */}
        {isLoading && !loadError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg z-20">
            <div className="text-center">
              <svg className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-2" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="text-sm text-gray-500">Loading video...</p>
            </div>
          </div>
        )}
        
        {/* Error state */}
        {loadError && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-50 dark:bg-red-900/20 rounded-lg z-20">
            <div className="text-center p-4">
              <svg className="w-12 h-12 text-red-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-red-600 dark:text-red-400 font-medium">Failed to load video</p>
              <a 
                href={node.attrs.src} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-purple-600 hover:underline mt-2 inline-block"
              >
                Open video directly
              </a>
            </div>
          </div>
        )}
        
        {/* Video Element */}
        <video
          ref={videoRef}
          src={node.attrs.src}
          poster={poster}
          controls={node.attrs.controls !== false}
          loop={node.attrs.loop || false}
          autoPlay={node.attrs.autoplay || false}
          muted={isMuted}
          title={title || alt}
          className="w-full rounded-lg shadow-sm"
          style={{ display: 'block' }}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onLoadedData={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false)
            setLoadError(true)
          }}
        />
        
        {/* Custom Video Controls Overlay (appears on hover when native controls are hidden) */}
        {isHovered && node.attrs.controls === false && !loadError && (
          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-black/70 backdrop-blur-sm rounded-full px-3 py-2 flex items-center gap-2 z-30">
            <button
              onClick={togglePlay}
              className="p-2 rounded-full hover:bg-white/20 text-white transition"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>
            
            <button
              onClick={toggleMute}
              className="p-2 rounded-full hover:bg-white/20 text-white transition"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-full hover:bg-white/20 text-white transition"
              title="Fullscreen"
            >
              <Maximize2 size={18} />
            </button>
          </div>
        )}
        
        {/* Poster/Thumbnail badge */}
        {poster && isHovered && (
          <div className="absolute top-2 right-2 z-20">
            <div className="flex items-center gap-1 px-2 py-1 bg-black/70 backdrop-blur-sm rounded-lg text-white text-xs">
              <ImageIcon size={12} />
              <span>Custom thumbnail</span>
            </div>
          </div>
        )}
        
        {/* Duration badge */}
        {duration && (
          <div className="absolute bottom-2 right-2 z-20 bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded">
            {formatDuration(duration)}
          </div>
        )}
        
        {/* ALT text warning badge */}
        {!alt && isHovered && (
          <div className="absolute top-2 left-2 z-20">
            <div className="flex items-center gap-1 px-2 py-1 bg-yellow-500/90 backdrop-blur-sm rounded-lg text-white text-xs">
              ⚠️ Missing ALT
            </div>
          </div>
        )}
        
        {/* Caption Display */}
        {caption && (
          <div className="mt-2 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 italic">{caption}</p>
          </div>
        )}
        
        {/* Caption placeholder hint */}
        {!caption && isHovered && (
          <div className="mt-2 text-center opacity-0 group-hover:opacity-100 transition-opacity">
            <p className="text-xs text-gray-400 italic">Add caption in MediaControls</p>
          </div>
        )}
        
        {/* Hover hint for MediaControls */}
        {isHovered && (
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/70 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-40 whitespace-nowrap">
            Select to edit in MediaControls
          </div>
        )}
      </div>
    </NodeViewWrapper>
  )
}

export default VideoComponent