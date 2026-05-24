# Personal Site v0.04 — Multi-page redesign + Posts feed

날짜: 2026-05-24
작성: brainstorming 2차 라운드 결정 정리
범위: v0.03 단일 페이지 (`78c3ecc` 기반 → v0.03 실행 결과 commit 이후)에서 **멀티 페이지 7+1 메뉴 구조로 전환** + Obsidian vault 자동 sync Posts feed 추가
선행 spec: `notes/specs/2026-05-24-personal-homepage-v3-redesign.md`

## Context

v0.03이 단일 페이지 + EntryNav 3 카드 + Software 2 카드로 단순화했지만 사용자는 (a) 진짜 "홈페이지" 느낌의 멀티 페이지 구조 (b) Software 라벨이 과해 보임 (c) Threads 스타일 짧은 글+사진 피드를 vault에서 자동 sync로 운영하고 싶음을 표명. v0.04는 이를 반영한 라우팅 전환과 Posts 파이프라인 신규.

## Decisions

| # | 결정 | 값 |
|---|---|---|
| D1 | 구조 | 멀티 페이지 (각 메뉴 = 독립 route, anchor scroll 폐기) |
| D2 | 메뉴 (8개) | Home · About · Tools · Publications · Presentations · Posts · CV · Contact |
| D3 | i18n | 각 페이지에 `/ko/*` 미러 — 기존 Astro i18n 라우팅 그대로 |
| D4 | Software 라벨 | "Tools · 도구"로 변경 (kuma + PrimerBench가 일급 "Software"라 부르기엔 과함) |
| D5 | Home 본문 | Hero (이름 + typewriter + 1줄 bio) + Now 섹션 (월/분기 수동) + Latest 3 카드 자동 (논문 1 + 발표 1 + Post 1) |
| D6 | Now 데이터 source | `src/data/now.json` (또는 `src/content/now.md` — 운영 편의로 선택) 수동 |
| D7 | Posts 콘텐츠 source | Obsidian vault `$OBSIDIAN_VAULT/999.Public/posts/*.md` 자동 sync |
| D8 | Posts sync 메커니즘 | GitHub Actions cron + Python sync 스크립트 → `src/content/posts/` (Astro Content Collection) |
| D9 | Posts 이미지 | sync 스크립트가 vault 첨부 (`![[image.png]]`) → `public/images/posts/`로 복사 + frontmatter 경로 재작성 + Astro Image optimization 적용 |
| D10 | Posts 형식 | 역시간 timeline 리스트 + 각 포스트 `/posts/[slug]` detail |
| D11 | Presentations 형식 | 리스트 only (제목·날짜·장소·청중), `src/data/presentations.json` 수동 |
| D12 | CV 페이지 | HTML 풀버전 (Bio/Edu/Exp/Skills/Pubs/Awards) + 우상단 "Download PDF" 버튼 → `public/이규민_CV.pdf` |
| D13 | Contact 페이지 | 정적 정보 (이메일·GitHub·Scholar·LinkedIn placeholder·KRIBB 주소). 메시지 form 없음 |
| D14 | Cmd+K | Sections 카테고리를 페이지 경로로 점프 (`#about` → `/about`) |
| D15 | Vibe Layer | Typewriter · Cmd+K · AI Q&A 모두 유지, 전역 마운트 |
| D16 | Scholar sync | 변경 없음 (현재 파이프라인 그대로) |
| D17 | i18n 번역 | 변경 없음 (Claude API 빌드시 번역 그대로) |
| D18 | 디자인 토큰 | 변경 없음 |
| D19 | v0.03 EntryNav 컴포넌트 | 삭제 (멀티 페이지로 nav 역할 분산) |

## Copy — locked

### Menu labels (EN · KO)

```
Home          홈
About         소개
Tools         도구
Publications  논문
Presentations 발표
Posts         포스트
CV            이력서
Contact       연락처
```

### Now (Home, 초기 카피 예시 — 운영자 수정 가능)

```
src/data/now.json:
{
  "updated_at": "2026-05-24",
  "items_en": [
    "ALE paper revision (1st-author, methanol stress in M. extorquens)",
    "PrimerBench: off-target performance tuning for new host strains",
    "Wiring KRIBB C1 lab notebook automation through Claude Code agents"
  ],
  "items_ko": [
    "ALE 1저자 논문 리비전 (M. extorquens 메탄올 스트레스)",
    "PrimerBench: 신규 host strain용 off-target 성능 튜닝",
    "KRIBB C1 lab notebook 자동화 Claude Code 에이전트 연결"
  ]
}
```

### Posts frontmatter schema

```yaml
---
title: "포스트 제목"
date: 2026-05-24
slug: optional-explicit-slug         # 없으면 파일명에서 추정
cover_image: ./image.png             # vault 상대 경로, sync가 /images/posts/로 옮김
tags: [ale, methanotroph, vibe]
draft: false                         # true면 빌드 제외
lang: ko                             # 단일 언어 포스트 (기본 ko), 또는 en
---

본문 markdown. wikilink ![[img.png]] 자동 변환.
```

