# Posts 인-사이트 작성 (Owner-only Editor)

날짜: 2026-05-25
선행: `notes/specs/2026-05-24-personal-homepage-v4-multipage.md` (Posts 시스템 정의)

## Context

현재 Posts는 Obsidian vault `999.Public/posts/`에서만 작성 → GHA cron sync → 사이트 노출. 사용자가 **사이트에서 직접 작성·발행**할 수 있는 owner-only editor 원함. 익명 노출 차단을 위해 비밀번호 인증 + signed cookie + rate limit + CSRF.

## Decisions

| # | 결정 | 값 |
|---|---|---|
| D1 | 접근 방식 | 자작 form + 비밀번호 (Decap CMS, OAuth, headless CMS 모두 기각) |
| D2 | Storage destination | `personal-site` repo의 `src/content/posts/`에 GitHub API로 직접 commit. push 감지 → Cloudflare Pages 재빌드 ~2분. vault sync는 별도 경로로 그대로 유지. |
| D3 | 이미지 첨부 | form에서 파일 선택 (or 모바일 카메라 capture). ≤5MB/장, 최대 4장. base64 → GitHub blob → `public/images/posts/<slug>/<filename>` commit. frontmatter `cover_image` 또는 본문 `![](/images/posts/...)` |
| D4 | 발행 모드 | 즉시 발행 + draft 체크박스 (frontmatter `draft: true` → 사이트 PostCard 필터 제외) |
| D5 | 모바일 UX | 반응형 form, `<input type="file" accept="image/*" capture>` |
| D6 | 인증 | password hash 비교 (web crypto API: scrypt-style SHA-256 + salt + iterations). signed cookie (HttpOnly + Secure + SameSite=Lax + 24h). |
| D7 | Backend | Cloudflare Pages Functions (`functions/api/post/*`). octokit/REST 또는 fetch 직접. |
| D8 | Editor | textarea + 라이브 markdown preview (split view, ≥md 좌우 / <md 탭). 외부 lib 무거우면 textarea + 'Preview' 토글로 단순화 |
| D9 | 보안 추가 | (a) rate limit 5 attempts/15min/IP (Pages Function memory map; KV upgrade는 v2), (b) CSRF token (form hidden field + signed cookie 매칭), (c) Referer same-origin 검증, (d) login 페이지·new 페이지 모두 `<meta name="robots" content="noindex,nofollow">` |
| D10 | 환경변수 (Cloudflare Pages) | `PASSWORD_HASH` (`scrypt`로 generate), `PASSWORD_SALT`, `COOKIE_SECRET` (32+ bytes), `GITHUB_PAT` (`repo` write scope), `GITHUB_REPO` (=`gyuminlee-repo/personal-site`) |
| D11 | 의존성 | `@octokit/rest` 또는 fetch 직접. 비교 시 fetch 직접이 가벼움 (Pages Function 번들 사이즈) — 선택. 클라이언트는 추가 dep 0. |

## Architecture

### URL routes

```
/post/login        — 비밀번호 입력 + CSRF token form. POST → /api/post/login → cookie set + redirect /post/new
/post/new          — editor (cookie 검증 시만 접근, 미인증 시 /post/login redirect)
/api/post/login    — POST. body {password, csrf}. ok → Set-Cookie + 204.
/api/post/logout   — POST. clear cookie.
/api/post/create   — POST. body {title, body, tags, slug?, draft, cover_image_b64?, attachments?}. cookie + csrf 검증 → GitHub API commit → 201 {url}.
```

`/post/new` + `/post/login` 둘 다 `noindex,nofollow` 메타. KO 미러 (`/ko/post/login`, `/ko/post/new`)도 동일.

### Auth flow

1. Owner visits `/post/login` → CSRF token (random 32 bytes, hex) embedded in form + `csrf_token` cookie (HttpOnly+SameSite=Strict, 15min).
2. Submit → `/api/post/login` 검증:
   - CSRF token cookie === form `csrf` field
   - body password hash (PBKDF2-SHA256, 100k iter, salt=ENV) === ENV `PASSWORD_HASH`
   - rate limit check (per IP)
3. 통과 → `session` cookie set (HMAC-SHA256 signed: `${timestamp}.${signature}`, 24h)
4. `/post/new` 접근 시 `session` cookie 검증. expire → /post/login redirect.

