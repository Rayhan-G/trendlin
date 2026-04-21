// src/components/editor/index.js - UPDATED WITH PORTAL DROPDOWNS
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TextStyle from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Typography from '@tiptap/extension-typography';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { useState, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, 
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Link as LinkIcon, Image as ImageIcon,
  Code, Square, CheckSquare, Table as TableIcon,
  Undo, Redo, Heading1, Heading2, Heading3,
  Highlighter, Palette, Quote, Minus, Plus
} from 'lucide-react';

// Portal Dropdown Component
const PortalDropdown = ({ isOpen, onClose, children, anchorRef }) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (isOpen && anchorRef?.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY + 5,
        left: rect.left + window.scrollX,
      });
    }
  }, [isOpen, anchorRef]);

  if (!isOpen) return null;

  return createPortal(
    <>
      <div
        className="portal-dropdown-overlay"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9998,
        }}
        onClick={onClose}
      />
      <div
        className="portal-dropdown"
        style={{
          position: 'absolute',
          top: position.top,
          left: position.left,
          zIndex: 9999,
        }}
      >
        {children}
      </div>
    </>,
    document.body
  );
};

const MenuBar = ({ editor }) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const colorPickerRef = useRef(null);
  const linkModalRef = useRef(null);

  if (!editor) return null;

  const addLink = () => {
    if (linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run();
      setLinkUrl('');
      setShowLinkModal(false);
    }
  };

  const addImage = () => {
    const url = window.prompt('Enter image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const addTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  return (
    <div className="editor-toolbar">
      <div className="toolbar-group">
        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="toolbar-btn"
          title="Undo"
        >
          <Undo size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="toolbar-btn"
          title="Redo"
        >
          <Redo size={16} />
        </button>
      </div>

      <div className="toolbar-divider"></div>

      <div className="toolbar-group">
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`toolbar-btn ${editor.isActive('heading', { level: 1 }) ? 'active' : ''}`}
          title="Heading 1"
        >
          <Heading1 size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`toolbar-btn ${editor.isActive('heading', { level: 2 }) ? 'active' : ''}`}
          title="Heading 2"
        >
          <Heading2 size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`toolbar-btn ${editor.isActive('heading', { level: 3 }) ? 'active' : ''}`}
          title="Heading 3"
        >
          <Heading3 size={16} />
        </button>
      </div>

      <div className="toolbar-divider"></div>

      <div className="toolbar-group">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`toolbar-btn ${editor.isActive('bold') ? 'active' : ''}`}
          title="Bold"
        >
          <Bold size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`toolbar-btn ${editor.isActive('italic') ? 'active' : ''}`}
          title="Italic"
        >
          <Italic size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`toolbar-btn ${editor.isActive('underline') ? 'active' : ''}`}
          title="Underline"
        >
          <UnderlineIcon size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`toolbar-btn ${editor.isActive('strike') ? 'active' : ''}`}
          title="Strikethrough"
        >
          <Strikethrough size={16} />
        </button>
      </div>

      <div className="toolbar-divider"></div>

      <div className="toolbar-group">
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`toolbar-btn ${editor.isActive('bulletList') ? 'active' : ''}`}
          title="Bullet List"
        >
          <List size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`toolbar-btn ${editor.isActive('orderedList') ? 'active' : ''}`}
          title="Numbered List"
        >
          <ListOrdered size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          className={`toolbar-btn ${editor.isActive('taskList') ? 'active' : ''}`}
          title="Task List"
        >
          <CheckSquare size={16} />
        </button>
      </div>

      <div className="toolbar-divider"></div>

      <div className="toolbar-group">
        <button
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`toolbar-btn ${editor.isActive({ textAlign: 'left' }) ? 'active' : ''}`}
          title="Align Left"
        >
          <AlignLeft size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`toolbar-btn ${editor.isActive({ textAlign: 'center' }) ? 'active' : ''}`}
          title="Align Center"
        >
          <AlignCenter size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`toolbar-btn ${editor.isActive({ textAlign: 'right' }) ? 'active' : ''}`}
          title="Align Right"
        >
          <AlignRight size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          className={`toolbar-btn ${editor.isActive({ textAlign: 'justify' }) ? 'active' : ''}`}
          title="Justify"
        >
          <AlignJustify size={16} />
        </button>
      </div>

      <div className="toolbar-divider"></div>

      <div className="toolbar-group">
        <div className="relative" ref={colorPickerRef}>
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="toolbar-btn"
            title="Text Color"
          >
            <Palette size={16} />
          </button>
          <PortalDropdown
            isOpen={showColorPicker}
            onClose={() => setShowColorPicker(false)}
            anchorRef={colorPickerRef}
          >
            <div className="color-picker-dropdown">
              <button onClick={() => editor.chain().focus().setColor('#000000').run()} className="color-option black">Black</button>
              <button onClick={() => editor.chain().focus().setColor('#ef4444').run()} className="color-option red">Red</button>
              <button onClick={() => editor.chain().focus().setColor('#3b82f6').run()} className="color-option blue">Blue</button>
              <button onClick={() => editor.chain().focus().setColor('#10b981').run()} className="color-option green">Green</button>
              <button onClick={() => editor.chain().focus().setColor('#f59e0b').run()} className="color-option orange">Orange</button>
              <button onClick={() => editor.chain().focus().setColor('#8b5cf6').run()} className="color-option purple">Purple</button>
              <button onClick={() => editor.chain().focus().unsetColor().run()} className="color-option reset">Reset</button>
            </div>
          </PortalDropdown>
        </div>
        <button
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          className={`toolbar-btn ${editor.isActive('highlight') ? 'active' : ''}`}
          title="Highlight"
        >
          <Highlighter size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`toolbar-btn ${editor.isActive('blockquote') ? 'active' : ''}`}
          title="Quote"
        >
          <Quote size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="toolbar-btn"
          title="Divider"
        >
          <Minus size={16} />
        </button>
      </div>

      <div className="toolbar-divider"></div>

      <div className="toolbar-group">
        <div className="relative" ref={linkModalRef}>
          <button
            onClick={() => setShowLinkModal(!showLinkModal)}
            className={`toolbar-btn ${editor.isActive('link') ? 'active' : ''}`}
            title="Add Link"
          >
            <LinkIcon size={16} />
          </button>
          <PortalDropdown
            isOpen={showLinkModal}
            onClose={() => setShowLinkModal(false)}
            anchorRef={linkModalRef}
          >
            <div className="link-modal">
              <input
                type="text"
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addLink()}
              />
              <button onClick={addLink}>Add</button>
              <button onClick={() => setShowLinkModal(false)}>Cancel</button>
            </div>
          </PortalDropdown>
        </div>
        <button
          onClick={addImage}
          className="toolbar-btn"
          title="Add Image"
        >
          <ImageIcon size={16} />
        </button>
        <button
          onClick={addTable}
          className="toolbar-btn"
          title="Add Table"
        >
          <TableIcon size={16} />
        </button>
      </div>

      <style jsx>{`
        .editor-toolbar {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 4px;
          padding: 8px 12px;
          background: #ffffff;
          border-bottom: 1px solid #e2e8f0;
          position: sticky;
          top: 0;
          z-index: 50;
        }
        .toolbar-group {
          display: flex;
          align-items: center;
          gap: 2px;
        }
        .toolbar-divider {
          width: 1px;
          height: 24px;
          background: #e2e8f0;
          margin: 0 4px;
        }
        .toolbar-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 6px 10px;
          border-radius: 6px;
          background: transparent;
          border: none;
          cursor: pointer;
          color: #475569;
          transition: all 0.2s;
        }
        .toolbar-btn:hover {
          background: #f1f5f9;
          color: #1e293b;
        }
        .toolbar-btn.active {
          background: #e2e8f0;
          color: #3b82f6;
        }
        .toolbar-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .relative {
          position: relative;
        }
        .color-picker-dropdown {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 4px;
          min-width: 120px;
        }
        .color-option {
          padding: 6px 12px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          text-align: left;
        }
        .color-option.black { background: #000; color: white; }
        .color-option.red { background: #ef4444; color: white; }
        .color-option.blue { background: #3b82f6; color: white; }
        .color-option.green { background: #10b981; color: white; }
        .color-option.orange { background: #f59e0b; color: white; }
        .color-option.purple { background: #8b5cf6; color: white; }
        .color-option.reset { background: #f1f5f9; color: #1e293b; }
        .link-modal {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          display: flex;
          gap: 8px;
          min-width: 250px;
        }
        .link-modal input {
          flex: 1;
          padding: 6px 10px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-size: 14px;
        }
        .link-modal button {
          padding: 6px 12px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
        }
        .link-modal button:first-of-type {
          background: #3b82f6;
          color: white;
        }
        .link-modal button:last-of-type {
          background: #f1f5f9;
          color: #475569;
        }
        @media (max-width: 768px) {
          .editor-toolbar {
            padding: 6px 8px;
            gap: 2px;
          }
          .toolbar-btn {
            padding: 4px 8px;
          }
          .toolbar-btn svg {
            width: 14px;
            height: 14px;
          }
          .color-picker-dropdown {
            min-width: 160px;
          }
          .link-modal {
            min-width: 280px;
          }
        }
      `}</style>
    </div>
  );
};

