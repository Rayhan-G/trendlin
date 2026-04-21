// src/components/editor/AudioComponent.jsx
import React, { useState } from 'react'
import { NodeViewWrapper } from '@tiptap/react'

const AudioComponent = ({ node }) => {
  const [isHovered, setIsHovered] = useState(false)
  
  const { 
    src, 
    title, 
    caption, 
    alignment, 
    width, 
    controls, 
    autoplay, 
    loop, 
    muted 
  } = node.attrs

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

  return (
    <NodeViewWrapper 
      className="audio-node-wrapper"
      style={getAlignmentStyle()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800 p-4">
        {isHovered && (
          <div className="absolute -inset-0.5 border-2 border-purple-400 rounded-xl pointer-events-none z-10" />
        )}
        
        <audio 
          src={src} 
          controls={controls}
          autoPlay={autoplay}
          loop={loop}
          muted={muted}
          title={title}
          className="w-full"
          style={{ borderRadius: '8px' }}
        >
          Your browser does not support the audio element.
        </audio>
        
        {caption && (
          <div className="mt-2 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 italic">{caption}</p>
          </div>
        )}
      </div>
    </NodeViewWrapper>
  )
}

export default AudioComponent