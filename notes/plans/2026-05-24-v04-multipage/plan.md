# v0.04 Multi-page redesign — 구현 계획

**Mode**: `shape` · **Spec**: `notes/specs/2026-05-24-personal-homepage-v4-multipage.md` @ commit `8c1bea1`
**Base**: branch `feat/v0.02-rebuild` HEAD `8c1bea1` (v0.03 결과 위에서 진행)

**목표**: 단일 페이지를 8 메뉴 멀티 페이지로 전환 + Obsidian vault 자동 sync Posts feed 추가.

**아키텍처**: Astro routing 14+ 페이지 (EN 7 + KO 7 + posts dynamic), Astro Content Collection으로 Posts 관리, Python sync 스크립트 + GHA cron으로 vault → repo 변환. 기존 Vibe Layer / Scholar sync / i18n / 디자인 토큰은 그대로 유지하되 마운트 포인트만 페이지 분산.

**기술 스택**: Astro 4.16 + Content Collections (zod schema) + Tailwind + React island + Python 3.12 (scholarly 패턴 재사용) + GitHub Actions + Bun.

---

## Files mapped (spec § Files affected 참조)

요약 — 상세는 spec.

- **신규 페이지 (14)**: `src/pages/{about,tools,publications,presentations,cv,contact}.astro`, `src/pages/posts/{index,[slug]}.astro`, `src/pages/posts/feed.xml.ts` + 모든 EN 페이지의 `/ko/` 미러
- **신규 컴포넌트**: `src/components/sections/{Now,Latest}.astro`, `src/components/{PostCard,PresentationItem,CvDownloadButton,ContactInfo}.astro`
- **신규 데이터**: `src/data/{now,presentations}.json`, `src/content/config.ts` (posts collection)
- **신규 파이프라인**: `scripts/posts_sync.py`, `.github/workflows/posts-sync.yml`
- **신규 자산**: `public/이규민_CV.pdf`, `public/images/posts/.gitkeep`
- **수정**: `src/pages/{index.astro,ko/index.astro}` (Home 재구성), `src/components/sections/{Nav,Hero}.astro`, `src/islands/CmdK.tsx`, `src/layouts/Base.astro` (canonical + hreflang)
- **삭제**: `src/components/sections/EntryNav.astro` (v0.03 산출물)

---

## Tasks (5 waves)

### Wave 0 — Foundation: 데이터 + 자산 (병렬)

#### Task 1.1: Content Collection + 데이터 시드

**파일:**
- 생성: `src/content/config.ts`
- 생성: `src/data/now.json`
- 생성: `src/data/presentations.json`
- 생성: `src/content/posts/.gitkeep`

- [ ] **Step 1.1.1**: `src/content/config.ts` — posts collection 등록 (spec § Astro Content Collection 코드 그대로)

- [ ] **Step 1.1.2**: `src/data/now.json` 작성 (spec § Now 초기 카피 그대로):
  ```json
  {
    "updated_at": "2026-05-24",
    "items_en": ["ALE paper revision...", "PrimerBench: off-target...", "Wiring KRIBB C1..."],
    "items_ko": ["ALE 1저자 논문...", "PrimerBench: 신규...", "KRIBB C1 lab..."]
  }
  ```

- [ ] **Step 1.1.3**: `src/data/presentations.json` 시드 (KRIBB seminar + 260523 양동수교수 세미나 + 260529 KRIBB Claude Code seminar 등 owner 알려진 발표 3-5개):
  ```json
  {
    "presentations": [
      {
        "title": "Claude Code agentic workflows for biotech",
        "title_ko": "Claude Code 에이전틱 워크플로우 (바이오텍)",
        "date": "2026-05-29",
        "venue": "KRIBB C1 Team Seminar",
        "audience": "internal lab"
      },
      {
        "title": "Methanol stress adaptation in M. extorquens via ALE",
        "title_ko": "ALE를 통한 M. extorquens 메탄올 스트레스 적응",
        "date": "2026-05-23",
        "venue": "양동수 교수 연구실 (UNIST)",
        "audience": "external"
      }
    ]
  }
  ```

- [ ] **Step 1.1.4**: JSON valid + typecheck
  ```bash
  cd /Users/gml/_workspace/personal-site
  python3 -c "import json; [json.load(open(f)) for f in ['src/data/now.json', 'src/data/presentations.json']]"
  bun run typecheck 2>&1 | tail -5
  ```

