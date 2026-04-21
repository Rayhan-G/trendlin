// src/components/editor/MediaControls.jsx - COMPLETE FIXED VERSION WITH FIRST BLOCK DELETION
import React, { useState, useEffect, useCallback, useRef } from 'react'
import { 
  AlignLeft, AlignCenter, AlignRight, 
  Trash2, Edit2, Maximize2, Minimize2,
  Image, Video, FileAudio, FileText, Code,
  Settings, X, Move, RotateCcw, Lock, Unlock, Package,
  Palette, BorderAll, Shadow, Pin, Sidebar, Maximize,
  ArrowUp, ArrowDown, Copy
} from 'lucide-react'

const MediaControls = ({ 
  editor, 
  onEdit, 
  onClose, 
  className = '',
  mode = 'floating',
  defaultPinned = false
}) => {
  const [selectedMedia, setSelectedMedia] = useState(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [customPosition, setCustomPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [lockAspectRatio, setLockAspectRatio] = useState(true)
  const [customWidth, setCustomWidth] = useState('100')
  const [customHeight, setCustomHeight] = useState('auto')
  const [isPinned, setIsPinned] = useState(defaultPinned)
  const [displayMode, setDisplayMode] = useState(mode)
  const [isHovering, setIsHovering] = useState(false)
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0, positionBelow: false })
  
  const controlsRef = useRef(null)
  const dragStartPos = useRef({ x: 0, y: 0 })
  const hideTimeoutRef = useRef(null)

  const calculateToolbarPosition = useCallback((editor, from) => {
    if (!editor || !from) return { top: 0, left: 0, positionBelow: false };
    
    const view = editor.view;
    if (!view) return { top: 0, left: 0, positionBelow: false };
    
    const coords = view.coordsAtPos(from);
    if (!coords) return { top: 0, left: 0, positionBelow: false };
    
    const toolbarHeight = 56;
    const mainToolbarHeight = document.querySelector('.admin-navigation, .editor-header, header')?.offsetHeight || 80;
    const padding = 15;
    
    const viewportTop = window.scrollY;
    const viewportBottom = viewportTop + window.innerHeight;
    
    const spaceAbove = coords.top - mainToolbarHeight - viewportTop;
    const spaceBelow = viewportBottom - coords.bottom;
    
    let topPosition;
    let positionBelow = false;
    
    if (spaceAbove >= toolbarHeight + padding) {
      topPosition = coords.top - toolbarHeight - padding;
      positionBelow = false;
    } 
    else if (spaceBelow >= toolbarHeight + padding) {
      const nodeEnd = view.coordsAtPos(from + 1);
      topPosition = nodeEnd ? nodeEnd.bottom + padding : coords.bottom + padding;
      positionBelow = true;
    }
    else {
      const nodeEnd = view.coordsAtPos(from + 1);
      topPosition = Math.max(viewportTop + padding, nodeEnd ? nodeEnd.bottom + padding : coords.bottom + padding);
      positionBelow = true;
    }
    
    const leftPosition = coords.left + (coords.right - coords.left) / 2;
    
    return { top: topPosition, left: leftPosition, positionBelow };
  }, []);

  // ============================================
  // FIXED: BLOCK DELETE FUNCTION - WORKS FOR FIRST BLOCK
  // ============================================
  const handleDelete = useCallback(() => {
    if (!selectedMedia || !editor) return
    
    try {
      const { state, view } = editor
      const { selection } = state
      const { $from } = selection
      
      // Find the block node by traversing up the tree
      let depth = $from.depth
      let blockPos = null
      let blockNode = null
      
      while (depth > 0) {
        const node = $from.node(depth)
        if (node.type.name === 'block') {
          blockPos = $from.before(depth)
          blockNode = node
          break
        }
        depth--
      }
      
      // Also check the selected media position
      if (blockPos === null && selectedMedia.pos) {
        const nodeAtPos = state.doc.nodeAt(selectedMedia.pos)
        if (nodeAtPos && nodeAtPos.type.name === 'block') {
          blockPos = selectedMedia.pos
          blockNode = nodeAtPos
        }
      }
      
      if (blockPos !== null && blockNode) {
        // Count total blocks
        let blockCount = 0
        state.doc.descendants((child) => {
          if (child.type.name === 'block') blockCount++
        })
        
        // If this is the last block (including first block when only one exists)
        if (blockCount === 1) {
          // Use the deleteBlock command which handles last block specially
          if (editor.commands.deleteBlock) {
            editor.commands.deleteBlock()
          } else {
            // Fallback: Clear content instead of deleting
            const tr = state.tr
            const start = blockPos + 1
            const end = blockPos + blockNode.nodeSize - 1
            
            if (start < end) {
              tr.delete(start, end)
              const paragraphNode = state.schema.nodes.paragraph.create()
              tr.insert(start, paragraphNode)
            }
            view.dispatch(tr)
          }
        } else {
          // Normal deletion for non-last blocks
          const tr = state.tr.delete(blockPos, blockPos + blockNode.nodeSize)
          view.dispatch(tr)
          
          // Set selection to a valid position after deletion
          setTimeout(() => {
            const newState = editor.state
            const newDoc = newState.doc
            // Find the first block position
            let newPos = 1
            newDoc.descendants((child, pos) => {
              if (child.type.name === 'block' && pos > 0) {
                newPos = pos + 1
                return false
              }
            })
            const resolvedPos = newDoc.resolve(newPos)
            const textSelection = newState.selection.constructor.near(resolvedPos)
            editor.view.dispatch(newState.tr.setSelection(textSelection))
            editor.view.focus()
          }, 10)
        }
        
        setSelectedMedia(null)
        if (isPinned) setIsPinned(false)
        
        const toastEvent = new CustomEvent('showToast', { 
          detail: { message: 'Block deleted successfully', type: 'success' } 
        })
        window.dispatchEvent(toastEvent)
        
        return
      }
      
      // Fallback: Use the deleteBlock command if available
      if (editor.commands.deleteBlock) {
        editor.commands.deleteBlock()
        setSelectedMedia(null)
        if (isPinned) setIsPinned(false)
        return
      }
      
      // Last resort: Delete the node at position
      if (selectedMedia.pos !== undefined) {
        const nodeAtPos = state.doc.nodeAt(selectedMedia.pos)
        if (nodeAtPos) {
          const tr = state.tr.delete(selectedMedia.pos, selectedMedia.pos + nodeAtPos.nodeSize)
          view.dispatch(tr)
          setSelectedMedia(null)
          if (isPinned) setIsPinned(false)
        }
      }
      
    } catch (error) {
      console.error('Delete failed:', error)
      const toastEvent = new CustomEvent('showToast', { 
        detail: { message: 'Failed to delete block', type: 'error' } 
      })
      window.dispatchEvent(toastEvent)
    }
  }, [editor, selectedMedia, isPinned])

  // ============================================
  // BLOCK DUPLICATE FUNCTION
  // ============================================
  const handleDuplicate = useCallback(() => {
    if (!selectedMedia || !editor) return
    
    try {
      const { state, view } = editor
      const { selection } = state
      const { $from } = selection
      
      let depth = $from.depth
      let blockPos = null
      let blockNode = null
      
      while (depth > 0) {
        const node = $from.node(depth)
        if (node.type.name === 'block') {
          blockPos = $from.before(depth)
          blockNode = node
          break
        }
        depth--
      }
      
      if (blockNode && blockPos !== null) {
        const newNode = blockNode.type.create(
          {
            ...blockNode.attrs,
            blockId: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          },
          blockNode.content
        )
        
        const tr = state.tr.insert(blockPos + blockNode.nodeSize, newNode)
        view.dispatch(tr)
        
        const toastEvent = new CustomEvent('showToast', { 
          detail: { message: 'Block duplicated successfully', type: 'success' } 
        })
        window.dispatchEvent(toastEvent)
      }
    } catch (error) {
      console.error('Duplicate failed:', error)
    }
  }, [editor, selectedMedia])

  // ============================================
  // BLOCK MOVE UP FUNCTION
  // ============================================
  const handleMoveUp = useCallback(() => {
    if (!selectedMedia || !editor) return
    
    try {
      const { state, view } = editor
      const { selection } = state
      const { $from } = selection
      
      let depth = $from.depth
      let currentBlockPos = null
      
      while (depth > 0) {
        if ($from.node(depth).type.name === 'block') {
          currentBlockPos = $from.before(depth)
          break
        }
        depth--
      }
      
      if (currentBlockPos === null) return
      
      const blocks = []
      state.doc.descendants((child, pos) => {
        if (child.type.name === 'block') {
          blocks.push({ node: child, pos, size: child.nodeSize })
        }
      })
      
      const currentIndex = blocks.findIndex(block => block.pos === currentBlockPos)
      if (currentIndex <= 0) return
      
      const prevBlock = blocks[currentIndex - 1]
      const currentBlock = blocks[currentIndex]
      
      const tr = state.tr
      const currentSlice = state.doc.slice(currentBlock.pos, currentBlock.pos + currentBlock.size)
      const prevSlice = state.doc.slice(prevBlock.pos, prevBlock.pos + prevBlock.size)
      
      tr.delete(prevBlock.pos, prevBlock.pos + prevBlock.size)
      tr.delete(currentBlock.pos - prevBlock.size, currentBlock.pos + currentBlock.size - prevBlock.size)
      tr.insert(prevBlock.pos, currentSlice.content)
      tr.insert(prevBlock.pos + currentBlock.size, prevSlice.content)
      
      view.dispatch(tr)
      
      const toastEvent = new CustomEvent('showToast', { 
        detail: { message: 'Block moved up', type: 'info' } 
      })
      window.dispatchEvent(toastEvent)
      
    } catch (error) {
      console.error('Move up failed:', error)
    }
  }, [editor, selectedMedia])

  // ============================================
  // BLOCK MOVE DOWN FUNCTION
  // ============================================
  const handleMoveDown = useCallback(() => {
    if (!selectedMedia || !editor) return
    
    try {
      const { state, view } = editor
      const { selection } = state
      const { $from } = selection
      
      let depth = $from.depth
      let currentBlockPos = null
      
      while (depth > 0) {
        if ($from.node(depth).type.name === 'block') {
          currentBlockPos = $from.before(depth)
          break
        }
        depth--
      }
      
      if (currentBlockPos === null) return
      
      const blocks = []
      state.doc.descendants((child, pos) => {
        if (child.type.name === 'block') {
          blocks.push({ node: child, pos, size: child.nodeSize })
        }
      })
      
      const currentIndex = blocks.findIndex(block => block.pos === currentBlockPos)
      if (currentIndex === -1 || currentIndex >= blocks.length - 1) return
      
      const nextBlock = blocks[currentIndex + 1]
      const currentBlock = blocks[currentIndex]
      
      const tr = state.tr
      const currentSlice = state.doc.slice(currentBlock.pos, currentBlock.pos + currentBlock.size)
      const nextSlice = state.doc.slice(nextBlock.pos, nextBlock.pos + nextBlock.size)
      
      tr.delete(currentBlock.pos, currentBlock.pos + currentBlock.size)
      tr.delete(nextBlock.pos - currentBlock.size, nextBlock.pos + nextBlock.size - currentBlock.size)
      tr.insert(currentBlock.pos, nextSlice.content)
      tr.insert(currentBlock.pos + nextBlock.size, currentSlice.content)
      
      view.dispatch(tr)
      
      const toastEvent = new CustomEvent('showToast', { 
        detail: { message: 'Block moved down', type: 'info' } 
      })
      window.dispatchEvent(toastEvent)
      
    } catch (error) {
      console.error('Move down failed:', error)
    }
  }, [editor, selectedMedia])

  // Detect selected media
  useEffect(() => {
    if (!editor) return

    const updateSelection = () => {
      try {
        const { state } = editor
        if (!state) return;
        
        const { from } = state.selection
        if (from === undefined) return;
        
        const node = state.doc.nodeAt(from)
        
        if (node && (node.type.name === 'embed' || node.type.name === 'video' || 
                     node.type.name === 'image' || node.type.name === 'audio' || 
                     node.type.name === 'pdf' || node.type.name === 'block')) {
          
          const nodeAttrs = node.attrs || {};
          
          setSelectedMedia({
            type: node.type.name,
            attrs: { ...nodeAttrs },
            pos: from
          })
          setIsExpanded(nodeAttrs.width === '100%')
          setCustomWidth(parseInt(nodeAttrs.width) || 100)
          setCustomHeight(nodeAttrs.height || 'auto')
          
          if (nodeAttrs.customX && nodeAttrs.customY) {
            setCustomPosition({ x: nodeAttrs.customX, y: nodeAttrs.customY })
          }

          const position = calculateToolbarPosition(editor, from);
          setToolbarPosition(position);
          
        } else if (!isPinned) {
          setSelectedMedia(null)
        }
      } catch (error) {
        console.error('Selection error:', error)
      }
    }

    editor.on('selectionUpdate', updateSelection)
    updateSelection()

    const handleRecalculate = () => {
      if (selectedMedia && editor && selectedMedia.pos) {
        const position = calculateToolbarPosition(editor, selectedMedia.pos);
        setToolbarPosition(position);
      }
    };
    
    window.addEventListener('scroll', handleRecalculate, true);
    window.addEventListener('resize', handleRecalculate);
    
    return () => {
      editor.off('selectionUpdate', updateSelection)
      window.removeEventListener('scroll', handleRecalculate, true);
      window.removeEventListener('resize', handleRecalculate);
    }
  }, [editor, isPinned, calculateToolbarPosition, selectedMedia]);

  // Handle toolbar visibility delay
  const handleMouseEnterToolbar = () => {
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current)
    setIsHovering(true)
  }

  const handleMouseLeaveToolbar = () => {
    if (!isPinned && displayMode === 'floating') {
      hideTimeoutRef.current = setTimeout(() => {
        if (!isHovering) {
          setSelectedMedia(null)
        }
      }, 300)
    }
  }

  const updateAttribute = useCallback((attr, value) => {
    if (!editor || !selectedMedia) return
    
    const { state } = editor
    if (!state) return;
    
    const { from } = state.selection
    if (from === undefined) return;
    
    const node = state.doc.nodeAt(from)
    
    if (node && node.type.name === selectedMedia.type) {
      editor.commands.updateAttributes(selectedMedia.type, { [attr]: value })
      setSelectedMedia(prev => ({
        ...prev,
        attrs: { ...prev.attrs, [attr]: value }
      }))
    }
  }, [editor, selectedMedia])

  const handleEdit = useCallback(() => {
    if (onEdit && selectedMedia) {
      onEdit(selectedMedia.type, selectedMedia.attrs)
    }
  }, [onEdit, selectedMedia])

  const toggleExpand = useCallback(() => {
    const newExpanded = !isExpanded
    setIsExpanded(newExpanded)
    updateAttribute('width', newExpanded ? '100%' : '75%')
  }, [isExpanded, updateAttribute])

  const handleAlignment = useCallback((align) => {
    updateAttribute('alignment', align)
    
    if (align !== 'custom') {
      updateAttribute('customX', null)
      updateAttribute('customY', null)
      setCustomPosition({ x: 0, y: 0 })
    }
  }, [updateAttribute])

  const handleWidthChange = useCallback((width) => {
    const widthValue = typeof width === 'string' ? width : `${width}%`
    updateAttribute('width', widthValue)
    setIsExpanded(widthValue === '100%')
    setCustomWidth(parseInt(widthValue) || 100)
    
    if (lockAspectRatio && selectedMedia?.attrs?.aspectRatio) {
      const aspectRatio = selectedMedia.attrs.aspectRatio.split('/').map(Number)
      const newHeight = (parseInt(widthValue) * aspectRatio[1] / aspectRatio[0])
      updateAttribute('height', `${newHeight}px`)
      setCustomHeight(`${newHeight}px`)
    }
  }, [updateAttribute, lockAspectRatio, selectedMedia])

  const handleHeightChange = useCallback((height) => {
    updateAttribute('height', height)
    setCustomHeight(height)
    
    if (lockAspectRatio && selectedMedia?.attrs?.aspectRatio && height !== 'auto') {
      const aspectRatio = selectedMedia.attrs.aspectRatio.split('/').map(Number)
      const newWidth = (parseInt(height) * aspectRatio[0] / aspectRatio[1])
      updateAttribute('width', `${newWidth}%`)
      setCustomWidth(newWidth)
    }
  }, [updateAttribute, lockAspectRatio, selectedMedia])

  const handleCustomPositionStart = useCallback((e) => {
    e.preventDefault()
    setIsDragging(true)
    dragStartPos.current = {
      x: e.clientX - customPosition.x,
      y: e.clientY - customPosition.y
    }
  }, [customPosition.x, customPosition.y])

  const handleCustomPositionMove = useCallback((e) => {
    if (!isDragging) return
    
    const newX = e.clientX - dragStartPos.current.x
    const newY = e.clientY - dragStartPos.current.y
    
    setCustomPosition({ x: newX, y: newY })
  }, [isDragging])

  const handleCustomPositionEnd = useCallback(() => {
    if (isDragging) {
      setIsDragging(false)
      updateAttribute('customX', customPosition.x)
      updateAttribute('customY', customPosition.y)
      updateAttribute('alignment', 'custom')
    }
  }, [isDragging, customPosition, updateAttribute])

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleCustomPositionMove)
      window.addEventListener('mouseup', handleCustomPositionEnd)
    }
    
    return () => {
      window.removeEventListener('mousemove', handleCustomPositionMove)
      window.removeEventListener('mouseup', handleCustomPositionEnd)
    }
  }, [isDragging, handleCustomPositionMove, handleCustomPositionEnd])

  const resetToDefault = useCallback(() => {
    handleAlignment('center')
    handleWidthChange('100%')
    updateAttribute('height', 'auto')
    updateAttribute('customX', null)
    updateAttribute('customY', null)
    setCustomPosition({ x: 0, y: 0 })
    setCustomHeight('auto')
    
    if (selectedMedia?.type === 'block') {
      updateAttribute('backgroundColor', '#ffffff')
      updateAttribute('borderColor', '#e5e7eb')
      updateAttribute('borderWidth', '1')
      updateAttribute('borderRadius', '12')
      updateAttribute('padding', '20')
      updateAttribute('shadow', 'sm')
    }
  }, [handleAlignment, handleWidthChange, updateAttribute, selectedMedia])

  const togglePin = () => {
    setIsPinned(!isPinned)
    if (!isPinned) {
      setDisplayMode('sidebar')
    } else {
      setDisplayMode('floating')
    }
  }

  const switchDisplayMode = (newMode) => {
    setDisplayMode(newMode)
    if (newMode !== 'floating') {
      setIsPinned(true)
    } else {
      setIsPinned(false)
    }
  }

  const getMediaIcon = () => {
    switch(selectedMedia?.type) {
      case 'image': return <Image size={18} />
      case 'video': return <Video size={18} />
      case 'audio': return <FileAudio size={18} />
      case 'pdf': return <FileText size={18} />
      case 'embed': return <Code size={18} />
      case 'block': return <Package size={18} />
      default: return null
    }
  }

  const getMediaLabel = () => {
    if (selectedMedia?.type === 'block') {
      return selectedMedia.attrs?.blockName || 'Block'
    }
    return selectedMedia?.type || 'Media'
  }

  const isBlock = selectedMedia?.type === 'block'
  const widthPresets = ['25%', '33%', '50%', '66%', '75%', '100%']
  const alignmentOptions = [
    { value: 'left', icon: AlignLeft, label: 'Left' },
    { value: 'center', icon: AlignCenter, label: 'Center' },
    { value: 'right', icon: AlignRight, label: 'Right' },
    { value: 'custom', icon: Move, label: 'Custom Position' }
  ]

  const bgColors = [
    '#ffffff', '#f3f4f6', '#fef3c7', '#dbeafe', 
    '#fce7f3', '#dcfce7', '#e0e7ff', '#fed7aa'
  ]
  
  const borderColors = [
    '#e5e7eb', '#d1d5db', '#9ca3af', '#6b7280',
    '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'
  ]
  
  const shadows = ['none', 'sm', 'md', 'lg', 'xl']
  const borderWidths = ['0', '1', '2', '3', '4']
  const borderRadiuses = ['0', '4', '8', '12', '16', '24']
  const paddings = ['8', '12', '16', '20', '24', '32']

  if (!selectedMedia && !isPinned) return null

  // Modal Mode
  if (displayMode === 'modal' && selectedMedia) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]" onClick={() => {
        if (!isPinned) setSelectedMedia(null)
      }}>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-4 pb-4 border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                {getMediaIcon()}
              </div>
              <div>
                <h2 className="text-xl font-bold capitalize">
                  Edit {getMediaLabel()}
                </h2>
                <p className="text-sm text-gray-500">Adjust media settings and styling</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => switchDisplayMode('sidebar')} className="p-2 hover:bg-gray-100 rounded-lg"><Sidebar size={18} /></button>
              <button onClick={() => switchDisplayMode('floating')} className="p-2 hover:bg-gray-100 rounded-lg"><Minimize2 size={18} /></button>
              <button onClick={() => { if (!isPinned) setSelectedMedia(null); if (onClose) onClose() }} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
          </div>
          
          <div className="overflow-y-auto">
            <MediaControlsContent
              selectedMedia={selectedMedia}
              isBlock={isBlock}
              customWidth={customWidth}
              customHeight={customHeight}
              customPosition={customPosition}
              isExpanded={isExpanded}
              showAdvanced={showAdvanced}
              lockAspectRatio={lockAspectRatio}
              updateAttribute={updateAttribute}
              handleAlignment={handleAlignment}
              handleWidthChange={handleWidthChange}
              handleHeightChange={handleHeightChange}
              handleCustomPositionStart={handleCustomPositionStart}
              handleDelete={handleDelete}
              handleDuplicate={handleDuplicate}
              handleMoveUp={handleMoveUp}
              handleMoveDown={handleMoveDown}
              handleEdit={handleEdit}
              setShowAdvanced={setShowAdvanced}
              setLockAspectRatio={setLockAspectRatio}
              setCustomPosition={setCustomPosition}
              resetToDefault={resetToDefault}
              toggleExpand={toggleExpand}
              widthPresets={widthPresets}
              alignmentOptions={alignmentOptions}
              bgColors={bgColors}
              borderColors={borderColors}
              shadows={shadows}
              borderWidths={borderWidths}
              borderRadiuses={borderRadiuses}
              paddings={paddings}
            />
          </div>
        </div>
      </div>
    )
  }

  // Sidebar Mode
  if (displayMode === 'sidebar' && selectedMedia) {
    return (
      <div className={`fixed right-4 top-20 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border z-[1000] ${className}`}>
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-purple-100 rounded">{getMediaIcon()}</div>
              <span className="font-semibold capitalize">{getMediaLabel()} Controls</span>
            </div>
            <div className="flex gap-1">
              <button onClick={() => switchDisplayMode('modal')} className="p-1.5 hover:bg-gray-100 rounded"><Maximize size={14} /></button>
              <button onClick={togglePin} className={`p-1.5 rounded ${isPinned ? 'text-purple-600 bg-purple-100' : 'hover:bg-gray-100'}`}><Pin size={14} /></button>
              <button onClick={() => { setSelectedMedia(null); setIsPinned(false); if (onClose) onClose() }} className="p-1.5 hover:bg-gray-100 rounded"><Minimize2 size={14} /></button>
            </div>
          </div>
        </div>
        
        <div className="p-4 max-h-[calc(100vh-120px)] overflow-y-auto">
          <MediaControlsContent
            selectedMedia={selectedMedia}
            isBlock={isBlock}
            customWidth={customWidth}
            customHeight={customHeight}
            customPosition={customPosition}
            isExpanded={isExpanded}
            showAdvanced={showAdvanced}
            lockAspectRatio={lockAspectRatio}
            updateAttribute={updateAttribute}
            handleAlignment={handleAlignment}
            handleWidthChange={handleWidthChange}
            handleHeightChange={handleHeightChange}
            handleCustomPositionStart={handleCustomPositionStart}
            handleDelete={handleDelete}
            handleDuplicate={handleDuplicate}
            handleMoveUp={handleMoveUp}
            handleMoveDown={handleMoveDown}
            handleEdit={handleEdit}
            setShowAdvanced={setShowAdvanced}
            setLockAspectRatio={setLockAspectRatio}
            setCustomPosition={setCustomPosition}
            resetToDefault={resetToDefault}
            toggleExpand={toggleExpand}
            widthPresets={widthPresets}
            alignmentOptions={alignmentOptions}
            bgColors={bgColors}
            borderColors={borderColors}
            shadows={shadows}
            borderWidths={borderWidths}
            borderRadiuses={borderRadiuses}
            paddings={paddings}
          />
        </div>
      </div>
    )
  }

  // Floating Toolbar Mode
  if (displayMode === 'floating' && selectedMedia) {
    return (
      <div
        ref={controlsRef}
        onMouseEnter={handleMouseEnterToolbar}
        onMouseLeave={handleMouseLeaveToolbar}
        className="fixed z-[1000]"
        style={{
          top: `${toolbarPosition.top}px`,
          left: `${toolbarPosition.left}px`,
          transform: 'translateX(-50%)',
        }}
      >
        <div 
          className="absolute left-1/2 transform -translate-x-1/2"
          style={{
            bottom: toolbarPosition.positionBelow ? 'auto' : '100%',
            top: toolbarPosition.positionBelow ? '100%' : 'auto',
            marginBottom: toolbarPosition.positionBelow ? '0' : '8px',
            marginTop: toolbarPosition.positionBelow ? '8px' : '0'
          }}
        >
          <div className={`w-0 h-0 border-l-8 border-r-8 ${
            toolbarPosition.positionBelow 
              ? 'border-t-8 border-t-white dark:border-t-gray-800 border-l-transparent border-r-transparent' 
              : 'border-b-8 border-b-white dark:border-b-gray-800 border-l-transparent border-r-transparent'
          }`} />
        </div>
        
        <div className={`flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-full shadow-xl border-2 ${
          selectedMedia?.attrs?.alignment === 'custom' 
            ? 'border-purple-400' 
            : isBlock ? 'border-blue-400' : 'border-gray-200'
        } ${className}`}>
          {isBlock && (
            <>
              <button onClick={handleMoveUp} className="p-1.5 rounded-md hover:bg-gray-100" title="Move Up"><ArrowUp size={14} /></button>
              <button onClick={handleMoveDown} className="p-1.5 rounded-md hover:bg-gray-100" title="Move Down"><ArrowDown size={14} /></button>
              <div className="w-px h-4 bg-gray-300" />
            </>
          )}
          
          <button onClick={handleDuplicate} className="p-1.5 rounded-md hover:bg-gray-100" title="Duplicate"><Copy size={14} /></button>
          <button onClick={togglePin} className="p-1.5 rounded-md hover:bg-gray-100" title="Pin"><Pin size={14} /></button>
          <button onClick={() => switchDisplayMode('sidebar')} className="p-1.5 rounded-md hover:bg-gray-100" title="Sidebar"><Sidebar size={14} /></button>
          <button onClick={() => switchDisplayMode('modal')} className="p-1.5 rounded-md hover:bg-gray-100" title="Modal"><Maximize size={14} /></button>
          
          <div className="w-px h-4 bg-gray-300" />
          
          <div className="flex items-center gap-1.5">
            <span className={isBlock ? 'text-blue-600' : 'text-purple-600'}>{getMediaIcon()}</span>
            <span className="text-xs font-semibold capitalize">{getMediaLabel()}</span>
          </div>
          
          <div className="w-px h-4 bg-gray-300" />
          
          <button onClick={handleEdit} className="p-1.5 rounded-md hover:bg-gray-100" title="Edit"><Edit2 size={14} /></button>
          <button onClick={handleDelete} className="p-1.5 rounded-md hover:bg-red-100 text-red-500" title="Delete"><Trash2 size={14} /></button>
        </div>
      </div>
    )
  }

  return null
}

