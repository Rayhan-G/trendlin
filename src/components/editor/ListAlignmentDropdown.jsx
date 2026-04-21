// src/components/Editor/ListAlignmentDropdown.jsx
import React from 'react'
import { AlignLeft, AlignCenter, AlignRight, AlignJustify, List, ListOrdered, CheckSquare } from 'lucide-react'

const ListAlignmentDropdown = ({ editor, onClose }) => {
  const setListAlignment = (alignment) => {
    // Store current list type
    const isBulletList = editor.isActive('bulletList')
    const isOrderedList = editor.isActive('orderedList')
    const isTaskList = editor.isActive('taskList')
    
    // Apply alignment to the list items
    editor.chain().focus().setTextAlign(alignment).run()
    
    // Ensure the list type is maintained
    if (isBulletList && !editor.isActive('bulletList')) {
      editor.chain().focus().toggleBulletList().run()
    } else if (isOrderedList && !editor.isActive('orderedList')) {
      editor.chain().focus().toggleOrderedList().run()
    } else if (isTaskList && !editor.isActive('taskList')) {
      editor.chain().focus().toggleTaskList().run()
    }
    
    onClose()
  }

  const getCurrentListType = () => {
    if (editor.isActive('bulletList')) return { icon: List, name: 'Bullet List' }
    if (editor.isActive('orderedList')) return { icon: ListOrdered, name: 'Numbered List' }
    if (editor.isActive('taskList')) return { icon: CheckSquare, name: 'Task List' }
    return null
  }

  const currentList = getCurrentListType()
  const currentAlignment = () => {
    if (editor.isActive({ textAlign: 'left' })) return 'Left'
    if (editor.isActive({ textAlign: 'center' })) return 'Center'
    if (editor.isActive({ textAlign: 'right' })) return 'Right'
    if (editor.isActive({ textAlign: 'justify' })) return 'Justify'
    return 'Left'
  }

  return (
    <div className="absolute top-full left-0 mt-1.5 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border p-2 z-50 w-56">
      {currentList && (
        <div className="flex items-center gap-2 px-3 py-2 mb-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <currentList.icon size={14} className="text-purple-500" />
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
            {currentList.name}
          </span>
          <span className="text-xs text-gray-400 ml-auto">
            Align: {currentAlignment()}
          </span>
        </div>
      )}
      
      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
        Align List Items
      </div>
      
      <button 
        onClick={() => setListAlignment('left')} 
        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex items-center gap-3 transition group"
      >
        <AlignLeft size={16} className="group-hover:text-purple-500" /> 
        <span>Left Align</span>
        <span className="text-xs text-gray-400 ml-auto">Ctrl+Shift+L</span>
      </button>
      
      <button 
        onClick={() => setListAlignment('center')} 
        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex items-center gap-3 transition group"
      >
        <AlignCenter size={16} className="group-hover:text-purple-500" /> 
        <span>Center Align</span>
        <span className="text-xs text-gray-400 ml-auto">Ctrl+Shift+E</span>
      </button>
      
      <button 
        onClick={() => setListAlignment('right')} 
        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex items-center gap-3 transition group"
      >
        <AlignRight size={16} className="group-hover:text-purple-500" /> 
        <span>Right Align</span>
        <span className="text-xs text-gray-400 ml-auto">Ctrl+Shift+R</span>
      </button>
      
      <button 
        onClick={() => setListAlignment('justify')} 
        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex items-center gap-3 transition group"
      >
        <AlignJustify size={16} className="group-hover:text-purple-500" /> 
        <span>Justify</span>
        <span className="text-xs text-gray-400 ml-auto">Ctrl+Shift+J</span>
      </button>
      
      <div className="border-t my-2"></div>
      
      <div className="text-xs text-gray-400 px-3 py-1">
        Applies alignment to all items in the list
      </div>
    </div>
  )
}

export default ListAlignmentDropdown