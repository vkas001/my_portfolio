import { useMemo, useRef, useState } from 'react';
import type { EditorSection, WindowData } from '@/types';
import SkillsTab from '@/modules/editor/components/SkillsTab/SkillsTab';
import ProjectsTab from '@/modules/editor/components/ProjectsTab/ProjectsTab';
import ExperienceTab from '@/modules/editor/components/ExperienceTab/ExperienceTab';
import ProfileTab from '@/modules/editor/components/ProfileTab/ProfileTab';
import FloatingSaveButton from '@/modules/editor/components/FloatingSaveButton/FloatingSaveButton';
import type { SaveBridge } from '@/modules/editor/lib/scaffolding';

const SECTION_TABS: { id: EditorSection; label: string }[] = [
  { id: 'profile', label: 'Profile' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'experience', label: 'Experience' },
];

export default function Editor({ data }: { data?: WindowData }) {
  const [section, setSection] = useState<EditorSection>(data?.section ?? 'profile');
  const commitRef = useRef<(() => void) | null>(null);
  const [saveState, setSaveState] = useState({ canSave: false, saving: false });
  const lastSave = useRef({ canSave: false, saving: false });
  const reportSave = useMemo(() => (s: { canSave: boolean; saving: boolean }) => {
    const p = lastSave.current;
    if (p.canSave !== s.canSave || p.saving !== s.saving) {
      lastSave.current = s;
      setSaveState(s);
    }
  }, []);
  const bridge: SaveBridge = { commitRef, reportSave };

  return (
    <div className="relative flex flex-col h-full gap-3">
      <div className="flex gap-1.5">
        {SECTION_TABS.map((t) => (
          <button
            key={t.id}
            className={`chip cursor-pointer !py-1.5 !px-2.5 text-[11px] ${section === t.id ? '!bg-[var(--accent)] !text-[var(--accent-text-on)]' : ''}`}
            onClick={() => setSection(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto pr-1 -mr-1 pb-14">
        {section === 'profile' ? <ProfileTab {...bridge} /> : null}
        {section === 'skills' ? <SkillsTab {...bridge} /> : null}
        {section === 'projects' ? <ProjectsTab {...bridge} /> : null}
        {section === 'experience' ? <ExperienceTab {...bridge} /> : null}
      </div>

      <FloatingSaveButton canSave={saveState.canSave} saving={saveState.saving} onSave={() => commitRef.current?.()} />
    </div>
  );
}