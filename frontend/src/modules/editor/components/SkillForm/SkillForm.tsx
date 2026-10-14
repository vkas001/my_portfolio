import { useMemo } from 'react';
import { Plus, X } from 'lucide-react';
import type { Skill } from '@shared/types';
import { categoryLabel, collectSkillCategories } from '@/modules/skills';
import { useContent } from '@/context/ContentContext';
import Input from '@/components/ui/Input/Input';
import NumberInput from '@/components/ui/NumberInput/NumberInput';
import CategoryField from '@/modules/editor/components/CategoryField/CategoryField';

/** One staged extra skill row (name + its own ratings). */
export interface SkillExtraRow {
  name: string;
  proficiency: number;
  yearsUsed: number;
}

/** Skill draft with staged extra rows. The extras never cross the API —
 *  `splitDraft` (SkillsTab) expands them into plain rows on save, and the
 *  saver builds an explicit input per row. */
export type SkillDraft = Skill & { extraRows?: SkillExtraRow[] };

const BLANK_ROW = (proficiency: number, yearsUsed: number): SkillExtraRow => ({
  name: '',
  proficiency,
  yearsUsed,
});

function NameRow({
  idPrefix,
  name,
  proficiency,
  yearsUsed,
  labeled,
  action,
  onName,
  onProficiency,
  onYears,
}: {
  idPrefix: string;
  name: string;
  proficiency: number;
  yearsUsed: number;
  /** First row carries visible labels; staged rows use placeholders. */
  labeled: boolean;
  action: React.ReactNode;
  onName: (v: string) => void;
  onProficiency: (v: number) => void;
  onYears: (v: number) => void;
}) {
  return (
    <div className="flex items-end gap-2">
      <div className="flex-1 min-w-0">
        {labeled ? (
          <Input label="Name" value={name} placeholder="React, Laravel, …" onChange={(e) => onName(e.target.value)} />
        ) : (
          <Input
            aria-label="Additional skill name"
            value={name}
            placeholder="Another name…"
            onChange={(e) => onName(e.target.value)}
          />
        )}
      </div>
      <div className="w-20 shrink-0">
        <NumberInput
          key={`${idPrefix}-prof`}
          label={labeled ? 'Prof. (0–100)' : undefined}
          aria-label="Proficiency (0–100)"
          min={0}
          max={100}
          placeholder="80"
          value={proficiency}
          onCommit={onProficiency}
        />
      </div>
      <div className="w-16 shrink-0">
        <NumberInput
          key={`${idPrefix}-years`}
          label={labeled ? 'Years' : undefined}
          aria-label="Years used"
          min={0}
          max={100}
          value={yearsUsed}
          onCommit={onYears}
        />
      </div>
      {action}
    </div>
  );
}

export default function SkillForm({
  d,
  set,
}: {
  d: SkillDraft;
  set: (patch: Partial<SkillDraft>) => void;
}) {
  const { skills } = useContent();
  const categoryOptions = useMemo(() => collectSkillCategories(skills), [skills]);
  const extras = d.extraRows ?? [];
  const setExtra = (i: number, patch: Partial<SkillExtraRow>) =>
    set({ extraRows: extras.map((x, j) => (j === i ? { ...x, ...patch } : x)) });
  const removeExtra = (i: number) =>
    set({ extraRows: extras.filter((_, j) => j !== i) });

  const addButton = (
    <button
      type="button"
      title="Add another name below, with its own proficiency and years"
      aria-label="Add another name field"
      onClick={() => set({ extraRows: [...extras, BLANK_ROW(d.proficiency, d.yearsUsed)] })}
      className="px-3 py-2 rounded-[var(--radius-sm)] text-xs font-bold transition-all cursor-pointer shrink-0"
      style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
    >
      <Plus size={14} />
    </button>
  );

  return (
    <>
      <div className="space-y-2">
        <NameRow
          idPrefix={`${d.id}-main`}
          name={d.name}
          proficiency={d.proficiency}
          yearsUsed={d.yearsUsed}
          labeled
          action={addButton}
          onName={(v) => set({ name: v })}
          onProficiency={(v) => set({ proficiency: v })}
          onYears={(v) => set({ yearsUsed: v })}
        />
        {extras.map((row, i) => (
          <NameRow
            key={i}
            idPrefix={`${d.id}-extra-${i}`}
            name={row.name}
            proficiency={row.proficiency}
            yearsUsed={row.yearsUsed}
            labeled={false}
            action={
              <button
                type="button"
                title="Remove this name"
                aria-label={`Remove name ${i + 1}`}
                onClick={() => removeExtra(i)}
                className="px-3 py-2 rounded-[var(--radius-sm)] text-xs font-bold transition-all cursor-pointer shrink-0"
                style={{ background: 'var(--error-soft)', color: 'var(--error)' }}
              >
                <X size={14} />
              </button>
            }
            onName={(v) => setExtra(i, { name: v })}
            onProficiency={(v) => setExtra(i, { proficiency: v })}
            onYears={(v) => setExtra(i, { yearsUsed: v })}
          />
        ))}
      </div>
      <CategoryField
        label="Category"
        value={d.category}
        onChange={(v) => set({ category: v })}
        options={categoryOptions}
        labelOf={(c) => categoryLabel(c)}
        hint="Type a new one, or pick an existing one. Saving creates one skill per name above, each with its own proficiency and years."
      />
    </>
  );
}
