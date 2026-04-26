// src/components/admin/FloatingPreviewButton.jsx (ALL DEVICES COMPATIBLE)

import { useState, useEffect } from 'react';
import { Smartphone, Tablet, Monitor, Eye, X } from 'lucide-react';
import BlogPostPreview from './BlogPostPreview';

export default function FloatingPreviewButton({ title, content, excerpt, featuredImage, tags, category, readingTime }) {
  const [isOpen, setIsOpen] useState(false);
  const [device, setDevice] = useState('desktop');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const devices = [
    { id: 'mobile', name: 'Mobile', icon: Smartphone, width: isMobile ? '95%' : '375px', height: isMobile ? '80vh' : '700px' },
    { id: 'tablet', name: 'Tablet', icon: Tablet, width: isMobile ? '95%' : '768px', height: isMobile ? '80vh' : '900px' },
    { id: 'desktop', name: 'Desktop', icon: Monitor, width: '95%', height: '85vh' },
  ];

  const selectedDevice = devices.find(d => d.id === device);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="floating-preview-btn"
        title="Real Preview"
      >
        <Eye size={isMobile ? 20 : 24} />
        <span className="preview-text">Real Preview</span>
        <style jsx>{`
          .floating-preview-btn {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: auto;
            height: 48px;
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            color: white;
            border: none;
            border-radius: 24px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 0 16px;
            font-weight: 600;
            font-size: 13px;
            z-index: 1000;
            box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
            transition: all 0.3s ease;
          }
          .floating-preview-btn:active {
            transform: scale(0.95);
          }
          .preview-text {
            display: none;
          }
          @media (min-width: 768px) {
            .floating-preview-btn {
              bottom: 30px;
              right: 30px;
              height: 56px;
              gap: 12px;
              padding: 0 24px;
              font-size: 14px;
            }
            .preview-text {
              display: inline;
            }
          }
          @media (hover: hover) {
            .floating-preview-btn:hover {
              transform: scale(1.05);
              box-shadow: 0 6px 20px rgba(99, 102, 241, 0.5);
            }
          }
        `}</style>
      </button>

      {isOpen && (
        <div className="preview-modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="preview-modal" onClick={(e) => e.stopPropagation()}>
            <div className="preview-modal-header">
              <h3>Real Device Preview</h3>
              <div className="device-selector">
                {devices.map((d) => {
                  const Icon = d.icon;
                  return (
                    <button
                      key={d.id}
                      onClick={() => setDevice(d.id)}
                      className={`device-option ${device === d.id ? 'active' : ''}`}
                    >
                      <Icon size={isMobile ? 16 : 18} />
                      <span>{d.name}</span>
                    </button>
                  );
                })}
              </div>
              <button className="close-btn" onClick={() => setIsOpen(false)}>
                <X size={isMobile ? 20 : 24} />
              </button>
            </div>

            <div className="preview-modal-body">
              <div 
                className="device-frame"
                style={{
                  width: selectedDevice.width,
                  height: selectedDevice.height,
                  margin: '0 auto',
                  borderRadius: device === 'mobile' ? (isMobile ? '20px' : '44px') : device === 'tablet' ? (isMobile ? '16px' : '32px') : '0',
                }}
              >
                <div className="device-content">
                  {device === 'mobile' && !isMobile && <div className="mobile-notch"></div>}
                  <div className="preview-scroll">
                    <BlogPostPreview 
                      title={title}
                      content={content}
                      excerpt={excerpt}
                      featuredImage={featuredImage}
                      tags={tags}
                      category={category}
                      readingTime={readingTime}
                    />
                  </div>
                  {device === 'mobile' && !isMobile && <div className="mobile-home-bar"></div>}
                </div>
              </div>
            </div>

            <style jsx>{`
              .preview-modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.8);
                z-index: 2000;
                display: flex;
                align-items: center;
                justify-content: center;
                animation: fadeIn 0.2s ease;
                padding: 10px;
              }
              
              @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
              }
              
              .preview-modal {
                background: #1a1a2e;
                border-radius: 16px;
                width: 95vw;
                max-width: 1400px;
                height: 90vh;
                display: flex;
                flex-direction: column;
                overflow: hidden;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
              }
              
              @media (min-width: 768px) {
                .preview-modal {
                  border-radius: 24px;
                  width: 90vw;
                  height: 85vh;
                }
              }
              
              .preview-modal-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 12px 16px;
                background: #ffffff;
                border-bottom: 1px solid #e2e8f0;
                flex-wrap: wrap;
                gap: 12px;
              }
              
              @media (min-width: 768px) {
                .preview-modal-header {
                  padding: 16px 24px;
                  gap: 16px;
                }
              }
              
              .preview-modal-header h3 {
                margin: 0;
                font-size: 0.9rem;
                font-weight: 600;
                color: #1e293b;
              }
              
              @media (min-width: 768px) {
                .preview-modal-header h3 {
                  font-size: 1.1rem;
                }
              }
              
              .device-selector {
                display: flex;
                gap: 6px;
                background: #f1f5f9;
                padding: 4px;
                border-radius: 10px;
                flex: 1;
                justify-content: center;
              }
              
              @media (min-width: 768px) {
                .device-selector {
                  gap: 8px;
                  border-radius: 12px;
                }
              }
              
              .device-option {
                display: flex;
                align-items: center;
                gap: 4px;
                padding: 6px 10px;
                background: transparent;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 0.7rem;
                font-weight: 500;
                color: #64748b;
                transition: all 0.2s;
              }
              
              @media (min-width: 768px) {
                .device-option {
                  gap: 8px;
                  padding: 8px 16px;
                  font-size: 0.85rem;
                  border-radius: 8px;
                }
              }
              
              .device-option:active {
                transform: scale(0.95);
              }
              
              .device-option.active {
                background: #ffffff;
                color: #6366f1;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
              }
              
              .device-option span {
                display: none;
              }
              
              @media (min-width: 768px) {
                .device-option span {
                  display: inline;
                }
              }
              
              .close-btn {
                background: none;
                border: none;
                cursor: pointer;
                color: #64748b;
                padding: 4px;
                border-radius: 6px;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              
              .close-btn:active {
                transform: scale(0.9);
              }
              
              @media (min-width: 768px) {
                .close-btn {
                  padding: 4px;
                  border-radius: 8px;
                }
                .close-btn:hover {
                  background: #f1f5f9;
                }
              }
              
              .preview-modal-body {
                flex: 1;
                overflow: auto;
                padding: 12px;
                background: #0f172a;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              
              @media (min-width: 768px) {
                .preview-modal-body {
                  padding: 24px;
                }
              }
              
              .device-frame {
                background: #000000;
                overflow: hidden;
                box-shadow: 0 20px 35px -10px rgba(0, 0, 0, 0.5);
                transition: all 0.3s ease;
              }
              
              .device-content {
                position: relative;
                width: 100%;
                height: 100%;
                background: white;
              }
              
              .mobile-notch {
                position: absolute;
                top: 0;
                left: 50%;
                transform: translateX(-50%);
                width: 150px;
                height: 25px;
                background: #000;
                border-radius: 0 0 20px 20px;
                z-index: 10;
              }
              
              .mobile-home-bar {
                position: absolute;
                bottom: 8px;
                left: 50%;
                transform: translateX(-50%);
                width: 120px;
                height: 4px;
                background: #333;
                border-radius: 2px;
              }
              
              .preview-scroll {
                height: 100%;
                overflow-y: auto;
                background: white;
              }
              
              .preview-scroll::-webkit-scrollbar {
                width: 4px;
              }
              
              @media (min-width: 768px) {
                .preview-scroll::-webkit-scrollbar {
                  width: 6px;
                }
              }
              
              .preview-scroll::-webkit-scrollbar-track {
                background: #f1f1f1;
              }
              
              .preview-scroll::-webkit-scrollbar-thumb {
                background: #888;
                border-radius: 3px;
              }
            `}</style>
          </div>
        </div>
      )}
    </>
  );
}