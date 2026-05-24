# Posts in-site editor — 구현 계획

**Mode**: `shape` · **Spec**: `notes/specs/2026-05-25-posts-in-site-editor.md` @ commit `ea325f2`
**Base**: branch `main` HEAD ~`f618fc3`

**목표**: Owner 전용 비밀번호 인증으로 사이트에서 직접 post 작성·이미지 첨부 → personal-site repo에 GitHub API commit → Cloudflare Pages 재빌드.

**아키텍처**: Astro 정적 routes (`/post/login`, `/post/new` + KO 미러) + Cloudflare Pages Functions (`/api/post/{login,logout,create}`) + React island PostEditor. Auth = web crypto API (PBKDF2 hash + HMAC signed cookie + CSRF). 신규 의존성 1개(`marked` ~10KB, preview용).

**기술 스택**: Astro 4 + React 18 + Cloudflare Pages Functions + Web Crypto API + GitHub Trees API + Bun.

---

## Files mapped

| 종류 | 경로 | 책임 |
|---|---|---|
| 신규 lib | `src/lib/auth.ts` | PBKDF2 hash, HMAC cookie sign/verify, CSRF token gen/verify, base64url helpers, web crypto wrappers |
| 신규 페이지 | `src/pages/post/login.astro` + `src/pages/ko/post/login.astro` | 비밀번호 + CSRF 폼. noindex 메타. 미인증 시만 노출 |
| 신규 페이지 | `src/pages/post/new.astro` + `src/pages/ko/post/new.astro` | cookie 검증 통과 시 PostEditor 마운트, 실패 시 /post/login redirect. noindex |
| 신규 island | `src/islands/PostEditor.tsx` | title/body/tags/cover/draft 폼 + Preview toggle (marked) + submit → fetch /api/post/create |
| 신규 Function | `functions/api/post/login.ts` | password verify + rate limit + CSRF check + cookie set |
| 신규 Function | `functions/api/post/logout.ts` | clear cookie |
| 신규 Function | `functions/api/post/create.ts` | session verify + CSRF + Referer + body validate + GitHub Trees API commit (md + images) |
| 신규 CLI | `scripts/hash_password.ts` | owner local 실행: 비밀번호 입력 → `PASSWORD_HASH` + `PASSWORD_SALT` + `COOKIE_SECRET` 값 출력 (`.env.example` 형식) |
| 수정 | `notes/deploy/checklist.md` | 신규 환경변수 5개 + Functions 환경 노트 + owner setup steps |
| 수정 | `package.json` + `bun.lock` | `marked` ^14 추가 |

테스트 파일 없음 (v1). 검증은 `bun run typecheck` + `bun run build` + dist grep + (선택) `wrangler pages dev` e2e.

---

## Tasks (3 waves)

### Wave 0 — Foundation (병렬 가능)

#### Task 1.1: Auth lib + hash CLI + marked install

**파일**:
- 생성: `src/lib/auth.ts`
- 생성: `scripts/hash_password.ts`
- 수정: `package.json`, `bun.lock`

- [ ] **Step 1.1.1**: `bun add marked` (~10KB, preview 렌더용)

- [ ] **Step 1.1.2**: `src/lib/auth.ts` 작성. 함수 시그니처:
  ```ts
  // PBKDF2-SHA256, 100k iter
  export async function hashPassword(password: string, salt: string): Promise<string>
  export async function verifyPassword(password: string, salt: string, expectedHash: string): Promise<boolean>

  // HMAC-SHA256 signed cookie: `<base64url(payload)>.<base64url(hmac)>`
  // payload = { exp: number, iat: number }
  export async function signSession(secret: string, ttlMs: number): Promise<string>
  export async function verifySession(secret: string, cookieValue: string): Promise<boolean>

  // CSRF: random 32 bytes hex
  export function generateCSRF(): string
  // Constant-time compare
  export function safeCompare(a: string, b: string): boolean

  // Cookie helpers
  export function serializeCookie(name: string, value: string, opts: { maxAge: number; httpOnly?: boolean; secure?: boolean; sameSite?: 'Lax'|'Strict' }): string
  export function parseCookie(header: string | null, name: string): string | null
  ```
  모두 web crypto API (`crypto.subtle`) + `globalThis.crypto.getRandomValues`. Astro SSR (Node)와 Cloudflare Worker 양쪽 동작.

