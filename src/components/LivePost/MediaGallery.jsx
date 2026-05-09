// components/LivePost/MediaGallery.jsx
import { useState } from 'react'

export default function MediaGallery({ media }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [currentMedia, setCurrentMedia] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  const mediaArray = Array.isArray(media) && media.length > 0 ? media : []
  
  if (mediaArray.length === 0) return null

  const hasMultiple = mediaArray.length > 1

  const openLightbox = (index) => {
    setCurrentIndex(index)
    setCurrentMedia(mediaArray[index])
    setModalOpen(true)
  }

  const nextMedia = () => {
    const next = (currentIndex + 1) % mediaArray.length
    setCurrentIndex(next)
    setCurrentMedia(mediaArray[next])
  }

  const prevMedia = () => {
    const prev = (currentIndex - 1 + mediaArray.length) % mediaArray.length
    setCurrentIndex(prev)
    setCurrentMedia(mediaArray[prev])
  }

  const getGridClass = () => {
    const count = mediaArray.length
    if (count === 1) return 'single'
    if (count === 2) return 'double'
    return 'grid'
  }

  const renderMediaItem = (item, index) => {
    const isVideo = item.type === 'video' || item.url?.match(/\.(mp4|webm|ogg)/i)
    const isAudio = item.type === 'audio' || item.url?.match(/\.(mp3|wav|ogg)/i)
    
    if (isVideo) {
      return (
        <div className="media-item video-item" key={index}>
          <video controls className="media-video" poster={item.thumbnail}>
            <source src={item.url} type="video/mp4" />
          </video>
        </div>
      )
    }
    
    if (isAudio) {
      return (
        <div className="media-item audio-item" key={index}>
          <div className="audio-controls">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 9v6h4l5 5V4L7 9H3z" />
            </svg>
            <audio controls className="audio-player">
              <source src={item.url} />
            </audio>
          </div>
        </div>
      )
    }
    
    return (
      <div className="media-item image-item" key={index} onClick={() => openLightbox(index)}>
        <img src={item.url} alt={item.caption || `Media ${index + 1}`} loading="lazy" />
        {hasMultiple && index === 2 && mediaArray.length > 3 && (
          <div className="more-overlay">
            <span>+{mediaArray.length - 3}</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <div className={`media-gallery ${getGridClass()}`}>
        {mediaArray.slice(0, hasMultiple && mediaArray.length > 3 ? 3 : mediaArray.length).map(renderMediaItem)}
      </div>

      {/* Lightbox Modal */}
      {modalOpen && currentMedia && (
        <div className="lightbox" onClick={() => setModalOpen(false)}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setModalOpen(false)}>✕</button>
            
            {hasMultiple && (
              <>
                <button className="lightbox-prev" onClick={prevMedia}>‹</button>
                <button className="lightbox-next" onClick={nextMedia}>›</button>
                <div className="lightbox-counter">
                  {currentIndex + 1} / {mediaArray.length}
                </div>
              </>
            )}
            
            {currentMedia.url?.match(/\.(mp4|webm)/i) ? (
              <video controls autoPlay className="lightbox-video">
                <source src={currentMedia.url} />
              </video>
            ) : (
              <img src={currentMedia.url} alt={currentMedia.caption} />
            )}
            {currentMedia.caption && <p className="lightbox-caption">{currentMedia.caption}</p>}
          </div>
        </div>
      )}

      <style jsx>{`
        .media-gallery {
          display: grid;
          gap: 2px;
          background: #00000008;
          margin: 8px 0;
        }
        
        .media-gallery.single {
          grid-template-columns: 1fr;
        }
        
        .media-gallery.double {
          grid-template-columns: repeat(2, 1fr);
        }
        
        .media-gallery.grid {
          grid-template-columns: repeat(2, 1fr);
        }
        
        .media-item {
          position: relative;
          cursor: pointer;
          overflow: hidden;
          background: #f1f5f9;
          aspect-ratio: 16 / 9;
        }
        
        .media-item img,
        .media-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }
        
        .media-item:hover img {
          transform: scale(1.02);
        }
        
        .audio-item {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          padding: 0 16px;
        }
        
        .audio-controls {
          display: flex;
          align-items: center;
          gap: 16px;
          width: 100%;
          color: white;
        }
        
        .audio-player {
          flex: 1;
          height: 40px;
        }
        
        .more-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: 700;
          color: white;
        }
        
        .lightbox {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.95);
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: fadeIn 0.2s ease;
        }
        
        .lightbox-content {
          position: relative;
          max-width: 90vw;
          max-height: 90vh;
        }
        
        .lightbox-close {
          position: absolute;
          top: -48px;
          right: 0;
          background: none;
          border: none;
          color: white;
          font-size: 28px;
          cursor: pointer;
          padding: 8px;
        }
        
        .lightbox-prev,
        .lightbox-next {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          font-size: 32px;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .lightbox-prev:hover,
        .lightbox-next:hover {
          background: rgba(255, 255, 255, 0.3);
        }
        
        .lightbox-prev {
          left: -60px;
        }
        
        .lightbox-next {
          right: -60px;
        }
        
        .lightbox-counter {
          position: absolute;
          bottom: -40px;
          left: 50%;
          transform: translateX(-50%);
          color: white;
          font-size: 14px;
        }
        
        .lightbox-content img,
        .lightbox-video {
          max-width: 85vw;
          max-height: 85vh;
          border-radius: 8px;
        }
        
        .lightbox-caption {
          position: absolute;
          bottom: -40px;
          left: 0;
          right: 0;
          text-align: center;
          color: white;
          font-size: 14px;
          margin-top: 16px;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @media (max-width: 768px) {
          .lightbox-prev,
          .lightbox-next {
            width: 36px;
            height: 36px;
            font-size: 24px;
          }
          
          .lightbox-prev {
            left: -40px;
          }
          
          .lightbox-next {
            right: -40px;
          }
          
          .audio-player {
            height: 36px;
          }
        }
      `}</style>
    </>
  )
}