- [ ] **Step 1.1.5**: 커밋 `v0.04.00.00: content collection + now/presentations data seeds`

#### Task 1.2: CV PDF 자산 복사

**파일:**
- 생성: `public/이규민_CV.pdf` (복사: `cc/work/output/이규민_CV_세미나_양동수_260523.pdf`)
- 생성: `public/images/posts/.gitkeep`

- [ ] **Step 1.2.1**:
  ```bash
  cd /Users/gml/_workspace/personal-site
  cp /Users/gml/_workspace/cc/work/output/이규민_CV_세미나_양동수_260523.pdf public/이규민_CV.pdf
  mkdir -p public/images/posts
  touch public/images/posts/.gitkeep
  ls -la public/이규민_CV.pdf public/images/posts/
  ```

- [ ] **Step 1.2.2**: 커밋 `v0.04.00.01: CV PDF asset + posts images dir`

**verify_command**:
```bash
bash -lc 'cd /Users/gml/_workspace/personal-site && [ -f public/이규민_CV.pdf ] && [ -f src/content/config.ts ] && [ -f src/data/now.json ] && [ -f src/data/presentations.json ] && bun run typecheck >/dev/null 2>&1'
```

---

### Wave 1 — Nav + 메타 + 라벨 변경

#### Task 2.1: Software → Tools 라벨 + Nav 8 메뉴 + Base canonical

**파일:**
- 수정: `src/components/sections/Nav.astro`
- 수정: `src/layouts/Base.astro` (canonical + hreflang)
- 수정: `src/islands/CmdK.tsx` (Sections 카테고리 + 메뉴 8개)

- [ ] **Step 2.1.1**: Nav.astro 메뉴 8개로 갱신 (Home/About/Tools/Publications/Presentations/Posts/CV/Contact + EN/KO 라벨). `href`를 anchor (`#about`)에서 route (`/about`)로. `currentPath` prop 활용해 활성 메뉴 highlight.

- [ ] **Step 2.1.2**: Base.astro에 canonical + hreflang 메타 추가. props로 `path: string` 받아 `<link rel="canonical" href={`https://gyuminlee.dev${path}`} />` + `<link rel="alternate" hreflang="en" href=…/>` + `<link rel="alternate" hreflang="ko" href=…/>` + x-default.

- [ ] **Step 2.1.3**: CmdK.tsx Sections 카테고리 8 항목으로 (Home/About/Tools/Publications/Presentations/Posts/CV/Contact). `onSelect`를 `window.location.href = '/about'` 식 route navigation. Projects 카테고리는 기존(kuma+primerbench) 유지.

- [ ] **Step 2.1.4**: 빌드 (현재는 새 페이지 없어서 nav 링크가 404 가지만 build 자체는 통과)
  ```bash
  bun run typecheck 2>&1 | tail -5
  bun run build 2>&1 | tail -10
  ```

- [ ] **Step 2.1.5**: 커밋 `v0.04.01.00: Nav 8 menus + Tools label + canonical/hreflang + CmdK routes`

**verify_command**:
```bash
bash -lc 'cd /Users/gml/_workspace/personal-site && grep -q "Tools" src/components/sections/Nav.astro && grep -q "rel=\"canonical\"" src/layouts/Base.astro && grep -q "/about\|/tools\|/publications" src/islands/CmdK.tsx && bun run typecheck >/dev/null 2>&1 && bun run build >/dev/null 2>&1'
```

---

### Wave 2 — 신규 페이지 골격 (14 페이지 + 컴포넌트)

콘텐츠를 페이지로 옮긴다. 기존 섹션 컴포넌트(AboutSection, Software, Publications)는 페이지에서 그대로 import.

#### Task 3.1: 콘텐츠 페이지 6 + 신규 컴포넌트 4

**파일:**
- 생성: `src/pages/about.astro`, `tools.astro`, `publications.astro`, `presentations.astro`, `cv.astro`, `contact.astro`
- 생성: `src/components/PresentationItem.astro`, `CvDownloadButton.astro`, `ContactInfo.astro`
- 생성: `src/components/sections/PresentationsList.astro` (presentations.json 렌더)
- 생성: `src/components/sections/CvFull.astro` (HTML 풀버전)

- [ ] **Step 3.1.1**: 각 페이지 골격 동일 — `<Base path="/about" title="About — Gyumin Lee">` `<Nav currentPath="/about" />` `<main class="py-24"><AboutSection lang="en"/></main>` `<Footer/>` `</Base>`. tools.astro는 기존 `Software` 섹션 컴포넌트 그대로 마운트. publications.astro도 마찬가지.

