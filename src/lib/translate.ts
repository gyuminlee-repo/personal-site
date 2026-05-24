/**
 * Build-time Korean translation via Anthropic Claude API.
 *
 * Usage:
 *   const ko = await translate(en, { context: 'About section paragraph' });
 *
 * Cache: hash(input + context) -> translation. Cache committed to disk so
 * unchanged source skips API calls. Invalidate by deleting .translation-cache/.
 *
 * Env: ANTHROPIC_API_KEY must be set at build time (GitHub Actions secret).
 *      If absent, translate() returns null (caller decides fallback, typically
 *      keep EN as a graceful degrade).
 */
import Anthropic from '@anthropic-ai/sdk';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const CACHE_DIR = join(process.cwd(), '.translation-cache');
const MODEL = 'claude-sonnet-4-6';

const SYSTEM = `당신은 한국 학술·기술 글쓰기 전문 번역가입니다.

규칙:
- 종결어미는 "~합니다" 정중 + 친근체 (D2). CV 표제·메뉴·카드 라벨 등 짧은 명사형은 그대로 두기. "~다 / ~했다" 평서체로 끝내지 않는다.
- 1인칭 주어 ("저는", "제가", "우리는") 생략 (D2).
- 영어 단어 정책 (D3): ALE / NGS / RNA-seq / BLAST / wet-lab / dry-lab / AlphaFold3 / primer3 / off-target 은 그대로. tooling → 도구, lab notebook → 실험 노트, lead → 리드, pipeline → 파이프라인 으로 대체. 라틴 학명은 italic markdown 유지 (*Methylorubrum extorquens*).
- em dash (U+2014, —) 전면 금지 (D4). 쉼표, 마침표, 괄호, "|", "·" 로 대체.
- 동사 누락 금지 (D5): KO 문장은 동사로 끝낸다. 명사로 끝나는 줄거리도 "~합니다 / 했습니다 / 입니다 / ~중 / ~예정" 으로 종결.
- 어순 (D6): "A를 B로 C합니다" 영어 SVO 직역 대신 한국어 SOV 자연 어순. "하에서" 류 한자 의존 표현은 "환경에서 / 조건에서 / 상태에서" 로 풀어쓴다.
- 'should', 'probably', '~할 것 같다' 헷징 표현 금지.
- 마크다운 구조 (헤딩, 리스트, 코드 블록, italic asterisks) 그대로 보존.
- 회사명, 학교명, 사람 이름의 영문 표기는 한국어 일반 표기 따라 변환 (예: KRIBB → 한국생명공학연구원, UNIST → UNIST 그대로).

번역 결과만 출력. 설명·주석 금지.`;

interface TranslateOptions {
  context?: string;
}

let client: Anthropic | null = null;

function getClient(): Anthropic | null {
  if (client) return client;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  client = new Anthropic({ apiKey });
  return client;
}

function cacheKey(en: string, ctx: string): string {
  return createHash('sha256').update(`${ctx}\n---\n${en}`).digest('hex').slice(0, 16);
}

function cachePath(key: string): string {
  return join(CACHE_DIR, `${key}.txt`);
}

export async function translate(
  en: string,
  opts: TranslateOptions = {},
): Promise<string | null> {
  if (!en || !en.trim()) return en;
  const ctx = opts.context ?? '';
  const key = cacheKey(en, ctx);
  if (!existsSync(CACHE_DIR)) mkdirSync(CACHE_DIR, { recursive: true });
  const cached = cachePath(key);
  if (existsSync(cached)) return readFileSync(cached, 'utf-8');
  const c = getClient();
  if (!c) return null;
  const prompt = ctx ? `[문맥: ${ctx}]\n\n${en}` : en;
  try {
    const resp = await c.messages.create({
      model: MODEL,
      max_tokens: 2048,
      system: SYSTEM,
      messages: [{ role: 'user', content: prompt }],
    });
    const text = resp.content
      .filter((b) => b.type === 'text')
      .map((b) => (b as { type: 'text'; text: string }).text)
      .join('\n')
      .trim();
    writeFileSync(cached, text, 'utf-8');
    return text;
  } catch (err) {
    console.error(`[translate] failed for key ${key}:`, err);
    return null;
  }
}
