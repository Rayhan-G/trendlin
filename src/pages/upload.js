import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import AdminLayout from '@/components/AdminLayout'
import UploadImage from '@/components/UploadImage'

export default function UploadPage() {
  const router = useRouter()
  const [uploadedUrls, setUploadedUrls] = useState([])

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('admin_logged_in')
    if (!isLoggedIn) {
      router.push('/admin/login')
    }
  }, [])

  const handleUploadComplete = (url) => {
    setUploadedUrls(prev => [url, ...prev])
  }

  const copyToClipboard = (url) => {
    navigator.clipboard.writeText(url)
    alert('URL copied!')
  }

  return (
    <AdminLayout title="Media Uploader">
      <div className="upload-page">
        <div className="upload-section">
          <h2>Upload New Image</h2>
          <UploadImage onUploadComplete={handleUploadComplete} />
        </div>

        {uploadedUrls.length > 0 && (
          <div className="recent-uploads">
            <h3>Recent Uploads</h3>
            <div className="uploads-grid">
              {uploadedUrls.map((url, i) => (
                <div key={i} className="upload-item">
                  <img src={url} alt="Upload" />
                  <button onClick={() => copyToClipboard(url)} className="copy-url">
                    Copy URL
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .upload-page {
          max-width: 800px;
          margin: 0 auto;
        }
        
        .upload-section {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          margin-bottom: 2rem;
        }
        
        :global(body.dark) .upload-section {
          background: #1e293b;
        }
        
        .upload-section h2 {
          margin-bottom: 1.5rem;
        }
        
        .recent-uploads h3 {
          margin-bottom: 1rem;
        }
        
        .uploads-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1rem;
        }
        
        .upload-item {
          background: white;
          border-radius: 8px;
          overflow: hidden;
          padding: 0.5rem;
        }
        
        .upload-item img {
          width: 100%;
          height: 150px;
          object-fit: cover;
          border-radius: 4px;
        }
        
        .copy-url {
          width: 100%;
          margin-top: 0.5rem;
          padding: 0.25rem;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.75rem;
        }
      `}</style>
    </AdminLayout>
  )
}