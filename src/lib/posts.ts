// ============================================
// Posts Library - Database Operations
// ============================================

export interface Post {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  featured_image: string | null;
  category: string | null;
  tags: string | null;
  published_at: string | null;
  updated_at: string | null;
  is_draft: boolean;
  views: number;
  created_at: string;
}

export async function getPosts(env: any, publishedOnly: boolean = true) {
  const query = publishedOnly 
    ? 'SELECT * FROM posts WHERE is_draft = 0 ORDER BY published_at DESC'
    : 'SELECT * FROM posts ORDER BY created_at DESC';
  
  const result = await env.DB.prepare(query).all();
  return result.results as Post[];
}

export async function getPostBySlug(env: any, slug: string) {
  const result = await env.DB
    .prepare('SELECT * FROM posts WHERE slug = ?')
    .bind(slug)
    .first();
  return result as Post | null;
}

export async function createPost(env: any, postData: any) {
  const {
    slug, title, excerpt, content, category, tags, 
    featured_image, is_draft = 1, published_at = null
  } = postData;

  const result = await env.DB
    .prepare(`
      INSERT INTO posts (
        slug, title, excerpt, content, category, tags, 
        featured_image, is_draft, published_at, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `)
    .bind(
      slug, 
      title, 
      excerpt || '', 
      content, 
      category || '', 
      tags || '', 
      featured_image || '', 
      is_draft,
      published_at
    )
    .run();

  return result;
}

export async function updatePost(env: any, id: number, postData: any) {
  const {
    slug, title, excerpt, content, category, tags, 
    featured_image, is_draft = 1
  } = postData;

  const result = await env.DB
    .prepare(`
      UPDATE posts 
      SET slug = ?, title = ?, excerpt = ?, content = ?, category = ?, 
          tags = ?, featured_image = ?, is_draft = ?, updated_at = datetime('now')
      WHERE id = ?
    `)
    .bind(
      slug, 
      title, 
      excerpt || '', 
      content, 
      category || '', 
      tags || '', 
      featured_image || '', 
      is_draft, 
      id
    )
    .run();

  return result;
}

export async function deletePost(env: any, id: number) {
  const result = await env.DB
    .prepare('DELETE FROM posts WHERE id = ?')
    .bind(id)
    .run();
  return result;
}