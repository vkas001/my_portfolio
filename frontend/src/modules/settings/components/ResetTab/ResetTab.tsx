import { RotateCcw } from 'lucide-react';
import SectionCard from '@/components/ui/SectionCard/SectionCard';

export default function ResetTab({ resetTheme }: { resetTheme: () => void }) {
  return (
    <SectionCard title="Reset" icon={<RotateCcw size={13} />}>
      <p className="text-[12px] mb-3" style={{ color: 'var(--text-low)' }}>
        Restore all theme settings and widgets to their defaults. This cannot be undone.
      </p>
      <button
        className="px-4 py-2 rounded-[var(--radius-sm)] text-xs font-bold transition-all cursor-pointer"
        style={{ background: 'var(--error-soft)', color: 'var(--error)' }}
        onClick={resetTheme}
      >
        Reset theme & widgets to defaults
      </button>
    </SectionCard>
  );
}