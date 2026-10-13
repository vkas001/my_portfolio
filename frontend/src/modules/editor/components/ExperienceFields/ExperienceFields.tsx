import { useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import type { Experience } from '@shared/types';
import Field from '@/modules/editor/components/Field/Field';
import Input from '@/components/ui/Input/Input';
import TextArea from '@/components/ui/TextArea/TextArea';
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
      <Field label="Highlights">
        <div className="space-y-1.5">
          {d.highlights.map((h, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="flex-1 min-w-0">
                <TextArea
                  rows={1}
                  maxRows={4}
                  autoGrow
                  placeholder="New highlight"
                  aria-label={`Highlight ${i + 1}`}
                  value={h}
                  onChange={(e) => set({ highlights: d.highlights.map((x, j) => (j === i ? e.target.value : x)) })}
                />
              </div>
              <button
                type="button"
                className="icon-btn w-6 h-6 shrink-0 mt-1"
                aria-label={`Remove highlight ${i + 1}`}
                style={{ color: 'var(--error)' }}
                onClick={() => set({ highlights: d.highlights.filter((_, j) => j !== i) })}
              >
                <X size={11} />
              </button>
            </div>
          ))}
          <button
            type="button"
            className="text-[11px] font-semibold flex items-center gap-1 cursor-pointer hover:opacity-80"
            style={{ color: 'var(--accent)' }}
            onClick={() => set({ highlights: [...d.highlights, ''] })}
          >
            <Plus size={11} /> Add highlight
          </button>
        </div>
      </Field>
      <Field label="Tech stack">
        <StringListInput value={d.techStack} onChange={(v) => set({ techStack: v })} />
      </Field>
    </>
  );
}