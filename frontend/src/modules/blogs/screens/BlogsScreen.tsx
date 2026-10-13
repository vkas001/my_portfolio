import { useMemo, useState } from 'react';
import { useBlogs } from '@/modules/blogs';
import { useContent } from '@/context/ContentContext';
import MarkdownBody from '@/components/ui/MarkdownBody/MarkdownBody';

export default function BlogsScreen() {
  const blogs = useBlogs();
  const { loading } = useContent();
  const [tag, setTag] = useState<string>('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  const sorted = useMemo(() => [...blogs].sort((a, b) => a.order - b.order), [blogs]);

  const tags = useMemo(() => [...new Set(blogs.flatMap((b) => b.tags))].sort(), [blogs]);
  const filtered = sorted.filter((p) => tag === 'all' || p.tags.includes(tag));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5">
        {['all', ...tags].map((t) => (
          <button
            key={t}
            className={`chip cursor-pointer ${tag === t ? '!bg-[var(--accent)] !text-[var(--accent-text-on)]' : ''}`}
            onClick={() => setTag(t)}
          >
            {t === 'all' ? 'All' : t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-3 items-start">
        {filtered.map((p) => {
          const open = expanded === p.id;
          return (
            <article
              key={p.id}
              aria-expanded={open}
              className={`col-span-12 min-w-0 @md:col-span-6 rounded-xl p-4 flex flex-col gap-2 cursor-pointer transition-all duration-300 ease-in-out hover:-translate-y-0.5 ${open ? 'shadow-[0_12px_32px_rgba(0,0,0,.35)]' : ''}`}
              // Open-state lift as inline style: it must beat the hover lift
              // class (higher specificity while the pointer sits on the card).
              style={{ background: 'var(--accent-soft)', border: '1px solid var(--border)', ...(open ? { translate: '0 -6px' } : null) }}
              onClick={() => setExpanded(open ? null : p.id)}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h3 className="text-sm font-semibold leading-tight">{p.title}</h3>
                {!p.published && (
                  <span className="chip !py-0.5 !px-2 text-[10px] shrink-0">
                    Draft
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] tabular-nums" style={{ color: 'var(--text-low)' }}>
                  {p.publishedAt ? p.publishedAt.slice(0, 10) : 'Unpublished'}
                </span>
                {!!p.tags.length && (
                  <span className="text-[10px] truncate" style={{ color: 'var(--text-low)' }}>
                    {p.tags.join(' · ')}
                  </span>
                )}
              </div>
              {p.coverUrl && (
                <img src={p.coverUrl} alt="" loading="lazy" className="rounded-lg w-full object-cover" style={{ maxHeight: 180 }} />
              )}
              {/* Swap excerpt/body with animated height: the outgoing block
                  collapses (0fr + fade) while the incoming one expands. */}
              <div className={`grid transition-all duration-300 ease-in-out ${open ? 'grid-rows-[0fr] opacity-0' : 'grid-rows-[1fr] opacity-100'}`}>
                <div className="overflow-hidden min-h-0">
                  {p.excerpt ? (
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--text-mid)' }}>
                      {p.excerpt}
                    </p>
                  ) : null}
                </div>
              </div>
              <div className={`grid transition-all duration-300 ease-in-out ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden min-h-0">
                  <MarkdownBody source={p.body} />
                </div>
              </div>
            </article>
          );
        })}
      </div>
      {!loading && !blogs.length && <p className="text-xs" style={{ color: 'var(--text-low)' }}>No posts yet — add some in the editor.</p>}
      {!loading && !!blogs.length && !filtered.length && <p className="text-xs" style={{ color: 'var(--text-low)' }}>No posts with this tag.</p>}
      {loading && !blogs.length && <p className="text-xs" style={{ color: 'var(--text-low)' }}>Loading posts…</p>}
    </div>
  );
}
