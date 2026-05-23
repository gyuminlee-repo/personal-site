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
- 평서체 사용 (존댓말 금지). 학술적이며 간결한 톤.
- 영어 학술 용어는 한글 음차 + 괄호 영문 병기. 예: "methanotroph (메탄자화균)". 단 자주 쓰이는 약어는 그대로 (RNA-seq, PCR, ALE).
- 'We'·'I'·'우리는' 등 1인칭 주어 생략. 한국어 작문 관습 따름.
- em dash (—) 사용 금지. 쉼표, 콜론, 괄호로 대체.
- 'should', 'probably', '~할 것 같다' 등 헷징 표현 금지.
- 마크다운 구조 (헤딩, 리스트, 코드 블록) 그대로 보존.
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
