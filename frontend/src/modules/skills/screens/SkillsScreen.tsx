import { useMemo, useState } from 'react';
import { useContent } from '@/context/ContentContext';
import type { SkillCategory } from '@shared/types';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '@/modules/skills/lib/categories';

export default function Skills() {
  const { skills } = useContent();
  const [active, setActive] = useState<SkillCategory | 'all'>('all');

  const categories = useMemo(
    () => [...new Set(skills.map((s) => s.category))],
    [skills],
  );

  const filtered = useMemo(
    () => skills.filter((s) => active === 'all' || s.category === active).sort((a, b) => b.proficiency - a.proficiency),
    [skills, active],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5">
        <button
          className={`chip cursor-pointer ${active === 'all' ? '!bg-[var(--accent)] !text-[var(--accent-text-on)]' : ''}`}
          onClick={() => setActive('all')}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c}
            className={`chip cursor-pointer ${active === c ? '' : ''}`}
            style={active === c ? { background: CATEGORY_COLORS[c], color: '#fff', borderColor: 'transparent' } : undefined}
            onClick={() => setActive(c)}
          >
            {CATEGORY_LABELS[c] ?? c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-x-6 gap-y-3">
        {filtered.map((s) => (
          <div key={s.id} className="group col-span-12 @md:col-span-6">
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-xs font-medium">{s.name}</span>
              <span className="text-[10px] tabular-nums" style={{ color: 'var(--text-low)' }}>
                {s.yearsUsed}y · {s.proficiency}%
              </span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--accent-soft)' }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${s.proficiency}%`,
                  background: CATEGORY_COLORS[s.category] ?? 'var(--accent)',
                }}
              />
            </div>
          </div>
        ))}
      </div>
      {!skills.length && <p className="text-xs" style={{ color: 'var(--text-low)' }}>Loading skills…</p>}
    </div>
  );
}
