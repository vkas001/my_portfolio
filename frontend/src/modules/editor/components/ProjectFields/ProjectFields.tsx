import { useMemo } from 'react';
import type { Project } from '@shared/types';
import Field from '@/modules/editor/components/Field/Field';
import Input from '@/components/ui/Input/Input';
import TextArea from '@/components/ui/TextArea/TextArea';
import StringListInput from '@/modules/editor/components/StringListInput/StringListInput';
import CategoryField from '@/modules/editor/components/CategoryField/CategoryField';
import { useContent } from '@/context/ContentContext';

export default function ProjectFields({
  d,
  set,
}: {
  d: Project;
  set: (patch: Partial<Project>) => void;
}) {
  const { projects } = useContent();
  const categoryOptions = useMemo(() => {
    const seen: string[] = [];
    for (const p of projects) {
      const c = (p.category ?? '').trim();
      if (c && !seen.some((x) => x.toLowerCase() === c.toLowerCase())) seen.push(c);
    }
    return seen;
  }, [projects]);

  return (
    <>
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-7">
          <Input label="Title" value={d.title} onChange={(e) => set({ title: e.target.value })} />
        </div>
        <div className="col-span-5">
          <CategoryField
            label="Category"
            value={d.category}
            onChange={(v) => set({ category: v })}
            options={categoryOptions}
            hint="Type a new one, or pick an existing one from the list."
          />
        </div>
      </div>
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-6">
          <Input label="Year" type="number" min={1990} max={2100} value={d.year} onChange={(e) => set({ year: Number(e.target.value) })} />
        </div>
        <div className="col-span-6 flex items-end pb-1">
          <label className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: 'var(--text-mid)' }}>
            <input type="checkbox" checked={d.featured} onChange={(e) => set({ featured: e.target.checked })} /> Featured
          </label>
        </div>
      </div>
      <TextArea label="Short description" rows={2} value={d.description} onChange={(e) => set({ description: e.target.value })} />
      <TextArea label="Long description" rows={3} value={d.longDescription ?? ''} onChange={(e) => set({ longDescription: e.target.value })} />
      <Field label="Tech stack">
        <StringListInput value={d.techStack} onChange={(v) => set({ techStack: v })} />
      </Field>
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-6">
          <Input label="Live URL" value={d.liveUrl ?? ''} onChange={(e) => set({ liveUrl: e.target.value || null })} />
        </div>
        <div className="col-span-6">
          <Input label="Source URL" value={d.githubUrl ?? ''} onChange={(e) => set({ githubUrl: e.target.value || null })} />
        </div>
      </div>
    </>
  );
}