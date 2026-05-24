# Personal Site v0.03 — Single-page redesign

날짜: 2026-05-24
작성: brainstorming 세션 결정 정리
범위: v0.02.05.01 (commit `fc2c50a`)에서 출발하는 콘텐츠·구조 리비전
선행 spec: `notes/specs/2026-05-24-personal-homepage-v2.md` (v0.02 정의)

## Context

v0.02 단일 페이지가 Hero/About/Software(6장)/KURO demo/Publications/Footer를 메인에 일렬로 몰아 넣어 학술 CV의 톤보다는 dashboard 인상이 강했다. 사용자는 (1) 짧은 진입면 (2) Software 카드 축소 (3) Hero 문장 패턴 교체 (4) KURO mini-demo 제거 (5) About narrative 압축을 요청.

KURO와 mame가 별도 도구가 아니라 kuma 안의 두 모듈로 통합됐다는 사실이 별도로 확인됨 → Software 카드와 메타데이터 정리 필요.

## Decisions

| # | 결정 | 값 |
|---|---|---|
| D1 | 구조 | 단일 페이지 + 짧은 Hero 진입면 |
| D2 | Hero 진입면 nav 카드 | 3장 (About / Software / Publications) |
| D3 | Hero 문장 패턴 | `I [typewriter verb-phrase].` |
| D4 | Typewriter 라벨 | 동사구 cycling, 3개, EN+KO 짝 |
| D5 | About narrative | 1문단 (2-3문장) + Education/Experience 분리 유지 |
| D6 | Software 카드 | 2장만 (kuma + PrimerBench), Bio only |
| D7 | KURO mini-demo | 제거 (island + 페이지 wiring + 카드의 `has_minidemo` 분기 모두) |
| D8 | Publications | 변경 없음 (Scholar 자동 sync 유지) |
| D9 | Footer | 변경 없음 |

## Copy — locked

### Hero typewriter cycle (B 톤: 간결 + 임팩트)

```
EN: ["engineer methane-eating microbes",
     "evolve strains under stress",
     "ship lab tools with AI agents"]

KO: ["메탄을 먹는 미생물을 공학합니다",
     "스트레스 하에서 균주를 진화시킵니다",
     "AI 에이전트로 실험실 도구를 만듭니다"]
```

Hero 문장 패턴:
- EN: `I <typewriter>.`
- KO: `<typewriter>` (한국어는 어순상 "저는" 생략하고 동사구가 한 줄 자립)

기존 명사형 라벨(`Methanotroph Engineer`, `Synthetic Biology Postdoc`, `Vibe Coder`)은 폐기.

### About narrative (압축안, 직접 카피)

```
EN — bio.en.json `about.paragraphs[0]`:
"Postdoctoral researcher at KRIBB C1 Team. My PhD at UNIST traced how
Methylorubrum extorquens reorganizes C1 metabolism under sustained
methanol stress through 700+ generation ALE coupled with multi-omics
and AlphaFold3 structural analysis. At KRIBB I extend the same axis
to new methanotroph hosts and build the dry-lab tooling on top of
AI coding agents so the wet-lab cycle never has to wait."

KO — bio.ko.json `about.paragraphs[0]`:
"한국생명공학연구원(KRIBB) C1 팀 박사후연구원. UNIST 박사 과정에서
Methylorubrum extorquens가 장기간 메탄올 스트레스 하에서 C1 대사를
어떻게 재편하는지를 700세대 이상의 ALE와 멀티오믹스, AlphaFold3
구조 분석으로 추적했습니다. KRIBB에서는 같은 축을 새로운 메탄자화균
숙주로 확장하고, AI 코딩 에이전트 위에 dry lab 도구를 쌓아 wet lab
주기가 멈추지 않도록 합니다."
```

기존 `about.lede` + `about.paragraphs[0..1]` 3문단은 전부 위 한 문단으로 대체.

Education / Experience / Skills 섹션 골격은 v0.02 그대로.

### Software cards (2장)

```json
[
  {
    "slug": "kuma",
    "title": "kuma",
    "tagline_en": "Integrated primer design and Nanopore NGS verification (Kuro + Mame modules)",
    "tagline_ko": "프라이머 설계(Kuro)와 Nanopore NGS 검증(Mame)을 통합한 데스크탑 앱",
    "description_en": "Desktop app for the wet-lab primer-to-validation loop. Kuro module handles batch SDM and standard primer design; Mame module pulls reads from a Nanopore run and reports per-target coverage and variant calls.",
    "description_ko": "프라이머 설계부터 검증까지 wet lab 루프를 데스크탑에서 처리합니다. Kuro 모듈은 batch SDM과 일반 프라이머 설계를, Mame 모듈은 Nanopore 런 결과의 target별 coverage와 변이 콜링을 담당합니다.",
    "stack": ["Tauri v2", "Rust", "React", "Python", "Nanopore"],
    "github": "https://github.com/gyuminlee-repo/kuma",
    "show_repo_link": true,
    "featured": true,
    "year": "2025–present"
  },
  {
    "slug": "primerbench",
    "title": "PrimerBench",
    "tagline_en": "Cross-platform PCR primer designer with off-target checks",
    "tagline_ko": "Off-target 특이성 검사 포함 크로스플랫폼 PCR 프라이머 설계 앱",
    "description_en": "Standalone PCR primer GUI built for routine cloning work. Wraps primer3 + BLAST off-target checks and ships as a single binary across macOS/Windows.",
    "description_ko": "일상적인 클로닝 작업용으로 만든 독립 PCR 프라이머 GUI. primer3 + BLAST off-target 검사를 묶어 macOS/Windows 단일 바이너리로 배포합니다.",
    "stack": ["Tauri v2", "Rust", "React", "Python", "primer3"],
    "github": null,
    "show_repo_link": false,
    "featured": true,
    "year": "2025–present"
  }
]
```

