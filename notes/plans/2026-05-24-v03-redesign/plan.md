# v0.03 Single-page redesign — 구현 계획

**Mode**: `hold` · **Spec**: `notes/specs/2026-05-24-personal-homepage-v3-redesign.md` @ commit `bc0ad2e`
**Base**: branch `feat/v0.02-rebuild` HEAD `bc0ad2e` (위 spec 직전 = `fc2c50a` v0.02.05.01)

**목표**: Hero 진입면 압축 + Software 카드 6→2 + KURO mini-demo 제거 + Hero 문장 패턴/카피 교체 + About narrative 압축.

**아키텍처**: 기존 Astro 4 / React island / shadcn 토큰 그대로. 구조 변경 없음. 데이터(JSON) 갱신과 컴포넌트 5-6개 수정 + 1개 신규 컴포넌트 + 1개 island 삭제로 구성.

**기술 스택**: 변경 없음. Astro 4.16 + Tailwind 3.4 + React 18 + cmdk + lucide-react + Bun.

---

## Files mapped

| 종류 | 경로 | 책임 |
|---|---|---|
| 신규 | `src/components/sections/EntryNav.astro` | Hero 하단 3 카드 (About/Software/Publications), lang prop |
| 수정 | `src/components/sections/Hero.astro` | "I [typewriter]" 패턴 문장 + KO 어순 + EntryNav 마운트 + 기존 CTA/scroll cue 정리 |
| 수정 | `src/islands/Typewriter.tsx` | `DEFAULT_LABELS` 동사구 3개로 교체 (EN+KO) |
| 수정 | `src/data/bio.en.json` | `about.lede` 삭제 · `about.paragraphs` = 1문단 |
| 수정 | `src/data/bio.ko.json` | 동일 구조 + KO 카피 |
| 수정 | `src/components/sections/About.astro` | `t('about.lede')` 등 lede 참조 제거 |
| 수정 | `src/data/projects.json` | kuma + primerbench 2장만, `has_minidemo` 키 전부 삭제 |
| 수정 | `src/components/SoftwareCard.astro` | `has_minidemo` 분기 + `data-minidemo-trigger` anchor 제거 |
| 수정 | `src/pages/index.astro` | `import KuroDemo` + `<section id="kuro-demo">` 블록 삭제 |
| 수정 | `src/pages/ko/index.astro` | 동일 |
| 수정 | `src/islands/CmdK.tsx` | Projects 카테고리에서 kuro/hermes-universe/scout-feed/qol 제거 |
| 삭제 | `src/islands/KuroDemo.tsx` | 완전 제거 |

테스트 파일 없음. 검증은 `bun run typecheck` + `bun run build` + `bun run preview` 시각 sanity로 갈음 (Astro 컴포넌트 단위 테스트 부재 — 기존 v0.02 관례 따름).

---

## Tasks

태스크는 충돌 회피를 위해 **데이터 먼저 → 컴포넌트 → 페이지 wiring → 검증** 순. 단일 agent 직렬 실행 권장.

### Task 1: 데이터 갱신 (bio + projects)

**파일:**
- 수정: `src/data/bio.en.json`, `src/data/bio.ko.json`, `src/data/projects.json`

- [ ] **Step 1.1**: 현재 `bio.en.json` head 확인 (구조 파악):
  ```bash
  cd /Users/gml/_workspace/personal-site
  python3 -c "import json; d=json.load(open('src/data/bio.en.json')); print(list(d.keys())); print(list(d['about'].keys()))"
  ```
  예상: `about` 키에 `heading`/`lede`/`paragraphs` 존재 확인.

- [ ] **Step 1.2**: `bio.en.json` 편집 — `about.lede` 키 삭제 (또는 빈 문자열), `about.paragraphs`를 단일 문단으로:
  ```
  "Postdoctoral researcher at KRIBB C1 Team. My PhD at UNIST traced how Methylorubrum extorquens reorganizes C1 metabolism under sustained methanol stress through 700+ generation ALE coupled with multi-omics and AlphaFold3 structural analysis. At KRIBB I extend the same axis to new methanotroph hosts and build the dry-lab tooling on top of AI coding agents so the wet-lab cycle never has to wait."
  ```

