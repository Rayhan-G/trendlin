// src/pages/admin/live-posts.js - SIMPLIFIED VERSION (Media + Description only)
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import Head from 'next/head'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { 
  Plus, Edit, Trash2, Eye, Clock, Heart, MessageCircle, Share2, X,
  Image, Video, Music, File, Code, LayoutGrid, Upload, Loader2,
  Save, Send, RefreshCw, AlertCircle, CheckCircle, Type, Move
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
  
  // SIMPLIFIED: Only two fields
  const [description, setDescription] = useState('')  // Text on top of media
  const [category, setCategory] = useState('tech')
  const [mediaItems, setMediaItems] = useState([])    // Unlimited media items
  const [status, setStatus] = useState('draft')
  
  const [saving, setSaving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)
  const [showMediaModal, setShowMediaModal] = useState(null)
  const [activeTab, setActiveTab] = useState('media')  // Start with media tab
  const [publishSuccess, setPublishSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0)  // For carousel preview

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
    return (post.status === 'published' || post.status === 'active') && new Date(post.expires_at) > new Date()
  }

  const savePost = async () => {
    setSaving(true)
    setErrorMessage('')
    
    const now = new Date()
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000)

    const postData = {
      category,
      content: description,  // Store description as content
      media_items: mediaItems,
      status: status === 'published' ? 'published' : 'draft',
      updated_at: now.toISOString()
    }

    if (status === 'published') {
      postData.published_at = now.toISOString()
      postData.expires_at = expiresAt.toISOString()
    }

    let result
    if (editingPost) {
      result = await supabase
        .from('live_posts')
        .update(postData)
        .eq('id', editingPost.id)
    } else {
      result = await supabase.from('live_posts').insert([postData])
    }

    if (!result.error) {
      setPublishSuccess(true)
      setTimeout(() => setPublishSuccess(false), 3000)
      setShowCreateModal(false)
      resetForm()
      fetchPosts()
    } else {
      setErrorMessage(result.error.message)
    }
    setSaving(false)
  }

  const deletePost = async (id) => {
    await supabase.from('live_posts').delete().eq('id', id)
    fetchPosts()
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
    // Reset to first media item when adding new
    setCurrentMediaIndex(0)
  }

  const removeMedia = (mediaId) => {
    setMediaItems(prev => prev.filter(m => m.id !== mediaId))
    if (currentMediaIndex >= mediaItems.length - 1) {
      setCurrentMediaIndex(Math.max(0, mediaItems.length - 2))
    }
  }

  const getTimeRemaining = (expiresAt) => {
    if (!expiresAt) return 'No expiry'
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
              <p className="text-gray-500">Create 24-hour posts with unlimited media • Text appears on top of media</p>
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
                    <th className="p-4">Preview</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Media</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Engagement</th>
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
                            <div className="text-white text-sm line-clamp-2">
                              {post.content || 'No description'}
                            </div>
                            {post.media_items?.[0] && (
                              <div className="mt-2 w-16 h-16 rounded-lg overflow-hidden bg-gray-800">
                                {post.media_items[0].type === 'image' ? (
                                  <img src={post.media_items[0].url} alt="" className="w-full h-full object-cover" />
                                ) : post.media_items[0].type === 'video' ? (
                                  <Video size={24} className="w-full h-full p-4 text-gray-500" />
                                ) : (
                                  <Music size={24} className="w-full h-full p-4 text-gray-500" />
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`text-sm px-2 py-1 rounded-full ${cat?.bg}`} style={{ color: cat?.color }}>
                            {cat?.icon} {cat?.name}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1">
                            {post.media_items?.length > 0 && (
                              <>
                                <span className="text-xs text-gray-500">{post.media_items.length} items</span>
                              </>
                            )}
                          </div>
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
                          <div className="flex gap-3 text-xs text-gray-500">
                            <span>❤️ {post.likes || 0}</span>
                            <span>💬 {post.comments?.length || 0}</span>
                            <span>🔄 {post.shares || 0}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`text-sm font-mono ${active && new Date(post.expires_at) - new Date() < 3600000 ? 'text-red-500' : 'text-yellow-500'}`}>
                            {active ? timeLeft : '—'}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <Link href={`/live-posts/${post.category}`} target="_blank" className="p-1.5 rounded hover:bg-gray-800 transition">
                              <Eye size={16} className="text-gray-500" />
                            </Link>
                            <button onClick={() => editPost(post)} className="p-1.5 rounded hover:bg-gray-800 transition">
                              <Edit size={16} className="text-gray-500" />
                            </button>
                            {active && (
                              <button onClick={() => forceExpire(post.id)} className="p-1.5 rounded hover:bg-gray-800 transition">
                                <Clock size={16} className="text-gray-500" />
                              </button>
                            )}
                            <button onClick={() => setShowDeleteConfirm(post.id)} className="p-1.5 rounded hover:bg-gray-800 transition">
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

      {/* Create/Edit Modal - SIMPLIFIED: Media + Description only */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4" onClick={() => setShowCreateModal(false)}>
          <div className="bg-[#0f0f0f] border border-gray-800 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-800">
              <div>
                <h2 className="text-xl font-bold text-white">{editingPost ? 'Edit Post' : 'Create New Post'}</h2>
                <p className="text-sm text-gray-500">Unlimited media • Text appears on top of media</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-500 hover:text-white transition">
                <X size={24} />
              </button>
            </div>

            {/* Success/Error Messages */}
            {publishSuccess && (
              <div className="mx-6 mt-4 p-3 bg-green-500/20 border border-green-500 rounded-lg flex items-center gap-2 text-green-500">
                <CheckCircle size={18} />
                <span className="text-sm">Post {editingPost ? 'updated' : 'created'} successfully!</span>
              </div>
            )}
            {errorMessage && (
              <div className="mx-6 mt-4 p-3 bg-red-500/20 border border-red-500 rounded-lg flex items-center gap-2 text-red-500">
                <AlertCircle size={18} />
                <span className="text-sm">{errorMessage}</span>
              </div>
            )}

            {/* Simple Tabs - Media & Settings */}
            <div className="flex border-b border-gray-800 px-6">
              <button
                onClick={() => setActiveTab('media')}
                className={`px-4 py-3 text-sm font-medium transition-all ${
                  activeTab === 'media' 
                    ? 'text-purple-500 border-b-2 border-purple-500' 
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                🖼️ Media ({mediaItems.length})
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-4 py-3 text-sm font-medium transition-all ${
                  activeTab === 'settings' 
                    ? 'text-purple-500 border-b-2 border-purple-500' 
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                ⚙️ Settings
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'media' && (
                <div className="space-y-6">
                  {/* Media Preview Carousel */}
                  {mediaItems.length > 0 && (
                    <div className="relative bg-black rounded-2xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
                      {mediaItems[currentMediaIndex]?.type === 'image' && (
                        <img 
                          src={mediaItems[currentMediaIndex].url} 
                          alt="" 
                          className="w-full h-full object-cover"
                        />
                      )}
                      {mediaItems[currentMediaIndex]?.type === 'video' && (
                        <video 
                          src={mediaItems[currentMediaIndex].url} 
                          className="w-full h-full object-cover"
                          controls
                        />
                      )}
                      {mediaItems[currentMediaIndex]?.type === 'audio' && (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-900/50 to-pink-900/50">
                          <Music size={64} className="text-purple-400 mb-4" />
                          <audio src={mediaItems[currentMediaIndex].url} controls className="w-11/12 max-w-md" />
                          <p className="text-white mt-4">{mediaItems[currentMediaIndex].title || 'Audio'}</p>
                        </div>
                      )}
                      {mediaItems[currentMediaIndex]?.type === 'pdf' && (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-red-900/50 to-orange-900/50">
                          <File size={64} className="text-red-400 mb-4" />
                          <p className="text-white">{mediaItems[currentMediaIndex].title || 'PDF Document'}</p>
                          <button className="mt-4 px-4 py-2 bg-white/20 rounded-lg text-white">View PDF</button>
                        </div>
                      )}
                      {mediaItems[currentMediaIndex]?.type === 'embed' && (
                        <div className="w-full h-full">
                          <div dangerouslySetInnerHTML={{ __html: mediaItems[currentMediaIndex].html || '<iframe class="w-full h-full"></iframe>' }} />
                        </div>
                      )}
                      {mediaItems[currentMediaIndex]?.type === 'gallery' && (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-pink-900/50 to-purple-900/50">
                          <LayoutGrid size={64} className="text-pink-400 mb-4" />
                          <p className="text-white">Gallery ({mediaItems[currentMediaIndex].media?.length || 0} items)</p>
                        </div>
                      )}
                      
                      {/* Navigation arrows for multiple media */}
                      {mediaItems.length > 1 && (
                        <>
                          <button 
                            onClick={prevMedia}
                            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full hover:bg-black/70 transition"
                          >
                            ◀
                          </button>
                          <button 
                            onClick={nextMedia}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full hover:bg-black/70 transition"
                          >
                            ▶
                          </button>
                          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                            {mediaItems.map((_, idx) => (
                              <button
                                key={idx}
                                onClick={() => setCurrentMediaIndex(idx)}
                                className={`w-2 h-2 rounded-full transition ${
                                  idx === currentMediaIndex ? 'bg-white w-4' : 'bg-white/50'
                                }`}
                              />
                            ))}
                          </div>
                        </>
                      )}
                      
                      {/* Text overlay - Description ON TOP of media */}
                      {description && (
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-8">
                          <p className="text-white text-xl md:text-2xl font-medium leading-relaxed max-w-3xl">
                            {description}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Description Input - Text that appears ON TOP of media */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      📝 Description <span className="text-gray-500">(Appears on top of media)</span>
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Write your story, caption, or message here... This text will appear on top of your media."
                      rows={4}
                      className="w-full p-4 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 resize-none"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      ✨ This text will be displayed as an overlay on your media. Perfect for storytelling!
                    </p>
                  </div>

                  {/* Add Media Buttons */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">🖼️ Add Media (Unlimited)</label>
                    <div className="flex gap-3 flex-wrap">
                      <button onClick={() => setShowMediaModal('image')} className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 text-blue-400 rounded-xl hover:bg-blue-600/30 transition">
                        <Image size={16} /> Image
                      </button>
                      <button onClick={() => setShowMediaModal('video')} className="flex items-center gap-2 px-4 py-2 bg-green-600/20 text-green-400 rounded-xl hover:bg-green-600/30 transition">
                        <Video size={16} /> Video
                      </button>
                      <button onClick={() => setShowMediaModal('audio')} className="flex items-center gap-2 px-4 py-2 bg-purple-600/20 text-purple-400 rounded-xl hover:bg-purple-600/30 transition">
                        <Music size={16} /> Audio
                      </button>
                      <button onClick={() => setShowMediaModal('pdf')} className="flex items-center gap-2 px-4 py-2 bg-red-600/20 text-red-400 rounded-xl hover:bg-red-600/30 transition">
                        <File size={16} /> PDF
                      </button>
                      <button onClick={() => setShowMediaModal('embed')} className="flex items-center gap-2 px-4 py-2 bg-yellow-600/20 text-yellow-400 rounded-xl hover:bg-yellow-600/30 transition">
                        <Code size={16} /> Embed
                      </button>
                      <button onClick={() => setShowMediaModal('gallery')} className="flex items-center gap-2 px-4 py-2 bg-pink-600/20 text-pink-400 rounded-xl hover:bg-pink-600/30 transition">
                        <LayoutGrid size={16} /> Gallery
                      </button>
                    </div>
                  </div>

                  {/* Media List */}
                  {mediaItems.length > 0 && (
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Media Items ({mediaItems.length})</label>
                      <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                        {mediaItems.map((item, idx) => (
                          <div 
                            key={item.id} 
                            className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition ${
                              idx === currentMediaIndex ? 'border-purple-500' : 'border-gray-700'
                            }`}
                            onClick={() => setCurrentMediaIndex(idx)}
                          >
                            {item.type === 'image' && (
                              <img src={item.url} alt="" className="w-full aspect-square object-cover" />
                            )}
                            {item.type === 'video' && (
                              <div className="w-full aspect-square bg-black flex items-center justify-center">
                                <Video size={24} className="text-gray-500" />
                              </div>
                            )}
                            {item.type === 'audio' && (
                              <div className="w-full aspect-square bg-purple-900/20 flex items-center justify-center">
                                <Music size={24} className="text-purple-400" />
                              </div>
                            )}
                            {item.type === 'pdf' && (
                              <div className="w-full aspect-square bg-red-900/20 flex items-center justify-center">
                                <File size={24} className="text-red-400" />
                              </div>
                            )}
                            {item.type === 'embed' && (
                              <div className="w-full aspect-square bg-cyan-900/20 flex items-center justify-center">
                                <Code size={24} className="text-cyan-400" />
                              </div>
                            )}
                            {item.type === 'gallery' && (
                              <div className="w-full aspect-square bg-pink-900/20 flex items-center justify-center">
                                <LayoutGrid size={24} className="text-pink-400" />
                              </div>
                            )}
                            <button
                              onClick={(e) => { e.stopPropagation(); removeMedia(item.id); }}
                              className="absolute top-1 right-1 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition"
                            >
                              <Trash2 size={10} className="text-white" />
                            </button>
                            {idx === currentMediaIndex && (
                              <div className="absolute bottom-1 left-1 right-1 bg-purple-500 text-white text-[10px] text-center py-0.5 rounded">
                                Active
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="space-y-6 max-w-md">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Category</label>
                    <select 
                      value={category} 
                      onChange={(e) => setCategory(e.target.value)} 
                      className="w-full p-3 bg-gray-900 border border-gray-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                    >
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Only one active post allowed per category</p>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Status</label>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setStatus('draft')}
                        className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 transition ${
                          status === 'draft' 
                            ? 'bg-yellow-600 text-white' 
                            : 'bg-gray-900 text-gray-400 hover:bg-gray-800'
                        }`}
                      >
                        <Save size={16} /> Draft
                      </button>
                      <button
                        onClick={() => setStatus('published')}
                        className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 transition ${
                          status === 'published' 
                            ? 'bg-green-600 text-white' 
                            : 'bg-gray-900 text-gray-400 hover:bg-gray-800'
                        }`}
                      >
                        <Send size={16} /> Publish (24h)
                      </button>
                    </div>
                  </div>

                  {status === 'published' && (
                    <div className="p-4 bg-purple-600/10 rounded-xl border border-purple-600/20">
                      <div className="flex items-center gap-2 text-purple-400 mb-2">
                        <Clock size={16} />
                        <span className="text-sm font-medium">24-Hour Lifespan</span>
                      </div>
                      <p className="text-xs text-gray-400">
                        This post will automatically expire 24 hours after publishing.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 p-6 border-t border-gray-800">
              <button onClick={() => setShowCreateModal(false)} className="flex-1 px-6 py-2 border border-gray-700 rounded-xl text-gray-400 hover:bg-gray-800 transition">
                Cancel
              </button>
              <button 
                onClick={savePost} 
                disabled={saving || mediaItems.length === 0} 
                className="flex-1 px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    {editingPost ? 'Update Post' : status === 'published' ? 'Publish Post' : 'Save Draft'}
                  </>
                )}
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
          <div className="bg-[#0f0f0f] border border-gray-800 rounded-2xl p-6 max-w-md text-center" onClick={e => e.stopPropagation()}>
            <div className="text-5xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold text-white mb-2">Delete Post?</h3>
            <p className="text-gray-500 mb-6">This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 px-6 py-2 border border-gray-700 rounded-xl text-gray-400 hover:bg-gray-800 transition">
                Cancel
              </button>
              <button onClick={() => deletePost(showDeleteConfirm)} className="flex-1 px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition">
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}