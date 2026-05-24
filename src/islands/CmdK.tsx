import { useCallback, useEffect, useRef, useState } from 'react';
import { Command } from 'cmdk';

interface Props {
  lang: 'en' | 'ko';
}

interface Project {
  name: string;
  url: string | null;
}

interface LinkItem {
  label: string;
  url: string;
}

export default function CmdK({ lang }: Props) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const toggle = useCallback(() => setOpen((o) => !o), []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        const target = e.target as HTMLElement | null;
        const tag = target?.tagName;
        const editable = target?.isContentEditable;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || editable) return;
        e.preventDefault();
        toggle();
      }
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [toggle]);

  // Return focus to trigger when palette closes
  useEffect(() => {
    if (!open && triggerRef.current) {
      // Microtask delay so Escape doesn't immediately re-trigger anything
      const t = setTimeout(() => triggerRef.current?.focus(), 0);
      return () => clearTimeout(t);
    }
  }, [open]);

  const sections: Array<[string, string]> =
    lang === 'ko'
      ? [
          ['홈', '/ko/'],
          ['소개', '/ko/about'],
          ['도구', '/ko/tools'],
          ['논문', '/ko/publications'],
          ['발표', '/ko/presentations'],
          ['포스트', '/ko/posts'],
          ['이력서', '/ko/cv'],
          ['연락처', '/ko/contact'],
        ]
      : [
          ['Home', '/'],
          ['About', '/about'],
          ['Tools', '/tools'],
          ['Publications', '/publications'],
          ['Presentations', '/presentations'],
          ['Posts', '/posts'],
          ['CV', '/cv'],
          ['Contact', '/contact'],
        ];

  const projects: Project[] = [
    { name: 'kuma', url: null },
    { name: 'PrimerBench', url: null },
  ];

  const links: LinkItem[] = [
    { label: 'GitHub', url: 'https://github.com/gyuminlee-repo' },
    { label: 'Google Scholar', url: 'https://scholar.google.com/citations?user=cnTN6OkAAAAJ' },
    { label: 'Email', url: 'mailto:sysbiogyumin@kribb.re.kr' },
  ];

  const closeAnd = (fn: () => void) => () => {
    setOpen(false);
    fn();
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label={lang === 'ko' ? '명령 팔레트 열기' : 'Open command palette'}
        className="fixed bottom-6 left-6 z-50 size-12 rounded-full bg-card border border-border shadow-md flex items-center justify-center text-foreground hover:border-primary md:hidden"
      >
        ⌘
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-start justify-center pt-[15vh] px-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
          role="presentation"
        >
          <Command
            label="Command Palette"
            className="w-full max-w-lg bg-card border border-border rounded-lg shadow-lg overflow-hidden"
          >
            <Command.Input
              autoFocus
              id="cmdk-input"
              name="cmdk-search"
              placeholder={lang === 'ko' ? '검색 또는 명령…' : 'Search or run a command…'}
              className="w-full px-4 py-3 bg-card text-foreground border-b border-border outline-none placeholder:text-muted-foreground"
            />
            <Command.List className="max-h-[60vh] overflow-y-auto p-2">
              <Command.Empty className="p-4 text-sm text-muted-foreground">
                {lang === 'ko' ? '결과 없음' : 'No results.'}
              </Command.Empty>

              <Command.Group
                heading={lang === 'ko' ? '섹션' : 'Sections'}
                className="text-xs uppercase tracking-wide text-muted-foreground px-2 py-1"
              >
                {sections.map(([label, href]) => (
                  <Command.Item
                    key={href}
                    value={`section ${label} ${href}`}
                    onSelect={closeAnd(() => {
                      window.location.href = href;
                    })}
                    className="px-3 py-2 rounded-md text-sm hover:bg-muted aria-selected:bg-muted cursor-pointer"
                  >
                    {label}
                  </Command.Item>
                ))}
              </Command.Group>

              <Command.Group
                heading={lang === 'ko' ? '프로젝트' : 'Projects'}
                className="text-xs uppercase tracking-wide text-muted-foreground px-2 py-1 mt-2"
              >
                {projects.map((p) => (
                  <Command.Item
                    key={p.name}
                    value={`project ${p.name}`}
                    onSelect={closeAnd(() => {
                      if (p.url) window.open(p.url, '_blank', 'noopener');
                      else window.location.href = lang === 'ko' ? '/ko/tools' : '/tools';
                    })}
                    className="px-3 py-2 rounded-md text-sm hover:bg-muted aria-selected:bg-muted cursor-pointer flex items-center justify-between"
                  >
                    <span>{p.name}</span>
                    {p.url && <span className="text-xs text-muted-foreground">↗</span>}
                  </Command.Item>
                ))}
              </Command.Group>

              <Command.Group
                heading={lang === 'ko' ? '링크' : 'Links'}
                className="text-xs uppercase tracking-wide text-muted-foreground px-2 py-1 mt-2"
              >
                {links.map((l) => (
                  <Command.Item
                    key={l.url}
                    value={`link ${l.label} ${l.url}`}
                    onSelect={closeAnd(() => {
                      window.open(l.url, '_blank', 'noopener');
                    })}
                    className="px-3 py-2 rounded-md text-sm hover:bg-muted aria-selected:bg-muted cursor-pointer"
                  >
                    {l.label}
                  </Command.Item>
                ))}
              </Command.Group>

              <Command.Group
                heading={lang === 'ko' ? '언어' : 'Language'}
                className="text-xs uppercase tracking-wide text-muted-foreground px-2 py-1 mt-2"
              >
                <Command.Item
                  value="language english en"
                  onSelect={closeAnd(() => {
                    window.location.href = '/';
                  })}
                  className="px-3 py-2 rounded-md text-sm hover:bg-muted aria-selected:bg-muted cursor-pointer"
                >
                  English
                </Command.Item>
                <Command.Item
                  value="language korean ko 한국어"
                  onSelect={closeAnd(() => {
                    window.location.href = '/ko/';
                  })}
                  className="px-3 py-2 rounded-md text-sm hover:bg-muted aria-selected:bg-muted cursor-pointer"
                >
                  한국어
                </Command.Item>
              </Command.Group>
            </Command.List>
          </Command>
        </div>
      )}
    </>
  );
}
