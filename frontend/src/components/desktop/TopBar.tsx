import { useEffect, useRef, useState } from 'react';
import { useOS } from '@/context/OSContext';
import { Bell, BellOff, X } from 'lucide-react';

export default function TopBar() {
  const { notifications, dismissNotification, markNotificationsRead, theme } = useOS();
  const [now, setNow] = useState(new Date());
  const [open, setOpen] = useState(false);
  const popRef = useRef<HTMLDivElement>(null);
  const unread = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 10_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!popRef.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('mousedown', onDown);
    return () => window.removeEventListener('mousedown', onDown);
  }, [open]);

  return (
    <header className="topbar z-50">
      <span className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>
        Portfolio OS
      </span>
      <span className="text-xs" style={{ color: 'var(--text-low)' }}>
        {theme.mode === 'dark' ? '🌙' : '☀️'} {theme.accent}
      </span>

      <div className="flex-1" />

      <div className="relative" ref={popRef}>
        <button
          className="icon-btn w-7 h-7 relative"
          onClick={() => { setOpen((o) => !o); markNotificationsRead(); }}
          aria-label="Notifications"
        >
          {unread ? <Bell size={14} /> : <BellOff size={14} />}
          {unread > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full text-[8px] flex items-center justify-center font-bold"
              style={{ background: 'var(--accent)', color: 'var(--accent-text-on)' }}
            >
              {unread}
            </span>
          )}
        </button>

        {open && (
          <div className="menu-surface right-0 top-9 w-72 p-2 fade-in max-h-80 overflow-auto">
            {notifications.length === 0 && (
              <p className="text-xs text-center py-4" style={{ color: 'var(--text-low)' }}>No notifications</p>
            )}
            {notifications.map((n) => (
              <div key={n.id} className="flex items-start gap-2 px-2 py-1.5 rounded hover:bg-white/5">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{n.title}</p>
                  <p className="text-[11px] line-clamp-2" style={{ color: 'var(--text-mid)' }}>{n.body}</p>
                </div>
                <button className="icon-btn w-5 h-5" onClick={() => dismissNotification(n.id)}>
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <span className="text-xs tabular-nums" style={{ color: 'var(--text-mid)' }}>
        {now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}{' '}
        {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </span>
    </header>
  );
}
