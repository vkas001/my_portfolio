import type { Skill } from '@shared/types';
import { categoryColor } from '@/modules/skills';

// White-on-fill label kept legible over both the colored fill and the empty
// track with a layered shadow (the classic badge-over-any-background trick).
const INBAR_STYLE = {
  color: '#fff',
  textShadow: '0 1px 2px rgba(0,0,0,.4), 0 0 0 1px rgba(0,0,0,.16)',
} as const;

export default function SkillBars({ skills }: { skills: Skill[] }) {
  return (
    <div className="grid grid-cols-12 gap-y-3 gap-x-2 @md:gap-x-6">
      {skills.map((s) => (
        <div key={s.id} data-skill-bar className="col-span-12 min-w-0 @md:col-span-6">
          <div className="relative h-7 rounded-full overflow-hidden select-none" style={{ background: 'var(--accent-soft)' }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${s.proficiency}%`, background: categoryColor(s.category) }}
            />
            <div className="absolute inset-0 flex items-center justify-between gap-2 px-3">
              <span data-skill-name className="text-[11px] font-semibold truncate" style={INBAR_STYLE}>
                {s.name}
              </span>
              <span className="text-[10px] font-medium tabular-nums shrink-0" style={INBAR_STYLE}>
                {s.yearsUsed}y · {s.proficiency}%
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}