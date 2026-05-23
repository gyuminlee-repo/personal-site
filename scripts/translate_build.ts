#!/usr/bin/env bun
/**
 * Pre-build: synchronize Korean translations of structured data files.
 *
 * Currently handles:
 *   src/data/bio.en.json -> src/data/bio.ko.json (fill empty string keys)
 *
 * Skips silently if ANTHROPIC_API_KEY absent (CI/dev without secret keeps EN fallback).
 * Cache: .translation-cache/ committed; deleting it forces re-translation.
 *
 * Extend by adding more source/target pairs to MAPPINGS.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { translate } from '../src/lib/translate';

const ROOT = process.cwd();

interface Mapping {
  en: string;
  ko: string;
  context: string;
}

const MAPPINGS: Mapping[] = [
  {
    en: join(ROOT, 'src/data/bio.en.json'),
    ko: join(ROOT, 'src/data/bio.ko.json'),
    context:
      'Personal homepage About section (academic bio, education, experience, skills).',
  },
];

interface Job {
  get: () => string;
  setKo: (v: string) => void;
  ctx: string;
}

function walk(
  obj: any,
  koObj: any,
  path: string[],
  jobs: Job[],
): void {
  if (typeof obj === 'string') return; // handled by parent
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      const enChild = obj[i];
      let koChild = koObj?.[i];
      if (typeof enChild === 'string') {
        const ctx = path.join('.') + `[${i}]`;
        if (!koChild || koChild === '' || koChild === enChild) {
          jobs.push({
            get: () => enChild,
            setKo: (v) => {
              koObj[i] = v;
            },
            ctx,
          });
        }
      } else if (typeof enChild === 'object' && enChild !== null) {
        if (!koChild) {
          koObj[i] = Array.isArray(enChild) ? [] : {};
          koChild = koObj[i];
        }
        walk(enChild, koChild, [...path, String(i)], jobs);
      }
    }
    return;
  }
  if (typeof obj === 'object' && obj !== null) {
    for (const k of Object.keys(obj)) {
      const enChild = obj[k];
      let koChild = koObj?.[k];
      if (typeof enChild === 'string') {
        const ctx = [...path, k].join('.');
        if (koChild === '' || koChild === undefined || koChild === enChild) {
          jobs.push({
            get: () => enChild,
            setKo: (v) => {
              koObj[k] = v;
            },
            ctx,
          });
        }
      } else if (typeof enChild === 'object' && enChild !== null) {
        if (!koChild) {
          koObj[k] = Array.isArray(enChild) ? [] : {};
          koChild = koObj[k];
        }
        walk(enChild, koChild, [...path, k], jobs);
      }
    }
  }
}

async function syncOne(
  enPath: string,
  koPath: string,
  baseContext: string,
): Promise<void> {
  if (!existsSync(enPath)) {
    console.warn(`[translate-build] EN file missing: ${enPath}`);
    return;
  }
  const en = JSON.parse(readFileSync(enPath, 'utf-8'));
  const ko = existsSync(koPath) ? JSON.parse(readFileSync(koPath, 'utf-8')) : {};
  const jobs: Job[] = [];
  walk(en, ko, [], jobs);
  if (jobs.length === 0) {
    console.log(`[translate-build] ${koPath} up to date`);
    return;
  }
  console.log(`[translate-build] ${koPath}: ${jobs.length} string(s) to translate`);
  let translated = 0;
  let skipped = 0;
  for (const job of jobs) {
    const result = await translate(job.get(), {
      context: `${baseContext} (key: ${job.ctx})`,
    });
    if (result) {
      job.setKo(result);
      translated++;
    } else {
      skipped++;
    }
  }
  writeFileSync(koPath, JSON.stringify(ko, null, 2), 'utf-8');
  console.log(
    `[translate-build] wrote ${koPath} (${translated} translated, ${skipped} skipped)`,
  );
}

async function main(): Promise<void> {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.log('[translate-build] ANTHROPIC_API_KEY not set, skipping');
    return;
  }
  for (const m of MAPPINGS) await syncOne(m.en, m.ko, m.context);
}

main().catch((err) => {
  console.error('[translate-build]', err);
  process.exit(1);
});
