export default function HeroSection() {
  const icons = [
    { icon: '🤖', top: '8%', left: '5%' },
    { icon: '📈', top: '18%', left: '82%' },
    { icon: '🌿', top: '30%', left: '15%' },
    { icon: '💰', top: '48%', left: '88%' },
    { icon: '🌍', top: '58%', left: '8%' },
    { icon: '⚡', top: '72%', left: '78%' },
    { icon: '✨', top: '78%', left: '18%' },  /* Moved from 88% to 92% */
  ]

  return (
    <div className="hero">
      {/* Color Layer */}
      <div className="color-layer"></div>
      
      {/* Scattered Icons - Background Layer */}
      <div className="icons-container">
        {icons.map((item, index) => (
          <div 
            key={index} 
            className="icon-bubble"
            style={{ top: item.top, left: item.left }}
          >
            <div className="icon-circle">
              <span className="icon">{item.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Center Content */}
      <div className="hero-content">
        <h1 className="hero-title">
          <span className="trend-line">What's trending</span>
          <br />
          <span className="gradient">is what matters.</span>
        </h1>
        <p className="hero-subtitle">
          AI. Markets. Wellness. Money.
          <br />
          We track the signals, so you stay ahead.
        </p>
      </div>

      <style jsx>{`
        .hero {
          position: relative;
          min-height: 48.6vh;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          padding: 2rem 0;
        }
        
        /* Color Layer */
        .color-layer {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
          opacity: 0.15;
        }
        
        :global(body.dark) .color-layer {
          opacity: 0.25;
        }
        
        /* Scattered Icons Container - Background Layer */
        .icons-container {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1;
        }
        
        .icon-bubble {
          position: absolute;
          display: flex;
          flex-direction: column;
          align-items: center;
          animation: float 4s ease-in-out infinite;
          animation-delay: calc(var(--i, 0) * 0.4s);
          pointer-events: none;
        }
        
        .icon-bubble:nth-child(1) { --i: 0; animation-delay: 0s; }
        .icon-bubble:nth-child(2) { --i: 1; animation-delay: 0.4s; }
        .icon-bubble:nth-child(3) { --i: 2; animation-delay: 0.8s; }
        .icon-bubble:nth-child(4) { --i: 3; animation-delay: 1.2s; }
        .icon-bubble:nth-child(5) { --i: 4; animation-delay: 1.6s; }
        .icon-bubble:nth-child(6) { --i: 5; animation-delay: 2.0s; }
        .icon-bubble:nth-child(7) { --i: 6; animation-delay: 2.4s; }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }
        
        .icon-circle {
          width: 50px;
          height: 50px;
          background: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
        }
        
        :global(body.dark) .icon-circle {
          background: #1e293b;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
        }
        
        .icon {
          font-size: 1.6rem;
        }
        
        /* Center Content - Above icons */
        .hero-content {
          position: relative;
          z-index: 2;
          text-align: center;
          max-width: 800px;
          padding: 0 24px;
        }
        
        .hero-title {
          font-size: 3.5rem;
          font-weight: 800;
          line-height: 1.1;
          margin-bottom: 1.5rem;
          color: #0f172a;
        }
        
        :global(body.dark) .hero-title {
          color: #ffffff;
        }
        
        .trend-line {
          font-size: 2rem;
          font-weight: 500;
          opacity: 0.8;
          letter-spacing: -0.02em;
        }
        
        .gradient {
          font-size: 3.5rem;
          font-weight: 800;
          background: linear-gradient(135deg, #2563eb, #7c3aed, #f093fb);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          display: inline-block;
        }
        
        .hero-subtitle {
          font-size: 1.1rem;
          color: #475569;
          line-height: 1.6;
          margin: 0;
          font-weight: 400;
        }
        
        :global(body.dark) .hero-subtitle {
          color: #cbd5e1;
        }
        
        /* Mobile First - Responsive */
        @media (max-width: 768px) {
          .hero {
            min-height: auto;
            padding: 3rem 0;
          }
          
          .hero-title {
            font-size: 2.5rem;
          }
          
          .trend-line {
            font-size: 1.5rem;
          }
          
          .gradient {
            font-size: 2.5rem;
          }
          
          .hero-subtitle {
            font-size: 0.95rem;
          }
          
          .hero-subtitle br {
            display: none;
          }
          
          .icon-circle {
            width: 40px;
            height: 40px;
          }
          
          .icon {
            font-size: 1.3rem;
          }
        }
        
        @media (max-width: 640px) {
          .hero-title {
            font-size: 2rem;
          }
          
          .trend-line {
            font-size: 1.2rem;
          }
          
          .gradient {
            font-size: 2rem;
          }
          
          .hero-subtitle {
            font-size: 0.85rem;
          }
          
          .icon-circle {
            width: 35px;
            height: 35px;
          }
          
          .icon {
            font-size: 1.1rem;
          }
        }
        
        @media (min-width: 769px) and (max-width: 1024px) {
          .hero-title {
            font-size: 3rem;
          }
          
          .gradient {
            font-size: 3rem;
          }
        }
      `}</style>
    </div>
  )
}