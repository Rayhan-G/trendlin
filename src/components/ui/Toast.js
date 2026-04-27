// src/components/ui/Toast.js
import { useState, useEffect } from 'react'

export default function Toast() {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    const handleShowToast = (event) => {
      const { message, type = 'success', duration = 3000 } = event.detail
      const id = Date.now()
      
      setToasts(prev => [...prev, { id, message, type }])
      
      setTimeout(() => {
        setToasts(prev => prev.filter(toast => toast.id !== id))
      }, duration)
    }
    
    window.addEventListener('showToast', handleShowToast)
    
    return () => {
      window.removeEventListener('showToast', handleShowToast)
    }
  }, [])

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          <span className="toast-icon">
            {toast.type === 'success' && '✓'}
            {toast.type === 'error' && '⚠'}
            {toast.type === 'info' && 'ℹ'}
          </span>
          <span className="toast-message">{toast.message}</span>
        </div>
      ))}
      <style jsx>{`
        .toast-container {
          position: fixed;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10001;
          display: flex;
          flex-direction: column;
          gap: 8px;
          pointer-events: none;
        }
        .toast {
          background: white;
          border-radius: 40px;
          padding: 12px 20px;
          display: flex;
          align-items: center;
          gap: 10px;
          box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);
          animation: slideUp 0.3s ease;
          pointer-events: auto;
        }
        .toast-success {
          background: #10b981;
          color: white;
        }
        .toast-error {
          background: #ef4444;
          color: white;
        }
        .toast-info {
          background: #3b82f6;
          color: white;
        }
        .toast-icon {
          font-weight: bold;
          font-size: 14px;
        }
        .toast-message {
          font-size: 14px;
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @media (max-width: 640px) {
          .toast-container {
            bottom: 16px;
            left: 16px;
            right: 16px;
            transform: none;
          }
          .toast {
            width: calc(100% - 32px);
          }
        }
      `}</style>
    </div>
  )
}