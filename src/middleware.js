// middleware.js
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function middleware(request) {
  const sessionToken = request.cookies.get('session_token')?.value
  
  if (sessionToken) {
    // Check if session is valid
    const { data: session, error } = await supabase
      .from('user_sessions')
      .select('expires_at')
      .eq('token', sessionToken)
      .single()
    
    if (error || !session || new Date(session.expires_at) < new Date()) {
      // Invalid session, clear cookie
      const response = NextResponse.next()
      response.cookies.delete('session_token')
      response.cookies.delete('session_expires')
      return response
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
}