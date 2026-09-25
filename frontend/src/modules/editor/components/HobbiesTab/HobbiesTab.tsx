import type { Hobby } from '@shared/types';
import { useContent } from '@/context/ContentContext';
import SectionEditor from '@/modules/editor/components/SectionEditor/SectionEditor';
import HobbiesFields from '@/modules/editor/components/HobbiesFields/HobbiesFields';
import { hobbyIcon, type HobbyIcon } from '@/modules/hobbies';
import { emptyHobby, type SaveBridge } from '@/modules/editor/lib/scaffolding';

export default function HobbiesTab({ commitRef, reportSave }: SaveBridge) {
  const { hobbies, saveHobby, deleteHobby, moveItem } = useContent();
  return (
    <SectionEditor<Hobby>
      commitRef={commitRef}
      reportSave={reportSave}
      scaffold={{
        section: 'hobbies',
        items: hobbies,
        titleOf: (x) => x.name,
        subOf: (x) => x.description,
        emptyFor: emptyHobby,
        save: saveHobby,
        remove: deleteHobby,
        move: (id, dir) => { void moveItem('hobbies', id, dir); },
        validate: (d) => (d.name.trim() ? null : 'Name is required'),
        renderFields: (d, set) => <HobbiesFields d={d} set={set} />,
        renderRowMeta: (x) => {
          const Icon = hobbyIcon(x.icon as HobbyIcon);
          return (
            <span style={{ color: 'var(--accent)' }}>
              <Icon size={12} />
            </span>
          );
        },
      }}
    />
  );
}