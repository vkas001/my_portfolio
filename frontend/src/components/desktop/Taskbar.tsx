import { useEffect, useRef, useState } from 'react';
import { useOS } from '@/context/OSContext';
import { APP_REGISTRY } from '@/apps/registry';
import type { AppId } from '@/types';
import { LayoutGrid, Search, Sparkles, Wifi, Volume2, VolumeX, ChevronUp } from 'lucide-react';
import SystemTrayModal from './SystemTrayModal';

// Active indicators, ported from ibiz_v2 Taskbar (WindowsIndicator / MacIndicator).
function WindowsIndicator({ isOpen, isActive, isMinimized }: { isOpen: boolean; isActive: boolean; isMinimized: boolean }) {
  if (!isOpen) return null;
  return (
    <span
      className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-1 rounded-full transition-all"
      style={{
        width: isActive ? 20 : isMinimized ? 10 : 14,
        background: 'var(--accent)',
        opacity: isActive ? 1 : isMinimized ? 0.5 : 0.7,
      }}
    />
  );
}

function MacIndicator({ isOpen, isActive, isMinimized }: { isOpen: boolean; isActive: boolean; isMinimized: boolean }) {
  if (!isOpen) return null;
  return (
    <span
      className="absolute left-1/2 -translate-x-1/2 rounded-full transition-all"
      style={{
        bottom: 6,
        width: 6,
        height: 6,
        background: isMinimized && !isActive ? 'transparent' : 'var(--accent)',
        border: isMinimized && !isActive ? '1px solid var(--accent)' : 'none',
        transform: `translateX(-50%)${isActive ? ' scale(1.25)' : ''}`,
        opacity: isActive ? 1 : 0.6,
      }}
    />
  );
}

function useClock(clockFormat: '12h' | '24h', dateFormat: 'short' | 'long', showSeconds: boolean) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const time = now.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    ...(showSeconds ? { second: '2-digit' } : {}),
    hour12: clockFormat === '12h',
  });
  const date =
    dateFormat === 'long'
      ? now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
      : now.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  return { time, date };
}

