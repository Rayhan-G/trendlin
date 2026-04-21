// src/components/admin/FloatingPreviewButton.jsx
import { useState } from 'react';
import { Smartphone, Tablet, Monitor, Eye, X } from 'lucide-react';
import BlogPostPreview from './BlogPostPreview';

export default function FloatingPreviewButton({ title, content, excerpt, featuredImage, tags, category, readingTime }) {
  const [isOpen, setIsOpen] = useState(false);
  const [device, setDevice] = useState('desktop');

  const devices = [
    { id: 'mobile', name: 'Mobile', icon: Smartphone, width: '375px', height: '700px' },
    { id: 'tablet', name: 'Tablet', icon: Tablet, width: '768px', height: '900px' },
    { id: 'desktop', name: 'Desktop', icon: Monitor, width: '1200px', height: '90vh' },
  ];

  const selectedDevice = devices.find(d => d.id === device);

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="floating-preview-btn"
        title="Real Preview"
      >
        <Eye size={24} />
        <span className="preview-text">Real Preview</span>
        <style jsx>{`
          .floating-preview-btn {
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: auto;
            height: 56px;
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            color: white;
            border: none;
            border-radius: 28px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 0 24px;
            font-weight: 600;
            font-size: 14px;
            z-index: 1000;
            box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
            transition: all 0.3s ease;
          }
          .floating-preview-btn:hover {
            transform: scale(1.05);
            box-shadow: 0 6px 20px rgba(99, 102, 241, 0.5);
          }
          .preview-text {
            display: none;
          }
          @media (min-width: 768px) {
            .preview-text {
              display: inline;
            }
          }
        `}</style>
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="preview-modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="preview-modal" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
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
                      <Icon size={18} />
                      <span>{d.name}</span>
                    </button>
                  );
                })}
              </div>
              <button className="close-btn" onClick={() => setIsOpen(false)}>
                <X size={24} />
              </button>
            </div>

            {/* Device Frame */}
            <div className="preview-modal-body">
              <div 
                className="device-frame"
                style={{
                  width: selectedDevice.width,
                  height: selectedDevice.height,
                  margin: '0 auto',
                }}
              >
                <div className="device-content">
                  {device === 'mobile' && (
                    <div className="mobile-notch"></div>
                  )}
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
                  {device === 'mobile' && (
                    <div className="mobile-home-bar"></div>
                  )}
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
              }
              
              @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
              }
              
              .preview-modal {
                background: #1a1a2e;
                border-radius: 24px;
                width: 90vw;
                max-width: 1400px;
                height: 85vh;
                display: flex;
                flex-direction: column;
                overflow: hidden;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
              }
              
              .preview-modal-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 16px 24px;
                background: #ffffff;
                border-bottom: 1px solid #e2e8f0;
                flex-wrap: wrap;
                gap: 16px;
              }
              
              .preview-modal-header h3 {
                margin: 0;
                font-size: 1.1rem;
                font-weight: 600;
                color: #1e293b;
              }
              
              .device-selector {
                display: flex;
                gap: 8px;
                background: #f1f5f9;
                padding: 4px;
                border-radius: 12px;
              }
              
              .device-option {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px 16px;
                background: transparent;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-size: 0.85rem;
                font-weight: 500;
                color: #64748b;
                transition: all 0.2s;
              }
              
              .device-option:hover {
                background: #e2e8f0;
                color: #1e293b;
              }
              
              .device-option.active {
                background: #ffffff;
                color: #6366f1;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
              }
              
              .close-btn {
                background: none;
                border: none;
                cursor: pointer;
                color: #64748b;
                padding: 4px;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              
              .close-btn:hover {
                background: #f1f5f9;
              }
              
              .preview-modal-body {
                flex: 1;
                overflow: auto;
                padding: 24px;
                background: #0f172a;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              
              .device-frame {
                background: #000000;
                border-radius: 44px;
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
                width: 6px;
              }
              
              .preview-scroll::-webkit-scrollbar-track {
                background: #f1f1f1;
              }
              
              .preview-scroll::-webkit-scrollbar-thumb {
                background: #888;
                border-radius: 3px;
              }
              
              @media (max-width: 768px) {
                .preview-modal {
                  width: 95vw;
                  height: 90vh;
                }
                
                .device-option span {
                  display: none;
                }
                
                .device-option {
                  padding: 8px 12px;
                }
              }
            `}</style>
          </div>
        </div>
      )}
    </>
  );
}