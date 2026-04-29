// src/components/editor/index.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Color from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import Placeholder from '@tiptap/extension-placeholder';
import { X } from 'lucide-react';
import Toolbar from './Toolbar';
import { ImageExtension } from './extensions/ImageExtension';
import MediaControls from './MediaControls';

// Custom Font Extension
const FontFamily = TextStyle.extend({
  addAttributes() {
    return {
      fontFamily: {
        default: null,
        parseHTML: element => element.style.fontFamily,
        renderHTML: attributes => {
          if (!attributes.fontFamily) return {};
          return { style: `font-family: ${attributes.fontFamily}` };
        },
      },
      fontSize: {
        default: null,
        parseHTML: element => element.style.fontSize,
        renderHTML: attributes => {
          if (!attributes.fontSize) return {};
          return { style: `font-size: ${attributes.fontSize}` };
        },
      },
    };
  },
});

// Right Block Panel Component
const RightBlockPanel = ({ data, onUpdate, onClose }) => {
  const [formData, setFormData] = useState({
    title: data?.title || '',
    message: data?.message || '',
    icon: data?.icon || '✨',
    link: data?.link || '',
    linkText: data?.linkText || 'Learn more',
    isActive: data?.isActive !== false,
    backgroundColor: data?.backgroundColor || '#f8f9fa',
    textColor: data?.textColor || '#212529'
  });

  const iconOptions = ['✨', '📧', '🎯', '💡', '🔥', '⭐', '🚀', '💎', '🎨', '📈', '🔔', '❤️'];

  const handleSave = () => {
    if (onUpdate) {
      onUpdate(formData);
    }
    onClose();
  };

  return (
    <div className="w-80 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 overflow-y-auto max-h-[600px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white">Right Block Settings</h3>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
          <X size={16} />
        </button>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Icon</label>
          <div className="grid grid-cols-6 gap-1">
            {iconOptions.map(icon => (
              <button
                key={icon}
                onClick={() => setFormData({ ...formData, icon })}
                className={`p-2 text-lg rounded-lg transition ${formData.icon === icon ? 'bg-purple-100 dark:bg-purple-900/30 ring-2 ring-purple-500' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., Want to stay updated?"
            className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-700"
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Message</label>
          <textarea
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            placeholder="Your message here..."
            rows={3}
            className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-700 resize-none"
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Link URL</label>
          <input
            type="text"
            value={formData.link}
            onChange={(e) => setFormData({ ...formData, link: e.target.value })}
            placeholder="https://..."
            className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-700"
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Link Text</label>
          <input
            type="text"
            value={formData.linkText}
            onChange={(e) => setFormData({ ...formData, linkText: e.target.value })}
            placeholder="Learn more"
            className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-700"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Background</label>
            <input
              type="color"
              value={formData.backgroundColor}
              onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
              className="w-full h-10 rounded-lg cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Text Color</label>
            <input
              type="color"
              value={formData.textColor}
              onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
              className="w-full h-10 rounded-lg cursor-pointer"
            />
          </div>
        </div>
        
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="rounded"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">Active</span>
        </label>
        
        <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: formData.backgroundColor }}>
          <div className="text-2xl mb-2">{formData.icon}</div>
          <h4 className="font-semibold mb-1" style={{ color: formData.textColor }}>{formData.title || 'Preview Title'}</h4>
          <p className="text-sm mb-2 opacity-80" style={{ color: formData.textColor }}>{formData.message || 'Preview message'}</p>
          {formData.link && (
            <a href="#" className="text-sm font-medium" style={{ color: formData.textColor }} onClick={(e) => e.preventDefault()}>
              {formData.linkText} →
            </a>
          )}
        </div>
        
        <button
          onClick={handleSave}
          className="w-full py-2.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition"
        >
          Save Right Block
        </button>
      </div>
    </div>
  );
};

// Main Editor Component
const Editor = ({ 
  content = '', 
  onChange, 
  onSave, 
  onSchedule, 
  onPublish,
  onPreview,
  title = '',
  enableGrammarly = true,
  rightBlockData = null,
  onRightBlockUpdate = null
}) => {
  const [wordCount, setWordCount] = useState(0);
  const [characterCount, setCharacterCount] = useState(0);
  const [readingTime, setReadingTime] = useState(1);
  const [seoScore, setSeoScore] = useState(0);
  const [lastSaved, setLastSaved] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showRightBlock, setShowRightBlock] = useState(false);
  const [editorContainerRef, setEditorContainerRef] = useState(null);
  const [showMediaControls, setShowMediaControls] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  
  const isInternalUpdate = useRef(false);
  const timeoutRef = useRef(null);
  const initialLoadRef = useRef(true);
  const rafRef = useRef(null);

  const calculateStats = useCallback((html) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html || '';
    const text = tempDiv.textContent || tempDiv.innerText || '';
    const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
    const chars = text.replace(/\s/g, '').length;
    const minutes = Math.max(1, Math.ceil(words / 200));
    
    setWordCount(words);
    setCharacterCount(chars);
    setReadingTime(minutes);
    
    let score = 0;
    if (words >= 1000) score += 30;
    else if (words >= 600) score += 25;
    else if (words >= 300) score += 15;
    else if (words >= 100) score += 5;
    
    const h1Count = (html?.match(/<h1/g) || []).length;
    const h2Count = (html?.match(/<h2/g) || []).length;
    if (h1Count === 1 && h2Count >= 3) score += 20;
    else if (h1Count === 1 && h2Count >= 1) score += 15;
    else if (h1Count === 1) score += 10;
    else if (h2Count >= 3) score += 10;
    
    if (html?.includes('<ul') || html?.includes('<ol')) score += 8;
    if (html?.includes('<blockquote')) score += 4;
    if (html?.includes('<table')) score += 5;
    
    setSeoScore(Math.min(score, 100));
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ 
        heading: { levels: [1, 2, 3, 4, 5, 6] },
      }),
      Underline,
      FontFamily,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-purple-600 hover:text-purple-700 underline' },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph', 'listItem', 'taskItem'],
        alignments: ['left', 'center', 'right', 'justify'],
      }),
      Highlight.configure({ multicolor: true }),
      TextStyle,
      Color,
      Table.configure({ 
        resizable: true,
        HTMLAttributes: { class: 'min-w-full border-collapse border border-gray-300' }
      }),
      TableRow,
      TableCell,
      TableHeader,
      TaskList,
      TaskItem.configure({ nested: true }),
      Placeholder.configure({
        placeholder: 'Start writing your post here...',
        emptyEditorClass: 'is-editor-empty',
        showOnlyWhenEditable: true,
      }),
      ImageExtension,
    ],
    content: content || '<p></p>',
    editable: true,
    editorProps: {
      attributes: {
        class: 'prose prose-lg dark:prose-invert max-w-none focus:outline-none min-h-[500px] px-8 py-6',
      },
      handleDOMEvents: {
        drop: (view, event) => {
          const hasFiles = event.dataTransfer?.files?.length;
          if (hasFiles) {
            event.preventDefault();
          }
          return false;
        },
      },
    },
    onUpdate: ({ editor }) => {
      isInternalUpdate.current = true;
      
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      
      rafRef.current = requestAnimationFrame(() => {
        const html = editor.getHTML();
        if (onChange) onChange(html);
        calculateStats(html);
        
        setIsSaving(true);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          setIsSaving(false);
          setLastSaved(new Date());
        }, 500);
      });
      
      setTimeout(() => { isInternalUpdate.current = false; }, 100);
    },
  });

  const handleImageInsert = useCallback((data) => {
    if (!editor) return;
    
    editor.chain()
      .focus()
      .setImage({
        src: data.src,
        alt: data.alt || '',
        title: data.title || '',
        width: data.width || '100%',
        alignment: data.alignment || 'center',
        caption: data.caption || '',
        link: data.link || '',
      })
      .run();
  }, [editor]);

  useEffect(() => {
    if (!editor) return;
    
    if (initialLoadRef.current) {
      initialLoadRef.current = false;
      calculateStats(content);
      return;
    }
    
    if (!isInternalUpdate.current) {
      const currentContent = editor.getHTML();
      if (content !== currentContent && content) {
        editor.commands.setContent(content);
      }
    }
  }, [content, editor, calculateStats]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  if (!editor) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="editor-wrapper bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-visible">
      <Toolbar 
        editor={editor}
        onSave={onSave}
        onSchedule={onSchedule}
        onPublish={onPublish}
        onPreview={onPreview}
        onImageInsert={handleImageInsert}
        wordCount={wordCount}
        readingTime={readingTime}
        seoScore={seoScore}
        showRightBlock={showRightBlock}
        onToggleRightBlock={() => setShowRightBlock(!showRightBlock)}
        rightBlockData={rightBlockData}
        onRightBlockUpdate={onRightBlockUpdate}
        editorContainerRef={editorContainerRef}
      />
      
      <div className="flex relative">
        <div 
          className={`editor-content-area transition-all duration-300 ${showRightBlock ? 'w-[calc(100%-320px)]' : 'w-full'}`}
          ref={setEditorContainerRef}
        >
          <EditorContent editor={editor} />
        </div>
        
        {showRightBlock && (
          <RightBlockPanel 
            data={rightBlockData}
            onUpdate={onRightBlockUpdate}
            onClose={() => setShowRightBlock(false)}
          />
        )}
      </div>
      
      <div className="flex items-center justify-between px-6 py-2 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-500">
        <div className="flex items-center gap-4 flex-wrap">
          <span>{wordCount.toLocaleString()} words</span>
          <span>{readingTime} min read</span>
          <span className={seoScore >= 80 ? 'text-green-600' : seoScore >= 60 ? 'text-yellow-600' : 'text-red-600'}>
            SEO: {seoScore}%
          </span>
          <span>{characterCount.toLocaleString()} chars</span>
        </div>
        <div>
          {isSaving && <span className="flex items-center gap-1"><div className="w-3 h-3 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />Saving...</span>}
          {lastSaved && !isSaving && <span>✓ Saved {lastSaved.toLocaleTimeString()}</span>}
        </div>
      </div>

      {/* CRITICAL CSS TO FIX IMAGE PLACEMENT */}
      <style jsx global>{`
        .editor-wrapper {
          position: relative;
          isolation: isolate;
          overflow: visible !important;
        }
        
        .editor-content-area {
          position: relative;
          overflow: visible !important;
        }
        
        .ProseMirror {
          position: relative;
          overflow: visible !important;
          min-height: 500px;
        }
        
        /* Clearfix - THIS IS KEY FOR FLOATING IMAGES */
        .ProseMirror::after {
          content: '';
          display: table;
          clear: both;
        }
        
        /* Ensure paragraphs clear floating images */
        .ProseMirror p {
          margin-bottom: 1em;
          clear: none;
        }
        
        /* Force clear after floating images */
        .ProseMirror p:last-of-type {
          clear: both;
        }
        
        /* Image wrapper styles - CRITICAL */
        .image-wrapper {
          display: block;
          margin: 1rem 0;
          max-width: 100%;
        }
        
        /* Left aligned images */
        .image-wrapper[style*="float: left"] {
          margin: 0.5rem 1.5rem 0.5rem 0;
          clear: none;
        }
        
        /* Right aligned images */
        .image-wrapper[style*="float: right"] {
          margin: 0.5rem 0 0.5rem 1.5rem;
          clear: none;
        }
        
        /* Center aligned images */
        .image-wrapper[style*="margin-left: auto"] {
          margin: 1.5rem auto;
          clear: both;
        }
        
        /* Prevent text from wrapping too tightly around images */
        .ProseMirror p:has(+ .image-wrapper[style*="float"]),
        .ProseMirror .image-wrapper[style*="float"] + p {
          clear: none;
        }
        
        /* Image styling */
        .image-wrapper img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        /* Caption styling */
        .image-wrapper .caption-text {
          margin-top: 0.5rem;
          font-size: 0.875rem;
          color: #6b7280;
          text-align: center;
          font-style: italic;
        }
        
        /* Responsive images */
        @media (max-width: 768px) {
          .image-wrapper[style*="float: left"],
          .image-wrapper[style*="float: right"] {
            float: none !important;
            margin: 1rem auto !important;
            text-align: center;
          }
        }
        
        /* Loading animation */
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        
        /* Dropdown z-index */
        [class*="dropdown"],
        [class*="popup"],
        [class*="modal"],
        .tippy-box {
          z-index: 9999 !important;
        }
      `}</style>
    </div>
  );
};

export default Editor;