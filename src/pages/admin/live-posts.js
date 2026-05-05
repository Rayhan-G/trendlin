// src/pages/admin/live-posts.js
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../../lib/supabase'
import Head from 'next/head'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { 
  Plus, Edit, Trash2, Eye, Clock, X, 
  CheckCircle, AlertCircle, RefreshCw
} from 'lucide-react'

// Import media modals
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
  const [showMediaModal, setShowMediaModal] = useState(null)
  
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('tech')
  const [media, setMedia] = useState([])
  
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [debug, setDebug] = useState('')

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    setDebug('Fetching posts...')
    try {
      const { data, error } = await supabase
        .from('live_posts')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      setPosts(data || [])
      setDebug(`Found ${data?.length || 0} posts`)
    } catch (err) {
      console.error('Fetch error:', err)
      setDebug(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  const isActive = (post) => {
    if (!post.expires_at) return false
    return post.status === 'published' && new Date(post.expires_at) > new Date()
  }

  const savePost = async () => {
    if (media.length === 0) {
      setError('Please add at least one image or video')
      return
    }

    setSaving(true)
    setError('')
    setDebug('Saving post...')
    
    try {
      const now = new Date().toISOString()
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

      const postData = {
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
        result = await supabase
          .from('live_posts')
          .update(postData)
          .eq('id', editingPost.id)
        
        if (result.error) throw result.error
        setDebug('Post updated successfully')
      } else {
        result = await supabase
          .from('live_posts')
          .insert([postData])
        
        if (result.error) throw result.error
        setDebug('Post created successfully')
      }

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
      setModalOpen(false)
      resetForm()
      await fetchPosts()
      
    } catch (err) {
      console.error('Save error:', err)
      setError(err.message || 'Failed to save post')
      setDebug(`Save error: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  const deletePost = async (id) => {
    if (!confirm('Delete this post permanently?')) return
    
    setDebug('Deleting post...')
    const { error } = await supabase
      .from('live_posts')
      .delete()
      .eq('id', id)
    
    if (!error) {
      setDebug('Post deleted')
      fetchPosts()
    } else {
      setDebug(`Delete error: ${error.message}`)
    }
  }

  const forceExpire = async (id) => {
    setDebug('Expiring post...')
    const { error } = await supabase
      .from('live_posts')
      .update({ 
        status: 'expired', 
        expires_at: new Date().toISOString() 
      })
      .eq('id', id)
    
    if (!error) {
      setDebug('Post expired')
      fetchPosts()
    }
  }

  const resetForm = () => {
    setEditingPost(null)
    setContent('')
    setCategory('tech')
    setMedia([])
    setError('')
    setDebug('')
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
    setShowMediaModal(null)
    setDebug(`Added ${mediaData.type}: ${mediaData.url}`)
  }

  const removeMedia = (id) => {
    setMedia(prev => prev.filter(m => m.id !== id))
    setDebug('Removed media item')
  }

  const getTimeLeft = (expiresAt) => {
    if (!expiresAt) return '—'
    const diff = new Date(expiresAt) - new Date()
    if (diff <= 0) return 'Expired'
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % 3600000) / 60000)
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
  }

  return (
    <>
      <Head><title>Live Posts | Admin</title></Head>
      
      <div className="min-h-screen bg-black p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white">Live Posts</h1>
              <p className="text-gray-500 mt-1">Manage 24-hour stories</p>
            </div>
            <button 
              onClick={() => { resetForm(); setModalOpen(true); }} 
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              <Plus size={18} /> New Post
            </button>
          </div>

          {/* Debug Panel */}
          {debug && (
            <div className="mb-4 p-3 bg-gray-900 rounded-lg border border-gray-800">
              <p className="text-xs text-gray-500 font-mono">Debug: {debug}</p>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-900 rounded-lg p-4">
              <div className="text-2xl font-bold text-white">{posts.filter(isActive).length}</div>
              <div className="text-xs text-gray-500">ACTIVE</div>
            </div>
            <div className="bg-gray-900 rounded-lg p-4">
              <div className="text-2xl font-bold text-white">{posts.length}</div>
              <div className="text-xs text-gray-500">TOTAL</div>
            </div>
            <div className="bg-gray-900 rounded-lg p-4">
              <div className="text-2xl font-bold text-white">{posts.reduce((sum, p) => sum + (p.likes || 0), 0)}</div>
              <div className="text-xs text-gray-500">LIKES</div>
            </div>
            <div className="bg-gray-900 rounded-lg p-4">
              <div className="text-2xl font-bold text-white">{posts.reduce((sum, p) => sum + (p.media_items?.length || 0), 0)}</div>
              <div className="text-xs text-gray-500">MEDIA</div>
            </div>
          </div>

          {/* Refresh Button */}
          <div className="mb-4 flex justify-end">
            <button onClick={fetchPosts} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm">
              <RefreshCw size={14} /> Refresh
            </button>
          </div>

          {/* Posts Table */}
          <div className="bg-gray-900 rounded-lg overflow-hidden">
            {loading ? (
              <div className="text-center py-20 text-gray-500">Loading...</div>
            ) : posts.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-gray-500 mb-4">No posts yet</p>
                <button onClick={() => { resetForm(); setModalOpen(true); }} className="text-purple-500 hover:text-purple-400">
                  Create your first post
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-gray-800">
                    <tr className="text-left text-xs text-gray-500">
                      <th className="p-4">Content</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Likes</th>
                      <th className="p-4">Time Left</th>
                      <th className="p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {posts.map((post) => {
                      const active = isActive(post)
                      const cat = categories.find(c => c.id === post.category)
                      return (
                        <tr key={post.id} className="border-b border-gray-800 hover:bg-gray-800/50 transition">
                          <td className="p-4">
                            <div className="max-w-md">
                              <p className="text-white text-sm line-clamp-2">{post.content || 'No content'}</p>
                              {post.media_items && post.media_items.length > 0 && (
                                <div className="flex gap-1 mt-1">
                                  {post.media_items.slice(0, 3).map((m, i) => (
                                    <span key={i} className="text-xs text-gray-500">
                                      {m.type === 'image' && '📷'}
                                      {m.type === 'video' && '🎥'}
                                      {m.type === 'audio' && '🎵'}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                           </tr>
                          <td className="p-4">
                            <span className="text-sm" style={{ color: cat?.color }}>
                              {cat?.icon} {cat?.name}
                            </span>
                           </tr>
                          <td className="p-4">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              active ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'
                            }`}>
                              {active ? '● LIVE' : 'EXPIRED'}
                            </span>
                           </tr>
                          <td className="p-4 text-white text-sm">{post.likes || 0}</td>
                          <td className="p-4">
                            <span className={`text-xs font-mono ${active ? 'text-yellow-500' : 'text-gray-500'}`}>
                              {active ? getTimeLeft(post.expires_at) : '—'}
                            </span>
                           </tr>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <button onClick={() => editPost(post)} className="p-1.5 rounded hover:bg-gray-700 transition">
                                <Edit size={14} className="text-gray-400" />
                              </button>
                              {active && (
                                <button onClick={() => forceExpire(post.id)} className="p-1.5 rounded hover:bg-gray-700 transition">
                                  <Clock size={14} className="text-gray-400" />
                                </button>
                              )}
                              <button onClick={() => deletePost(post.id)} className="p-1.5 rounded hover:bg-red-500/20 transition">
                                <Trash2 size={14} className="text-gray-400 hover:text-red-500" />
                              </button>
                            </div>
                           </tr>
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
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-gray-900 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-gray-800 flex justify-between items-center">
              <h2 className="text-white text-lg font-semibold">
                {editingPost ? 'Edit Post' : 'Create New Post'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-500 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="p-5 space-y-5 overflow-y-auto max-h-[calc(90vh-120px)]">
              {success && (
                <div className="flex items-center gap-2 text-sm text-green-500 bg-green-500/10 p-3 rounded-lg">
                  <CheckCircle size={16} />
                  {editingPost ? 'Post updated!' : 'Post published!'}
                </div>
              )}
              {error && (
                <div className="flex items-center gap-2 text-sm text-red-500 bg-red-500/10 p-3 rounded-lg">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Category *</label>
                <select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)} 
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Story Content</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your story here..."
                  rows={5}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              {/* Media */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Media * (required)</label>
                <div className="flex gap-2 mb-3">
                  <button onClick={() => setShowMediaModal('image')} className="px-3 py-1.5 bg-gray-800 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-gray-700 transition">
                    📷 Add Image
                  </button>
                  <button onClick={() => setShowMediaModal('video')} className="px-3 py-1.5 bg-gray-800 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-gray-700 transition">
                    🎥 Add Video
                  </button>
                  <button onClick={() => setShowMediaModal('audio')} className="px-3 py-1.5 bg-gray-800 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-gray-700 transition">
                    🎵 Add Audio
                  </button>
                </div>
                
                {media.length > 0 && (
                  <div className="grid grid-cols-4 gap-2">
                    {media.map(item => (
                      <div key={item.id} className="relative group bg-gray-800 rounded-lg aspect-square overflow-hidden">
                        {item.type === 'image' && <img src={item.url} className="w-full h-full object-cover" alt="" />}
                        {item.type === 'video' && <div className="w-full h-full flex items-center justify-center"><div className="text-gray-500">🎥 Video</div></div>}
                        {item.type === 'audio' && <div className="w-full h-full flex items-center justify-center"><div className="text-gray-500">🎵 Audio</div></div>}
                        <button onClick={() => removeMedia(item.id)} className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                {media.length === 0 && (
                  <p className="text-xs text-red-500">At least one media item is required</p>
                )}
              </div>
            </div>

            <div className="p-5 border-t border-gray-800 flex gap-3">
              <button onClick={() => setModalOpen(false)} className="flex-1 py-2 bg-gray-800 rounded-lg text-gray-400 hover:bg-gray-700 transition">
                Cancel
              </button>
              <button 
                onClick={savePost} 
                disabled={saving || media.length === 0} 
                className="flex-1 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
              >
                {saving ? 'Saving...' : (editingPost ? 'Update' : 'Publish')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Media Modals */}
      {showMediaModal === 'image' && (
        <ImageModal isOpen={true} onClose={() => setShowMediaModal(null)} onUpload={addMedia} />
      )}
      {showMediaModal === 'video' && (
        <VideoModal isOpen={true} onClose={() => setShowMediaModal(null)} onUpload={addMedia} />
      )}
      {showMediaModal === 'audio' && (
        <AudioModal isOpen={true} onClose={() => setShowMediaModal(null)} onUpload={addMedia} />
      )}
    </>
  )
}