// src/components/ErrorBoundary.js
import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, errorMessage: '' }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, errorMessage: error.message }
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console for debugging (users won't see this)
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          background: 'var(--bg-color, #ffffff)'
        }}>
          <div style={{ 
            textAlign: 'center', 
            maxWidth: '400px',
            margin: '0 auto'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>😌</div>
            <h2 style={{ 
              marginBottom: '12px', 
              fontSize: '24px',
              fontWeight: '600',
              color: 'var(--text-color, #1f2937)'
            }}>
              Something went wrong
            </h2>
            <p style={{ 
              color: 'var(--text-secondary, #6b7280)', 
              marginBottom: '24px',
              fontSize: '14px',
              lineHeight: '1.5'
            }}>
              Don't worry, it's not you - it's us. Please refresh the page and try again.
            </p>
            <button 
              onClick={() => window.location.reload()}
              style={{
                padding: '10px 24px',
                background: '#06b6d4',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#0891b2'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#06b6d4'}
            >
              Refresh Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary