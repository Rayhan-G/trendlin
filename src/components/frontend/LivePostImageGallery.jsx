import { memo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const ImageGallery = memo(({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  
  const nextImage = () => {
    setDirection(1)
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }
  
  const prevImage = () => {
    setDirection(-1)
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }
  
  const imageVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 }
      }
    },
    exit: (direction) => ({
      x: direction > 0 ? -300 : 300,
      opacity: 0,
      scale: 0.95,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 }
      }
    })
  }
  
  return (
    <div className="image-gallery">
      <div className="image-container">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.img 
            key={currentIndex}
            custom={direction}
            variants={imageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            src={images[currentIndex].url}
            alt={`Post image ${currentIndex + 1}`}
            className="post-image"
            loading="lazy"
            decoding="async"
          />
        </AnimatePresence>
        
        {images.length > 1 && (
          <>
            <motion.button 
              onClick={prevImage}
              className="gallery-nav prev"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Previous image"
            >
              <ChevronLeft size={24} />
            </motion.button>
            <motion.button 
              onClick={nextImage}
              className="gallery-nav next"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Next image"
            >
              <ChevronRight size={24} />
            </motion.button>
            <div className="image-counter">
              <span className="counter-current">{currentIndex + 1}</span>
              <span className="counter-separator">/</span>
              <span className="counter-total">{images.length}</span>
            </div>
          </>
        )}
      </div>
      
      <style jsx>{`
        .image-gallery {
          margin: 16px 24px;
        }
        
        .image-container {
          position: relative;
          border-radius: 20px;
          overflow: hidden;
          background: var(--surface-2);
          aspect-ratio: 16 / 9;
          cursor: pointer;
        }
        
        .post-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.5s ease;
        }
        
        .image-container:hover .post-image {
          transform: scale(1.02);
        }
        
        .gallery-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: white;
          transition: all 0.2s ease;
        }
        
        .gallery-nav:hover {
          background: rgba(0, 0, 0, 0.7);
          transform: translateY(-50%) scale(1.05);
        }
        
        .gallery-nav.prev {
          left: 16px;
        }
        
        .gallery-nav.next {
          right: 16px;
        }
        
        .image-counter {
          position: absolute;
          bottom: 16px;
          right: 16px;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(8px);
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 500;
          color: white;
          display: flex;
          gap: 4px;
          letter-spacing: 0.5px;
        }
        
        @media (max-width: 768px) {
          .image-gallery {
            margin: 12px 20px;
          }
          
          .gallery-nav {
            width: 32px;
            height: 32px;
          }
          
          .gallery-nav svg {
            width: 18px;
            height: 18px;
          }
        }
      `}</style>
    </div>
  )
})

ImageGallery.displayName = 'ImageGallery'

export default ImageGallery