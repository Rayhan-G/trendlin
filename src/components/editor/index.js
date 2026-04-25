import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Color from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Placeholder from '@tiptap/extension-placeholder';

const Editor = ({ 
  content = '', 
  onChange, 
  onSave, 
  onPublish,
  title = ''
}) => {
  const [wordCount, setWordCount] = useState(0);
  const [characterCount, setCharacterCount] = useState(0);
  const [readingTime, setReadingTime] = useState(1);
  const [seoScore, setSeoScore] = useState(0);
  const [lastSaved, setLastSaved] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const isInternalUpdate = useRef(false);
  const timeoutRef = useRef(null);
  const initialLoadRef = useRef(true);

  const calculateStats = useCallback((html) => {
    const text = html?.replace(/<[^>]*>/g, '') || '';
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
    
    setSeoScore(Math.min(score, 100));
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ 
        heading: { levels: [1, 2, 3, 4, 5, 6] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-blue-600 hover:text-blue-700 underline' },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
      }),
      Highlight,
      TextStyle,
      Color,
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      TaskList,
      TaskItem.configure({ nested: true }),
      Placeholder.configure({
        placeholder: 'Start writing your post here...',
        emptyEditorClass: 'is-editor-empty',
      }),
    ],
    content: content || '<p></p>',
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[400px] px-4 py-3',
      },
    },
    onUpdate: ({ editor }) => {
      isInternalUpdate.current = true;
      const html = editor.getHTML();
      if (onChange) onChange(html);
      calculateStats(html);
      
      setIsSaving(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setIsSaving(false);
        setLastSaved(new Date());
      }, 500);
      
      setTimeout(() => { isInternalUpdate.current = false; }, 100);
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (initialLoadRef.current) {
      initialLoadRef.current = false;
      calculateStats(content);
      return;
    }
    if (!isInternalUpdate.current) {
      const cur = editor.getHTML();
      if (content !== cur && content) {
        editor.commands.setContent(content);
      }
    }
  }, [content, editor, calculateStats]);

  useEffect(() => () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  if (!editor) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Toolbar Component
  const Toolbar = () => (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 bg-gray-50 sticky top-0 z-10">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-2 rounded hover:bg-gray-200 transition ${editor.isActive('bold') ? 'bg-gray-200 text-purple-600' : 'text-gray-700'}`}
        title="Bold (Ctrl+B)"
      >
        <strong>B</strong>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-2 rounded hover:bg-gray-200 transition ${editor.isActive('italic') ? 'bg-gray-200 text-purple-600' : 'text-gray-700'}`}
        title="Italic (Ctrl+I)"
      >
        <em>I</em>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`p-2 rounded hover:bg-gray-200 transition ${editor.isActive('underline') ? 'bg-gray-200 text-purple-600' : 'text-gray-700'}`}
        title="Underline (Ctrl+U)"
      >
        <u>U</u>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`p-2 rounded hover:bg-gray-200 transition ${editor.isActive('strike') ? 'bg-gray-200 text-purple-600' : 'text-gray-700'}`}
        title="Strikethrough"
      >
        <s>S</s>
      </button>
      
      <div className="w-px h-6 bg-gray-300 mx-1" />
      
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`p-2 rounded hover:bg-gray-200 transition text-xs font-bold ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-200 text-purple-600' : 'text-gray-700'}`}
        title="Heading 1"
      >
        H1
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-2 rounded hover:bg-gray-200 transition text-xs font-bold ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-200 text-purple-600' : 'text-gray-700'}`}
        title="Heading 2"
      >
        H2
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`p-2 rounded hover:bg-gray-200 transition text-xs font-bold ${editor.isActive('heading', { level: 3 }) ? 'bg-gray-200 text-purple-600' : 'text-gray-700'}`}
        title="Heading 3"
      >
        H3
      </button>
      
      <div className="w-px h-6 bg-gray-300 mx-1" />
      
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-2 rounded hover:bg-gray-200 transition ${editor.isActive('bulletList') ? 'bg-gray-200 text-purple-600' : 'text-gray-700'}`}
        title="Bullet List"
      >
        • List
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-2 rounded hover:bg-gray-200 transition ${editor.isActive('orderedList') ? 'bg-gray-200 text-purple-600' : 'text-gray-700'}`}
        title="Numbered List"
      >
        1. List
      </button>
      <button
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        className={`p-2 rounded hover:bg-gray-200 transition ${editor.isActive('taskList') ? 'bg-gray-200 text-purple-600' : 'text-gray-700'}`}
        title="Task List"
      >
        ✓ Task
      </button>
      
      <div className="w-px h-6 bg-gray-300 mx-1" />
      
      <button
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        className={`p-2 rounded hover:bg-gray-200 transition ${editor.isActive({ textAlign: 'left' }) ? 'bg-gray-200 text-purple-600' : 'text-gray-700'}`}
        title="Align Left"
      >
        ←
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        className={`p-2 rounded hover:bg-gray-200 transition ${editor.isActive({ textAlign: 'center' }) ? 'bg-gray-200 text-purple-600' : 'text-gray-700'}`}
        title="Align Center"
      >
        ↔
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        className={`p-2 rounded hover:bg-gray-200 transition ${editor.isActive({ textAlign: 'right' }) ? 'bg-gray-200 text-purple-600' : 'text-gray-700'}`}
        title="Align Right"
      >
        →
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign('justify').run()}
        className={`p-2 rounded hover:bg-gray-200 transition ${editor.isActive({ textAlign: 'justify' }) ? 'bg-gray-200 text-purple-600' : 'text-gray-700'}`}
        title="Justify"
      >
        ≡
      </button>
      
      <div className="w-px h-6 bg-gray-300 mx-1" />
      
      <button
        onClick={() => {
          const url = window.prompt('Enter URL:');
          if (url && url.trim()) {
            editor.chain().focus().setLink({ href: url }).run();
          }
        }}
        className={`p-2 rounded hover:bg-gray-200 transition ${editor.isActive('link') ? 'bg-gray-200 text-purple-600' : 'text-gray-700'}`}
        title="Add Link"
      >
        🔗
      </button>
      <button
        onClick={() => {
          const url = window.prompt('Enter image URL:');
          if (url && url.trim()) {
            editor.chain().focus().setImage({ src: url }).run();
          }
        }}
        className="p-2 rounded hover:bg-gray-200 transition text-gray-700"
        title="Add Image"
      >
        🖼️
      </button>
      
      <div className="w-px h-6 bg-gray-300 mx-1" />
      
      <button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className="p-2 rounded hover:bg-gray-200 transition text-gray-700 disabled:opacity-50"
        title="Undo"
      >
        ↩
      </button>
      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className="p-2 rounded hover:bg-gray-200 transition text-gray-700 disabled:opacity-50"
        title="Redo"
      >
        ↪
      </button>
      
      <div className="flex-1" />
      
      <div className="flex items-center gap-3 text-xs text-gray-500">
        <span>{wordCount} words</span>
        <span>{readingTime} min read</span>
        <span className={seoScore >= 80 ? 'text-green-600' : seoScore >= 60 ? 'text-yellow-600' : 'text-red-600'}>
          SEO: {seoScore}%
        </span>
      </div>
      
      {onSave && (
        <button
          onClick={onSave}
          disabled={isSaving}
          className="px-3 py-1.5 bg-gray-200 rounded-lg text-sm hover:bg-gray-300 disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Draft'}
        </button>
      )}
      
      {onPublish && (
        <button
          onClick={onPublish}
          className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700"
        >
          Publish
        </button>
      )}
    </div>
  );

  return (
    <div className="editor-wrapper bg-white rounded-xl border border-gray-200 overflow-hidden">
      <Toolbar />
      <EditorContent editor={editor} />
      <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 text-xs text-gray-400">
        {lastSaved && !isSaving && <span>✓ Last saved: {lastSaved.toLocaleTimeString()}</span>}
        {isSaving && <span className="flex items-center gap-1"><div className="w-3 h-3 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" /> Saving...</span>}
      </div>
    </div>
  );
};

export default Editor;