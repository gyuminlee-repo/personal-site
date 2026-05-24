# 한국어 콘텐츠 자연스러움 다듬기 (v0.04.08.x)

## Context

KO 콘텐츠가 영어 직역 패턴 + 동사 누락 + em dash + "~하 + 명사" 한자 어색함 등으로 부자연. 톤·어휘 정책 확정 후 전수 다듬기.

## Decisions

| # | 결정 | 값 |
|---|---|---|
| D1 | 범위 | 전체 KO 콘텐츠 (Hero / About / Education / Experience / Skills / Now / Tools / Presentations / CV / Contact + Nav/Footer KO 라벨) |
| D2 | 종결어미 | `"~합니다"` 정중 + 친근. 1인칭("저는") 생략. CV 표제·메타·카드 칩 등 짧은 라벨은 명사형 종결 OK. |
| D3 | 영어 단어 | 통용 영문 유지: ALE, NGS, RNA-seq, BLAST, wet-lab, dry-lab, AlphaFold3, primer3. 한글 대체 가능 건 한글: tooling→도구, lab notebook→실험 노트, lead→리드, pipeline→파이프라인(외래어 정착). 학명은 italic markdown 유지(`*Methylorubrum extorquens*`). |
| D4 | em dash | U+2014 전면 금지 (CLAUDE.md hook 강제). 쉼표/괄호/줄바꿈으로 대체. |
| D5 | 동사 누락 | KO 문장은 반드시 동사로 끝. 명사로 끝나는 줄거리(facets body 등)도 "~합니다/했습니다/입니다"로 종결. |
| D6 | 어순 | "A를 B로 C합니다" 패턴(영어 SVO 직역) → 한국어 SOV 자연 어순 우선. |
| D7 | 톤 가이드 갱신 | `notes/design/ko-tone-guide.md`에 D2~D6 명시 추가. `src/lib/translate.ts` SYSTEM 프롬프트도 동시 갱신(향후 자동 번역 일관성). |

## Locked copy — 핵심 영역

다른 줄은 patch agent가 D2~D6 가이드 따라 자연스럽게 다듬되, 아래는 명시:

### Hero typewriter (KO) — 살짝 다듬기
```
Before: ["메탄을 먹는 미생물을 공학합니다", "스트레스 하에서 균주를 진화시킵니다", "AI 에이전트로 실험실 도구를 만듭니다"]
After:  ["메탄을 먹는 미생물을 만듭니다", "스트레스 환경에서 균주를 진화시킵니다", "AI 에이전트로 실험실 도구를 만듭니다"]
```
("공학합니다" → "만듭니다"로 더 친근. "하에서" → "환경에서". 세 번째 줄 유지.)

### About lead (KO)
```
Before: "한국생명공학연구원(KRIBB) 합성생물학연구센터 박사후연구원. AI 코딩 에이전트를 결합한 C1 미생물 공학을 합니다."
After:  "한국생명공학연구원(KRIBB) 합성생물학연구센터에서 박사후연구원으로 일합니다. C1 미생물을 공학하고, AI 코딩 에이전트를 워크플로우 곳곳에 둡니다."
```

### About facets (KO) — 동사 종결로 정정
```
연구:
Before: "C1 화학용 메탄자화균·메틸영양균 공학. UNIST 박사 과정에서 *Methylorubrum extorquens*를 메탄올 스트레스 하에서 700세대 이상 ALE."
After:  "C1 화학을 위한 메탄자화균·메틸영양균을 공학합니다. UNIST 박사 과정에서 *Methylorubrum extorquens*를 메탄올 스트레스 환경에서 700세대 이상 ALE로 진화시켰습니다."

방법:
Before: "전장 유전체 시퀀싱 + RNA-seq + AlphaFold3 구조 분석으로 변이를 일관된 스트레스 응답 네트워크로 해석."
After:  "전장 유전체 시퀀싱, RNA-seq, AlphaFold3 구조 분석을 결합해 변이들을 하나의 스트레스 응답 네트워크로 읽어냅니다."

도구:
Before: "AI 코딩 에이전트 위에 dry-lab 도구를 직접 만듭니다 — 프라이머 설계, NGS 검증, lab notebook 자동화 — wet-lab 주기가 멈추지 않도록."
After:  "AI 코딩 에이전트를 발판으로 dry-lab 도구를 직접 만듭니다. 프라이머 설계, NGS 검증, 실험 노트 자동화 등을 갖춰 wet-lab 주기가 멈추지 않도록 합니다."
```

