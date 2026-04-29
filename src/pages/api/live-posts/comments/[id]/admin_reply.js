// pages/api/live-posts/comments/[id]/admin-reply.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    const { id } = req.query;
    const { admin_reply, admin_name, admin_email } = req.body;
    
    // Validate required fields
    if (!id) {
        return res.status(400).json({ error: 'Comment ID is required' });
    }
    
    if (!admin_reply || admin_reply.trim() === '') {
        return res.status(400).json({ error: 'Admin reply content is required' });
    }
    
    try {
        const commentId = parseInt(id);
        if (isNaN(commentId)) {
            return res.status(400).json({ error: 'Invalid comment ID' });
        }
        
        // Optional: Check if comment exists before updating
        const { data: existingComment, error: checkError } = await supabase
            .from('live_post_comments')
            .select('id, user_name, user_email, content')
            .eq('id', commentId)
            .single();
        
        if (checkError || !existingComment) {
            return res.status(404).json({ error: 'Comment not found' });
        }
        
        // Update comment with admin reply
        const { data, error } = await supabase
            .from('live_post_comments')
            .update({
                admin_reply: admin_reply.trim(),
                admin_replied_at: new Date().toISOString(),
                admin_name: admin_name || 'Admin',
                admin_email: admin_email || null,
                status: 'approved' // Auto-approve when admin replies
            })
            .eq('id', commentId)
            .select()
            .single();
        
        if (error) {
            console.error('Update error:', error);
            return res.status(500).json({ error: error.message });
        }
        
        // Optional: Send email notification to commenter
        if (existingComment.user_email) {
            // You can integrate an email service here
            console.log(`Notification would be sent to ${existingComment.user_email}`);
        }
        
        return res.status(200).json({ 
            success: true,
            message: 'Admin reply added successfully',
            comment: {
                id: data.id,
                admin_reply: data.admin_reply,
                admin_replied_at: data.admin_replied_at,
                admin_name: data.admin_name
            }
        });
        
    } catch (error) {
        console.error('Unexpected error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}