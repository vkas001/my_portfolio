import type { Hobby } from '@shared/types';
import Field from '@/modules/editor/components/Field/Field';
import Input from '@/components/ui/Input/Input';
import SelectInput from '@/modules/editor/components/SelectInput/SelectInput';
import { hobbyIcon, HOBBY_ICONS, HOBBY_ICON_LABELS, type HobbyIcon } from '@/modules/hobbies';

export default function HobbiesFields({
  d,
  set,
}: {
  d: Hobby;
  set: (patch: Partial<Hobby>) => void;
}) {
  const Icon = hobbyIcon(d.icon);
  return (
    <>
      <div className="grid grid-cols-12 gap-3 items-end">
        <div className="col-span-7">
          <Input label="Name" value={d.name} placeholder="Trekking, Photography…" onChange={(e) => set({ name: e.target.value })} />
        </div>
        <div className="col-span-5">
          <Field label="Icon">
            <SelectInput
              value={d.icon as HobbyIcon}
              options={[...HOBBY_ICONS]}
              labels={HOBBY_ICON_LABELS}
              onChange={(icon) => set({ icon })}
            />
          </Field>
        </div>
      </div>
      <div className="flex items-center gap-2 rounded-lg px-2.5 py-2 w-fit" style={{ background: 'var(--accent-soft)' }}>
        <span style={{ color: 'var(--accent)' }}><Icon size={14} /></span>
        <span className="text-[10px]" style={{ color: 'var(--text-mid)' }}>Preview: {d.name.trim() || 'hobby name'}</span>
      </div>
      <Field label="Description">
        <textarea
          rows={2}
          className="w-full text-sm"
          value={d.description ?? ''}
          placeholder="Why you enjoy it, what it looks like…"
          onChange={(e) => set({ description: e.target.value })}
        />
      </Field>
    </>
  );
}