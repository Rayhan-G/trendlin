// src/pages/admin/live-posts.js
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../../lib/supabase'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import { 
  Plus, Edit, Trash2, Clock, X, CheckCircle, AlertCircle, RefreshCw, 
  Image, Video, Link, Hash, FileText, Source, Zap, Globe, Award
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
  const [showMediaModal, setShowMediaModal] = useState(null)
  const [showSourceModal, setShowSourceModal] = useState(false)
  
  // Form fields for 4-part system
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('tech')
  const [media, setMedia] = useState([])
  const [sources, setSources] = useState([])
  const [newSourceName, setNewSourceName] = useState('')
  const [newSourceUrl, setNewSourceUrl] = useState('')
  
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

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  const isActive = (post) => {
    return post.status === 'active' && new Date(post.expires_at) > new Date()
  }

  const addSource = () => {
    if (newSourceName.trim() && newSourceUrl.trim()) {
      setSources([...sources, { name: newSourceName.trim(), url: newSourceUrl.trim() }])
      setNewSourceName('')
      setNewSourceUrl('')
    }
  }

  const removeSource = (index) => {
    setSources(sources.filter((_, i) => i !== index))
  }

  const savePost = async () => {
    if (!description.trim()) {
      setError('Description is required')
      return
    }
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
      description: description.trim(),
      content: content.trim() || null,
      category,
      media_items: media.map(m => ({ type: m.type, url: m.url })),
      sources: sources,
      status: 'active',
      created_at: editingPost ? editingPost.created_at : now,
      expires_at: expiresAt,
      updated_at: now,
      view_count: editingPost?.view_count || 0,
      share_count: editingPost?.share_count || 0
    }

    let result
    if (editingPost) {
      result = await supabase
        .from('live_posts')
        .update(postData)
        .eq('id', editingPost.id)
    } else {
      result = await supabase
        .from('live_posts')
        .insert([postData])
    }

    if (!result.error) {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
      setModalOpen(false)
      resetForm()
      fetchPosts()
    } else {
      setError(result.error.message)
    }
    setSaving(false)
  }

  const deletePost = async (id) => {
    if (confirm('Delete this post?')) {
      await supabase.from('live_posts').delete().eq('id', id)
      fetchPosts()
    }
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
    setDescription('')
    setContent('')
    setCategory('tech')
    setMedia([])
    setSources([])
    setError('')
  }

  const editPost = (post) => {
    setEditingPost(post)
    setTitle(post.title || '')
    setDescription(post.description || '')
    setContent(post.content || '')
    setCategory(post.category || 'tech')
    setMedia(post.media_items || [])
    setSources(post.sources || [])
    setModalOpen(true)
  }

  const addMedia = (mediaData) => {
    setMedia(prev => [...prev, {
      id: Date.now(),
      type: mediaData.type || 'image',
      url: mediaData.url
    }])
    setShowMediaModal(null)
  }

  const removeMedia = (id) => {
    setMedia(prev => prev.filter(m => m.id !== id))
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
              <h1 className="text-2xl font-bold text-white">Live Posts</h1>
              <p className="text-gray-500 text-sm">24-hour stories with 4-part structure</p>
            </div>
            <button 
              onClick={() => { resetForm(); setModalOpen(true); }} 
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              <Plus size={18} /> New Live Post
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
            <div className="bg-gray-900 rounded-lg p-4">
              <div className="text-2xl font-bold text-white">{posts.filter(isActive).length}</div>
              <div className="text-xs text-gray-500">ACTIVE</div>
            </div>
            <div className="bg-gray-900 rounded-lg p-4">
              <div className="text-2xl font-bold text-white">{posts.length}</div>
              <div className="text-xs text-gray-500">TOTAL</div>
            </div>
            <div className="bg-gray-900 rounded-lg p-4">
              <div className="text-2xl font-bold text-white">{posts.reduce((s, p) => s + (p.view_count || 0), 0)}</div>
              <div className="text-xs text-gray-500">VIEWS</div>
            </div>
            <div className="bg-gray-900 rounded-lg p-4">
              <div className="text-2xl font-bold text-white">{posts.reduce((s, p) => s + (p.share_count || 0), 0)}</div>
              <div className="text-xs text-gray-500">SHARES</div>
            </div>
            <div className="bg-gray-900 rounded-lg p-4">
              <div className="text-2xl font-bold text-white">{posts.reduce((s, p) => s + (p.media_items?.length || 0), 0)}</div>
              <div className="text-xs text-gray-500">MEDIA</div>
            </div>
            <div className="bg-gray-900 rounded-lg p-4">
              <div className="text-2xl font-bold text-white">{posts.reduce((s, p) => s + (p.sources?.length || 0), 0)}</div>
              <div className="text-xs text-gray-500">SOURCES</div>
            </div>
          </div>

          {/* Refresh */}
          <div className="mb-4 text-right">
            <button onClick={fetchPosts} className="text-gray-400 hover:text-white text-sm flex items-center gap-1 ml-auto">
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
                <p className="text-gray-500 mb-4">No live posts yet</p>
                <button onClick={() => { resetForm(); setModalOpen(true); }} className="text-purple-500 hover:text-purple-400 transition">
                  Create your first 24-hour story
                </button>
              </div>
            ) : (
              <table className="w-full">
                <thead className="border-b border-gray-800">
                  <tr className="text-left text-xs text-gray-500">
                    <th className="p-4">Title/Description</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Views</th>
                    <th className="p-4">Shares</th>
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
                          {post.title && <div className="text-white font-medium text-sm">{post.title}</div>}
                          <p className="text-gray-400 text-xs line-clamp-1 mt-1">{post.description?.substring(0, 80)}...</p>
                        </td>
                        <td className="p-4">
                          <span className="text-sm" style={{ color: cat?.color }}>
                            {cat?.icon} {cat?.name}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`text-xs px-2 py-1 rounded-full ${active ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'}`}>
                            {active ? 'LIVE' : 'EXPIRED'}
                          </span>
                        </td>
                        <td className="p-4 text-white text-sm">{post.view_count || 0}</td>
                        <td className="p-4 text-white text-sm">{post.share_count || 0}</td>
                        <td className="p-4">
                          <span className={`text-xs font-mono ${active ? 'text-yellow-500' : 'text-gray-500'}`}>
                            {active ? getTimeLeft(post.expires_at) : '—'}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <button onClick={() => editPost(post)} className="p-1.5 rounded hover:bg-gray-700 transition" title="Edit">
                              <Edit size={14} className="text-gray-400" />
                            </button>
                            {active && (
                              <button onClick={() => forceExpire(post.id)} className="p-1.5 rounded hover:bg-gray-700 transition" title="Force Expire">
                                <Clock size={14} className="text-gray-400" />
                              </button>
                            )}
                            <button onClick={() => deletePost(post.id)} className="p-1.5 rounded hover:bg-red-500/20 transition" title="Delete">
                              <Trash2 size={14} className="text-gray-400" />
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

      {/* Create/Edit Modal - 4 Part Structure */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-gray-900 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-gray-800 flex justify-between items-center">
              <div>
                <h2 className="text-white text-lg font-semibold">
                  {editingPost ? 'Edit Live Post' : 'Create Live Post'}
                </h2>
                <p className="text-gray-500 text-xs mt-1">Posts automatically expire after 24 hours</p>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-gray-500 hover:text-white transition">
                <X size={20} />
              </button>
            </div>

            <div className="p-5 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {success && (
                <div className="text-sm text-green-500 bg-green-500/10 p-3 rounded-lg">
                  <CheckCircle size={16} className="inline mr-2" />
                  {editingPost ? 'Post updated successfully!' : 'Post published! It will expire in 24 hours.'}
                </div>
              )}
              {error && (
                <div className="text-sm text-red-500 bg-red-500/10 p-3 rounded-lg">
                  <AlertCircle size={16} className="inline mr-2" />
                  {error}
                </div>
              )}

              {/* PART 1: Category & Title */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-800">
                  <Hash size={16} className="text-purple-500" />
                  <h3 className="text-white font-medium">Part 1: Basic Info</h3>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Category *</label>
                  <select 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)} 
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Title (Optional)</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Catchy title for your story..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Description *</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="What's happening? Write your story description here..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Full Content (Optional)</label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={6}
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Extended content for readers who want more details..."
                  />
                </div>
              </div>

              {/* PART 2: Media */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-800">
                  <Image size={16} className="text-green-500" />
                  <h3 className="text-white font-medium">Part 2: Media *</h3>
                  <span className="text-xs text-red-400 ml-2">Required</span>
                </div>
                
                <div className="flex gap-2">
                  <button onClick={() => setShowMediaModal('image')} className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-700 transition">
                    <Image size={16} /> Add Image
                  </button>
                  <button onClick={() => setShowMediaModal('video')} className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-700 transition">
                    <Video size={16} /> Add Video
                  </button>
                </div>
                
                {media.length > 0 && (
                  <div className="grid grid-cols-4 gap-3">
                    {media.map(item => (
                      <div key={item.id} className="relative group bg-gray-800 rounded-lg overflow-hidden aspect-square">
                        <img src={item.url} className="w-full h-full object-cover" alt="" />
                        <button onClick={() => removeMedia(item.id)} className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                          <X size={12} />
                        </button>
                        <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/50 rounded text-xs text-white">
                          {item.type === 'video' ? '🎥' : '📷'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* PART 3: Sources */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-800">
                  <Link size={16} className="text-blue-500" />
                  <h3 className="text-white font-medium">Part 3: Sources & References</h3>
                </div>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSourceName}
                    onChange={(e) => setNewSourceName(e.target.value)}
                    className="flex-1 p-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-purple-500"
                    placeholder="Source name (e.g., TechCrunch)"
                  />
                  <input
                    type="url"
                    value={newSourceUrl}
                    onChange={(e) => setNewSourceUrl(e.target.value)}
                    className="flex-1 p-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-purple-500"
                    placeholder="https://..."
                  />
                  <button onClick={addSource} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition">
                    Add
                  </button>
                </div>
                
                {sources.length > 0 && (
                  <div className="space-y-2">
                    {sources.map((source, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                        <div className="flex-1">
                          <p className="text-white text-sm font-medium">{source.name}</p>
                          <p className="text-gray-500 text-xs truncate">{source.url}</p>
                        </div>
                        <button onClick={() => removeSource(idx)} className="p-1 hover:bg-red-500/20 rounded transition">
                          <Trash2 size={14} className="text-gray-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Info Box */}
              <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Zap size={14} className="text-purple-500" />
                  <span className="text-purple-500 text-sm font-medium">24-Hour Story</span>
                </div>
                <p className="text-gray-400 text-xs">
                  This post will automatically expire 24 hours after publishing. 
                  Users can react with emojis and share on social media.
                  Sources will be displayed as clickable links at the bottom.
                </p>
              </div>
            </div>

            <div className="p-5 border-t border-gray-800 flex gap-3">
              <button onClick={() => setModalOpen(false)} className="flex-1 py-2 bg-gray-800 rounded-lg text-gray-400 hover:bg-gray-700 transition">
                Cancel
              </button>
              <button 
                onClick={savePost} 
                disabled={saving || !description.trim() || media.length === 0} 
                className="flex-1 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : (editingPost ? 'Update Post' : 'Publish Live Story')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Media Modals */}
      {showMediaModal === 'image' && <ImageModal isOpen={true} onClose={() => setShowMediaModal(null)} onUpload={addMedia} />}
      {showMediaModal === 'video' && <VideoModal isOpen={true} onClose={() => setShowMediaModal(null)} onUpload={addMedia} />}
      {showMediaModal === 'audio' && <AudioModal isOpen={true} onClose={() => setShowMediaModal(null)} onUpload={addMedia} />}
    </>
  )
}

