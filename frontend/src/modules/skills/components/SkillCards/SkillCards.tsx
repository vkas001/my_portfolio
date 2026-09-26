import type { Skill } from '@shared/types';
import { CATEGORY_LABELS, categoryColor } from '@/modules/skills';

export default function SkillCards({ skills }: { skills: Skill[] }) {
  return (
    <div className="grid grid-cols-12 gap-x-2 gap-y-3 @md:gap-x-6">
      {skills.map((s) => (
        <div key={s.id} data-skill-card className="col-span-12 min-w-0 @md:col-span-6 @2xl:col-span-4">
          <div
            className="p-3 rounded-[var(--radius)] border transition-transform duration-150 hover:-translate-y-0.5"
            style={{ background: 'var(--bg-elev)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span data-skill-name className="text-xs font-semibold truncate" style={{ color: 'var(--text-hi)' }}>
                {s.name}
              </span>
              <span className="text-[10px] font-medium tabular-nums shrink-0" style={{ color: categoryColor(s.category) }}>
                {s.proficiency}%
              </span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden mb-2" style={{ background: 'var(--accent-soft)' }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${s.proficiency}%`, background: categoryColor(s.category) }}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px]" style={{ color: 'var(--text-mid)' }}>{s.yearsUsed} yrs</span>
              <span className="text-[10px]" style={{ color: 'var(--text-low)' }}>{CATEGORY_LABELS[s.category] ?? s.category}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}