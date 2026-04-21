// src/components/frontend/DarkModeToggle.js
import { useState, useEffect } from 'react'

export default function DarkModeToggle() {
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('darkMode')
    if (saved === 'enabled') {
      setDarkMode(true)
      document.body.classList.add('dark')
    }
  }, [])

  const toggleDarkMode = () => {
    if (darkMode) {
      document.body.classList.remove('dark')
      localStorage.setItem('darkMode', 'disabled')
      setDarkMode(false)
    } else {
      document.body.classList.add('dark')
      localStorage.setItem('darkMode', 'enabled')
      setDarkMode(true)
    }
  }

  return (
    <button
      onClick={toggleDarkMode}
      style={{
        background: 'none',
        border: 'none',
        fontSize: '1.2rem',
        cursor: 'pointer',
        padding: '8px 12px',
        borderRadius: '40px',
        transition: 'background 0.2s',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}
      onMouseEnter={(e) => e.target.style.background = 'var(--light)'}
      onMouseLeave={(e) => e.target.style.background = 'none'}
      aria-label="Toggle dark mode"
    >
      {darkMode ? (
        <>
          <span>☀️</span>
          <span style={{ fontSize: '0.8rem' }}>Light</span>
        </>
      ) : (
        <>
          <span>🌙</span>
          <span style={{ fontSize: '0.8rem' }}>Dark</span>
        </>
      )}
    </button>
  )
}