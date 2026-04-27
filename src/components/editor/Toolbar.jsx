// src/components/Editor/Toolbar.jsx - COMPLETE PROFESSIONAL VERSION

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
  Newspaper, BookOpen, LayoutTemplate, FileStack, Briefcase, Users,
  GraduationCap, Mail, MapPin, Award, Target, Shield, BarChart,
  User, Eye as EyeIcon, Share2, Bookmark, Settings,
  CalendarDays, Clock as ClockIcon, Quote as QuoteIcon
} from 'lucide-react'
import dynamic from 'next/dynamic'

// Dynamically import EmojiPicker
const EmojiPicker = dynamic(() => import('emoji-picker-react').catch(() => () => <div className="p-4 text-center">Failed to load emoji picker</div>), { 
  ssr: false,
  loading: () => <div className="p-4 text-center"><Loader2 className="animate-spin mx-auto" /></div>
})

// Dynamically import media modals
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

// ==================== PROFESSIONAL TEMPLATES ====================

// Template 1: Standard Blog Post
const getBlogPostTemplate = () => `
<div class="template-blog-post" data-template-type="blog-post" data-id="${generateId()}">
  <div class="max-w-3xl mx-auto px-4">
    <div class="mb-8 text-center">
      <div class="flex items-center justify-center gap-2 text-sm text-gray-500 mb-4">
        <span class="flex items-center gap-1">📅 ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
        <span>•</span>
        <span class="flex items-center gap-1">⏱️ 5 min read</span>
        <span>•</span>
        <span class="flex items-center gap-1">👤 Author Name</span>
      </div>
      <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">Your Blog Post Title Here</h1>
      <p class="text-xl text-gray-600 max-w-2xl mx-auto">A compelling subtitle or summary that hooks readers and makes them want to continue reading your content.</p>
    </div>
    
    <div class="mb-8">
      <img src="https://picsum.photos/id/104/1200/600" alt="Blog header image" class="w-full rounded-2xl shadow-lg object-cover aspect-[2/1]" />
      <p class="text-center text-sm text-gray-500 mt-2">Caption for your featured image</p>
    </div>
    
    <div class="prose prose-lg max-w-none">
      <p>Welcome to this blog post! This template provides a clean, readable structure perfect for personal blogs, news articles, and opinion pieces.</p>
      
      <h2>Why This Topic Matters</h2>
      <p>In today's fast-paced digital world, staying informed about key trends is essential. This post explores the most important developments and what they mean for you.</p>
      
      <blockquote>
        <p>"The only way to do great work is to love what you do. Passion drives excellence."</p>
      </blockquote>
      
      <h2>Key Takeaways</h2>
      <ul>
        <li><strong>First major insight</strong> — Explanation of why this matters</li>
        <li><strong>Second important point</strong> — How this applies to your situation</li>
        <li><strong>Third actionable tip</strong> — What you can do right now</li>
      </ul>
      
      <div class="bg-gray-50 p-6 rounded-xl my-8 border-l-4 border-purple-500">
        <p class="font-semibold mb-2">💡 Pro Tip</p>
        <p class="mb-0">Start small. Implement one change at a time and measure the results before moving to the next improvement.</p>
      </div>
      
      <hr class="my-12" />
      
      <div class="flex items-center justify-between border-t border-b border-gray-200 py-4 my-8">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">JD</div>
          <div>
            <p class="font-semibold">Jane Doe</p>
            <p class="text-sm text-gray-500">Content Creator & Digital Strategist</p>
          </div>
        </div>
        <div class="flex gap-2">
          <span class="p-2 rounded-full hover:bg-gray-100 cursor-pointer">🐦</span>
          <span class="p-2 rounded-full hover:bg-gray-100 cursor-pointer">💼</span>
          <span class="p-2 rounded-full hover:bg-gray-100 cursor-pointer">📤</span>
        </div>
      </div>
    </div>
  </div>
</div>
`

// Template 2: Long-Form Article
const getArticleTemplate = () => `
<div class="template-article" data-template-type="article" data-id="${generateId()}">
  <div class="max-w-4xl mx-auto px-4">
    <div class="mb-12">
      <div class="flex items-center gap-2 text-sm text-purple-600 mb-4">
        <span class="bg-purple-100 px-3 py-1 rounded-full">FEATURE ARTICLE</span>
      </div>
      <h1 class="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">The Complete Guide to Modern Content Strategy</h1>
      <p class="text-xl text-gray-600 mb-6 leading-relaxed">A comprehensive analysis of how leading organizations are transforming their content approach for the digital age.</p>
      <div class="flex items-center justify-between border-b border-gray-200 pb-6">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white text-xl font-bold">MS</div>
          <div>
            <p class="font-semibold text-lg">Dr. Michael Stevens</p>
            <div class="flex items-center gap-3 text-sm text-gray-500">
              <span>📅 ${new Date().toLocaleDateString()}</span>
              <span>📖 15 min read</span>
              <span>🎓 PhD in Digital Media</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="mb-10">
      <img src="https://picsum.photos/id/26/1600/800" alt="Article hero" class="w-full rounded-2xl shadow-xl" />
      <p class="text-center text-sm text-gray-500 mt-3">Research shows content marketing ROI continues to grow year over year</p>
    </div>
    
    <div class="prose prose-xl max-w-none">
      <p class="text-2xl text-gray-600 font-light leading-relaxed">Content strategy has evolved dramatically over the past decade. What worked in 2020 is already outdated. This comprehensive guide examines the latest research and provides actionable frameworks for modern content creators.</p>
      
      <div class="bg-gray-50 p-8 rounded-2xl my-8">
        <div class="flex items-center gap-3 mb-4">
          <span class="text-purple-600">📊</span>
          <h3 class="font-bold text-xl mb-0">Key Statistics at a Glance</h3>
        </div>
        <div class="grid md:grid-cols-3 gap-6">
          <div class="text-center">
            <div class="text-3xl font-bold text-purple-600">73%</div>
            <div class="text-sm text-gray-600">of companies have a dedicated content strategy</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-purple-600">3.5x</div>
            <div class="text-sm text-gray-600">more leads generated by consistent bloggers</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-purple-600">94%</div>
            <div class="text-sm text-gray-600">of marketers use content in their strategy</div>
          </div>
        </div>
      </div>
      
      <h2>The Evolution of Content Consumption</h2>
      <p>User behavior has shifted dramatically. According to recent studies, the average attention span has decreased, but engagement with high-quality long-form content has actually increased. This paradox reveals that users are more selective, not less engaged.</p>
      
      <div class="bg-purple-50 p-6 rounded-xl border-l-4 border-purple-600 my-8">
        <p class="font-semibold text-purple-800 mb-2">🎯 Key Finding</p>
        <p class="mb-0">Content personalization increases engagement by 42% on average. The most successful campaigns used dynamic content tailored to user segments.</p>
      </div>
      
      <h2>Practical Implementation Framework</h2>
      <ol>
        <li><strong>Audit existing content</strong> — Identify what's working and what needs improvement</li>
        <li><strong>Define audience personas</strong> — Create detailed profiles of your ideal readers</li>
        <li><strong>Establish KPIs</strong> — Measure what matters (engagement, conversions, retention)</li>
        <li><strong>Create content pillars</strong> — Focus on 3-5 core themes that align with your brand</li>
      </ol>
      
      <div class="border-t border-gray-200 pt-8 mt-12">
        <h3 class="text-2xl font-bold mb-4">References</h3>
        <ul class="text-sm text-gray-600">
          <li>1. Content Marketing Institute. (2024). Annual B2B Content Marketing Report.</li>
          <li>2. Journal of Digital Marketing. (2024). The ROI of Content Strategy.</li>
        </ul>
      </div>
    </div>
  </div>
</div>
`

