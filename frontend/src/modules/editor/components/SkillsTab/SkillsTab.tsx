import { useContent } from '@/context/ContentContext';
import SectionEditor from '@/modules/editor/components/SectionEditor/SectionEditor';
import SkillForm, { type SkillDraft } from '@/modules/editor/components/SkillForm/SkillForm';
import { categoryLabel } from '@/modules/skills';
import { Wrench } from 'lucide-react';
import type { SaveBridge } from '@/modules/editor/lib/scaffolding';
import { newId } from '@/modules/editor/lib/scaffolding';

export default function SkillsTab({ commitRef, reportSave }: SaveBridge) {
  const { skills, saveSkill, deleteSkill } = useContent();
  return (
    <SectionEditor<SkillDraft>
      commitRef={commitRef}
      reportSave={reportSave}
      scaffold={{
        section: 'skills',
        items: skills,
        icon: <Wrench size={18} />,
        titleOf: (s) => s.name,
        subOf: (s) => `${categoryLabel(s.category)} · ${s.proficiency}%`,
        emptyFor: (id) => ({ id, name: '', category: '', proficiency: 80, yearsUsed: 0, icon: null, extraNames: [] }),
        save: saveSkill,
        remove: deleteSkill,
        validate: (d) => {
          if (!d.name.trim()) return 'Name is required';
          if (!d.category.trim()) return 'Category is required — pick one from the list or type a new one.';
          return null;
        },
        renderFields: (d, set) => <SkillForm d={d} set={set} />,
        // Batch save: one row per staged name, each with its own
        // proficiency and years; the shared category applies to all.
        // Blank rows are skipped.
        splitDraft: (d) => {
          const { extraRows, ...base } = d;
          const rows: SkillDraft[] = [{ ...base }];
          for (const r of extraRows ?? []) {
            const name = r.name.trim();
            if (!name) continue;
            rows.push({ ...base, id: newId(), name, proficiency: r.proficiency, yearsUsed: r.yearsUsed });
          }
          return rows;
        },
        renderRowMeta: (s) => <span className="text-[10px] tabular-nums" style={{ color: 'var(--text-low)' }}>{s.yearsUsed}y</span>,
      }}
    />
  );
}