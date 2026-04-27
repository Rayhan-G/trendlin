// src/components/Editor/Toolbar.jsx - WITH MIXED CONTENT TEMPLATES

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import PropTypes from 'prop-types'
import {
  Bold, Italic, Underline, Strikethrough, Code,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, CheckSquare,
  Link as LinkIcon, Unlink,
  Undo, Redo, Quote, Pilcrow, Minus,
  Palette, Type, Highlighter, Smile, ChevronDown, Plus, X, Search,
  Sparkles, Copy, Table as TableIcon, Image, Video, Music, File, Grid,
  Eye, Maximize2, Minimize2, Clock, FileText, TrendingUp, Save, Calendar, Send,
  Layout, Merge, Split, Trash2, Code2, Terminal, Languages, MessageCircle,
  Lightbulb, AlertCircle, AlertTriangle, Star, Heart, Zap, CheckCircle, HelpCircle,
  Info, LayoutGrid, Edit2, Check, Loader2,
  PanelRight, PanelRightClose, SpellCheck,
  Newspaper, BookOpen, LayoutTemplate, FileStack  // Added for templates
} from 'lucide-react'
import dynamic from 'next/dynamic'
import MediaControls from './MediaControls'

// Dynamically import EmojiPicker to reduce initial bundle size
const EmojiPicker = dynamic(() => import('emoji-picker-react').catch(() => () => <div className="p-4 text-center">Failed to load emoji picker</div>), { 
  ssr: false,
  loading: () => <div className="p-4 text-center"><Loader2 className="animate-spin mx-auto" /></div>
})

// Dynamically import media modals with error boundaries
const ImageModal = dynamic(() => import('@/components/media/Modals/ImageModal').catch(() => () => <div className="p-4 text-red-500">Failed to load ImageModal</div>), { ssr: false })
const VideoModal = dynamic(() => import('@/components/media/Modals/VideoModal').catch(() => () => <div className="p-4 text-red-500">Failed to load VideoModal</div>), { ssr: false })
const AudioModal = dynamic(() => import('@/components/media/Modals/AudioModal').catch(() => () => <div className="p-4 text-red-500">Failed to load AudioModal</div>), { ssr: false })
const PDFModal = dynamic(() => import('@/components/media/Modals/PDFModal').catch(() => () => <div className="p-4 text-red-500">Failed to load PDFModal</div>), { ssr: false })
const EmbedModal = dynamic(() => import('@/components/media/Modals/EmbedModal').catch(() => () => <div className="p-4 text-red-500">Failed to load EmbedModal</div>), { ssr: false })
const GalleryModal = dynamic(() => import('@/components/media/Modals/GalleryModal').catch(() => () => <div className="p-4 text-red-500">Failed to load GalleryModal</div>), { ssr: false })

// ==================== UTILITY FUNCTIONS ====================
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

const showToast = (message, type = 'info') => {
  const toastEvent = new CustomEvent('showToast', { detail: { message, type } })
  window.dispatchEvent(toastEvent)
}

// ==================== TEMPLATE GENERATORS ====================
const generateContentPageTemplate = () => {
  const id = generateId()
  return `
    <div class="template-content-page" data-template-type="content" data-template-id="${id}">
      <div class="page-content" style="max-width: 800px; margin: 2rem auto;">
        <h1 style="font-size: 2.5rem; font-weight: 700; margin-bottom: 1rem;">Content Title: Clear & Direct</h1>
        <div class="meta" style="color: #6b7280; margin: 0.5rem 0 1.5rem; border-left: 4px solid #2563eb; padding-left: 1rem;">
          📄 Updated: ${new Date().toLocaleDateString()} • 4 min read
        </div>
        <div class="featured-media" style="margin: 1.5rem 0;">
          <img src="https://picsum.photos/id/20/800/400" alt="content visual" style="width:100%; border-radius: 1rem;">
        </div>
        <div class="body-text" style="font-size: 1.1rem; margin: 2rem 0;">
          <p>This is a standard content page. Use these for evergreen information, documentation, or any structured page that doesn't require timestamps or author bylines.</p>
          <h2 style="font-size: 1.5rem; font-weight: 600; margin: 1.5rem 0 1rem;">Subheading example</h2>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
          <ul style="margin: 1rem 0 1rem 2rem;">
            <li>Clear hierarchy</li>
            <li>No publication date required</li>
            <li>Focus on utility</li>
          </ul>
          <div class="callout" style="background: #eef2ff; padding: 1.5rem; border-radius: 1rem; margin: 2rem 0;">
            💡 <strong>Tip box</strong> — Great for summarizing key takeaways or extra resources.
          </div>
        </div>
      </div>
    </div>
  `
}

const generateArticleTemplate = () => {
  const id = generateId()
  const date = new Date()
  const author = "Dr. Sarah Chen"
  
  return `
    <div class="template-article" data-template-type="article" data-template-id="${id}">
      <article class="full-article" style="max-width: 900px; margin: 0 auto;">
        <div class="article-header" style="text-align: center; margin-bottom: 2rem;">
          <span class="category" style="background: #2563eb10; padding: 0.2rem 0.8rem; border-radius: 2rem; font-size: 0.8rem; display: inline-block;">📖 FEATURE ARTICLE</span>
          <h1 style="font-size: 2.8rem; font-weight: 700; margin: 1rem 0;">The Future of Digital Publishing</h1>
          <div class="byline" style="color: #4b5563; border-top: 1px solid #eaeaea; border-bottom: 1px solid #eaeaea; padding: 0.75rem 0; display: inline-block;">
            By <strong>${author}</strong> — ${date.toLocaleDateString()} — 12 min read
          </div>
        </div>

        <div class="hero-img" style="margin: 0 auto 2rem;">
          <img src="https://picsum.photos/id/42/1200/600" alt="article hero" style="width:100%; border-radius: 1.5rem;">
          <figcaption style="text-align: center; font-size:0.8rem; color:#6b7280; margin-top: 0.5rem;">Photo by Unsplash</figcaption>
        </div>

        <div class="article-body" style="font-size: 1.1rem; line-height: 1.7;">
          <p class="lead" style="font-size:1.3rem; font-weight:400; border-left: 5px solid #2563eb; padding-left: 1.5rem; margin-bottom: 1.5rem;">
            This is a dedicated article template. It emphasizes authorship, depth, and shareable structure for long-form content.
          </p>
          <p>Articles often include pull quotes, data visualizations, and references. They are less frequent than blog posts but carry more authority and depth.</p>
          <blockquote style="font-style: italic; border-left: 3px solid #ccc; margin: 1.5rem 0; padding-left: 1.5rem; color:#2d3e50;">
            “A great article doesn't just inform — it changes how you think.”
          </blockquote>
          <h2 style="font-size: 1.75rem; font-weight: 600; margin: 1.5rem 0 1rem;">Research methodology</h2>
          <p>With proper subheadings, footnotes, and references. Articles shine when they are evergreen or deeply researched content that provides lasting value.</p>
          <div class="author-bio" style="background:#f1f5f9; padding: 1rem; border-radius: 1rem; margin-top: 3rem;">
            <strong>${author}</strong> — Writer & researcher focused on media evolution and digital publishing strategies.
          </div>
        </div>
      </article>
    </div>
  `
}

const generateBlogTemplate = () => {
  const id = generateId()
  const date = new Date()
  const tags = ["#Life", "#Tech", "#Personal"]
  
  return `
    <div class="template-blog" data-template-type="blog" data-template-id="${id}">
      <div class="blog-single" style="max-width: 720px; margin: 2rem auto;">
        <div class="post-meta" style="display: flex; gap: 1rem; color:#6c757d; font-size:0.85rem; margin-bottom: 1rem;">
          <span>📅 ${date.toLocaleDateString()}</span>
          <span>✍️ 3 min read</span>
          <span>🏷️ ${tags.join(' • ')}</span>
        </div>
        <h1 style="font-size: 2rem; font-weight: 700; margin-bottom: 1.5rem;">What I learned this week (blog style)</h1>

        <div class="blog-content" style="margin: 2rem 0;">
          <p>Blog posts are more conversational. They have dates, tags, and often a comment section. This template is optimized for frequent, timely updates.</p>
          <p>✅ Keep paragraphs short.<br>✅ Add personal voice.<br>✅ Encourage discussion.</p>
          <img src="https://picsum.photos/id/26/700/300" alt="blog image" style="width:100%; border-radius: 1rem; margin: 1.5rem 0;">
          <p>Unlike articles, blog posts don't require deep research. They reflect the author's current thinking or news. Perfect for daily updates, personal journals, and quick insights.</p>
          <p>The conversational tone makes blog posts more engaging for regular readers who want to stay updated with your latest thoughts and activities.</p>
        </div>

        <hr style="margin: 2rem 0; border-color: #eaeaea;">
        <div class="blog-footer" style="text-align: center;">
          <p><strong>Share this post:</strong> Twitter / LinkedIn / Facebook</p>
          <p><em>Want more? Subscribe to the newsletter for weekly updates.</em></p>
        </div>
      </div>
    </div>
  `
}