export default function Editor({ content, onChange, title, onSave, onPublish }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Placeholder.configure({
        placeholder: 'Start writing your amazing content here...',
      }),
      TextStyle,
      Color,
      Highlight,
      Typography,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableCell,
      TableHeader,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
    ],
    content: content || '',
    editorProps: {
      attributes: {
        class: 'editor-content',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
  });

  // Ensure lists work properly and add padding for dropdowns
  useEffect(() => {
    if (editor) {
      const editorElement = document.querySelector('.ProseMirror');
      if (editorElement) {
        editorElement.style.paddingBottom = '200px';
        editorElement.style.minHeight = '500px';
      }
    }
  }, [editor]);

  return (
    <div className="editor-wrapper">
      <MenuBar editor={editor} />
      <div className="editor-content-area">
        <EditorContent editor={editor} />
      </div>
      <style jsx>{`
        .editor-wrapper {
          position: relative;
          width: 100%;
          background: white;
          border-radius: 12px;
          overflow: visible;
        }
        .editor-content-area {
          position: relative;
          overflow: visible;
          min-height: 500px;
        }
        :global(.editor-content) {
          min-height: 500px;
          padding: 1.5rem;
          outline: none;
          overflow-y: auto;
        }
        :global(.ProseMirror) {
          min-height: 500px;
          padding: 1.5rem;
          padding-bottom: 200px !important;
          outline: none;
        }
        :global(.ProseMirror ul),
        :global(.ProseMirror ol) {
          padding-left: 1.5rem;
          margin: 1rem 0;
        }
        :global(.ProseMirror li) {
          margin: 0.25rem 0;
        }
        :global(.ProseMirror ul[data-type="taskList"]) {
          list-style: none;
          padding-left: 0;
        }
        :global(.ProseMirror ul[data-type="taskList"] li) {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        :global(.ProseMirror ul[data-type="taskList"] li input) {
          margin: 0;
        }
        :global(.ProseMirror p.is-editor-empty:first-child::before) {
          content: attr(data-placeholder);
          float: left;
          color: #94a3b8;
          pointer-events: none;
          height: 0;
        }
        :global(.ProseMirror table) {
          border-collapse: collapse;
          width: 100%;
          margin: 1rem 0;
        }
        :global(.ProseMirror th),
        :global(.ProseMirror td) {
          border: 1px solid #e2e8f0;
          padding: 0.5rem;
        }
        :global(.ProseMirror th) {
          background: #f8fafc;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}