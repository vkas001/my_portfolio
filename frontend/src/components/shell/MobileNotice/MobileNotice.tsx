import { Globe, Monitor, Smartphone } from 'lucide-react';

interface MobileNoticeProps {
  /** Switch to the scrolling Web view (small-screen friendly). */
  onUseWeb?: () => void;
  /** Bypass the gate and render the desktop OS anyway. */
  onEnterOs?: () => void;
}

/** Shown on small screens where the desktop shell doesn't fit. Offers the
 *  scrolling Web site or force-entering the OS anyway (both persisted). */
export default function MobileNotice({ onUseWeb, onEnterOs }: MobileNoticeProps) {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-4 p-8 text-center" style={{ background: 'var(--wallpaper, var(--bg))' }}>
      <Smartphone size={40} style={{ color: 'var(--accent)' }} />
      <h1 className="text-xl font-bold"> Portfolio OS</h1>
      <p className="text-sm max-w-xs" style={{ color: 'var(--text-mid)' }}>
        {onUseWeb
          ? 'The desktop experience needs a larger screen. Continue on the web site, or enter the OS anyway.'
          : 'The desktop experience needs a larger screen. Enter the OS to continue.'}
      </p>
      <span className="chip">
        <Smartphone size={12} /> Best viewed ≥ 768px
      </span>

      {onUseWeb && (
        <button
          type="button"
          onClick={onUseWeb}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold cursor-pointer transition-all duration-150 active:scale-95"
          style={{ background: 'var(--accent)', color: 'var(--accent-text-on)' }}
        >
          <Globe size={16} /> Continue in Web view
        </button>
      )}

      {onEnterOs && (
        <button
          type="button"
          onClick={onEnterOs}
          className={
            onUseWeb
              ? 'flex items-center gap-2 text-xs font-semibold cursor-pointer transition-all duration-150 active:scale-95'
              : 'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold cursor-pointer transition-all duration-150 active:scale-95'
          }
          style={
            onUseWeb
              ? { color: 'var(--text-mid)' }
              : { background: 'var(--accent)', color: 'var(--accent-text-on)' }
          }
        >
          <Monitor size={14} /> {onUseWeb ? 'Go to OS anyway' : 'Continue in OS view'}
        </button>
      )}
    </div>
  );
}