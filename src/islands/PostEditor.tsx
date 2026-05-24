// Owner-only post editor. Mounted as React island on /post/new + /ko/post/new.
// Uploads markdown + optional images via POST /api/post/create.
//
// Assumptions:
// - csrf is minted by the SSR parent and sent back in body. Same value also
//   stored in HttpOnly cookie; the Function compares them.
// - Images converted to base64 client-side (no resize, no EXIF strip — v1).
// - Preview uses marked synchronously. No syntax highlighting.
import { useState, type FormEvent, type ChangeEvent } from 'react';
import { marked } from 'marked';

interface Props {
  lang: 'en' | 'ko';
  csrf: string;
}

interface ResultState {
  ok: boolean;
  msg: string;
  url?: string;
}

const COPY = {
  en: {
    title: 'Title',
    body: 'Body (markdown)',
    tags: 'Tags (comma-separated)',
    slug: 'Slug (optional)',
    cover: 'Cover image',
    attachments: 'Attachments (max 4)',
    draft: 'Save as draft',
    preview: 'Preview',
    edit: 'Edit',
    submit: 'Publish',
    submitting: 'Publishing...',
    success: 'Published. Site rebuild in ~2 minutes.',
  },
  ko: {
    title: '제목',
    body: '본문 (markdown)',
    tags: '태그 (쉼표 구분)',
    slug: 'Slug (선택)',
    cover: '대표 이미지',
    attachments: '첨부 (최대 4)',
    draft: '초안으로 저장',
    preview: '미리보기',
    edit: '편집',
    submit: '발행',
    submitting: '발행 중...',
    success: '발행 완료. ~2분 후 사이트 반영.',
  },
} as const;

async function fileToBase64(f: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // strip "data:<mime>;base64," prefix
      const idx = result.indexOf(',');
      resolve(idx >= 0 ? result.slice(idx + 1) : result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(f);
  });
}

export default function PostEditor({ lang, csrf }: Props) {
  const t = COPY[lang];
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState('');
  const [slug, setSlug] = useState('');
  const [draft, setDraft] = useState(false);
  const [cover, setCover] = useState<File | null>(null);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [preview, setPreview] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ResultState | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setResult(null);
    try {
      const payload: Record<string, unknown> = {
        title,
        body,
        tags: tags
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        slug: slug.trim() || undefined,
        draft,
        lang,
        csrf,
      };
      if (cover) {
        payload.cover_image_b64 = await fileToBase64(cover);
        payload.cover_image_name = cover.name;
      }
      if (attachments.length) {
        payload.attachments = await Promise.all(
          attachments.slice(0, 4).map(async (f) => ({
            name: f.name,
            b64: await fileToBase64(f),
          })),
        );
      }
      const res = await fetch('/api/post/create', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setResult({ ok: false, msg: data.error || `HTTP ${res.status}` });
        return;
      }
      setResult({ ok: true, msg: t.success, url: data.post_url });
      setTitle('');
      setBody('');
      setTags('');
      setSlug('');
      setDraft(false);
      setCover(null);
      setAttachments([]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div>
        <label className="text-xs uppercase tracking-wide text-muted-foreground">
          {t.title}
        </label>
        <input
          type="text"
          value={title}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
          required
          maxLength={200}
          className="mt-1 w-full bg-background border border-border rounded-md px-3 py-2"
        />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label className="text-xs uppercase tracking-wide text-muted-foreground">
            {t.body}
          </label>
          <button
            type="button"
            onClick={() => setPreview((p) => !p)}
            className="text-xs text-primary"
          >
            {preview ? t.edit : t.preview}
          </button>
        </div>
        {preview ? (
          <div
            className="mt-1 min-h-[300px] max-w-none rounded-md border border-border bg-card p-4 whitespace-pre-wrap text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: marked.parse(body) as string }}
          />
        ) : (
          <textarea
            value={body}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setBody(e.target.value)}
            required
            maxLength={50000}
            rows={14}
            className="mt-1 w-full bg-background border border-border rounded-md px-3 py-2 font-mono text-sm"
          />
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-xs uppercase tracking-wide text-muted-foreground">
            {t.tags}
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setTags(e.target.value)}
            className="mt-1 w-full bg-background border border-border rounded-md px-3 py-2"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-wide text-muted-foreground">
            {t.slug}
          </label>
          <input
            type="text"
            value={slug}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSlug(e.target.value)}
            className="mt-1 w-full bg-background border border-border rounded-md px-3 py-2"
          />
        </div>
      </div>

      <div>
        <label className="text-xs uppercase tracking-wide text-muted-foreground">
          {t.cover}
        </label>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            const f = e.target.files?.[0];
            setCover(f ?? null);
          }}
          className="mt-1 w-full text-sm"
        />
      </div>

      <div>
        <label className="text-xs uppercase tracking-wide text-muted-foreground">
          {t.attachments}
        </label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            const fs = Array.from(e.target.files ?? []);
            setAttachments(fs.slice(0, 4));
          }}
          className="mt-1 w-full text-sm"
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={draft}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setDraft(e.target.checked)}
        />
        <span>{t.draft}</span>
      </label>

      <div className="flex items-center justify-between gap-4">
        <button
          type="submit"
          disabled={busy}
          className="rounded-md bg-primary text-primary-foreground px-6 py-2 text-sm font-medium disabled:opacity-40"
        >
          {busy ? t.submitting : t.submit}
        </button>
        {result && (
          <span className={`text-sm ${result.ok ? 'text-primary' : 'text-destructive'}`}>
            {result.msg}
            {result.url ? (
              <>
                {' '}
                ·{' '}
                <a href={result.url} target="_blank" rel="noopener" className="underline">
                  {result.url}
                </a>
              </>
            ) : null}
          </span>
        )}
      </div>
    </form>
  );
}
