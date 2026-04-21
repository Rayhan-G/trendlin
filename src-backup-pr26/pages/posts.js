import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { FileText, Eye, Edit, Trash2, Calendar, Clock } from 'lucide-react'
import { postService } from '@/services/postService'
import { toast } from 'react-toastify'
import { format } from 'date-fns'

const Posts = () => {
  const router = useRouter()
  const [posts, setPosts] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    setIsLoading(true)
    try {
      const result = await postService.getAllPosts()
      if (result.success) {
        setPosts(result.data)
      } else {
        toast.error('Failed to load posts')
      }
    } catch (error) {
      console.error('Fetch posts error:', error)
      toast.error('Failed to load posts')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (id) => {
    router.push(`/edit-post/${id}`)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        const result = await postService.deletePost(id)
        if (result.success) {
          toast.success('Post deleted successfully')
          fetchPosts()
        } else {
          toast.error('Failed to delete post')
        }
      } catch (error) {
        console.error('Delete error:', error)
        toast.error('Failed to delete post')
      }
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { color: 'bg-gray-500', label: 'Draft' },
      published: { color: 'gradient-success', label: 'Published' },
      scheduled: { color: 'gradient-secondary', label: 'Scheduled' }
    }
    const config = statusConfig[status] || statusConfig.draft
    return (
      <span className={`px-2 py-1 rounded-full text-xs text-white ${config.color}`}>
        {config.label}
      </span>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 gradient-primary rounded-full animate-pulse mx-auto mb-4"></div>
          <p className="text-gray-500">Loading posts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold gradient-primary bg-clip-text text-transparent">
          My Posts
        </h1>
        <button
          onClick={() => router.push('/create-post')}
          className="px-6 py-2 gradient-primary text-white rounded-xl font-semibold
                   hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg"
        >
          Create New Post
        </button>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold mb-2">No posts yet</h3>
          <p className="text-gray-500 mb-4">Create your first post to get started</p>
          <button
            onClick={() => router.push('/create-post')}
            className="px-6 py-2 gradient-primary text-white rounded-xl font-semibold
                     hover:scale-105 active:scale-95 transition-all duration-200"
          >
            Create Post
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-card hover:shadow-hover transition-all duration-300 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold mb-2 hover:text-purple-500 transition-colors">
                      {post.title || 'Untitled Post'}
                    </h2>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{format(new Date(post.created_at), 'MMM dd, yyyy')}</span>
                      </div>
                      {post.scheduled_for && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Scheduled: {format(new Date(post.scheduled_for), 'MMM dd, yyyy')}</span>
                        </div>
                      )}
                      <div>{getStatusBadge(post.status)}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(post.id)}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition-all duration-200 text-red-500"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div 
                  className="text-gray-600 dark:text-gray-400 line-clamp-2"
                  dangerouslySetInnerHTML={{ __html: post.content?.substring(0, 200) + '...' }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Posts