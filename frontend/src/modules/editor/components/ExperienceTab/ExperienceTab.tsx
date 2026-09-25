import { useState } from 'react';
import type { Experience } from '@shared/types';
import { useContent } from '@/context/ContentContext';
import SectionEditor from '@/modules/editor/components/SectionEditor/SectionEditor';
import ExperienceFields from '@/modules/editor/components/ExperienceFields/ExperienceFields';
import { emptyExperience, type SaveBridge } from '@/modules/editor/lib/scaffolding';

export default function ExperienceTab({ commitRef, reportSave }: SaveBridge) {
  const { experience, saveExperience, deleteExperience, moveItem } = useContent();
  const [present, setPresent] = useState(false);
  return (
    <SectionEditor<Experience>
      commitRef={commitRef}
      reportSave={reportSave}
      scaffold={{
        section: 'experience',
        items: experience,
        titleOf: (x) => x.role,
        subOf: (x) => `${x.company} · ${x.location}`,
        emptyFor: emptyExperience,
        save: saveExperience,
        remove: deleteExperience,
        move: (id, dir) => { void moveItem('experience', id, dir); },
        validate: (d) =>
          d.role.trim() && d.company.trim() && d.location.trim() && d.employmentType.trim() && d.startDate
            ? null
            : 'Role, company, location, employment type and start date are required',
        renderFields: (d, set) => (
          <ExperienceFields d={d} set={set} present={present} setPresent={setPresent} />
        ),
        renderRowMeta: (x) => (
          <span className="text-[10px] tabular-nums" style={{ color: 'var(--text-low)' }}>
            {x.startDate.slice(0, 4)}{x.endDate ? `–${x.endDate.slice(0, 4)}` : '–now'}
          </span>
        ),
      }}
    />
  );
}