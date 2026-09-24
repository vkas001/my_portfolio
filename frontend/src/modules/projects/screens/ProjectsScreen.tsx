import { useMemo, useState } from 'react';
import { useContent } from '@/context/ContentContext';
import { ExternalLink, Github, Star } from 'lucide-react';

export default function Projects() {
  const { projects } = useContent();
  const [category, setCategory] = useState<string>('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  const sorted = useMemo(() => [...projects].sort((a, b) => a.order - b.order), [projects]);

  const categories = useMemo(() => [...new Set(projects.map((p) => p.category))], [projects]);
  const filtered = sorted.filter((p) => category === 'all' || p.category === category);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5">
        {['all', ...categories].map((c) => (
          <button
            key={c}
            className={`chip cursor-pointer ${category === c ? '!bg-[var(--accent)] !text-[var(--accent-text-on)]' : ''}`}
            onClick={() => setCategory(c)}
          >
            {c === 'all' ? 'All' : c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-3">
        {filtered.map((p) => {
          const open = expanded === p.id;
          return (
            <article
              key={p.id}
              className="col-span-12 @md:col-span-6 rounded-xl p-4 flex flex-col gap-2 cursor-pointer transition-transform hover:-translate-y-0.5"
              style={{ background: 'var(--accent-soft)', border: '1px solid var(--border)' }}
              onClick={() => setExpanded(open ? null : p.id)}
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold leading-tight">{p.title}</h3>
                {p.featured && (
                  <span className="chip !py-0.5 !px-2 text-[10px] shrink-0">
                    <Star size={9} /> Featured
                  </span>
                )}
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-mid)' }}>
                {open ? p.longDescription : p.description}
              </p>
              <div className="flex flex-wrap gap-1">
                {p.techStack.map((t) => (
                  <span key={t} className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(0,0,0,.2)', color: 'var(--text-mid)' }}>
                    {t}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-auto pt-1">
                <span className="text-[10px]" style={{ color: 'var(--text-low)' }}>{p.year}</span>
                <div className="flex-1" />
                {p.liveUrl && (
                  <a href={p.liveUrl} target="_blank" rel="noreferrer" className="icon-btn w-6 h-6" title="Live demo" onClick={(e) => e.stopPropagation()}>
                    <ExternalLink size={12} />
                  </a>
                )}
                {p.githubUrl && (
                  <a href={p.githubUrl} target="_blank" rel="noreferrer" className="icon-btn w-6 h-6" title="Source" onClick={(e) => e.stopPropagation()}>
                    <Github size={12} />
                  </a>
                )}
              </div>
            </article>
          );
        })}
      </div>
      {!projects.length && <p className="text-xs" style={{ color: 'var(--text-low)' }}>Loading projects…</p>}
    </div>
  );
}