### Now items_ko — 동사 종결 정정 예시
```
Before: ["ALE 1저자 논문 리비전 (M. extorquens 메탄올 스트레스)", "PrimerBench: 신규 host strain용 off-target 성능 튜닝"]
After:  ["ALE 1저자 논문(*M. extorquens* 메탄올 스트레스) 리비전 중", "PrimerBench의 신규 host strain용 off-target 성능을 튜닝 중"]
```

### Projects (KO) — kuma + primerbench
```
kuma:
- tagline_ko: "내부 도구, 개발 중" → 그대로 OK (이미 자연스러움)
- description_ko: 비어있으면 그대로

PrimerBench:
- tagline_ko: "Off-target 특이성 검사 포함 크로스플랫폼 PCR 프라이머 설계 앱" → "off-target 특이성 검사를 포함한 크로스플랫폼 PCR 프라이머 설계 앱"
- description_ko: "일상적인 클로닝 작업용으로 만든 독립 PCR 프라이머 GUI. primer3 + BLAST off-target 검사를 묶어 macOS/Windows 단일 바이너리로 배포합니다." → 그대로 자연스러움
```

### Presentations (KO) — 슬래시 분리 KO 부분 정정
- "초청 세미나 (학과·교수진)" → 그대로 OK
- "내부" → "내부 세미나"
- "Methanol stress adaptation in *M. extorquens* via ALE / ALE를 통한 *M. extorquens* 메탄올 스트레스 적응" → KO 부분 "ALE로 *M. extorquens*의 메탄올 스트레스 적응을 분석" 식으로 동사 명확

### 그 외 (Education / Experience / Skills / CV / Contact / Nav / Footer 라벨)
- "박사" 같은 짧은 라벨은 그대로
- 라인 종결이 명사로 끝나면 동사 추가 검토 (단 표 cell 같은 곳은 명사 OK)
- 한자 합성어 과다 → 풀어쓰기 (예: "수행함" → "했습니다")
- 영어 마침표 + 한글 종결 패턴 통일

## Files affected

- `src/data/bio.ko.json` (about/education/experience/skills 전반)
- `src/data/now.json` (items_ko)
- `src/data/projects.json` (kuma/primerbench `*_ko` 필드)
- `src/data/presentations.json` (KO 슬래시 분할 부분)
- `src/data/scholar_metrics.json` (lang-specific 라벨이 있다면, 없으면 skip)
- `src/components/sections/Nav.astro` — KO 메뉴 라벨 검토 (현재 소개/도구/논문/발표/포스트/이력서/연락처 — 자연스러움, 무변경 가능)
- `src/components/sections/Footer.astro` — KO 라벨
- `src/components/{ContactInfo,EntryNav,Now,Latest,PresentationsList,PostCard,CvDownloadButton}.astro` — KO 라벨
- `src/islands/CmdK.tsx` — KO 그룹 헤딩/액션 라벨
- `src/components/sections/Hero.astro` — KO 본문 검토
- `src/islands/Typewriter.tsx` — DEFAULT_LABELS.ko 정정
- `notes/design/ko-tone-guide.md` — D2~D6 추가
- `src/lib/translate.ts` — SYSTEM 프롬프트에 D2~D6 반영

## Verification

```bash
cd /Users/gml/_workspace/personal-site
bun run typecheck
bun run build

# em dash 잔여 0
grep -rln $'—' src/data/ src/components/ src/islands/ 2>&1 | head -5

# 핵심 정정 grep (≥1)
grep -c "박사후연구원으로 일합니다" dist/about/index.html dist/ko/about/index.html dist/cv/index.html dist/ko/cv/index.html
grep -c "스트레스 환경에서 균주를 진화" dist/ko/index.html dist/index.html
grep -c "wet-lab 주기가 멈추지 않도록" dist/ko/about/index.html dist/about/index.html
```

## Out of scope

- EN 콘텐츠 — 변경 없음
- 디자인 토큰
- vault posts sync 활성화
- Scholar publications 자동 sync (외부 source)
