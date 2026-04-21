// src/components/Editor/extensions/GalleryExtension.js
import { Node } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import GalleryComponent from '../GalleryComponent'

export const GalleryExtension = Node.create({
  name: 'gallery',
  
  group: 'block',
  
  content: 'galleryItem+',
  
  defining: true,
  
  addAttributes() {
    return {
      layout: {
        default: 'grid',
        parseHTML: element => element.getAttribute('data-layout'),
        renderHTML: attributes => ({
          'data-layout': attributes.layout,
          class: `gallery gallery-${attributes.layout}`,
        }),
      },
      columns: {
        default: 3,
        parseHTML: element => parseInt(element.getAttribute('data-columns')) || 3,
        renderHTML: attributes => ({
          'data-columns': attributes.columns,
        }),
      },
    }
  },
  
  parseHTML() {
    return [
      {
        tag: 'div.gallery',
      },
    ]
  },
  
  renderHTML({ HTMLAttributes }) {
    return ['div', { class: 'gallery', ...HTMLAttributes }, 0]
  },
  
  addNodeView() {
    return ReactNodeViewRenderer(GalleryComponent)
  },
  
  addCommands() {
    return {
      insertGallery: (images) => ({ commands }) => {
        const items = images.map(img => ({
          type: 'galleryItem',
          attrs: {
            src: img.src,
            alt: img.alt || '',
            caption: img.caption || '',
          },
        }))
        
        return commands.insertContent({
          type: this.name,
          content: items,
        })
      },
    }
  },
})

export const GalleryItem = Node.create({
  name: 'galleryItem',
  
  group: 'gallery',
  
  atom: true,
  
  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: '',
      },
      caption: {
        default: '',
      },
    }
  },
  
  parseHTML() {
    return [
      {
        tag: 'img',
      },
    ]
  },
  
  renderHTML({ HTMLAttributes }) {
    return ['img', HTMLAttributes]
  },
})