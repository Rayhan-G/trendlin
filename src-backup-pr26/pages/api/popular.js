import { supabase, isSupabaseAvailable } from '@/lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  
  try {
    // Try to get real data from Supabase
    let posts = []
    
    if (isSupabaseAvailable()) {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('id', { ascending: false })
        .limit(20)
      
      if (!error && data) {
        posts = data.map(post => ({
          ...post,
          view_count: Math.floor(Math.random() * 10000) + 1000 // Temp random views
        }))
      }
    }
    
    // If no posts in DB, return sample data
    if (posts.length === 0) {
      posts = [
        {
          id: 1,
          title: "10 Morning Habits That Transform Your Health",
          slug: "morning-habits-transform-health",
          category: "Health",
          excerpt: "Discover the morning routines that can boost your energy.",
          image: "/images/placeholder.jpg",
          view_count: 28473
        },
        {
          id: 2,
          title: "Smart Investment Strategies for Beginners",
          slug: "smart-investment-strategies-beginners",
          category: "Wealth",
          excerpt: "Learn the fundamentals of investing.",
          image: "/images/placeholder.jpg",
          view_count: 42156
        },
        {
          id: 3,
          title: "Latest Tech Gadgets That Will Change Your Life",
          slug: "latest-tech-gadgets-change-life",
          category: "Tech",
          excerpt: "Explore innovations reshaping our daily lives.",
          image: "/images/placeholder.jpg",
          view_count: 56789
        },
        {
          id: 4,
          title: "Personal Growth: How to Achieve Your Goals",
          slug: "personal-growth-achieve-goals",
          category: "Growth",
          excerpt: "Proven techniques to reach your full potential.",
          image: "/images/placeholder.jpg",
          view_count: 19342
        },
        {
          id: 5,
          title: "Top Streaming Services Ranked",
          slug: "top-streaming-services-ranked",
          category: "Entertainment",
          excerpt: "Compare the best streaming platforms.",
          image: "/images/placeholder.jpg",
          view_count: 31267
        }
      ]
    }
    
    return res.status(200).json({
      success: true,
      posts: posts
    })
    
  } catch (error) {
    console.error('API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}