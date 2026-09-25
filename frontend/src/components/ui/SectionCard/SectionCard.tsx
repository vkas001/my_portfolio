import React from 'react';

export default React.memo(({ title, icon, className, children }: {
  title: string;
  icon?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) => (
  <div
    className={`p-4 rounded-[var(--radius)] border ${className || ''}`}
    style={{
      background: 'var(--bg-elev)',
      borderColor: 'var(--border)',
    }}
  >
    <div className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 mb-2.5" style={{ color: 'var(--text-low)' }}>
      {icon}
      <span>{title}</span>
    </div>
    {children}
  </div>
));