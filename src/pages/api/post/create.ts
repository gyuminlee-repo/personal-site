// POST /api/post/create — owner-only. Verifies session + CSRF + Referer,
// validates payload, commits markdown (+ optional images) to GitHub via Trees API.
// Returns commit SHA + post URL.
// Astro endpoint (migrated from Pages Function).
//
// Assumptions:
// - Body schema: { title, body, tags[], slug?, draft, lang, csrf, cover_image_b64?, cover_image_name?, attachments?[] }
// - Limits: title 1-200, body 1-50000, tags ≤10, attachments ≤4. Image bytes not re-checked.
// - Slug auto-prefix: YYMMDD-<slugified-title>. Conflict suffix -2..-9.
// - GitHub repo + PAT come from env. Author/committer is the editor bot.
import type { APIRoute } from 'astro';
import {
  verifySession,
  parseCookie,
  safeCompare,
} from '../../../lib/auth';

export const prerender = false;

interface Env {
  COOKIE_SECRET: string;
  GITHUB_PAT: string;
  GITHUB_REPO: string;
  SITE_ORIGIN?: string;
}

interface AttachmentInput {
  name?: string;
  b64?: string;
}

interface CreateBody {
  title?: unknown;
  body?: unknown;
  tags?: unknown;
  slug?: unknown;
  draft?: unknown;
  lang?: unknown;
  csrf?: unknown;
  cover_image_b64?: unknown;
  cover_image_name?: unknown;
  attachments?: unknown;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^\w가-힣\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 60);
}

function cleanFilename(name: string): string {
  return name.replace(/[^\w.-]/g, '_').slice(0, 100);
}