- [ ] **Step 1.1.3**: `scripts/hash_password.ts` 작성. argparse 없이 `Bun.stdin` readline:
  ```ts
  import { hashPassword } from '../src/lib/auth';
  const password = await prompt('Password (12+ chars): ');
  const salt = crypto.randomUUID().replace(/-/g, '');
  const hash = await hashPassword(password, salt);
  const secret = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');
  console.log(`PASSWORD_HASH=${hash}`);
  console.log(`PASSWORD_SALT=${salt}`);
  console.log(`COOKIE_SECRET=${secret}`);
  ```

- [ ] **Step 1.1.4**: `bun scripts/hash_password.ts` 시범 실행 (dummy password로) → 3개 env 값 출력 확인.

- [ ] **Step 1.1.5**: typecheck 통과
  ```bash
  bun run typecheck 2>&1 | tail -5
  ```

- [ ] **Step 1.1.6**: 커밋
  ```bash
  git add -A
  git commit --quiet -m "v0.05.00.00: auth lib + hash CLI + marked dep"
  ```

**verify_command**: `bash -lc 'cd /Users/gml/_workspace/personal-site && [ -f src/lib/auth.ts ] && [ -f scripts/hash_password.ts ] && grep -q marked package.json && bun run typecheck >/dev/null 2>&1'`

---

### Wave 1 — Backend Functions (Auth lib 의존)

#### Task 2.1: Pages Functions 3개

**파일**:
- 생성: `functions/api/post/login.ts`
- 생성: `functions/api/post/logout.ts`
- 생성: `functions/api/post/create.ts`

- [ ] **Step 2.1.1**: `login.ts` 작성:
  ```ts
  export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
    // 1. Parse JSON body { password, csrf }
    // 2. CSRF: csrf cookie === body.csrf (constant-time)
    // 3. Rate limit: in-memory Map, 5 attempts / 15min / IP. 초과 시 429.
    // 4. verifyPassword(body.password, env.PASSWORD_SALT, env.PASSWORD_HASH)
    // 5. ok → signSession(env.COOKIE_SECRET, 24h) → Set-Cookie + 204
    // fail → 401
  };
  ```

- [ ] **Step 2.1.2**: `logout.ts` — Set-Cookie session=; Max-Age=0 + 204.

- [ ] **Step 2.1.3**: `create.ts`:
  ```ts
  export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
    // 1. verifySession(env.COOKIE_SECRET, cookie session)
    // 2. CSRF: csrf cookie === body.csrf
    // 3. Referer same-origin (Cloudflare URL)
    // 4. zod-like validate body: { title (1-200), body (1-50000), tags (string[] ≤10), slug?, draft (bool), cover_image_b64?, attachments?: {filename, base64}[] (≤4, each ≤5MB) }
    // 5. Compute slug: ISO date YYMMDD + slugify(title). 충돌 시 -1, -2.
    // 6. Build commit via GitHub Trees API:
    //    - GET /repos/{REPO}/git/ref/heads/main → base_sha
    //    - GET /repos/.../git/commits/{base_sha} → base_tree
    //    - POST blobs for md + each image (base64 encoding)
    //    - POST trees with new entries
    //    - POST commits with parent=base_sha
    //    - PATCH refs/heads/main with new commit_sha
    // 7. Author: "site-editor-bot <bot@gyuminlee.dev>"
    // 8. Return 201 { commit_sha, post_url: 'https://gyuminlee.dev/posts/<slug>', build_estimate_seconds: 120 }
  };
  ```
  GitHub API는 fetch 직접 (`Authorization: Bearer ${env.GITHUB_PAT}`), `@octokit/rest` 미사용 (bundle 가벼움).

- [ ] **Step 2.1.4**: typecheck
  ```bash
  bun run typecheck 2>&1 | tail -5
  bun run build 2>&1 | tail -10
  ```

- [ ] **Step 2.1.5**: 커밋
  ```bash
  git commit --quiet -m "v0.05.01.00: Pages Functions (post login/logout/create)"
  ```

**verify_command**: `bash -lc 'cd /Users/gml/_workspace/personal-site && [ -f functions/api/post/login.ts ] && [ -f functions/api/post/logout.ts ] && [ -f functions/api/post/create.ts ] && bun run typecheck >/dev/null 2>&1 && bun run build >/dev/null 2>&1'`

---

### Wave 2 — Frontend Pages + Editor (Auth lib 의존)

#### Task 3.1: Login + New 페이지 (EN+KO)

**파일**:
- 생성: `src/pages/post/login.astro` + `src/pages/ko/post/login.astro`
- 생성: `src/pages/post/new.astro` + `src/pages/ko/post/new.astro`