// Template 3: Company/Brand Page
const getCompanyPageTemplate = () => `
<div class="template-company-page" data-template-type="company" data-id="${generateId()}">
  <div class="max-w-6xl mx-auto px-4">
    <div class="text-center mb-16">
      <div class="inline-flex items-center gap-2 bg-purple-100 px-4 py-2 rounded-full mb-6">
        <span class="text-purple-600">🏆</span>
        <span class="text-sm text-purple-600 font-medium">Trusted by 10,000+ customers</span>
      </div>
      <h1 class="text-5xl md:text-6xl font-bold text-gray-900 mb-6">Transforming Ideas<br />Into Digital Reality</h1>
      <p class="text-xl text-gray-600 max-w-2xl mx-auto">We help businesses build exceptional digital experiences that drive growth and delight customers.</p>
      <div class="flex items-center justify-center gap-4 mt-8">
        <span class="px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold cursor-pointer">Get Started</span>
        <span class="px-6 py-3 border border-gray-300 rounded-xl font-semibold cursor-pointer">Contact Sales</span>
      </div>
    </div>
    
    <div class="grid md:grid-cols-3 gap-8 mb-16">
      <div class="text-center p-6">
        <div class="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span class="text-2xl">🎯</span>
        </div>
        <h3 class="text-xl font-bold mb-2">Mission-Driven</h3>
        <p class="text-gray-600">Empowering businesses to reach their full potential through innovative technology solutions.</p>
      </div>
      <div class="text-center p-6">
        <div class="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span class="text-2xl">🛡️</span>
        </div>
        <h3 class="text-xl font-bold mb-2">Enterprise Security</h3>
        <p class="text-gray-600">Bank-grade security protocols protecting your data and your customers' trust.</p>
      </div>
      <div class="text-center p-6">
        <div class="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span class="text-2xl">👥</span>
        </div>
        <h3 class="text-xl font-bold mb-2">Global Community</h3>
        <p class="text-gray-600">Join thousands of creators and developers building the future of the web.</p>
      </div>
    </div>
    
    <div class="bg-gray-50 rounded-3xl p-8 md:p-12 mb-16">
      <div class="text-center mb-8">
        <h2 class="text-3xl font-bold mb-4">Our Platform by the Numbers</h2>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        <div><div class="text-3xl font-bold text-purple-600">99.9%</div><div class="text-sm text-gray-600">Uptime SLA</div></div>
        <div><div class="text-3xl font-bold text-purple-600">2.5M+</div><div class="text-sm text-gray-600">Active Users</div></div>
        <div><div class="text-3xl font-bold text-purple-600">150+</div><div class="text-sm text-gray-600">Countries</div></div>
        <div><div class="text-3xl font-bold text-purple-600">24/7</div><div class="text-sm text-gray-600">Support</div></div>
      </div>
    </div>
    
    <div class="bg-purple-600 text-white rounded-3xl p-8 md:p-12 text-center">
      <h2 class="text-3xl font-bold mb-4">Ready to Get Started?</h2>
      <p class="text-purple-100 mb-6">Join thousands of satisfied customers and transform your business today.</p>
      <div class="flex flex-wrap items-center justify-center gap-4">
        <span class="px-6 py-3 bg-white text-purple-600 rounded-xl font-semibold cursor-pointer">Request Demo</span>
        <span class="px-6 py-3 border border-white/30 rounded-xl font-semibold cursor-pointer">Contact Sales</span>
      </div>
    </div>
  </div>
</div>
`

// Template 4: Case Study
const getCaseStudyTemplate = () => `
<div class="template-case-study" data-template-type="case-study" data-id="${generateId()}">
  <div class="max-w-4xl mx-auto px-4">
    <div class="mb-8">
      <div class="flex items-center gap-2 text-sm text-purple-600 mb-4">
        <span>💼</span>
        <span>CASE STUDY</span>
      </div>
      <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4">How Company X Increased Revenue by 284% Using Our Platform</h1>
      <p class="text-xl text-gray-600">A detailed analysis of transformation from struggling startup to market leader.</p>
    </div>
    
    <div class="bg-gray-50 rounded-2xl p-6 mb-8">
      <div class="grid md:grid-cols-4 gap-6 text-center">
        <div><div class="text-2xl font-bold text-purple-600">284%</div><div class="text-sm text-gray-600">Revenue Growth</div></div>
        <div><div class="text-2xl font-bold text-purple-600">3x</div><div class="text-sm text-gray-600">User Acquisition</div></div>
        <div><div class="text-2xl font-bold text-purple-600">67%</div><div class="text-sm text-gray-600">Reduced Churn</div></div>
        <div><div class="text-2xl font-bold text-purple-600">6 mo</div><div class="text-sm text-gray-600">Time to Results</div></div>
      </div>
    </div>
    
    <div class="prose prose-lg max-w-none">
      <h2>The Challenge</h2>
      <p>When Company X approached us in early 2024, they were facing significant headwinds: flat growth, high customer acquisition costs, and increasing competition in their space.</p>
      
      <h2>Our Solution</h2>
      <p>We implemented a comprehensive digital transformation strategy focused on three key areas: customer experience optimization, automated marketing workflows, and data-driven decision making.</p>
      
      <div class="bg-purple-50 p-6 rounded-xl my-8">
        <p class="font-semibold">🎯 The Results</p>
        <p class="mb-0">Within six months, Company X saw dramatic improvements across all metrics, culminating in a successful Series B fundraising round.</p>
      </div>
      
      <h2>Client Testimonial</h2>
      <blockquote>
        <p>"The team's expertise and dedication transformed our business. We couldn't have achieved these results without their partnership."</p>
        <footer>— CEO, Company X</footer>
      </blockquote>
    </div>
  </div>
</div>
`

