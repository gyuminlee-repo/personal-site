// POST /api/post/logout — clear session cookie.
import { serializeCookie } from '../../../src/lib/auth';

export const onRequestPost: PagesFunction = async () => {
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
