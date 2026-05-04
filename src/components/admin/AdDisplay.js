// components/ads/AdDisplay.js
import { useEffect, useRef, useState, useCallback } from 'react'
import DOMPurify from 'dompurify'

const adCache = new Map()

export default function AdDisplay({ slotId, position, className = '' }) {
  const containerRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [adBlocked, setAdBlocked] = useState(false)

  const loadAd = useCallback(async () => {
    setLoading(true)
    
    try {
      // Check browser cache
      const cached = adCache.get(slotId)
      if (cached && Date.now() - cached.timestamp < 300000) {
        renderAd(cached.html)
        setLoading(false)
        return
      }
      
      // Fetch from edge API (goes to CDN then Redis then DB)
      const response = await fetch(`/api/ads/${slotId}`, {
        headers: { 'X-Position': position }
      })
      
      if (!response.ok) throw new Error('Ad not found')
      
      const data = await response.json()
      
      // Cache in memory
      adCache.set(slotId, {
        html: data.html,
        timestamp: Date.now(),
        codeId: data.codeId
      })
      
      renderAd(data.html)
      
      // Track impression asynchronously (fire and forget)
      navigator.sendBeacon('/api/track-impression', JSON.stringify({
        slotId,
        codeId: data.codeId,
        position
      }))
      
    } catch (err) {
      console.error('Ad load error:', err)
    } finally {
      setLoading(false)
    }
  }, [slotId, position])

  const renderAd = (html) => {
    if (!containerRef.current) return
    
    const sanitized = DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['div', 'img', 'a', 'iframe', 'button', 'span', 'p', 'br'],
      ALLOWED_ATTR: ['src', 'href', 'class', 'id', 'style', 'alt', 'target', 'rel', 'width', 'height']
    })
    
    containerRef.current.innerHTML = sanitized
    
    // Optimize iframes
    containerRef.current.querySelectorAll('iframe').forEach(iframe => {
      iframe.setAttribute('loading', 'lazy')
      iframe.style.maxWidth = '100%'
    })
    
    // Optimize images
    containerRef.current.querySelectorAll('img').forEach(img => {
      img.setAttribute('loading', 'lazy')
      img.style.maxWidth = '100%'
      img.style.height = 'auto'
    })
  }

  const checkAdBlocker = useCallback(() => {
    const test = document.createElement('div')
    test.className = 'adsbox'
    test.style.cssText = 'position:absolute;width:1px;height:1px'
    document.body.appendChild(test)
    
    setTimeout(() => {
      if (test.offsetHeight === 0) {
        setAdBlocked(true)
      }
      test.remove()
    }, 100)
  }, [])

  useEffect(() => {
    checkAdBlocker()
    loadAd()
    
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }
    }
  }, [loadAd, checkAdBlocker])

  if (adBlocked) {
    return (
      <div className={`text-center p-3 text-gray-500 text-xs ${className}`}>
        Please disable ad blocker
      </div>
    )
  }

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-[90px] bg-gray-50 ${className}`}>
        <div className="w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={`ad-container ${className}`}
      style={{ width: '100%', overflow: 'hidden', textAlign: 'center' }}
    />
  )
}