// Template 5: Newsletter Signup
const getNewsletterTemplate = () => `
<div class="template-newsletter" data-template-type="newsletter" data-id="${generateId()}">
  <div class="max-w-4xl mx-auto px-4 text-center">
    <div class="mb-8">
      <div class="inline-flex items-center gap-2 bg-green-100 px-4 py-2 rounded-full mb-6">
        <span class="text-green-600">📧</span>
        <span class="text-sm text-green-600 font-medium">Weekly Newsletter</span>
      </div>
      <h1 class="text-5xl font-bold text-gray-900 mb-4">The Weekly Pause</h1>
      <p class="text-xl text-gray-600 max-w-lg mx-auto">Curated insights, practical tips, and inspiring stories delivered to your inbox every Friday.</p>
    </div>
    
    <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 mb-12">
      <div class="max-w-2xl mx-auto">
        <div class="flex flex-col md:flex-row gap-4">
          <input type="email" placeholder="Enter your email" class="flex-1 px-4 py-3 border rounded-xl bg-white" />
          <button class="px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold">Subscribe</button>
        </div>
        <p class="text-xs text-gray-500 mt-2">No spam, unsubscribe anytime.</p>
      </div>
    </div>
    
    <div class="grid md:grid-cols-3 gap-8 mb-12 text-left">
      <div class="p-6 border rounded-2xl">
        <div class="text-3xl mb-3">📈</div>
        <h3 class="font-bold text-lg mb-2">Market Trends</h3>
        <p class="text-gray-600 text-sm">Weekly analysis of industry shifts</p>
      </div>
      <div class="p-6 border rounded-2xl">
        <div class="text-3xl mb-3">💡</div>
        <h3 class="font-bold text-lg mb-2">Actionable Tips</h3>
        <p class="text-gray-600 text-sm">Practical advice you can implement</p>
      </div>
      <div class="p-6 border rounded-2xl">
        <div class="text-3xl mb-3">🌟</div>
        <h3 class="font-bold text-lg mb-2">Member Spotlight</h3>
        <p class="text-gray-600 text-sm">Success stories from our community</p>
      </div>
    </div>
  </div>
</div>
`

