// src/components/editor/extensions/AudioExtension.js
import { Node } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import AudioComponent from '../AudioComponent'

export const AudioExtension = Node.create({
  name: 'audio',
  
  group: 'block',
  
  atom: true,
  
  addAttributes() {
    return {
      src: { default: null },
      title: { default: '' },
      caption: { default: '' },
      alignment: { default: 'center' },
      width: { default: '100%' },
      controls: { default: true },
      autoplay: { default: false },
      loop: { default: false },
      muted: { default: false },
      customX: { default: null },
      customY: { default: null },
    }
  },
  
  parseHTML() {
    return [{ tag: 'div[data-audio]' }]
  },
  
  renderHTML({ node }) {
    const { src, title, caption, alignment, width, controls, autoplay, loop, muted } = node.attrs
    
    return [
      'div',
      {
        'data-audio': 'true',
        'data-alignment': alignment,
        class: `audio-wrapper audio-${alignment}`,
        style: `width: ${width}; margin: 0 auto;`,
      },
      [
        'audio',
        {
          src,
          controls,
          autoplay,
          loop,
          muted,
          title,
          style: 'width: 100%; border-radius: 8px;',
        },
      ],
      caption ? ['div', { class: 'audio-caption' }, caption] : null,
    ].filter(Boolean)
  },
  
  addNodeView() {
    return ReactNodeViewRenderer(AudioComponent)
  },
  
  addCommands() {
    return {
      setAudio: (options) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: options,
        })
      },
    }
  },
})