## Architecture

### Routing

```
src/pages/
├── index.astro                 → /
├── about.astro                 → /about
├── tools.astro                 → /tools
├── publications.astro          → /publications
├── presentations.astro         → /presentations
├── cv.astro                    → /cv
├── contact.astro               → /contact
├── posts/
│   ├── index.astro             → /posts (timeline)
│   ├── [slug].astro            → /posts/<slug>
│   └── feed.xml.ts             → /posts/feed.xml (RSS)
└── ko/
    ├── index.astro             → /ko/
    ├── about.astro             → /ko/about
    ├── ... (모든 페이지 동일 구조)
    └── posts/
        ├── index.astro         → /ko/posts
        └── [slug].astro        → /ko/posts/<slug>
```

### Posts sync pipeline

```
$OBSIDIAN_VAULT/999.Public/posts/
├── 260520-ale-revision-thoughts.md
├── 260522-cmdk-rant.md
├── 260524-photo-test.md
└── attachments/
    └── plate-photo.png

         │  GitHub Actions cron 03:30 KST daily + workflow_dispatch
         ▼
scripts/posts_sync.py:
  1. git clone or symlink-aware fetch vault folder
  2. for each .md: parse frontmatter, parse ![[wikilinks]]
  3. copy attachments → public/images/posts/<slug>/<filename>
  4. rewrite ![[image.png]] → ![](/images/posts/<slug>/image.png)
  5. write to src/content/posts/<date>-<slug>.md
  6. commit if diff (bot: vault-sync-bot)
```

### Astro Content Collection

```ts
// src/content/config.ts (new entry)
const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
    cover_image: z.string().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    lang: z.enum(['en', 'ko']).default('ko'),
  }),
});
export const collections = { posts };
```

### Latest 3 카드 (Home) 통합 로직

```ts
// src/lib/latest.ts
import publications from '../data/publications.json';
import presentations from '../data/presentations.json';
import { getCollection } from 'astro:content';

export async function getLatest() {
  const latestPub = publications.publications[0];        // Scholar sorted desc
  const latestPres = presentations.presentations[0];     // manually sorted desc in JSON
  const posts = await getCollection('posts', (p) => !p.data.draft);
  const latestPost = posts.sort((a,b) => b.data.date - a.data.date)[0];
  return { latestPub, latestPres, latestPost };
}
```

## Files affected

### 신규 (multi-page routes)
- `src/pages/about.astro` — `<Base><Nav/><AboutSection/><Footer/></Base>` 골격
- `src/pages/tools.astro` — Software 섹션 콘텐츠 페이지화
- `src/pages/publications.astro` — Publications 섹션 콘텐츠 페이지화
- `src/pages/presentations.astro` — 신규 리스트 페이지
- `src/pages/cv.astro` — 신규 HTML CV 페이지 + PDF 다운로드 버튼
- `src/pages/contact.astro` — 신규 정적 페이지
- `src/pages/posts/index.astro` — Posts timeline
- `src/pages/posts/[slug].astro` — Post detail dynamic route
- `src/pages/posts/feed.xml.ts` — RSS feed
- `src/pages/ko/about.astro` … `src/pages/ko/posts/[slug].astro` — KO 미러 (8 페이지)

### 신규 (컴포넌트 + 데이터)
- `src/components/sections/Now.astro` — Home의 Now 섹션
- `src/components/sections/Latest.astro` — Home의 Latest 3 카드 그리드
- `src/components/PostCard.astro` — Posts timeline의 한 entry
- `src/components/PresentationItem.astro` — Presentations 한 entry
- `src/components/CvDownloadButton.astro` — /cv 다운로드 CTA
- `src/components/ContactInfo.astro` — Contact 정적 카드
- `src/data/now.json` — 위 schema
- `src/data/presentations.json` — `{ presentations: [{ title, date, venue, audience, slides_url? }] }` 초기 시드 (KRIBB seminars + 260523 양동수 등)
- `src/content/config.ts` — posts collection 등록

### 신규 (sync 파이프라인)
- `scripts/posts_sync.py` — vault → src/content/posts 변환 + 이미지 복사
- `.github/workflows/posts-sync.yml` — cron 03:30 KST + workflow_dispatch
- `public/이규민_CV.pdf` — 자산 추가 (`cc/work/output/이규민_CV_세미나_양동수_260523.pdf` 복사)
- `public/images/posts/.gitkeep` — sync 산출물 dir

### 수정
- `src/pages/index.astro` + `src/pages/ko/index.astro`
  - 기존 About/Tools/Publications/KuroDemo 인라인 마운트 제거
  - Hero + Now + Latest 3 카드만 남김
- `src/components/sections/Nav.astro`
  - 메뉴 항목 8개로 갱신 (EN/KO 라벨)
  - 활성 페이지 highlight 로직 (currentPath prop 활용)
  - anchor href (`#about`) → route href (`/about`)
- `src/islands/CmdK.tsx`
  - Sections 카테고리 항목들의 `onSelect`를 anchor scroll → `window.location.href = '/about'` 등 route navigation으로
  - 새 항목 추가: Posts, CV, Contact
