// src/hooks/useEditor.js (COMPLETE REWRITE USING SLATE.JS)

import { useState, useCallback, useRef, useEffect } from 'react'
import { createEditor, Transforms, Element as SlateElement, Range, Editor } from 'slate'
import { withHistory } from 'slate-history'
import { withReact, ReactEditor, useSlate, useSlateStatic, useFocused, useSelected, useReadOnly, Slate, Editable } from 'slate-react'

/**
 * Custom hook for Slate.js editor with rich text formatting
 * @param {string} initialContent - Initial HTML content
 * @param {Object} options - Editor options
 * @returns {Object} Editor state and controls
 */
export const useEditor = (initialContent = '', options = {}) => {
  const { 
    placeholder = 'Start writing...',
    readOnly = false,
    autoFocus = true
  } = options

  const [editor] = useState(() => withHistory(withReact(createEditor())))
  const [value, setValue] = useState(() => {
    // Convert initial HTML to Slate nodes
    if (initialContent && initialContent !== '') {
      return deserializeHTML(initialContent)
    }
    return initialValue
  })
  
  const [isDirty, setIsDirty] = useState(false)
  const containerRef = useRef(null)

  // Track changes for auto-save
  const handleChange = useCallback((newValue) => {
    setValue(newValue)
    setIsDirty(true)
    
    // Call custom onChange handler if provided
    if (options.onChange) {
      options.onChange(serializeToHTML(newValue))
    }
  }, [options])

  // Focus editor on mount
  useEffect(() => {
    if (autoFocus && editor) {
      ReactEditor.focus(editor)
    }
  }, [autoFocus, editor])

  // Format text with mark
  const toggleMark = useCallback((format) => {
    const isActive = isMarkActive(editor, format)
    if (isActive) {
      Editor.removeMark(editor, format)
    } else {
      Editor.addMark(editor, format, true)
    }
  }, [editor])

  // Check if mark is active
  const isMarkActive = useCallback((editor, format) => {
    const marks = Editor.marks(editor)
    return marks ? marks[format] === true : false
  }, [editor])

  // Format block (heading, paragraph, etc.)
  const toggleBlock = useCallback((format) => {
    const isActive = isBlockActive(editor, format)
    const isList = format === 'numbered-list' || format === 'bulleted-list'
    
    Transforms.unwrapNodes(editor, {
      match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && ['numbered-list', 'bulleted-list'].includes(n.type),
      split: true,
    })
    
    let newProperties = {
      type: isActive ? 'paragraph' : isList ? 'list-item' : format,
    }
    
    Transforms.setNodes(editor, newProperties)
    
    if (!isActive && isList) {
      const block = { type: format, children: [] }
      Transforms.wrapNodes(editor, block)
    }
  }, [editor])

  // Check if block is active
  const isBlockActive = useCallback((editor, format) => {
    const [match] = Editor.nodes(editor, {
      match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === format,
    })
    return !!match
  }, [editor])

  // Get current block type
  const getBlockType = useCallback(() => {
    const [match] = Editor.nodes(editor, {
      match: n => !Editor.isEditor(n) && SlateElement.isElement(n),
    })
    return match ? match[0].type : 'paragraph'
  }, [editor])

  // Undo
  const undo = useCallback(() => {
    editor.undo()
  }, [editor])

  // Redo
  const redo = useCallback(() => {
    editor.redo()
  }, [editor])

  // Insert link
  const insertLink = useCallback((url, text) => {
    if (editor.selection) {
      const [node] = Editor.node(editor, editor.selection)
      
      if (SlateElement.isElement(node) && node.type === 'link') {
        Transforms.setNodes(editor, { url }, { at: editor.selection })
      } else {
        Transforms.wrapNodes(editor, {
          type: 'link',
          url,
          children: [{ text: text || url }],
        }, { split: true })
      }
    }
  }, [editor])

  // Remove link
  const removeLink = useCallback(() => {
    Transforms.unwrapNodes(editor, {
      match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === 'link',
    })
  }, [editor])

  // Insert image
  const insertImage = useCallback((url, alt = '') => {
    const text = { text: '' }
    const image = { type: 'image', url, alt, children: [text] }
    Transforms.insertNodes(editor, image)
  }, [editor])

  // Insert embed (video, tweet, etc.)
  const insertEmbed = useCallback((url, type = 'video') => {
    const embed = { type: 'embed', url, embedType: type, children: [{ text: '' }] }
    Transforms.insertNodes(editor, embed)
  }, [editor])

  // Insert code block
  const insertCodeBlock = useCallback((language = 'javascript') => {
    const codeBlock = { type: 'code-block', language, children: [{ text: '' }] }
    Transforms.insertNodes(editor, codeBlock)
  }, [editor])

  // Insert heading
  const insertHeading = useCallback((level) => {
    toggleBlock(`heading-${level}`)
  }, [toggleBlock])

  // Get current content as HTML
  const getHTML = useCallback(() => {
    return serializeToHTML(value)
  }, [value])

  // Get current content as plain text
  const getPlainText = useCallback(() => {
    return value.map(node => SlateElement.isElement(node) ? node.children.map(child => child.text).join(' ') : node.text).join('\n')
  }, [value])

  // Set content programmatically
  const setContent = useCallback((newContent) => {
    const newValue = typeof newContent === 'string' ? deserializeHTML(newContent) : newContent
    setValue(newValue)
    setIsDirty(true)
  }, [])

  // Clear content
  const clearContent = useCallback(() => {
    setValue(initialValue)
    setIsDirty(true)
  }, [])

  // Focus editor
  const focus = useCallback(() => {
    ReactEditor.focus(editor)
  }, [editor])

  // Blur editor
  const blur = useCallback(() => {
    ReactEditor.blur(editor)
  }, [editor])

  // Check if editor is empty
  const isEmpty = useCallback(() => {
    return value.length === 1 && value[0].children.length === 1 && value[0].children[0].text === ''
  }, [value])

  // Get word count
  const getWordCount = useCallback(() => {
    const text = getPlainText()
    return text.trim().split(/\s+/).filter(w => w.length > 0).length
  }, [getPlainText])

  // Get character count
  const getCharacterCount = useCallback(() => {
    return getPlainText().length
  }, [getPlainText])

  return {
    // Core
    editor,
    value,
    setValue: setContent,
    
    // Formatting
    toggleMark,
    toggleBlock,
    isMarkActive,
    isBlockActive,
    getBlockType,
    
    // History
    undo,
    redo,
    canUndo: editor.history && editor.history.undos.length > 0,
    canRedo: editor.history && editor.history.redos.length > 0,
    
    // Insertion
    insertLink,
    removeLink,
    insertImage,
    insertEmbed,
    insertCodeBlock,
    insertHeading,
    
    // Content
    getHTML,
    getPlainText,
    setContent,
    clearContent,
    
    // Utilities
    focus,
    blur,
    isEmpty,
    getWordCount,
    getCharacterCount,
    isDirty,
    setIsDirty,
    
    // Event handlers
    onChange: handleChange,
    
    // Refs
    containerRef
  }
}

