import { useMemo } from 'react';
import type { Skill } from '@shared/types';
import { CATEGORY_LABELS, collectSkillCategories } from '@/modules/skills';
import { useContent } from '@/context/ContentContext';
import Input from '@/components/ui/Input/Input';
import CategoryField from '@/modules/editor/components/CategoryField/CategoryField';

export default function SkillForm({
  d,
  set,
}: {
  d: Skill;
  set: (patch: Partial<Skill>) => void;
}) {
  const { skills } = useContent();
  const categoryOptions = useMemo(() => collectSkillCategories(skills), [skills]);

  return (
    <>
      <Input label="Name" value={d.name} placeholder="React, Laravel, …" onChange={(e) => set({ name: e.target.value })} />
      <CategoryField
        label="Category"
        value={d.category}
        onChange={(v) => set({ category: v })}
        options={categoryOptions}
        labelOf={(c) => CATEGORY_LABELS[c] ?? c}
        hint="Type a new one, or pick an existing one from the list."
      />
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-6">
          <Input label="Proficiency (0–100)" type="number" min={0} max={100} value={d.proficiency} onChange={(e) => set({ proficiency: Number(e.target.value) })} />
        </div>
        <div className="col-span-6">
          <Input label="Years used" type="number" min={0} max={100} value={d.yearsUsed} onChange={(e) => set({ yearsUsed: Number(e.target.value) })} />
        </div>
      </div>
    </>
  );
}