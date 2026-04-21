// src/components/editor/extensions/PDFExtension.js
import { Node } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import PDFComponent from '../PDFComponent'

export const PDFExtension = Node.create({
  name: 'pdf',
  
  group: 'block',
  
  atom: true,
  
  addAttributes() {
    return {
      src: { default: null },
      title: { default: '' },
      caption: { default: '' },
      alignment: { default: 'center' },
      width: { default: '100%' },
      height: { default: '600' },
      showToolbar: { default: true },
      allowDownload: { default: true },
      allowPrint: { default: true },
      customX: { default: null },
      customY: { default: null },
    }
  },
  
  parseHTML() {
    return [{ tag: 'div[data-pdf]' }]
  },
  
  renderHTML({ node }) {
    const { src, title, caption, alignment, width, height, showToolbar, allowDownload, allowPrint } = node.attrs
    
    const viewerParams = []
    if (!showToolbar) viewerParams.push('toolbar=0')
    if (!allowDownload) viewerParams.push('download=0')
    if (!allowPrint) viewerParams.push('print=0')
    
    const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(src)}&embedded=true${viewerParams.length ? '&' + viewerParams.join('&') : ''}`
    
    return [
      'div',
      {
        'data-pdf': 'true',
        'data-alignment': alignment,
        class: `pdf-wrapper pdf-${alignment}`,
        style: `width: ${width}; margin: 0 auto;`,
      },
      [
        'iframe',
        {
          src: viewerUrl,
          width: '100%',
          height: `${height}px`,
          frameborder: '0',
          title: title || 'PDF Document',
          style: 'border: none; border-radius: 8px;',
        },
      ],
      caption ? ['div', { class: 'pdf-caption' }, caption] : null,
    ].filter(Boolean)
  },
  
  addNodeView() {
    return ReactNodeViewRenderer(PDFComponent)
  },
  
  addCommands() {
    return {
      setPDF: (options) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: options,
        })
      },
    }
  },
})