export default function Taskbar() {
  const {
    theme,
    windows, focusedId, launchApp, focusWindow, minimizeWindow,
    startMenuOpen, setStartMenuOpen, setSpotlightOpen, widgetsOpen, setWidgetsOpen,
    taskbarVisible, setTaskbarVisible,
  } = useOS();

  // Pinned apps are the source of truth (ibiz_v2); unknown ids dropped, running appended.
  const pinned = (theme.taskbarApps ?? [])
    .map((id) => APP_REGISTRY.find((a) => a.id === id))
    .filter((a): a is (typeof APP_REGISTRY)[number] => Boolean(a))
    .map((a) => a.id as AppId);
  const runningIds = [...new Set(windows.filter((w) => !w.minimized || true).map((w) => w.appId))];
  const items: AppId[] = [...pinned, ...runningIds.filter((id) => !pinned.includes(id))];

  const windowsStyle = theme.taskbarStyle !== 'macos';
  const Indicator = windowsStyle ? WindowsIndicator : MacIndicator;
  const { time, date } = useClock(theme.clockFormat, theme.dateFormat, theme.showSeconds);

  const [trayOpen, setTrayOpen] = useState(false);
  const trayRef = useRef<HTMLDivElement>(null);

  // Auto-hide, ibiz_v2 parity: the bar hides fully; a bottom hover zone +
  // chevron affordance reveals it (works over maximized windows too, since
  // the zone sits above them). It stays put while the menu/tray are open.
  const autoHide = theme.taskbarMode === 'auto-hide';
  const hidden = autoHide && !taskbarVisible;

  const hideBar = () => {
    if (!startMenuOpen && !trayOpen) setTaskbarVisible(false);
  };

  useEffect(() => {
    if (!trayOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!trayRef.current?.contains(e.target as Node)) setTrayOpen(false);
    };
    window.addEventListener('mousedown', onDown);
    return () => window.removeEventListener('mousedown', onDown);
  }, [trayOpen]);

  const reveal = () => setTaskbarVisible(true);

  const handleAppClick = (appId: AppId) => {
    const wins = windows.filter((w) => w.appId === appId);
    const focused = wins.find((w) => w.id === focusedId && !w.minimized);
    if (wins.length === 0) {
      launchApp(appId);
    } else if (focused) {
      minimizeWindow(focused.id);
    } else {
      const target = wins.find((w) => !w.minimized) ?? wins[0];
      focusWindow(target.id);
    }
  };

  const appBtnBase = windowsStyle
    ? 'h-9 w-9 flex items-center justify-center rounded-lg relative group transition-all cursor-pointer'
    : 'h-12 w-12 flex items-center justify-center rounded-xl relative group transition-all cursor-pointer';
  const tooltipPos = windowsStyle ? 'bottom-12' : 'bottom-16';

  // ibiz_v2 parity: the bar is measured from the DOM ([data-os-taskbar])
  // for workspace insets. macOS floats centered with bottom padding (pb-5,
  // accounted for in osLayout); Windows is a full-width fixed bar.
  // Auto-hide fully translates the bar away and reveals via the bottom
  // hover zone + chevron below (both above maximized windows).
  return (
    <>
      {hidden && (
        <>
          <button
            type="button"
            aria-label="Show taskbar (Ctrl+T)"
            title="Show taskbar (Ctrl+T)"
            onClick={reveal}
            onMouseEnter={reveal}
            className="fixed bottom-0 left-1/2 -translate-x-1/2 z-[70] flex items-center justify-center px-3 py-0.5 rounded-t-lg cursor-pointer"
            style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)', borderBottom: 'none', color: 'var(--text-mid)' }}
          >
            <ChevronUp size={14} />
          </button>
          <div onMouseEnter={reveal} className="fixed bottom-0 inset-x-0 h-2.5 z-[69]" />
        </>
      )}
    <div
      className={
        windowsStyle
          ? ''
          : 'absolute inset-x-0 bottom-0 flex justify-center pointer-events-none z-[80] pb-5'
      }
    >
      <footer
        data-os-taskbar
        className={windowsStyle ? 'taskbar z-[80]' : 'z-[80] pointer-events-auto'}
        onMouseEnter={reveal}
        onMouseLeave={hideBar}
        style={
          windowsStyle
            ? {
                // --taskbar-h shrinks to 14px in auto-hide (reserved space for
                // the desktop area), so pin the bar's own height to full 56px —
                // otherwise the revealed bar renders as a clipped 14px strip.
                height: '56px',
                transform: hidden ? 'translateY(100%)' : 'translateY(0)',
                transition: 'transform .25s ease',
              }
            : {
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 16px',
                borderRadius: '20px',
                backdropFilter: 'blur(var(--glass-blur)) saturate(1.4)',
                WebkitBackdropFilter: 'blur(var(--glass-blur)) saturate(1.4)',
                background: theme.mode === 'light' ? 'rgba(255, 255, 255, .72)' : 'rgba(10, 10, 20, .62)',
                border: '1px solid var(--glass-border)',
                boxShadow: '0 18px 60px rgba(0,0,0,.45)',
                transform: hidden ? 'translateY(calc(100% + 20px))' : 'translateY(0)',
                transition: 'transform .25s ease',
              }
        }
      >
        <button
          className={`icon-btn ${windowsStyle ? 'w-9 h-9' : 'w-12 h-12 !rounded-xl'} ${startMenuOpen ? 'bg-white/10' : ''}`}
          onClick={() => setStartMenuOpen(!startMenuOpen)}
          aria-label="Start menu"
          title="Start"
        >
          <LayoutGrid size={windowsStyle ? 16 : 22} />
        </button>

        <button
          className={`icon-btn ${windowsStyle ? 'w-9 h-9' : 'w-12 h-12 !rounded-xl'}`}
          onClick={() => setSpotlightOpen(true)}
          aria-label="Search"
          title="Search (Ctrl+K)"
        >
          <Search size={windowsStyle ? 15 : 20} />
        </button>

        <div className="w-px h-6 mx-1" style={{ background: 'var(--border)' }} />

        {items.map((appId) => {
          const app = APP_REGISTRY.find((a) => a.id === appId);
          if (!app) return null;
          const wins = windows.filter((w) => w.appId === appId);
          const isOpen = wins.length > 0;
          const isMinimized = isOpen && wins.every((w) => w.minimized);
          const isActive = wins.some((w) => w.id === focusedId && !w.minimized);
          return (
            <button
              key={appId}
              className={`${appBtnBase} ${isActive ? 'bg-white/10' : ''}`}
              title={isOpen && isMinimized ? `Restore ${app.name}` : app.name}
              onClick={() => handleAppClick(appId)}
            >
              <span className="text-base leading-none">{app.icon}</span>
              <Indicator isOpen={isOpen} isActive={isActive} isMinimized={isMinimized} />
              <span
                className={`absolute ${tooltipPos} left-1/2 -translate-x-1/2 text-[12px] font-medium px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl`}
                style={{ background: '#191c1e', color: '#fff', border: '1px solid var(--border)' }}
              >
                {isOpen && isMinimized ? `Restore ${app.name}` : app.name}
              </span>
            </button>
          );
        })}

        <div className="flex-1" style={windowsStyle ? undefined : { minWidth: 8 }} />

        <button
          className={`icon-btn h-9 px-3 gap-1.5 text-xs ${widgetsOpen ? 'bg-white/10' : ''}`}
          onClick={() => setWidgetsOpen(!widgetsOpen)}
          title="Toggle widgets (Ctrl+W)"
        >
          <Sparkles size={13} /> Widgets
        </button>

        <div className="w-px h-6 mx-1" style={{ background: 'var(--border)' }} />

        {/* System tray — live clock + quick settings (ibiz_v2) */}
        <div className="relative" ref={trayRef}>
          <button
            onClick={() => setTrayOpen((o) => !o)}
            className={`flex items-center rounded-xl transition-colors cursor-pointer ${
              windowsStyle ? 'gap-2 px-2.5 py-1.5' : 'gap-3 px-3 py-1.5'
            } ${trayOpen ? 'bg-white/10' : 'hover:bg-white/5'}`}
            title={`${date} — Quick settings`}
          >
            <span className="flex items-center gap-1.5" style={{ color: 'var(--text-mid)' }}>
              <Wifi size={13} />
              {theme.soundsEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
            </span>
            <span className="flex flex-col items-end leading-none justify-center">
              <span className="text-[12px] font-bold tabular-nums" style={{ color: 'var(--text-hi)' }}>
                {time}
              </span>
              {!windowsStyle && (
                <span className="text-[10px] uppercase mt-0.5 font-semibold" style={{ color: 'var(--text-low)' }}>
                  {date}
                </span>
              )}
            </span>
          </button>
          {trayOpen && <SystemTrayModal onClose={() => setTrayOpen(false)} />}
        </div>
      </footer>
    </div>
    </>
  );
}