`has_minidemo` 필드 제거. `kuro`, `hermes-universe`, `scout-feed`, `qol` 엔트리 삭제.

### Entry nav cards (3장)

각 카드는 large surface (≥ 180px 높이), `<a href="#about">` 같은 anchor scroll.

| Card | EN label | KO label | Anchor | Subline |
|---|---|---|---|---|
| 1 | About | 소개 | `#about` | `Bio · Education · Experience · Skills` |
| 2 | Software | 소프트웨어 | `#software` | `2 production tools` (or `2개의 도구`) |
| 3 | Publications | 논문 | `#publications` | `Live from Google Scholar` (or `Scholar에서 자동`) |

## Files affected

### 신규
- `src/components/sections/EntryNav.astro` — Hero 하단에 3 카드 그리드. lang prop.

### 수정
- `src/components/sections/Hero.astro`
  - 동사구 typewriter로 라벨 props 교체
  - `I <Typewriter ... />` 문장 패턴으로 변경 (KO는 어순 다름)
  - 기존 eyebrow + bio + CTA + scroll cue는 유지하되 짧게
  - Hero 하단에 `<EntryNav lang={lang} />` 마운트
  - `min-h-[88vh]` 유지 (CLS 0 보존)
- `src/islands/Typewriter.tsx`
  - `DEFAULT_LABELS` 동사구 3개로 교체 (위 카피)
- `src/components/sections/About.astro`
  - `paragraphs` 렌더 로직은 그대로. 데이터만 1문단으로 줄어듦
- `src/data/bio.en.json`, `src/data/bio.ko.json`
  - `about.lede` 삭제 또는 빈 값
  - `about.paragraphs` = 위 1문단으로 교체
  - `meta` / `education` / `experience` / `skills` 변경 없음
- `src/data/projects.json`
  - kuma + primerbench만 남김
  - `has_minidemo` 필드 키 삭제 (배열 모든 항목)
- `src/components/SoftwareCard.astro`
  - `has_minidemo` 분기 + `data-minidemo-trigger` anchor 코드 제거
- `src/pages/index.astro`, `src/pages/ko/index.astro`
  - `import KuroDemo` + `<section id="kuro-demo">` 블록 제거
  - 기타 import / 섹션 순서는 그대로
- `src/islands/CmdK.tsx`
  - Projects 카테고리에서 kuro/hermes-universe/scout-feed/qol 제거
  - kuma + primerbench 2개만 노출

### 삭제
- `src/islands/KuroDemo.tsx`
- `src/components/sections/KuroDemo*.astro` (있다면)

### 변경 없음 (out of scope)
- `src/styles/global.css` — CLS 해결 코드 (v0.02.05.01) 유지
- `src/components/sections/{Nav,Footer,Publications}.astro`
- `src/components/{PublicationList,ScholarMetrics,ScholarChart}.astro`
- `src/islands/AskWidget.tsx` + `functions/api/ask.ts`
- Scholar sync pipeline + i18n translate pipeline

## Verification

```bash
cd /Users/gml/_workspace/personal-site
bun run typecheck   # 0 errors
bun run build       # exit 0, 2 pages, dist OK
```

수동 시각 확인:
- `/` 진입면 = Hero (이름 + typewriter 문장) + 3 nav 카드 + scroll cue. 첫 viewport에서 카드 3장 모두 보일 것.
- 스크롤 ↓ → About (1문단 narrative + Education + Experience + Skills) → Software (2 카드) → Publications (Scholar metrics + chart + 리스트) → Footer.
- KURO demo 섹션 부재 확인.
- ⌘K → Projects 카테고리에 kuma + PrimerBench만.
- `/ko/` 동일 흐름 + KO 카피.

Lighthouse 재측정은 변경 폭이 작아 생략 가능. 회귀 의심 시 v0.02.05.01 기준 비교.

## Out of scope (이 리비전)

- 폰트 / 색상 / 토큰 변경
- 새 페이지 (`/research`, `/now` 등)
- Cmd+K UI 디자인 변경
- AI Q&A 백엔드 변경
- 사진/avatar 추가
- 커스텀 도메인
- Owner 확인 8건 (`notes/deploy/checklist.md` § Owner confirmation items) — 별도 라운드

## Risks

- `bio.{en,ko}.json` 키 구조 변경 (`lede` 삭제, `paragraphs` 축소) 시 About.astro가 `t('about.lede')` 등을 참조하면 빌드 에러 발생 → 컴포넌트도 동시 수정.
- CmdK Projects 항목 줄이면 fuzzy 검색 결과가 단조로워짐 — 의도된 결과.
- KuroDemo import가 페이지 외 곳(Layout 등)에서 참조되면 빌드 깨짐 → grep으로 확인 필요.
- Hero 진입면 카드 3장이 모바일에서 viewport 밑으로 내려가면 "짧은 Hero" 효과 약화 → 모바일에서 카드 크기 축소 또는 횡 스와이프 처리 검토.
