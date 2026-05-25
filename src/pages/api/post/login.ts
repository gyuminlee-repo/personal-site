// POST /api/post/login — verify password, set session cookie.
// Astro endpoint (migrated from Pages Function). Requires hybrid output + prerender=false.
// Assumptions:
// - In-memory rate limit (per-isolate). KV upgrade is v2.
// - CSRF cookie must equal body.csrf (constant-time compare).
// - On success, clears csrf cookie and sets session cookie (24h).
import type { APIRoute } from 'astro';
import {
  verifyPassword,
  signSession,
  safeCompare,
  serializeCookie,
  parseCookie,
} from '../../../lib/auth';

export const prerender = false;

interface Env {
  PASSWORD_HASH: string;
  PASSWORD_SALT: string;
  COOKIE_SECRET: string;
}

const attempts = new Map<string, { count: number; reset: number }>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

function rateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || entry.reset < now) {
    attempts.set(ip, { count: 1, reset: now + WINDOW_MS });
    return { allowed: true, remaining: MAX_ATTEMPTS - 1 };
  }
  if (entry.count >= MAX_ATTEMPTS) return { allowed: false, remaining: 0 };
  entry.count += 1;
  return { allowed: true, remaining: MAX_ATTEMPTS - entry.count };
}

export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as any).runtime.env as Env;

  const ip = request.headers.get('cf-connecting-ip') ?? 'unknown';
  const rate = rateLimit(ip);
  if (!rate.allowed) {
    return Response.json(
      { error: 'Too many attempts. Try again in 15 minutes.' },
      { status: 429 },
    );
  }

  let body: { password?: string; csrf?: string };
  try {
    body = await request.json();
  } catch {
    return new Response('Bad JSON', { status: 400 });
  }
  if (!body.password || !body.csrf) {
    return new Response('Missing fields', { status: 400 });
  }

  const csrfCookie = parseCookie(request.headers.get('cookie'), 'csrf');
  if (!csrfCookie || !safeCompare(csrfCookie, body.csrf)) {
    return Response.json({ error: 'CSRF failed' }, { status: 403 });
  }

  const ok = await verifyPassword(body.password, env.PASSWORD_SALT, env.PASSWORD_HASH);
  if (!ok) {
    return Response.json(
      { error: 'Invalid password', remaining: rate.remaining },
      { status: 401 },
    );
  }

  const session = await signSession(env.COOKIE_SECRET, SESSION_TTL_MS);
  const headers = new Headers({ 'content-type': 'application/json' });
  headers.append(
    'Set-Cookie',
    serializeCookie('session', session, {
      maxAge: SESSION_TTL_MS / 1000,
      httpOnly: true,
      secure: true,
      sameSite: 'Lax',
    }),
  );
  headers.append(
    'Set-Cookie',
    serializeCookie('csrf', '', {
      maxAge: 0,
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
    }),
  );
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
};