- [ ] **Step 3.1.2**: presentations.astro — `PresentationsList.astro` 새로 작성 (presentations.json 읽어 역시간 리스트). 각 entry: title (lang dependent), date, venue, audience badge.

- [ ] **Step 3.1.3**: cv.astro — `CvFull.astro` 컴포넌트로 Bio + Edu + Exp + Skills + Pubs(요약) + Awards. 우상단 `<CvDownloadButton/>` (anchor `<a href="/이규민_CV.pdf" download>Download PDF</a>` + 아이콘).

- [ ] **Step 3.1.4**: contact.astro — `ContactInfo.astro` (이메일 / GitHub / Scholar / LinkedIn placeholder / KRIBB 주소). lucide-react 아이콘 인라인 SVG로.

- [ ] **Step 3.1.5**: 빌드 통과 + grep
  ```bash
  bun run typecheck 2>&1 | tail -5
  bun run build 2>&1 | tail -10
  ls dist/about dist/tools dist/publications dist/presentations dist/cv dist/contact 2>&1 | head -10
  ```

- [ ] **Step 3.1.6**: 커밋 `v0.04.02.00: EN page routes (about/tools/publications/presentations/cv/contact)`

#### Task 3.2: KO 미러 + Posts 페이지 골격

**파일:**
- 생성: `src/pages/ko/{about,tools,publications,presentations,cv,contact}.astro` (6)
- 생성: `src/pages/posts/index.astro`, `src/pages/posts/[slug].astro`, `src/pages/posts/feed.xml.ts`
- 생성: `src/pages/ko/posts/index.astro`, `src/pages/ko/posts/[slug].astro`
- 생성: `src/components/PostCard.astro`

- [ ] **Step 3.2.1**: KO 6 페이지 — EN 페이지 mirror, `<Base lang="ko" path="/ko/about" ...>` + 컴포넌트 prop `lang="ko"`.

- [ ] **Step 3.2.2**: posts/index.astro — `getCollection('posts')` 호출, `draft: false` 필터, date desc 정렬, PostCard 컴포넌트로 렌더. 빈 collection이면 "No posts yet" placeholder. KO 미러도.

- [ ] **Step 3.2.3**: posts/[slug].astro — `getStaticPaths`로 모든 post slug 생성, `render()`로 본문 + frontmatter (title, date, tags, cover_image). KO 미러 동일.

- [ ] **Step 3.2.4**: posts/feed.xml.ts — Astro RSS plugin (`@astrojs/rss`) 사용, `bun add @astrojs/rss`. site URL `https://gyuminlee.dev`, channel title/description, items = posts collection.

- [ ] **Step 3.2.5**: PostCard.astro — 제목 + 날짜 + tag chips + 짧은 excerpt + cover thumb. lang prop으로 KO/EN 카드 톤 미세 조정 가능 (지금은 동일).

- [ ] **Step 3.2.6**: 빌드 (posts collection 비어 있어 [slug] 페이지 0, index만)
  ```bash
  bun run typecheck 2>&1 | tail -5
  bun run build 2>&1 | tail -15
  ls dist/posts dist/ko 2>&1 | head -20
  ```

- [ ] **Step 3.2.7**: 커밋 `v0.04.02.01: KO mirror + posts routes + RSS feed`

**verify_command**:
```bash
bash -lc 'cd /Users/gml/_workspace/personal-site && for p in about tools publications presentations cv contact posts; do [ -f "src/pages/${p}.astro" ] || [ -d "src/pages/${p}" ] || { echo "missing $p"; exit 1; }; done && bun run typecheck >/dev/null 2>&1 && bun run build >/dev/null 2>&1 && [ -d dist/posts ] && [ -d dist/ko ]'
```

---

### Wave 3 — Posts sync + Home 재구성 + Cleanup

#### Task 4.1: Posts sync 파이프라인

**파일:**
- 생성: `scripts/posts_sync.py`
- 생성: `.github/workflows/posts-sync.yml`