- `src/components/sections/Hero.astro`
  - v0.03 EntryNav 마운트 제거 (멀티 페이지 nav가 처리)
  - typewriter + 1줄 bio + scroll cue만

### 삭제
- `src/components/sections/EntryNav.astro` (v0.03 산출물) — 멀티 페이지로 역할 분산

### 변경 없음 (out of scope)
- `src/styles/global.css`, `tailwind.config.cjs`
- `src/components/sections/{Footer}.astro`
- `src/components/{SoftwareCard,PublicationList,ScholarMetrics,ScholarChart}.astro` — 페이지에서 그대로 import
- `src/islands/{Typewriter,AskWidget}.tsx`
- `src/data/{bio.en,bio.ko,projects,publications,scholar_metrics}.json`
- `scripts/scholar_sync.py`, `scripts/translate_build.ts`, `src/lib/translate.ts`
- `functions/api/ask.ts`
- `.github/workflows/scholar-sync.yml`

## Verification

```bash
cd /Users/gml/_workspace/personal-site
bun run typecheck       # 0 errors
bun run build           # exit 0, all 8x2=16 routes built (+ posts dynamic)
```

수동 시각:
- `/` Hero + Now (3 줄) + Latest 3 카드 (논문/발표/포스트). Latest 카드 클릭 → 해당 detail.
- Nav 8 항목 모두 클릭 가능, 활성 메뉴 highlight.
- `/posts` timeline에 vault sync된 포스트 N개 역시간 정렬. 이미지 로드.
- `/posts/<slug>` 각 포스트 본문 렌더, 이미지 inline.
- `/cv` 풀버전 + Download PDF 버튼 → PDF 다운로드.
- `/contact` 정적 정보 4-5 항목.
- `/ko/*` 모든 페이지 동일 흐름 + KO 카피.
- Cmd+K Sections에서 페이지 선택 → 해당 route로 이동.

Sync 검증:
- `python3 scripts/posts_sync.py --dry-run` → vault 폴더 스캔 결과 출력, 파일 변경 없음.
- 실 실행 → src/content/posts/ 신규 entry + public/images/posts/<slug>/ 첨부 복사 확인.
- 빌드 후 `dist/posts/<slug>/index.html`에 이미지 src가 올바른 절대 경로.

## Risks

- **vault 경로 결합**: `$OBSIDIAN_VAULT` 환경변수를 GitHub Actions에서 어떻게 접근할지 미정. 후보: (a) vault repo를 별도 GitHub repo로 두고 actions에서 checkout (b) personal-site repo에 git submodule로 vault folder mount (c) 사용자가 cron 머신에서 push만 담당. spec 단계에서 (a)로 가정하되, 실행 시 owner 결정 필요.
- **포스트 KO/EN 혼합**: 단일 언어 포스트 정책 (`lang` frontmatter)이라 EN-only 포스트는 `/posts/`에 표시되고 `/ko/posts/`에서는 EN 그대로 표시 (또는 숨김). 노출 정책 정의 필요. 1차는 모든 lang을 양 routes에 동일하게 표시.
- **이미지 가공 비용**: Astro Image (sharp 기반)는 빌드 시 처리. 포스트 수 + 이미지 수 늘면 빌드 시간 증가. CI 캐싱 (`.astro/cache`) 필수.
- **wikilink 파싱 edge case**: vault 내 `![[other-note.md#section]]`, `![[image.png|caption]]` 등 변형. v1은 단순 `![[image.png]]`만 지원, 나머지는 raw로 남김. 사용자에게 운영 가이드 명시.
- **vault sync 권한**: GitHub Actions가 vault repo를 read 하려면 PAT 또는 deploy key. owner 직접 설정.
- **PDF 자산 동기화**: CV PDF가 outdated되면 `public/이규민_CV.pdf` 수동 갱신 필요. v1은 그대로 유지, v2에 자동화 검토.
- **메뉴 8개 모바일 nav**: 모바일에서 8개가 nav bar에 다 들어가지 않음. 햄버거 메뉴 폴드 또는 가로 스와이프 처리. 현재 Nav.astro는 햄버거 패턴 있음 (Phase 2.1) — 8개로 확장만 하면 OK.
- **검색엔진 indexing**: `<link rel="canonical">` + `<link rel="alternate" hreflang>` 처리 필요 (EN ↔ KO 짝). 현재 미적용. v0.04 작업 중 추가.

## Out of scope (이 리비전)

- 폰트/색상/디자인 토큰 변경
- Lighthouse 재측정 (변경 폭 크지만, v0.02.05.01 기준 회귀가 의심되면 후속 라운드에서 처리)
- 다크 모드
- 사진/avatar 추가
- 커스텀 도메인
- Owner 확인 8건 (`notes/deploy/checklist.md` § Owner confirmation items)
- push, deploy
- Posts 검색 / 태그 필터 UI (1차는 단순 timeline + 태그 표시만)
- Posts 댓글 시스템
- Newsletter 구독
