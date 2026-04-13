import { useState, useRef, useEffect, useCallback } from 'react'

export default function UltimateEditor({ value, onChange, placeholder = 'Start writing...' }) {
  const editorRef = useRef(null)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showBgColorPicker, setShowBgColorPicker] = useState(false)
  const [showFontPicker, setShowFontPicker] = useState(false)
  const [showSizePicker, setShowSizePicker] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showTableCreator, setShowTableCreator] = useState(false)
  const [showTemplatePicker, setShowTemplatePicker] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [showMobileToolbar, setShowMobileToolbar] = useState(false)
  const [selectedColor, setSelectedColor] = useState('#000000')
  const [selectedBgColor, setSelectedBgColor] = useState('#ffffff')
  const [selectedFont, setSelectedFont] = useState('Inter')
  const [selectedSize, setSelectedSize] = useState('16px')
  const [tableRows, setTableRows] = useState(3)
  const [tableCols, setTableCols] = useState(3)

  const fonts = [
    'Inter', 'Georgia', 'Merriweather', 'Montserrat', 'Playfair Display',
    'Roboto', 'Lora', 'Open Sans', 'Poppins', 'DM Sans', 'Cormorant Garamond',
    'Source Code Pro', 'Fira Code', 'Courier New', 'Arial', 'Times New Roman',
    'Verdana', 'Helvetica', 'Calibri', 'Garamond', 'Tahoma', 'Trebuchet MS'
  ]

  const colors = [
    '#000000', '#FFFFFF', '#10b981', '#3b82f6', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899',
    '#14b8a6', '#f97316', '#6366f1', '#d946ef', '#06b6d4', '#84cc16', '#f43f5e', '#64748b',
    '#1e293b', '#475569', '#94a3b8', '#cbd5e1', '#f1f5f9', '#0f172a', '#334155', '#e2e8f0',
    '#dc2626', '#ea580c', '#d97706', '#65a30d', '#16a34a', '#0d9488', '#0891b2', '#2563eb',
    '#4f46e5', '#7c3aed', '#c026d3', '#db2777', '#e11d48'
  ]

  const fontSizes = ['10px', '11px', '12px', '13px', '14px', '15px', '16px', '17px', '18px', '20px', '22px', '24px', '26px', '28px', '32px', '36px', '40px', '48px', '56px', '64px', '72px', '84px', '96px']
  const lineHeights = ['1.2', '1.3', '1.4', '1.5', '1.6', '1.7', '1.8', '1.9', '2.0', '2.2', '2.5']
  const letterSpacings = ['normal', '-0.5px', '-0.3px', '-0.1px', '0px', '0.1px', '0.3px', '0.5px', '1px', '2px', '3px', '4px', '5px']

  const templates = {
    'Blog Post': '<article>\n  <h1>Your Blog Title</h1>\n  <p>Introduction paragraph that hooks the reader...</p>\n  \n  <h2>Main Section Heading</h2>\n  <p>Your main content here with valuable information...</p>\n  \n  <h3>Subheading</h3>\n  <ul>\n    <li>Key point 1</li>\n    <li>Key point 2</li>\n    <li>Key point 3</li>\n  </ul>\n  \n  <blockquote>Important quote or takeaway</blockquote>\n  \n  <h2>Conclusion</h2>\n  <p>Summarize your main points and include a call to action...</p>\n</article>',
    
    'Product Review': '<div class="review">\n  <h1>Product Review: [Product Name]</h1>\n  <div class="rating">⭐⭐⭐⭐⭐ (5/5)</div>\n  <p><strong>Verdict:</strong> Overall recommendation and summary...</p>\n  \n  <h2>Pros ✅</h2>\n  <ul>\n    <li>Pro 1</li>\n    <li>Pro 2</li>\n    <li>Pro 3</li>\n  </ul>\n  \n  <h2>Cons ❌</h2>\n  <ul>\n    <li>Con 1</li>\n    <li>Con 2</li>\n  </ul>\n  \n  <h2>Final Verdict</h2>\n  <p>Final thoughts and whether to buy...</p>\n</div>',
    
    'Tutorial/How-to': '<div class="tutorial">\n  <h1>How to [Do Something]</h1>\n  <p>In this tutorial, you\'ll learn everything about...</p>\n  \n  <h2>Prerequisites</h2>\n  <ul>\n    <li>Item 1</li>\n    <li>Item 2</li>\n    <li>Item 3</li>\n  </ul>\n  \n  <h2>Step 1: First Step</h2>\n  <p>Detailed instructions with examples...</p>\n  \n  <div class="tip">\n    <strong>💡 Pro Tip:</strong> Helpful advice here\n  </div>\n  \n  <h2>Step 2: Second Step</h2>\n  <p>Continue with detailed instructions...</p>\n  \n  <h2>Conclusion</h2>\n  <p>Summary of what you learned and next steps...</p>\n</div>',
    
    'News Article': '<article class="news">\n  <h1>Breaking: [Headline]</h1>\n  <p class="dateline">[Location] — </p>\n  <p><strong>Lead paragraph with most important information...</strong></p>\n  \n  <h2>Background</h2>\n  <p>Context and background information...</p>\n  \n  <h2>Key Developments</h2>\n  <p>Latest updates and developments...</p>\n  \n  <h2>What\'s Next</h2>\n  <p>Future implications and what to expect...</p>\n</article>',
    
    'Listicle': '<div class="listicle">\n  <h1>[Number] Ways to [Achieve Something]</h1>\n  <p>Introduction explaining why this matters...</p>\n  \n  <h2>1. First Way</h2>\n  <p>Detailed explanation of first method...</p>\n  \n  <h2>2. Second Way</h2>\n  <p>Detailed explanation of second method...</p>\n  \n  <h2>3. Third Way</h2>\n  <p>Detailed explanation of third method...</p>\n  \n  <h2>Conclusion</h2>\n  <p>Summary and final thoughts...</p>\n</div>'
  }

  const emojis = ['😀', '😂', '😍', '🤔', '😎', '🔥', '💯', '✨', '🌟', '⭐', '💡', '🎯', '📌', '🔗', '💪', '🎉', '🚀', '💎', '👏', '🙌', '🤝', '💼', '📊', '🎨', '🖼️', '📝', '✍️', '📖', '🏆']

  const insertAtCursor = (html) => {
    const textarea = editorRef.current
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = textarea.value
    const newText = text.substring(0, start) + html + text.substring(end)
    onChange(newText)
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + html.length, start + html.length)
    }, 10)
  }

  const wrapSelection = (before, after = '') => {
    const textarea = editorRef.current
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = textarea.value.substring(start, end)
    if (!selected) return
    const newText = textarea.value.substring(0, start) + before + selected + after + textarea.value.substring(end)
    onChange(newText)
  }

  const applyStyle = (tag, style, value) => {
    wrapSelection(`<${tag} style="${style}: ${value}">`, `</${tag}>`)
  }

  const insertTemplate = (templateName) => {
    insertAtCursor(templates[templateName])
    setShowTemplatePicker(false)
  }

  const insertEmoji = (emoji) => {
    insertAtCursor(emoji)
    setShowEmojiPicker(false)
  }

  const insertTable = () => {
    let table = '<table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%; margin: 1rem 0;">\n'
    for (let i = 0; i < tableRows; i++) {
      table += '  <tr>\n'
      for (let j = 0; j < tableCols; j++) {
        table += `    <td style="border: 1px solid #ddd; padding: 8px;">Cell ${i+1}-${j+1}</td>\n`
      }
      table += '  </tr>\n'
    }
    table += '</table>'
    insertAtCursor(table)
    setShowTableCreator(false)
  }

  return (
    <div className="ultimate-editor">
      {/* Mobile Toolbar Toggle */}
      <div className="mobile-toolbar-toggle">
        <button onClick={() => setShowMobileToolbar(!showMobileToolbar)} className="mobile-toggle-btn">
          {showMobileToolbar ? '✕ Close Formatting' : '✎ Open Formatting Toolbar'}
        </button>
      </div>

      {/* Main Toolbar - Desktop */}
      <div className={`toolbar-row desktop-toolbar ${showMobileToolbar ? 'mobile-visible' : ''}`}>
        <div className="toolbar-group">
          <button onClick={() => insertAtCursor('<h1>Heading 1</h1>')} className="toolbar-btn" title="Heading 1">H1</button>
          <button onClick={() => insertAtCursor('<h2>Heading 2</h2>')} className="toolbar-btn" title="Heading 2">H2</button>
          <button onClick={() => insertAtCursor('<h3>Heading 3</h3>')} className="toolbar-btn" title="Heading 3">H3</button>
          <button onClick={() => insertAtCursor('<h4>Heading 4</h4>')} className="toolbar-btn" title="Heading 4">H4</button>
          <button onClick={() => insertAtCursor('<p>Paragraph</p>')} className="toolbar-btn" title="Paragraph">¶</button>
        </div>
        
        <div className="toolbar-divider" />
        
        <div className="toolbar-group">
          <button onClick={() => wrapSelection('<strong>', '</strong>')} className="toolbar-btn" title="Bold (Ctrl+B)"><strong>B</strong></button>
          <button onClick={() => wrapSelection('<em>', '</em>')} className="toolbar-btn" title="Italic (Ctrl+I)"><em>I</em></button>
          <button onClick={() => wrapSelection('<u>', '</u>')} className="toolbar-btn" title="Underline (Ctrl+U)"><u>U</u></button>
          <button onClick={() => wrapSelection('<del>', '</del>')} className="toolbar-btn" title="Strikethrough"><del>S</del></button>
          <button onClick={() => wrapSelection('<code>', '</code>')} className="toolbar-btn" title="Inline Code">Code</button>
          <button onClick={() => wrapSelection('<mark>', '</mark>')} className="toolbar-btn" title="Highlight">✨</button>
        </div>
        
        <div className="toolbar-divider" />
        
        <div className="toolbar-group">
          <button onClick={() => insertAtCursor('<ul>\n  <li>Item 1</li>\n  <li>Item 2</li>\n</ul>')} className="toolbar-btn" title="Bullet List">• List</button>
          <button onClick={() => insertAtCursor('<ol>\n  <li>First</li>\n  <li>Second</li>\n</ol>')} className="toolbar-btn" title="Numbered List">1. List</button>
          <button onClick={() => insertAtCursor('<blockquote>Quote</blockquote>')} className="toolbar-btn" title="Quote">“ ”</button>
          <button onClick={() => insertAtCursor('<pre><code>Code block</code></pre>')} className="toolbar-btn" title="Code Block">{'</>'}</button>
          <button onClick={() => insertAtCursor('<hr />')} className="toolbar-btn" title="Divider">—</button>
        </div>
        
        <div className="toolbar-divider" />
        
        <div className="toolbar-group">
          <button onClick={() => insertAtCursor('<a href="#">Link</a>')} className="toolbar-btn" title="Insert Link">🔗 Link</button>
          <button onClick={() => insertAtCursor('<img src="image.jpg" alt="Image" style="max-width:100%; border-radius:12px;">')} className="toolbar-btn" title="Insert Image">🖼️ Image</button>
          <button onClick={() => insertAtCursor('<video src="video.mp4" controls style="max-width:100%;"></video>')} className="toolbar-btn" title="Insert Video">🎥 Video</button>
          <button onClick={() => insertAtCursor('<audio src="audio.mp3" controls></audio>')} className="toolbar-btn" title="Insert Audio">🎵 Audio</button>
          <button onClick={() => insertAtCursor('<iframe src="https://www.youtube.com/embed/" width="100%" height="400" frameborder="0" allowfullscreen></iframe>')} className="toolbar-btn" title="Embed YouTube">📺 Embed</button>
        </div>
        
        <div className="toolbar-divider" />
        
        <div className="toolbar-group">
          <button onClick={() => setShowTableCreator(true)} className="toolbar-btn" title="Insert Table">⊞ Table</button>
          <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="toolbar-btn" title="Insert Emoji">😊</button>
          <button onClick={() => setShowTemplatePicker(!showTemplatePicker)} className="toolbar-btn" title="Insert Template">📋 Template</button>
        </div>
        
        <div className="toolbar-divider" />
        
        <div className="toolbar-group">
          <div className="color-picker-wrapper">
            <button onClick={() => setShowColorPicker(!showColorPicker)} className="toolbar-btn" style={{ background: selectedColor, color: '#fff' }}>🎨 Text</button>
            {showColorPicker && (
              <div className="color-picker-dropdown">
                {colors.map(c => (
                  <button key={c} className="color-option" style={{ background: c }} onClick={() => { setSelectedColor(c); applyStyle('span', 'color', c); setShowColorPicker(false); }} title={c} />
                ))}
              </div>
            )}
          </div>
          <div className="color-picker-wrapper">
            <button onClick={() => setShowBgColorPicker(!showBgColorPicker)} className="toolbar-btn" style={{ background: selectedBgColor }}>🎨 BG</button>
            {showBgColorPicker && (
              <div className="color-picker-dropdown">
                {colors.map(c => (
                  <button key={c} className="color-option" style={{ background: c }} onClick={() => { setSelectedBgColor(c); applyStyle('span', 'background-color', c); setShowBgColorPicker(false); }} title={c} />
                ))}
              </div>
            )}
          </div>
          <select onChange={(e) => { setSelectedFont(e.target.value); applyStyle('span', 'font-family', e.target.value); }} className="toolbar-select" value={selectedFont}>
            {fonts.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
          <select onChange={(e) => { setSelectedSize(e.target.value); applyStyle('span', 'font-size', e.target.value); }} className="toolbar-select" value={selectedSize}>
            {fontSizes.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select onChange={(e) => applyStyle('div', 'text-align', e.target.value)} className="toolbar-select" defaultValue="">
            <option value="">Align</option>
            <option value="left">← Left</option>
            <option value="center">↔ Center</option>
            <option value="right">→ Right</option>
            <option value="justify">⇄ Justify</option>
          </select>
          <select onChange={(e) => applyStyle('div', 'line-height', e.target.value)} className="toolbar-select" defaultValue="">
            <option value="">Line Ht</option>
            {lineHeights.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          <select onChange={(e) => applyStyle('span', 'letter-spacing', e.target.value)} className="toolbar-select" defaultValue="">
            <option value="">Letter Spc</option>
            {letterSpacings.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        
        <div className="toolbar-divider" />
        
        <div className="toolbar-group">
          <button onClick={() => setShowShortcuts(!showShortcuts)} className="toolbar-btn" title="Keyboard Shortcuts">⌨️</button>
        </div>
      </div>

      {/* Template Picker */}
      {showTemplatePicker && (
        <div className="template-picker">
          {Object.keys(templates).map(name => (
            <button key={name} onClick={() => insertTemplate(name)} className="template-btn">{name}</button>
          ))}
        </div>
      )}

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="emoji-picker">
          {emojis.map(emoji => (
            <button key={emoji} onClick={() => insertEmoji(emoji)} className="emoji-btn">{emoji}</button>
          ))}
        </div>
      )}

      {/* Table Creator */}
      {showTableCreator && (
        <div className="table-creator">
          <h4>Create Table</h4>
          <div className="table-creator-inputs">
            <label>Rows: <input type="number" value={tableRows} onChange={(e) => setTableRows(parseInt(e.target.value))} min="1" max="20" /></label>
            <label>Columns: <input type="number" value={tableCols} onChange={(e) => setTableCols(parseInt(e.target.value))} min="1" max="20" /></label>
          </div>
          <div className="table-creator-actions">
            <button onClick={insertTable} className="create-table-btn">Create Table</button>
            <button onClick={() => setShowTableCreator(false)} className="cancel-table-btn">Cancel</button>
          </div>
        </div>
      )}

      {/* Shortcuts */}
      {showShortcuts && (
        <div className="shortcuts-modal">
          <h3>Keyboard Shortcuts</h3>
          <div className="shortcuts-grid">
            <div className="shortcut-item"><kbd>Ctrl+B</kbd><span>Bold</span></div>
            <div className="shortcut-item"><kbd>Ctrl+I</kbd><span>Italic</span></div>
            <div className="shortcut-item"><kbd>Ctrl+U</kbd><span>Underline</span></div>
            <div className="shortcut-item"><kbd>Ctrl+K</kbd><span>Insert Link</span></div>
            <div className="shortcut-item"><kbd>Ctrl+Shift+H</kbd><span>Heading 1</span></div>
            <div className="shortcut-item"><kbd>Ctrl+Shift+J</kbd><span>Heading 2</span></div>
            <div className="shortcut-item"><kbd>Ctrl+Shift+L</kbd><span>Bullet List</span></div>
            <div className="shortcut-item"><kbd>Ctrl+Shift+M</kbd><span>Numbered List</span></div>
            <div className="shortcut-item"><kbd>Ctrl+Shift+Q</kbd><span>Quote</span></div>
            <div className="shortcut-item"><kbd>Ctrl+Shift+C</kbd><span>Code Block</span></div>
            <div className="shortcut-item"><kbd>Ctrl+Shift+P</kbd><span>Preview</span></div>
            <div className="shortcut-item"><kbd>Ctrl+S</kbd><span>Save</span></div>
          </div>
          <button onClick={() => setShowShortcuts(false)} className="close-shortcuts">Close</button>
        </div>
      )}

      {/* Editor Textarea */}
      <textarea
        ref={editorRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="editor-textarea"
        style={{
          fontFamily: selectedFont,
          fontSize: selectedSize,
          lineHeight: '1.6'
        }}
      />

      <style jsx>{`
        .ultimate-editor {
          width: 100%;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          overflow: hidden;
          background: white;
        }
        
        /* Mobile First Styles */
        @media (max-width: 768px) {
          .ultimate-editor {
            border-radius: 8px;
          }
        }
        
        :global(body.dark) .ultimate-editor {
          background: #1e293b;
          border-color: #334155;
        }
        
        /* Mobile Toolbar Toggle */
        .mobile-toolbar-toggle {
          display: none;
        }
        
        @media (max-width: 768px) {
          .mobile-toolbar-toggle {
            display: block;
            padding: 0.75rem;
            background: #f8fafc;
            border-bottom: 1px solid #e2e8f0;
          }
          
          :global(body.dark) .mobile-toolbar-toggle {
            background: #0f172a;
            border-bottom-color: #334155;
          }
          
          .mobile-toggle-btn {
            width: 100%;
            padding: 0.75rem;
            background: #667eea;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 0.875rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
          }
          
          .mobile-toggle-btn:active {
            transform: scale(0.98);
          }
        }
        
        /* Toolbar Styles */
        .toolbar-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.25rem;
          padding: 0.5rem;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          position: sticky;
          top: 0;
          z-index: 10;
        }
        
        @media (max-width: 768px) {
          .toolbar-row {
            display: none;
            max-height: 300px;
            overflow-y: auto;
            padding: 0.75rem;
            gap: 0.5rem;
          }
          
          .toolbar-row.mobile-visible {
            display: flex;
          }
        }
        
        :global(body.dark) .toolbar-row {
          background: #0f172a;
          border-bottom-color: #334155;
        }
        
        .toolbar-group {
          display: flex;
          gap: 0.25rem;
          align-items: center;
          flex-wrap: wrap;
        }
        
        @media (max-width: 768px) {
          .toolbar-group {
            width: 100%;
            justify-content: center;
            gap: 0.5rem;
          }
        }
        
        .toolbar-divider {
          width: 1px;
          height: 28px;
          background: #e2e8f0;
          margin: 0 0.25rem;
        }
        
        @media (max-width: 768px) {
          .toolbar-divider {
            display: none;
          }
        }
        
        :global(body.dark) .toolbar-divider {
          background: #334155;
        }
        
        .toolbar-btn {
          padding: 0.35rem 0.7rem;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.8rem;
          transition: all 0.2s;
        }
        
        @media (max-width: 768px) {
          .toolbar-btn {
            padding: 0.5rem 0.875rem;
            font-size: 0.875rem;
            min-width: 44px;
            min-height: 44px;
          }
        }
        
        .toolbar-btn:hover {
          background: #f1f5f9;
          border-color: #667eea;
          transform: translateY(-1px);
        }
        
        @media (max-width: 768px) {
          .toolbar-btn:active {
            transform: scale(0.95);
          }
        }
        
        :global(body.dark) .toolbar-btn {
          background: #1e293b;
          border-color: #334155;
          color: #e2e8f0;
        }
        
        :global(body.dark) .toolbar-btn:hover {
          background: #334155;
        }
        
        .toolbar-select {
          padding: 0.35rem 0.5rem;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          background: white;
          cursor: pointer;
          font-size: 0.8rem;
        }
        
        @media (max-width: 768px) {
          .toolbar-select {
            padding: 0.5rem;
            font-size: 0.875rem;
            min-height: 44px;
            flex: 1;
          }
        }
        
        :global(body.dark) .toolbar-select {
          background: #1e293b;
          border-color: #334155;
          color: #e2e8f0;
        }
        
        .color-picker-wrapper {
          position: relative;
        }
        
        .color-picker-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          margin-top: 0.5rem;
          background: white;
          border-radius: 8px;
          padding: 0.5rem;
          display: grid;
          grid-template-columns: repeat(8, 1fr);
          gap: 0.25rem;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          z-index: 20;
          width: 200px;
        }
        
        @media (max-width: 768px) {
          .color-picker-dropdown {
            position: fixed;
            top: auto;
            bottom: 0;
            left: 0;
            right: 0;
            width: 100%;
            border-radius: 12px 12px 0 0;
            max-height: 50vh;
            overflow-y: auto;
            grid-template-columns: repeat(6, 1fr);
          }
        }
        
        :global(body.dark) .color-picker-dropdown {
          background: #1e293b;
        }
        
        .color-option {
          width: 22px;
          height: 22px;
          border-radius: 4px;
          border: 1px solid #e2e8f0;
          cursor: pointer;
          transition: transform 0.2s;
        }
        
        @media (max-width: 768px) {
          .color-option {
            width: 40px;
            height: 40px;
          }
        }
        
        .color-option:hover {
          transform: scale(1.1);
        }
        
        .template-picker, .emoji-picker {
          padding: 0.5rem;
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          border-bottom: 1px solid #e2e8f0;
          background: #f8fafc;
        }
        
        @media (max-width: 768px) {
          .template-picker, .emoji-picker {
            padding: 1rem;
            gap: 0.75rem;
            max-height: 300px;
            overflow-y: auto;
          }
        }
        
        :global(body.dark) .template-picker, :global(body.dark) .emoji-picker {
          background: #0f172a;
          border-bottom-color: #334155;
        }
        
        .template-btn {
          padding: 0.35rem 0.7rem;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.75rem;
        }
        
        @media (max-width: 768px) {
          .template-btn {
            padding: 0.75rem;
            font-size: 0.875rem;
            flex: 1;
            min-width: calc(50% - 0.5rem);
          }
        }
        
        .emoji-btn {
          font-size: 1.2rem;
          padding: 0.25rem;
          background: none;
          border: none;
          cursor: pointer;
          border-radius: 4px;
          transition: background 0.2s;
        }
        
        @media (max-width: 768px) {
          .emoji-btn {
            font-size: 1.75rem;
            padding: 0.5rem;
          }
        }
        
        .emoji-btn:hover {
          background: #e2e8f0;
        }
        
        .table-creator {
          padding: 1rem;
          border-bottom: 1px solid #e2e8f0;
          background: #f8fafc;
        }
        
        @media (max-width: 768px) {
          .table-creator {
            padding: 1rem;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            border-radius: 16px 16px 0 0;
            z-index: 30;
            box-shadow: 0 -4px 12px rgba(0,0,0,0.1);
          }
        }
        
        :global(body.dark) .table-creator {
          background: #0f172a;
          border-bottom-color: #334155;
        }
        
        .table-creator h4 {
          margin-bottom: 0.5rem;
        }
        
        .table-creator-inputs {
          display: flex;
          gap: 1rem;
          margin-bottom: 0.5rem;
        }
        
        @media (max-width: 768px) {
          .table-creator-inputs {
            flex-direction: column;
            gap: 0.75rem;
          }
          
          .table-creator-inputs label {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }
          
          .table-creator-inputs input {
            width: 100%;
            padding: 0.5rem;
          }
        }
        
        .table-creator-inputs label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .table-creator-inputs input {
          width: 60px;
          padding: 0.25rem;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
        }
        
        .table-creator-actions {
          display: flex;
          gap: 0.5rem;
        }
        
        @media (max-width: 768px) {
          .table-creator-actions {
            gap: 1rem;
            margin-top: 0.5rem;
          }
          
          .create-table-btn, .cancel-table-btn {
            flex: 1;
            padding: 0.75rem;
          }
        }
        
        .create-table-btn, .cancel-table-btn {
          padding: 0.25rem 0.75rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .create-table-btn {
          background: #10b981;
          color: white;
        }
        
        .cancel-table-btn {
          background: #ef4444;
          color: white;
        }
        
        .shortcuts-modal {
          padding: 1rem;
          border-bottom: 1px solid #e2e8f0;
          background: #f8fafc;
        }
        
        @media (max-width: 768px) {
          .shortcuts-modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 40;
            overflow-y: auto;
            background: white;
            border-radius: 0;
          }
          
          :global(body.dark) .shortcuts-modal {
            background: #0f172a;
          }
        }
        
        :global(body.dark) .shortcuts-modal {
          background: #0f172a;
          border-bottom-color: #334155;
        }
        
        .shortcuts-modal h3 {
          margin-bottom: 0.5rem;
        }
        
        .shortcuts-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }
        
        @media (max-width: 768px) {
          .shortcuts-grid {
            gap: 1rem;
            margin: 1rem 0;
          }
        }
        
        .shortcut-item {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          font-size: 0.8rem;
        }
        
        @media (max-width: 768px) {
          .shortcut-item {
            font-size: 1rem;
            padding: 0.5rem;
          }
        }
        
        .shortcut-item kbd {
          background: #e2e8f0;
          padding: 0.2rem 0.4rem;
          border-radius: 4px;
          font-family: monospace;
        }
        
        @media (max-width: 768px) {
          .shortcut-item kbd {
            padding: 0.4rem 0.6rem;
            font-size: 0.875rem;
          }
        }
        
        .close-shortcuts {
          width: 100%;
          padding: 0.5rem;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }
        
        @media (max-width: 768px) {
          .close-shortcuts {
            padding: 0.75rem;
            font-size: 1rem;
            position: sticky;
            bottom: 0;
          }
        }
        
        .editor-textarea {
          width: 100%;
          min-height: 500px;
          padding: 1rem;
          border: none;
          outline: none;
          resize: vertical;
          font-size: 16px;
          line-height: 1.6;
          background: white;
          color: #1e293b;
        }
        
        @media (max-width: 768px) {
          .editor-textarea {
            min-height: 400px;
            padding: 1rem;
            font-size: 16px; /* Prevents zoom on iOS */
            -webkit-text-size-adjust: 100%;
          }
        }
        
        :global(body.dark) .editor-textarea {
          background: #1e293b;
          color: #f1f5f9;
        }
        
        /* Tablet Styles */
        @media (min-width: 769px) and (max-width: 1024px) {
          .toolbar-group {
            gap: 0.35rem;
          }
          
          .toolbar-btn {
            padding: 0.4rem 0.8rem;
          }
        }
        
        /* Desktop Styles */
        @media (min-width: 1025px) {
          .mobile-toolbar-toggle {
            display: none;
          }
          
          .toolbar-row {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  )
}