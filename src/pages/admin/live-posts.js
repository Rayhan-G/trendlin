// src/pages/admin/live-posts.js
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import Head from 'next/head'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { 
  Plus, Edit, Trash2, Eye, Clock, X, Video, Music, 
  Image, CheckCircle, AlertCircle, Send
} from 'lucide-react'

const ImageModal = dynamic(() => import('../../components/media/Modals/ImageModal'), { ssr: false })
const VideoModal = dynamic(() => import('../../components/media/Modals/VideoModal'), { ssr: false })
const AudioModal = dynamic(() => import('../../components/media/Modals/AudioModal'), { ssr: false })

const categories = [
  { id: 'tech', name: 'Technology', icon: '⚡', color: '#3b82f6' },
  { id: 'health', name: 'Wellness', icon: '🌿', color: '#10b981' },
  { id: 'entertainment', name: 'Culture', icon: '🎭', color: '#ec4899' },
  { id: 'wealth', name: 'Capital', icon: '💰', color: '#f59e0b' },
  { id: 'world', name: 'Horizons', icon: '🌍', color: '#06b6d4' },
  { id: 'lifestyle', name: 'Aesthetic', icon: '✨', color: '#f97316' },
  { id: 'growth', name: 'Evolution', icon: '🌱', color: '#8b5cf6' }
]

