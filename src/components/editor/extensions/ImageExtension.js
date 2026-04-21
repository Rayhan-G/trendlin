// src/components/Editor/extensions/ImageExtension.js
import { Node } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import ImageComponent from '../ImageComponent'

export const ImageExtension = Node.create({
  name: 'image',
  
  group: 'block',
  
  atom: true,
  
  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: element => element.getAttribute('src'),
        renderHTML: attributes => ({
          src: attributes.src,
        }),
      },
      alt: {
        default: '',
        parseHTML: element => element.getAttribute('alt'),
        renderHTML: attributes => ({
          alt: attributes.alt,
        }),
      },
      title: {
        default: '',
        parseHTML: element => element.getAttribute('title'),
        renderHTML: attributes => ({
          title: attributes.title,
        }),
      },
      width: {
        default: '100%',
        parseHTML: element => element.getAttribute('width'),
        renderHTML: attributes => ({
          width: attributes.width,
          style: `width: ${attributes.width}; height: auto;`,
        }),
      },
      alignment: {
        default: 'center',
        parseHTML: element => element.getAttribute('data-alignment'),
        renderHTML: attributes => ({
          'data-alignment': attributes.alignment,
          class: `image-${attributes.alignment}`,
        }),
      },
      caption: {
        default: '',
        parseHTML: element => {
          const parent = element.parentElement
          if (parent && parent.tagName === 'FIGURE') {
            const figcaption = parent.querySelector('figcaption')
            return figcaption ? figcaption.innerHTML : ''
          }
          return ''
        },
        renderHTML: attributes => ({}),
      },
    }
  },
  
  parseHTML() {
    return [
      {
        tag: 'img',
        getAttrs: (element) => ({
          src: element.getAttribute('src'),
          alt: element.getAttribute('alt'),
          title: element.getAttribute('title'),
        }),
      },
      {
        tag: 'figure',
        contentElement: 'img',
      },
    ]
  },
  
  renderHTML({ node, HTMLAttributes }) {
    const { caption, alignment, ...attrs } = HTMLAttributes
    
    if (caption) {
      return [
        'figure',
        { class: `image image-${alignment || 'center'}` },
        ['img', attrs],
        ['figcaption', {}, caption],
      ]
    }
    
    return ['img', { class: `image-${alignment || 'center'}`, ...attrs }]
  },
  
  addNodeView() {
    return ReactNodeViewRenderer(ImageComponent)
  },
  
  addCommands() {
    return {
      setImage: (options) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: options,
        })
      },
      updateImage: (attrs) => ({ commands }) => {
        return commands.updateAttributes(this.name, attrs)
      },
    }
  },
})