- [ ] **Step 1.3**: `bio.ko.json` 동일하게 갱신:
  ```
  "한국생명공학연구원(KRIBB) C1 팀 박사후연구원. UNIST 박사 과정에서 Methylorubrum extorquens가 장기간 메탄올 스트레스 하에서 C1 대사를 어떻게 재편하는지를 700세대 이상의 ALE와 멀티오믹스, AlphaFold3 구조 분석으로 추적했습니다. KRIBB에서는 같은 축을 새로운 메탄자화균 숙주로 확장하고, AI 코딩 에이전트 위에 dry lab 도구를 쌓아 wet lab 주기가 멈추지 않도록 합니다."
  ```

- [ ] **Step 1.4**: `projects.json` 편집 — kuro/hermes-universe/scout-feed/qol 4개 항목 삭제, kuma + primerbench 2개 남김. 모든 항목에서 `has_minidemo` 키 삭제. kuma의 tagline/description은 spec § Software cards 카피 그대로 사용.

- [ ] **Step 1.5**: JSON 유효성 확인:
  ```bash
  for f in src/data/bio.en.json src/data/bio.ko.json src/data/projects.json; do
    python3 -c "import json; json.load(open('$f')); print('OK $f')"
  done
  ```
  예상: 3개 모두 `OK`.

- [ ] **Step 1.6**: 커밋
  ```bash
  git add src/data/bio.en.json src/data/bio.ko.json src/data/projects.json
  git commit --quiet -m "v0.03.00.00: bio narrative + projects (kuma + primerbench)"
  ```

**verify_command**: `bash -lc 'cd /Users/gml/_workspace/personal-site && for f in src/data/bio.en.json src/data/bio.ko.json src/data/projects.json; do python3 -c "import json; json.load(open(\"$f\"))" || exit 1; done'`

---

### Task 2: About + SoftwareCard 컴포넌트 정리

**파일:**
- 수정: `src/components/sections/About.astro`
- 수정: `src/components/SoftwareCard.astro`

- [ ] **Step 2.1**: `About.astro`에서 `lede` 참조 확인:
  ```bash
  grep -n 'lede' src/components/sections/About.astro
  ```
  매칭된 라인을 paragraphs 렌더 코드만 남기는 형태로 정리.

- [ ] **Step 2.2**: `SoftwareCard.astro`에서 `has_minidemo` + `data-minidemo-trigger` 분기 제거:
  ```bash
  grep -n 'minidemo' src/components/SoftwareCard.astro
  ```
  관련 분기 블록(아마 conditional `{project.has_minidemo && ...}` 형태) 제거. 카드 footer에는 GitHub link만 남김 (or `show_repo_link: false`인 경우 "Private tool" placeholder).

- [ ] **Step 2.3**: 빌드 통과 확인
  ```bash
  bun run typecheck 2>&1 | tail -5
  bun run build 2>&1 | tail -10
  ```
  둘 다 exit 0 필요.

- [ ] **Step 2.4**: 커밋
  ```bash
  git add src/components/sections/About.astro src/components/SoftwareCard.astro
  git commit --quiet -m "v0.03.00.01: remove about.lede + minidemo branch from card"
  ```

**verify_command**: `bash -lc 'cd /Users/gml/_workspace/personal-site && bun run typecheck >/dev/null 2>&1 && bun run build >/dev/null 2>&1'`

---

### Task 3: KuroDemo 제거 (island + 페이지 wiring + CmdK 정리)

**파일:**
- 삭제: `src/islands/KuroDemo.tsx`
- 수정: `src/pages/index.astro`, `src/pages/ko/index.astro`
- 수정: `src/islands/CmdK.tsx`

- [ ] **Step 3.1**: 두 페이지에서 KuroDemo 참조 위치 확인
  ```bash
  grep -n 'KuroDemo\|kuro-demo' src/pages/index.astro src/pages/ko/index.astro
  ```

- [ ] **Step 3.2**: 각 페이지에서 `import KuroDemo` 라인 삭제 + `<section id="kuro-demo">…</section>` 블록 삭제. 다른 섹션 순서는 그대로.

- [ ] **Step 3.3**: `git rm src/islands/KuroDemo.tsx`

- [ ] **Step 3.4**: `CmdK.tsx`의 `projects` 배열에서 kuro/hermes-universe/scout-feed/qol 4개 항목 제거. kuma + primerbench 2개만 남김.

