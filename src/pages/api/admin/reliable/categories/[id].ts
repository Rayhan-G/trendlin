// src/pages/api/admin/reliable/categories/[id].ts
import type { APIRoute } from 'astro';

export const prerender = false;

// GET - Get single category
export const GET: APIRoute = async ({ params, locals }) => {
  try {
    const db = locals.runtime.env.DB;
    const id = parseInt(params.id);

    if (!id) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid ID'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    const result = await db.prepare(`
      SELECT 
        id,
        name,
        slug,
        description,
        icon,
        display_order,
        is_active,
        created_at,
        updated_at,
        (SELECT COUNT(*) FROM reliable_subcategories WHERE category_id = c.id AND is_active = 1) as subcategory_count
      FROM reliable_categories c
      WHERE id = ?
    `).bind(id).first();

    if (!result) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Category not found'
      }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      data: result
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch category'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};

// PUT - Update category
export const PUT: APIRoute = async ({ params, request, locals }) => {
  try {
    const db = locals.runtime.env.DB;
    const id = parseInt(params.id);
    const data = await request.json();

    if (!id) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid ID'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    const { name, slug, description, icon, display_order, is_active } = data;

    // Check if category exists
    const existing = await db.prepare(`
      SELECT id FROM reliable_categories WHERE id = ?
    `).bind(id).first();

    if (!existing) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Category not found'
      }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Check slug uniqueness
    if (slug) {
      const slugCheck = await db.prepare(`
        SELECT id FROM reliable_categories WHERE slug = ? AND id != ?
      `).bind(slug, id).first();

      if (slugCheck) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Category with this slug already exists'
        }), {
          status: 409,
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }
    }

    await db.prepare(`
      UPDATE reliable_categories SET
        name = COALESCE(?, name),
        slug = COALESCE(?, slug),
        description = COALESCE(?, description),
        icon = COALESCE(?, icon),
        display_order = COALESCE(?, display_order),
        is_active = COALESCE(?, is_active),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      name || null,
      slug || null,
      description || null,
      icon || null,
      display_order !== undefined ? display_order : null,
      is_active !== undefined ? is_active : null,
      id
    ).run();

    return new Response(JSON.stringify({
      success: true,
      message: 'Category updated successfully'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error updating category:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to update category'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};

// DELETE - Delete category
export const DELETE: APIRoute = async ({ params, locals }) => {
  try {
    const db = locals.runtime.env.DB;
    const id = parseInt(params.id);

    if (!id) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid ID'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Check if category exists
    const existing = await db.prepare(`
      SELECT id FROM reliable_categories WHERE id = ?
    `).bind(id).first();

    if (!existing) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Category not found'
      }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Check if category has subcategories
    const subcatCheck = await db.prepare(`
      SELECT COUNT(*) as count FROM reliable_subcategories WHERE category_id = ? AND is_active = 1
    `).bind(id).first();

    if (subcatCheck && subcatCheck.count > 0) {
      return new Response(JSON.stringify({
        success: false,
        error: `Cannot delete category with ${subcatCheck.count} existing subcategories. Delete subcategories first.`
      }), {
        status: 409,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Soft delete
    await db.prepare(`
      UPDATE reliable_categories SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).bind(id).run();

    return new Response(JSON.stringify({
      success: true,
      message: 'Category deleted successfully'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to delete category'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};