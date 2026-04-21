// src/components/editor/PDFComponent.jsx - ENHANCED VERSION
import React, { useState } from 'react'
import { NodeViewWrapper } from '@tiptap/react'
import { FileText, ExternalLink, Download, Printer, Eye } from 'lucide-react'

const PDFComponent = ({ node }) => {
  const [isHovered, setIsHovered] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  const { 
    src, 
    title, 
    caption, 
    alignment, 
    width, 
    height, 
    showToolbar, 
    allowDownload, 
    allowPrint 
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

  const viewerParams = []
  if (!showToolbar) viewerParams.push('toolbar=0')
  if (!allowDownload) viewerParams.push('download=0')
  if (!allowPrint) viewerParams.push('print=0')
  
  const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(src)}&embedded=true${viewerParams.length ? '&' + viewerParams.join('&') : ''}`

  // Extract filename from URL
  const getFileName = () => {
    try {
      const url = new URL(src)
      const pathname = url.pathname
      const fileName = pathname.split('/').pop()
      return fileName || 'document.pdf'
    } catch {
      return 'document.pdf'
    }
  }

  const fileName = getFileName()
  const fileSize = node.attrs.bytes 
    ? `${(node.attrs.bytes / 1024 / 1024).toFixed(2)} MB`
    : null

  return (
    <NodeViewWrapper 
      className="pdf-node-wrapper"
      style={getAlignmentStyle()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative group rounded-xl overflow-hidden bg-white dark:bg-gray-900 shadow-sm border border-gray-200 dark:border-gray-700">
        {/* Selection indicator */}
        {isHovered && (
          <div className="absolute -inset-0.5 border-2 border-purple-400 rounded-xl pointer-events-none z-10" />
        )}
        
        {/* PDF Header Bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate" title={title || fileName}>
              {title || fileName}
            </span>
            {fileSize && (
              <span className="text-xs text-gray-400 flex-shrink-0">{fileSize}</span>
            )}
          </div>
          
          {/* Action buttons */}
          <div className="flex items-center gap-1">
            <a
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
              title="Open in new tab"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink size={14} />
            </a>
            
            {allowDownload && (
              <a
                href={src}
                download={fileName}
                className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
                title="Download PDF"
                onClick={(e) => e.stopPropagation()}
              >
                <Download size={14} />
              </a>
            )}
            
            {allowPrint && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  // Open print dialog for the iframe
                  const iframe = document.querySelector(`iframe[title="${title || 'PDF Document'}"]`)
                  if (iframe && iframe.contentWindow) {
                    iframe.contentWindow.print()
                  }
                }}
                className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
                title="Print PDF"
              >
                <Printer size={14} />
              </button>
            )}
          </div>
        </div>
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-800" style={{ top: '41px' }}>
            <div className="text-center">
              <svg className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-2" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="text-sm text-gray-500">Loading PDF...</p>
            </div>
          </div>
        )}
        
        {/* PDF Viewer */}
        <iframe 
          src={viewerUrl}
          width="100%"
          height={`${height}px`}
          frameBorder="0"
          title={title || 'PDF Document'}
          style={{ border: 'none', borderRadius: '0 0 8px 8px' }}
          allowFullScreen
          onLoad={() => setIsLoading(false)}
          onError={() => setIsLoading(false)}
        />
        
        {/* Caption Display */}
        {caption && (
          <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400 italic text-center">{caption}</p>
          </div>
        )}
        
        {/* Hover hint for MediaControls */}
        {isHovered && !caption && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/70 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
            <Eye size={12} className="inline mr-1" />
            Select to edit in MediaControls
          </div>
        )}
      </div>
    </NodeViewWrapper>
  )
}

export default PDFComponent