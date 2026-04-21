// src/components/editor/extensions/EmbedExtension.js
import { Node } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import EmbedComponent from '../EmbedComponent'

export const EmbedExtension = Node.create({
  name: 'embed',
  
  group: 'block',
  
  atom: true,
  
  addAttributes() {
    return {
      html: {
        default: null,
      },
      src: {
        default: null,
      },
      platform: {
        default: null,
      },
      title: {
        default: '',
      },
      caption: {
        default: '',
      },
      alignment: {
        default: 'center',
      },
      width: {
        default: '100%',
      },
    }
  },
  
  parseHTML() {
    return [
      {
        tag: 'div[data-embed]',
      },
    ]
  },
  
  renderHTML({ node }) {
    const { html, caption, alignment, width } = node.attrs
    
    return [
      'div',
      {
        'data-embed': 'true',
        'data-alignment': alignment,
        class: `embed-wrapper embed-${alignment}`,
        style: `width: ${width}; margin: 0 auto;`,
      },
      [
        'div',
        {
          class: 'embed-content',
        },
        ['div', { innerHTML: html || '' }]
      ],
      caption ? ['div', { class: 'embed-caption' }, caption] : null,
    ].filter(Boolean)
  },
  
  addNodeView() {
    return ReactNodeViewRenderer(EmbedComponent)
  },
  
  addCommands() {
    return {
      setEmbed: (options) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: options,
        })
      },
      updateEmbed: (attrs) => ({ commands }) => {
        return commands.updateAttributes(this.name, attrs)
      },
    }
  },
})