// src/components/Editor/TaskListExtension.jsx
import { TaskList as BaseTaskList, TaskItem as BaseTaskItem } from '@tiptap/extension-task-list'
import { Node } from '@tiptap/core'

// Custom TaskItem that handles proper line breaks
export const CustomTaskItem = BaseTaskItem.extend({
  addKeyboardShortcuts() {
    return {
      Enter: ({ editor }) => {
        const { state } = editor
        const { selection } = state
        const { $from } = selection
        
        // Check if we're at the end of a task item
        if ($from.parent.type.name === 'taskItem') {
          const isEmpty = $from.parent.textContent.length === 0
          
          if (isEmpty) {
            // Convert empty task item to paragraph
            return editor.chain().focus().liftTaskItem().run()
          } else {
            // Split the task item and create a new task item below
            return editor.chain().focus().splitListItem('taskItem').run()
          }
        }
        
        return false
      },
      
      'Shift-Enter': () => {
        // Shift+Enter creates a soft break within the task item
        return this.editor.chain().focus().insertContent('<br />').run()
      },
      
      Backspace: ({ editor }) => {
        const { state } = editor
        const { selection } = state
        const { $from } = selection
        
        if ($from.parent.type.name === 'taskItem' && $from.parent.textContent.length === 0) {
          // Remove empty task item and go to previous node
          return editor.chain().focus().deleteNode('taskItem').run()
        }
        
        return false
      }
    }
  },
})

// Custom TaskList with better behavior
export const CustomTaskList = BaseTaskList.extend({
  addKeyboardShortcuts() {
    return {
      Tab: ({ editor }) => {
        // Indent task item
        return editor.chain().focus().sinkListItem('taskItem').run()
      },
      'Shift-Tab': ({ editor }) => {
        // Outdent task item
        return editor.chain().focus().liftListItem('taskItem').run()
      }
    }
  },
})