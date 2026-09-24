import type { Project } from '@shared/types';
import Field, { inputCls } from '@/modules/editor/components/Field/Field';
import StringListInput from '@/modules/editor/components/StringListInput/StringListInput';

export default function ProjectFields({
  d,
  set,
}: {
  d: Project;
  set: (patch: Partial<Project>) => void;
}) {
  return (
    <>
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-7">
          <Field label="Title">
            <input className={inputCls} value={d.title} onChange={(e) => set({ title: e.target.value })} />
          </Field>
        </div>
        <div className="col-span-5">
          <Field label="Category">
            <input className={inputCls} value={d.category} onChange={(e) => set({ category: e.target.value })} />
          </Field>
        </div>
      </div>
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-6">
          <Field label="Year">
            <input type="number" min={1990} max={2100} className={inputCls} value={d.year} onChange={(e) => set({ year: Number(e.target.value) })} />
          </Field>
        </div>
        <div className="col-span-6 flex items-end pb-1">
          <label className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: 'var(--text-mid)' }}>
            <input type="checkbox" checked={d.featured} onChange={(e) => set({ featured: e.target.checked })} /> Featured
          </label>
        </div>
      </div>
      <Field label="Short description">
        <textarea className={`${inputCls} resize-y`} rows={2} value={d.description} onChange={(e) => set({ description: e.target.value })} />
      </Field>
      <Field label="Long description">
        <textarea className={`${inputCls} resize-y`} rows={3} value={d.longDescription ?? ''} onChange={(e) => set({ longDescription: e.target.value })} />
      </Field>
      <Field label="Tech stack">
        <StringListInput value={d.techStack} onChange={(v) => set({ techStack: v })} />
      </Field>
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-6">
          <Field label="Live URL"><input className={inputCls} value={d.liveUrl ?? ''} onChange={(e) => set({ liveUrl: e.target.value || null })} /></Field>
        </div>
        <div className="col-span-6">
          <Field label="Source URL"><input className={inputCls} value={d.githubUrl ?? ''} onChange={(e) => set({ githubUrl: e.target.value || null })} /></Field>
        </div>
      </div>
    </>
  );
}