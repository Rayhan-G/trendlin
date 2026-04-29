// src/pages/admin/live-posts.js
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import Head from 'next/head'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { 
  Plus, Edit, Trash2, Eye, Clock, Heart, MessageCircle, Share2, X,
  Image, Video, Music, File, Code, LayoutGrid, Upload, Loader2,
  Save, Send, RefreshCw, AlertCircle, CheckCircle
} from 'lucide-react'

// Dynamically import Media Modals
const ImageModal = dynamic(() => import('../../components/media/Modals/ImageModal'), { ssr: false })
const VideoModal = dynamic(() => import('../../components/media/Modals/VideoModal'), { ssr: false })
const AudioModal = dynamic(() => import('../../components/media/Modals/AudioModal'), { ssr: false })
const PDFModal = dynamic(() => import('../../components/media/Modals/PDFModal'), { ssr: false })
const EmbedModal = dynamic(() => import('../../components/media/Modals/EmbedModal'), { ssr: false })
const GalleryModal = dynamic(() => import('../../components/media/Modals/GalleryModal'), { ssr: false })

const categories = [
  { id: 'tech', name: 'Technology', icon: '⚡', color: '#3b82f6', bg: 'bg-blue-500/10' },
  { id: 'health', name: 'Wellness', icon: '🌿', color: '#10b981', bg: 'bg-emerald-500/10' },
  { id: 'entertainment', name: 'Culture', icon: '🎭', color: '#ec4899', bg: 'bg-pink-500/10' },
  { id: 'wealth', name: 'Capital', icon: '💰', color: '#f59e0b', bg: 'bg-amber-500/10' },
  { id: 'world', name: 'Horizons', icon: '🌍', color: '#06b6d4', bg: 'bg-cyan-500/10' },
  { id: 'lifestyle', name: 'Aesthetic', icon: '✨', color: '#f97316', bg: 'bg-orange-500/10' },
  { id: 'growth', name: 'Evolution', icon: '🌱', color: '#8b5cf6', bg: 'bg-purple-500/10' }
]