const generateMixedHomepageTemplate = () => {
  const id = generateId()
  
  return `
    <div class="template-mixed-homepage" data-template-type="mixed" data-template-id="${id}">
      <div class="homepage-mixed">
        <!-- Hero -->
        <div class="hero" style="text-align: center; padding: 3rem 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 1rem; margin-bottom: 2rem;">
          <h1 style="font-size: 2.5rem; margin-bottom: 0.5rem;">Ideas. Insights. Stories.</h1>
          <p style="font-size: 1.1rem; opacity: 0.9;">Content • Long‑form Articles • Daily Blog</p>
        </div>

        <!-- Featured Article Section -->
        <div style="margin-bottom: 3rem;">
          <div class="featured-article" style="background: #f8fafc; border-radius: 1.5rem; padding: 2rem; border-left: 4px solid #2563eb;">
            <span class="badge" style="background:#2563eb; color:white; padding:0.2rem 0.6rem; border-radius: 1rem; font-size:0.75rem;">⭐ FEATURED ARTICLE</span>
            <h2 style="margin: 0.75rem 0 0.5rem; font-size: 1.5rem;">The Attention Economy in 2025</h2>
            <p style="color: #4b5563;">A deep investigative piece on how media cycles have changed human behavior and attention spans in the digital age.</p>
            <a href="#" style="display: inline-block; margin-top: 1rem; color: #2563eb; text-decoration: none; font-weight: 500;">Read full article →</a>
          </div>
        </div>

        <!-- Standard Content Grid -->
        <h2 style="margin: 2rem 0 1rem;">📘 Essential Guides (Content)</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px,1fr)); gap: 1.5rem; margin-bottom: 2rem;">
          <div class="card" style="background:white; padding:1.5rem; border-radius:1rem; border: 1px solid #eaeaea;">
            <h3 style="margin-bottom: 0.5rem;">Getting Started</h3>
            <p style="color: #6b7280;">Static content: setup, basics, FAQ, and beginner guides.</p>
            <a href="#" style="color: #2563eb; text-decoration: none;">Learn more →</a>
          </div>
          <div class="card" style="background:white; padding:1.5rem; border-radius:1rem; border: 1px solid #eaeaea;">
            <h3 style="margin-bottom: 0.5rem;">Reference Library</h3>
            <p style="color: #6b7280;">Always up to date technical docs and API references.</p>
            <a href="#" style="color: #2563eb; text-decoration: none;">Explore →</a>
          </div>
        </div>

        <!-- Recent Blog Posts -->
        <h2 style="margin: 2rem 0 1rem;">📝 Latest from the Blog</h2>
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <div class="blog-item" style="border-bottom:1px solid #e2e8f0; padding:1rem 0;">
            <small style="color: #6b7280;">${new Date().toLocaleDateString()}</small>
            <h3 style="margin:0.2rem 0"><a href="#" style="color: #1a1a1a; text-decoration: none;">5 productivity hacks this month</a></h3>
            <p style="color: #6b7280;">Quick blog-style update with practical tips.</p>
          </div>
          <div class="blog-item" style="border-bottom:1px solid #e2e8f0; padding:1rem 0;">
            <small style="color: #6b7280;">${new Date(Date.now() - 86400000).toLocaleDateString()}</small>
            <h3 style="margin:0.2rem 0"><a href="#" style="color: #1a1a1a; text-decoration: none;">Why I switched to minimalist code</a></h3>
            <p style="color: #6b7280;">Personal take on simplifying development workflow.</p>
          </div>
        </div>
        <a href="#" style="display: inline-block; margin: 1rem 0; color: #2563eb; text-decoration: none;">View all blog posts →</a>
      </div>
    </div>
  `
}

// ==================== TEMPLATES DROPDOWN ====================
const TemplatesDropdown = ({ editor, onClose }) => {
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [customTitle, setCustomTitle] = useState('')
  const [showCustomize, setShowCustomize] = useState(false)

  const templates = [
    { 
      id: 'content', 
      name: 'Content Page', 
      icon: FileText, 
      description: 'Standard informational page',
      color: 'blue',
      template: generateContentPageTemplate
    },
    { 
      id: 'article', 
      name: 'Long‑form Article', 
      icon: BookOpen, 
      description: 'Deep dive / research piece',
      color: 'purple',
      template: generateArticleTemplate
    },
    { 
      id: 'blog', 
      name: 'Blog Post', 
      icon: Newspaper, 
      description: 'Timely / personal update',
      color: 'green',
      template: generateBlogTemplate
    },
    { 
      id: 'mixed', 
      name: 'Mixed Homepage', 
      icon: LayoutTemplate, 
      description: 'Content + Article + Blog',
      color: 'orange',
      template: generateMixedHomepageTemplate
    }
  ]

  const insertTemplate = (template) => {
    let html = template.template()
    
    // If custom title is provided, try to replace the first h1
    if (customTitle && showCustomize) {
      html = html.replace(/<h1[^>]*>.*?<\/h1>/, `<h1 style="font-size: 2rem; font-weight: 700; margin-bottom: 1rem;">${escapeHtml(customTitle)}</h1>`)
    }
    
    editor.chain().focus().insertContent(html).run()
    showToast(`${template.name} inserted`, 'success')
    onClose()
  }

  const escapeHtml = (text) => {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }

  const getColorClasses = (color) => {
    const colors = {
      blue: 'border-blue-500 bg-blue-50 dark:bg-blue-950/30',
      purple: 'border-purple-500 bg-purple-50 dark:bg-purple-950/30',
      green: 'border-green-500 bg-green-50 dark:bg-green-950/30',
      orange: 'border-orange-500 bg-orange-50 dark:bg-orange-950/30'
    }
    return colors[color] || colors.blue
  }

  const getIconColor = (color) => {
    const colors = {
      blue: 'text-blue-500',
      purple: 'text-purple-500',
      green: 'text-green-500',
      orange: 'text-orange-500'
    }
    return colors[color] || colors.blue
  }

  return (
    <div className="absolute top-full left-0 mt-1.5 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border z-[100] w-[480px] max-h-[550px] overflow-hidden">
      <div className="p-3 border-b bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <LayoutTemplate size={16} className="text-purple-500" />
            Insert Mixed Content Template
          </div>
          <button 
            onClick={() => setShowCustomize(!showCustomize)}
            className="text-xs text-purple-600 hover:text-purple-700"
          >
            {showCustomize ? 'Hide options' : 'Customize'}
          </button>
        </div>
        
        {showCustomize && (
          <div className="mt-3">
            <label className="text-xs text-gray-500 block mb-1">Custom Title (optional)</label>
            <input 
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="Enter custom title..."
              className="w-full px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700"
              autoFocus
            />
          </div>
        )}
      </div>

      <div className="max-h-[450px] overflow-y-auto p-3">
        <div className="grid grid-cols-2 gap-3">
          {templates.map((template) => {
            const Icon = template.icon
            return (
              <button
                key={template.id}
                onClick={() => insertTemplate(template)}
                onMouseEnter={() => setSelectedTemplate(template.id)}
                onMouseLeave={() => setSelectedTemplate(null)}
                className={`p-3 rounded-xl text-left transition-all border-2 relative overflow-hidden group
                  ${selectedTemplate === template.id ? getColorClasses(template.color) : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${getColorClasses(template.color)}`}>
                    <Icon size={18} className={getIconColor(template.color)} />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{template.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{template.description}</div>
                    <div className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
                      <span>✨ One-click insert</span>
                    </div>
                  </div>
                </div>
                
                {/* Preview indicator */}
                {selectedTemplate === template.id && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10 dark:to-white/5 pointer-events-none" />
                )}
              </button>
            )
          })}
        </div>

        <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <div className="text-[10px] text-gray-400 text-center">
            📋 Templates include: Pages, Articles, Blog posts, and Mixed layouts
          </div>
        </div>
      </div>
    </div>
  )
}