- [ ] **Step 3.5**: `grep -r 'KuroDemo' src/` — 잔여 참조 0 확인.

- [ ] **Step 3.6**: 빌드 통과
  ```bash
  bun run typecheck 2>&1 | tail -5
  bun run build 2>&1 | tail -10
  ```

- [ ] **Step 3.7**: 커밋
  ```bash
  git add -A
  git commit --quiet -m "v0.03.00.02: remove KuroDemo island + cmd-k Projects cleanup"
  ```

**verify_command**: `bash -lc 'cd /Users/gml/_workspace/personal-site && ! grep -rq "KuroDemo" src/ && bun run typecheck >/dev/null 2>&1 && bun run build >/dev/null 2>&1'`

---

### Task 4: Typewriter labels + Hero 문장 패턴

**파일:**
- 수정: `src/islands/Typewriter.tsx`
- 수정: `src/components/sections/Hero.astro`

- [ ] **Step 4.1**: `Typewriter.tsx`의 `DEFAULT_LABELS` 교체:
  ```ts
  const DEFAULT_LABELS: Record<'en' | 'ko', string[]> = {
    en: ['engineer methane-eating microbes', 'evolve strains under stress', 'ship lab tools with AI agents'],
    ko: ['메탄을 먹는 미생물을 공학합니다', '스트레스 하에서 균주를 진화시킵니다', 'AI 에이전트로 실험실 도구를 만듭니다'],
  };
  ```

- [ ] **Step 4.2**: `Hero.astro` 영문 본문 — `<p>I {typewriter}.</p>` 패턴으로 갱신. 기존 명사형 라벨용 텍스트("I build" 등)를 동사구 패턴으로 교체. Typewriter slot 그대로 (min-w/min-h 유지, CLS 0 보존).

- [ ] **Step 4.3**: 한국어 어순 처리 — `lang === 'ko'`인 경우 `<p>{typewriter}</p>` (1인칭 주어 생략), EN은 `I {typewriter}.`로 분기. 동사구가 한 줄 자립.

- [ ] **Step 4.4**: 빌드 + typecheck 통과
  ```bash
  bun run typecheck 2>&1 | tail -5
  bun run build 2>&1 | tail -10
  ```

- [ ] **Step 4.5**: 커밋
  ```bash
  git add src/islands/Typewriter.tsx src/components/sections/Hero.astro
  git commit --quiet -m "v0.03.00.03: typewriter verb phrases + I-pattern hero"
  ```

**verify_command**: `bash -lc 'cd /Users/gml/_workspace/personal-site && bun run typecheck >/dev/null 2>&1 && bun run build >/dev/null 2>&1 && grep -q "engineer methane-eating microbes" src/islands/Typewriter.tsx'`

---

### Task 5: EntryNav 신규 + Hero 하단 마운트

**파일:**
- 신규: `src/components/sections/EntryNav.astro`
- 수정: `src/components/sections/Hero.astro`

- [ ] **Step 5.1**: `EntryNav.astro` 작성. 3 카드 (About/Software/Publications) anchor scroll. 카드 구조:
  ```astro
  ---
  interface Props { lang: 'en' | 'ko'; }
  const { lang } = Astro.props;
  const cards = lang === 'ko'
    ? [
        { label: '소개',       sub: 'Bio · Education · Experience · Skills', href: '#about' },
        { label: '소프트웨어', sub: '도구 2개',                                href: '#software' },
        { label: '논문',       sub: 'Scholar에서 자동 동기화',                  href: '#publications' },
      ]
    : [
        { label: 'About',        sub: 'Bio · Education · Experience · Skills', href: '#about' },
        { label: 'Software',     sub: '2 production tools',                      href: '#software' },
        { label: 'Publications', sub: 'Live from Google Scholar',                href: '#publications' },
      ];
  ---
  <nav aria-label="Section navigation" class="mt-12 grid gap-4 sm:grid-cols-3 max-w-grid mx-auto px-6 md:px-12">
    {cards.map((c) => (
      <a
        href={c.href}
        class="group block rounded-md border border-border bg-card p-6 md:p-8 transition-colors duration-slow ease-emphasized hover:border-primary/40 min-h-[180px] flex flex-col justify-between"
      >
        <span class="text-2xl font-semibold tracking-tight group-hover:text-primary transition-colors">{c.label}</span>
        <span class="text-sm text-muted-foreground">{c.sub}</span>
      </a>
    ))}
  </nav>
  ```