### Editor flow

1. `/post/new` 페이지 로드 시 새 CSRF token 발급 (cookie + form hidden).
2. PostEditor (React island, `client:load`):
   - title (single line)
   - body (textarea, monospace, autoresize)
   - tags (comma-separated → array)
   - slug (optional, 미입력 시 `YYMMDD-<title-slugified>` 자동)
   - cover image (file input, accept=image/*, capture)
   - draft 체크박스
   - "Preview" 토글 → markdown 렌더 (react-markdown 가벼움 단 v0.04.07 제거됨 — Astro inline marked 사용 or 단순 textarea preview는 server-side rendering으로 처리. 트레이드오프 spec § Open 항목 참조)
   - Submit → POST `/api/post/create` (JSON body, FormData가 base64 인코딩보다 더 효율적이지만 단순화 위해 JSON+base64 채택)
3. 성공 → "Published at /posts/<slug> (build in ~2 min)" toast + form reset 또는 redirect

### Backend logic (`functions/api/post/create.ts`)

```ts
1. Verify session cookie (HMAC) + CSRF token
2. Validate body schema (zod): title (1-200), body (1-50000), tags (≤10), slug (optional, kebab-case), cover_image (optional, base64<5MB), attachments (optional, ≤4, each ≤5MB, total ≤15MB)
3. Compute slug if absent: ISO date + slugify(title) (kebab-case, romanize KO via simple transliteration or skip if all-KO → use timestamp)
4. Build commit:
   - blob 1: src/content/posts/<YYMMDD>-<slug>.md (frontmatter + body)
   - blob 2..N: public/images/posts/<slug>/<filename> for each image
5. Use GitHub Trees API: create tree with base ref main, add blobs, create commit, update ref
   - Author: "site-editor-bot <bot@gyuminlee.dev>"
   - Message: "post: <title> [<draft|published>]"
6. Return 201 { commit_sha, url: `https://gyuminlee.dev/posts/<slug>` }
```

### Files affected

**신규**:
- `src/pages/post/login.astro` + `/ko/post/login.astro`
- `src/pages/post/new.astro` + `/ko/post/new.astro`
- `src/islands/PostEditor.tsx`
- `src/lib/auth.ts` (cookie sign/verify, CSRF helpers — works in both Astro SSR and Pages Function via shared `crypto.subtle`)
- `functions/api/post/login.ts`
- `functions/api/post/logout.ts`
- `functions/api/post/create.ts`
- `scripts/hash_password.ts` (one-off owner CLI to compute `PASSWORD_HASH` env value)
- `notes/deploy/checklist.md` 갱신 — 새 4개 환경변수 항목

**수정**:
- `src/components/sections/Nav.astro` — owner only면 nav에서 안 보임. 단 cookie 있을 때만 "Editor" 링크 표시 (선택). 아니면 직접 URL 입력으로 진입. **결정: nav 변경 없음. 직접 URL 입력만.**
- `src/components/sections/Footer.astro` — 변경 없음

**의존성**:
- 신규: 없음 (fetch 직접 + web crypto API)
- 단 marked 또는 micromark는 PostEditor preview용으로 검토. 최대한 inline하거나 textarea-only로 1차 ship 후 v2 추가.

### Frontmatter schema (write)

```yaml
---
title: "사용자 입력 제목"
date: 2026-05-25T14:30:00+09:00         # 자동 생성
slug: "explicit-or-auto-slug"
tags: ["tag1", "tag2"]
draft: false                              # 또는 true
cover_image: "/images/posts/<slug>/cover.png"   # 첨부 있을 때만
source: "web"                             # vault sync와 구분
lang: "ko"                                # 또는 "en", 자동 추정 또는 사용자 선택
---

사용자 입력 본문 markdown.
```

## Verification

```bash
cd /Users/gml/_workspace/personal-site

# Build
bun run typecheck && bun run build

# 빌드된 페이지 noindex 메타
grep -c 'name="robots"' dist/post/login/index.html dist/post/new/index.html  # ≥1 each

# Functions 빌드 (Cloudflare Pages는 functions/를 자동 인식)
ls functions/api/post/  # login.ts create.ts logout.ts

# Auth flow 수동 테스트
bunx wrangler pages dev dist --binding PASSWORD_HASH=... PASSWORD_SALT=... COOKIE_SECRET=... GITHUB_PAT=... GITHUB_REPO=gyuminlee-repo/personal-site --compatibility-date=2024-09-01
# 1. /post/new → /post/login redirect (no cookie)
# 2. /post/login → 비밀번호 입력 → cookie 발급
# 3. /post/new → editor 표시
# 4. submit → 201 + commit SHA
# 5. GitHub repo 확인 → src/content/posts/<slug>.md + public/images/posts/<slug>/ 생성
# 6. Cloudflare Pages 빌드 ~2분 후 https://gyuminlee.dev/posts/<slug> 접근
```

## Risks

- **GITHUB_PAT 유출 시 repo write 가능**: PAT scope를 `contents:write` (Fine-grained PAT)로 최소화 + 90일 만료 설정. 환경변수만 secret으로 저장 (Cloudflare Pages Settings, 클라이언트 노출 X).
- **rate limit per-isolate 한계**: Cloudflare Pages Functions는 isolate 단위 메모리. 다중 region이면 카운터 분산 → 사실상 5×N attempts. v1 owner-only이고 트래픽 적어 무시 가능. v2에 KV upgrade.
- **이미지 base64 5MB 제한**: Cloudflare Worker request body 100MB 한계지만 latency·메모리 고려해 4장×5MB = 20MB로 제한. 큰 사진은 owner가 사전 압축.
- **GitHub API rate limit**: 5000 req/hr (authenticated). owner 1명 + 일평균 N posts × 5 calls (tree, blob, commit, ref, get-ref) → 무시 가능.
- **slug 충돌**: 같은 날짜·같은 title → 같은 slug. 해결: slug 이미 존재 시 `-1`, `-2` suffix 자동.
- **build delay ~2분**: 즉시 반영 안 됨. UI에 "발행 후 ~2분 후 사이트 반영" 명시.
- **draft 노출 위험**: PostCard.astro에서 `!p.data.draft` 필터 이미 적용됨. 새 frontmatter도 동일 schema 따르므로 자동 차단. 확인 필요.
- **CSRF cookie 만료 vs form 살아있음**: 15분 만료 → 사용자가 폼 오래 열어두면 submit 실패. 폼 진입 시 새 토큰 발급 + JS로 페이지 active 동안 갱신 (선택).
- **KO 미러 페이지 noindex 누락 위험**: KO 페이지도 명시 처리. 검증 grep으로 확인.
- **vault sync와 충돌**: 두 source 모두 `src/content/posts/`에 쌓이지만 frontmatter `source: web` vs `source: vault` 라벨로 구분. slug 충돌은 위 자동 suffix로 해결.

## Out of scope (v1)

- 게시물 편집·삭제 (만들기만; 수정은 vault나 GitHub 웹 UI 사용)
- 다중 사용자 / 권한 / 코멘트
- Slack/Discord 알림 (발행 시)
- WYSIWYG rich editor
- Auto-save draft to KV
- Markdown 문법 syntax highlight (CodeMirror 같은 lib)
- 이미지 자동 리사이즈 / EXIF strip
- 이미지 갤러리 / lightbox
- KO/EN 자동 번역 (기존 build-time translate 흐름은 사이트 빌드 시점에 적용)

## Open decisions (사용자 검토 권장)

- **OD1 Editor preview**: textarea only (가장 단순) vs marked/micromark inline preview vs react-markdown 재도입 (v0.04.07에서 제거됨, 약 50KB). 추천: textarea + "Preview" 버튼 클릭 시 임시 marked 렌더 (인라인 ~10KB).
- **OD2 비밀번호 강도**: 12자+ 권장. owner 결정.
- **OD3 PAT scope**: classic `repo` scope vs fine-grained `contents:write + workflows`. 추천: fine-grained, contents:write only.
- **OD4 nav에 Editor 링크 노출**: cookie 있을 때만 표시? 그냥 직접 URL 입력? 추천: 그냥 직접 URL (보안 노출 0).
- **OD5 slug 한국어**: 한국어 제목의 slug는 어떻게? 추천: 자동 timestamp + 영문 transliteration 또는 그냥 timestamp + 임의 hash. 사용자가 명시 입력해도 OK.
