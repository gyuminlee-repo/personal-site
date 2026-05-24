# Korean Translation Tone Guide

Voice statement: 정중하고 친근한 평서체로 작성한다 ("~합니다" 종결). 전문가가 동료에게 말하는 톤으로 학술적이며 간결하다. 1인칭 주어 ("저는", "제가")는 생략한다. 헷징 표현 ("~할 것 같다", "~로 보인다", "should", "probably")은 쓰지 않는다. 영어 학술 용어는 한글 음차에 괄호 영문을 병기하되, 자주 쓰이는 약어 (RNA-seq, PCR, ALE, TSS)는 그대로 둔다. em dash (U+2014)는 사용하지 않으며 쉼표, 콜론, 괄호로 분리한다.

## Naturalization rules (v0.04.08.x)

이 절은 v0.04.08.x KO naturalization 결정 (`notes/specs/2026-05-24-ko-naturalization.md`) 의 D2~D6 을 반영한다.

### D2 종결어미

기본은 "~합니다" 정중 + 친근. 1인칭 주어 ("저는", "제가") 는 생략한다. CV 표제·메타·카드 칩 등 짧은 라벨은 명사형 종결 OK.

| 위치 | 종결 형식 | 예 |
|---|---|---|
| 본문 (About lead, facets body, Now items, 발표 description) | "~합니다" | "C1 미생물을 공학합니다" |
| 표 셀·라벨·메뉴·헤딩·CV 표제 | 명사형 OK | "박사후연구원", "주요 논문", "소개" |
| 학명·약어 | 그대로 | "*Methylorubrum extorquens*", "ALE" |

### D3 영어 단어 정책

| 유지 (통용 영문) | 한글로 대체 |
|---|---|
| ALE, NGS, RNA-seq, BLAST, wet-lab, dry-lab, AlphaFold3, primer3, off-target | tooling → 도구, lab notebook → 실험 노트, lead → 리드, pipeline → 파이프라인 |

학명은 italic markdown 유지 (`*Methylorubrum extorquens*`).

### D4 em dash 금지

U+2014 (—) 전면 금지. CLAUDE.md 의 `em-dash-block.sh` 훅이 작성 시 강제한다. 대체:

| 원문 패턴 | 대체 |
|---|---|
| 짧은 강조 분리 (`A — B — C`) | 쉼표 + 마침표 ("A. B. C 입니다.") |
| 종속 부연 (`X — Y가 발생` ) | 괄호 또는 쉼표 ("X (Y가 발생)") |
| 페이지 타이틀 separator (`소개 — 이규민`) | `|` ("소개 \| 이규민") |
| 발표/연도 사이 separator (`2026 — Title`) | `·` 또는 쉼표 ("2026 · Title") |

### D5 동사 누락 금지

KO 문장은 반드시 동사로 끝낸다. 명사로 끝나는 줄거리 (facets body, Now items 등) 도 "~합니다 / 했습니다 / 입니다 / ~중 / ~예정" 등으로 종결.

| 부자연 (영어 직역) | 자연스러운 KO |
|---|---|
| "C1 화학용 메탄자화균 공학." | "C1 화학을 위한 메탄자화균을 공학합니다." |
| "ALE 1저자 논문 리비전" | "ALE 1저자 논문 리비전 중" |
| "변이를 네트워크로 해석." | "변이들을 네트워크로 읽어냅니다." |

### D6 어순 (SOV 우선)

영어 SVO 직역 ("A를 B로 C합니다") 대신 한국어 SOV 자연 어순.

| 부자연 (SVO 직역) | 자연스러운 SOV |
|---|---|
| "메탄을 먹는 미생물을 공학" | "메탄을 먹는 미생물을 만듭니다" |
| "ALE를 통한 메탄올 적응" | "ALE 로 메탄올 적응을 분석" |
| "스트레스 하에서 진화" | "스트레스 환경에서 진화시켰습니다" |

특히 "하에서" 류 한자 의존 표현은 "환경에서 / 조건에서 / 상태에서" 등으로 풀어쓴다.

> **NOTE (v0.04.08.x)** 아래 §1-8 의 do/don't 예시는 평서체 "~다 / ~했다" 기반으로 작성됐다. v0.04.08.x 의 D2 결정 ("~합니다" 정중 + 친근) 이 우선한다. 예시의 종결 형식을 차용할 때 "~했다" → "~했습니다", "~이다" → "~입니다" 로 옮긴다.

## Do / Don't 예시

### 1. Research-narrative paragraph

EN source
> My doctoral work at UNIST traced how Methylorubrum extorquens reorganizes its C1 metabolism under sustained methanol stress: 700+ generations of ALE, whole-genome and transcriptome integration, and AlphaFold3 structural analysis to read the convergent mutations as a coherent stress-response network.

KO target (do)
> UNIST 박사과정에서는 Methylorubrum extorquens가 지속적인 methanol (메탄올) 스트레스 조건에서 C1 대사를 어떻게 재편하는지를 추적했다. 700세대 이상의 ALE, 전장 유전체와 전사체 통합 분석, AlphaFold3 구조 분석을 결합하여 수렴 변이를 단일한 스트레스 반응 네트워크로 해석했다.

