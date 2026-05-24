#!/usr/bin/env bun
// One-shot CLI for owner: takes password from stdin (or prompt), prints
// PASSWORD_HASH + PASSWORD_SALT + COOKIE_SECRET ready to paste into the
// Cloudflare Pages environment variables UI.
//
// Usage:
//   bun scripts/hash_password.ts            # interactive prompt
//   echo 'MyPassword123' | bun scripts/...  # piped (test only)

import { hashPassword } from '../src/lib/auth';

function uuidHex(): string {
  return crypto.randomUUID().replace(/-/g, '');
}

async function readPasswordFromStdin(): Promise<string | null> {
  // Bun streams stdin only when not a TTY. If TTY, fall back to `prompt`.
  if (process.stdin.isTTY) {
    const v = prompt('Password (12+ chars): ');
    return v ?? null;
  }
  const chunks: Uint8Array[] = [];
  for await (const chunk of process.stdin as unknown as AsyncIterable<Uint8Array>) {
    chunks.push(chunk);
  }
  let total = 0;
  for (const c of chunks) total += c.length;
  const buf = new Uint8Array(total);
  let off = 0;
  for (const c of chunks) {
    buf.set(c, off);
    off += c.length;
  }
  return new TextDecoder().decode(buf).replace(/\r?\n$/, '');
}

const password = await readPasswordFromStdin();
if (!password || password.length < 12) {
  console.error('Password must be at least 12 chars.');
  process.exit(1);
}

const salt = uuidHex() + uuidHex(); // 64 hex chars
const hash = await hashPassword(password, salt);
const cookieSecret = uuidHex() + uuidHex(); // 64 hex chars

console.log('# Add the following to Cloudflare Pages → Settings → Environment variables');
console.log(`PASSWORD_HASH=${hash}`);
console.log(`PASSWORD_SALT=${salt}`);
console.log(`COOKIE_SECRET=${cookieSecret}`);
console.log('');
console.log('# Plus owner-supplied:');
console.log('# GITHUB_PAT=<fine-grained PAT with contents:write on personal-site repo>');
console.log('# GITHUB_REPO=gyuminlee-repo/personal-site');
