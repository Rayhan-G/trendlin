// src/components/Editor/ImageComponent.jsx - SIMPLIFIED FOR MEDIACONTROLS
import React, { useState } from 'react'
import { NodeViewWrapper } from '@tiptap/react'

const ImageComponent = ({ node }) => {
  const [isHovered, setIsHovered] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  
  const alignment = node.attrs.alignment || 'center'
  const width = node.attrs.width || '100%'
  const caption = node.attrs.caption || ''
  const alt = node.attrs.alt || ''
  const title = node.attrs.title || ''
  const link = node.attrs.link || ''
  
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
  
  const imageElement = (
    <img
      src={node.attrs.src}
      alt={alt || 'Image'}
      title={title}
      className={`rounded-lg shadow-sm transition-all duration-300 w-full ${
        imageLoaded ? 'opacity-100' : 'opacity-0'
      } ${!imageError ? 'cursor-zoom-in' : 'cursor-not-allowed'}`}
      style={{ height: 'auto' }}
      onLoad={() => setImageLoaded(true)}
      onError={() => setImageError(true)}
      loading="lazy"
    />
  )
  
  // Loading placeholder
  if (!imageLoaded && !imageError) {
    return (
      <NodeViewWrapper 
        className="image-wrapper"
        style={getAlignmentStyle()}
      >
        <div className="relative rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" style={{ minHeight: '200px' }}>
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        </div>
      </NodeViewWrapper>
    )
  }
  
  // Error state
  if (imageError) {
    return (
      <NodeViewWrapper 
        className="image-wrapper"
        style={getAlignmentStyle()}
      >
        <div className="relative rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-8 text-center">
          <svg className="w-12 h-12 text-red-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-red-600 dark:text-red-400 font-medium">Failed to load image</p>
          <p className="text-xs text-red-500 dark:text-red-400 mt-1 truncate">{node.attrs.src}</p>
        </div>
      </NodeViewWrapper>
    )
  }
  
  return (
    <NodeViewWrapper 
      className="image-wrapper"
      style={getAlignmentStyle()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative group">
        {/* Selection indicator */}
        {isHovered && (
          <div className="absolute -inset-1 border-2 border-purple-400 rounded-xl pointer-events-none z-10" />
        )}
        
        {/* Image with optional link */}
        {link ? (
          <a 
            href={link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="block"
          >
            {imageElement}
          </a>
        ) : (
          imageElement
        )}
        
        {/* Image dimensions badge (shows on hover) */}
        {isHovered && node.attrs.originalWidth && node.attrs.originalHeight && (
          <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full z-20">
            {node.attrs.originalWidth}×{node.attrs.originalHeight}
          </div>
        )}
        
        {/* ALT text indicator (if missing) */}
        {!alt && isHovered && (
          <div className="absolute top-2 left-2 bg-yellow-500/90 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full z-20">
            ⚠️ Missing ALT
          </div>
        )}
        
        {/* Caption Display */}
        {caption && (
          <div className="mt-2 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 italic">{caption}</p>
          </div>
        )}
        
        {/* Caption placeholder (shows on hover when no caption) */}
        {!caption && isHovered && (
          <div className="mt-2 text-center opacity-0 group-hover:opacity-100 transition-opacity">
            <p className="text-xs text-gray-400 italic">Add caption in MediaControls</p>
          </div>
        )}
      </div>
    </NodeViewWrapper>
  )
}

export default ImageComponent