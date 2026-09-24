import type { Skill } from '@shared/types';
import { CATEGORY_LABELS, SKILL_CATEGORIES } from '@/modules/skills';
import Field, { inputCls } from '@/modules/editor/components/Field/Field';
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
      <Field label="Name">
        <input className={inputCls} value={d.name} placeholder="React, Laravel, …" onChange={(e) => set({ name: e.target.value })} />
      </Field>
      <Field label="Category">
        <SelectInput value={d.category} options={SKILL_CATEGORIES} labels={CATEGORY_LABELS} onChange={(v) => set({ category: v })} />
      </Field>
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-6">
          <Field label="Proficiency (0–100)">
            <input type="number" min={0} max={100} className={inputCls} value={d.proficiency} onChange={(e) => set({ proficiency: Number(e.target.value) })} />
          </Field>
        </div>
        <div className="col-span-6">
          <Field label="Years used">
            <input type="number" min={0} max={100} className={inputCls} value={d.yearsUsed} onChange={(e) => set({ yearsUsed: Number(e.target.value) })} />
          </Field>
        </div>
      </div>
    </>
  );
}