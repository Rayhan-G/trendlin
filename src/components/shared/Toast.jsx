// src/components/shared/Toast.jsx
import { useEffect, useState } from 'react'

export default function Toast() {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    const handleShowToast = (event) => {
      const { message, type = 'success' } = event.detail
      const id = Date.now()
      
      setToasts(prev => [...prev, { id, message, type }])
      
      // Auto remove after 3 seconds
      setTimeout(() => {
        setToasts(prev => prev.filter(toast => toast.id !== id))
      }, 3000)
    }
    
    window.addEventListener('showToast', handleShowToast)
    return () => window.removeEventListener('showToast', handleShowToast)
  }, [])

  if (toasts.length === 0) return null

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          <span className="toast-icon">
            {toast.type === 'success' && '✅'}
            {toast.type === 'error' && '❌'}
            {toast.type === 'warning' && '⚠️'}
            {toast.type === 'info' && 'ℹ️'}
          </span>
          <span className="toast-message">{toast.message}</span>
          <button 
            onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
            className="toast-close"
          >
            ✕
          </button>
        </div>
      ))}
      
      <style jsx>{`
        .toast-container {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 10000;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .toast {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 20px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          animation: slideIn 0.3s ease;
          min-width: 280px;
          border-left: 4px solid;
        }
        .toast-success {
          border-left-color: #4caf50;
        }
        .toast-error {
          border-left-color: #f44336;
        }
        .toast-warning {
          border-left-color: #ff9800;
        }
        .toast-info {
          border-left-color: #2196f3;
        }
        .toast-icon {
          font-size: 18px;
        }
        .toast-message {
          flex: 1;
          font-size: 14px;
          color: #333;
        }
        .toast-close {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 14px;
          color: #999;
          padding: 4px;
          transition: color 0.2s;
        }
        .toast-close:hover {
          color: #333;
        }
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @media (max-width: 640px) {
          .toast {
            min-width: 240px;
            padding: 10px 16px;
          }
        }
      `}</style>
    </div>
  )
}