import { Keyboard } from 'lucide-react';
import { SHORTCUTS } from '@/lib/shortcuts';
import SectionCard from '@/components/ui/SectionCard/SectionCard';

export default function ShortcutsTab() {
  return (
    <SectionCard title="Keyboard shortcuts" icon={<Keyboard size={13} />}>
      <div className="grid grid-cols-12 gap-x-6 gap-y-1.5">
        {SHORTCUTS.map((s) => (
          <div key={s.id} className="col-span-12 @md:col-span-6 flex items-center justify-between text-xs">
            <span style={{ color: 'var(--text-mid)' }}>{s.label}</span>
            <kbd
              className="text-[10px] px-1.5 py-0.5 rounded"
              style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
            >
              {s.keys}
            </kbd>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}