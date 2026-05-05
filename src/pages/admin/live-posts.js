// src/pages/admin/live-posts.js
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../../lib/supabase'
import Head from 'next/head'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { 
  Plus, Edit, Trash2, Eye, Clock, X, Video, Music, 
  Image as ImageIcon, CheckCircle, AlertCircle, 
  Upload, Link as LinkIcon, Grid, List, Search,
  ChevronLeft, ChevronRight, MoreVertical, Copy, Heart, MessageCircle, Share2
} from 'lucide-react'

// Professional Media Modals
const ImageModal = dynamic(() => import('../../components/media/Modals/ImageModal'), { ssr: false })
const VideoModal = dynamic(() => import('../../components/media/Modals/VideoModal'), { ssr: false })
const AudioModal = dynamic(() => import('../../components/media/Modals/AudioModal'), { ssr: false })
const PDFModal = dynamic(() => import('../../components/media/Modals/PDFModal'), { ssr: false })
const EmbedModal = dynamic(() => import('../../components/media/Modals/EmbedModal'), { ssr: false })
const GalleryModal = dynamic(() => import('../../components/media/Modals/GalleryModal'), { ssr: false })

const categories = [
  { id: 'tech', name: 'Technology', icon: '⚡', color: '#3b82f6', gradient: 'from-blue-500 to-indigo-600' },
  { id: 'health', name: 'Wellness', icon: '🌿', color: '#10b981', gradient: 'from-emerald-500 to-teal-600' },
  { id: 'entertainment', name: 'Culture', icon: '🎭', color: '#ec4899', gradient: 'from-pink-500 to-rose-600' },
  { id: 'wealth', name: 'Capital', icon: '💰', color: '#f59e0b', gradient: 'from-amber-500 to-orange-600' },
  { id: 'world', name: 'Horizons', icon: '🌍', color: '#06b6d4', gradient: 'from-cyan-500 to-blue-600' },
  { id: 'lifestyle', name: 'Aesthetic', icon: '✨', color: '#f97316', gradient: 'from-orange-500 to-red-600' },
  { id: 'growth', name: 'Evolution', icon: '🌱', color: '#8b5cf6', gradient: 'from-purple-500 to-violet-600' }
]

