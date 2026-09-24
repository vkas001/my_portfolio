import { useEffect, useState } from 'react';
import { fetchProjects } from '@/lib/api';
import type { Project } from '@shared/types';
import { ExternalLink, Github } from 'lucide-react';

export default function ProjectShowcase() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    let alive = true;
    fetchProjects().then((ps) => { if (alive) setProjects(ps.filter((p) => p.featured)); });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (projects.length < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % projects.length), 5000);
    return () => clearInterval(t);
  }, [projects.length]);

  const p = projects[idx];

  if (!p) return <p className="text-xs" style={{ color: 'var(--text-low)' }}>Loading projects…</p>;

  return (
    <div key={p.id} className="flex flex-col h-full gap-1.5 fade-in">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold truncate">{p.title}</span>
        <span className="chip text-[10px] !py-0.5 !px-2">{p.category}</span>
      </div>
      <p className="text-xs leading-relaxed line-clamp-3" style={{ color: 'var(--text-mid)' }}>
        {p.description}
      </p>
      <div className="flex flex-wrap gap-1 mt-auto">
        {p.techStack.slice(0, 4).map((t) => (
          <span key={t} className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
            {t}
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        {p.liveUrl && (
          <a href={p.liveUrl} target="_blank" rel="noreferrer" className="icon-btn w-6 h-6" title="Live demo">
            <ExternalLink size={12} />
          </a>
        )}
        {p.githubUrl && (
          <a href={p.githubUrl} target="_blank" rel="noreferrer" className="icon-btn w-6 h-6" title="Source">
            <Github size={12} />
          </a>
        )}
      </div>
    </div>
  );
}
