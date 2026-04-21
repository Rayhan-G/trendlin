// src/components/editor/extensions/VideoExtension.js
import { Node } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import VideoComponent from '../VideoComponent'

export const VideoExtension = Node.create({
  name: 'video',
  
  group: 'block',
  
  atom: true,
  
  addAttributes() {
    return {
      src: {
        default: null,
      },
      poster: {
        default: null,
      },
      alt: {
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
      controls: {
        default: true,
      },
      autoplay: {
        default: false,
      },
      loop: {
        default: false,
      },
      muted: {
        default: false,
      },
    }
  },
  
  parseHTML() {
    return [
      {
        tag: 'video',
      },
    ]
  },
  
  renderHTML({ node }) {
    const { src, poster, alt, alignment, width, controls, autoplay, loop, muted } = node.attrs
    
    return [
      'video',
      {
        src,
        poster,
        alt,
        controls: controls ? 'controls' : null,
        autoplay: autoplay ? 'autoplay' : null,
        loop: loop ? 'loop' : null,
        muted: muted ? 'muted' : null,
        class: `video-${alignment}`,
        style: `width: ${width}; height: auto;`,
      },
    ]
  },
  
  addNodeView() {
    return ReactNodeViewRenderer(VideoComponent)
  },
  
  addCommands() {
    return {
      setVideo: (options) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: options,
        })
      },
      updateVideo: (attrs) => ({ commands }) => {
        return commands.updateAttributes(this.name, attrs)
      },
    }
  },
})