import type { Skill } from '@shared/types';
import { useContent } from '@/context/ContentContext';
import SectionEditor from '@/modules/editor/components/SectionEditor/SectionEditor';
import SkillForm from '@/modules/editor/components/SkillForm/SkillForm';
import { categoryLabel } from '@/modules/skills';
import { Wrench } from 'lucide-react';
import type { SaveBridge } from '@/modules/editor/lib/scaffolding';

export default function SkillsTab({ commitRef, reportSave }: SaveBridge) {
  const { skills, saveSkill, deleteSkill } = useContent();
  return (
    <SectionEditor<Skill>
      commitRef={commitRef}
      reportSave={reportSave}
      scaffold={{
        section: 'skills',
        items: skills,
        icon: <Wrench size={18} />,
        titleOf: (s) => s.name,
        subOf: (s) => `${categoryLabel(s.category)} · ${s.proficiency}%`,
        emptyFor: (id) => ({ id, name: '', category: '', proficiency: 80, yearsUsed: 0, icon: null }),
        save: saveSkill,
        remove: deleteSkill,
        validate: (d) => {
          if (!d.name.trim()) return 'Name is required';
          if (!d.category.trim()) return 'Category is required — pick one from the list or type a new one.';
          return null;
        },
        renderFields: (d, set, actions) => <SkillForm d={d} set={set} onQuickAdd={actions.quickAddIn} />,
        setCategory: (d, category) => ({ ...d, category }),
        presetCategory: (category) => ({ category }),
        // Rapid entry: after adding one skill, keep the form open with the
        // same category so names can be typed one after another.
        repeatPreset: (d) => ({ category: d.category }),
        renderRowMeta: (s) => <span className="text-[10px] tabular-nums" style={{ color: 'var(--text-low)' }}>{s.yearsUsed}y</span>,
      }}
    />
  );
}