- [ ] **Step 4.1.1**: `scripts/posts_sync.py` 작성. spec § Posts sync pipeline 흐름 그대로:
  - argparse: `--vault-dir PATH` `--dry-run`
  - vault folder 스캔 (`$OBSIDIAN_VAULT/999.Public/posts/*.md` 또는 `--vault-dir` arg)
  - 각 .md: frontmatter parse (python-frontmatter), wikilink `![[name.ext]]` regex 추출
  - 첨부 파일 위치 추정: vault `attachments/` 폴더 (relative)
  - copy 첨부 → `public/images/posts/<slug>/<filename>`, markdown wikilink를 `![](/images/posts/<slug>/<filename>)`로 치환
  - 출력 → `src/content/posts/<YYMMDD>-<slug>.md` (frontmatter + 변환된 body)
  - dry-run 모드: 변경 없이 변환 결과만 stdout
  - logging (T201 회피, `logging` 모듈 사용)

- [ ] **Step 4.1.2**: `.github/workflows/posts-sync.yml` (spec scholar-sync.yml 패턴 재사용):
  ```yaml
  name: Posts Sync
  on:
    schedule:
      - cron: '30 18 * * *'   # 03:30 KST
    workflow_dispatch:
  jobs:
    sync:
      runs-on: ubuntu-latest
      permissions: { contents: write }
      steps:
        - uses: actions/checkout@v5
        - uses: actions/checkout@v5
          with:
            repository: ${{ vars.VAULT_REPO }}
            token: ${{ secrets.VAULT_PAT }}
            path: __vault
        - uses: actions/setup-python@v6
          with: { python-version: '3.12' }
        - run: pip install --quiet python-frontmatter
        - run: python scripts/posts_sync.py --vault-dir __vault/999.Public/posts
        - name: Commit if changed
          run: |
            git config user.name 'vault-sync-bot'
            git config user.email 'bot@gyuminlee.dev'
            git add src/content/posts public/images/posts
            git --no-pager diff --staged --quiet && echo "no changes" || git commit --quiet -m "chore: posts sync $(date -u +%Y-%m-%d)" && git push --quiet
  ```

- [ ] **Step 4.1.3**: dry-run 테스트 (로컬, vault 폴더가 있다면)
  ```bash
  cd /Users/gml/_workspace/personal-site
  pip install --quiet --user python-frontmatter || pip3 install --quiet --user python-frontmatter
  python3 scripts/posts_sync.py --vault-dir "$OBSIDIAN_VAULT/999.Public/posts" --dry-run 2>&1 | head -20 || echo "vault folder may not exist yet — OK for v1"
  ```

- [ ] **Step 4.1.4**: 커밋 `v0.04.03.00: posts sync script + GHA workflow`

#### Task 4.2: Home 재구성 (Hero + Now + Latest 3) + Cleanup

**파일:**
- 생성: `src/components/sections/Now.astro`, `src/components/sections/Latest.astro`
- 생성: `src/lib/latest.ts`
- 수정: `src/pages/index.astro`, `src/pages/ko/index.astro` (Home 본문 교체)
- 수정: `src/components/sections/Hero.astro` (EntryNav 마운트 제거 + 정리)
- 삭제: `src/components/sections/EntryNav.astro`

- [ ] **Step 4.2.1**: `src/lib/latest.ts` 작성 (spec § Latest 3 카드 통합 로직 그대로). 시작 단계에 posts 없을 수 있으니 옵셔널 처리.

- [ ] **Step 4.2.2**: `Now.astro` — `now.json` 로드, lang prop으로 items_en/items_ko 분기, ul/li 렌더. "Last updated" 표시.

- [ ] **Step 4.2.3**: `Latest.astro` — `getLatest()` 호출, 3 카드 grid (Publication / Presentation / Post). 각 카드 클릭 → 해당 detail route.

- [ ] **Step 4.2.4**: index.astro / ko/index.astro 본문 — `<Hero/>` + `<Now/>` + `<Latest/>` + `<Footer/>`. 기존 About/Tools/Publications/KuroDemo 인라인 마운트 다 제거.

- [ ] **Step 4.2.5**: Hero.astro — v0.03 EntryNav 마운트 제거. typewriter + 1줄 bio + scroll cue만.

- [ ] **Step 4.2.6**: `git rm src/components/sections/EntryNav.astro`

- [ ] **Step 4.2.7**: 빌드 + typecheck
  ```bash
  bun run typecheck 2>&1 | tail -5
  bun run build 2>&1 | tail -10
  ```

- [ ] **Step 4.2.8**: 커밋 `v0.04.03.01: Home rebuild (Hero + Now + Latest 3) + EntryNav removal`

