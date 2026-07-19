// P:\Projects\trendlin\src\pages\api\admin\categories\index.ts
import type { APIRoute } from 'astro';

// ============================================
// HARDCODED CATEGORIES DATA (Fallback)
// ============================================
const ALL_CATEGORIES = [
  { name: 'Health & Wellness', icon: '🧘', slug: 'health-wellness', description: 'Your guide to holistic living. Discover expert advice on fitness, mental health, nutrition, and self-care practices for a balanced life.' },
  { name: 'Food & Dining', icon: '🍽️', slug: 'food-dining', description: 'Explore LA\'s vibrant food scene. From hidden gems to fine dining, we bring you honest reviews and culinary adventures.' },
  { name: 'Entertainment', icon: '🎬', slug: 'entertainment', description: 'Stay in the know with LA\'s entertainment scene. Movies, concerts, events, and the latest cultural happenings in the City of Angels.' },
  { name: 'Lifestyle', icon: '🌴', slug: 'lifestyle', description: 'Embrace the LA lifestyle. Discover wellness, home decor, local events, and everything that makes living in Los Angeles special.' },
  { name: 'Technology', icon: '💻', slug: 'technology', description: 'Stay ahead with the latest tech trends. Reviews, innovations, and digital insights shaping the future in LA and beyond.' },
  { name: 'Shopping', icon: '🛍️', slug: 'shopping', description: 'Find the best deals and shopping guides. From luxury boutiques to thrift stores, we help you shop smarter in LA.' },
  { name: 'Real Estate', icon: '🏠', slug: 'real-estate', description: 'Navigate LA\'s real estate market. Neighborhood guides, market trends, and tips for buyers, sellers, and renters.' },
  { name: 'Finance', icon: '💰', slug: 'finance', description: 'Smart money moves for LA residents. Investing, budgeting, and financial advice tailored to your life in Los Angeles.' },
  { name: 'Education', icon: '📚', slug: 'education', description: 'K-12, higher education, online learning, and professional development resources for lifelong learning.' },
  { name: 'Careers', icon: '💼', slug: 'careers', description: 'Job search strategies, career development, workplace trends, and professional growth opportunities.' },
  { name: 'Travel', icon: '✈️', slug: 'travel', description: 'Discover amazing destinations, transportation options, accommodation guides, and travel planning tips.' },
  { name: 'Sports', icon: '⚽', slug: 'sports', description: 'Team sports, individual athletics, fitness training, and esports coverage for sports enthusiasts.' },
  { name: 'Automotive', icon: '🚗', slug: 'automotive', description: 'Cars, motorcycles, electric vehicles, and automotive industry insights for vehicle enthusiasts.' },
  { name: 'Science', icon: '🔬', slug: 'science', description: 'Biology, chemistry, physics, space exploration, and environmental science discoveries.' },
  { name: 'Family', icon: '👨‍👩‍👧‍👦', slug: 'family', description: 'Parenting advice, pregnancy guidance, child development, and family life resources.' },
  { name: 'Pets', icon: '🐾', slug: 'pets', description: 'Pet care essentials, animal health, training tips, and adoption information for pet lovers.' },
  { name: 'Government', icon: '🏛️', slug: 'government', description: 'Federal, state, and local government services, policies, and citizen resources.' },
  { name: 'Legal', icon: '⚖️', slug: 'legal', description: 'Civil, criminal, family, business, and other legal information and resources.' },
  { name: 'Environment', icon: '🌍', slug: 'environment', description: 'Climate change, conservation, sustainability, and green living solutions for a better planet.' }
];

export const POST: APIRoute = async ({ request, locals }) => {
  const { DB } = locals.runtime.env;
  const data = await request.json();
  
  try {
    const { name, slug, icon, description, hero_image, is_active } = data;
    
    // Validate required fields
    if (!name || !slug) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Name and slug are required'
      }), { status: 400 });
    }
    
    // Check if slug already exists
    const existing = await DB.prepare(
      'SELECT id FROM categories WHERE slug = ?'
    ).bind(slug).first();
    
    if (existing) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Category with this slug already exists'
      }), { status: 400 });
    }
    
    // Insert new category
    const result = await DB.prepare(`
      INSERT INTO categories (name, slug, icon, description, is_active, created_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
    `).bind(name, slug, icon || null, description || null, is_active || 1).run();
    
    const categoryId = result.meta?.last_row_id;
    
    // Insert hero image if provided
    if (hero_image && categoryId) {
      await DB.prepare(`
        INSERT INTO category_hero (category_id, hero_image, is_active, created_at)
        VALUES (?, ?, 1, datetime('now'))
      `).bind(categoryId, hero_image).run();
    }
    
    return new Response(JSON.stringify({
      success: true,
      id: categoryId,
      message: 'Category created successfully'
    }));
    
  } catch (error) {
    console.error('Category creation error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Failed to create category'
    }), { status: 500 });
  }
};

export const GET: APIRoute = async ({ locals }) => {
  const { DB } = locals.runtime.env;
  
  try {
    // Get categories from database
    const result = await DB.prepare(`
      SELECT 
        c.*,
        ch.id as hero_id,
        ch.hero_image,
        ch.is_active as hero_active,
        COUNT(p.id) as post_count
      FROM categories c
      LEFT JOIN category_hero ch ON c.id = ch.category_id AND ch.is_active = 1
      LEFT JOIN posts p ON p.category = c.name AND p.is_draft = 0
      GROUP BY c.id
      ORDER BY c.name ASC
    `).all();
    
    const dbCategories = result.results || [];
    
    // Create a map of existing categories from DB
    const categoryMap = new Map();
    dbCategories.forEach(cat => {
      categoryMap.set(cat.name, cat);
    });
    
    // Merge with hardcoded categories to ensure all 19 exist
    const mergedCategories = ALL_CATEGORIES.map(hardcodedCat => {
      const existing = categoryMap.get(hardcodedCat.name);
      
      if (existing) {
        // Use DB data but ensure icon and description are correct
        return {
          ...existing,
          icon: existing.icon || hardcodedCat.icon,
          description: existing.description || hardcodedCat.description
        };
      } else {
        // Return hardcoded data with default values
        return {
          ...hardcodedCat,
          id: 0,
          hero_id: null,
          hero_image: null,
          hero_active: 0,
          post_count: 0,
          is_active: 1
        };
      }
    });
    
    return new Response(JSON.stringify({
      success: true,
      categories: mergedCategories,
      total: mergedCategories.length
    }));
    
  } catch (error) {
    console.error('Categories fetch error:', error);
    
    // Return hardcoded data as fallback
    const fallbackCategories = ALL_CATEGORIES.map(cat => ({
      ...cat,
      id: 0,
      hero_id: null,
      hero_image: null,
      hero_active: 0,
      post_count: 0,
      is_active: 1
    }));
    
    return new Response(JSON.stringify({
      success: true,
      categories: fallbackCategories,
      total: fallbackCategories.length,
      fallback: true
    }));
  }
};