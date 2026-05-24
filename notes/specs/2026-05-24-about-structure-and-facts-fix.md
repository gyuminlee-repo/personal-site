# About 구조화 + 사실 정정 (v0.04.06.x)

날짜: 2026-05-24
선행: `notes/specs/2026-05-24-personal-homepage-v4-multipage.md` + content patch `ed6e3cd`

## Context

About narrative 1문단(2-3문장)이 정보 밀도 높아 답답함. 구조화 필요. 동시에 사실 두 가지 정정:
- KRIBB 시작 시점은 **2026** (시드 데이터 "2025–present" 잘못)
- 2026-05-29 세미나는 **고려대 초청** (이전 patch에서 "UNIST 화공생명공학부"로 잘못 처리됨)

## Decisions

| # | 결정 | 값 |
|---|---|---|
| D1 | About narrative 구조 | A — 짧은 lead 1문장 + bullet 3개 (Research / Methods / Tools) |
| D2 | bullet 콘텐츠 (locked) | 아래 §Copy 참조 |
| D3 | About.astro 렌더 | `<p>` lead + `<dl>` 또는 `<ul>` 3-item. lang prop으로 EN/KO 분기. italic helper 재사용 |
| D4 | bio.{en,ko}.json schema 확장 | `about.lead: string` + `about.facets: [{label, body}]` 추가. 기존 `paragraphs`는 lead로 압축, facets 신규 |
| D5 | 사실 정정 — "2025–present" 전부 | "2026–present" (bio experience.period + projects.json year + Now 데이터 ·  presentation entries 등) |
| D6 | 사실 정정 — 5/29 세미나 | venue: "고려대학교" / "Korea University", audience: "초청 세미나 (학과·연구실 단위)" / "Invited seminar (department/lab)", date: **2026-05-29** (기존 2026-05-23 entry를 이 entry로 갱신 또는 신규로 추가 후 23일 entry 제거) |

## Copy — locked

### About lead + 3 bullets (EN)

```
lead:   "Postdoctoral researcher at KRIBB Center for Synthetic Biology, working on C1 microbe engineering with AI coding agents in the loop."

facets:
- label: "Research"
  body:  "Methanotroph and methylotroph engineering for C1 chemistry. Adaptive laboratory evolution (ALE) of *Methylorubrum extorquens* under methanol stress (700+ generations, PhD work at UNIST)."
- label: "Methods"
  body:  "Whole-genome sequencing + RNA-seq + AlphaFold3 structural analysis to read mutations as a coherent stress-response network."
- label: "Tools"
  body:  "Custom dry-lab tooling on top of AI coding agents — primer design, NGS verification, lab notebook automation — so the wet-lab cycle never has to wait."
```

### About lead + 3 bullets (KO)

```
lead:  "한국생명공학연구원(KRIBB) 합성생물학연구센터 박사후연구원. AI 코딩 에이전트를 결합한 C1 미생물 공학을 합니다."

facets:
- label: "연구"
  body:  "C1 화학용 메탄자화균·메틸영양균 공학. UNIST 박사 과정에서 *Methylorubrum extorquens*를 메탄올 스트레스 하에서 700세대 이상 ALE."
- label: "방법"
  body:  "전장 유전체 시퀀싱 + RNA-seq + AlphaFold3 구조 분석으로 변이를 일관된 스트레스 응답 네트워크로 해석."
- label: "도구"
  body:  "AI 코딩 에이전트 위에 dry-lab 도구를 직접 만듭니다 — 프라이머 설계, NGS 검증, lab notebook 자동화 — wet-lab 주기가 멈추지 않도록."
```

## Architecture

### Schema change (`bio.en.json` / `bio.ko.json`)

```jsonc
"about": {
  "heading": "About",            // 유지
  "lead": "<one sentence>",      // 신규
  "facets": [                    // 신규 — array of {label, body}
    { "label": "Research", "body": "..." },
    { "label": "Methods",  "body": "..." },
    { "label": "Tools",    "body": "..." }
  ]
  // "paragraphs" 키 삭제 (또는 빈 배열로 보존)
  // "lede" 는 이전 patch에서 삭제됨
}
```

### Render (`src/components/sections/About.astro`)

```astro
---
import { italicize } from '../../lib/italic';
const t = bio.about;
---
<section id="about" class="...">
  <h2>{t.heading}</h2>
  <p class="text-lg md:text-xl text-muted-foreground max-w-prose" set:html={italicize(t.lead)} />
  <dl class="mt-8 grid gap-4 md:grid-cols-3">
    {t.facets.map((f) => (
      <div class="rounded-md border border-border bg-card p-5 md:p-6">
        <dt class="text-xs uppercase tracking-wide text-primary mb-2">{f.label}</dt>
        <dd class="text-sm text-foreground" set:html={italicize(f.body)} />
      </div>
    ))}
  </dl>
</section>
```

CvFull.astro 도 같은 schema 사용 — paragraphs 참조를 lead + facets로 교체.

### 사실 정정 grep 범위

**"2025–present" → "2026–present"**: 영향 가능 위치
- `src/data/bio.{en,ko}.json` — experience.items[*].period
- `src/data/projects.json` — projects[*].year
- `src/data/now.json` — updated_at은 무관
- `functions/api/ask.ts` — SITE_CONTEXT 본문에 연도 있으면

**"UNIST 화공생명공학부 초청" / "양동수 교수님 연구실" → "고려대학교 초청 세미나"**:
- `src/data/presentations.json` — 2026-05-23 entry를 2026-05-29 / 고려대로 갱신 (entry 1개 update, 추가/삭제 아님)
- venue_en: "Korea University", venue_ko: "고려대학교"
- audience_en: "Invited seminar (department / faculty)", audience_ko: "초청 세미나 (학과·교수진)"

## Verification

```bash
cd /Users/gml/_workspace/personal-site
bun run typecheck   # 0 errors
bun run build       # exit 0, 16 routes
```

수동 grep:
- `grep -rln "2025–present\|2025-present" src/ functions/` → 0
- `grep -rln "양동수\|UNIST 화공생명" src/ functions/` → 0
- `grep -rln "고려대\|Korea University" src/ functions/` → ≥1
- `grep -rln "Postdoctoral researcher at KRIBB Center for Synthetic Biology" src/` → 1 (EN lead)
- `grep -rln "한국생명공학연구원.*박사후연구원" src/` → 1 (KO lead)
- `grep -c "Research\|Methods\|Tools" dist/about/index.html` → ≥3
- `grep -c "연구\|방법\|도구" dist/ko/about/index.html` → ≥3

## Out of scope

- bio.{en,ko}.json 의 다른 섹션 (education / experience / skills)
- 디자인 토큰
- Software / Publications / Posts / CV / Contact 페이지 (lead/facets 콘셉트 차용은 별도 라운드)
- vault posts sync 활성화

## Risks

- `paragraphs` 키를 삭제하면 다른 컴포넌트(CvFull.astro)가 참조하던 부분이 깨질 수 있음 → CvFull.astro 도 동시에 lead/facets로 갱신.
- `facets[*].body`에 markdown italic 들어가므로 italic helper 적용 필수. 안 하면 `*Methylorubrum*` 그대로 노출.
- KO i18n 빌드시 번역이 schema 신규 키 (lead, facets) 인지 못하면 빈 값 fallback. translate_build.ts MAPPINGS에 추가 매핑 필요 없음 (같은 파일 walk).
