// src/pages/admin/live-posts.js (COMPLETE WITH EDITOR)
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

// Dynamically import Editor with no SSR
const Editor = dynamic(() => import('../../components/editor'), {
  ssr: false,
  loading: () => (
    <div className="editor-loading">
      <Loader2 className="animate-spin" size={32} />
      <p>Loading editor...</p>
    </div>
  )
})

// Dynamically import Media Modals
const ImageModal = dynamic(() => import('../../components/MediaModals/ImageModal'), { ssr: false })
const VideoModal = dynamic(() => import('../../components/MediaModals/VideoModal'), { ssr: false })
const AudioModal = dynamic(() => import('../../components/MediaModals/AudioModal'), { ssr: false })
const PDFModal = dynamic(() => import('../../components/MediaModals/PDFModal'), { ssr: false })
const EmbedModal = dynamic(() => import('../../components/MediaModals/EmbedModal'), { ssr: false })
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
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('tech')
  const [mediaItems, setMediaItems] = useState([])
  const [status, setStatus] = useState('draft')
  const [saving, setSaving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)
  const [showMediaModal, setShowMediaModal] = useState(null)
  const [activeTab, setActiveTab] = useState('content')
  const [publishSuccess, setPublishSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

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
      title: title || null,
      content: content || null,
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
    setTitle('')
    setContent('')
    setCategory('tech')
    setMediaItems([])
    setStatus('draft')
    setActiveTab('content')
    setErrorMessage('')
  }

  const editPost = (post) => {
    setEditingPost(post)
    setTitle(post.title || '')
    setContent(post.content || '')
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
  }

  const removeMedia = (mediaId) => {
    setMediaItems(prev => prev.filter(m => m.id !== mediaId))
  }

  const getTimeRemaining = (expiresAt) => {
    if (!expiresAt) return 'No expiry'
    const diff = new Date(expiresAt) - new Date()
    if (diff <= 0) return 'Expired'
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % 3600000) / 60000)
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
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
              <p className="text-gray-500">Create 24-hour posts with rich text editor and unlimited media</p>
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
                    <th className="p-4">Post</th>
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
                            <div className="text-white font-medium truncate">{post.title || 'Untitled'}</div>
                            <div className="text-xs text-gray-500 truncate">
                              {post.content?.substring(0, 60)?.replace(/<[^>]*>/g, '') || 'No content'}
                            </div>
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
                                {post.media_items.filter(m => m.type === 'image').length > 0 && <Image size={14} className="text-blue-500" />}
                                {post.media_items.filter(m => m.type === 'video').length > 0 && <Video size={14} className="text-green-500" />}
                                {post.media_items.filter(m => m.type === 'audio').length > 0 && <Music size={14} className="text-purple-500" />}
                                <span className="text-xs text-gray-500 ml-1">{post.media_items.length}</span>
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

      {/* Create/Edit Modal with FULL Editor */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4" onClick={() => setShowCreateModal(false)}>
          <div className="bg-[#0f0f0f] border border-gray-800 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-800">
              <div>
                <h2 className="text-xl font-bold text-white">{editingPost ? 'Edit Post' : 'Create New Post'}</h2>
                <p className="text-sm text-gray-500">Rich text editor • Unlimited media • 24-hour lifespan</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-500 hover:text-white transition">
                <X size={24} />
              </button>
            </div>

            {/* Success Message */}
            {publishSuccess && (
              <div className="mx-6 mt-4 p-3 bg-green-500/20 border border-green-500 rounded-lg flex items-center gap-2 text-green-500">
                <CheckCircle size={18} />
                <span className="text-sm">Post {editingPost ? 'updated' : 'created'} successfully!</span>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="mx-6 mt-4 p-3 bg-red-500/20 border border-red-500 rounded-lg flex items-center gap-2 text-red-500">
                <AlertCircle size={18} />
                <span className="text-sm">{errorMessage}</span>
              </div>
            )}

            {/* Tabs */}
            <div className="flex border-b border-gray-800 px-6">
              {[
                { id: 'content', label: '📝 Content', icon: null },
                { id: 'media', label: `🖼️ Media (${mediaItems.length})`, icon: null },
                { id: 'settings', label: '⚙️ Settings', icon: null }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 text-sm font-medium transition-all ${
                    activeTab === tab.id 
                      ? 'text-purple-500 border-b-2 border-purple-500' 
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'content' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Title (Optional)</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Catchy title for your post..."
                      className="w-full p-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Content</label>
                    <Editor
                      content={content}
                      onChange={setContent}
                      onSave={() => {}}
                      onSchedule={() => {}}
                      onPublish={() => {}}
                      onPreview={() => {}}
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      ✨ Use the toolbar above to add formatting, images, videos, audio, embeds, tables, and more!
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'media' && (
                <div>
                  <div className="flex gap-3 mb-6 flex-wrap">
                    <button onClick={() => setShowMediaModal('image')} className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 text-blue-400 rounded-xl hover:bg-blue-600/30 transition">
                      <Image size={16} /> Add Image
                    </button>
                    <button onClick={() => setShowMediaModal('video')} className="flex items-center gap-2 px-4 py-2 bg-green-600/20 text-green-400 rounded-xl hover:bg-green-600/30 transition">
                      <Video size={16} /> Add Video
                    </button>
                    <button onClick={() => setShowMediaModal('audio')} className="flex items-center gap-2 px-4 py-2 bg-purple-600/20 text-purple-400 rounded-xl hover:bg-purple-600/30 transition">
                      <Music size={16} /> Add Audio
                    </button>
                    <button onClick={() => setShowMediaModal('pdf')} className="flex items-center gap-2 px-4 py-2 bg-red-600/20 text-red-400 rounded-xl hover:bg-red-600/30 transition">
                      <File size={16} /> Add PDF
                    </button>
                    <button onClick={() => setShowMediaModal('embed')} className="flex items-center gap-2 px-4 py-2 bg-yellow-600/20 text-yellow-400 rounded-xl hover:bg-yellow-600/30 transition">
                      <Code size={16} /> Embed
                    </button>
                    <button onClick={() => setShowMediaModal('gallery')} className="flex items-center gap-2 px-4 py-2 bg-pink-600/20 text-pink-400 rounded-xl hover:bg-pink-600/30 transition">
                      <LayoutGrid size={16} /> Gallery
                    </button>
                  </div>

                  {mediaItems.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-gray-800 rounded-xl">
                      <Upload size={48} className="text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-500">No media added yet</p>
                      <p className="text-sm text-gray-600">Click any button above to add images, videos, audio, PDFs, embeds, or galleries</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {mediaItems.map(item => (
                        <div key={item.id} className="group relative bg-gray-900 rounded-xl overflow-hidden">
                          {item.type === 'image' && (
                            <img src={item.url} alt={item.alt || ''} className="w-full h-32 object-cover" />
                          )}
                          {item.type === 'video' && (
                            <div className="relative w-full h-32 bg-black flex items-center justify-center">
                              <video src={item.url} className="w-full h-full object-cover" />
                              <Video size={32} className="absolute text-white/50" />
                            </div>
                          )}
                          {item.type === 'audio' && (
                            <div className="w-full h-32 bg-purple-900/20 flex flex-col items-center justify-center">
                              <Music size={32} className="text-purple-400 mb-2" />
                              <span className="text-xs text-gray-400">{item.title || 'Audio'}</span>
                            </div>
                          )}
                          {item.type === 'pdf' && (
                            <div className="w-full h-32 bg-red-900/20 flex flex-col items-center justify-center">
                              <File size={32} className="text-red-400 mb-2" />
                              <span className="text-xs text-gray-400">{item.title || 'PDF'}</span>
                            </div>
                          )}
                          {item.type === 'embed' && (
                            <div className="w-full h-32 bg-cyan-900/20 flex flex-col items-center justify-center">
                              <Code size={32} className="text-cyan-400 mb-2" />
                              <span className="text-xs text-gray-400">Embed</span>
                            </div>
                          )}
                          {item.type === 'gallery' && (
                            <div className="w-full h-32 bg-pink-900/20 flex flex-col items-center justify-center">
                              <LayoutGrid size={32} className="text-pink-400 mb-2" />
                              <span className="text-xs text-gray-400">Gallery ({item.media?.length || 0} items)</span>
                            </div>
                          )}
                          <button
                            onClick={() => removeMedia(item.id)}
                            className="absolute top-2 right-2 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition"
                          >
                            <Trash2 size={12} className="text-white" />
                          </button>
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                            <span className="text-xs text-white/80 uppercase">{item.type}</span>
                          </div>
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
                    <select 
                      value={category} 
                      onChange={(e) => setCategory(e.target.value)} 
                      className="w-full p-3 bg-gray-900 border border-gray-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                    >
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Posts are displayed per category. Only one active post per category.</p>
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
                        Expired posts are hidden from the public but remain in your dashboard.
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
                disabled={saving} 
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
            <p className="text-gray-500 mb-6">This cannot be undone. The post will be permanently removed.</p>
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