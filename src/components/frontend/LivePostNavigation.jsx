import { memo } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const Navigation = memo(({ currentIndex, totalSlides, onPrev, onNext, onGoToSlide }) => {
  return (
    <div className="navigation">
      <motion.button 
        onClick={onPrev} 
        className="nav prev"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Previous slide"
      >
        <ChevronLeft size={24} />
      </motion.button>
      
      <div className="dots">
        {Array.from({ length: totalSlides }).map((_, idx) => (
          <motion.button
            key={idx}
            onClick={() => onGoToSlide(idx)}
            className={`dot ${idx === currentIndex ? 'active' : ''}`}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            aria-label={`Go to slide ${idx + 1}`}
            aria-current={idx === currentIndex ? 'true' : 'false'}
            initial={false}
            animate={{
              width: idx === currentIndex ? 24 : 8,
              opacity: idx === currentIndex ? 1 : 0.4
            }}
            transition={{ duration: 0.2 }}
          />
        ))}
      </div>
      
      <motion.button 
        onClick={onNext} 
        className="nav next"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Next slide"
      >
        <ChevronRight size={24} />
      </motion.button>
      
      <style jsx>{`
        .navigation {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px 24px 24px;
          border-top: 1px solid var(--border-color);
          background: inherit;
        }
        
        .nav {
          width: 44px;
          height: 44px;
          border-radius: 999px;
          background: var(--btn-bg);
          border: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--text-secondary);
          transition: all 0.2s cubic-bezier(0.22, 1, 0.36, 1);
        }
        
        .nav:hover {
          background: var(--primary);
          border-color: var(--primary);
          color: white;
          transform: translateY(-2px);
        }
        
        .dots {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        
        .dot {
          height: 6px;
          border-radius: 3px;
          background: var(--border-color);
          border: none;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.22, 1, 0.36, 1);
        }
        
        .dot:hover {
          background: var(--primary);
          opacity: 0.7;
        }
        
        .dot.active {
          background: var(--primary);
          opacity: 1;
        }
        
        @media (max-width: 768px) {
          .navigation {
            padding: 16px 20px 20px 20px;
          }
          
          .nav {
            width: 36px;
            height: 36px;
          }
          
          .nav svg {
            width: 18px;
            height: 18px;
          }
        }
      `}</style>
    </div>
  )
})

Navigation.displayName = 'Navigation'

export default Navigation