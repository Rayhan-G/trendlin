// src/components/shared/LoadingSpinner.jsx
export default function LoadingSpinner() {
  return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <style jsx>{`
        .loading-container {
          min-height: 60vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .loading-spinner {
          width: 48px;
          height: 48px;
          border: 3px solid #e2e8f0;
          border-top-color: #667eea;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}