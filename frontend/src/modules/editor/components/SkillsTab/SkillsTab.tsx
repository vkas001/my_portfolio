import type { Skill } from '@shared/types';
import { useContent } from '@/context/ContentContext';
import SectionEditor from '@/modules/editor/components/SectionEditor/SectionEditor';
import SkillForm from '@/modules/editor/components/SkillForm/SkillForm';
import { CATEGORY_LABELS } from '@/modules/skills';
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
        titleOf: (s) => s.name,
        subOf: (s) => `${CATEGORY_LABELS[s.category] ?? s.category} · ${s.proficiency}%`,
        emptyFor: (id) => ({ id, name: '', category: 'tools', proficiency: 80, yearsUsed: 0, icon: null }),
        save: saveSkill,
        remove: deleteSkill,
        validate: (d) => (d.name.trim() ? null : 'Name is required'),
        renderFields: (d, set) => <SkillForm d={d} set={set} />,
        renderRowMeta: (s) => <span className="text-[10px] tabular-nums" style={{ color: 'var(--text-low)' }}>{s.yearsUsed}y</span>,
      }}
    />
  );
}