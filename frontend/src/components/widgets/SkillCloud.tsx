import { useEffect, useState } from 'react';
import { fetchSkills } from '@/lib/api';
import type { Skill } from '@shared/types';

export default function SkillCloud() {
  const [skills, setSkills] = useState<Skill[]>([]);

  useEffect(() => {
    let alive = true;
    fetchSkills().then((s) => { if (alive) setSkills(s); });
    return () => { alive = false; };
  }, []);

  const top = [...skills].sort((a, b) => b.proficiency - a.proficiency).slice(0, 6);

  return (
    <div className="flex flex-wrap gap-1.5 content-start h-full overflow-hidden">
      {top.map((s) => (
        <span
          key={s.id}
          className="chip"
          style={{ fontSize: `${Math.max(10, Math.min(13, s.proficiency / 9))}px` }}
          title={`${s.name} — ${s.proficiency}%`}
        >
          {s.name}
        </span>
      ))}
      {!skills.length && <p className="text-xs" style={{ color: 'var(--text-low)' }}>Loading skills…</p>}
    </div>
  );
}