// ==================== FONT DROPDOWN ====================
const FontDropdown = ({ currentFont, onApplyFont, onClose }) => {
  const [fontSearch, setFontSearch] = useState('')
  const fontFamilies = [
    'Inter', 'Arial', 'Helvetica', 'Times New Roman', 'Georgia',
    'Courier New', 'Verdana', 'Roboto', 'Open Sans', 'Montserrat',
    'Playfair Display', 'Lato', 'Poppins', 'Nunito', 'Merriweather'
  ]

  const filteredFonts = useMemo(() => {
    return fontSearch 
      ? fontFamilies.filter(f => f.toLowerCase().includes(fontSearch.toLowerCase()))
      : fontFamilies
  }, [fontSearch])

  return (
    <div className="absolute top-full left-0 mt-1.5 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border z-[100] w-80 max-h-96 overflow-hidden">
      <div className="p-3 border-b bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search fonts..." 
            value={fontSearch} 
            onChange={(e) => setFontSearch(e.target.value)} 
            className="w-full pl-9 pr-3 py-2 text-sm border-0 rounded-lg bg-white dark:bg-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            autoFocus
          />
        </div>
      </div>
      <div className="max-h-80 overflow-y-auto p-2">
        {filteredFonts.map(font => (
          <button 
            key={font} 
            onClick={() => { onApplyFont(font); onClose() }} 
            className={`w-full text-left px-3 py-2 rounded-lg transition ${currentFont === font ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}
          >
            <span style={{ fontFamily: font }}>{font}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ==================== COLOR PICKER ====================
const ColorPickerDropdown = ({ colors, onSelectColor, onRemoveColor, title = "Text Color" }) => (
  <div className="absolute top-full left-0 mt-1.5 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border p-3 z-[100] w-80">
    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{title}</div>
    <div className="grid grid-cols-7 gap-1.5 mb-3">
      {colors.map(color => (
        <button 
          key={color} 
          onClick={() => onSelectColor(color)} 
          className="w-6 h-6 rounded-lg border dark:border-gray-600 hover:scale-110 transition-transform"
          style={{ backgroundColor: color }}
          aria-label={`Select color ${color}`}
        />
      ))}
    </div>
    <button onClick={onRemoveColor} className="text-xs text-red-500 hover:text-red-600 w-full text-center">
      Remove {title.toLowerCase()}
    </button>
  </div>
)

// ==================== TABLE DROPDOWN ====================
const TableDropdown = ({ onInsertTable, onTableControl }) => {
  const [previewRows, setPreviewRows] = useState(3)
  const [previewCols, setPreviewCols] = useState(3)
  
  const tablePresets = [
    { rows: 2, cols: 2, label: '2x2' }, { rows: 3, cols: 3, label: '3x3' },
    { rows: 3, cols: 4, label: '3x4' }, { rows: 4, cols: 4, label: '4x4' },
    { rows: 5, cols: 3, label: '5x3' }, { rows: 6, cols: 4, label: '6x4' },
  ]

  return (
    <div className="absolute top-full left-0 mt-1.5 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border z-[100] w-80 max-h-[500px] overflow-y-auto">
      <div className="p-3 border-b">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Quick Insert</div>
        <div className="grid grid-cols-3 gap-2">
          {tablePresets.map((preset) => (
            <button key={preset.label} onClick={() => onInsertTable(preset.rows, preset.cols)} className="py-2 px-3 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-purple-100 transition-all text-center">
              <div className="text-sm font-medium">{preset.label}</div>
              <div className="text-xs text-gray-500">{preset.rows} × {preset.cols}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="p-3 border-b">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Grid Selector</div>
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-2" onMouseLeave={() => { setPreviewRows(3); setPreviewCols(3) }}>
          <div className="grid grid-cols-6 gap-1 mb-2">
            {Array.from({ length: 36 }, (_, i) => {
              const row = Math.floor(i / 6) + 1
              const col = (i % 6) + 1
              const isActive = row <= previewRows && col <= previewCols
              return (
                <button key={i} onMouseEnter={() => { setPreviewRows(row); setPreviewCols(col) }} onClick={() => onInsertTable(row, col)} className={`aspect-square rounded transition-all ${isActive ? 'bg-purple-600 shadow-md scale-95' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300'}`} aria-label={`Insert ${row}x${col} table`} />
              )
            })}
          </div>
          <div className="text-center text-sm font-medium text-purple-600">{previewRows} × {previewCols}</div>
        </div>
      </div>

      <div className="p-3">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Table Controls</div>
        <div className="space-y-1">
          <button onClick={() => onTableControl('addRowBefore')} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-lg flex items-center gap-2"><Plus size={14} /> Add Row Above</button>
          <button onClick={() => onTableControl('addRowAfter')} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-lg flex items-center gap-2"><Plus size={14} /> Add Row Below</button>
          <button onClick={() => onTableControl('deleteRow')} className="w-full text-left px-3 py-2 text-sm hover:bg-red-50 text-red-600 rounded-lg flex items-center gap-2"><Trash2 size={14} /> Delete Row</button>
          <button onClick={() => onTableControl('addColumnBefore')} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-lg flex items-center gap-2"><Plus size={14} /> Add Column Left</button>
          <button onClick={() => onTableControl('addColumnAfter')} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-lg flex items-center gap-2"><Plus size={14} /> Add Column Right</button>
          <button onClick={() => onTableControl('deleteColumn')} className="w-full text-left px-3 py-2 text-sm hover:bg-red-50 text-red-600 rounded-lg flex items-center gap-2"><Trash2 size={14} /> Delete Column</button>
          <button onClick={() => onTableControl('toggleHeaderRow')} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-lg flex items-center gap-2"><Layout size={14} /> Toggle Header Row</button>
          <button onClick={() => onTableControl('mergeCells')} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-lg flex items-center gap-2"><Merge size={14} /> Merge Cells</button>
          <button onClick={() => onTableControl('splitCell')} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-lg flex items-center gap-2"><Split size={14} /> Split Cell</button>
          <button onClick={() => onTableControl('deleteTable')} className="w-full text-left px-3 py-2 text-sm hover:bg-red-50 text-red-600 rounded-lg flex items-center gap-2 font-semibold"><Trash2 size={14} /> Delete Table</button>
        </div>
      </div>
    </div>
  )
}

// ==================== CODE BLOCK DROPDOWN ====================
const CodeBlockDropdown = ({ editor, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('')
  
  const languages = [
    { value: 'javascript', label: 'JavaScript', icon: '📜' },
    { value: 'typescript', label: 'TypeScript', icon: '📘' },
    { value: 'python', label: 'Python', icon: '🐍' },
    { value: 'java', label: 'Java', icon: '☕' },
    { value: 'cpp', label: 'C++', icon: '⚙️' },
    { value: 'html', label: 'HTML', icon: '🌐' },
    { value: 'css', label: 'CSS', icon: '🎨' },
    { value: 'json', label: 'JSON', icon: '📊' },
    { value: 'sql', label: 'SQL', icon: '🗄️' },
    { value: 'bash', label: 'Bash', icon: '💻' },
    { value: 'yaml', label: 'YAML', icon: '📋' },
    { value: 'markdown', label: 'Markdown', icon: '📝' },
  ]

  const filteredLanguages = useMemo(() => {
    if (!searchTerm) return languages
    return languages.filter(lang => 
      lang.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lang.value.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [searchTerm])

  const insertCodeBlock = (language = null) => {
    if (language) {
      editor.chain().focus().setCodeBlock({ language: language.value }).run()
    } else {
      editor.chain().focus().setCodeBlock().run()
    }
    onClose()
  }

  return (
    <div className="absolute top-full left-0 mt-1.5 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border z-[100] w-80 overflow-hidden">
      <div className="p-3 border-b">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
          <Code2 size={12} /> Code Blocks
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search language..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700"
            autoFocus
          />
        </div>
      </div>

      <div className="max-h-80 overflow-y-auto p-2">
        <button onClick={() => insertCodeBlock()} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-lg flex items-center gap-2 mb-2 border-b">
          <Terminal size={14} />
          <span className="font-medium">Plain Text</span>
          <span className="text-xs text-gray-400 ml-auto">No language</span>
        </button>
        
        {filteredLanguages.map((lang) => (
          <button key={lang.value} onClick={() => insertCodeBlock(lang)} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-lg flex items-center gap-2 transition">
            <span className="text-lg">{lang.icon}</span>
            <span>{lang.label}</span>
            <span className="text-xs text-gray-400 ml-auto">{lang.value}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ==================== CALLOUT DROPDOWN ====================
const CalloutDropdown = ({ editor, onClose }) => {
  const [calloutTitle, setCalloutTitle] = useState('')
  const [showTitleInput, setShowTitleInput] = useState(false)

  const calloutTypes = [
    { id: 'note', label: 'Note', icon: MessageCircle, color: 'blue', bgColor: 'bg-blue-50 dark:bg-blue-950/30', borderColor: 'border-blue-500', iconColor: 'text-blue-500' },
    { id: 'tip', label: 'Tip', icon: Lightbulb, color: 'green', bgColor: 'bg-green-50 dark:bg-green-950/30', borderColor: 'border-green-500', iconColor: 'text-green-500' },
    { id: 'important', label: 'Important', icon: Star, color: 'purple', bgColor: 'bg-purple-50 dark:bg-purple-950/30', borderColor: 'border-purple-500', iconColor: 'text-purple-500' },
    { id: 'warning', label: 'Warning', icon: AlertTriangle, color: 'yellow', bgColor: 'bg-yellow-50 dark:bg-yellow-950/30', borderColor: 'border-yellow-500', iconColor: 'text-yellow-500' },
    { id: 'danger', label: 'Danger', icon: AlertCircle, color: 'red', bgColor: 'bg-red-50 dark:bg-red-950/30', borderColor: 'border-red-500', iconColor: 'text-red-500' },
    { id: 'info', label: 'Info', icon: Info, color: 'cyan', bgColor: 'bg-cyan-50 dark:bg-cyan-950/30', borderColor: 'border-cyan-500', iconColor: 'text-cyan-500' },
    { id: 'quote', label: 'Quote', icon: Quote, color: 'gray', bgColor: 'bg-gray-50 dark:bg-gray-900/50', borderColor: 'border-gray-500', iconColor: 'text-gray-500' },
  ]

  const insertCallout = (type) => {
    const callout = calloutTypes.find(t => t.id === type)
    const calloutId = generateId()
    
    const titleHtml = calloutTitle && showTitleInput 
      ? `<div class="callout-title"><span class="callout-title-icon">${getIconHtml(callout.icon)}</span><strong class="callout-title-text">${escapeHtml(calloutTitle)}</strong></div>`
      : `<div class="callout-title"><span class="callout-title-icon">${getIconHtml(callout.icon)}</span><strong class="callout-title-text">${callout.label}</strong></div>`
    
    const calloutHtml = `<div class="callout callout-${type}" data-callout-id="${calloutId}">${titleHtml}<div class="callout-content"><p></p></div></div>`
    editor.chain().focus().insertContent(calloutHtml).run()
    setCalloutTitle('')
    setShowTitleInput(false)
    onClose()
    showToast(`${callout.label} inserted`, 'success')
  }

  const getIconHtml = (Icon) => {
    return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`
  }

  const escapeHtml = (text) => {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }

  const insertBlockquote = () => {
    editor.chain().focus().toggleBlockquote().run()
    onClose()
  }

  return (
    <div className="absolute top-full left-0 mt-1.5 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border z-[100] w-96 max-h-[500px] overflow-hidden">
      <div className="p-3 border-b">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Insert Callout / Quote</div>
        
        <button onClick={insertBlockquote} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-lg flex items-center gap-3 mb-3 border">
          <Quote size={18} className="text-gray-500" />
          <div><div className="font-medium">Standard Blockquote</div><div className="text-xs text-gray-500">Simple quotation style</div></div>
        </button>
        
        <div className="mb-3">
          <label className="flex items-center gap-2 text-sm mb-2">
            <input type="checkbox" checked={showTitleInput} onChange={(e) => setShowTitleInput(e.target.checked)} className="rounded" />
            Add custom title
          </label>
          {showTitleInput && (
            <input type="text" value={calloutTitle} onChange={(e) => setCalloutTitle(e.target.value)} placeholder="Enter callout title..." className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" autoFocus />
          )}
        </div>
        
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Callout Types</div>
      </div>
      
      <div className="max-h-80 overflow-y-auto p-2">
        <div className="grid grid-cols-2 gap-2">
          {calloutTypes.map((type) => {
            const Icon = type.icon
            return (
              <button key={type.id} onClick={() => insertCallout(type.id)} className={`p-3 rounded-lg transition-all text-left hover:shadow-md ${type.bgColor} border-l-4 ${type.borderColor}`}>
                <div className="flex items-center gap-2 mb-1"><Icon size={16} className={type.iconColor} /><span className={`font-medium text-sm ${type.iconColor}`}>{type.label}</span></div>
                <div className="text-xs text-gray-600 dark:text-gray-400">{getCalloutDescription(type.id)}</div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

const getCalloutDescription = (id) => {
  const descriptions = {
    note: 'General information',
    tip: 'Helpful advice',
    warning: 'Be careful',
    danger: 'Serious warning',
    info: 'Additional info',
    quote: 'Cited text',
    important: 'Critical info'
  }
  return descriptions[id] || ''
}

// ==================== LIST ALIGNMENT DROPDOWN ====================
const ListAlignmentDropdown = ({ editor, onClose }) => {
  const setListAlignment = (alignment) => {
    editor.chain().focus().setTextAlign(alignment).run()
    onClose()
  }

  return (
    <div className="absolute top-full left-0 mt-1.5 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border p-2 z-[100] w-44">
      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">Align List Items</div>
      <button onClick={() => setListAlignment('left')} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-lg flex items-center gap-3"><AlignLeft size={16} /> Left Align</button>
      <button onClick={() => setListAlignment('center')} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-lg flex items-center gap-3"><AlignCenter size={16} /> Center Align</button>
      <button onClick={() => setListAlignment('right')} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-lg flex items-center gap-3"><AlignRight size={16} /> Right Align</button>
    </div>
  )
}

// ==================== MAIN TOOLBAR COMPONENT ====================
const Toolbar = ({ 
  editor, 
  onSave, 
  onSchedule, 
  onPublish, 
  onPreview, 
  onImageInsert,
  onGalleryInsert,
  onVideoInsert,
  onEmbedInsert,
  onAudioInsert,
  onPDFInsert,
  wordCount = 0, 
  readingTime = 1, 
  seoScore = 0,
  showRightBlock = false,
  onToggleRightBlock = null,
  grammarlyEnabled = true,
  onToggleGrammarly = null
}) => {
  const [activeDropdown, setActiveDropdown] = useState(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [currentFont, setCurrentFont] = useState('Inter')
  const [currentFontSize, setCurrentFontSize] = useState('16')
  const [editMode, setEditMode] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState(null)
  const [selectedMediaForControls, setSelectedMediaForControls] = useState(null)
  const [showMediaControls, setShowMediaControls] = useState(false)
  
  const [showImageModal, setShowImageModal] = useState(false)
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [showAudioModal, setShowAudioModal] = useState(false)
  const [showPDFModal, setShowPDFModal] = useState(false)
  const [showEmbedModal, setShowEmbedModal] = useState(false)
  const [showGalleryModal, setShowGalleryModal] = useState(false)
  
  const dropdownRefs = {
    font: useRef(null), size: useRef(null), color: useRef(null), highlight: useRef(null),
    table: useRef(null), listAlign: useRef(null), more: useRef(null), view: useRef(null),
    heading: useRef(null), codeBlock: useRef(null), callout: useRef(null), templates: useRef(null)
  }

  const fontSizes = [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 32, 36, 40, 48, 56, 64, 72]
  const colors = ['#000000', '#E53935', '#D81B60', '#8E24AA', '#5E35B1', '#3949AB', '#1E88E5', '#039BE5', '#00ACC1', '#00897B', '#43A047', '#7CB342', '#C0CA33', '#FDD835', '#FFB300', '#FB8C00', '#F4511E', '#795548', '#757575', '#607D8B', '#FFFFFF']
  const highlightColors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#F0E68C']

  // Detect media selection for MediaControls
  useEffect(() => {
    if (!editor) return

    const updateSelection = () => {
      try {
        const { state } = editor
        const { from } = state.selection
        const node = state.doc.nodeAt(from)
        
        if (node && (node.type.name === 'embed' || node.type.name === 'video' || 
                     node.type.name === 'image' || node.type.name === 'audio' || 
                     node.type.name === 'pdf')) {
          setSelectedMediaForControls({
            type: node.type.name,
            attrs: { ...node.attrs },
            pos: from
          })
          setShowMediaControls(true)
        } else {
          if (!editMode) {
            setSelectedMediaForControls(null)
            setShowMediaControls(false)
          }
        }
      } catch (error) {
        console.error('Selection detection error:', error)
      }
    }

    editor.on('selectionUpdate', updateSelection)
    updateSelection()

    return () => {
      editor.off('selectionUpdate', updateSelection)
    }
  }, [editor, editMode])

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      Object.entries(dropdownRefs).forEach(([key, ref]) => {
        if (ref.current && !ref.current.contains(event.target)) {
          if (activeDropdown === key) setActiveDropdown(null)
        }
      })
      if (showEmojiPicker) setShowEmojiPicker(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [activeDropdown, showEmojiPicker])

  // Fullscreen handler
  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  // Clear media controls
  const clearMediaControls = useCallback(() => {
    setSelectedMediaForControls(null)
    setShowMediaControls(false)
  }, [])

  // Handle media edit from MediaControls
  const handleMediaEdit = useCallback((type, attrs) => {
    setSelectedMedia({ type, attrs })
    
    switch(type) {
      case 'image':
        setShowImageModal(true)
        break
      case 'video':
        setShowVideoModal(true)
        break
      case 'embed':
        setShowEmbedModal(true)
        break
      case 'gallery':
        setShowGalleryModal(true)
        break
      case 'audio':
        setShowAudioModal(true)
        break
      case 'pdf':
        setShowPDFModal(true)
        break
      default:
        showToast(`Edit ${type}`, 'info')
    }
  }, [])

  // Toggle edit mode
  const toggleEditMode = useCallback(() => {
    setEditMode(!editMode)
    if (editMode) {
      clearMediaControls()
    }
  }, [editMode, clearMediaControls])

  // ==================== EDIT MODE HANDLER ====================
  const handleEditModeClick = useCallback((event) => {
    if (!editor || !editMode) return

    setTimeout(() => {
      try {
        const { state } = editor
        const { selection } = state
        const { $from } = selection
        
        let node = $from.node()
        
        if (!node && $from.parent) {
          node = $from.parent
        }
        
        if (node && node.type) {
          const nodeType = node.type.name
          const attrs = node.attrs || {}
          
          setSelectedMedia({ node, type: nodeType, attrs })
          
          if (['image', 'video', 'embed', 'gallery', 'audio', 'pdf'].includes(nodeType)) {
            setSelectedMediaForControls({
              type: nodeType,
              attrs: { ...attrs },
              pos: $from.pos
            })
            setShowMediaControls(true)
          }
          
          if (nodeType === 'image') {
            setShowImageModal(true)
            setActiveDropdown(null)
            showToast('Edit image', 'info')
          } else if (nodeType === 'video') {
            setShowVideoModal(true)
            setActiveDropdown(null)
            showToast('Edit video', 'info')
          } else if (nodeType === 'embed') {
            setShowEmbedModal(true)
            setActiveDropdown(null)
            showToast('Edit embed', 'info')
          } else if (nodeType === 'gallery') {
            setShowGalleryModal(true)
            setActiveDropdown(null)
            showToast('Edit gallery', 'info')
          } else if (nodeType === 'audio') {
            setShowAudioModal(true)
            setActiveDropdown(null)
            showToast('Edit audio', 'info')
          } else if (nodeType === 'pdf') {
            setShowPDFModal(true)
            setActiveDropdown(null)
            showToast('Edit PDF', 'info')
          }
        } else {
          const domNode = event.target
          if (domNode && domNode.nodeType === Node.ELEMENT_NODE) {
            const mediaType = domNode.getAttribute('data-media-type')
            if (mediaType && ['image', 'video', 'embed', 'gallery', 'audio', 'pdf'].includes(mediaType)) {
              setSelectedMedia({ domNode, type: mediaType })
              setSelectedMediaForControls({ type: mediaType, attrs: {}, pos: null })
              setShowMediaControls(true)
              
              if (mediaType === 'image') setShowImageModal(true)
              else if (mediaType === 'video') setShowVideoModal(true)
              else if (mediaType === 'embed') setShowEmbedModal(true)
              else if (mediaType === 'gallery') setShowGalleryModal(true)
              else if (mediaType === 'audio') setShowAudioModal(true)
              else if (mediaType === 'pdf') setShowPDFModal(true)
              
              setActiveDropdown(null)
              showToast(`Edit ${mediaType}`, 'info')
            }
          }
        }
      } catch (error) {
        console.error('Error in edit mode click handler:', error)
        showToast('Failed to edit media', 'error')
      }
    }, 10)
  }, [editor, editMode])

  // Add edit mode event listener
  useEffect(() => {
    if (!editor) return

    const editorElement = editor.view.dom
    
    if (editMode) {
      editorElement.addEventListener('click', handleEditModeClick)
      editorElement.style.cursor = 'cell'
    } else {
      editorElement.removeEventListener('click', handleEditModeClick)
      editorElement.style.cursor = ''
    }

    return () => {
      editorElement.removeEventListener('click', handleEditModeClick)
      editorElement.style.cursor = ''
    }
  }, [editor, editMode, handleEditModeClick])

  if (!editor) return null

  // ==================== MEDIA HANDLERS ====================
  const handleImageUpload = (imageData) => {
    if (onImageInsert) {
      onImageInsert(imageData)
    } else {
      const imageHtml = `<img src="${imageData.src || imageData.url}" alt="${imageData.alt || 'Image'}" class="editor-image" data-media-type="image" data-id="${generateId()}" />`
      editor.chain().focus().insertContent(imageHtml).run()
      showToast('Image inserted successfully', 'success')
    }
    setShowImageModal(false)
    setSelectedMedia(null)
    clearMediaControls()
  }

  const handleVideoUpload = (videoData) => {
    if (onVideoInsert) {
      onVideoInsert(videoData)
    } else {
      const videoId = generateId()
      const videoHtml = `<div class="video-wrapper" data-media-type="video" data-id="${videoId}">
        <video controls src="${videoData.src || videoData.url}" poster="${videoData.poster || ''}">
          <source src="${videoData.src || videoData.url}" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>`
      editor.chain().focus().insertContent(videoHtml).run()
      showToast('Video inserted successfully', 'success')
    }
    setShowVideoModal(false)
    setSelectedMedia(null)
    clearMediaControls()
  }

  const handleEmbedUpload = (embedData) => {
    if (onEmbedInsert) {
      onEmbedInsert(embedData)
    } else {
      const embedId = generateId()
      const embedHtml = `<div class="embed-wrapper" data-media-type="embed" data-id="${embedId}">
        ${embedData.html || `<iframe src="${embedData.url}" frameborder="0" allowfullscreen title="${embedData.title || 'Embed content'}"></iframe>`}
      </div>`
      editor.chain().focus().insertContent(embedHtml).run()
      showToast('Embed inserted successfully', 'success')
    }
    setShowEmbedModal(false)
    setSelectedMedia(null)
    clearMediaControls()
  }

  const handleGalleryInsert = (galleryData) => {
    if (onGalleryInsert) {
      onGalleryInsert(galleryData)
    } else {
      const galleryId = generateId()
      const galleryHtml = `<div class="gallery-wrapper" data-media-type="gallery" data-id="${galleryId}">
        <div class="gallery-grid">
          ${galleryData.media?.map(item => {
            if (item.type === 'video') {
              return `<video src="${item.src}" controls class="gallery-video"></video>`
            }
            return `<img src="${item.src}" alt="${item.alt || 'Gallery image'}" class="gallery-image" />`
          }).join('') || galleryData.images?.map(img => `<img src="${img.url || img.src}" alt="${img.alt || 'Gallery image'}" class="gallery-image" />`).join('')}
        </div>
      </div>`
      editor.chain().focus().insertContent(galleryHtml).run()
      showToast('Gallery inserted successfully', 'success')
    }
    setShowGalleryModal(false)
    clearMediaControls()
  }

  const handleAudioUpload = (audioData) => { 
    if (onAudioInsert) {
      onAudioInsert(audioData)
    } else if (audioData.html) {
      editor.chain().focus().insertContent(audioData.html).run()
      showToast('Audio inserted successfully', 'success')
    }
    setShowAudioModal(false) 
  }
  
  const handlePDFUpload = (pdfData) => { 
    if (onPDFInsert) {
      onPDFInsert(pdfData)
    } else if (pdfData.html) {
      editor.chain().focus().insertContent(pdfData.html).run()
      showToast('PDF inserted successfully', 'success')
    }
    setShowPDFModal(false) 
  }

  // ==================== TEXT FORMATTING HANDLERS ====================
  const applyFontFamily = (font) => { 
    setCurrentFont(font)
    editor.chain().focus().setMark('textStyle', { fontFamily: font }).run()
    setActiveDropdown(null)
    showToast(`Font changed to ${font}`, 'info')
  }
  
  const applyFontSize = (size) => { 
    setCurrentFontSize(size)
    editor.chain().focus().setMark('textStyle', { fontSize: `${size}px` }).run()
    setActiveDropdown(null)
  }
  
  const setTextColor = (color) => { 
    editor.chain().focus().setColor(color).run()
    setActiveDropdown(null)
  }
  
  const removeTextColor = () => { 
    editor.chain().focus().unsetColor().run()
    setActiveDropdown(null)
  }
  
  const setHighlight = (color) => { 
    editor.chain().focus().toggleHighlight({ color }).run()
    setActiveDropdown(null)
  }
  
  const removeHighlight = () => { 
    editor.chain().focus().unsetHighlight().run()
    setActiveDropdown(null)
  }
  
  const clearFormatting = () => { 
    editor.chain().focus().clearNodes().unsetAllMarks().run()
    showToast('Formatting cleared', 'info')
  }
  
  const setLink = () => { 
    const url = prompt('Enter URL:', 'https://')
    if (url && url !== 'https://') {
      editor.chain().focus().setLink({ href: url }).run()
      showToast('Link added', 'success')
    }
  }
  
  const unsetLink = () => {
    editor.chain().focus().unsetLink().run()
    showToast('Link removed', 'info')
  }
  
  const setAlignment = (alignment) => editor.chain().focus().setTextAlign(alignment).run()
  const insertHorizontalRule = () => editor.chain().focus().setHorizontalRule().run()
  const toggleBulletList = () => editor.chain().focus().toggleBulletList().run()
  const toggleOrderedList = () => editor.chain().focus().toggleOrderedList().run()
  const toggleTaskList = () => editor.chain().focus().toggleTaskList().run()
  
  const insertTable = (rows, cols) => { 
    editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run()
    setActiveDropdown(null)
    showToast(`Inserted ${rows}x${cols} table`, 'success')
  }
  
  const handleTableControl = (action) => {
    const actions = { 
      addRowBefore: () => editor.chain().focus().addRowBefore().run(), 
      addRowAfter: () => editor.chain().focus().addRowAfter().run(), 
      deleteRow: () => editor.chain().focus().deleteRow().run(), 
      addColumnBefore: () => editor.chain().focus().addColumnBefore().run(), 
      addColumnAfter: () => editor.chain().focus().addColumnAfter().run(), 
      deleteColumn: () => editor.chain().focus().deleteColumn().run(), 
      mergeCells: () => editor.chain().focus().mergeCells().run(), 
      splitCell: () => editor.chain().focus().splitCell().run(), 
      toggleHeaderRow: () => editor.chain().focus().toggleHeaderRow().run(), 
      deleteTable: () => editor.chain().focus().deleteTable().run() 
    }
    actions[action]?.()
    setActiveDropdown(null)
    showToast(`Table: ${action.replace(/([A-Z])/g, ' $1').toLowerCase()}`, 'info')
  }

  const onEmojiClick = (emojiObject) => { 
    editor.chain().focus().insertContent(emojiObject.emoji).run()
    setShowEmojiPicker(false)
  }
  
  const toggleFullscreen = () => { 
    const el = document.querySelector('.ProseMirror')
    if (!document.fullscreenElement) {
      el?.requestFullscreen()
      showToast('Fullscreen mode', 'info')
    } else {
      document.exitFullscreen()
    }
  }
  
  const copyHtml = () => { 
    navigator.clipboard.writeText(editor.getHTML())
    showToast('HTML copied to clipboard', 'success')
  }
  
  const selectAll = () => editor.commands.selectAll()

  const getSeoScoreColor = () => { 
    if (seoScore >= 80) return 'text-green-500'
    if (seoScore >= 60) return 'text-yellow-500'
    return 'text-red-500'
  }
  
  const getCurrentHeading = () => { 
    if (editor.isActive('heading', { level: 1 })) return 'H1'
    if (editor.isActive('heading', { level: 2 })) return 'H2'
    if (editor.isActive('heading', { level: 3 })) return 'H3'
    return 'Normal'
  }
  
  const setHeading = (level) => { 
    if (level === 0) editor.chain().focus().setParagraph().run()
    else editor.chain().focus().toggleHeading({ level }).run()
    setActiveDropdown(null)
  }

  const headingOptions = [
    { label: 'Normal', level: 0 },
    { label: 'Heading 1', level: 1 },
    { label: 'Heading 2', level: 2 },
    { label: 'Heading 3', level: 3 }
  ]

  return (
    <>
      <div className={`bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 transition-all duration-300 ${isCollapsed ? 'py-1' : 'py-2'} px-4 sticky top-0 z-40 shadow-sm`}>
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)} 
          className="absolute -right-3 top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-800 border rounded-full p-1 shadow-md hover:shadow-lg z-50 transition-all hover:scale-110"
          aria-label={isCollapsed ? 'Expand toolbar' : 'Collapse toolbar'}
        >
          {isCollapsed ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
        </button>

        {!isCollapsed ? (
          <div className="flex flex-wrap items-center gap-1">
            {/* TEMPLATES DROPDOWN - NEW FEATURE */}
            <div className="relative" ref={dropdownRefs.templates}>
              <button 
                onClick={() => setActiveDropdown(activeDropdown === 'templates' ? null : 'templates')}
                className="h-9 px-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium flex items-center gap-2 transition-all hover:shadow-md hover:scale-105"
                title="Insert Content Templates"
              >
                <FileStack size={14} />
                Templates
                <ChevronDown size={14} className="text-white/70" />
              </button>
              {activeDropdown === 'templates' && (
                <TemplatesDropdown editor={editor} onClose={() => setActiveDropdown(null)} />
              )}
            </div>

            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

            {/* Heading Dropdown */}
            <div className="relative" ref={dropdownRefs.heading}>
              <button 
                onClick={() => setActiveDropdown(activeDropdown === 'heading' ? null : 'heading')}
                className="h-9 px-3 rounded-lg bg-gray-50 text-sm font-medium hover:bg-gray-100 flex items-center gap-1.5 transition-colors"
              >
                {getCurrentHeading()} <ChevronDown size={14} className="text-gray-400" />
              </button>
              {activeDropdown === 'heading' && (
                <div className="absolute top-full left-0 mt-1.5 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border p-1.5 z-[100] min-w-[140px]">
                  {headingOptions.map(h => (
                    <button 
                      key={h.label} 
                      onClick={() => setHeading(h.level)} 
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        (h.level === 0 && getCurrentHeading() === 'Normal') ||
                        (h.level > 0 && editor.isActive('heading', { level: h.level }))
                          ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-600'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {h.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

            {/* Text Formatting Buttons */}
            <div className="flex items-center gap-0.5 bg-gray-50 dark:bg-gray-800 rounded-lg p-0.5">
              <button onClick={() => editor.chain().focus().toggleBold().run()} className={`p-1.5 rounded-md transition-all ${editor.isActive('bold') ? 'bg-gray-900 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`} title="Bold (Ctrl+B)"><Bold size={16} /></button>
              <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-1.5 rounded-md transition-all ${editor.isActive('italic') ? 'bg-gray-900 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`} title="Italic (Ctrl+I)"><Italic size={16} /></button>
              <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={`p-1.5 rounded-md transition-all ${editor.isActive('underline') ? 'bg-gray-900 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`} title="Underline (Ctrl+U)"><Underline size={16} /></button>
              <button onClick={() => editor.chain().focus().toggleStrike().run()} className={`p-1.5 rounded-md transition-all ${editor.isActive('strike') ? 'bg-gray-900 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`} title="Strikethrough"><Strikethrough size={16} /></button>
              <button onClick={() => editor.chain().focus().toggleCode().run()} className={`p-1.5 rounded-md transition-all ${editor.isActive('code') ? 'bg-gray-900 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`} title="Inline Code"><Code size={16} /></button>
            </div>

            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />
            
            <button onClick={clearFormatting} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-red-500 transition-colors" title="Clear Formatting"><X size={16} /></button>
            
            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

            {/* Font Family Dropdown */}
            <div className="relative" ref={dropdownRefs.font}>
              <button onClick={() => setActiveDropdown(activeDropdown === 'font' ? null : 'font')} className="h-9 px-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 text-sm font-medium flex items-center gap-2 border border-purple-200 dark:border-purple-800 transition-all hover:shadow-md">
                <Sparkles size={14} className="text-purple-500" />
                <span className="max-w-[120px] truncate">{currentFont}</span>
                <ChevronDown size={14} className="text-purple-400" />
              </button>
              {activeDropdown === 'font' && <FontDropdown currentFont={currentFont} onApplyFont={applyFontFamily} onClose={() => setActiveDropdown(null)} />}
            </div>

            {/* Font Size Dropdown */}
            <div className="relative" ref={dropdownRefs.size}>
              <button onClick={() => setActiveDropdown(activeDropdown === 'size' ? null : 'size')} className="h-9 px-3 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm font-medium flex items-center gap-1.5 transition-colors hover:bg-gray-100">
                <Type size={14} /><span className="font-mono">{currentFontSize}px</span><ChevronDown size={14} className="text-gray-400" />
              </button>
              {activeDropdown === 'size' && (
                <div className="absolute top-full left-0 mt-1.5 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border p-2 z-[100] w-64 max-h-80 overflow-y-auto">
                  <div className="grid grid-cols-5 gap-1">
                    {fontSizes.map(size => (
                      <button key={size} onClick={() => applyFontSize(size)} className={`px-2 py-2 text-center rounded-lg text-sm font-mono transition-colors ${currentFontSize === size.toString() ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600' : 'hover:bg-gray-100'}`}>{size}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Color Picker */}
            <div className="relative" ref={dropdownRefs.color}>
              <button onClick={() => setActiveDropdown(activeDropdown === 'color' ? null : 'color')} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" title="Text Color"><Palette size={16} /></button>
              {activeDropdown === 'color' && <ColorPickerDropdown colors={colors} onSelectColor={setTextColor} onRemoveColor={removeTextColor} title="Text Color" />}
            </div>

            {/* Highlighter */}
            <div className="relative" ref={dropdownRefs.highlight}>
              <button onClick={() => setActiveDropdown(activeDropdown === 'highlight' ? null : 'highlight')} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" title="Highlight Text"><Highlighter size={16} /></button>
              {activeDropdown === 'highlight' && <ColorPickerDropdown colors={highlightColors} onSelectColor={setHighlight} onRemoveColor={removeHighlight} title="Highlight Color" />}
            </div>

            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

            {/* Alignment Buttons */}
            <div className="flex items-center gap-0.5 bg-gray-50 dark:bg-gray-800 rounded-lg p-0.5">
              <button onClick={() => setAlignment('left')} className={`p-1.5 rounded-md transition-all ${editor.isActive({ textAlign: 'left' }) ? 'bg-gray-900 text-white' : 'hover:bg-gray-200'}`} title="Align Left"><AlignLeft size={16} /></button>
              <button onClick={() => setAlignment('center')} className={`p-1.5 rounded-md transition-all ${editor.isActive({ textAlign: 'center' }) ? 'bg-gray-900 text-white' : 'hover:bg-gray-200'}`} title="Align Center"><AlignCenter size={16} /></button>
              <button onClick={() => setAlignment('right')} className={`p-1.5 rounded-md transition-all ${editor.isActive({ textAlign: 'right' }) ? 'bg-gray-900 text-white' : 'hover:bg-gray-200'}`} title="Align Right"><AlignRight size={16} /></button>
              <button onClick={() => setAlignment('justify')} className={`p-1.5 rounded-md transition-all ${editor.isActive({ textAlign: 'justify' }) ? 'bg-gray-900 text-white' : 'hover:bg-gray-200'}`} title="Justify"><AlignJustify size={16} /></button>
            </div>

            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

            {/* List Buttons */}
            <div className="flex items-center gap-0.5 bg-gray-50 dark:bg-gray-800 rounded-lg p-0.5">
              <button onClick={toggleBulletList} className={`p-1.5 rounded-md transition-all ${editor.isActive('bulletList') ? 'bg-gray-900 text-white' : 'hover:bg-gray-200'}`} title="Bullet List"><List size={16} /></button>
              <button onClick={toggleOrderedList} className={`p-1.5 rounded-md transition-all ${editor.isActive('orderedList') ? 'bg-gray-900 text-white' : 'hover:bg-gray-200'}`} title="Numbered List"><ListOrdered size={16} /></button>
              <button onClick={toggleTaskList} className={`p-1.5 rounded-md transition-all ${editor.isActive('taskList') ? 'bg-gray-900 text-white' : 'hover:bg-gray-200'}`} title="Task List"><CheckSquare size={16} /></button>
            </div>

            <div className="relative" ref={dropdownRefs.listAlign}>
              <button onClick={() => setActiveDropdown(activeDropdown === 'listAlign' ? null : 'listAlign')} className="p-1.5 rounded-lg hover:bg-gray-100 flex items-center gap-1" title="List Alignment"><AlignLeft size={16} /><ChevronDown size={12} /></button>
              {activeDropdown === 'listAlign' && <ListAlignmentDropdown editor={editor} onClose={() => setActiveDropdown(null)} />}
            </div>

            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

            {/* Block Elements */}
            <button onClick={() => editor.chain().focus().toggleBlockquote().run()} className={`p-1.5 rounded-md transition-all hover:bg-gray-100 ${editor.isActive('blockquote') ? 'bg-gray-200' : ''}`} title="Blockquote"><Quote size={16} /></button>
            <button onClick={() => editor.chain().focus().setParagraph().run()} className="p-1.5 rounded-md hover:bg-gray-100 transition-colors" title="Paragraph"><Pilcrow size={16} /></button>
            <button onClick={insertHorizontalRule} className="p-1.5 rounded-md hover:bg-gray-100 transition-colors" title="Horizontal Rule"><Minus size={16} /></button>

            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

            {/* Code Block Dropdown */}
            <div className="relative" ref={dropdownRefs.codeBlock}>
              <button onClick={() => setActiveDropdown(activeDropdown === 'codeBlock' ? null : 'codeBlock')} className={`p-1.5 rounded-lg hover:bg-gray-100 transition-all ${editor.isActive('codeBlock') ? 'bg-purple-100 text-purple-600' : ''}`} title="Code Block"><Code2 size={16} /></button>
              {activeDropdown === 'codeBlock' && <CodeBlockDropdown editor={editor} onClose={() => setActiveDropdown(null)} />}
            </div>

            {/* Callout Dropdown */}
            <div className="relative" ref={dropdownRefs.callout}>
              <button onClick={() => setActiveDropdown(activeDropdown === 'callout' ? null : 'callout')} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" title="Insert Callout"><MessageCircle size={16} /></button>
              {activeDropdown === 'callout' && <CalloutDropdown editor={editor} onClose={() => setActiveDropdown(null)} />}
            </div>

            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

            {/* Table Dropdown */}
            <div className="relative" ref={dropdownRefs.table}>
              <button onClick={() => setActiveDropdown(activeDropdown === 'table' ? null : 'table')} className="p-1.5 rounded-lg hover:bg-gray-100 flex items-center gap-1" title="Insert Table"><TableIcon size={16} /><ChevronDown size={12} /></button>
              {activeDropdown === 'table' && <TableDropdown onInsertTable={insertTable} onTableControl={handleTableControl} />}
            </div>

            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

            {/* Link Buttons */}
            <button onClick={setLink} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" title="Insert Link (Ctrl+K)"><LinkIcon size={16} /></button>
            <button onClick={unsetLink} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" title="Remove Link"><Unlink size={16} /></button>

            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

            {/* Media Insert Button */}
            <div className="relative" ref={dropdownRefs.more}>
              <button onClick={() => setActiveDropdown(activeDropdown === 'more' ? null : 'more')} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" title="Insert Media"><Plus size={16} /></button>
              {activeDropdown === 'more' && (
                <div className="absolute top-full left-0 mt-1.5 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border p-2 z-[100] w-52">
                  <button onClick={() => { setShowImageModal(true); setActiveDropdown(null); }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-lg flex items-center gap-2"><Image size={14} /> Image</button>
                  <button onClick={() => { setShowVideoModal(true); setActiveDropdown(null); }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-lg flex items-center gap-2"><Video size={14} /> Video</button>
                  <button onClick={() => { setShowAudioModal(true); setActiveDropdown(null); }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-lg flex items-center gap-2"><Music size={14} /> Audio</button>
                  <button onClick={() => { setShowPDFModal(true); setActiveDropdown(null); }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-lg flex items-center gap-2"><File size={14} /> PDF</button>
                  <div className="border-t my-1"></div>
                  <button onClick={() => { setShowGalleryModal(true); setActiveDropdown(null); }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-lg flex items-center gap-2"><LayoutGrid size={14} /> Gallery</button>
                  <div className="border-t my-1"></div>
                  <button onClick={() => { setShowEmbedModal(true); setActiveDropdown(null); }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-lg flex items-center gap-2"><Code size={14} /> Embed</button>
                </div>
              )}
            </div>

            {/* RIGHT BLOCK TOGGLE BUTTON */}
            {onToggleRightBlock && (
              <button
                onClick={onToggleRightBlock}
                className={`p-1.5 rounded-lg transition-all ${
                  showRightBlock 
                    ? 'bg-purple-600 text-white shadow-md' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600'
                }`}
                title={showRightBlock ? "Hide Right Block Panel" : "Show Right Block Panel"}
              >
                {showRightBlock ? <PanelRightClose size={16} /> : <PanelRight size={16} />}
              </button>
            )}

            {/* GRAMMARLY TOGGLE BUTTON */}
            {onToggleGrammarly && (
              <button
                onClick={onToggleGrammarly}
                className={`p-1.5 rounded-lg transition-all ${
                  grammarlyEnabled 
                    ? 'bg-green-600 text-white shadow-md' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600'
                }`}
                title={grammarlyEnabled ? "Disable Grammarly" : "Enable Grammarly"}
              >
                <SpellCheck size={16} />
              </button>
            )}

            {/* EDIT MODE BUTTON */}
            <button onClick={toggleEditMode} className={`p-1.5 rounded-lg transition-all duration-200 ${editMode ? 'bg-purple-600 text-white shadow-lg scale-105' : 'hover:bg-gray-100'}`} title={editMode ? "Exit Edit Mode" : "Enter Edit Mode"}>{editMode ? <Check size={16} /> : <Edit2 size={16} />}</button>

            {/* Emoji Picker */}
            <div className="relative">
              <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" title="Insert Emoji"><Smile size={16} /></button>
              {showEmojiPicker && <div className="absolute top-full left-0 mt-1 z-[100]"><EmojiPicker onEmojiClick={onEmojiClick} /></div>}
            </div>

            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

            {/* Utility Buttons */}
            <button onClick={selectAll} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" title="Select All"><Copy size={16} /></button>
            <button onClick={copyHtml} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" title="Copy HTML"><Code size={16} /></button>

            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

            {/* Undo/Redo */}
            <button onClick={() => editor.chain().focus().undo().run()} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" title="Undo"><Undo size={16} /></button>
            <button onClick={() => editor.chain().focus().redo().run()} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" title="Redo"><Redo size={16} /></button>

            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

            {/* View Options */}
            <div className="relative" ref={dropdownRefs.view}>
              <button onClick={() => setActiveDropdown(activeDropdown === 'view' ? null : 'view')} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" title="View Options"><Eye size={16} /></button>
              {activeDropdown === 'view' && (
                <div className="absolute top-full left-0 mt-1.5 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border p-2 z-[100] w-48">
                  <button onClick={toggleFullscreen} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-lg flex items-center gap-2">{isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />} {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</button>
                </div>
              )}
            </div>

            {/* Stats Display */}
            <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs ml-2">
              <FileText size={12} className="text-gray-500" /><span className="font-mono">{wordCount.toLocaleString()}</span>
              <span className="text-gray-300">|</span><Clock size={12} className="text-gray-500" /><span className="font-mono">{readingTime}m</span>
              <span className="text-gray-300">|</span><TrendingUp size={12} className={getSeoScoreColor()} /><span className={`font-mono ${getSeoScoreColor()}`}>{seoScore}%</span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 ml-auto">
              <button onClick={onSave} className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm hover:bg-gray-200"><Save size={14} /> Save</button>
              <button onClick={onSchedule} className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm hover:bg-gray-200"><Calendar size={14} /> Schedule</button>
              <button onClick={onPreview} className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm hover:bg-gray-200"><Eye size={14} /> Preview</button>
              <button onClick={onPublish} className="flex items-center gap-2 px-4 py-1.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800"><Send size={14} /> Publish</button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-3">
            <button onClick={() => setIsCollapsed(false)} className="p-1 hover:bg-gray-100 rounded"><Maximize2 size={16} /></button>
            <div className="text-xs text-gray-500 font-mono">{wordCount.toLocaleString()} words</div>
            <div className="text-xs text-gray-500 font-mono">{readingTime} min read</div>
            <div className={`text-xs font-mono ${getSeoScoreColor()}`}>{seoScore}% SEO</div>
            <button onClick={toggleEditMode} className={`p-1 rounded ${editMode ? 'text-purple-600' : 'text-gray-500'}`}><Edit2 size={14} /></button>
          </div>
        )}
      </div>

      {/* Media Controls Bar */}
      {showMediaControls && selectedMediaForControls && !isCollapsed && (
        <div className="sticky top-[57px] z-30 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-b border-purple-200 dark:border-purple-800 px-4 py-2 shadow-sm">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <MediaControls editor={editor} onEdit={handleMediaEdit} className="mx-auto" />
            <button onClick={clearMediaControls} className="p-1.5 hover:bg-purple-200 dark:hover:bg-purple-800 rounded-full"><X size={16} className="text-purple-600" /></button>
          </div>
        </div>
      )}

      {/* Edit Mode Indicator */}
      {editMode && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 bg-purple-600 text-white px-5 py-2.5 rounded-full shadow-lg flex items-center gap-3 animate-bounce">
          <Edit2 size={18} />
          <span className="text-sm font-medium">Edit Mode Active - Click any media to edit</span>
          <button onClick={toggleEditMode} className="ml-2 p-1 hover:bg-purple-500 rounded-full"><X size={14} /></button>
        </div>
      )}

      {/* Modals */}
      <ImageModal isOpen={showImageModal} onClose={() => { setShowImageModal(false); setSelectedMedia(null); }} onUpload={handleImageUpload} initialData={selectedMedia?.attrs} />
      <VideoModal isOpen={showVideoModal} onClose={() => { setShowVideoModal(false); setSelectedMedia(null); }} onUpload={handleVideoUpload} initialData={selectedMedia?.attrs} />
      <AudioModal isOpen={showAudioModal} onClose={() => setShowAudioModal(false)} onUpload={handleAudioUpload} />
      <PDFModal isOpen={showPDFModal} onClose={() => setShowPDFModal(false)} onUpload={handlePDFUpload} />
      <EmbedModal isOpen={showEmbedModal} onClose={() => { setShowEmbedModal(false); setSelectedMedia(null); }} onUpload={handleEmbedUpload} initialData={selectedMedia?.attrs} />
      <GalleryModal isOpen={showGalleryModal} onClose={() => { setShowGalleryModal(false); setSelectedMedia(null); }} onInsert={handleGalleryInsert} initialData={selectedMedia?.attrs} />
    </>
  )
}

Toolbar.propTypes = {
  editor: PropTypes.object,
  onSave: PropTypes.func.isRequired,
  onSchedule: PropTypes.func.isRequired,
  onPublish: PropTypes.func.isRequired,
  onPreview: PropTypes.func.isRequired,
  onImageInsert: PropTypes.func,
  onGalleryInsert: PropTypes.func,
  onVideoInsert: PropTypes.func,
  onEmbedInsert: PropTypes.func,
  onAudioInsert: PropTypes.func,
  onPDFInsert: PropTypes.func,
  wordCount: PropTypes.number,
  readingTime: PropTypes.number,
  seoScore: PropTypes.number,
  showRightBlock: PropTypes.bool,
  onToggleRightBlock: PropTypes.func,
  grammarlyEnabled: PropTypes.bool,
  onToggleGrammarly: PropTypes.func,
}

Toolbar.defaultProps = {
  wordCount: 0,
  readingTime: 1,
  seoScore: 0,
  showRightBlock: false,
  grammarlyEnabled: true,
}

export default Toolbar