export default function AdminLivePosts() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingPost, setEditingPost] = useState(null)
  
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('tech')
  const [media, setMedia] = useState([])
  
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('live_posts')
      .select('id,category,content,media_items,status,likes,expires_at')
      .order('created_at', { ascending: false })
      .limit(50)
    setPosts(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchPosts() }, [fetchPosts])

  const isActive = (post) => {
    return post.status === 'published' && new Date(post.expires_at) > new Date()
  }

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
      category,
      content: content.trim() || null,
      media_items: media.map(m => ({ type: m.type, url: m.url })),
      status: 'published',
      published_at: now,
      expires_at: expiresAt
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
    await supabase.from('live_posts').delete().eq('id', id)
    fetchPosts()
  }

  const resetForm = () => {
    setEditingPost(null)
    setContent('')
    setCategory('tech')
    setMedia([])
    setError('')
  }

  const editPost = (post) => {
    setEditingPost(post)
    setContent(post.content || '')
    setCategory(post.category)
    setMedia(post.media_items || [])
    setModalOpen(true)
  }

  const addMedia = (mediaData) => {
    setMedia(prev => [...prev, {
      id: Date.now(),
      type: mediaData.type || 'image',
      url: mediaData.url
    }])
  }

  const removeMedia = (id) => {
    setMedia(prev => prev.filter(m => m.id !== id))
  }

  const getTimeLeft = (expiresAt) => {
    const diff = new Date(expiresAt) - new Date()
    if (diff <= 0) return 'Expired'
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % 3600000) / 60000)
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
  }

  return (
    <>
      <Head><title>Live Posts</title></Head>
      <div className="min-h-screen bg-black p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-semibold text-white">Live Posts</h1>
              <p className="text-gray-500 text-sm mt-1">24-hour stories · one per category</p>
            </div>
            <button 
              onClick={() => { resetForm(); setModalOpen(true); }} 
              className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-full text-sm font-medium hover:bg-gray-100 transition"
            >
              <Plus size={16} /> New Story
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-white/5 rounded-2xl p-4">
              <div className="text-2xl mb-1">{posts.filter(isActive).length}</div>
              <div className="text-xs text-gray-500">ACTIVE</div>
            </div>
            <div className="bg-white/5 rounded-2xl p-4">
              <div className="text-2xl mb-1">{posts.length}</div>
              <div className="text-xs text-gray-500">TOTAL</div>
            </div>
            <div className="bg-white/5 rounded-2xl p-4">
              <div className="text-2xl mb-1">{posts.reduce((s, p) => s + (p.likes || 0), 0)}</div>
              <div className="text-xs text-gray-500">LIKES</div>
            </div>
            <div className="bg-white/5 rounded-2xl p-4">
              <div className="text-2xl mb-1">{posts.reduce((s, p) => s + (p.media_items?.length || 0), 0)}</div>
              <div className="text-xs text-gray-500">MEDIA</div>
            </div>
          </div>

          {/* Posts Table */}
          <div className="bg-white/5 rounded-2xl overflow-hidden">
            {loading ? (
              <div className="text-center py-20 text-gray-500">Loading...</div>
            ) : posts.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-5xl mb-3">📭</div>
                <p className="text-gray-500">No stories yet</p>
                <button onClick={() => { resetForm(); setModalOpen(true); }} className="mt-4 text-sm text-white underline">Create one</button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-white/10">
                    <tr className="text-left text-xs text-gray-500">
                      <th className="p-4">Story</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Likes</th>
                      <th className="p-4">Time</th>
                      <th className="p-4"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {posts.map(post => {
                      const active = isActive(post)
                      const cat = categories.find(c => c.id === post.category)
                      return (
                        <tr key={post.id} className="border-b border-white/5 hover:bg-white/5 transition">
                          <td className="p-4">
                            <div className="max-w-xs">
                              <p className="text-white text-sm line-clamp-1">{post.content || 'Untitled'}</p>
                            </div>
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
                              <button onClick={() => editPost(post)} className="p-1.5 rounded hover:bg-white/10">
                                <Edit size={14} className="text-gray-400" />
                              </button>
                              <button onClick={() => deletePost(post.id)} className="p-1.5 rounded hover:bg-white/10">
                                <Trash2 size={14} className="text-gray-400" />
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
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-[#0f0f0f] rounded-2xl w-full max-w-lg max-h-[85vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-white/10 flex justify-between items-center">
              <h2 className="text-white font-medium">{editingPost ? 'Edit Story' : 'New Story'}</h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-500 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="p-5 space-y-5 overflow-y-auto max-h-[calc(85vh-120px)]">
              {success && (
                <div className="flex items-center gap-2 text-sm text-green-500 bg-green-500/10 p-3 rounded-xl">
                  <CheckCircle size={16} /> Story published!
                </div>
              )}
              {error && (
                <div className="flex items-center gap-2 text-sm text-red-500 bg-red-500/10 p-3 rounded-xl">
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              {/* Category */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">CATEGORY</label>
                <select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)} 
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-white/20"
                >
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>)}
                </select>
              </div>

              {/* Content */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">STORY</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="What's happening?"
                  rows={3}
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm resize-none focus:outline-none focus:border-white/20"
                />
              </div>

              {/* Media */}
              <div>
                <label className="block text-xs text-gray-500 mb-2">MEDIA</label>
                <div className="flex gap-2 mb-3">
                  <button onClick={() => setShowMediaModal('image')} className="px-3 py-1.5 bg-white/5 rounded-full text-xs text-gray-400 hover:text-white">📷 Image</button>
                  <button onClick={() => setShowMediaModal('video')} className="px-3 py-1.5 bg-white/5 rounded-full text-xs text-gray-400 hover:text-white">🎥 Video</button>
                  <button onClick={() => setShowMediaModal('audio')} className="px-3 py-1.5 bg-white/5 rounded-full text-xs text-gray-400 hover:text-white">🎵 Audio</button>
                </div>
                {media.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {media.map(item => (
                      <div key={item.id} className="relative w-16 h-16 bg-white/5 rounded-lg overflow-hidden">
                        {item.type === 'image' && <img src={item.url} className="w-full h-full object-cover" />}
                        {item.type === 'video' && <Video size={24} className="w-full h-full p-4 text-gray-500" />}
                        {item.type === 'audio' && <Music size={24} className="w-full h-full p-4 text-gray-500" />}
                        <button onClick={() => removeMedia(item.id)} className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-5 border-t border-white/10 flex gap-3">
              <button onClick={() => setModalOpen(false)} className="flex-1 py-2.5 border border-white/10 rounded-xl text-gray-400 text-sm hover:bg-white/5">Cancel</button>
              <button onClick={savePost} disabled={saving} className="flex-1 py-2.5 bg-white text-black rounded-xl text-sm font-medium disabled:opacity-50">
                {saving ? 'Publishing...' : 'Publish'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Media Modals */}
      <ImageModal isOpen={showMediaModal === 'image'} onClose={() => setShowMediaModal(null)} onUpload={addMedia} />
      <VideoModal isOpen={showMediaModal === 'video'} onClose={() => setShowMediaModal(null)} onUpload={addMedia} />
      <AudioModal isOpen={showMediaModal === 'audio'} onClose={() => setShowMediaModal(null)} onUpload={addMedia} />
    </>
  )
}