// ==================== TEMPLATES DROPDOWN ====================
const TemplatesDropdown = ({ editor, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [customTitle, setCustomTitle] = useState('')
  const [showCustomize, setShowCustomize] = useState(false)

  const templates = [
    { id: 'blog-post', name: 'Blog Post', category: 'blog', icon: Newspaper, description: 'Standard blog post with author bio', template: getBlogPostTemplate, tags: ['blog', 'article'] },
    { id: 'long-article', name: 'Long-Form Article', category: 'article', icon: BookOpen, description: 'Research-backed article with statistics', template: getArticleTemplate, tags: ['article', 'research'] },
    { id: 'company-page', name: 'Company Page', category: 'business', icon: Briefcase, description: 'Professional company overview', template: getCompanyPageTemplate, tags: ['business', 'brand'] },
    { id: 'case-study', name: 'Case Study', category: 'business', icon: Award, description: 'Success story with metrics', template: getCaseStudyTemplate, tags: ['case-study', 'metrics'] },
    { id: 'newsletter', name: 'Newsletter Signup', category: 'marketing', icon: Mail, description: 'Email collection landing page', template: getNewsletterTemplate, tags: ['email', 'marketing'] }
  ]

  const categories = [
    { id: 'all', label: 'All', icon: LayoutTemplate },
    { id: 'blog', label: 'Blog', icon: Newspaper },
    { id: 'article', label: 'Articles', icon: BookOpen },
    { id: 'business', label: 'Business', icon: Briefcase },
    { id: 'marketing', label: 'Marketing', icon: Target }
  ]

  const filteredTemplates = useMemo(() => {
    return templates.filter(t => {
      const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory
      const matchesSearch = searchTerm === '' || 
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [selectedCategory, searchTerm])

  const insertTemplate = (template) => {
    let html = template.template()
    if (customTitle && showCustomize) {
      html = html.replace(/<h1[^>]*>.*?<\/h1>/, `<h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4">${escapeHtml(customTitle)}</h1>`)
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

  return (
    <div className="absolute top-full left-0 mt-2 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-[100] w-[560px] max-h-[70vh] overflow-hidden">
      <div className="p-4 border-b bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <LayoutTemplate size={18} className="text-purple-600" />
            <h3 className="font-semibold">Insert Template</h3>
          </div>
          <button onClick={() => setShowCustomize(!showCustomize)} className="text-xs text-purple-600 flex items-center gap-1">
            <Settings size={12} />
            {showCustomize ? 'Hide' : 'Customize'}
          </button>
        </div>
        
        {showCustomize && (
          <input type="text" value={customTitle} onChange={(e) => setCustomTitle(e.target.value)} placeholder="Custom title (optional)" className="w-full px-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 mb-3" />
        )}
        
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search templates..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" />
        </div>
      </div>
      
      <div className="p-3 border-b flex flex-wrap gap-2">
        {categories.map(cat => {
          const Icon = cat.icon
          return (
            <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 ${selectedCategory === cat.id ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              <Icon size={14} /> {cat.label}
            </button>
          )
        })}
      </div>
      
      <div className="overflow-y-auto max-h-[400px] p-4">
        <div className="grid grid-cols-2 gap-3">
          {filteredTemplates.map((template) => {
            const Icon = template.icon
            return (
              <button key={template.id} onClick={() => insertTemplate(template)} className="p-4 text-left border border-gray-200 rounded-xl hover:border-purple-300 hover:shadow-md transition-all group bg-white">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-purple-100 group-hover:bg-purple-200 transition">
                    <Icon size={18} className="text-purple-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{template.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{template.description}</div>
                    <div className="flex gap-1 mt-2 text-[10px] text-gray-400">
                      {template.tags.slice(0, 2).map(tag => <span key={tag} className="px-1.5 py-0.5 bg-gray-100 rounded">#{tag}</span>)}
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
        {filteredTemplates.length === 0 && <div className="text-center py-8 text-gray-500">No templates found.</div>}
      </div>
      
      <div className="p-3 border-t bg-gray-50 text-center">
        <p className="text-xs text-gray-500">✨ Templates are fully editable after insertion</p>
      </div>
    </div>
  )
}

// ==================== FONT DROPDOWN ====================
const FontDropdown = ({ currentFont, onApplyFont, onClose }) => {
  const [fontSearch, setFontSearch] = useState('')
  const fontFamilies = ['Inter', 'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Courier New', 'Verdana', 'Roboto', 'Open Sans', 'Montserrat', 'Playfair Display', 'Lato', 'Poppins']

  const filteredFonts = useMemo(() => {
    return fontSearch ? fontFamilies.filter(f => f.toLowerCase().includes(fontSearch.toLowerCase())) : fontFamilies
  }, [fontSearch])

  return (
    <div className="absolute top-full left-0 mt-1.5 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border z-[100] w-80 max-h-96 overflow-hidden">
      <div className="p-3 border-b bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search fonts..." value={fontSearch} onChange={(e) => setFontSearch(e.target.value)} className="w-full pl-9 pr-3 py-2 text-sm border-0 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500" autoFocus />
        </div>
      </div>
      <div className="max-h-80 overflow-y-auto p-2">
        {filteredFonts.map(font => (
          <button key={font} onClick={() => { onApplyFont(font); onClose() }} className={`w-full text-left px-3 py-2 rounded-lg transition ${currentFont === font ? 'bg-purple-50 text-purple-600' : 'hover:bg-gray-50'}`}>
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
        <button key={color} onClick={() => onSelectColor(color)} className="w-6 h-6 rounded-lg border hover:scale-110 transition-transform" style={{ backgroundColor: color }} />
      ))}
    </div>
    <button onClick={onRemoveColor} className="text-xs text-red-500 hover:text-red-600 w-full text-center">Remove {title.toLowerCase()}</button>
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
            <button key={preset.label} onClick={() => onInsertTable(preset.rows, preset.cols)} className="py-2 px-3 rounded-lg bg-gray-100 hover:bg-purple-100 transition-all text-center">
              <div className="text-sm font-medium">{preset.label}</div>
              <div className="text-xs text-gray-500">{preset.rows} × {preset.cols}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="p-3 border-b">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Grid Selector</div>
        <div className="bg-gray-50 rounded-lg p-2" onMouseLeave={() => { setPreviewRows(3); setPreviewCols(3) }}>
          <div className="grid grid-cols-6 gap-1 mb-2">
            {Array.from({ length: 36 }, (_, i) => {
              const row = Math.floor(i / 6) + 1
              const col = (i % 6) + 1
              const isActive = row <= previewRows && col <= previewCols
              return <button key={i} onMouseEnter={() => { setPreviewRows(row); setPreviewCols(col) }} onClick={() => onInsertTable(row, col)} className={`aspect-square rounded transition-all ${isActive ? 'bg-purple-600 shadow-md scale-95' : 'bg-gray-200 hover:bg-gray-300'}`} />
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
          <button onClick={() => onTableControl('deleteTable')} className="w-full text-left px-3 py-2 text-sm hover:bg-red-50 text-red-600 rounded-lg flex items-center gap-2"><Trash2 size={14} /> Delete Table</button>
        </div>
      </div>
    </div>
  )
}

// ==================== CODE BLOCK DROPDOWN ====================
const CodeBlockDropdown = ({ editor, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('')
  
  const languages = [
    { value: 'javascript', label: 'JavaScript', icon: '📜' }, { value: 'typescript', label: 'TypeScript', icon: '📘' },
    { value: 'python', label: 'Python', icon: '🐍' }, { value: 'java', label: 'Java', icon: '☕' },
    { value: 'html', label: 'HTML', icon: '🌐' }, { value: 'css', label: 'CSS', icon: '🎨' },
    { value: 'json', label: 'JSON', icon: '📊' }, { value: 'sql', label: 'SQL', icon: '🗄️' },
    { value: 'bash', label: 'Bash', icon: '💻' }, { value: 'yaml', label: 'YAML', icon: '📋' },
  ]

  const filteredLanguages = useMemo(() => {
    if (!searchTerm) return languages
    return languages.filter(lang => lang.label.toLowerCase().includes(searchTerm.toLowerCase()))
  }, [searchTerm])

  const insertCodeBlock = (language = null) => {
    if (language) editor.chain().focus().setCodeBlock({ language: language.value }).run()
    else editor.chain().focus().setCodeBlock().run()
    onClose()
  }

  return (
    <div className="absolute top-full left-0 mt-1.5 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border z-[100] w-80 overflow-hidden">
      <div className="p-3 border-b">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2"><Code2 size={12} /> Code Blocks</div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search language..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" autoFocus />
        </div>
      </div>
      <div className="max-h-80 overflow-y-auto p-2">
        <button onClick={() => insertCodeBlock()} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-lg flex items-center gap-2 mb-2 border-b"><Terminal size={14} /><span className="font-medium">Plain Text</span></button>
        {filteredLanguages.map((lang) => (
          <button key={lang.value} onClick={() => insertCodeBlock(lang)} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-lg flex items-center gap-2">
            <span className="text-lg">{lang.icon}</span><span>{lang.label}</span>
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
    { id: 'note', label: 'Note', icon: MessageCircle, bgColor: 'bg-blue-50', borderColor: 'border-blue-500', iconColor: 'text-blue-500' },
    { id: 'tip', label: 'Tip', icon: Lightbulb, bgColor: 'bg-green-50', borderColor: 'border-green-500', iconColor: 'text-green-500' },
    { id: 'warning', label: 'Warning', icon: AlertTriangle, bgColor: 'bg-yellow-50', borderColor: 'border-yellow-500', iconColor: 'text-yellow-500' },
    { id: 'danger', label: 'Danger', icon: AlertCircle, bgColor: 'bg-red-50', borderColor: 'border-red-500', iconColor: 'text-red-500' },
    { id: 'info', label: 'Info', icon: Info, bgColor: 'bg-cyan-50', borderColor: 'border-cyan-500', iconColor: 'text-cyan-500' },
  ]

  const insertCallout = (type) => {
    const calloutId = generateId()
    const calloutHtml = `<div class="callout callout-${type}" data-callout-id="${calloutId}"><div class="callout-title"><strong>${calloutTitle || type.label}</strong></div><div class="callout-content"><p></p></div></div>`
    editor.chain().focus().insertContent(calloutHtml).run()
    setCalloutTitle('')
    onClose()
    showToast(`${type.label} inserted`, 'success')
  }

  const insertBlockquote = () => {
    editor.chain().focus().toggleBlockquote().run()
    onClose()
  }

  return (
    <div className="absolute top-full left-0 mt-1.5 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border z-[100] w-80 max-h-[500px] overflow-hidden">
      <div className="p-3 border-b">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Insert Callout / Quote</div>
        <button onClick={insertBlockquote} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-lg flex items-center gap-3 mb-3 border"><Quote size={18} /><div><div className="font-medium">Standard Blockquote</div></div></button>
        <label className="flex items-center gap-2 text-sm mb-2"><input type="checkbox" checked={showTitleInput} onChange={(e) => setShowTitleInput(e.target.checked)} className="rounded" /> Add custom title</label>
        {showTitleInput && <input type="text" value={calloutTitle} onChange={(e) => setCalloutTitle(e.target.value)} placeholder="Enter callout title..." className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mb-3" autoFocus />}
      </div>
      <div className="max-h-80 overflow-y-auto p-2">
        <div className="grid grid-cols-2 gap-2">
          {calloutTypes.map((type) => {
            const Icon = type.icon
            return (
              <button key={type.id} onClick={() => insertCallout(type)} className={`p-3 rounded-lg text-left hover:shadow-md ${type.bgColor} border-l-4 ${type.borderColor}`}>
                <div className="flex items-center gap-2"><Icon size={16} className={type.iconColor} /><span className={`font-medium text-sm ${type.iconColor}`}>{type.label}</span></div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
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
  editor, onSave, onSchedule, onPublish, onPreview, 
  onImageInsert, onGalleryInsert, onVideoInsert, onEmbedInsert, onAudioInsert, onPDFInsert,
  wordCount = 0, readingTime = 1, seoScore = 0,
  showRightBlock = false, onToggleRightBlock = null,
  grammarlyEnabled = true, onToggleGrammarly = null
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

  useEffect(() => {
    if (!editor) return
    const updateSelection = () => {
      try {
        const { state } = editor
        const { from } = state.selection
        const node = state.doc.nodeAt(from)
        if (node && ['embed', 'video', 'image', 'audio', 'pdf'].includes(node.type.name)) {
          setSelectedMediaForControls({ type: node.type.name, attrs: { ...node.attrs }, pos: from })
          setShowMediaControls(true)
        } else if (!editMode) {
          setSelectedMediaForControls(null)
          setShowMediaControls(false)
        }
      } catch (error) {}
    }
    editor.on('selectionUpdate', updateSelection)
    updateSelection()
    return () => editor.off('selectionUpdate', updateSelection)
  }, [editor, editMode])

  useEffect(() => {
    const handleClickOutside = (event) => {
      Object.entries(dropdownRefs).forEach(([key, ref]) => {
        if (ref.current && !ref.current.contains(event.target) && activeDropdown === key) setActiveDropdown(null)
      })
      if (showEmojiPicker) setShowEmojiPicker(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [activeDropdown, showEmojiPicker])

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const clearMediaControls = useCallback(() => {
    setSelectedMediaForControls(null)
    setShowMediaControls(false)
  }, [])

  const handleMediaEdit = useCallback((type, attrs) => {
    setSelectedMedia({ type, attrs })
    if (type === 'image') setShowImageModal(true)
    else if (type === 'video') setShowVideoModal(true)
    else if (type === 'embed') setShowEmbedModal(true)
    else if (type === 'gallery') setShowGalleryModal(true)
    else if (type === 'audio') setShowAudioModal(true)
    else if (type === 'pdf') setShowPDFModal(true)
    else showToast(`Edit ${type}`, 'info')
  }, [])

  const toggleEditMode = useCallback(() => {
    setEditMode(!editMode)
    if (editMode) clearMediaControls()
  }, [editMode, clearMediaControls])

  const handleEditModeClick = useCallback((event) => {
    if (!editor || !editMode) return
    setTimeout(() => {
      try {
        const { state } = editor
        const node = state.doc.nodeAt(state.selection.from)
        if (node && ['image', 'video', 'embed', 'gallery', 'audio', 'pdf'].includes(node.type.name)) {
          setSelectedMedia({ node, type: node.type.name, attrs: node.attrs })
          setSelectedMediaForControls({ type: node.type.name, attrs: { ...node.attrs }, pos: state.selection.from })
          setShowMediaControls(true)
          if (node.type.name === 'image') setShowImageModal(true)
          else if (node.type.name === 'video') setShowVideoModal(true)
          else if (node.type.name === 'embed') setShowEmbedModal(true)
          else if (node.type.name === 'gallery') setShowGalleryModal(true)
          else if (node.type.name === 'audio') setShowAudioModal(true)
          else if (node.type.name === 'pdf') setShowPDFModal(true)
          setActiveDropdown(null)
        }
      } catch (error) {}
    }, 10)
  }, [editor, editMode])

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

  const handleImageUpload = (imageData) => {
    if (onImageInsert) onImageInsert(imageData)
    else editor.chain().focus().insertContent(`<img src="${imageData.src}" alt="${imageData.alt || 'Image'}" />`).run()
    setShowImageModal(false)
    setSelectedMedia(null)
    clearMediaControls()
    showToast('Image inserted', 'success')
  }

  const handleVideoUpload = (videoData) => {
    if (onVideoInsert) onVideoInsert(videoData)
    setShowVideoModal(false)
    clearMediaControls()
  }

  const handleEmbedUpload = (embedData) => {
    if (onEmbedInsert) onEmbedInsert(embedData)
    setShowEmbedModal(false)
    clearMediaControls()
  }

  const handleGalleryInsert = (galleryData) => {
    if (onGalleryInsert) onGalleryInsert(galleryData)
    setShowGalleryModal(false)
    clearMediaControls()
  }

  const handleAudioUpload = (audioData) => { if (onAudioInsert) onAudioInsert(audioData); setShowAudioModal(false); clearMediaControls() }
  const handlePDFUpload = (pdfData) => { if (onPDFInsert) onPDFInsert(pdfData); setShowPDFModal(false); clearMediaControls() }

  const applyFontFamily = (font) => { setCurrentFont(font); editor.chain().focus().setMark('textStyle', { fontFamily: font }).run(); setActiveDropdown(null) }
  const applyFontSize = (size) => { setCurrentFontSize(size); editor.chain().focus().setMark('textStyle', { fontSize: `${size}px` }).run(); setActiveDropdown(null) }
  const setTextColor = (color) => { editor.chain().focus().setColor(color).run(); setActiveDropdown(null) }
  const removeTextColor = () => { editor.chain().focus().unsetColor().run(); setActiveDropdown(null) }
  const setHighlight = (color) => { editor.chain().focus().toggleHighlight({ color }).run(); setActiveDropdown(null) }
  const removeHighlight = () => { editor.chain().focus().unsetHighlight().run(); setActiveDropdown(null) }
  const clearFormatting = () => { editor.chain().focus().clearNodes().unsetAllMarks().run(); showToast('Formatting cleared', 'info') }
  const setLink = () => { const url = prompt('Enter URL:'); if (url) editor.chain().focus().setLink({ href: url }).run() }
  const unsetLink = () => editor.chain().focus().unsetLink().run()
  const setAlignment = (alignment) => editor.chain().focus().setTextAlign(alignment).run()
  const insertHorizontalRule = () => editor.chain().focus().setHorizontalRule().run()
  const toggleBulletList = () => editor.chain().focus().toggleBulletList().run()
  const toggleOrderedList = () => editor.chain().focus().toggleOrderedList().run()
  const toggleTaskList = () => editor.chain().focus().toggleTaskList().run()
  const insertTable = (rows, cols) => { editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run(); setActiveDropdown(null) }
  const handleTableControl = (action) => {
    const actions = { addRowBefore: () => editor.chain().focus().addRowBefore().run(), addRowAfter: () => editor.chain().focus().addRowAfter().run(), deleteRow: () => editor.chain().focus().deleteRow().run(), addColumnBefore: () => editor.chain().focus().addColumnBefore().run(), addColumnAfter: () => editor.chain().focus().addColumnAfter().run(), deleteColumn: () => editor.chain().focus().deleteColumn().run(), mergeCells: () => editor.chain().focus().mergeCells().run(), splitCell: () => editor.chain().focus().splitCell().run(), toggleHeaderRow: () => editor.chain().focus().toggleHeaderRow().run(), deleteTable: () => editor.chain().focus().deleteTable().run() }
    actions[action]?.()
    setActiveDropdown(null)
  }
  const onEmojiClick = (emojiObject) => { editor.chain().focus().insertContent(emojiObject.emoji).run(); setShowEmojiPicker(false) }
  const toggleFullscreen = () => { const el = document.querySelector('.ProseMirror'); if (!document.fullscreenElement) el?.requestFullscreen(); else document.exitFullscreen() }
  const copyHtml = () => { navigator.clipboard.writeText(editor.getHTML()); showToast('HTML copied', 'success') }
  const selectAll = () => editor.commands.selectAll()
  const getSeoScoreColor = () => { if (seoScore >= 80) return 'text-green-500'; if (seoScore >= 60) return 'text-yellow-500'; return 'text-red-500' }
  const getCurrentHeading = () => { if (editor.isActive('heading', { level: 1 })) return 'H1'; if (editor.isActive('heading', { level: 2 })) return 'H2'; if (editor.isActive('heading', { level: 3 })) return 'H3'; return 'Normal' }
  const setHeading = (level) => { if (level === 0) editor.chain().focus().setParagraph().run(); else editor.chain().focus().toggleHeading({ level }).run(); setActiveDropdown(null) }

  const headingOptions = [{ label: 'Normal', level: 0 }, { label: 'Heading 1', level: 1 }, { label: 'Heading 2', level: 2 }, { label: 'Heading 3', level: 3 }]

  return (
    <>
      <div className={`bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 transition-all duration-300 ${isCollapsed ? 'py-1' : 'py-2'} px-4 sticky top-0 z-40 shadow-sm`}>
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="absolute -right-3 top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-800 border rounded-full p-1 shadow-md hover:shadow-lg z-50 transition-all hover:scale-110">
          {isCollapsed ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
        </button>

        {!isCollapsed ? (
          <div className="flex flex-wrap items-center gap-1">
            {/* TEMPLATES BUTTON */}
            <div className="relative" ref={dropdownRefs.templates}>
              <button onClick={() => setActiveDropdown(activeDropdown === 'templates' ? null : 'templates')} className="h-9 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium flex items-center gap-2 transition-all hover:shadow-md">
                <LayoutTemplate size={14} />
                Templates
                <ChevronDown size={14} className="text-white/70" />
              </button>
              {activeDropdown === 'templates' && <TemplatesDropdown editor={editor} onClose={() => setActiveDropdown(null)} />}
            </div>

            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

            {/* Heading Dropdown */}
            <div className="relative" ref={dropdownRefs.heading}>
              <button onClick={() => setActiveDropdown(activeDropdown === 'heading' ? null : 'heading')} className="h-9 px-3 rounded-lg bg-gray-50 text-sm font-medium hover:bg-gray-100 flex items-center gap-1.5">
                {getCurrentHeading()} <ChevronDown size={14} className="text-gray-400" />
              </button>
              {activeDropdown === 'heading' && (
                <div className="absolute top-full left-0 mt-1.5 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border p-1.5 z-[100] min-w-[140px]">
                  {headingOptions.map(h => (
                    <button key={h.label} onClick={() => setHeading(h.level)} className={`w-full text-left px-3 py-2 rounded-lg text-sm ${(h.level === 0 && getCurrentHeading() === 'Normal') || (h.level > 0 && editor.isActive('heading', { level: h.level })) ? 'bg-purple-50 text-purple-600' : 'hover:bg-gray-50'}`}>
                      {h.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

            {/* Text Formatting */}
            <div className="flex items-center gap-0.5 bg-gray-50 dark:bg-gray-800 rounded-lg p-0.5">
              <button onClick={() => editor.chain().focus().toggleBold().run()} className={`p-1.5 rounded-md ${editor.isActive('bold') ? 'bg-gray-900 text-white' : 'hover:bg-gray-200'}`}><Bold size={16} /></button>
              <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-1.5 rounded-md ${editor.isActive('italic') ? 'bg-gray-900 text-white' : 'hover:bg-gray-200'}`}><Italic size={16} /></button>
              <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={`p-1.5 rounded-md ${editor.isActive('underline') ? 'bg-gray-900 text-white' : 'hover:bg-gray-200'}`}><Underline size={16} /></button>
              <button onClick={() => editor.chain().focus().toggleStrike().run()} className={`p-1.5 rounded-md ${editor.isActive('strike') ? 'bg-gray-900 text-white' : 'hover:bg-gray-200'}`}><Strikethrough size={16} /></button>
              <button onClick={() => editor.chain().focus().toggleCode().run()} className={`p-1.5 rounded-md ${editor.isActive('code') ? 'bg-gray-900 text-white' : 'hover:bg-gray-200'}`}><Code size={16} /></button>
            </div>

            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />
            
            <button onClick={clearFormatting} className="p-1.5 rounded-lg hover:bg-gray-100 text-red-500"><X size={16} /></button>
            
            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

            {/* Font Family */}
            <div className="relative" ref={dropdownRefs.font}>
              <button onClick={() => setActiveDropdown(activeDropdown === 'font' ? null : 'font')} className="h-9 px-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 text-sm font-medium flex items-center gap-2 border border-purple-200">
                <Sparkles size={14} className="text-purple-500" />
                <span className="max-w-[120px] truncate">{currentFont}</span>
                <ChevronDown size={14} className="text-purple-400" />
              </button>
              {activeDropdown === 'font' && <FontDropdown currentFont={currentFont} onApplyFont={applyFontFamily} onClose={() => setActiveDropdown(null)} />}
            </div>

            {/* Font Size */}
            <div className="relative" ref={dropdownRefs.size}>
              <button onClick={() => setActiveDropdown(activeDropdown === 'size' ? null : 'size')} className="h-9 px-3 rounded-lg bg-gray-50 text-sm font-medium flex items-center gap-1.5">
                <Type size={14} /><span className="font-mono">{currentFontSize}px</span><ChevronDown size={14} className="text-gray-400" />
              </button>
              {activeDropdown === 'size' && (
                <div className="absolute top-full left-0 mt-1.5 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border p-2 z-[100] w-64 max-h-80 overflow-y-auto">
                  <div className="grid grid-cols-5 gap-1">
                    {fontSizes.map(size => (
                      <button key={size} onClick={() => applyFontSize(size)} className={`px-2 py-2 text-center rounded-lg text-sm font-mono ${currentFontSize === size.toString() ? 'bg-purple-100 text-purple-600' : 'hover:bg-gray-100'}`}>{size}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Color Picker */}
            <div className="relative" ref={dropdownRefs.color}>
              <button onClick={() => setActiveDropdown(activeDropdown === 'color' ? null : 'color')} className="p-1.5 rounded-lg hover:bg-gray-100"><Palette size={16} /></button>
              {activeDropdown === 'color' && <ColorPickerDropdown colors={colors} onSelectColor={setTextColor} onRemoveColor={removeTextColor} title="Text Color" />}
            </div>

            {/* Highlighter */}
            <div className="relative" ref={dropdownRefs.highlight}>
              <button onClick={() => setActiveDropdown(activeDropdown === 'highlight' ? null : 'highlight')} className="p-1.5 rounded-lg hover:bg-gray-100"><Highlighter size={16} /></button>
              {activeDropdown === 'highlight' && <ColorPickerDropdown colors={highlightColors} onSelectColor={setHighlight} onRemoveColor={removeHighlight} title="Highlight Color" />}
            </div>

            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

            {/* Alignment */}
            <div className="flex items-center gap-0.5 bg-gray-50 rounded-lg p-0.5">
              <button onClick={() => setAlignment('left')} className={`p-1.5 rounded-md ${editor.isActive({ textAlign: 'left' }) ? 'bg-gray-900 text-white' : 'hover:bg-gray-200'}`}><AlignLeft size={16} /></button>
              <button onClick={() => setAlignment('center')} className={`p-1.5 rounded-md ${editor.isActive({ textAlign: 'center' }) ? 'bg-gray-900 text-white' : 'hover:bg-gray-200'}`}><AlignCenter size={16} /></button>
              <button onClick={() => setAlignment('right')} className={`p-1.5 rounded-md ${editor.isActive({ textAlign: 'right' }) ? 'bg-gray-900 text-white' : 'hover:bg-gray-200'}`}><AlignRight size={16} /></button>
              <button onClick={() => setAlignment('justify')} className={`p-1.5 rounded-md ${editor.isActive({ textAlign: 'justify' }) ? 'bg-gray-900 text-white' : 'hover:bg-gray-200'}`}><AlignJustify size={16} /></button>
            </div>

            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

            {/* Lists */}
            <div className="flex items-center gap-0.5 bg-gray-50 rounded-lg p-0.5">
              <button onClick={toggleBulletList} className={`p-1.5 rounded-md ${editor.isActive('bulletList') ? 'bg-gray-900 text-white' : 'hover:bg-gray-200'}`}><List size={16} /></button>
              <button onClick={toggleOrderedList} className={`p-1.5 rounded-md ${editor.isActive('orderedList') ? 'bg-gray-900 text-white' : 'hover:bg-gray-200'}`}><ListOrdered size={16} /></button>
              <button onClick={toggleTaskList} className={`p-1.5 rounded-md ${editor.isActive('taskList') ? 'bg-gray-900 text-white' : 'hover:bg-gray-200'}`}><CheckSquare size={16} /></button>
            </div>

            <div className="relative" ref={dropdownRefs.listAlign}>
              <button onClick={() => setActiveDropdown(activeDropdown === 'listAlign' ? null : 'listAlign')} className="p-1.5 rounded-lg hover:bg-gray-100 flex items-center gap-1"><AlignLeft size={16} /><ChevronDown size={12} /></button>
              {activeDropdown === 'listAlign' && <ListAlignmentDropdown editor={editor} onClose={() => setActiveDropdown(null)} />}
            </div>

            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

            {/* Block Elements */}
            <button onClick={() => editor.chain().focus().toggleBlockquote().run()} className={`p-1.5 rounded-md hover:bg-gray-100 ${editor.isActive('blockquote') ? 'bg-gray-200' : ''}`}><Quote size={16} /></button>
            <button onClick={() => editor.chain().focus().setParagraph().run()} className="p-1.5 rounded-md hover:bg-gray-100"><Pilcrow size={16} /></button>
            <button onClick={insertHorizontalRule} className="p-1.5 rounded-md hover:bg-gray-100"><Minus size={16} /></button>

            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

            {/* Code Block */}
            <div className="relative" ref={dropdownRefs.codeBlock}>
              <button onClick={() => setActiveDropdown(activeDropdown === 'codeBlock' ? null : 'codeBlock')} className={`p-1.5 rounded-lg hover:bg-gray-100 ${editor.isActive('codeBlock') ? 'bg-purple-100 text-purple-600' : ''}`}><Code2 size={16} /></button>
              {activeDropdown === 'codeBlock' && <CodeBlockDropdown editor={editor} onClose={() => setActiveDropdown(null)} />}
            </div>

            {/* Callout */}
            <div className="relative" ref={dropdownRefs.callout}>
              <button onClick={() => setActiveDropdown(activeDropdown === 'callout' ? null : 'callout')} className="p-1.5 rounded-lg hover:bg-gray-100"><MessageCircle size={16} /></button>
              {activeDropdown === 'callout' && <CalloutDropdown editor={editor} onClose={() => setActiveDropdown(null)} />}
            </div>

            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

            {/* Table */}
            <div className="relative" ref={dropdownRefs.table}>
              <button onClick={() => setActiveDropdown(activeDropdown === 'table' ? null : 'table')} className="p-1.5 rounded-lg hover:bg-gray-100 flex items-center gap-1"><TableIcon size={16} /><ChevronDown size={12} /></button>
              {activeDropdown === 'table' && <TableDropdown onInsertTable={insertTable} onTableControl={handleTableControl} />}
            </div>

            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

            {/* Links */}
            <button onClick={setLink} className="p-1.5 rounded-lg hover:bg-gray-100"><LinkIcon size={16} /></button>
            <button onClick={unsetLink} className="p-1.5 rounded-lg hover:bg-gray-100"><Unlink size={16} /></button>

            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

            {/* Media Insert */}
            <div className="relative" ref={dropdownRefs.more}>
              <button onClick={() => setActiveDropdown(activeDropdown === 'more' ? null : 'more')} className="p-1.5 rounded-lg hover:bg-gray-100"><Plus size={16} /></button>
              {activeDropdown === 'more' && (
                <div className="absolute top-full left-0 mt-1.5 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border p-2 z-[100] w-48">
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

            {/* Right Block Toggle */}
            {onToggleRightBlock && (
              <button onClick={onToggleRightBlock} className={`p-1.5 rounded-lg transition-all ${showRightBlock ? 'bg-purple-600 text-white shadow-md' : 'hover:bg-gray-100'}`}>
                {showRightBlock ? <PanelRightClose size={16} /> : <PanelRight size={16} />}
              </button>
            )}

            {/* Grammarly Toggle */}
            {onToggleGrammarly && (
              <button onClick={onToggleGrammarly} className={`p-1.5 rounded-lg transition-all ${grammarlyEnabled ? 'bg-green-600 text-white shadow-md' : 'hover:bg-gray-100'}`}>
                <SpellCheck size={16} />
              </button>
            )}

            {/* Edit Mode */}
            <button onClick={toggleEditMode} className={`p-1.5 rounded-lg transition-all ${editMode ? 'bg-purple-600 text-white shadow-lg scale-105' : 'hover:bg-gray-100'}`}>
              {editMode ? <Check size={16} /> : <Edit2 size={16} />}
            </button>

            {/* Emoji Picker */}
            <div className="relative">
              <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-1.5 rounded-lg hover:bg-gray-100"><Smile size={16} /></button>
              {showEmojiPicker && <div className="absolute top-full left-0 mt-1 z-[100]"><EmojiPicker onEmojiClick={onEmojiClick} /></div>}
            </div>

            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

            {/* Utilities */}
            <button onClick={selectAll} className="p-1.5 rounded-lg hover:bg-gray-100"><Copy size={16} /></button>
            <button onClick={copyHtml} className="p-1.5 rounded-lg hover:bg-gray-100"><Code size={16} /></button>

            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

            {/* Undo/Redo */}
            <button onClick={() => editor.chain().focus().undo().run()} className="p-1.5 rounded-lg hover:bg-gray-100"><Undo size={16} /></button>
            <button onClick={() => editor.chain().focus().redo().run()} className="p-1.5 rounded-lg hover:bg-gray-100"><Redo size={16} /></button>

            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

            {/* View Options */}
            <div className="relative" ref={dropdownRefs.view}>
              <button onClick={() => setActiveDropdown(activeDropdown === 'view' ? null : 'view')} className="p-1.5 rounded-lg hover:bg-gray-100"><Eye size={16} /></button>
              {activeDropdown === 'view' && (
                <div className="absolute top-full left-0 mt-1.5 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border p-2 z-[100] w-48">
                  <button onClick={toggleFullscreen} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-lg flex items-center gap-2">{isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />} {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</button>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-xs ml-2">
              <FileText size={12} className="text-gray-500" /><span className="font-mono">{wordCount.toLocaleString()}</span>
              <span className="text-gray-300">|</span><Clock size={12} className="text-gray-500" /><span className="font-mono">{readingTime}m</span>
              <span className="text-gray-300">|</span><TrendingUp size={12} className={getSeoScoreColor()} /><span className={`font-mono ${getSeoScoreColor()}`}>{seoScore}%</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 ml-auto">
              <button onClick={onSave} className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg text-sm hover:bg-gray-200"><Save size={14} /> Save</button>
              <button onClick={onSchedule} className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg text-sm hover:bg-gray-200"><Calendar size={14} /> Schedule</button>
              <button onClick={onPreview} className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg text-sm hover:bg-gray-200"><Eye size={14} /> Preview</button>
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
        <div className="sticky top-[57px] z-30 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-b border-purple-200 px-4 py-2 shadow-sm">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <span className="text-sm text-purple-600">Editing: {selectedMediaForControls.type}</span>
            <button onClick={clearMediaControls} className="p-1.5 hover:bg-purple-200 rounded-full"><X size={16} className="text-purple-600" /></button>
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