export default function AdminLivePosts() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingPost, setEditingPost] = useState(null)
  const [showMediaModal, setShowMediaModal] = useState(null)
  const [viewMode, setViewMode] = useState('grid')
  const [searchTerm, setSearchTerm] = useState('')
  
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('tech')
  const [media, setMedia] = useState([])
  const [title, setTitle] = useState('')
  
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

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

  const isActive = (post) => post.status === 'published' && new Date(post.expires_at) > new Date()

  const savePost = async () => {
    if (media.length === 0) {
      setError('Add at least one image or video')
      return
    }

    setSaving(true)
    setError('')
    
    const now = new Date().toISOString()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

    const postData = {
      title: title.trim() || null,
      category,
      content: content.trim() || null,
      media_items: media.map(m => ({ type: m.type, url: m.url })),
      status: 'published',
      published_at: now,
      expires_at: expiresAt,
      updated_at: now
    }

    let result
    if (editingPost) {
      result = await supabase.from('live_posts').update(postData).eq('id', editingPost.id)
    } else {
      result = await supabase.from('live_posts').insert([postData])
    }

    if (!result.error) {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2000)
      setModalOpen(false)
      resetForm()
      fetchPosts()
    } else {
      setError(result.error.message)
    }
    setSaving(false)
  }

  const deletePost = async (id) => {
    if (confirm('Delete this post permanently?')) {
      await supabase.from('live_posts').delete().eq('id', id)
      fetchPosts()
    }
  }

  const forceExpire = async (id) => {
    await supabase.from('live_posts').update({ status: 'expired', expires_at: new Date().toISOString() }).eq('id', id)
    fetchPosts()
  }

  const resetForm = () => {
    setEditingPost(null)
    setTitle('')
    setContent('')
    setCategory('tech')
    setMedia([])
    setError('')
  }

  const editPost = (post) => {
    setEditingPost(post)
    setTitle(post.title || '')
    setContent(post.content || '')
    setCategory(post.category)
    setMedia(post.media_items || [])
    setModalOpen(true)
  }

  const handleMediaInsert = (mediaData) => {
    setMedia(prev => [...prev, {
      id: Date.now() + Math.random(),
      type: mediaData.type || 'image',
      url: mediaData.url
    }])
    setShowMediaModal(null)
  }

  const removeMedia = (id) => setMedia(prev => prev.filter(m => m.id !== id))

  const getTimeLeft = (expiresAt) => {
    const diff = new Date(expiresAt) - new Date()
    if (diff <= 0) return 'Expired'
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % 3600000) / 60000)
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
  }

  const filteredPosts = posts.filter(post => 
    post.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.category?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <>
      <Head><title>Live Posts | Admin Dashboard</title></Head>
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Premium Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Live Stories</h1>
              <p className="text-gray-500 mt-1">24-hour premium content · one per category</p>
            </div>
            <div className="flex gap-3">
              <div className="flex bg-white/5 rounded-xl p-1">
                <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-gray-500'}`}>
                  <Grid size={18} />
                </button>
                <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-gray-500'}`}>
                  <List size={18} />
                </button>
              </div>
              <button 
                onClick={() => { resetForm(); setModalOpen(true); }} 
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all"
              >
                <Plus size={18} /> New Story
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Search stories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition"
            />
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-2xl p-5 border border-purple-500/20">
              <div className="text-3xl font-bold text-white mb-1">{posts.filter(isActive).length}</div>
              <div className="text-sm text-gray-400">Active Stories</div>
            </div>
            <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
              <div className="text-3xl font-bold text-white mb-1">{posts.length}</div>
              <div className="text-sm text-gray-400">Total Stories</div>
            </div>
            <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
              <div className="text-3xl font-bold text-white mb-1">{posts.reduce((s, p) => s + (p.likes || 0), 0)}</div>
              <div className="text-sm text-gray-400">Total Likes</div>
            </div>
            <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
              <div className="text-3xl font-bold text-white mb-1">{posts.reduce((s, p) => s + (p.media_items?.length || 0), 0)}</div>
              <div className="text-sm text-gray-400">Media Assets</div>
            </div>
          </div>

          {/* Posts Grid/List */}
          {loading ? (
            <div className="flex items-center justify-center py-32">
              <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-32 bg-white/5 rounded-3xl border border-white/10">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-gray-400 mb-4">No stories found</p>
              <button onClick={() => { resetForm(); setModalOpen(true); }} className="text-purple-400 hover:text-purple-300 transition">Create your first story →</button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredPosts.map(post => {
                const active = isActive(post)
                const cat = categories.find(c => c.id === post.category)
                return (
                  <div key={post.id} className="group bg-white/5 rounded-2xl overflow-hidden border border-white/10 hover:border-purple-500/30 transition-all duration-300">
                    {/* Media Preview */}
                    <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 relative overflow-hidden">
                      {post.media_items?.[0] && (
                        <img src={post.media_items[0].url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      {active && (
                        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 bg-red-500 rounded-full text-xs font-medium">
                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                          LIVE
                        </div>
                      )}
                      <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2 py-1 bg-black/60 backdrop-blur rounded-full text-xs">
                        <Eye size={12} /> {post.likes || 0}
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{cat?.icon}</span>
                        <span className="text-xs text-gray-400">{cat?.name}</span>
                        <span className="text-xs text-gray-600">•</span>
                        <span className="text-xs text-gray-500">{active ? getTimeLeft(post.expires_at) : 'Expired'}</span>
                      </div>
                      <p className="text-white text-sm line-clamp-2 mb-3">{post.content || 'No description'}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-1">
                          <button onClick={() => editPost(post)} className="p-1.5 rounded-lg hover:bg-white/10 transition">
                            <Edit size={14} className="text-gray-400" />
                          </button>
                          {active && (
                            <button onClick={() => forceExpire(post.id)} className="p-1.5 rounded-lg hover:bg-white/10 transition">
                              <Clock size={14} className="text-gray-400" />
                            </button>
                          )}
                          <button onClick={() => deletePost(post.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 transition">
                            <Trash2 size={14} className="text-gray-400 hover:text-red-500" />
                          </button>
                        </div>
                        <Link href={`/live-posts/${post.category}`} target="_blank">
                          <button className="text-xs text-purple-400 hover:text-purple-300 transition">View →</button>
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
              <table className="w-full">
                <thead className="border-b border-white/10">
                  <tr className="text-left text-xs text-gray-500">
                    <th className="p-4">Story</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Likes</th>
                    <th className="p-4">Time Left</th>
                    <th className="p-4" />
                  </tr>
                </thead>
                <tbody>
                  {filteredPosts.map(post => {
                    const active = isActive(post)
                    const cat = categories.find(c => c.id === post.category)
                    return (
                      <tr key={post.id} className="border-b border-white/5 hover:bg-white/5 transition">
                        <td className="p-4">
                          <p className="text-white text-sm line-clamp-1">{post.content || 'Untitled'}</p>
                        </td>
                        <td className="p-4">
                          <span className="text-sm" style={{ color: cat?.color }}>{cat?.icon} {cat?.name}</span>
                        </td>
                        <td className="p-4">
                          <span className={`text-xs px-2 py-1 rounded-full ${active ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'}`}>
                            {active ? 'Live' : 'Expired'}
                          </span>
                        </td>
                        <td className="p-4 text-white text-sm">{post.likes || 0}</td>
                        <td className="p-4">
                          <span className={`text-xs font-mono ${active ? 'text-yellow-500' : 'text-gray-500'}`}>
                            {active ? getTimeLeft(post.expires_at) : '—'}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <button onClick={() => editPost(post)} className="p-1.5 rounded-lg hover:bg-white/10">
                              <Edit size={14} className="text-gray-400" />
                            </button>
                            {active && (
                              <button onClick={() => forceExpire(post.id)} className="p-1.5 rounded-lg hover:bg-white/10">
                                <Clock size={14} className="text-gray-400" />
                              </button>
                            )}
                            <button onClick={() => deletePost(post.id)} className="p-1.5 rounded-lg hover:bg-red-500/10">
                              <Trash2 size={14} className="text-gray-400 hover:text-red-500" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Premium Create/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-white/10 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-white">{editingPost ? 'Edit Story' : 'Create New Story'}</h2>
                <p className="text-sm text-gray-500 mt-1">24-hour premium content</p>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-gray-500 hover:text-white transition p-2 rounded-lg hover:bg-white/10">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {success && (
                <div className="flex items-center gap-2 text-sm text-green-500 bg-green-500/10 p-3 rounded-xl border border-green-500/20">
                  <CheckCircle size={16} /> {editingPost ? 'Story updated successfully!' : 'Story published successfully!'}
                </div>
              )}
              {error && (
                <div className="flex items-center gap-2 text-sm text-red-500 bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              {/* Category Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Category</label>
                <div className="grid grid-cols-4 gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setCategory(cat.id)}
                      className={`p-3 rounded-xl text-center transition-all ${category === cat.id ? 'bg-gradient-to-r ' + cat.gradient + ' text-white shadow-lg' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                    >
                      <div className="text-xl mb-1">{cat.icon}</div>
                      <div className="text-xs">{cat.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Headline (Optional)</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Catchy headline for your story..."
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Story Content</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your story here..."
                  rows={5}
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition resize-none"
                />
              </div>

              {/* Media Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Media Gallery</label>
                <div className="flex gap-3 flex-wrap mb-4">
                  <button onClick={() => setShowMediaModal('image')} className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 text-blue-400 rounded-xl hover:bg-blue-600/30 transition text-sm">📷 Add Image</button>
                  <button onClick={() => setShowMediaModal('video')} className="flex items-center gap-2 px-4 py-2 bg-green-600/20 text-green-400 rounded-xl hover:bg-green-600/30 transition text-sm">🎥 Add Video</button>
                  <button onClick={() => setShowMediaModal('audio')} className="flex items-center gap-2 px-4 py-2 bg-purple-600/20 text-purple-400 rounded-xl hover:bg-purple-600/30 transition text-sm">🎵 Add Audio</button>
                  <button onClick={() => setShowMediaModal('embed')} className="flex items-center gap-2 px-4 py-2 bg-yellow-600/20 text-yellow-400 rounded-xl hover:bg-yellow-600/30 transition text-sm">🔗 Embed</button>
                </div>
                
                {media.length > 0 && (
                  <div className="grid grid-cols-4 gap-3">
                    {media.map(item => (
                      <div key={item.id} className="relative group bg-white/5 rounded-xl overflow-hidden aspect-square">
                        {item.type === 'image' && <img src={item.url} className="w-full h-full object-cover" />}
                        {item.type === 'video' && <Video size={32} className="w-full h-full p-3 text-gray-500" />}
                        {item.type === 'audio' && <Music size={32} className="w-full h-full p-3 text-gray-500" />}
                        <button onClick={() => removeMedia(item.id)} className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                          <X size={12} className="text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-white/10 flex gap-3">
              <button onClick={() => setModalOpen(false)} className="flex-1 py-3 border border-white/10 rounded-xl text-gray-400 hover:bg-white/5 transition">Cancel</button>
              <button onClick={savePost} disabled={saving || media.length === 0} className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all disabled:opacity-50">
                {saving ? 'Publishing...' : editingPost ? 'Update Story' : 'Publish Story'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Professional Media Modals */}
      <ImageModal isOpen={showMediaModal === 'image'} onClose={() => setShowMediaModal(null)} onUpload={handleMediaInsert} />
      <VideoModal isOpen={showMediaModal === 'video'} onClose={() => setShowMediaModal(null)} onUpload={handleMediaInsert} />
      <AudioModal isOpen={showMediaModal === 'audio'} onClose={() => setShowMediaModal(null)} onUpload={handleMediaInsert} />
      <PDFModal isOpen={showMediaModal === 'pdf'} onClose={() => setShowMediaModal(null)} onUpload={handleMediaInsert} />
      <EmbedModal isOpen={showMediaModal === 'embed'} onClose={() => setShowMediaModal(null)} onUpload={handleMediaInsert} />
      <GalleryModal isOpen={showMediaModal === 'gallery'} onClose={() => setShowMediaModal(null)} onInsert={(data) => handleMediaInsert({ ...data, type: 'gallery' })} />
    </>
  )
}