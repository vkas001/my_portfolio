import { useEffect, useRef, useState } from 'react';
import { useOS } from '@/context/OSContext';
import { WIDGET_DEFS } from '@/components/widgets/registry';
import { Bell, BellOff, Eye, EyeOff, Plus, X } from 'lucide-react';

export default function TopBar() {
  const { notifications, dismissNotification, markNotificationsRead, theme, addWidget, widgetsOpen, setWidgetsOpen } = useOS();
  const [bellOpen, setBellOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const unread = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (!bellOpen && !pickerOpen) return;
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (bellOpen && !bellRef.current?.contains(target)) setBellOpen(false);
      if (pickerOpen && !pickerRef.current?.contains(target)) setPickerOpen(false);
    };
    window.addEventListener('mousedown', onDown);
    return () => window.removeEventListener('mousedown', onDown);
  }, [bellOpen, pickerOpen]);

  return (
    <header className="topbar z-40 relative">
      {/* Left — brand */}
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-xs font-semibold truncate" style={{ color: 'var(--accent)' }}>
          Hey! this is Vkas
        </span>
        <span className="text-xs shrink-0" style={{ color: 'var(--text-low)' }}>
          {theme.mode === 'dark' ? '🌙' : '☀️'} {theme.accent}
        </span>
      </div>

      {/* Center — kept clear; the clock lives in the taskbar tray */}
      <div className="flex-1" />

      {/* Right — widgets visibility, add widget, notifications */}
      <div className="flex items-center gap-1">
        <button
          className="icon-btn w-7 h-7"
          onClick={() => setWidgetsOpen(!widgetsOpen)}
          aria-label={widgetsOpen ? 'Hide widgets' : 'Show widgets'}
          title={widgetsOpen ? 'Hide widgets' : 'Show widgets'}
        >
          {widgetsOpen ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>

        <div className="relative" ref={pickerRef}>
          <button
            className="icon-btn w-7 h-7"
            onClick={() => { setPickerOpen((o) => !o); setBellOpen(false); }}
            aria-label="Add widget"
            title="Add widget"
          >
            <Plus size={14} />
          </button>
          {pickerOpen && (
            <div className="menu-surface right-0 top-9 w-56 p-2 fade-in absolute max-h-80 overflow-auto">
              <p className="text-[10px] uppercase tracking-wider px-2 py-1" style={{ color: 'var(--text-low)' }}>
                Add widget
              </p>
              {WIDGET_DEFS.map((m) => (
                <button
                  key={m.id}
                  className="w-full text-left px-2 py-1.5 rounded text-xs hover:bg-white/5 flex items-center gap-2 cursor-pointer"
                  onClick={() => { addWidget(m.id); setPickerOpen(false); }}
                >
                  <Plus size={12} style={{ color: 'var(--accent)' }} />
                  <span className="flex-1 truncate">{m.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative" ref={bellRef}>
          <button
            className="icon-btn w-7 h-7 relative"
            onClick={() => { setBellOpen((o) => !o); setPickerOpen(false); markNotificationsRead(); }}
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

          {bellOpen && (
            <div className="menu-surface right-0 top-9 w-72 p-2 fade-in absolute max-h-80 overflow-auto">
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
      </div>
    </header>
  );
}
