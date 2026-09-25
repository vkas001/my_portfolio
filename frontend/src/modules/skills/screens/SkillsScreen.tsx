import { useMemo, useState } from 'react';
import { BarChart2, LayoutGrid } from 'lucide-react';
import { CATEGORY_LABELS, SkillBars, SkillCards, categoryColor, collectSkillCategories, useSkills } from '@/modules/skills';
import { useTheme } from '@/context/ThemeContext';
import type { SkillCategory } from '@shared/types';
import type { SkillDisplayMode } from '@/styles/theme';

export default function SkillsScreen() {
  const skills = useSkills();
  const { theme, setTheme } = useTheme();
  const [active, setActive] = useState<SkillCategory | 'all'>('all');

  const categories = useMemo(() => collectSkillCategories(skills), [skills]);

  const filtered = useMemo(
    () => skills.filter((s) => active === 'all' || s.category === active).sort((a, b) => b.proficiency - a.proficiency),
    [skills, active],
  );

  const setMode = (mode: SkillDisplayMode) => setTheme({ skillsDisplay: mode });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
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
              style={active === c ? { background: categoryColor(c), color: '#fff', borderColor: 'transparent' } : undefined}
              onClick={() => setActive(c)}
            >
              {CATEGORY_LABELS[c] ?? c}
            </button>
          ))}
        </div>
        <div className="flex rounded-[var(--radius-sm)] overflow-hidden shrink-0" style={{ background: 'var(--accent-soft)' }}>
          <button
            data-mode="bars"
            className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-bold cursor-pointer transition-all duration-150"
            style={
              theme.skillsDisplay === 'bars'
                ? { background: 'var(--accent)', color: 'var(--accent-text-on)' }
                : { color: 'var(--text-mid)' }
            }
            onClick={() => setMode('bars')}
          >
            <BarChart2 size={13} />
            Bars
          </button>
          <button
            data-mode="cards"
            className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-bold cursor-pointer transition-all duration-150"
            style={
              theme.skillsDisplay === 'cards'
                ? { background: 'var(--accent)', color: 'var(--accent-text-on)' }
                : { color: 'var(--text-mid)' }
            }
            onClick={() => setMode('cards')}
          >
            <LayoutGrid size={13} />
            Cards
          </button>
        </div>
      </div>

      {theme.skillsDisplay === 'bars' ? <SkillBars skills={filtered} /> : <SkillCards skills={filtered} />}
      {!skills.length && <p className="text-xs" style={{ color: 'var(--text-low)' }}>Loading skills…</p>}
    </div>
  );
}