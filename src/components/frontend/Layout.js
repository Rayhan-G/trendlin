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
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />
      <main className="w-full" style={{ margin: 0, padding: 0 }}>
        {children}
      </main>
      <Footer />
    </div>
  )
}