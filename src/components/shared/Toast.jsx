// src/components/shared/Toast.jsx
import { useEffect } from 'react'

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 3000)

    return () => clearTimeout(timer)
  }, [onClose])

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅'
      case 'error':
        return '❌'
      case 'warning':
        return '⚠️'
      default:
        return 'ℹ️'
    }
  }

  return (
    <div className={`toast toast-${type}`}>
      <span>{getIcon()}</span>
      <span style={{ flex: 1 }}>{message}</span>
      <button 
        onClick={onClose} 
        style={{ 
          background: 'none', 
          border: 'none', 
          cursor: 'pointer',
          fontSize: '16px',
          padding: '4px',
          marginLeft: '8px'
        }}
      >
        ✕
      </button>
    </div>
  )
}