/**
 * Default empty Slate value
 */
const initialValue = [
  {
    type: 'paragraph',
    children: [{ text: '' }],
  },
]

/**
 * Serialize Slate value to HTML
 * @param {Array} value - Slate nodes
 * @returns {string} HTML string
 */
export const serializeToHTML = (value) => {
  return value.map(node => serializeNode(node)).join('')
}

/**
 * Serialize a single Slate node to HTML
 * @param {Object} node - Slate node
 * @returns {string} HTML string
 */
const serializeNode = (node) => {
  if (node.text !== undefined) {
    let text = node.text
    if (node.bold) text = `<strong>${text}</strong>`
    if (node.italic) text = `<em>${text}</em>`
    if (node.underline) text = `<u>${text}</u>`
    if (node.code) text = `<code>${text}</code>`
    if (node.strikethrough) text = `<del>${text}</del>`
    return text
  }
  
  const children = node.children.map(n => serializeNode(n)).join('')
  
  switch (node.type) {
    case 'paragraph':
      return `<p>${children}</p>`
    case 'heading-1':
      return `<h1>${children}</h1>`
    case 'heading-2':
      return `<h2>${children}</h2>`
    case 'heading-3':
      return `<h3>${children}</h3>`
    case 'heading-4':
      return `<h4>${children}</h4>`
    case 'heading-5':
      return `<h5>${children}</h5>`
    case 'heading-6':
      return `<h6>${children}</h6>`
    case 'block-quote':
      return `<blockquote>${children}</blockquote>`
    case 'code-block':
      return `<pre><code class="language-${node.language || 'javascript'}">${children}</code></pre>`
    case 'numbered-list':
      return `<ol>${children}</ol>`
    case 'bulleted-list':
      return `<ul>${children}</ul>`
    case 'list-item':
      return `<li>${children}</li>`
    case 'link':
      return `<a href="${node.url}" target="_blank" rel="noopener noreferrer">${children}</a>`
    case 'image':
      return `<img src="${node.url}" alt="${node.alt || ''}" />`
    case 'embed':
      return getEmbedHtml(node.url, node.embedType)
    default:
      return children
  }
}

