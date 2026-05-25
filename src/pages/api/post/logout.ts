// POST /api/post/logout — clear session cookie.
// Astro endpoint (migrated from Pages Function).
import type { APIRoute } from 'astro';
import { serializeCookie } from '../../../lib/auth';

export const prerender = false;

export const POST: APIRoute = async () => {
  const headers = new Headers({ 'content-type': 'application/json' });
  headers.append(
    'Set-Cookie',
    serializeCookie('session', '', {
      maxAge: 0,
      httpOnly: true,
      secure: true,
      sameSite: 'Lax',
    }),
  );
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
};
