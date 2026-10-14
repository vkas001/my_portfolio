import { useState } from 'react';
import type { Skill } from '@shared/types';
import { categoryColor, categoryLabel } from '@/modules/skills';

// White-on-fill label kept legible over both the colored fill and the empty
// track with a layered shadow (the classic badge-over-any-background trick).
const INBAR_STYLE = {
  color: '#fff',
  textShadow: '0 1px 2px rgba(0,0,0,.4), 0 0 0 1px rgba(0,0,0,.16)',
} as const;

export default function SkillBars({ skills }: { skills: Skill[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  return (
    <div className="grid grid-cols-12 gap-y-3 gap-x-2 @md:gap-x-6">
      {skills.map((s) => {
        const color = categoryColor(s.category);
        const open = openId === s.id;
        return (
          <div key={s.id} data-skill-bar className="col-span-12 min-w-0 @md:col-span-6">
            <div
              role="button"
              tabIndex={0}
              aria-expanded={open}
              onClick={() => setOpenId(open ? null : s.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setOpenId(open ? null : s.id);
                }
              }}
              className="relative h-7 rounded-full overflow-hidden select-none cursor-pointer transition-all duration-150 hover:-translate-y-0.5"
              // Open-state lift as inline style so it beats the hover-lift
              // class while the pointer sits on the bar (same as cards).
              style={{
                background: `color-mix(in srgb, ${color} 18%, transparent)`,
                ...(open ? { translate: '0 -6px', boxShadow: '0 12px 32px rgba(0,0,0,.35)' } : null),
              }}
            >
              <div
                data-skill-fill
                className="h-full rounded-full flex items-center justify-between gap-2 px-3 transition-all duration-700"
                style={{ width: `${s.proficiency}%`, background: color }}
                title={`${s.name} — ${s.yearsUsed}y · ${s.proficiency}%`}
              >
                <span data-skill-name className="text-[11px] font-semibold truncate min-w-0" style={INBAR_STYLE}>
                  {s.name}
                </span>
                <span
                  data-skill-stats
                  className="text-[10px] font-medium tabular-nums shrink-0"
                  style={INBAR_STYLE}
                >
                  {s.yearsUsed}y · {s.proficiency}%
                </span>
              </div>
            </div>
            {/* Reveal the category — the one detail bars hide that cards show. */}
            <div className={`grid transition-all duration-300 ease-in-out ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
              <div className="overflow-hidden min-h-0">
                <div className="flex items-center gap-1.5 pt-1 pl-3">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                  <span className="text-[10px] font-medium" style={{ color: 'var(--text-low)' }}>
                    {categoryLabel(s.category)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}