/**
 * Get embed HTML for different platforms
 * @param {string} url - Embed URL
 * @param {string} type - Embed type (video, tweet, etc.)
 * @returns {string} Embed HTML
 */
const getEmbedHtml = (url, type) => {
  if (type === 'video') {
    return `<div class="video-embed"><iframe src="${url}" frameborder="0" allowfullscreen></iframe></div>`
  }
  if (type === 'tweet') {
    return `<div class="tweet-embed"><blockquote class="twitter-tweet"><a href="${url}"></a></blockquote><script async src="https://platform.twitter.com/widgets.js"></script></div>`
  }
  return `<div class="embed"><iframe src="${url}" frameborder="0"></iframe></div>`
}

/**
 * Deserialize HTML to Slate value
 * @param {string} html - HTML string
 * @returns {Array} Slate nodes
 */
export const deserializeHTML = (html) => {
  if (!html || html === '') return initialValue
  
  const parser = new DOMParser()
  const document = parser.parseFromString(html, 'text/html')
  const nodes = deserializeElement(document.body)
  
  return nodes.length ? nodes : initialValue
}

/**
 * Deserialize DOM element to Slate nodes
 * @param {HTMLElement} element - DOM element
 * @returns {Array} Slate nodes
 */
const deserializeElement = (element) => {
  const nodes = []
  
  for (const child of element.childNodes) {
    if (child.nodeType === Node.TEXT_NODE) {
      if (child.textContent && child.textContent.trim() !== '') {
        nodes.push({ text: child.textContent })
      }
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      const elementNode = child
      const tagName = elementNode.tagName.toLowerCase()
      const children = deserializeElement(elementNode)
      
      switch (tagName) {
        case 'p':
          nodes.push({ type: 'paragraph', children: children.length ? children : [{ text: '' }] })
          break
        case 'h1':
          nodes.push({ type: 'heading-1', children: children.length ? children : [{ text: '' }] })
          break
        case 'h2':
          nodes.push({ type: 'heading-2', children: children.length ? children : [{ text: '' }] })
          break
        case 'h3':
          nodes.push({ type: 'heading-3', children: children.length ? children : [{ text: '' }] })
          break
        case 'h4':
          nodes.push({ type: 'heading-4', children: children.length ? children : [{ text: '' }] })
          break
        case 'h5':
          nodes.push({ type: 'heading-5', children: children.length ? children : [{ text: '' }] })
          break
        case 'h6':
          nodes.push({ type: 'heading-6', children: children.length ? children : [{ text: '' }] })
          break
        case 'blockquote':
          nodes.push({ type: 'block-quote', children: children.length ? children : [{ text: '' }] })
          break
        case 'pre':
          nodes.push({ type: 'code-block', language: 'javascript', children: children.length ? children : [{ text: '' }] })
          break
        case 'code':
          if (children.length > 0 && children[0].text) {
            nodes.push({ text: children[0].text, code: true })
          }
          break
        case 'ol':
          nodes.push({ type: 'numbered-list', children })
          break
        case 'ul':
          nodes.push({ type: 'bulleted-list', children })
          break
        case 'li':
          nodes.push({ type: 'list-item', children: children.length ? children : [{ text: '' }] })
          break
        case 'a':
          nodes.push({ type: 'link', url: elementNode.getAttribute('href') || '', children: children.length ? children : [{ text: '' }] })
          break
        case 'img':
          nodes.push({ type: 'image', url: elementNode.getAttribute('src') || '', alt: elementNode.getAttribute('alt') || '', children: [{ text: '' }] })
          break
        case 'strong':
        case 'b':
          nodes.push({ text: children.map(c => c.text).join(''), bold: true })
          break
        case 'em':
        case 'i':
          nodes.push({ text: children.map(c => c.text).join(''), italic: true })
          break
        case 'u':
          nodes.push({ text: children.map(c => c.text).join(''), underline: true })
          break
        case 'del':
        case 's':
          nodes.push({ text: children.map(c => c.text).join(''), strikethrough: true })
          break
        default:
          nodes.push(...children)
          break
      }
    }
  }
  
  return nodes
}

/**
 * Render Leaf Component (for formatting)
 * @param {Object} props - Leaf props
 * @returns {JSX.Element} Rendered leaf
 */
export const Leaf = ({ attributes, children, leaf }) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>
  }
  if (leaf.italic) {
    children = <em>{children}</em>
  }
  if (leaf.underline) {
    children = <u>{children}</u>
  }
  if (leaf.code) {
    children = <code>{children}</code>
  }
  if (leaf.strikethrough) {
    children = <del>{children}</del>
  }
  return <span {...attributes}>{children}</span>
}

