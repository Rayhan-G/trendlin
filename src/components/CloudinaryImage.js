import { useState, useEffect } from 'react'
import { optimizeImage, getResponsiveSrcSet } from '@/lib/cloudinary'

export default function CloudinaryImage({ 
  src, 
  alt, 
  width,
  height,
  sizes = '100vw',
  priority = false,
  className = '',
  aspectRatio = '16:9'
}) {
  const [loaded, setLoaded] = useState(false)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    if (!priority) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              setInView(true)
              observer.disconnect()
            }
          })
        },
        { rootMargin: '200px' }
      )
      
      const element = document.getElementById(`img-${src}`)
      if (element) observer.observe(element)
      
      return () => observer.disconnect()
    } else {
      setInView(true)
    }
  }, [src, priority])

  const optimizedSrc = optimizeImage(src, { width, height })
  const srcSet = getResponsiveSrcSet(src)
  
  // Blur placeholder (low quality image)
  const blurUrl = optimizeImage(src, { width: 20, quality: 10 })

  if (!inView && !priority) {
    return (
      <div 
        id={`img-${src}`}
        className={`image-placeholder ${className}`}
        style={{ 
          aspectRatio: aspectRatio,
          background: '#f1f5f9'
        }}
      >
        <div className="skeleton"></div>
        <style jsx>{`
          .image-placeholder {
            position: relative;
            overflow: hidden;
            border-radius: 16px;
          }
          .skeleton {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
          }
          @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className={`image-wrapper ${className}`} style={{ aspectRatio: aspectRatio }}>
      <img
        src={optimizedSrc}
        alt={alt}
        srcSet={srcSet}
        sizes={sizes}
        loading={priority ? 'eager' : 'lazy'}
        className={`cloudinary-image ${loaded ? 'loaded' : 'loading'}`}
        onLoad={() => setLoaded(true)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transition: 'opacity 0.3s ease',
          opacity: loaded ? 1 : 0
        }}
      />
      {!loaded && (
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
            transition: 'opacity 0.3s ease'
          }}
        />
      )}
      
      <style jsx>{`
        .image-wrapper {
          position: relative;
          overflow: hidden;
          border-radius: 16px;
          background: #f1f5f9;
        }
        
        .cloudinary-image {
          position: relative;
          z-index: 1;
        }
        
        .blur-placeholder {
          position: absolute;
          top: 0;
          left: 0;
          z-index: 0;
        }
        
        :global(body.dark) .image-wrapper {
          background: #1e293b;
        }
      `}</style>
    </div>
  )
}