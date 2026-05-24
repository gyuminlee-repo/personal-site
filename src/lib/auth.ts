// Auth primitives for owner-only post editor.
// All async ops use Web Crypto API (crypto.subtle) so they run on both
// Node (Astro SSR) and Cloudflare Workers (Pages Functions).
//
// Assumptions:
// - PBKDF2-SHA256, 100_000 iterations, 256-bit output.
// - Cookie format: <b64url(JSON{exp,iat})>.<b64url(HMAC-SHA256)>; HS256.
// - CSRF token: 32 random bytes, lowercase hex.
// - safeCompare returns false if lengths differ (length is not secret here).
// - serializeCookie defaults: HttpOnly, Secure, SameSite=Lax, Path=/.
// - parseCookie tolerates surrounding whitespace and decodeURIComponent values.

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

// ─── base64url helpers ───────────────────────────────────────────────────

export function b64uEncode(bytes: Uint8Array): string {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  const b64 = btoa(bin);
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function b64uDecode(s: string): Uint8Array {
  const padLen = (4 - (s.length % 4)) % 4;
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat(padLen);
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

// ─── PBKDF2 password hashing ─────────────────────────────────────────────

const PBKDF2_ITERATIONS = 100_000;
const PBKDF2_BITS = 256;

async function pbkdf2(password: string, salt: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    'raw',
    textEncoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits'],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: textEncoder.encode(salt),
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    key,
    PBKDF2_BITS,
  );
  return new Uint8Array(bits);
}

export async function hashPassword(password: string, salt: string): Promise<string> {
  const bits = await pbkdf2(password, salt);
  return b64uEncode(bits);
}

export async function verifyPassword(
  password: string,
  salt: string,
  expectedHashB64u: string,
): Promise<boolean> {
  const actual = await hashPassword(password, salt);
  return safeCompare(actual, expectedHashB64u);
}

// ─── HMAC-SHA256 signed session cookie ───────────────────────────────────

interface SessionPayload {
  iat: number; // ms epoch when issued
  exp: number; // ms epoch when expires
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    textEncoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

async function hmacSign(secret: string, message: string): Promise<Uint8Array> {
  const key = await hmacKey(secret);
  const sig = await crypto.subtle.sign('HMAC', key, textEncoder.encode(message));
  return new Uint8Array(sig);
}

export async function signSession(secret: string, ttlMs: number): Promise<string> {
  const now = Date.now();
  const payload: SessionPayload = { iat: now, exp: now + ttlMs };
  const payloadB64u = b64uEncode(textEncoder.encode(JSON.stringify(payload)));
  const sig = await hmacSign(secret, payloadB64u);
  return `${payloadB64u}.${b64uEncode(sig)}`;
}

export async function verifySession(
  secret: string,
  cookieValue: string | null | undefined,
): Promise<boolean> {
  if (!cookieValue) return false;
  const dot = cookieValue.indexOf('.');
  if (dot <= 0 || dot === cookieValue.length - 1) return false;
  const payloadB64u = cookieValue.slice(0, dot);
  const sigB64u = cookieValue.slice(dot + 1);

  // Constant-time signature check via HMAC compute + safeCompare on b64u sig.
  let expectedSig: Uint8Array;
  try {
    expectedSig = await hmacSign(secret, payloadB64u);
  } catch {
    return false;
  }
  if (!safeCompare(b64uEncode(expectedSig), sigB64u)) return false;

  let payload: SessionPayload;
  try {
    payload = JSON.parse(textDecoder.decode(b64uDecode(payloadB64u))) as SessionPayload;
  } catch {
    return false;
  }
  if (typeof payload.exp !== 'number') return false;
  return payload.exp > Date.now();
}

// ─── CSRF + constant-time compare ────────────────────────────────────────

export function generateCSRF(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0');
  }
  return hex;
}

export function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

// ─── Cookie serialize / parse ────────────────────────────────────────────

export interface CookieOpts {
  maxAge: number; // seconds
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'Lax' | 'Strict' | 'None';
  path?: string;
}

export function serializeCookie(name: string, value: string, opts: CookieOpts): string {
  const parts = [`${name}=${encodeURIComponent(value)}`];
  parts.push(`Max-Age=${Math.max(0, Math.floor(opts.maxAge))}`);
  parts.push(`Path=${opts.path ?? '/'}`);
  if (opts.httpOnly !== false) parts.push('HttpOnly');
  if (opts.secure !== false) parts.push('Secure');
  parts.push(`SameSite=${opts.sameSite ?? 'Lax'}`);
  return parts.join('; ');
}

export function parseCookie(
  cookieHeader: string | null | undefined,
  name: string,
): string | null {
  if (!cookieHeader) return null;
  const pairs = cookieHeader.split(';');
  for (const pair of pairs) {
    const eq = pair.indexOf('=');
    if (eq < 0) continue;
    const k = pair.slice(0, eq).trim();
    if (k !== name) continue;
    const v = pair.slice(eq + 1).trim();
    try {
      return decodeURIComponent(v);
    } catch {
      return v;
    }
  }
  return null;
}