- [ ] **Step 3.1.1**: `/post/login.astro`:
  ```astro
  ---
  import Base from '../../layouts/Base.astro';
  import { generateCSRF, serializeCookie } from '../../lib/auth';
  const csrf = generateCSRF();
  Astro.response.headers.append('Set-Cookie', serializeCookie('csrf', csrf, { maxAge: 900, httpOnly: true, secure: true, sameSite: 'Strict' }));
  ---
  <Base title="Sign in" path="/post/login" noindex>
    <main class="min-h-screen flex items-center justify-center p-6">
      <form method="POST" action="/api/post/login" class="w-full max-w-sm space-y-4 ...">
        <h1 class="text-2xl font-semibold">Sign in</h1>
        <input type="hidden" name="csrf" value={csrf} />
        <input type="password" name="password" required minlength="12" class="..." />
        <button type="submit" class="...">Sign in</button>
      </form>
    </main>
  </Base>
  ```
  `Base.astro`에 `noindex` prop 추가 (`<meta name="robots" content="noindex,nofollow">`). KO 미러는 라벨만 한국어로.

- [ ] **Step 3.1.2**: `/post/new.astro`:
  ```astro
  ---
  import Base from '../../layouts/Base.astro';
  import { verifySession, parseCookie, generateCSRF, serializeCookie } from '../../lib/auth';
  import PostEditor from '../../islands/PostEditor';
  const cookieHeader = Astro.request.headers.get('cookie');
  const session = parseCookie(cookieHeader, 'session');
  const ok = session && await verifySession(import.meta.env.COOKIE_SECRET, session);
  if (!ok) return Astro.redirect('/post/login');
  const csrf = generateCSRF();
  Astro.response.headers.append('Set-Cookie', serializeCookie('csrf', csrf, { maxAge: 900, httpOnly: true, secure: true, sameSite: 'Strict' }));
  ---
  <Base title="New post" path="/post/new" noindex>
    <main class="max-w-grid mx-auto px-6 md:px-12 py-12">
      <PostEditor client:load lang="en" csrf={csrf} />
    </main>
  </Base>
  ```
  주의: `import.meta.env.COOKIE_SECRET`는 Astro SSR 환경변수. Cloudflare Pages 빌드 시 inject. 대안: middleware 또는 dynamic route. SSR가 아니면 client-side만으로는 검증 불가 → 페이지를 SSR 모드로 (Astro 4 `output: 'hybrid'` 또는 `export const prerender = false`).
  결정: `prerender = false`로 SSR 처리 (Cloudflare Pages는 SSR 지원).

- [ ] **Step 3.1.3**: `Base.astro`에 `noindex?: boolean` prop 추가, 조건부 `<meta name="robots">` 렌더.

- [ ] **Step 3.1.4**: 빌드
  ```bash
  bun run build 2>&1 | tail -10
  ```

- [ ] **Step 3.1.5**: 커밋
  ```bash
  git commit --quiet -m "v0.05.02.00: post/login + post/new pages (EN+KO) + noindex meta"
  ```

#### Task 3.2: PostEditor island

**파일**:
- 생성: `src/islands/PostEditor.tsx`

- [ ] **Step 3.2.1**: PostEditor.tsx — React 18 island. props: `lang: 'en'|'ko'`, `csrf: string`. state: `title, body, tags, slug, draft, coverImage (File|null), attachments (File[]), preview (bool), submitting, error`. Submit: FileReader로 base64 변환 → JSON POST → toast on success → form reset.

- [ ] **Step 3.2.2**: Preview toggle → marked로 body 렌더, `dangerouslySetInnerHTML`로 출력. 학명 italic 등 markdown 표준만.

- [ ] **Step 3.2.3**: 반응형: `<input type="file" accept="image/*" capture>` (모바일 카메라 직접 호출). 이미지 미리보기 grid.

- [ ] **Step 3.2.4**: 빌드 + typecheck
  ```bash
  bun run typecheck 2>&1 | tail -5
  bun run build 2>&1 | tail -10
  ```

- [ ] **Step 3.2.5**: 커밋
  ```bash
  git commit --quiet -m "v0.05.02.01: PostEditor island (form + preview + image upload)"
  ```

**verify_command (W2 통합)**: `bash -lc 'cd /Users/gml/_workspace/personal-site && [ -f src/pages/post/login.astro ] && [ -f src/pages/post/new.astro ] && [ -f src/pages/ko/post/login.astro ] && [ -f src/pages/ko/post/new.astro ] && [ -f src/islands/PostEditor.tsx ] && bun run typecheck >/dev/null 2>&1 && bun run build >/dev/null 2>&1'`

---

### Wave 3 — 통합 검증 + 문서

#### Task 4.1: Deploy checklist 갱신 + 통합 검증

**파일**:
- 수정: `notes/deploy/checklist.md`

