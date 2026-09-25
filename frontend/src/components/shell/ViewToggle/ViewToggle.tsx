import { Globe, Monitor } from 'lucide-react';
import { useShellUI, type ViewMode } from '@/context/ShellUIContext';

const OPTIONS: { value: ViewMode; label: string; icon: typeof Globe }[] = [
  { value: 'web', label: 'Web', icon: Globe },
  { value: 'os', label: 'OS', icon: Monitor },
];

/** 2-position shell switch: Web (left) ⇄ OS (right). Default: OS. */
export default function ViewToggle() {
  const { viewMode, setViewMode } = useShellUI();
  return (
    <div
      role="group"
      aria-label="View mode"
      className="flex items-center gap-0.5 p-0.5 rounded-full border"
      style={{ background: 'var(--accent-soft)', borderColor: 'var(--border)' }}
    >
      {OPTIONS.map(({ value, label, icon: Icon }) => {
        const active = viewMode === value;
        return (
          <button
            key={value}
            aria-pressed={active}
            onClick={() => setViewMode(value)}
            title={active ? `${label} view (active)` : `Switch to ${label} view`}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all duration-150 cursor-pointer active:scale-95"
            style={
              active
                ? { background: 'var(--accent)', color: 'var(--accent-text-on)' }
                : { background: 'transparent', color: 'var(--text-mid)' }
            }
          >
            <Icon size={12} />
            {label}
          </button>
        );
      })}
    </div>
  );
}
