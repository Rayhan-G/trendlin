import { supabase } from '@/lib/supabaseClient'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { id, title, content, excerpt, status, tags, meta_description, featured_image } = req.body

  if (!id) {
    return res.status(400).json({ error: 'Document ID is required' })
  }

  try {
    const now = new Date().toISOString()
    
    // Calculate word count from content
    const wordCount = content?.replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(w => w.length).length || 0
    
    // Prepare update data
    const updateData = {
      updated_at: now,
      word_count: wordCount
    }
    
    if (title !== undefined) updateData.title = title
    if (content !== undefined) updateData.content = content
    if (excerpt !== undefined) updateData.excerpt = excerpt
    if (status !== undefined) updateData.status = status
    if (tags !== undefined) updateData.tags = tags
    if (meta_description !== undefined) updateData.meta_description = meta_description
    if (featured_image !== undefined) updateData.featured_image = featured_image
    
    // Update document
    const { data, error } = await supabase
      .from('posts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    // Save version history
    if (content !== undefined) {
      // Get current max version number
      const { data: versions } = await supabase
        .from('post_versions')
        .select('version_number')
        .eq('post_id', id)
        .order('version_number', { ascending: false })
        .limit(1)
      
      const nextVersion = (versions?.[0]?.version_number || 0) + 1
      
      await supabase
        .from('post_versions')
        .insert({
          post_id: id,
          content: content,
          version_number: nextVersion,
          created_by: req.body.author_name || 'System',
          created_by_id: req.body.author_id,
          comment: req.body.version_comment || 'Auto-saved',
          created_at: now
        })
    }

    return res.status(200).json({
      success: true,
      document: data,
      savedAt: now
    })

  } catch (error) {
    console.error('Save error:', error)
    return res.status(500).json({ 
      error: error.message || 'Failed to save document' 
    })
  }
}