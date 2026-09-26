import { useState } from 'react';
import type { Education } from '@shared/types';
import { useContent } from '@/context/ContentContext';
import SectionEditor from '@/modules/editor/components/SectionEditor/SectionEditor';
import EducationFields from '@/modules/editor/components/EducationFields/EducationFields';
import { emptyEducation, type SaveBridge } from '@/modules/editor/lib/scaffolding';

export default function EducationTab({ commitRef, reportSave }: SaveBridge) {
  const { education, saveEducation, deleteEducation, moveItem } = useContent();
  const [present, setPresent] = useState(false);
  return (
    <SectionEditor<Education>
      commitRef={commitRef}
      reportSave={reportSave}
      scaffold={{
        section: 'education',
        items: education,
        titleOf: (x) => x.institution,
        subOf: (x) => x.degree,
        emptyFor: emptyEducation,
        save: saveEducation,
        remove: deleteEducation,
        move: (id, dir) => { void moveItem('education', id, dir); },
        validate: (d) =>
          d.institution.trim() && d.degree.trim() && d.startDate
            ? null
            : 'Institution, degree and start date are required',
        renderFields: (d, set) => (
          <EducationFields d={d} set={set} present={present} setPresent={setPresent} />
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