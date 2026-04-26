// pages/api/bookmarks/batch.js
import { supabase } from '@/lib/supabase'

export default async function handler(req, res) {
  const { user } = await getAuthenticatedUser(req)
  if (!user) return res.status(401).json({ error: 'Unauthorized' })
  
  const { action, bookmarkIds, data } = req.body
  
  switch(action) {
    case 'delete':
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .in('id', bookmarkIds)
        .eq('user_id', user.id)
      
      if (error) return res.status(500).json({ error: error.message })
      return res.json({ success: true })
    
    case 'update_category':
      const { error: catError } = await supabase
        .from('bookmarks')
        .update({ category_id: data.categoryId })
        .in('id', bookmarkIds)
        .eq('user_id', user.id)
      
      if (catError) return res.status(500).json({ error: catError.message })
      return res.json({ success: true })
    
    case 'export':
      const { data: bookmarks } = await supabase
        .from('bookmarks')
        .select('*')
        .in('id', bookmarkIds)
        .eq('user_id', user.id)
      
      const csv = convertToCSV(bookmarks)
      res.setHeader('Content-Type', 'text/csv')
      res.setHeader('Content-Disposition', 'attachment; filename=bookmarks.csv')
      return res.send(csv)
    
    default:
      return res.status(400).json({ error: 'Invalid action' })
  }
}