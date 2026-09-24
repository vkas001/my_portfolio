import type { ReactNode } from 'react';

export const inputCls = 'w-full text-sm';
export const labelCls = 'text-[10px] font-bold uppercase tracking-wider mb-1 block';

export default function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="block">
      <span className={labelCls} style={{ color: 'var(--text-low)' }}>{label}</span>
      {children}
      {hint ? (
        <span className="block mt-1 text-[11px]" style={{ color: 'var(--text-low)' }}>{hint}</span>
      ) : null}
    </div>
  );
}