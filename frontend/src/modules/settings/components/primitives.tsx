// Settings primitives ported from the ibiz_v2 reference SettingsWindow.
// Styled with the portfolio OS token set (--accent, --text-hi, --border, …).
// SectionCard lives in components/ui/SectionCard (shared across modules).

import React from 'react';

// ─── SubLabel ───────────────────────────────────────────────────────────────
export const SubLabel: React.FC<{ icon?: React.ReactNode; children: React.ReactNode }> = React.memo(
  ({ icon, children }) => (
    <div className="text-[11px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{ color: 'var(--text-mid)' }}>
      {icon}
      <span>{children}</span>
    </div>
  ),
);
SubLabel.displayName = 'SubLabel';

// ─── SegmentedControl ───────────────────────────────────────────────────────
export function SegmentedControl<T extends string | number>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: React.ReactNode }[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={String(opt.value)}
          aria-pressed={value === opt.value}
          onClick={() => onChange(opt.value)}
          className="flex-1 min-w-0 px-2 py-2 rounded-[var(--radius-sm)] text-[12px] font-bold transition-all duration-150 cursor-pointer active:scale-[0.98]"
          style={
            value === opt.value
              ? { background: 'var(--accent)', color: 'var(--accent-text-on)' }
              : { background: 'var(--accent-soft)', color: 'var(--text-mid)' }
          }
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ─── SettingRow ─────────────────────────────────────────────────────────────
export const SettingRow: React.FC<{
  label: string;
  description?: string;
  children: React.ReactNode;
}> = React.memo(({ label, description, children }) => (
  <div className="flex items-center justify-between gap-3 py-2.5">
    <div className="min-w-0">
      <div className="text-[13px] font-bold" style={{ color: 'var(--text-hi)' }}>{label}</div>
      {description && (
        <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-low)' }}>{description}</div>
      )}
    </div>
    <div className="shrink-0">{children}</div>
  </div>
));
SettingRow.displayName = 'SettingRow';

// ─── Toggle ─────────────────────────────────────────────────────────────────
export const Toggle: React.FC<{ enabled: boolean; onChange: (value: boolean) => void }> = React.memo(
  ({ enabled, onChange }) => (
    <button
      aria-pressed={enabled}
      onClick={() => onChange(!enabled)}
      className="min-w-[56px] px-3 py-1.5 rounded-full text-[11px] font-bold transition-all duration-150 cursor-pointer active:scale-95"
      style={
        enabled
          ? { background: 'var(--accent)', color: 'var(--accent-text-on)' }
          : { background: 'var(--accent-soft)', color: 'var(--text-mid)' }
      }
    >
      {enabled ? 'On' : 'Off'}
    </button>
  ),
);
Toggle.displayName = 'Toggle';

// ─── RangeControl ───────────────────────────────────────────────────────────
export const RangeControl: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (value: number) => void;
}> = React.memo(({ label, value, min, max, step, display, onChange }) => {
  const pct = max > min ? ((value - min) / (max - min)) * 100 : 0;
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <div className="min-w-0">
        <div className="text-[13px] font-bold" style={{ color: 'var(--text-hi)' }}>{label}</div>
      </div>
      <div className="shrink-0 flex items-center gap-3">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-28 accent-[var(--accent)] cursor-pointer"
          style={{ accentColor: 'var(--accent)' }}
        />
        <span className="text-[12px] font-bold w-12 text-right tabular-nums" style={{ color: 'var(--text-mid)' }}>
          {display}
        </span>
      </div>
      <span className="hidden" data-progress={pct} />
    </div>
  );
});
RangeControl.displayName = 'RangeControl';
