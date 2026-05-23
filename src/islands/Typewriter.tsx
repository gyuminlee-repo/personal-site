import { useEffect, useState } from 'react';

interface Props {
  lang: 'en' | 'ko';
  labels?: string[];
}

const DEFAULT_LABELS: Record<'en' | 'ko', string[]> = {
  en: ['Methanotroph Engineer', 'Synthetic Biology Postdoc', 'Vibe Coder'],
  ko: ['메탄자화균 엔지니어', '합성생물학 박사후연구원', '바이브 코더'],
};

type Phase = 'type' | 'pause' | 'delete' | 'gap';

export default function Typewriter({ lang, labels }: Props) {
  const list = labels ?? DEFAULT_LABELS[lang];
  const [idx, setIdx] = useState(0);
  const [text, setText] = useState(list[0] ?? '');
  const [phase, setPhase] = useState<Phase>('pause');
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mqMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mqData = window.matchMedia('(prefers-reduced-data: reduce)');
    const update = () => setReduced(mqMotion.matches || mqData.matches);
    update();
    mqMotion.addEventListener('change', update);
    mqData.addEventListener?.('change', update);
    return () => {
      mqMotion.removeEventListener('change', update);
      mqData.removeEventListener?.('change', update);
    };
  }, []);

  useEffect(() => {
    if (reduced) {
      setText(list[0] ?? '');
      return;
    }
    const current = list[idx] ?? '';
    let delay = 0;
    let next: () => void = () => {};
    switch (phase) {
      case 'type':
        if (text.length < current.length) {
          delay = 60;
          next = () => setText(current.slice(0, text.length + 1));
        } else {
          delay = 1500;
          next = () => setPhase('delete');
        }
        break;
      case 'delete':
        if (text.length > 0) {
          delay = 40;
          next = () => setText(current.slice(0, text.length - 1));
        } else {
          delay = 200;
          next = () => setPhase('gap');
        }
        break;
      case 'gap':
        delay = 0;
        next = () => {
          setIdx((i) => (i + 1) % list.length);
          setPhase('type');
        };
        break;
      case 'pause':
        delay = 600;
        next = () => setPhase('type');
        break;
    }
    const t = setTimeout(next, delay);
    return () => clearTimeout(t);
  }, [phase, text, idx, list, reduced]);

  return (
    <span className="font-mono text-primary inline-flex items-baseline">
      <span>{text}</span>
      <span
        className="inline-block w-[0.6ch] h-[1em] bg-primary ml-[1px] animate-blink"
        aria-hidden="true"
      />
    </span>
  );
}
