import type { Project } from '@shared/types';
import { useContent } from '@/context/ContentContext';
import SectionEditor from '@/modules/editor/components/SectionEditor/SectionEditor';
import ProjectFields from '@/modules/editor/components/ProjectFields/ProjectFields';
import { emptyProject, type SaveBridge } from '@/modules/editor/lib/scaffolding';

export default function ProjectsTab({ commitRef, reportSave }: SaveBridge) {
  const { projects, saveProject, deleteProject, moveItem } = useContent();
  return (
    <SectionEditor<Project>
      commitRef={commitRef}
      reportSave={reportSave}
      scaffold={{
        section: 'projects',
        items: projects,
        titleOf: (p) => p.title,
        subOf: (p) => `${p.year} · ${p.techStack.slice(0, 3).join(', ')}`,
        emptyFor: emptyProject,
        save: saveProject,
        remove: deleteProject,
        move: (id, dir) => { void moveItem('projects', id, dir); },
        validate: (d) => (d.title.trim() && d.description.trim() && d.category.trim() ? null : 'Title, description and category are required'),
        renderFields: (d, set) => <ProjectFields d={d} set={set} />,
        renderRowMeta: (p) => <span className="text-[10px] tabular-nums" style={{ color: 'var(--text-low)' }}>{p.year}</span>,
      }}
    />
  );
}