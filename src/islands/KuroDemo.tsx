import { useState, useMemo, useCallback } from 'react';
import { Copy, Check } from 'lucide-react';

interface Props { lang?: 'en' | 'ko'; }

const COPY = {
  en: {
    title: 'Site-directed mutagenesis primer designer',
    subtitle: 'A simplified demo. Production KURO ranks candidates by Pareto frontier across Tm, ΔG, off-target risk, and secondary structure.',
    seq_label: 'Template sequence (≤200 bp)',
    pos_label: 'Mutation position (1-indexed)',
    base_label: 'New base',
    design: 'Design primer',
    candidates: 'Candidate primers',
    length: 'Length', gc: 'GC', tm: 'Tm', dg: 'ΔG',
    copy: 'Copy', copied: 'Copied',
    footnote: 'Production KURO uses Pareto optimization on Tm, ΔG, off-target, and structure. Email for the real tool.',
    bad_seq: 'Use A/C/G/T only.',
    bad_pos: 'Position out of range.',
  },
  ko: {
    title: '부위특이적 변이 프라이머 설계기',
    subtitle: '간이 데모. 실제 KURO는 Tm, ΔG, off-target, 2차 구조에 대한 Pareto 최적화로 후보를 정렬합니다.',
    seq_label: '템플릿 시퀀스 (최대 200 bp)',
    pos_label: '변이 위치 (1부터 시작)',
    base_label: '치환 염기',
    design: '프라이머 설계',
    candidates: '후보 프라이머',
    length: '길이', gc: 'GC', tm: 'Tm', dg: 'ΔG',
    copy: '복사', copied: '복사됨',
    footnote: '실제 KURO는 Tm, ΔG, off-target, 2차 구조에 대한 Pareto 최적화 기반. 실제 도구는 이메일 문의.',
    bad_seq: 'A/C/G/T만 입력하세요.',
    bad_pos: '위치가 범위를 벗어났습니다.',
  },
};

function sanitize(s: string) { return s.toUpperCase().replace(/[^ACGT]/g, '').slice(0, 200); }

function gcPct(s: string) {
  if (!s.length) return 0;
  const gc = [...s].filter(c => c === 'G' || c === 'C').length;
  return Math.round((gc / s.length) * 1000) / 10;
}

function tm(s: string): number {
  // Wallace for <14 nt; basic Marmur otherwise
  const len = s.length;
  const at = [...s].filter(c => c === 'A' || c === 'T').length;
  const gc = len - at;
  if (len < 14) return 2 * at + 4 * gc;
  return Math.round((64.9 + 41 * (gc - 16.4) / len) * 10) / 10;
}

function dg(s: string): number {
  // Rough approximation: -1.5 kcal/mol per base, scaled by GC content
  const len = s.length;
  const gcFrac = gcPct(s) / 100;
  return Math.round(-len * (1.5 + gcFrac * 0.5) * 10) / 10;
}

function buildPrimer(seq: string, pos: number, base: string, flank: number): { sequence: string; mutIndex: number } {
  const idx = pos - 1;
  const start = Math.max(0, idx - flank);
  const end = Math.min(seq.length, idx + flank + 1);
  const before = seq.slice(start, idx);
  const after = seq.slice(idx + 1, end);
  return { sequence: before + base + after, mutIndex: before.length };
}

export default function KuroDemo({ lang: initialLang }: Props) {
  const [lang] = useState<'en' | 'ko'>(initialLang ?? 'en');
  const [seq, setSeq] = useState('ATGCGCAAATTCAGCCTGCTGGCCATTACCCTGGTGCTGACCAGCTTTGCCTGGAGCCATCCGGAAACCCGCAACAAATATGGCCGCAATTTTCCG');
  const [pos, setPos] = useState(20);
  const [base, setBase] = useState<'A' | 'C' | 'G' | 'T'>('G');
  const [copied, setCopied] = useState<number | null>(null);

  const t = COPY[lang];
  const clean = useMemo(() => sanitize(seq), [seq]);
  const valid = pos >= 1 && pos <= clean.length;
  const results = useMemo(() => {
    if (!valid || !clean.length) return null;
    return [10, 14, 18].map((flank) => {
      const p = buildPrimer(clean, pos, base, flank);
      return {
        flank,
        primer: p.sequence,
        mutIndex: p.mutIndex,
        gc: gcPct(p.sequence),
        tm: tm(p.sequence),
        dg: dg(p.sequence),
      };
    });
  }, [clean, pos, base, valid]);

  const copyTo = useCallback((idx: number, s: string) => {
    navigator.clipboard?.writeText(s).then(() => {
      setCopied(idx);
      setTimeout(() => setCopied((c) => (c === idx ? null : c)), 1500);
    });
  }, []);

  return (
    <div id="kuro-demo-card" className="rounded-md border border-border bg-card p-6 md:p-8">
      <h3 className="text-xl font-semibold tracking-tight">{t.title}</h3>
      <p className="text-sm text-muted-foreground mt-1 mb-6">{t.subtitle}</p>

      <div className="grid gap-4 md:grid-cols-[1fr_140px_100px] mb-6">
        <label className="text-sm">
          <span className="block text-muted-foreground text-xs mb-1">{t.seq_label}</span>
          <textarea
            value={seq}
            onChange={(e) => setSeq(e.target.value)}
            rows={3}
            className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm font-mono outline-none focus:border-primary resize-none"
          />
        </label>
        <label className="text-sm">
          <span className="block text-muted-foreground text-xs mb-1">{t.pos_label}</span>
          <input
            type="number"
            value={pos}
            min={1}
            max={clean.length || 1}
            onChange={(e) => setPos(parseInt(e.target.value, 10) || 1)}
            className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm font-mono outline-none focus:border-primary"
          />
        </label>
        <label className="text-sm">
          <span className="block text-muted-foreground text-xs mb-1">{t.base_label}</span>
          <select
            value={base}
            onChange={(e) => setBase(e.target.value as 'A' | 'C' | 'G' | 'T')}
            className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm font-mono outline-none focus:border-primary"
          >
            <option>A</option><option>C</option><option>G</option><option>T</option>
          </select>
        </label>
      </div>

      {!clean.length && <p className="text-xs text-destructive">{t.bad_seq}</p>}
      {clean.length > 0 && !valid && <p className="text-xs text-destructive">{t.bad_pos}</p>}

      {results && (
        <div>
          <h4 className="text-xs uppercase tracking-wide text-muted-foreground mb-3">{t.candidates}</h4>
          <ul className="space-y-3">
            {results.map((r, i) => (
              <li key={i} className="rounded-md border border-border bg-background p-3">
                <div className="font-mono text-xs md:text-sm break-all">
                  {r.primer.slice(0, r.mutIndex)}
                  <span className="text-primary font-bold">{r.primer[r.mutIndex]}</span>
                  {r.primer.slice(r.mutIndex + 1)}
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground tabular-nums">
                  <span>{t.length}: {r.primer.length} bp  ·  {t.gc}: {r.gc}%  ·  {t.tm}: {r.tm}°C  ·  {t.dg}: {r.dg} kcal/mol</span>
                  <button
                    type="button"
                    onClick={() => copyTo(i, r.primer)}
                    className="text-xs flex items-center gap-1 text-foreground hover:text-primary"
                  >
                    {copied === i ? <><Check className="size-3" />{t.copied}</> : <><Copy className="size-3" />{t.copy}</>}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-xs text-muted-foreground mt-6">{t.footnote}</p>
    </div>
  );
}
