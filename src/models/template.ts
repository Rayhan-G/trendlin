// /src/models/template.ts

export interface Template {
  id: number;
  name: string;
  category: string;
  content: string;
  description: string | null;
  thumbnail_url: string | null;
  is_active: number;
  usage_count: number;
  created_at: string;
  updated_at: string;
  created_by: number | null;
}

// Get all templates by category
export async function getTemplatesByCategory(env: any, category: string) {
  const result = await env.DB
    .prepare(`
      SELECT id, name, category, content, description, thumbnail_url, usage_count 
      FROM templates 
      WHERE category = ? AND is_active = 1 
      ORDER BY name ASC
    `)
    .bind(category)
    .all();
  
  return result.results as Template[];
}

// Get all categories that have templates
export async function getCategoriesWithTemplates(env: any) {
  const result = await env.DB
    .prepare(`
      SELECT DISTINCT category 
      FROM templates 
      WHERE is_active = 1 
      ORDER BY category ASC
    `)
    .all();
  
  return result.results.map(row => (row as any).category) as string[];
}

// Get a single template by ID
export async function getTemplateById(env: any, id: number) {
  const result = await env.DB
    .prepare('SELECT * FROM templates WHERE id = ?')
    .bind(id)
    .first();
  
  return result as Template | null;
}

// Create a new template
export async function createTemplate(env: any, templateData: any) {
  const {
    name, category, content, description = '', 
    thumbnail_url = '', is_active = 1, created_by = null
  } = templateData;

  const result = await env.DB
    .prepare(`
      INSERT INTO templates (name, category, content, description, thumbnail_url, is_active, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
    .bind(name, category, content, description, thumbnail_url, is_active, created_by)
    .run();

  return result;
}

// Update a template
export async function updateTemplate(env: any, id: number, templateData: any) {
  const {
    name, category, content, description, thumbnail_url, is_active
  } = templateData;

  const result = await env.DB
    .prepare(`
      UPDATE templates 
      SET name = ?, category = ?, content = ?, description = ?, 
          thumbnail_url = ?, is_active = ?, updated_at = datetime('now')
      WHERE id = ?
    `)
    .bind(name, category, content, description || '', thumbnail_url || '', is_active, id)
    .run();

  return result;
}

// Delete a template
export async function deleteTemplate(env: any, id: number) {
  const result = await env.DB
    .prepare('DELETE FROM templates WHERE id = ?')
    .bind(id)
    .run();
  
  return result;
}

// Increment usage count for a template
export async function incrementTemplateUsage(env: any, id: number) {
  const result = await env.DB
    .prepare(`
      UPDATE templates 
      SET usage_count = usage_count + 1, updated_at = datetime('now')
      WHERE id = ?
    `)
    .bind(id)
    .run();
  
  return result;
}