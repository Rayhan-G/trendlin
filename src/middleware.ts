// ============================================
// AUTH MIDDLEWARE - Protect Routes
// ============================================

import { defineMiddleware } from 'astro/middleware';
import { getCurrentUser } from './lib/auth.js';

export const onRequest = defineMiddleware(async (context, next) => {
  const { request, locals, redirect } = context;
  const url = new URL(request.url);
  
  // Skip auth for login page and API routes
  const publicPaths = ['/admin/login', '/api/auth/login', '/api/auth/logout', '/_astro', '/favicon.ico'];
  if (publicPaths.some(path => url.pathname.startsWith(path)) || url.pathname === '/admin/') {
    return next();
  }
  
  // Check auth for admin routes
  if (url.pathname.startsWith('/admin')) {
    const { DB } = locals.runtime.env;
    const user = await getCurrentUser(request, DB);
    
    if (!user) {
      return redirect('/admin/login?error=Please login first');
    }
    
    locals.user = user;
  }
  
  return next();
});