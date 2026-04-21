// src/components/frontend/CloudinaryImage.js (COMPLETE FIXED FILE)

import { useState, useEffect, useRef } from 'react'
import { optimizeImage, getResponsiveSrcSet } from '@/lib/cloudinary'

export default function CloudinaryImage({ 
  src, 
  alt = '', 
  width,
  height,
  sizes = '100vw',
  priority = false,
  className = '',
  aspectRatio = '16/9',
  objectFit = 'cover',
  onError: onErrorProp,
  onLoad: onLoadProp
}) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)
  const [inView, setInView] = useState(false)
  const imgRef = useRef(null)
  const observerRef = useRef(null)

  // Validate src
  if (!src) {
    console.warn('CloudinaryImage: src prop is required')
    return null
  }

  // Generate unique ID from src hash
  const getImageId = () => {
    let hash = 0
    for (let i = 0; i < src.length; i++) {
      hash = ((hash << 5) - hash) + src.charCodeAt(i)
      hash |= 0
    }
    return `img-${Math.abs(hash)}`
  }

  const imageId = getImageId()

  // Calculate aspect ratio as number
  const getAspectRatioValue = () => {
    if (typeof aspectRatio === 'string') {
      const [w, h] = aspectRatio.split(/[\/:]/).map(Number)
      if (w && h && !isNaN(w) && !isNaN(h)) {
        return w / h
      }
    }
    if (typeof aspectRatio === 'number') {
      return aspectRatio
    }
    return 16 / 9 // default
  }

  const aspectRatioValue = getAspectRatioValue()
  const paddingBottom = `${(1 / aspectRatioValue) * 100}%`

  // Lazy loading with IntersectionObserver
  useEffect(() => {
    if (priority) {
      setInView(true)
      return
    }

    const element = document.getElementById(imageId)
    if (!element) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setInView(true)
            if (observerRef.current) {
              observerRef.current.disconnect()
            }
          }
        })
      },
      { rootMargin: '200px', threshold: 0.01 }
    )

    observerRef.current.observe(element)

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [src, priority, imageId])

  // Reset loaded state when src changes
  useEffect(() => {
    setLoaded(false)
    setError(false)
  }, [src])

  const handleLoad = () => {
    setLoaded(true)
    if (onLoadProp) onLoadProp()
  }

  const handleError = () => {
    setError(true)
    if (onErrorProp) onErrorProp()
  }

  // Generate optimized URLs
  const optimizedSrc = optimizeImage(src, { width, height })
  const srcSet = getResponsiveSrcSet(src)
  const blurUrl = optimizeImage(src, { width: 20, height: 20, quality: 10 })

  // Loading skeleton
  if (!inView && !priority) {
    return (
      <div 
        id={imageId}
        className={`image-placeholder ${className}`}
        style={{ 
          position: 'relative',
          width: '100%',
          paddingBottom: paddingBottom,
          backgroundColor: '#f1f5f9',
          overflow: 'hidden',
          borderRadius: '16px'
        }}
      >
        <div className="skeleton" style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite'
        }} />
        <style jsx>{`
          @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
          :global(body.dark) .skeleton {
            background: linear-gradient(90deg, #1e293b 25%, #334155 50%, #1e293b 75%);
          }
        `}</style>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div 
        className={`image-error ${className}`}
        style={{
          width: '100%',
          paddingBottom: paddingBottom,
          backgroundColor: '#fef2f2',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}
      >
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          color: '#dc2626'
        }}>
          <span style={{ fontSize: '2rem', display: 'block' }}>🖼️</span>
          <span style={{ fontSize: '0.75rem' }}>Failed to load</span>
        </div>
      </div>
    )
  }

  return (
    <div 
      className={`image-wrapper ${className}`} 
      style={{
        position: 'relative',
        width: '100%',
        paddingBottom: paddingBottom,
        overflow: 'hidden',
        borderRadius: '16px',
        backgroundColor: '#f1f5f9'
      }}
    >
      {/* Blur placeholder */}
      <img
        src={blurUrl}
        alt=""
        className="blur-placeholder"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          filter: 'blur(20px)',
          transform: 'scale(1.1)',
          transition: 'opacity 0.3s ease',
          opacity: loaded ? 0 : 1,
          zIndex: 0
        }}
      />
      
      {/* Main image */}
      <img
        ref={imgRef}
        src={optimizedSrc}
        alt={alt}
        srcSet={srcSet}
        sizes={sizes}
        loading={priority ? 'eager' : 'lazy'}
        className={`cloudinary-image ${loaded ? 'loaded' : 'loading'}`}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: objectFit,
          transition: 'opacity 0.3s ease',
          opacity: loaded ? 1 : 0,
          zIndex: 1
        }}
      />
      
      <style jsx>{`
        .image-wrapper {
          position: relative;
          overflow: hidden;
          border-radius: 16px;
          background: #f1f5f9;
        }
        
        .cloudinary-image {
          display: block;
        }
        
        .blur-placeholder {
          pointer-events: none;
        }
        
        :global(body.dark) .image-wrapper {
          background: #1e293b;
        }
        
        :global(body.dark) .image-error {
          background: #7f1d1d;
        }
      `}</style>
    </div>
  )
}