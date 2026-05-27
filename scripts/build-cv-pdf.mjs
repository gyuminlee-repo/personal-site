#!/usr/bin/env node
// Build CV PDFs from /cv (EN) and /ko/cv pages using Puppeteer.
//
// Usage:
//   node scripts/build-cv-pdf.mjs              # EN only (default)
//   node scripts/build-cv-pdf.mjs --en         # EN only
//   node scripts/build-cv-pdf.mjs --ko         # KO only
//   node scripts/build-cv-pdf.mjs --all        # both
//
// Always runs `astro build` fresh, then `astro preview` on a random port,
// loads each /cv URL and emits a PDF into ./public/.

import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { createReadStream, statSync, existsSync } from 'node:fs';
import { resolve, dirname, join, extname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// ---- CLI parsing ------------------------------------------------------------
const args = process.argv.slice(2);
const flagAll = args.includes('--all');
const flagKo = args.includes('--ko') || flagAll;
const flagEn = args.includes('--en') || flagAll || (!flagKo && !flagAll);

const targets = [];
if (flagEn) {
  targets.push({
    lang: 'en',
    path: '/cv',
    out: resolve(ROOT, 'public/Gyumin_Lee_CV.pdf')
  });
}
if (flagKo) {
  targets.push({
    lang: 'ko',
    path: '/ko/cv',
    out: resolve(ROOT, 'public/이규민_CV.pdf')
  });
}

console.log(`[build-cv-pdf] targets: ${targets.map((t) => t.lang).join(', ')}`);

// ---- Helpers ----------------------------------------------------------------
function runOnce(cmd, argv, opts = {}) {
  return new Promise((resolveP, rejectP) => {
    const child = spawn(cmd, argv, { cwd: ROOT, stdio: 'inherit', ...opts });
    child.on('exit', (code) => {
      if (code === 0) resolveP();
      else rejectP(new Error(`${cmd} ${argv.join(' ')} exited with code ${code}`));
    });
    child.on('error', rejectP);
  });
}

// Minimal static file server for dist/.
// astro preview is not available with @astrojs/cloudflare, so serve the
// prerendered output directly. /cv and /ko/cv are static HTML files.
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml',
  '.pdf': 'application/pdf'
};

function startPreview() {
  const distDir = resolve(ROOT, 'dist');
  if (!existsSync(distDir)) {
    return Promise.reject(new Error(`dist/ not found at ${distDir}`));
  }

  return new Promise((resolveP, rejectP) => {
    const server = createServer((req, res) => {
      try {
        const url = new URL(req.url || '/', 'http://localhost');
        let pathname = decodeURIComponent(url.pathname);
        // Strip leading slash, normalize, prevent traversal
        pathname = normalize(pathname).replace(/^\/+/, '');
        if (pathname.startsWith('..')) {
          res.writeHead(403); res.end('forbidden'); return;
        }
        let filePath = join(distDir, pathname);
        // Directory → index.html
        try {
          const st = statSync(filePath);
          if (st.isDirectory()) {
            filePath = join(filePath, 'index.html');
          }
        } catch {
          // Try appending /index.html
          const alt = join(filePath, 'index.html');
          if (existsSync(alt)) {
            filePath = alt;
          } else if (existsSync(filePath + '.html')) {
            filePath = filePath + '.html';
          }
        }
        if (!existsSync(filePath)) {
          res.writeHead(404); res.end('not found: ' + pathname); return;
        }
        const ext = extname(filePath).toLowerCase();
        const ctype = MIME[ext] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': ctype, 'Cache-Control': 'no-store' });
        createReadStream(filePath).pipe(res);
      } catch (e) {
        res.writeHead(500); res.end('server error: ' + (e && e.message));
      }
    });

    server.on('error', rejectP);
    server.listen(0, '127.0.0.1', () => {
      const addr = server.address();
      const port = typeof addr === 'object' && addr ? addr.port : 0;
      resolveP({ server, port, baseUrl: `http://127.0.0.1:${port}` });
    });
  });
}

function stopPreview(handle) {
  return new Promise((resolveP) => {
    if (!handle || !handle.server) { resolveP(); return; }
    handle.server.close(() => resolveP());
    // Force resolve after 2s if close hangs on keep-alive sockets
    setTimeout(() => resolveP(), 2000);
  });
}

async function getPdfPageCount(filePath) {
  // Lightweight: count /Type /Page (not /Pages) occurrences in raw bytes.
  // Good enough for sanity check; not a real parser.
  const { readFileSync } = await import('node:fs');
  const buf = readFileSync(filePath);
  const text = buf.toString('latin1');
  const matches = text.match(/\/Type\s*\/Page(?!s)/g);
  return matches ? matches.length : -1;
}

// ---- Main -------------------------------------------------------------------
async function main() {
  // 1. Build site fresh
  console.log('[build-cv-pdf] running `bun run build`…');
  await runOnce('bun', ['run', 'build']);

  // 2. Start preview (static server over dist/)
  console.log('[build-cv-pdf] starting static preview server over dist/…');
  const preview = await startPreview();
  console.log(`[build-cv-pdf] preview ready on ${preview.baseUrl}`);

  let exitCode = 0;
  try {
    // 3. Launch puppeteer
    const puppeteer = (await import('puppeteer')).default;
    const browser = await puppeteer.launch({ headless: true });

    try {
      for (const t of targets) {
        const url = `${preview.baseUrl}${t.path}`;
        console.log(`[build-cv-pdf] rendering ${url} → ${t.out}`);

        // Notify overwrite
        try {
          statSync(t.out);
          console.log(`[build-cv-pdf] Overwriting ${t.out.replace(ROOT + '/', '')}`);
        } catch { /* file did not exist */ }

        const page = await browser.newPage();
        await page.emulateMediaType('print');
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 120_000 });
        await page.pdf({
          path: t.out,
          format: 'A4',
          printBackground: true,
          margin: { top: '15mm', right: '15mm', bottom: '15mm', left: '15mm' },
          preferCSSPageSize: false
        });
        await page.close();

        const sz = statSync(t.out).size;
        const pages = await getPdfPageCount(t.out);
        console.log(`[build-cv-pdf] ${t.lang}: ${(sz / 1024).toFixed(1)} KB, ${pages} pages`);
      }
    } finally {
      await browser.close();
    }
  } catch (err) {
    console.error('[build-cv-pdf] ERROR:', err);
    exitCode = 1;
  } finally {
    console.log('[build-cv-pdf] stopping preview…');
    await stopPreview(preview);
  }

  process.exit(exitCode);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