- [ ] **Step 4.1.1**: `checklist.md`에 신규 섹션 "Owner-only post editor 활성화" 추가:
  ```markdown
  ### Posts in-site editor 활성화
  1. 로컬에서 `bun scripts/hash_password.ts` 실행 → password 입력 → 3개 env 값 획득
  2. Cloudflare Pages → Settings → Environment variables → Production + Preview에 추가:
     - `PASSWORD_HASH` = (CLI 출력)
     - `PASSWORD_SALT` = (CLI 출력)
     - `COOKIE_SECRET` = (CLI 출력)
     - `GITHUB_PAT` = (GitHub Fine-grained PAT, `contents:write` only, 90일 만료)
     - `GITHUB_REPO` = `gyuminlee-repo/personal-site`
  3. 첫 로그인: https://<your-site>/post/login → 비밀번호 → 인증 성공 → /post/new 자동 이동
  4. 첫 post 작성 → submit → ~2분 후 https://<your-site>/posts/<slug>에 게재 확인
  5. PAT 갱신: 90일마다. `gh auth refresh` 또는 GitHub UI.
  ```

- [ ] **Step 4.1.2**: clean build + grep
  ```bash
  cd /Users/gml/_workspace/personal-site
  rm -rf dist .astro
  bun run typecheck 2>&1 | tail -5
  bun run build 2>&1 | tail -10

  # noindex 메타 4 페이지 모두
  for p in /post/login /post/new /ko/post/login /ko/post/new; do
    grep -c 'name="robots" content="noindex' "dist${p}/index.html" 2>/dev/null || echo "MISSING $p"
  done
  ```

- [ ] **Step 4.1.3**: Functions 빌드 검증
  ```bash
  ls functions/api/post/   # login.ts logout.ts create.ts
  ```

- [ ] **Step 4.1.4**: 커밋
  ```bash
  git commit --quiet -m "v0.05.03.00: deploy checklist update + final verify"
  ```

**verify_command**: `bash -lc 'cd /Users/gml/_workspace/personal-site && rm -rf dist .astro && bun run typecheck >/dev/null 2>&1 && bun run build >/dev/null 2>&1 && for p in /post/login /post/new /ko/post/login /ko/post/new; do grep -q "name=\"robots\" content=\"noindex" "dist${p}/index.html" || exit 1; done'`

---

## Verification (전체 e2e — owner 수동)

```bash
# Local Cloudflare Pages dev (wrangler 필요, owner 환경)
bun run build
bunx wrangler pages dev dist \
  --binding PASSWORD_HASH=<hash> \
  --binding PASSWORD_SALT=<salt> \
  --binding COOKIE_SECRET=<secret> \
  --binding GITHUB_PAT=<pat> \
  --binding GITHUB_REPO=gyuminlee-repo/personal-site \
  --compatibility-date=2024-09-01
```

검증:
1. `http://localhost:8788/post/new` → /post/login redirect (no session)
2. /post/login → 비밀번호 → 200 + session cookie
3. /post/new → editor 표시
4. submit (text only first, then with image) → 201 + GitHub repo 확인
5. /posts/<slug> Cloudflare 빌드 후 확인 (production)

## Risks (echo from spec § Risks + plan-level)

- (spec § Risks 그대로)
- **추가**: PostEditor JSON+base64 페이로드 큰 이미지에서 메모리 사용량. 4×5MB = ~28MB base64. Pages Function 100MB 한계 안 (OK), 단 클라이언트 메모리는 모바일에서 부담 가능 → 폼 제출 전 progress 표시.

## Confidence check

| 축 | 점수 | 사유 |
|---|---|---|
| Completeness | 4 | spec 11 결정 + 10 risks가 4 task에 매핑. 단 wrangler e2e는 owner 환경에 의존. |
| Clarity | 4 | 각 task에 파일 경로 + 명령 + 검증. 일부 함수 시그니처는 spec 참조. |
| Feasibility | 4 | web crypto API + GitHub Trees API + Cloudflare Pages Functions 모두 표준. SSR 모드 전환(`prerender=false`)이 약간 새로움. |

**Total**: 12/15. 진행 가능.

## Out of scope

- Tests (v1 — wrangler e2e 매뉴얼만)
- Editor 인라인 이미지 (cover image만 v1; 본문 inline 이미지는 v2)
- Auto-save draft
- Markdown syntax highlight
- WYSIWYG
- 다중 사용자 / 권한
- Push, deploy (owner 직접)

## Open decisions (spec OD echo)

OD1~OD5는 spec에 정의됨. 모두 추천안 기본 채택 가정. owner가 변경 원하면 plan/spec 갱신 후 재시작.