**verify_command**:
```bash
bash -lc 'cd /Users/gml/_workspace/personal-site && [ -f scripts/posts_sync.py ] && [ -f .github/workflows/posts-sync.yml ] && [ -f src/components/sections/Now.astro ] && [ -f src/components/sections/Latest.astro ] && [ -f src/lib/latest.ts ] && [ ! -f src/components/sections/EntryNav.astro ] && bun run typecheck >/dev/null 2>&1 && bun run build >/dev/null 2>&1'
```

---

### Wave 4 — 통합 검증

#### Task 5.1: 전체 빌드 + dist HTML grep + 보고서

**파일:** 코드 변경 없음. 검증 + 보고서.

- [ ] **Step 5.1.1**: clean build
  ```bash
  cd /Users/gml/_workspace/personal-site
  rm -rf dist .astro
  bun run typecheck 2>&1 | tail -10
  bun run build 2>&1 | tail -20
  ```
  exit 0 + 모든 페이지 빌드.

- [ ] **Step 5.1.2**: route 존재 확인
  ```bash
  for r in / about tools publications presentations posts cv contact; do
    [ -f "dist${r}/index.html" ] || [ -f "dist${r}.html" ] || echo "MISSING: $r"
  done
  for r in / about tools publications presentations posts cv contact; do
    [ -f "dist/ko${r}/index.html" ] || [ -f "dist/ko${r}.html" ] || echo "MISSING: /ko${r}"
  done
  ```

- [ ] **Step 5.1.3**: dist HTML 콘텐츠 확인
  ```bash
  grep -c 'Gyumin Lee' dist/index.html              # Hero name
  grep -c 'href="/about"\|href="/tools"\|href="/publications"' dist/index.html  # Nav routes
  grep -c 'rel="canonical"' dist/index.html         # canonical
  grep -c 'hreflang="ko"' dist/index.html           # alt hreflang
  ! grep -q 'kuro-demo\|KuroDemo' dist/index.html dist/ko/index.html  # 잔여 0
  ! grep -q 'EntryNav' dist/index.html                                # 잔여 0
  ```

- [ ] **Step 5.1.4**: posts sync dry-run 무결성 (vault 없어도 스크립트는 valid)
  ```bash
  python3 -c "import ast; ast.parse(open('scripts/posts_sync.py').read())"
  ```

- [ ] **Step 5.1.5**: 보고서 `/Users/gml/.claude/jobs/e5c4df14/v04_multipage.md` 작성:
  - wave별 커밋 SHA
  - 페이지 빌드 카운트
  - typecheck/build 결과
  - grep 검증 결과
  - vault sync 대기 사항 (VAULT_REPO + VAULT_PAT 시크릿 owner 직접 설정)
  - 잔여 issue
  - 최종 verdict

**verify_command**:
```bash
bash -lc 'cd /Users/gml/_workspace/personal-site && rm -rf dist .astro && bun run typecheck >/dev/null 2>&1 && bun run build >/dev/null 2>&1 && for r in / about tools publications presentations posts cv contact; do [ -f "dist${r}/index.html" ] || [ -f "dist${r}.html" ] || exit 1; done && for r in / about tools publications presentations posts cv contact; do [ -f "dist/ko${r}/index.html" ] || [ -f "dist/ko${r}.html" ] || exit 1; done && ! grep -rq "EntryNav\|kuro-demo" dist/'
```

---

## Confidence check

| 축 | 점수 | 사유 |
|---|---|---|
| Completeness | 4 | spec 19 decisions가 5 wave에 매핑됨. 단 vault 경로 결합 (D7 risks) 부분이 GHA secret/repo 설정에 의존하므로 v1에서는 sync 스크립트만 검증, 실제 자동 sync는 owner action 후 활성. |
| Clarity | 5 | 각 step에 파일 경로 + 명령 + 예상 출력. 컴포넌트 코드는 spec에 정의된 그대로 사용. |
| Feasibility | 4 | Astro Content Collection / @astrojs/rss / python-frontmatter 모두 표준. vault repo 접근 PAT 발급 owner 액션 필요. KO 미러 14 페이지 작업량 큼이지만 패턴 단순. |

**Total**: 13/15. 진행 가능. vault 경로 결합은 Wave 3 Task 4.1 verify 단계에서 owner 결정 사항으로 격리.

---

## Out of scope

- 다크 모드
- Posts 검색/태그 필터 UI
- Newsletter 구독
- Posts 댓글
- 커스텀 도메인
- 사진/avatar 자산
- Owner 확인 8건 (별도 라운드)
- push, deploy
- Lighthouse 재측정 (변경 폭 크지만 후속 라운드)
