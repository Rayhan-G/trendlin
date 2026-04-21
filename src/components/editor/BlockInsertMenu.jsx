// src/components/Editor/BlockInsertMenu.jsx
import React, { useState } from 'react'
import { 
  X, Search, Type, Image, Video, Music, FileText, Code,
  BarChart3, ShoppingBag, DollarSign, TrendingUp,
  MessageSquare, Sparkles, Layout, Globe, Package
} from 'lucide-react'

const BLOCK_TYPES = [
  {
    category: 'Content',
    items: [
      { id: 'text', name: 'Text Block', icon: Type, description: 'Rich text content', defaultIcon: '📝' },
      { id: 'heading', name: 'Heading Block', icon: Type, description: 'Section heading', defaultIcon: '📌' },
      { id: 'quote', name: 'Quote Block', icon: MessageSquare, description: 'Highlight quotes', defaultIcon: '💬' },
      { id: 'code', name: 'Code Block', icon: Code, description: 'Code snippets', defaultIcon: '💻' },
    ]
  },
  {
    category: 'Media',
    items: [
      { id: 'image', name: 'Image Block', icon: Image, description: 'Single image', defaultIcon: '🖼️' },
      { id: 'gallery', name: 'Gallery Block', icon: Layout, description: 'Image gallery', defaultIcon: '🖼️' },
      { id: 'video', name: 'Video Block', icon: Video, description: 'Video content', defaultIcon: '🎬' },
      { id: 'audio', name: 'Audio Block', icon: Music, description: 'Audio player', defaultIcon: '🎵' },
      { id: 'embed', name: 'Embed Block', icon: Globe, description: 'Social embeds', defaultIcon: '🌐' },
    ]
  },
  {
    category: 'Marketing',
    items: [
      { id: 'poll', name: 'Poll Block', icon: BarChart3, description: 'Interactive poll', defaultIcon: '📊' },
      { id: 'affiliate', name: 'Affiliate Block', icon: ShoppingBag, description: 'Product links', defaultIcon: '🛍️' },
      { id: 'ad', name: 'Ad Block', icon: DollarSign, description: 'Advertisement', defaultIcon: '💰' },
      { id: 'cta', name: 'CTA Block', icon: TrendingUp, description: 'Call to action', defaultIcon: '🎯' },
      { id: 'newsletter', name: 'Newsletter Block', icon: Sparkles, description: 'Email signup', defaultIcon: '📧' },
    ]
  },
]

const BlockInsertMenu = ({ editor, onClose, onInsert, position }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  
  const filteredBlocks = BLOCK_TYPES.flatMap(cat => 
    cat.items.filter(item => 
      (selectedCategory === 'all' || cat.category === selectedCategory) &&
      (item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       item.description.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  )
  
  const handleInsertBlock = (block) => {
    onInsert(block)
    onClose()
  }
  
  return (
    <div 
      className="fixed z-50 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 w-80 overflow-hidden"
      style={{ top: position?.y || '50%', left: position?.x || '50%', transform: 'translate(-50%, -50%)' }}
    >
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Package size={18} className="text-purple-600" />
            Insert Block
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"><X size={16} /></button>
        </div>
        
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search blocks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600"
            autoFocus
          />
        </div>
      </div>
      
      <div className="flex gap-1 p-2 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        <button onClick={() => setSelectedCategory('all')} className={`px-3 py-1 text-xs rounded-full whitespace-nowrap transition ${selectedCategory === 'all' ? 'bg-purple-600 text-white' : 'hover:bg-gray-100'}`}>All</button>
        {BLOCK_TYPES.map(cat => (
          <button key={cat.category} onClick={() => setSelectedCategory(cat.category)} className={`px-3 py-1 text-xs rounded-full whitespace-nowrap transition ${selectedCategory === cat.category ? 'bg-purple-600 text-white' : 'hover:bg-gray-100'}`}>{cat.category}</button>
        ))}
      </div>
      
      <div className="max-h-96 overflow-y-auto p-2">
        <div className="space-y-1">
          {filteredBlocks.map(block => {
            const Icon = block.icon
            return (
              <button key={block.id} onClick={() => handleInsertBlock(block)} className="w-full text-left p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center group-hover:scale-110 transition">
                    <Icon size={20} className="text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-gray-900 dark:text-white">{block.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{block.description}</p>
                  </div>
                  <span className="text-lg opacity-0 group-hover:opacity-100 transition">{block.defaultIcon}</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default BlockInsertMenu