import type { ReactNode } from 'react';

export const inputCls = 'w-full text-sm';
export const labelCls = 'text-[10px] font-bold uppercase tracking-wider mb-1 block';

export default function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className={labelCls} style={{ color: 'var(--text-low)' }}>{label}</span>
      {children}
    </label>
  );
}