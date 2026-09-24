import { useEffect } from 'react';
import type { Experience } from '@shared/types';
import Field, { inputCls } from '@/modules/editor/components/Field/Field';
import SelectInput from '@/modules/editor/components/SelectInput/SelectInput';
import StringListInput from '@/modules/editor/components/StringListInput/StringListInput';

export default function ExperienceFields({
  d,
  set,
  present,
  setPresent,
}: {
  d: Experience;
  set: (patch: Partial<Experience>) => void;
  present: boolean;
  setPresent: (v: boolean) => void;
}) {
  const togglePresent = (v: boolean) => {
    setPresent(v);
    if (v) set({ endDate: null });
    else if (!d.endDate) set({ endDate: '' });
  };
  useEffect(() => {
    setPresent(!d.endDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [d.id]);
  return (
    <>
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-6">
          <Field label="Role"><input className={inputCls} value={d.role} onChange={(e) => set({ role: e.target.value })} /></Field>
        </div>
        <div className="col-span-6">
          <Field label="Company"><input className={inputCls} value={d.company} onChange={(e) => set({ company: e.target.value })} /></Field>
        </div>
      </div>
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-6">
          <Field label="Location"><input className={inputCls} value={d.location} onChange={(e) => set({ location: e.target.value })} /></Field>
        </div>
        <div className="col-span-6">
          <Field label="Employment type">
            <SelectInput
              value={d.employmentType}
              options={['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship']}
              onChange={(v) => set({ employmentType: v })}
            />
          </Field>
        </div>
      </div>
      <div className="grid grid-cols-12 gap-3 items-end">
        <div className="col-span-5">
          <Field label="Start date"><input type="date" className={inputCls} value={d.startDate} onChange={(e) => set({ startDate: e.target.value })} /></Field>
        </div>
        <div className="col-span-5">
          <Field label="End date">
            <input type="date" className={inputCls} disabled={present} value={d.endDate ?? ''} onChange={(e) => set({ endDate: e.target.value || null })} />
          </Field>
        </div>
        <div className="col-span-2 flex items-center justify-end pb-2">
          <label className="flex items-center gap-1.5 text-xs cursor-pointer" style={{ color: 'var(--text-mid)' }}>
            <input type="checkbox" checked={present} onChange={(e) => togglePresent(e.target.checked)} /> Current
          </label>
        </div>
      </div>
      <Field label="Highlights (one per line)">
        <StringListInput rows={3} value={d.highlights} onChange={(v) => set({ highlights: v })} placeholder="Achievement or responsibility" />
      </Field>
      <Field label="Tech stack">
        <StringListInput value={d.techStack} onChange={(v) => set({ techStack: v })} />
      </Field>
    </>
  );
}