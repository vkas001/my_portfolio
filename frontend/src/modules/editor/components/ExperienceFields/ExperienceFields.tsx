import { useEffect } from 'react';
import type { Experience } from '@shared/types';
import Field from '@/modules/editor/components/Field/Field';
import Input from '@/components/ui/Input/Input';
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
          <Input label="Role" value={d.role} onChange={(e) => set({ role: e.target.value })} />
        </div>
        <div className="col-span-6">
          <Input label="Company" value={d.company} onChange={(e) => set({ company: e.target.value })} />
        </div>
      </div>
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-6">
          <Input label="Location" value={d.location} onChange={(e) => set({ location: e.target.value })} />
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
          <Input label="Start date" type="date" value={d.startDate} onChange={(e) => set({ startDate: e.target.value })} />
        </div>
        <div className="col-span-5">
          <Input label="End date" type="date" disabled={present} value={d.endDate ?? ''} onChange={(e) => set({ endDate: e.target.value || null })} />
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