export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as any).runtime.env as Env;

  // 1. Session
  const session = parseCookie(request.headers.get('cookie'), 'session');
  if (!(await verifySession(env.COOKIE_SECRET, session))) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Parse body
  let body: CreateBody;
  try {
    body = (await request.json()) as CreateBody;
  } catch {
    return new Response('Bad JSON', { status: 400 });
  }

  // 3. CSRF
  const csrfCookie = parseCookie(request.headers.get('cookie'), 'csrf');
  if (
    !csrfCookie ||
    typeof body.csrf !== 'string' ||
    !safeCompare(csrfCookie, body.csrf)
  ) {
    return Response.json({ error: 'CSRF failed' }, { status: 403 });
  }

  // 4. Referer same-origin (only if SITE_ORIGIN provided)
  if (env.SITE_ORIGIN) {
    const referer = request.headers.get('referer') ?? '';
    if (!referer.startsWith(env.SITE_ORIGIN)) {
      return Response.json({ error: 'Bad referer' }, { status: 403 });
    }
  }

  // 5. Validate
  const title = typeof body.title === 'string' ? body.title : '';
  const postBody = typeof body.body === 'string' ? body.body : '';
  if (title.length < 1 || title.length > 200) {
    return new Response('Bad title', { status: 400 });
  }
  if (postBody.length < 1 || postBody.length > 50_000) {
    return new Response('Bad body', { status: 400 });
  }
  const safeTags: string[] = Array.isArray(body.tags)
    ? body.tags
        .filter((t): t is string => typeof t === 'string' && t.length <= 50)
        .slice(0, 10)
    : [];
  const isDraft = Boolean(body.draft);
  const langSafe: 'en' | 'ko' = body.lang === 'en' ? 'en' : 'ko';
  const coverB64 =
    typeof body.cover_image_b64 === 'string' ? body.cover_image_b64 : '';
  const coverName =
    typeof body.cover_image_name === 'string'
      ? cleanFilename(body.cover_image_name)
      : '';
  const attachmentsIn: AttachmentInput[] = Array.isArray(body.attachments)
    ? (body.attachments as AttachmentInput[]).slice(0, 4)
    : [];

  // 6. Slug
  const dateIso = new Date().toISOString();
  const datePrefix = dateIso.slice(2, 10).replace(/-/g, ''); // YYMMDD
  const explicitSlug =
    typeof body.slug === 'string' && body.slug.trim().length > 0
      ? slugify(body.slug)
      : '';
  let slug = explicitSlug || slugify(title) || datePrefix;
  if (!slug.startsWith(datePrefix)) slug = `${datePrefix}-${slug}`;

  // 7. GitHub API setup
  const [repoOwner, repoName] = env.GITHUB_REPO.split('/');
  if (!repoOwner || !repoName) {
    return Response.json(
      { error: 'GITHUB_REPO env malformed' },
      { status: 500 },
    );
  }
  const apiBase = `https://api.github.com/repos/${repoOwner}/${repoName}`;
  const ghHeaders: HeadersInit = {
    Authorization: `Bearer ${env.GITHUB_PAT}`,
    Accept: 'application/vnd.github+json',
    'User-Agent': 'personal-site-editor',
  };

  // 8. Get base ref
  const refRes = await fetch(`${apiBase}/git/ref/heads/main`, {
    headers: ghHeaders,
  });
  if (!refRes.ok) {
    return Response.json(
      { error: 'GitHub ref fetch failed', status: refRes.status },
      { status: 502 },
    );
  }
  const ref = (await refRes.json()) as { object: { sha: string } };
  const baseSha = ref.object.sha;
  const baseCommitRes = await fetch(`${apiBase}/git/commits/${baseSha}`, {
    headers: ghHeaders,
  });
  const baseCommit = (await baseCommitRes.json()) as {
    tree: { sha: string };
  };
  const baseTreeSha = baseCommit.tree.sha;

  // 9. Slug conflict — append -2, -3 ... until path is free.
  let mdPath = `src/content/posts/${slug}.md`;
  for (let i = 1; i < 10; i++) {
    const headRes = await fetch(`${apiBase}/contents/${mdPath}?ref=main`, {
      headers: ghHeaders,
    });
    if (headRes.status === 404) break;
    const candidate = `${slug.replace(/-\d+$/, '')}-${i + 1}`;
    mdPath = `src/content/posts/${candidate}.md`;
    if (i === 9) slug = candidate;
    else slug = candidate;
  }

  // 10. Build markdown
  const tagsYaml = safeTags
    .map((t) => `  - "${t.replace(/"/g, '\\"')}"`)
    .join('\n');
  const coverPath = coverB64
    ? `/images/posts/${slug}/${coverName || 'cover.png'}`
    : '';
  const fmLines = [
    '---',
    `title: "${title.replace(/"/g, '\\"')}"`,
    `date: ${dateIso}`,
    `slug: "${slug}"`,
    safeTags.length ? `tags:\n${tagsYaml}` : 'tags: []',
    `draft: ${isDraft}`,
  ];
  if (coverPath) fmLines.push(`cover_image: "${coverPath}"`);
  fmLines.push('source: "web"');
  fmLines.push(`lang: "${langSafe}"`);
  fmLines.push('---', '', postBody, '');
  const fm = fmLines.join('\n');

  // 11. Create blobs
  async function createBlob(
    content: string,
    encoding: 'utf-8' | 'base64',
  ): Promise<string> {
    const res = await fetch(`${apiBase}/git/blobs`, {
      method: 'POST',
      headers: { ...ghHeaders, 'content-type': 'application/json' },
      body: JSON.stringify({ content, encoding }),
    });
    if (!res.ok) {
      throw new Error(`blob create failed ${res.status}`);
    }
    const d = (await res.json()) as { sha: string };
    return d.sha;
  }

  const treeEntries: Array<{
    path: string;
    mode: '100644';
    type: 'blob';
    sha: string;
  }> = [];
  try {
    treeEntries.push({
      path: mdPath,
      mode: '100644',
      type: 'blob',
      sha: await createBlob(fm, 'utf-8'),
    });
    if (coverB64) {
      const name = coverName || 'cover.png';
      treeEntries.push({
        path: `public/images/posts/${slug}/${name}`,
        mode: '100644',
        type: 'blob',
        sha: await createBlob(coverB64, 'base64'),
      });
    }
    for (const a of attachmentsIn) {
      if (!a?.name || !a?.b64) continue;
      const name = cleanFilename(String(a.name));
      treeEntries.push({
        path: `public/images/posts/${slug}/${name}`,
        mode: '100644',
        type: 'blob',
        sha: await createBlob(a.b64, 'base64'),
      });
    }
  } catch (err) {
    return Response.json(
      { error: 'blob create failed', detail: String(err) },
      { status: 502 },
    );
  }

  // 12. Tree + commit + ref update
  const treeRes = await fetch(`${apiBase}/git/trees`, {
    method: 'POST',
    headers: { ...ghHeaders, 'content-type': 'application/json' },
    body: JSON.stringify({ base_tree: baseTreeSha, tree: treeEntries }),
  });
  if (!treeRes.ok) {
    return Response.json(
      { error: 'tree failed', status: treeRes.status },
      { status: 502 },
    );
  }
  const tree = (await treeRes.json()) as { sha: string };

  const commitRes = await fetch(`${apiBase}/git/commits`, {
    method: 'POST',
    headers: { ...ghHeaders, 'content-type': 'application/json' },
    body: JSON.stringify({
      message: `post: ${title} [${isDraft ? 'draft' : 'published'}]`,
      tree: tree.sha,
      parents: [baseSha],
      author: {
        name: 'site-editor-bot',
        email: 'bot@gyuminlee.dev',
        date: dateIso,
      },
      committer: {
        name: 'site-editor-bot',
        email: 'bot@gyuminlee.dev',
        date: dateIso,
      },
    }),
  });
  if (!commitRes.ok) {
    return Response.json(
      { error: 'commit failed', status: commitRes.status },
      { status: 502 },
    );
  }
  const commit = (await commitRes.json()) as { sha: string };

  const refUpdateRes = await fetch(`${apiBase}/git/refs/heads/main`, {
    method: 'PATCH',
    headers: { ...ghHeaders, 'content-type': 'application/json' },
    body: JSON.stringify({ sha: commit.sha, force: false }),
  });
  if (!refUpdateRes.ok) {
    return Response.json(
      { error: 'ref update failed', status: refUpdateRes.status },
      { status: 502 },
    );
  }

  return Response.json(
    {
      ok: true,
      commit_sha: commit.sha,
      post_url: isDraft
        ? null
        : `https://gyuminlee.dev${langSafe === 'ko' ? '/ko' : ''}/posts/${slug}`,
      slug,
      build_estimate_seconds: 120,
    },
    { status: 201 },
  );
};
