import { Keyboard } from 'lucide-react';
import { SHORTCUTS } from '@/lib/shortcuts';
import SectionCard from '@/components/ui/SectionCard/SectionCard';

export default function ShortcutsTab() {
  return (
    <SectionCard title="Keyboard shortcuts" icon={<Keyboard size={13} />}>
      <div className="grid grid-cols-12 gap-x-6 gap-y-1.5">
        {SHORTCUTS.map((s) => (
          // 2-up only in wide windows: the breakpoint keys off the window
          // frame, but the content column is ~200px narrower (sidebar), so
          // @md would squeeze two columns into ~350px (kbd overlapping the
          // label at the default small window size).
          <div key={s.id} className="col-span-12 @2xl:col-span-6 flex items-center justify-between gap-3 text-xs">
            <span className="min-w-0" style={{ color: 'var(--text-mid)' }}>{s.label}</span>
            <kbd
              className="text-[10px] px-1.5 py-0.5 rounded shrink-0"
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