KO target (don't)
> 저는 박사과정 동안 UNIST에서 Methylorubrum extorquens가 메탄올 스트레스 하에서 C1 대사를 어떻게 재편하는지에 대해 연구하였습니다. 700세대가 넘는 ALE 실험을 수행하였고, 이를 통해 흥미로운 결과를 얻을 수 있었습니다.

이유: 1인칭 주어 (저는), 존댓말 종결 (~하였습니다), 헷징 (~수 있었다), 가치 판단 단어 (흥미로운) 모두 금지.

### 2. Education bullet

EN source
> Dissertation: Systems-level characterization of adaptive responses to methanol stress in Methylorubrum extorquens.

KO target (do)
> 학위논문: Methylorubrum extorquens의 메탄올 스트레스 적응 반응 시스템 수준 분석.

KO target (don't)
> 박사학위 논문 제목은 "메틸로루브룸 엑스토르쿠엔스의 메탄올 스트레스 적응 반응에 대한 시스템 수준의 분석"입니다.

이유: 라틴학명은 음차하지 않고 이탤릭 영문 유지. 종결 어미 "~입니다" 금지. 불필요한 인용 부호 제거.

### 3. Skill chip / short label

EN source
> Adaptive laboratory evolution

KO target (do)
> ALE 적응 진화 실험

KO target (don't)
> 적응성 실험실 진화

이유: 약어 ALE 선행, 직역 ("적응성 실험실")은 한국어 학계 관용 표기 아님.

### 4. Page-section heading

EN source
> Selected Publications

KO target (do)
> 주요 논문

KO target (don't)
> 선택된 출판물들

이유: 학계 관용 표기 우선. 복수형 "~들"은 한국어 본문에서 거의 사용하지 않음.

### 5. Experience bullet

EN source
> Built primer-design and RNA-seq automation tooling on top of Claude Code agents.

KO target (do)
> Claude Code 에이전트 기반 primer (프라이머) 설계, RNA-seq 자동화 도구를 구축했다.

KO target (don't)
> Claude Code 에이전트 위에 프라이머 설계 및 RNA-seq 자동화 도구링을 만들었습니다.

이유: 영어 합성어 "tooling"의 음차 ("도구링") 금지. 종결 "~했다" 평서체.

### 6. About lede sentence

EN source
> The wet-lab spine of my work is adaptive laboratory evolution (ALE) coupled with multi-omics sequencing; the read-out is mechanism, not just phenotype.

KO target (do)
> 연구의 wet-lab 축은 ALE 적응 진화 실험에 multi-omics 시퀀싱을 결합한 형태이며, 표현형이 아닌 기전을 읽어내는 것이 목표이다.

KO target (don't)
> 제 연구의 핵심은 ALE와 멀티오믹스를 결합한 것이라고 할 수 있을 것 같습니다.

이유: 1인칭 ("제"), 헷징 ("~라고 할 수 있을 것 같다"), em dash 회피. 평서체 종결 "~이다".

### 7. Project tagline

EN source
> Reproducible RNA-seq pipeline for methanotroph transcriptomes.

KO target (do)
> 메탄자화균 전사체 분석을 위한 재현 가능한 RNA-seq 파이프라인.

KO target (don't)
> 메탄자화균의 트랜스크립토움을 위한 reproducible 한 RNA-seq 파이프라인입니다.

이유: "전사체"는 한국어 학계 표준 표기. 영어 형용사 ("reproducible") 한국어 문장 내 직접 사용 금지.

### 8. Page navigation label

EN source
> Selected Work

KO target (do)
> 주요 작업

KO target (don't)
> 선택된 작업물

이유: 짧고 명사화된 표기 선호. 수동태 "선택된" 보다 능동·형용사형 "주요" 우선.

## Glossary

| 영문 | 한국어 표기 |
|---|---|
| methanotroph | 메탄자화균 |
| methylotroph | 메틸영양균 |
| methanol stress | 메탄올 스트레스 |
| adaptive laboratory evolution | ALE 적응 진화 실험 |
| pan-genome | 범유전체 |
| transcription start site | TSS |
| transcriptome | 전사체 |
| agentic engineering | 에이전틱 엔지니어링 |
| primer | 프라이머 |
| mutation | 변이 |
| multi-omics | multi-omics (영문 유지) |
| postdoctoral researcher | 박사후연구원 |
| principal investigator | 책임연구원 |
| KRIBB | 한국생명공학연구원 (KRIBB) |
| UNIST | UNIST (영문 유지) |

## Maintenance note

이 가이드는 `src/lib/translate.ts`의 `SYSTEM` 상수로 요약되어 빌드 시 Claude API에 전달된다. 톤 또는 용어 표기를 갱신할 때 두 파일을 함께 수정한다. 변경 후 기존 번역을 재생성하려면 `.translation-cache/` 디렉토리를 삭제하고 `bun run translate`를 다시 실행한다.