- [ ] **Step 5.2**: `Hero.astro`에 `import EntryNav from './EntryNav.astro';` 추가 + Hero 본문 (이름+typewriter+bio+CTA) 하단에 `<EntryNav lang={lang} />` 마운트. 기존 scroll cue는 EntryNav 아래로 이동 또는 제거 (카드 자체가 scroll 유도).

- [ ] **Step 5.3**: 빌드 + typecheck
  ```bash
  bun run typecheck 2>&1 | tail -5
  bun run build 2>&1 | tail -10
  ```

- [ ] **Step 5.4**: 커밋
  ```bash
  git add src/components/sections/EntryNav.astro src/components/sections/Hero.astro
  git commit --quiet -m "v0.03.00.04: EntryNav 3-card grid + Hero mount"
  ```

**verify_command**: `bash -lc 'cd /Users/gml/_workspace/personal-site && bun run typecheck >/dev/null 2>&1 && bun run build >/dev/null 2>&1 && test -f src/components/sections/EntryNav.astro && grep -q "EntryNav" src/components/sections/Hero.astro'`

---

### Task 6: 통합 검증 + 시각 sanity

**파일:** 코드 변경 없음. 검증 + 보고서 기록.

- [ ] **Step 6.1**: 최종 typecheck + build
  ```bash
  cd /Users/gml/_workspace/personal-site
  bun run typecheck 2>&1 | tail -10
  bun run build 2>&1 | tail -20
  ```
  둘 다 exit 0.

- [ ] **Step 6.2**: dist HTML grep 검증
  ```bash
  grep -c 'engineer methane-eating microbes' dist/index.html         # ≥1 (typewriter SSR)
  grep -c 'kuro-demo'                       dist/index.html dist/ko/index.html  # 0 (KuroDemo 제거)
  grep -c 'EntryNav\|소프트웨어\|Publications' dist/ko/index.html     # ≥1
  grep -c 'kuma'                            dist/index.html           # ≥1 (Software 카드)
  ```

- [ ] **Step 6.3** (선택): preview + Chrome DevTools MCP로 진입면 + 스크롤 흐름 1회 스크린샷 → `notes/verify/screenshots/v0.03-*`. 토큰 절약 위해 verifier가 필요하면 후속.

- [ ] **Step 6.4**: 보고서 작성 + 마지막 커밋(보고서만 있을 때)
  보고서 경로: `/Users/gml/.claude/jobs/e5c4df14/v03_redesign.md`
  - 6개 task별 결과
  - 총 커밋 SHA 리스트
  - 검증 grep 결과
  - 잔여 issue (있다면)

**verify_command**: `bash -lc 'cd /Users/gml/_workspace/personal-site && bun run typecheck >/dev/null 2>&1 && bun run build >/dev/null 2>&1 && [ -z "$(grep -l "kuro-demo\|KuroDemo" dist/ 2>/dev/null)" ]'`

---

## Verification (전체)

1. typecheck 0 errors, build exit 0
2. dist에 KuroDemo / kuro-demo 참조 0
3. dist EN+KO에 typewriter 첫 라벨 + EntryNav 카드 + 2개 Software 카드 렌더됨
4. (선택) preview 환경에서 hero 진입면 카드 3장 viewport 안 가시 + 스크롤 시 About → Software → Publications 순 등장
5. (선택) /ko/에서 동일 흐름 + KO 카피

## Confidence check (write-plan 자체 점검)

| 축 | 점수 | 사유 |
|---|---|---|
| Completeness | 5 | 9개 spec 작업이 6 task에 1:1+로 매핑. 누락 없음 |
| Clarity | 5 | 각 step에 정확한 명령 + 파일 경로 + 예상 출력 |
| Feasibility | 5 | 기존 스택 그대로, 신규 의존성 0, 모든 변경이 이전 작업과 같은 패턴 |

**Total**: 15/15. 진행 가능.

## Out of scope

- 폰트/색상/디자인 토큰 변경
- Lighthouse 재측정 (변경 폭 작음, v0.02.05.01 기준 회귀 없을 것으로 가정)
- 새 페이지
- 사진/avatar
- Owner 확인 8건
- push, deploy
