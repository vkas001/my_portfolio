import { useMemo } from 'react';
import { useContent } from '@/context/ContentContext';
import { Building2 } from 'lucide-react';

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString([], { month: 'short', year: 'numeric' });
}

export default function Experience() {
  const { experience } = useContent();
  const items = useMemo(() => [...experience].sort((a, b) => a.order - b.order), [experience]);

  if (!items.length) {
    return <p className="text-xs" style={{ color: 'var(--text-low)' }}>No experience data — add entries in backend/data/experience.json.</p>;
  }

  return (
    <div className="relative max-w-2xl" style={{ paddingLeft: 24 }}>
      <div className="absolute left-0 top-2 bottom-2 w-px" style={{ background: 'var(--border)' }} />

      {items.map((x) => (
        <div key={x.id} className="relative pb-6">
          <span
            className="absolute -left-[29px] top-1 w-2.5 h-2.5 rounded-full"
            style={{ background: 'var(--accent)', boxShadow: '0 0 0 3px var(--accent-soft)' }}
          />
          <div className="flex items-baseline justify-between gap-2 flex-wrap">
            <h3 className="text-sm font-semibold">{x.role}</h3>
            <span className="text-[10px] tabular-nums" style={{ color: 'var(--text-low)' }}>
              {fmt(x.startDate)} — {x.endDate ? fmt(x.endDate) : 'Present'}
            </span>
          </div>
          <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color: 'var(--accent)' }}>
            <Building2 size={11} /> {x.company} · {x.employmentType}
          </p>
          <ul className="mt-2 space-y-1">
            {x.highlights.map((h, i) => (
              <li key={i} className="text-xs leading-relaxed flex gap-1.5" style={{ color: 'var(--text-mid)' }}>
                <span style={{ color: 'var(--accent)' }}>▸</span> {h}
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-1 mt-2">
            {x.techStack.map((t) => (
              <span key={t} className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
                {t}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
