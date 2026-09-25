import { useMemo } from 'react';
import { useEducation } from '@/modules/education';
import { GraduationCap } from 'lucide-react';

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString([], { month: 'short', year: 'numeric' });
}

export default function EducationScreen() {
  const education = useEducation();
  const items = useMemo(() => [...education].sort((a, b) => a.order - b.order), [education]);

  if (!items.length) {
    return <p className="text-xs" style={{ color: 'var(--text-low)' }}>No education data — add entries in backend/data/education.json.</p>;
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
            <h3 className="text-sm font-semibold">{x.institution}</h3>
            <span className="text-[10px] tabular-nums" style={{ color: 'var(--text-low)' }}>
              {fmt(x.startDate)} — {x.endDate ? fmt(x.endDate) : 'Present'}
            </span>
          </div>
          <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color: 'var(--accent)' }}>
            <GraduationCap size={11} /> {x.degree}
          </p>
          {x.description && (
            <p className="mt-2 text-xs leading-relaxed" style={{ color: 'var(--text-mid)' }}>
              {x.description}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}