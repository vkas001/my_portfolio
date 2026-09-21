import { useOS } from '@/context/OSContext';
import { Monitor, Smartphone } from 'lucide-react';

/** Shown on small screens where the desktop shell doesn't fit. */
export default function MobileNotice() {
  const { theme } = useOS();
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-4 p-8 text-center" style={{ background: 'var(--wallpaper, var(--bg))' }}>
      <Smartphone size={40} style={{ color: 'var(--accent)' }} />
      <h1 className="text-xl font-bold">{theme.mode === 'dark' ? '🌙' : '☀️'} Portfolio OS</h1>
      <p className="text-sm max-w-xs" style={{ color: 'var(--text-mid)' }}>
        The desktop experience needs a larger screen. Please visit on a tablet or desktop browser.
      </p>
      <span className="chip">
        <Monitor size={12} /> Best viewed ≥ 768px
      </span>
    </div>
  );
}
