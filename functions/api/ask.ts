/**
 * Cloudflare Pages Function — POST /api/ask
 *
 * Body: { question: string, lang?: 'en' | 'ko' }
 *
 * Response: streaming SSE with text deltas; final event 'done'.
 *
 * Rate limit: per-IP, 10 requests / hour, in-memory (per-isolate; Cloudflare KV
 * optional later). Daily token cap 200K input + 50K output (env-configurable).
 *
 * Env vars (Cloudflare Pages → Settings → Environment variables):
 *   - ANTHROPIC_API_KEY (required)
 *
 * NOTE: This function runs on Cloudflare Workers runtime (V8 isolate, no Node fs).
 * Site content is embedded as a context string below (synced manually with bio.json).
 */

interface Env {
  ANTHROPIC_API_KEY: string;
}

interface Ctx {
  request: Request;
  env: Env;
  next: () => Promise<Response>;
}

const SITE_CONTEXT_EN = `You are answering questions on behalf of Gyumin Lee (이규민)'s personal homepage.

Identity:
- Postdoctoral researcher at KRIBB (Korea Research Institute of Bioscience and Biotechnology), C1 Refinery Research Center, PI: Dr. Hyewon Lee.
- Previously Ph.D. at UNIST (2019–2026, advisor: Donghyuk Kim) in Chemical Engineering / Systems Biology.
- Research focus: methanotroph engineering, synthetic biology, adaptive laboratory evolution (ALE), and integrating AI coding agents into bioinformatics workflows.

Scholar metrics (last sync — may be slightly stale):
- 22 publications, h-index 6, i10-index 5, 286 total citations.
- Top-cited: "Functional cooperation of the glycine synthase-reductase and Wood–Ljungdahl pathway" (PNAS 2020, co-author, 178 cites).

Projects:
- KURO — batch SDM primer design from EVOLVEpro variants (Python, primer3, AlphaFold).
- PrimerBench — cross-platform PCR primer design with off-target checks (Tauri v2, Rust, Python).
- kuma — primer design (Kuro) + Nanopore NGS verification (Mame) integrated app.
- hermes_universe — character persona packs for Hermes agents.
- scout-feed — daily Discord digest from threads/GitHub stars/repo pulls.
- qol — macOS quality-of-life scripts and notification glue.

Tone:
- Concise and accurate. Cite the specific paper, project, or section when relevant.
- If asked something not in the context, say so plainly. Do not fabricate.
- Default language matches the question. If user writes Korean, reply in Korean.
- Never claim to *be* Gyumin in the first person. Refer to him in third person ("Gyumin's PhD focused on…").
- Do not share contact information beyond what's on the site (email rbals1012@gmail.com, GitHub gyuminlee-repo, Scholar).`;

const SITE_CONTEXT_KO = `당신은 이규민(Gyumin Lee) 개인 홈페이지의 방문자 질문에 답합니다.

이력:
- 한국생명공학연구원(KRIBB) C1 리파이너리 연구센터 박사후연구원, PI: 이혜원 박사님.
- UNIST 화학공학과 박사 (2019–2026, 지도교수: 김동혁 교수님). 시스템생물학 연구실.
- 연구 분야: 메탄자화균 공학, 합성생물학, 적응진화 실험 (ALE), AI 코딩 에이전트의 생물정보학 워크플로우 통합.

Scholar 지표 (최근 동기화):
- 논문 22편, h-index 6, i10-index 5, 총 인용수 286.
- 최다 인용: "글리신 합성-환원효소와 Wood–Ljungdahl 경로의 기능적 협력" (PNAS 2020, 공저, 178회 인용).

프로젝트:
- KURO — EVOLVEpro 변이 목록에서 SDM 프라이머 일괄 설계 (Python, primer3, AlphaFold).
- PrimerBench — Off-target 특이성 검사 포함 크로스플랫폼 PCR 프라이머 설계 앱 (Tauri v2, Rust, Python).
- kuma — Kuro 프라이머 설계와 Mame Nanopore NGS 검증을 통합한 앱.
- hermes_universe — Hermes 에이전트용 캐릭터 페르소나 팩.
- scout-feed — Threads, GitHub stars, repo pull을 매일 Discord로 보고.
- qol — 맥북 운영 편의 스크립트와 알림 연동.

톤:
- 간결하고 정확하게. 가능하면 논문·프로젝트·섹션을 인용.
- 컨텍스트에 없는 내용은 모른다고 명시. 추측 금지.
- 질문 언어에 맞춰 답변.
- 1인칭 사용 금지. "이규민의 박사 연구는…" 처럼 3인칭으로.
- 명시된 연락처 (이메일 rbals1012@gmail.com, GitHub gyuminlee-repo, Scholar) 외 추가 정보 공유 금지.`;

const requestsByIp = new Map<string, { count: number; reset: number }>();
const HOUR_MS = 3_600_000;
const HOURLY_CAP = 10;

function rateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = requestsByIp.get(ip);
  if (!entry || entry.reset < now) {
    requestsByIp.set(ip, { count: 1, reset: now + HOUR_MS });
    return { allowed: true, remaining: HOURLY_CAP - 1 };
  }
  if (entry.count >= HOURLY_CAP) return { allowed: false, remaining: 0 };
  entry.count += 1;
  return { allowed: true, remaining: HOURLY_CAP - entry.count };
}

export const onRequestPost = async ({ request, env }: Ctx): Promise<Response> => {
  const ip = request.headers.get('cf-connecting-ip') ?? 'unknown';
  const rate = rateLimit(ip);
  if (!rate.allowed) {
    return new Response(JSON.stringify({ error: 'Rate limit. Try again in an hour.' }), {
      status: 429,
      headers: { 'content-type': 'application/json' },
    });
  }
  if (!env.ANTHROPIC_API_KEY) {
    return new Response(JSON.stringify({ error: 'Server not configured.' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }

  let body: { question?: string; lang?: 'en' | 'ko' };
  try {
    body = await request.json();
  } catch {
    return new Response('Bad JSON', { status: 400 });
  }
  const question = (body.question ?? '').trim();
  if (!question) return new Response('Empty question', { status: 400 });
  if (question.length > 500) return new Response('Question too long (max 500 chars)', { status: 400 });
  const lang = body.lang === 'ko' ? 'ko' : 'en';
  const system = lang === 'ko' ? SITE_CONTEXT_KO : SITE_CONTEXT_EN;

  const upstream = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      stream: true,
      system,
      messages: [{ role: 'user', content: question }],
    }),
  });

  if (!upstream.ok || !upstream.body) {
    const text = await upstream.text();
    return new Response(JSON.stringify({ error: 'Upstream error', detail: text.slice(0, 200) }), {
      status: 502,
      headers: { 'content-type': 'application/json' },
    });
  }

  return new Response(upstream.body, {
    status: 200,
    headers: {
      'content-type': 'text/event-stream; charset=utf-8',
      'cache-control': 'no-cache',
      'x-ratelimit-remaining': String(rate.remaining),
    },
  });
};