// Controls Content Component
const MediaControlsContent = ({
  selectedMedia,
  isBlock,
  customWidth,
  customHeight,
  customPosition,
  isExpanded,
  showAdvanced,
  lockAspectRatio,
  updateAttribute,
  handleAlignment,
  handleWidthChange,
  handleHeightChange,
  handleCustomPositionStart,
  handleDelete,
  handleDuplicate,
  handleMoveUp,
  handleMoveDown,
  handleEdit,
  setShowAdvanced,
  setLockAspectRatio,
  setCustomPosition,
  resetToDefault,
  toggleExpand,
  widthPresets,
  alignmentOptions,
  bgColors,
  borderColors,
  shadows,
  borderWidths,
  borderRadiuses,
  paddings
}) => {
  const attrs = selectedMedia?.attrs || {};
  
  return (
    <div className="space-y-4">
      {isBlock && (
        <div className="flex gap-2 p-3 bg-gray-50 rounded-lg">
          <button onClick={handleMoveUp} className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2"><ArrowUp size={16} /> Move Up</button>
          <button onClick={handleMoveDown} className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2"><ArrowDown size={16} /> Move Down</button>
          <button onClick={handleDuplicate} className="flex-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center justify-center gap-2"><Copy size={16} /> Duplicate</button>
        </div>
      )}

      <div className="flex gap-2 p-3 bg-gray-50 rounded-lg">
        <button onClick={handleEdit} className="flex-1 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2"><Edit2 size={16} /> Edit</button>
        <button onClick={handleDelete} className="flex-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center justify-center gap-2"><Trash2 size={16} /> Delete</button>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Alignment</label>
        <div className="flex gap-2">
          {alignmentOptions.map(({ value, icon: Icon, label }) => (
            <button key={value} onClick={() => handleAlignment(value)} className={`flex-1 p-2 rounded-lg border transition ${attrs.alignment === value ? 'bg-purple-600 text-white border-purple-600' : 'bg-white border-gray-300 hover:border-purple-400'}`} title={label}><Icon size={18} className="mx-auto" /></button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Size</label>
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <input type="range" value={parseInt(customWidth)} onChange={(e) => handleWidthChange(e.target.value)} min="10" max="100" className="w-full" />
            <div className="flex justify-between text-xs text-gray-500 mt-1"><span>Small</span><span>Medium</span><span>Large</span><span>Full</span></div>
          </div>
          <button onClick={toggleExpand} className="p-2 border rounded-lg hover:bg-gray-50">{isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}</button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Width Presets</label>
        <div className="grid grid-cols-6 gap-1">
          {widthPresets.map(w => (
            <button key={w} onClick={() => handleWidthChange(w)} className={`px-2 py-1 rounded text-xs font-mono transition ${attrs.width === w ? 'bg-purple-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>{w}</button>
          ))}
        </div>
      </div>

      <button onClick={() => setShowAdvanced(!showAdvanced)} className="w-full p-2 bg-gray-100 rounded-lg flex items-center justify-between">
        <span className="flex items-center gap-2"><Settings size={16} /> Advanced Settings</span>
        <span>{showAdvanced ? '▲' : '▼'}</span>
      </button>

      {showAdvanced && (
        <div className="space-y-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Advanced Options</span>
            <button onClick={resetToDefault} className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300 flex items-center gap-1"><RotateCcw size={12} /> Reset</button>
          </div>
          
          {isBlock && (
            <>
              <div>
                <label className="block text-xs mb-1">Background Color</label>
                <div className="flex flex-wrap gap-1">
                  {bgColors.map(color => (<button key={color} onClick={() => updateAttribute('backgroundColor', color)} className="w-8 h-8 rounded border" style={{ backgroundColor: color }} />))}
                </div>
              </div>
              
              <div>
                <label className="block text-xs mb-1">Border Color</label>
                <div className="flex flex-wrap gap-1">
                  {borderColors.map(color => (<button key={color} onClick={() => updateAttribute('borderColor', color)} className="w-8 h-8 rounded border" style={{ backgroundColor: color }} />))}
                </div>
              </div>
              
              <div>
                <label className="block text-xs mb-1">Border Width</label>
                <div className="grid grid-cols-5 gap-1">
                  {borderWidths.map(w => (<button key={w} onClick={() => updateAttribute('borderWidth', w)} className={`py-1 text-xs rounded ${attrs.borderWidth === w ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>{w}px</button>))}
                </div>
              </div>
              
              <div>
                <label className="block text-xs mb-1">Border Radius</label>
                <div className="grid grid-cols-6 gap-1">
                  {borderRadiuses.map(r => (<button key={r} onClick={() => updateAttribute('borderRadius', r)} className={`py-1 text-xs rounded ${attrs.borderRadius === r ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>{r}px</button>))}
                </div>
              </div>
              
              <div>
                <label className="block text-xs mb-1">Padding</label>
                <div className="grid grid-cols-6 gap-1">
                  {paddings.map(p => (<button key={p} onClick={() => updateAttribute('padding', p)} className={`py-1 text-xs rounded ${attrs.padding === p ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>{p}px</button>))}
                </div>
              </div>
              
              <div>
                <label className="block text-xs mb-1">Shadow</label>
                <div className="grid grid-cols-5 gap-1">
                  {shadows.map(s => (<button key={s} onClick={() => updateAttribute('shadow', s)} className={`py-1 text-xs rounded capitalize ${attrs.shadow === s ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>{s}</button>))}
                </div>
              </div>
            </>
          )}
          
          <div>
            <label className="block text-xs mb-1">Caption</label>
            <input type="text" value={attrs.caption || ''} onChange={(e) => updateAttribute('caption', e.target.value)} placeholder="Add a caption..." className="w-full px-3 py-2 border rounded-lg" />
          </div>
          
          {selectedMedia?.type === 'image' && (
            <div>
              <label className="block text-xs mb-1">Alt Text</label>
              <input type="text" value={attrs.alt || ''} onChange={(e) => updateAttribute('alt', e.target.value)} placeholder="Image description for SEO..." className="w-full px-3 py-2 border rounded-lg" />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default MediaControls