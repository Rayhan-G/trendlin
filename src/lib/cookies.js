// lib/cookies.js
import cookie from 'cookie';

export function parseCookies(req) {
  // For API routes
  if (req) {
    return cookie.parse(req.headers.cookie || '');
  }
  
  // For client-side
  if (typeof document !== 'undefined') {
    return document.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {});
  }
  
  return {};
}