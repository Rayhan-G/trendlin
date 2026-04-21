// src/components/shared/MediaUploader.js (COMPLETE FIXED FILE)

import { useState, useCallback, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { toast } from 'react-hot-toast';
import { uploadToCloudinary } from '@/lib/cloudinary';

export default function MediaUploader({ onImageUpload, onVideoUpload, image, video }) {
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('image');
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropImage, setCropImage] = useState(null);
  const [crop, setCrop] = useState({ unit: '%', width: 80, height: 45, x: 10, y: 10 });
  const [completedCrop, setCompletedCrop] = useState(null);
  const [imageSize, setImageSize] = useState({ width: 1200, height: 800 });
  const [pendingFile, setPendingFile] = useState(null);
  
  const cropImageRef = useRef(null);
  const objectUrlRef = useRef(null);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (activeTab === 'image') {
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image must be less than 10MB');
        return;
      }
      
      // Clean up old URL
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
      
      objectUrlRef.current = URL.createObjectURL(file);
      setCropImage(objectUrlRef.current);
      setPendingFile(file);
      setShowCropModal(true);
    } 
    else if (activeTab === 'video') {
      if (!file.type.startsWith('video/')) {
        toast.error('Please upload a video file');
        return;
      }
      if (file.size > 100 * 1024 * 1024) {
        toast.error('Video must be less than 100MB');
        return;
      }
      await handleVideoUpload(file);
    }
  }, [activeTab]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: activeTab === 'image' 
      ? { 'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif'] } 
      : { 'video/*': ['.mp4', '.webm', '.mov'] },
    multiple: false,
  });

  const handleVideoUpload = async (file) => {
    setUploading(true);
    const loadingToast = toast.loading('Uploading video...');
    
    try {
      const result = await uploadToCloudinary(file, { 
        resource_type: 'video',
        folder: 'blog/videos'
      });
      
      onVideoUpload({ 
        url: result.url, 
        publicId: result.publicId,
        duration: result.duration 
      });
      
      toast.dismiss(loadingToast);
      toast.success('Video uploaded successfully!');
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Upload error:', error);
      toast.error(error.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const getCroppedImg = useCallback(async () => {
    if (!completedCrop || !cropImageRef.current) return null;

    const image = cropImageRef.current;
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    const cropWidth = completedCrop.width * scaleX;
    const cropHeight = completedCrop.height * scaleY;
    const cropX = completedCrop.x * scaleX;
    const cropY = completedCrop.y * scaleY;
    
    canvas.width = cropWidth;
    canvas.height = cropHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(
      image,
      cropX, cropY, cropWidth, cropHeight,
      0, 0, cropWidth, cropHeight
    );
    
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg', 0.95);
    });
  }, [completedCrop]);

  const resizeImage = (blob, targetWidth, targetHeight) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        canvas.toBlob((resizedBlob) => {
          if (resizedBlob) resolve(resizedBlob);
          else reject(new Error('Resize failed'));
        }, 'image/jpeg', 0.9);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(blob);
    });
  };

  const handleCropComplete = async () => {
    if (!completedCrop) {
      toast.error('Please select a crop area');
      return;
    }
    
    if (!pendingFile) {
      toast.error('No file selected');
      return;
    }
    
    setUploading(true);
    const loadingToast = toast.loading('Processing image...');
    
    try {
      const croppedBlob = await getCroppedImg();
      if (!croppedBlob) throw new Error('Failed to crop image');
      
      const resizedBlob = await resizeImage(croppedBlob, imageSize.width, imageSize.height);
      
      // Convert Blob to File for Cloudinary
      const fileToUpload = new File([resizedBlob], pendingFile.name, { type: 'image/jpeg' });
      
      const result = await uploadToCloudinary(fileToUpload, { 
        resource_type: 'image',
        folder: 'blog/images'
      });
      
      onImageUpload({ 
        url: result.url, 
        publicId: result.publicId, 
        width: imageSize.width, 
        height: imageSize.height 
      });
      
      setShowCropModal(false);
      toast.dismiss(loadingToast);
      toast.success('Image uploaded successfully!');
      
      // Cleanup
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
      setCropImage(null);
      setPendingFile(null);
      setCompletedCrop(null);
      
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Upload error:', error);
      toast.error(error.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    onImageUpload(null);
    toast.success('Image removed');
  };

  const removeVideo = () => {
    onVideoUpload(null);
    toast.success('Video removed');
  };

  return (
    <div className="media-uploader">
      <div className="media-tabs">
        <button 
          onClick={() => setActiveTab('image')} 
          className={`media-tab ${activeTab === 'image' ? 'active' : ''}`}
          type="button"
        >
          🖼️ Images
        </button>
        <button 
          onClick={() => setActiveTab('video')} 
          className={`media-tab ${activeTab === 'video' ? 'active' : ''}`}
          type="button"
        >
          🎥 Videos
        </button>
      </div>

      <div {...getRootProps()} className={`dropzone ${isDragActive ? 'drag-active' : ''}`}>
        <input {...getInputProps()} />
        <div className="dropzone-content">
          <span className="upload-icon">{activeTab === 'image' ? '📸' : '🎬'}</span>
          <p>{uploading ? 'Uploading...' : (isDragActive ? 'Drop your file here' : `Drag & drop or click to upload ${activeTab}`)}</p>
          <p className="upload-hint">
            {activeTab === 'image' ? 'JPG, PNG, WebP, GIF up to 10MB' : 'MP4, WebM, MOV up to 100MB'}
          </p>
        </div>
      </div>

      {(image || video) && (
        <div className="media-preview">
          {image && (
            <div className="media-item">
              <img src={image.url} alt="Featured" />
              <div className="media-controls">
                <div className="control-group">
                  <label>Width</label>
                  <input 
                    type="number" 
                    value={imageSize.width} 
                    onChange={(e) => setImageSize({...imageSize, width: parseInt(e.target.value) || 1200})} 
                  />
                </div>
                <div className="control-group">
                  <label>Height</label>
                  <input 
                    type="number" 
                    value={imageSize.height} 
                    onChange={(e) => setImageSize({...imageSize, height: parseInt(e.target.value) || 800})} 
                  />
                </div>
                <div className="preset-buttons">
                  <button onClick={() => setImageSize({ width: 300, height: 200 })}>300x200</button>
                  <button onClick={() => setImageSize({ width: 600, height: 400 })}>600x400</button>
                  <button onClick={() => setImageSize({ width: 1200, height: 800 })}>1200x800</button>
                  <button onClick={() => setImageSize({ width: 1920, height: 1080 })}>1920x1080</button>
                </div>
              </div>
              <button className="remove-btn" onClick={removeImage}>×</button>
            </div>
          )}
          
          {video && (
            <div className="media-item video-item">
              <video src={video.url} className="video-preview" controls style={{ width: '100%', maxHeight: '200px' }} />
              <button className="remove-btn" onClick={removeVideo}>×</button>
            </div>
          )}
        </div>
      )}

      {showCropModal && cropImage && (
        <div className="crop-modal" onClick={() => setShowCropModal(false)}>
          <div className="crop-modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Crop & Resize Image</h3>
            <div className="crop-area">
              <ReactCrop
                crop={crop}
                onChange={c => setCrop(c)}
                onComplete={c => setCompletedCrop(c)}
                aspect={16/9}
              >
                <img 
                  src={cropImage} 
                  alt="Crop" 
                  ref={cropImageRef}
                  className="crop-image" 
                  style={{ maxWidth: '100%', maxHeight: '60vh' }}
                />
              </ReactCrop>
            </div>
            <div className="resize-controls">
              <div className="control-group">
                <label>Target Width</label>
                <input 
                  type="number" 
                  value={imageSize.width} 
                  onChange={(e) => setImageSize({...imageSize, width: parseInt(e.target.value) || 1200})} 
                />
              </div>
              <div className="control-group">
                <label>Target Height</label>
                <input 
                  type="number" 
                  value={imageSize.height} 
                  onChange={(e) => setImageSize({...imageSize, height: parseInt(e.target.value) || 800})} 
                />
              </div>
            </div>
            <div className="crop-actions">
              <button onClick={() => setShowCropModal(false)}>Cancel</button>
              <button onClick={handleCropComplete} disabled={uploading}>
                {uploading ? 'Processing...' : 'Apply & Upload'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .media-uploader {
          background: white;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          overflow: hidden;
        }
        :global(.dark) .media-uploader {
          background: #1e293b;
          border-color: #334155;
        }
        .media-tabs { 
          display: flex; 
          border-bottom: 1px solid #e2e8f0; 
          background: #f8fafc; 
        }
        :global(.dark) .media-tabs {
          background: #0f172a;
          border-bottom-color: #334155;
        }
        .media-tab { 
          flex: 1; 
          padding: 12px; 
          background: transparent; 
          border: none; 
          cursor: pointer; 
          font-weight: 500; 
          color: #64748b;
          transition: all 0.2s;
        }
        .media-tab:hover { background: #f1f5f9; }
        :global(.dark) .media-tab:hover { background: #1e293b; color: #e2e8f0; }
        .media-tab.active { 
          background: white; 
          color: #667eea; 
          border-bottom: 2px solid #667eea; 
        }
        :global(.dark) .media-tab.active {
          background: #1e293b;
          color: #818cf8;
          border-bottom-color: #818cf8;
        }
        .dropzone { 
          border: 2px dashed #cbd5e1; 
          border-radius: 16px; 
          margin: 16px; 
          padding: 32px; 
          text-align: center; 
          cursor: pointer; 
          transition: all 0.2s; 
        }
        :global(.dark) .dropzone { border-color: #475569; }
        .dropzone:hover { border-color: #667eea; background: #f8fafc; }
        :global(.dark) .dropzone:hover { border-color: #818cf8; background: #1e293b; }
        .drag-active { border-color: #667eea; background: #eff6ff; }
        :global(.dark) .drag-active { border-color: #818cf8; background: #1e293b; }
        .upload-icon { font-size: 48px; display: block; margin-bottom: 12px; }
        .upload-hint { font-size: 12px; color: #94a3b8; margin-top: 8px; }
        .media-preview { padding: 16px; border-top: 1px solid #e2e8f0; }
        :global(.dark) .media-preview { border-top-color: #334155; }
        .media-item { position: relative; border-radius: 16px; overflow: hidden; background: #f1f5f9; }
        :global(.dark) .media-item { background: #0f172a; }
        .media-item img { width: 100%; height: auto; }
        .video-preview { width: 100%; max-height: 200px; border-radius: 12px; }
        .media-controls, .video-controls { 
          padding: 16px; 
          background: #f8fafc; 
          border-top: 1px solid #e2e8f0; 
          display: flex; 
          flex-wrap: wrap; 
          gap: 16px; 
          align-items: center; 
        }
        :global(.dark) .media-controls, :global(.dark) .video-controls {
          background: #0f172a;
          border-top-color: #334155;
        }
        .control-group { display: flex; align-items: center; gap: 8px; }
        .control-group label { font-size: 12px; font-weight: 500; color: #475569; }
        :global(.dark) .control-group label { color: #94a3b8; }
        .control-group input, .control-group select { 
          padding: 4px 8px; 
          border: 1px solid #e2e8f0; 
          border-radius: 8px; 
          font-size: 12px; 
          width: 80px; 
        }
        :global(.dark) .control-group input, :global(.dark) .control-group select {
          background: #1e293b;
          border-color: #475569;
          color: #e2e8f0;
        }
        .preset-buttons { display: flex; gap: 8px; flex-wrap: wrap; }
        .preset-buttons button { 
          padding: 4px 12px; 
          background: #e2e8f0; 
          border: none; 
          border-radius: 8px; 
          cursor: pointer; 
          font-size: 12px; 
        }
        :global(.dark) .preset-buttons button {
          background: #334155;
          color: #e2e8f0;
        }
        .preset-buttons button:hover { background: #cbd5e1; }
        :global(.dark) .preset-buttons button:hover { background: #475569; }
        .apply-btn { 
          padding: 6px 16px; 
          background: #667eea; 
          color: white; 
          border: none; 
          border-radius: 8px; 
          cursor: pointer; 
        }
        .apply-btn:hover { background: #5b6fd8; }
        .remove-btn { 
          position: absolute; 
          top: 12px; 
          right: 12px; 
          width: 32px; 
          height: 32px; 
          background: rgba(239,68,68,0.9); 
          color: white; 
          border: none; 
          border-radius: 50%; 
          cursor: pointer; 
          font-size: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .remove-btn:hover { background: rgba(220,38,38,1); }
        .crop-modal { 
          position: fixed; 
          top: 0; 
          left: 0; 
          right: 0; 
          bottom: 0; 
          background: rgba(0,0,0,0.9); 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          z-index: 1000; 
        }
        .crop-modal-content { 
          background: white; 
          border-radius: 24px; 
          padding: 24px; 
          max-width: 90vw; 
          max-height: 90vh; 
          overflow: auto; 
        }
        :global(.dark) .crop-modal-content { background: #1e293b; }
        .crop-modal-content h3 { font-size: 20px; margin-bottom: 20px; color: #1e293b; }
        :global(.dark) .crop-modal-content h3 { color: #f1f5f9; }
        .crop-area { margin-bottom: 20px; text-align: center; }
        .resize-controls { 
          display: flex; 
          gap: 16px; 
          align-items: center; 
          flex-wrap: wrap; 
          margin-bottom: 20px; 
          padding: 16px; 
          background: #f8fafc; 
          border-radius: 16px; 
        }
        :global(.dark) .resize-controls { background: #0f172a; }
        .crop-actions { display: flex; gap: 12px; justify-content: flex-end; }
        .crop-actions button { 
          padding: 10px 24px; 
          border-radius: 40px; 
          border: none; 
          cursor: pointer; 
          font-weight: 500; 
        }
        .crop-actions button:first-child { background: #f1f5f9; color: #475569; }
        .crop-actions button:last-child { background: #667eea; color: white; }
        .crop-actions button:last-child:disabled { opacity: 0.6; cursor: not-allowed; }
        :global(.dark) .crop-actions button:first-child { background: #334155; color: #e2e8f0; }
        @media (max-width: 768px) {
          .media-controls, .video-controls { flex-direction: column; align-items: stretch; }
          .control-group { justify-content: space-between; }
          .preset-buttons { justify-content: center; }
          .resize-controls { flex-direction: column; align-items: stretch; }
        }
      `}</style>
    </div>
  );
}