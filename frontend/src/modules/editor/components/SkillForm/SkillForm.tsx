import type { Skill } from '@shared/types';
import { CATEGORY_LABELS, SKILL_CATEGORIES } from '@/modules/skills';
import Field from '@/modules/editor/components/Field/Field';
import Input from '@/components/ui/Input/Input';
import SelectInput from '@/modules/editor/components/SelectInput/SelectInput';

export default function SkillForm({
  d,
  set,
}: {
  d: Skill;
  set: (patch: Partial<Skill>) => void;
}) {
  return (
    <>
      <Input label="Name" value={d.name} placeholder="React, Laravel, …" onChange={(e) => set({ name: e.target.value })} />
      <Field label="Category">
        <SelectInput value={d.category} options={SKILL_CATEGORIES} labels={CATEGORY_LABELS} onChange={(v) => set({ category: v })} />
      </Field>
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