/**
 * Render Element Component
 * @param {Object} props - Element props
 * @returns {JSX.Element} Rendered element
 */
export const Element = ({ attributes, children, element }) => {
  const readOnly = useReadOnly()
  const selected = useSelected()
  const focused = useFocused()
  
  switch (element.type) {
    case 'heading-1':
      return <h1 {...attributes}>{children}</h1>
    case 'heading-2':
      return <h2 {...attributes}>{children}</h2>
    case 'heading-3':
      return <h3 {...attributes}>{children}</h3>
    case 'heading-4':
      return <h4 {...attributes}>{children}</h4>
    case 'heading-5':
      return <h5 {...attributes}>{children}</h5>
    case 'heading-6':
      return <h6 {...attributes}>{children}</h6>
    case 'block-quote':
      return <blockquote {...attributes}>{children}</blockquote>
    case 'code-block':
      return (
        <pre {...attributes}>
          <code className={`language-${element.language || 'javascript'}`}>
            {children}
          </code>
        </pre>
      )
    case 'numbered-list':
      return <ol {...attributes}>{children}</ol>
    case 'bulleted-list':
      return <ul {...attributes}>{children}</ul>
    case 'list-item':
      return <li {...attributes}>{children}</li>
    case 'link':
      return (
        <a {...attributes} href={element.url} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      )
    case 'image':
      return (
        <div {...attributes} contentEditable={false} className="relative inline-block">
          <img
            src={element.url}
            alt={element.alt || ''}
            className={`max-w-full rounded-lg ${selected && focused ? 'ring-2 ring-blue-500' : ''}`}
          />
          {!readOnly && selected && focused && (
            <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 rounded">
              {element.alt || 'Click to edit alt text'}
            </div>
          )}
        </div>
      )
    case 'embed':
      return (
        <div {...attributes} contentEditable={false} className="my-4">
          {getEmbedComponent(element.url, element.embedType)}
        </div>
      )
    default:
      return <p {...attributes}>{children}</p>
  }
}

/**
 * Get embed component for different platforms
 * @param {string} url - Embed URL
 * @param {string} type - Embed type
 * @returns {JSX.Element} Embed component
 */
const getEmbedComponent = (url, type) => {
  if (type === 'video') {
    return (
      <div className="video-embed aspect-video">
        <iframe src={url} frameBorder="0" allowFullScreen className="w-full h-full rounded-lg" />
      </div>
    )
  }
  return (
    <div className="embed">
      <iframe src={url} frameBorder="0" className="w-full min-h-[400px] rounded-lg" />
    </div>
  )
}

/**
 * Toolbar Button Component
 * @param {Object} props - Button props
 * @returns {JSX.Element} Toolbar button
 */
export const ToolbarButton = ({ format, icon, isActive, onMouseDown, ...props }) => {
  const editor = useSlate()
  
  const handleClick = (event) => {
    event.preventDefault()
    if (onMouseDown) {
      onMouseDown(event)
    } else if (format) {
      const isMark = ['bold', 'italic', 'underline', 'code', 'strikethrough'].includes(format)
      if (isMark) {
        toggleMark(editor, format)
      } else {
        toggleBlock(editor, format)
      }
    }
  }
  
  return (
    <button
      {...props}
      onMouseDown={handleClick}
      className={`p-2 rounded hover:bg-gray-100 transition-colors ${isActive ? 'bg-gray-200 text-gray-900' : 'text-gray-600'}`}
    >
      {icon}
    </button>
  )
}

// Helper functions for toolbar buttons
const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format)
  if (isActive) {
    Editor.removeMark(editor, format)
  } else {
    Editor.addMark(editor, format, true)
  }
}

const isMarkActive = (editor, format) => {
  const marks = Editor.marks(editor)
  return marks ? marks[format] === true : false
}

const toggleBlock = (editor, format) => {
  const isActive = isBlockActive(editor, format)
  const isList = format === 'numbered-list' || format === 'bulleted-list'
  
  Transforms.unwrapNodes(editor, {
    match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && ['numbered-list', 'bulleted-list'].includes(n.type),
    split: true,
  })
  
  let newProperties = {
    type: isActive ? 'paragraph' : isList ? 'list-item' : format,
  }
  
  Transforms.setNodes(editor, newProperties)
  
  if (!isActive && isList) {
    const block = { type: format, children: [] }
    Transforms.wrapNodes(editor, block)
  }
}

const isBlockActive = (editor, format) => {
  const [match] = Editor.nodes(editor, {
    match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === format,
  })
  return !!match
}

export default useEditor