import { useMemo } from 'react';
import { useHobbies } from '@/modules/hobbies';
import { hobbyIcon } from '@/modules/hobbies';

export default function HobbiesScreen() {
  const hobbies = useHobbies();
  const items = useMemo(() => [...hobbies].sort((a, b) => a.order - b.order), [hobbies]);

  if (!items.length) {
    return <p className="text-xs" style={{ color: 'var(--text-low)' }}>No hobbies yet — add some in the editor.</p>;
  }

  return (
    <div className="grid grid-cols-12 gap-2">
      {items.map((h) => {
        const Icon = hobbyIcon(h.icon);
        return (
          <div key={h.id} className="col-span-12 p-3 rounded-[var(--radius)] border" style={{ background: 'var(--bg-elev)', borderColor: 'var(--border)' }}>
            <div className="flex items-start gap-2.5">
              <span
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
              >
                <Icon size={14} />
              </span>
              <div className="min-w-0">
                <h3 className="text-xs font-semibold truncate" style={{ color: 'var(--text-hi)' }}>{h.name}</h3>
                {h.description && (
                  <p className="mt-1 text-[11px] leading-relaxed" style={{ color: 'var(--text-mid)' }}>
                    {h.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}