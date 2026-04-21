// src/components/editor/EmbedComponent.jsx - SIMPLIFIED FOR MEDIACONTROLS
import React, { useState, useEffect } from 'react'
import { NodeViewWrapper } from '@tiptap/react'
import { 
  Youtube, Twitter, Instagram, Video, Code
} from 'lucide-react'

const EmbedComponent = ({ node }) => {
  const [currentAlignment, setCurrentAlignment] = useState(node.attrs.alignment || 'center')
  const [currentWidth, setCurrentWidth] = useState(node.attrs.width || '100%')
  const platform = node.attrs.platform

  // Update local state when node attributes change (from MediaControls)
  useEffect(() => {
    setCurrentAlignment(node.attrs.alignment || 'center')
    setCurrentWidth(node.attrs.width || '100%')
  }, [node.attrs.alignment, node.attrs.width])

  const getPlatformIcon = () => {
    switch(platform) {
      case 'youtube': return <Youtube size={14} className="text-red-500" />
      case 'twitter': return <Twitter size={14} className="text-blue-400" />
      case 'instagram': return <Instagram size={14} className="text-pink-500" />
      case 'vimeo': return <Video size={14} className="text-blue-500" />
      default: return <Code size={14} className="text-gray-500" />
    }
  }

  const getAlignmentStyle = () => {
    const baseStyle = { 
      maxWidth: currentWidth, 
      width: currentWidth,
      transition: 'all 0.2s ease'
    }
    
    switch(currentAlignment) {
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

  return (
    <NodeViewWrapper 
      className="embed-node-wrapper"
      style={getAlignmentStyle()}
    >
      <div className="relative group rounded-xl overflow-hidden" style={{ width: '100%' }}>
        {/* Platform Badge - shows on hover */}
        {platform && (
          <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-1 px-2 py-1 bg-black/70 backdrop-blur-sm rounded-lg text-white text-xs">
              {getPlatformIcon()}
              <span className="capitalize">{platform}</span>
            </div>
          </div>
        )}
        
        {/* Embed Content */}
        <div 
          className="embed-content"
          dangerouslySetInnerHTML={{ __html: node.attrs.html || '' }}
        />
        
        {/* Caption Display */}
        {node.attrs.caption && (
          <div className="mt-2 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 italic">{node.attrs.caption}</p>
          </div>
        )}
      </div>
    </NodeViewWrapper>
  )
}

export default EmbedComponent