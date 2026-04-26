// src/components/admin/Toast.jsx (ALL DEVICES COMPATIBLE)

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

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500'
      case 'error':
        return 'bg-red-500'
      case 'warning':
        return 'bg-yellow-500'
      default:
        return 'bg-blue-500'
    }
  }

  return (
    <div className={`fixed bottom-3 left-3 right-3 sm:bottom-4 sm:right-4 sm:left-auto z-50 flex items-center gap-2 sm:gap-3 px-3 py-2 sm:px-4 sm:py-3 rounded-lg shadow-lg text-white ${getBgColor()} animate-slide-up max-w-[calc(100vw-24px)] sm:max-w-md`}>
      <span className="text-sm sm:text-base">{getIcon()}</span>
      <span className="text-xs sm:text-sm flex-1 break-words">{message}</span>
      <button onClick={onClose} className="ml-1 sm:ml-2 text-white/80 hover:text-white active:scale-90 text-sm sm:text-base">
        ✕
      </button>
    </div>
  )
}