export default function AdminLivePosts() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingPost, setEditingPost] = useState(null)
  
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('tech')
  const [mediaItems, setMediaItems] = useState([])
  const [status, setStatus] = useState('draft')
  
  const [saving, setSaving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)
  const [showMediaModal, setShowMediaModal] = useState(null)
  const [activeTab, setActiveTab] = useState('media')
  const [publishSuccess, setPublishSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0)

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('live_posts')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error) setPosts(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchPosts() }, [fetchPosts])

  const isActive = (post) => {
    if (!post.expires_at) return false
    return post.status === 'published' && new Date(post.expires_at) > new Date()
  }

  const savePost = async () => {
    if (mediaItems.length === 0) {
      setErrorMessage('Please add at least one media item (image, video, etc.)')
      return
    }

    setSaving(true)
    setErrorMessage('')
    
    const now = new Date()
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000)

    const postData = {
      category: category,
      content: description || null,
      media_items: mediaItems,
      status: status,
      updated_at: now.toISOString()
    }

    // Only add publish fields if status is 'published'
    if (status === 'published') {
      postData.published_at = now.toISOString()
      postData.expires_at = expiresAt.toISOString()
    }

    console.log('Saving post:', postData)

    let result
    if (editingPost) {
      const { error } = await supabase
        .from('live_posts')
        .update(postData)
        .eq('id', editingPost.id)
      result = { error }
    } else {
      const { data, error } = await supabase
        .from('live_posts')
        .insert([postData])
        .select()
      result = { data, error }
    }

    if (!result.error) {
      setPublishSuccess(true)
      setTimeout(() => setPublishSuccess(false), 3000)
      setShowCreateModal(false)
      resetForm()
      fetchPosts()
    } else {
      setErrorMessage(result.error.message)
      console.error('Save error:', result.error)
    }
    setSaving(false)
  }

  const deletePost = async (id) => {
    const { error } = await supabase.from('live_posts').delete().eq('id', id)
    if (!error) fetchPosts()
    setShowDeleteConfirm(null)
  }

  const forceExpire = async (id) => {
    await supabase
      .from('live_posts')
      .update({ status: 'expired', expires_at: new Date().toISOString() })
      .eq('id', id)
    fetchPosts()
  }

  const resetForm = () => {
    setEditingPost(null)
    setDescription('')
    setCategory('tech')
    setMediaItems([])
    setStatus('draft')
    setActiveTab('media')
    setErrorMessage('')
    setCurrentMediaIndex(0)
  }

  const editPost = (post) => {
    setEditingPost(post)
    setDescription(post.content || '')
    setCategory(post.category)
    setMediaItems(post.media_items || [])
    setStatus(post.status || 'draft')
    setShowCreateModal(true)
  }

  const handleMediaInsert = (mediaData) => {
    const newMediaItem = {
      id: Date.now() + Math.random(),
      type: mediaData.type || 'image',
      url: mediaData.src || mediaData.url,
      ...mediaData
    }
    setMediaItems(prev => [...prev, newMediaItem])
    setShowMediaModal(null)
    setCurrentMediaIndex(mediaItems.length)
  }

  const removeMedia = (mediaId) => {
    setMediaItems(prev => prev.filter(m => m.id !== mediaId))
    if (currentMediaIndex >= mediaItems.length - 1) {
      setCurrentMediaIndex(Math.max(0, mediaItems.length - 2))
    }
  }

  const getTimeRemaining = (expiresAt) => {
    if (!expiresAt) return '—'
    const diff = new Date(expiresAt) - new Date()
    if (diff <= 0) return 'Expired'
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % 3600000) / 60000)
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
  }

  const nextMedia = () => {
    if (currentMediaIndex < mediaItems.length - 1) {
      setCurrentMediaIndex(currentMediaIndex + 1)
    }
  }

  const prevMedia = () => {
    if (currentMediaIndex > 0) {
      setCurrentMediaIndex(currentMediaIndex - 1)
    }
  }

  return (
    <>
      <Head><title>Admin | Live Posts Manager</title></Head>
      <div className="min-h-screen bg-[#050505] p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Live Posts Manager</h1>
              <p className="text-gray-500">Create 24-hour posts with unlimited media</p>
            </div>
            <button 
              onClick={() => { resetForm(); setShowCreateModal(true); }} 
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:opacity-90 transition"
            >
              <Plus size={18} /> New Live Post
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-[#0f0f0f] border border-gray-800 rounded-xl p-4">
              <div className="text-2xl mb-2">⚡</div>
              <div className="text-2xl font-bold text-white">{posts.filter(p => isActive(p)).length}</div>
              <div className="text-xs text-gray-500">Active Posts</div>
            </div>
            <div className="bg-[#0f0f0f] border border-gray-800 rounded-xl p-4">
              <div className="text-2xl mb-2">📝</div>
              <div className="text-2xl font-bold text-white">{posts.length}</div>
              <div className="text-xs text-gray-500">Total Posts</div>
            </div>
            <div className="bg-[#0f0f0f] border border-gray-800 rounded-xl p-4">
              <div className="text-2xl mb-2">❤️</div>
              <div className="text-2xl font-bold text-white">{posts.reduce((sum, p) => sum + (p.likes || 0), 0)}</div>
              <div className="text-xs text-gray-500">Total Likes</div>
            </div>
            <div className="bg-[#0f0f0f] border border-gray-800 rounded-xl p-4">
              <div className="text-2xl mb-2">🖼️</div>
              <div className="text-2xl font-bold text-white">{posts.reduce((sum, p) => sum + (p.media_items?.length || 0), 0)}</div>
              <div className="text-xs text-gray-500">Media Items</div>
            </div>
          </div>

          {/* Posts Table */}
          <div className="bg-[#0f0f0f] border border-gray-800 rounded-xl overflow-x-auto">
            {loading ? (
              <div className="text-center py-20 text-gray-500">Loading...</div>
            ) : posts.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-white text-lg mb-2">No live posts yet</h3>
                <button onClick={() => { resetForm(); setShowCreateModal(true); }} className="px-4 py-2 bg-purple-600 text-white rounded-xl">
                  Create First Post
                </button>
              </div>
            ) : (
              <table className="w-full">
                <thead className="border-b border-gray-800">
                  <tr className="text-left text-gray-500 text-sm">
                    <th className="p-4">Content</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Media</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Likes</th>
                    <th className="p-4">Time Left</th>
                    <th className="p-4">Actions</th>
                   </tr>
                </thead>
                <tbody>
                  {posts.map((post) => {
                    const active = isActive(post)
                    const timeLeft = getTimeRemaining(post.expires_at)
                    const cat = categories.find(c => c.id === post.category)
                    return (
                      <tr key={post.id} className="border-b border-gray-800 hover:bg-gray-900/50 transition">
                        <td className="p-4">
                          <div className="max-w-xs">
                            <p className="text-white text-sm line-clamp-2">
                              {post.content || 'No description'}
                            </p>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`text-sm px-2 py-1 rounded-full ${cat?.bg}`} style={{ color: cat?.color }}>
                            {cat?.icon} {cat?.name}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="text-xs text-gray-500">{post.media_items?.length || 0} items</span>
                        </td>
                        <td className="p-4">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            active ? 'bg-green-500/20 text-green-500' : 
                            post.status === 'draft' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-gray-500/20 text-gray-500'
                          }`}>
                            {active ? '● Published' : post.status === 'draft' ? '📝 Draft' : '○ Expired'}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="text-sm">❤️ {post.likes || 0}</span>
                        </td>
                        <td className="p-4">
                          <span className={`text-sm font-mono ${active ? 'text-yellow-500' : 'text-gray-500'}`}>
                            {active ? timeLeft : '—'}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <Link href={`/live-posts/${post.category}`} target="_blank" className="p-1.5 rounded hover:bg-gray-800">
                              <Eye size={16} className="text-gray-500" />
                            </Link>
                            <button onClick={() => editPost(post)} className="p-1.5 rounded hover:bg-gray-800">
                              <Edit size={16} className="text-gray-500" />
                            </button>
                            {active && (
                              <button onClick={() => forceExpire(post.id)} className="p-1.5 rounded hover:bg-gray-800">
                                <Clock size={16} className="text-gray-500" />
                              </button>
                            )}
                            <button onClick={() => setShowDeleteConfirm(post.id)} className="p-1.5 rounded hover:bg-gray-800">
                              <Trash2 size={16} className="text-gray-500" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4" onClick={() => setShowCreateModal(false)}>
          <div className="bg-[#0f0f0f] border border-gray-800 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-800">
              <div>
                <h2 className="text-xl font-bold text-white">{editingPost ? 'Edit Post' : 'Create New Post'}</h2>
                <p className="text-sm text-gray-500">Add media + description. Publish = 24 hours live</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-500 hover:text-white">
                <X size={24} />
              </button>
            </div>

            {/* Messages */}
            {publishSuccess && (
              <div className="mx-6 mt-4 p-3 bg-green-500/20 border border-green-500 rounded-lg text-green-500 text-sm">
                ✅ Post {editingPost ? 'updated' : 'created'} successfully!
              </div>
            )}
            {errorMessage && (
              <div className="mx-6 mt-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-500 text-sm">
                ❌ {errorMessage}
              </div>
            )}

            {/* Tabs */}
            <div className="flex border-b border-gray-800 px-6">
              <button
                onClick={() => setActiveTab('media')}
                className={`px-4 py-3 text-sm font-medium ${activeTab === 'media' ? 'text-purple-500 border-b-2 border-purple-500' : 'text-gray-500'}`}
              >
                🖼️ Media ({mediaItems.length})
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-4 py-3 text-sm font-medium ${activeTab === 'settings' ? 'text-purple-500 border-b-2 border-purple-500' : 'text-gray-500'}`}
              >
                ⚙️ Settings
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'media' && (
                <div className="space-y-6">
                  {/* Media Preview */}
                  {mediaItems.length > 0 && (
                    <div className="relative bg-black rounded-2xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
                      {mediaItems[currentMediaIndex]?.type === 'image' && (
                        <img src={mediaItems[currentMediaIndex].url} alt="" className="w-full h-full object-cover" />
                      )}
                      {mediaItems[currentMediaIndex]?.type === 'video' && (
                        <video src={mediaItems[currentMediaIndex].url} className="w-full h-full object-cover" controls />
                      )}
                      {mediaItems[currentMediaIndex]?.type === 'audio' && (
                        <div className="w-full h-full flex items-center justify-center bg-purple-900/50">
                          <audio src={mediaItems[currentMediaIndex].url} controls />
                        </div>
                      )}
                      
                      {mediaItems.length > 1 && (
                        <>
                          <button onClick={prevMedia} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full">◀</button>
                          <button onClick={nextMedia} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full">▶</button>
                        </>
                      )}
                      
                      {/* Description Overlay */}
                      {description && (
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-8">
                          <p className="text-white text-xl font-medium">{description}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Description Input */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">📝 Description (appears on media)</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Write your story here..."
                      rows={3}
                      className="w-full p-4 bg-gray-900 border border-gray-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  {/* Add Media */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Add Media</label>
                    <div className="flex gap-3 flex-wrap">
                      <button onClick={() => setShowMediaModal('image')} className="px-4 py-2 bg-blue-600/20 text-blue-400 rounded-lg">📷 Image</button>
                      <button onClick={() => setShowMediaModal('video')} className="px-4 py-2 bg-green-600/20 text-green-400 rounded-lg">🎥 Video</button>
                      <button onClick={() => setShowMediaModal('audio')} className="px-4 py-2 bg-purple-600/20 text-purple-400 rounded-lg">🎵 Audio</button>
                      <button onClick={() => setShowMediaModal('pdf')} className="px-4 py-2 bg-red-600/20 text-red-400 rounded-lg">📄 PDF</button>
                      <button onClick={() => setShowMediaModal('embed')} className="px-4 py-2 bg-yellow-600/20 text-yellow-400 rounded-lg">🔗 Embed</button>
                      <button onClick={() => setShowMediaModal('gallery')} className="px-4 py-2 bg-pink-600/20 text-pink-400 rounded-lg">🖼️ Gallery</button>
                    </div>
                  </div>

                  {/* Media Thumbnails */}
                  {mediaItems.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {mediaItems.map((item, idx) => (
                        <div 
                          key={item.id} 
                          className={`relative w-16 h-16 rounded-lg overflow-hidden cursor-pointer border-2 ${idx === currentMediaIndex ? 'border-purple-500' : 'border-gray-700'}`}
                          onClick={() => setCurrentMediaIndex(idx)}
                        >
                          {item.type === 'image' && <img src={item.url} alt="" className="w-full h-full object-cover" />}
                          {item.type === 'video' && <Video size={24} className="w-full h-full p-4 text-gray-500" />}
                          {item.type === 'audio' && <Music size={24} className="w-full h-full p-4 text-gray-500" />}
                          <button onClick={(e) => { e.stopPropagation(); removeMedia(item.id); }} className="absolute -top-1 -right-1 p-1 bg-red-500 rounded-full">
                            <Trash2 size={10} className="text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="space-y-6 max-w-md">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Category</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-3 bg-gray-900 border border-gray-800 rounded-xl text-white">
                      {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Status</label>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setStatus('draft')}
                        className={`flex-1 py-3 rounded-xl font-medium ${status === 'draft' ? 'bg-yellow-600 text-white' : 'bg-gray-800 text-gray-400'}`}
                      >
                        💾 Save Draft
                      </button>
                      <button
                        onClick={() => setStatus('published')}
                        className={`flex-1 py-3 rounded-xl font-medium ${status === 'published' ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400'}`}
                      >
                        🚀 Publish (24h)
                      </button>
                    </div>
                    {status === 'published' && (
                      <p className="text-xs text-green-500 mt-2">⚠️ Will expire 24 hours after publishing</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-6 border-t border-gray-800">
              <button onClick={() => setShowCreateModal(false)} className="flex-1 py-3 border border-gray-700 rounded-xl text-gray-400">
                Cancel
              </button>
              <button 
                onClick={savePost} 
                disabled={saving || mediaItems.length === 0} 
                className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium disabled:opacity-50"
              >
                {saving ? 'Saving...' : (status === 'published' ? '📢 Publish Now' : '💾 Save Draft')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Media Modals */}
      <ImageModal isOpen={showMediaModal === 'image'} onClose={() => setShowMediaModal(null)} onUpload={handleMediaInsert} />
      <VideoModal isOpen={showMediaModal === 'video'} onClose={() => setShowMediaModal(null)} onUpload={handleMediaInsert} />
      <AudioModal isOpen={showMediaModal === 'audio'} onClose={() => setShowMediaModal(null)} onUpload={handleMediaInsert} />
      <PDFModal isOpen={showMediaModal === 'pdf'} onClose={() => setShowMediaModal(null)} onUpload={handleMediaInsert} />
      <EmbedModal isOpen={showMediaModal === 'embed'} onClose={() => setShowMediaModal(null)} onUpload={handleMediaInsert} />
      <GalleryModal isOpen={showMediaModal === 'gallery'} onClose={() => setShowMediaModal(null)} onInsert={(data) => handleMediaInsert({ ...data, type: 'gallery' })} />

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50" onClick={() => setShowDeleteConfirm(null)}>
          <div className="bg-[#0f0f0f] border border-gray-800 rounded-2xl p-6 max-w-md text-center">
            <div className="text-5xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold text-white mb-2">Delete Post?</h3>
            <p className="text-gray-500 mb-6">This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 py-2 border border-gray-700 rounded-xl">Cancel</button>
              <button onClick={() => deletePost(showDeleteConfirm)} className="flex-1 py-2 bg-red-600 text-white rounded-xl">Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}