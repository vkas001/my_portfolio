import { useMemo } from 'react';
import type { Skill } from '@shared/types';
import { categoryLabel, collectSkillCategories } from '@/modules/skills';
import { useContent } from '@/context/ContentContext';
import Input from '@/components/ui/Input/Input';
import CategoryField from '@/modules/editor/components/CategoryField/CategoryField';

export default function SkillForm({
  d,
  set,
  onQuickAdd,
}: {
  d: Skill;
  set: (patch: Partial<Skill>) => void;
  onQuickAdd?: (category: string) => void;
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
        labelOf={(c) => categoryLabel(c)}
        onQuickAdd={onQuickAdd}
        hint="Type a new one, or pick an existing one — + on a row saves this skill and starts the next one there."
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