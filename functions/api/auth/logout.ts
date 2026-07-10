export async function onRequest(context: any) {
  // Clear the session cookie and redirect to login
  const response = new Response(null, {
    status: 302,
    headers: {
      'Location': '/admin',
      'Set-Cookie': 'session=; HttpOnly; Secure; Path=/; Max-Age=0; SameSite=Lax'
    }
  });
  
  return response;
}