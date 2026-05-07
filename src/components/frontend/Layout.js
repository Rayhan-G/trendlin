// src/components/frontend/Layout.js

import Navbar from './Navbar'
import Footer from './Footer'
import { useEffect } from 'react'

export default function FrontendLayout({ children }) {
  useEffect(() => {
    // Force all hero sections to touch navbar
    const style = document.createElement('style');
    style.textContent = `
      section:first-of-type,
      .hero-section,
      .hero,
      [class*="hero"]:first-child {
        margin-top: -1px !important;
        padding-top: 0 !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="layout-wrapper">
      <Navbar />
      <main className="main-content">
        {children}
      </main>
      <Footer />
      
      <style jsx>{`
        .layout-wrapper {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          background: #f5f7fa;
        }
        .main-content {
          flex: 1;
          width: 100%;
          max-width: 100%;
          overflow-x: hidden;
          margin-top: 0;
          padding-top: 0;
        }
        /* Dark mode support */
        :global(.dark) .layout-wrapper {
          background: #0f172a;
        }
      `}</style>
    </div>
  )
}