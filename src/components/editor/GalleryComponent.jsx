// src/components/Editor/GalleryComponent.jsx - SIMPLIFIED FOR MEDIACONTROLS
import React, { useState } from 'react'
import { NodeViewWrapper } from '@tiptap/react'
import { LayoutGrid, Eye, ZoomIn } from 'lucide-react'
import Lightbox from 'yet-another-react-lightbox'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import 'yet-another-react-lightbox/styles.css'

const GalleryComponent = ({ node, editor }) => {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  
  const images = node.content?.content || []
  const layout = node.attrs.layout || 'grid'
  const columns = node.attrs.columns || 3
  const gap = node.attrs.gap || 'medium'
  const imageSize = node.attrs.imageSize || 'medium'
  const caption = node.attrs.caption || ''
  const alignment = node.attrs.alignment || 'center'
  const width = node.attrs.width || '100%'
  
  const getGridCols = () => {
    switch(columns) {
      case 2: return 'grid-cols-2'
      case 3: return 'grid-cols-3'
      case 4: return 'grid-cols-4'
      case 5: return 'grid-cols-5'
      case 6: return 'grid-cols-6'
      default: return 'grid-cols-3'
    }
  }
  
  const getGapSize = () => {
    switch(gap) {
      case 'small': return 'gap-2'
      case 'large': return 'gap-6'
      default: return 'gap-4'
    }
  }
  
  const getImageHeight = () => {
    switch(imageSize) {
      case 'small': return 'h-40'
      case 'large': return 'h-80'
      default: return 'h-56'
    }
  }
  
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
  
  const handleImageClick = (index) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }
  
  const lightboxSlides = images.map(img => ({
    src: img.attrs.src,
    alt: img.attrs.alt,
    title: img.attrs.caption,
    description: img.attrs.caption
  }))
  
  // Empty state
  if (images.length === 0) {
    return (
      <NodeViewWrapper 
        className="gallery-wrapper"
        style={getAlignmentStyle()}
      >
        <div 
          className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center bg-gray-50 dark:bg-gray-800/50"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <LayoutGrid className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">Empty Gallery</p>
          <p className="text-xs text-gray-400 mt-1">Select gallery and use MediaControls to add images</p>
          
          {/* Selection indicator */}
          {isHovered && (
            <div className="absolute inset-0 border-2 border-purple-400 rounded-xl pointer-events-none" />
          )}
        </div>
      </NodeViewWrapper>
    )
  }
  
  return (
    <NodeViewWrapper 
      className="gallery-wrapper"
      style={getAlignmentStyle()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative group">
        {/* Gallery Title (if set) */}
        {node.attrs.title && (
          <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">
            {node.attrs.title}
          </h3>
        )}
        
        {/* Selection indicator */}
        {isHovered && (
          <div className="absolute -inset-1 border-2 border-purple-400 rounded-xl pointer-events-none z-10" />
        )}
        
        {/* Gallery Grid */}
        <div className={`grid ${getGridCols()} ${getGapSize()}`}>
          {images.map((img, idx) => (
            <div 
              key={idx} 
              className="relative group/image rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer"
              onClick={() => handleImageClick(idx)}
            >
              <img
                src={img.attrs.src}
                alt={img.attrs.alt || `Gallery image ${idx + 1}`}
                className={`w-full ${getImageHeight()} object-cover transition-transform duration-300 group-hover/image:scale-105`}
                loading="lazy"
              />
              
              {/* Hover overlay with zoom indicator */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/image:opacity-100 transition-opacity flex items-center justify-center">
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-full">
                  <ZoomIn className="w-5 h-5 text-white" />
                </div>
              </div>
              
              {/* Image counter badge */}
              <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                {idx + 1}/{images.length}
              </div>
              
              {/* Caption overlay on image */}
              {img.attrs.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent text-white text-xs p-2">
                  {img.attrs.caption}
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Gallery Caption */}
        {caption && (
          <div className="mt-3 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 italic">{caption}</p>
          </div>
        )}
        
        {/* Image count badge */}
        <div className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full shadow-md z-20">
          {images.length} {images.length === 1 ? 'image' : 'images'}
        </div>
      </div>
      
      {/* Lightbox with Zoom plugin */}
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={lightboxSlides}
        index={lightboxIndex}
        plugins={[Zoom]}
        zoom={{
          maxZoomPixelRatio: 3,
          zoomInMultiplier: 2,
        }}
        carousel={{
          finite: images.length <= 5,
        }}
        render={{
          buttonPrev: images.length <= 1 ? () => null : undefined,
          buttonNext: images.length <= 1 ? () => null : undefined,
        }}
      />
    </NodeViewWrapper>
  )
}

export default GalleryComponent