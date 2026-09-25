import { useEffect } from 'react';
import type { Education } from '@shared/types';
import Field from '@/modules/editor/components/Field/Field';
import Input from '@/components/ui/Input/Input';

export default function EducationFields({
  d,
  set,
  present,
  setPresent,
}: {
  d: Education;
  set: (patch: Partial<Education>) => void;
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
          <Input label="Institution" value={d.institution} onChange={(e) => set({ institution: e.target.value })} />
        </div>
        <div className="col-span-6">
          <Input label="Degree" value={d.degree} onChange={(e) => set({ degree: e.target.value })} />
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
      <Field label="Description">
        <textarea
          rows={3}
          className="w-full text-sm"
          value={d.description ?? ''}
          placeholder="Scope of study, thesis, notable coursework…"
          onChange={(e) => set({ description: e.target.value })}
        />
      </Field>
    </>
  );
}