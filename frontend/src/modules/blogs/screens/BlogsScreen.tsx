import { useMemo, useState } from 'react';
import { Rss, Search } from 'lucide-react';
import { useBlogs } from '@/modules/blogs';
import { useProfile } from '@/modules/about';
import { useContent } from '@/context/ContentContext';
import { API_BASE } from '@/lib/api/httpClient';
import UserAvatar from '@/components/ui/UserAvatar/UserAvatar';
import MarkdownBody from '@/components/ui/MarkdownBody/MarkdownBody';

/** Minutes of reading time at ~200 wpm, derived from the stored body. */
function readMins(body: string): number {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function fmtDate(iso: string | null): string {
  return iso ? iso.slice(0, 10) : 'Unpublished';
}

export default function BlogsScreen() {
  const blogs = useBlogs();
  const profile = useProfile();
  const { loading } = useContent();
  const [tag, setTag] = useState<string>('all');
  const [query, setQuery] = useState('');
  const [selId, setSelId] = useState<string | null>(null);

  const sorted = useMemo(() => [...blogs].sort((a, b) => a.order - b.order), [blogs]);
  const tags = useMemo(() => [...new Set(blogs.flatMap((b) => b.tags))].sort(), [blogs]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sorted.filter((p) => {
      if (tag !== 'all' && !p.tags.includes(tag)) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.body.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [sorted, tag, query]);

  const selected = filtered.find((p) => p.id === selId) ?? filtered[0] ?? null;

  // Arrow keys walk the list from the FOCUSED row (standard listbox
  // behavior — selection state may lag after filter changes); focus follows
  // so screen readers track it. Key-up is ignored — otherwise one press
  // would advance twice.
  const onListKeyDown = (e: React.KeyboardEvent) => {
    if (e.type !== 'keydown') return;
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    if (!filtered.length) return;
    e.preventDefault();
    const focusId = (document.activeElement as HTMLElement | null)?.getAttribute('data-post-id');
    const anchor = filtered.find((p) => p.id === focusId) ?? selected;
    const idx = anchor ? filtered.findIndex((p) => p.id === anchor.id) : -1;
    const next =
      filtered[(idx + (e.key === 'ArrowDown' ? 1 : -1) + filtered.length) % filtered.length];
    setSelId(next.id);
    document.querySelector<HTMLElement>(`[data-post-id="${next.id}"]`)?.focus();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <a
          href={`${API_BASE}/blogs/rss`}
          className="btn-ghost text-[11px] !py-1.5 no-underline"
          title="Subscribe via RSS"
        >
          <Rss size={12} /> RSS
        </a>
      </div>

      <div className="flex flex-col @md:flex-row gap-5 items-start">
        {/* Sidebar: search, tags, post index */}
        <aside className="w-full @md:w-60 shrink-0 flex flex-col gap-3 min-w-0">
          <div className="relative">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: 'var(--text-low)' }}
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search posts"
              aria-label="Search posts"
              className="w-full !pl-9 text-xs"
            />
          </div>

          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by tag">
            {['all', ...tags].map((t) => (
              <button
                key={t}
                aria-pressed={tag === t}
                className={`chip cursor-pointer ${tag === t ? '!bg-[var(--accent)] !text-[var(--accent-text-on)]' : ''}`}
                onClick={() => setTag(t)}
              >
                {t === 'all' ? 'All' : t}
              </button>
            ))}
          </div>

          <div
            className="flex flex-col rounded-xl border overflow-hidden"
            style={{ borderColor: 'var(--border)' }}
            role="listbox"
            aria-label="Posts"
            onKeyDown={onListKeyDown}
          >
            {filtered.map((p) => {
              const active = selected?.id === p.id;
              return (
                <button
                  key={p.id}
                  data-post-id={p.id}
                  role="option"
                  aria-selected={active}
                  onClick={() => setSelId(p.id)}
                  className="w-full text-left px-3 py-2.5 flex flex-col gap-0.5 transition-colors cursor-pointer border-b last:border-b-0"
                  style={{
                    borderColor: 'var(--border)',
                    background: active ? 'var(--accent-soft)' : 'transparent',
                  }}
                >
                  {!!p.tags.length && (
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--accent)' }}>
                      {p.tags[0]}
                    </span>
                  )}
                  <span className="text-[13px] font-semibold leading-snug line-clamp-2" style={{ color: 'var(--text-hi)' }}>
                    {p.title}
                  </span>
                  <span className="text-[10px] tabular-nums" style={{ color: 'var(--text-low)' }}>
                    {fmtDate(p.publishedAt)} · {readMins(p.body)} min read
                  </span>
                </button>
              );
            })}
            {!loading && !!blogs.length && !filtered.length && (
              <p className="px-3 py-4 text-xs" style={{ color: 'var(--text-low)' }}>
                No posts match — try another search or tag.
              </p>
            )}
            {loading && !blogs.length && (
              <p className="px-3 py-4 text-xs" style={{ color: 'var(--text-low)' }}>Loading posts…</p>
            )}
          </div>
        </aside>

        {/* Reader */}
        <article className="flex-1 min-w-0 flex flex-col gap-3">
          {!selected ? (
            !loading && !blogs.length ? (
              <p className="text-xs" style={{ color: 'var(--text-low)' }}>No posts yet — add some in the editor.</p>
            ) : (
              <p className="text-xs" style={{ color: 'var(--text-low)' }}>Select a post to read.</p>
            )
          ) : (
            <>
              {!!selected.tags.length && (
                <p className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--accent)' }}>
                  {selected.tags[0]}
                </p>
              )}
              <h2 className="text-xl @md:text-2xl font-bold tracking-tight text-balance" style={{ color: 'var(--text-hi)' }}>
                {selected.title}
              </h2>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs" style={{ color: 'var(--text-low)' }}>
                {profile && <UserAvatar profile={profile} className="w-6 h-6 text-[10px]" />}
                {profile && (
                  <span className="font-semibold" style={{ color: 'var(--text-mid)' }}>
                    {profile.name}
                  </span>
                )}
                <span aria-hidden>·</span>
                <span className="tabular-nums">{fmtDate(selected.publishedAt)}</span>
                <span aria-hidden>·</span>
                <span>{readMins(selected.body)} min read</span>
                {!selected.published && (
                  <span className="chip !py-0.5 !px-2 text-[10px] shrink-0">Draft</span>
                )}
              </div>
              {selected.coverUrl && (
                <img
                  key={selected.coverUrl}
                  src={selected.coverUrl}
                  alt=""
                  loading="lazy"
                  className="rounded-xl w-full aspect-video object-cover"
                  // Not every URL is an image (e.g. pasted search-result
                  // pages): hide unloadable covers instead of showing the
                  // broken-image box. Keyed by URL so a later valid cover
                  // remounts fresh instead of inheriting the hiding.
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
              <MarkdownBody source={selected.body} />
            </>
          )}
        </article>
      </div>
    </div>
  );
}
