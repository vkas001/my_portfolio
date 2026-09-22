// Taskbar — verbatim port of ibiz_v2 Taskbar (structure, classes, behavior).
// Adapted only where portfolio lacks the supporting infra: Lucide icon map
// for the 6 portfolio apps (no auth/workspace gating — every app is visible),
// clock without locale/BS calendar, no central-apps section. Auto-hide uses
// the same slide/reveal mechanics with portfolio's context visibility state.
import { memo, useEffect, useRef, useState } from 'react';
import {
  LayoutGrid,
  User,
  Sparkles,
  Folder,
  Briefcase,
  Mail,
  Settings,
  Search,
  Wifi,
  Volume2,
  VolumeX,
  Zap,
  ZapOff,
  ChevronUp,
} from 'lucide-react';
import { useOS } from '@/context/OSContext';
import { APP_REGISTRY } from '@/apps/registry';
import type { AppId } from '@/types';
import SystemTrayModal from './SystemTrayModal';

const OS_ICON_MAP: Record<string, React.ReactNode> = {
  about: <User className="w-6 h-6" />,
  skills: <Sparkles className="w-6 h-6" />,
  projects: <Folder className="w-6 h-6" />,
  experience: <Briefcase className="w-6 h-6" />,
  contact: <Mail className="w-6 h-6" />,
  settings: <Settings className="w-6 h-6" />,
};

// Windows 11-style active indicator: a small rounded underline under the icon.
const WindowsIndicator: React.FC<{ isOpen: boolean; isActive: boolean; isMinimized: boolean }> = ({
  isOpen,
  isActive,
  isMinimized
}) => {
  if (!isOpen) return null;
  return (
    <span
      className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 h-1 rounded-full transition-all duration-200 ${
        isActive
          ? 'w-5 bg-(--accent)'
          : isMinimized
          ? 'w-3 bg-(--accent)/50'
          : 'w-3.5 bg-(--accent)/70'
      }`}
    />
  );
};

// macOS-style indicator: a small status dot under the icon.
const MacIndicator: React.FC<{ isOpen: boolean; isActive: boolean; isMinimized: boolean }> = ({
  isOpen,
  isActive,
  isMinimized
}) => {
  if (!isOpen) return null;
  return (
    <div
      className={`w-1.5 h-1.5 rounded-full absolute bottom-1.5 left-1/2 -translate-x-1/2 transition-all ${
        isActive
          ? 'bg-(--accent) scale-125'
          : isMinimized
          ? 'border border-(--accent)/80'
          : 'bg-(--accent)/60'
      }`}
    />
  );
};

// ibiz_v2 ConnectionStatus parity: live dot with hover tooltip.
const ConnectionDot: React.FC<{ online: boolean }> = ({ online }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  return (
    <div
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {online ? (
        <Zap size={14} className="text-emerald-500" />
      ) : (
        <ZapOff size={14} className="text-amber-500" />
      )}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-(--surface-80) border border-(--border-60) rounded-lg text-[11px] text-(--text-primary) whitespace-nowrap shadow-lg z-[100]">
          {online ? 'Online' : 'Offline'}
        </div>
      )}
    </div>
  );
};

const Taskbar = memo(function Taskbar() {
  const {
    theme,
    windows, focusedId, launchApp, focusWindow, minimizeWindow,
    startMenuOpen, setStartMenuOpen, setSpotlightOpen, widgetsOpen, setWidgetsOpen,
    taskbarVisible, setTaskbarVisible,
  } = useOS();
  const windowsStyle = theme.taskbarStyle === 'windows';
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [currentWeekday, setCurrentWeekday] = useState<string>('');
  const [online, setOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine));

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const dateOptions: Intl.DateTimeFormatOptions =
        theme.dateFormat === 'long'
          ? { month: 'long', day: 'numeric', year: 'numeric' }
          : { month: 'short', day: 'numeric' };
      const timeOptions: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        hour12: theme.clockFormat === '12h',
        ...(theme.showSeconds ? { second: '2-digit' } : {})
      };
      setCurrentTime(now.toLocaleTimeString(undefined, timeOptions));
      setCurrentDate(now.toLocaleDateString(undefined, dateOptions));
      setCurrentWeekday(now.toLocaleDateString(undefined, { weekday: 'long' }));
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, [theme.clockFormat, theme.dateFormat, theme.showSeconds]);

  const handleAppClick = (appId: AppId) => {
    const wins = windows.filter((w) => w.appId === appId);
    if (wins.length === 0) {
      launchApp(appId);
      return;
    }
    const focused = wins.find((w) => w.id === focusedId && !w.minimized);
    if (focused) {
      minimizeWindow(focused.id);
    } else {
      focusWindow((wins.find((w) => !w.minimized) ?? wins[0]).id);
    }
  };

  // Render pinned apps in the persisted order (taskbarApps is the source of
  // truth; unknown ids are dropped so stale theme values can't crash or bloat).
  const pinnedOsApps = (theme.taskbarApps ?? [])
    .map((id) => APP_REGISTRY.find((app) => app.id === id))
    .filter((app): app is (typeof APP_REGISTRY)[number] => Boolean(app));
  const runningIds = windows.map((w) => w.appId).filter((id, i, all) => all.indexOf(id) === i);
  const unpinnedRunning = runningIds
    .filter((id) => !pinnedOsApps.some((a) => a.id === id))
    .map((id) => APP_REGISTRY.find((a) => a.id === id))
    .filter((app): app is (typeof APP_REGISTRY)[number] => Boolean(app));
  const allOsApps = [...pinnedOsApps, ...unpinnedRunning];

  // Auto-hide, ibiz_v2 parity: the bar hides fully; a bottom hover zone +
  // chevron affordance reveals it (above maximized windows). A fullscreen
  // tab forces auto-hide (ibiz hasFullScreenWindow) and hides the bar as
  // soon as fullscreen opens. Stays put while menu/tray are open.
  // NOTE: Escape deliberately does NOT exit fullscreen — ibiz_v2 parity —
  // leave only via the titlebar full-screen button.
  const hasFullScreenWindow = windows.some((w) => w.isFullScreen && !w.minimized);
  const autoHide = theme.taskbarMode === 'auto-hide' || hasFullScreenWindow;
  const hidden = autoHide && !taskbarVisible;
  const reveal = () => setTaskbarVisible(true);
  const hideBar = () => {
    if (!startMenuOpen && !isTrayOpen) setTaskbarVisible(false);
  };

  // Hide the bar as soon as a tab goes fullscreen (ibiz_v2 Desktop parity);
  // it stays revealed while the pointer is over the bar or bottom zone.
  useEffect(() => {
    if (hasFullScreenWindow) setTaskbarVisible(false);
  }, [hasFullScreenWindow, setTaskbarVisible]);

  const [isTrayOpen, setIsTrayOpen] = useState(false);
  const trayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isTrayOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!trayRef.current?.contains(e.target as Node)) setIsTrayOpen(false);
    };
    window.addEventListener('mousedown', onDown);
    return () => window.removeEventListener('mousedown', onDown);
  }, [isTrayOpen]);

  const onToggleTray = () => {
    setIsTrayOpen((prev) => !prev);
    setStartMenuOpen(false);
    setTaskbarVisible(true);
  };

  const onToggleStartMenu = () => {
    setStartMenuOpen(!startMenuOpen);
    setIsTrayOpen(false);
    setTaskbarVisible(true);
  };

  const Indicator = windowsStyle ? WindowsIndicator : MacIndicator;
  const appBtnBase = windowsStyle
    ? 'h-9 w-9 flex items-center justify-center rounded-lg relative group transition-all cursor-pointer'
    : 'h-12 w-12 flex items-center justify-center rounded-xl relative group transition-all cursor-pointer';
  const tooltipPos = windowsStyle ? 'bottom-12' : 'bottom-16';

  // While a fullscreen tab is open the revealed bar must float above it
  // (z-90), otherwise reveal would slide it invisibly underneath. Otherwise
  // the bar keeps its normal layer below fullscreen content.
  const floatAbove = hasFullScreenWindow && !hidden;
  const barLayer = floatAbove ? 'z-[100]' : 'z-[80]';
  // The reveal arrow must sit above the fullscreen tab to stay clickable.
  const revealLayer = hasFullScreenWindow ? 'z-[95]' : 'z-[85]';

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
            className={`fixed bottom-0 left-1/2 -translate-x-1/2 ${revealLayer} flex items-center justify-center px-3 py-0.5 rounded-t-lg cursor-pointer`}
            style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)', borderBottom: 'none', color: 'var(--text-mid)' }}
          >
            <ChevronUp size={14} />
          </button>
          <div onMouseEnter={reveal} className={`fixed bottom-0 inset-x-0 h-2.5 ${revealLayer}`} />
        </>
      )}
      <div
        className={
          windowsStyle
            ? ''
            : `absolute inset-x-0 bottom-0 flex justify-center pointer-events-none ${barLayer} pb-5`
        }
      >
        <footer
          data-os-taskbar
          onMouseEnter={reveal}
          onMouseLeave={hideBar}
          className={`relative flex items-center select-none ${
            windowsStyle
              ? `w-full h-12 bg-(--surface-50) backdrop-blur-xl border-t border-(--border-40) px-2 shadow-lg ${barLayer}`
              : `w-fit h-16 bg-(--surface-40) backdrop-blur-2xl border border-(--border-40) radius-glass px-4 shadow-2xl ${barLayer} pointer-events-auto`
          }`}
          style={{
            // Windows bar is edge-anchored (ibiz-v2 fixed-wrapper parity);
            // the legacy .taskbar class is intentionally not used here.
            ...(windowsStyle ? { position: 'absolute', bottom: 0, left: 0, right: 0, height: '48px' } : {}),
            transform: hidden
              ? windowsStyle
                ? 'translateY(100%)'
                : 'translateY(calc(100% + 20px))'
              : 'translateY(0)',
            transition: 'transform .25s ease',
          }}
        >
          {/* Start / App launcher button */}
          <button
            data-trigger="start"
            onClick={onToggleStartMenu}
            className={`flex items-center justify-center transition-all group cursor-pointer ${
              windowsStyle ? 'w-9 h-9 rounded-lg mr-1' : 'w-12 h-12 rounded-xl mr-2'
            } ${
              startMenuOpen
                ? 'bg-(--surface-60) scale-105 shadow-md'
                : 'hover:bg-(--surface-30)'
            }`}
            title="App Launcher & Start Menu"
          >
            <LayoutGrid
              className={`text-(--accent) transition-transform ${
                windowsStyle ? 'w-6 h-6' : 'w-7 h-7'
              } ${startMenuOpen ? 'scale-110' : 'group-hover:scale-110'}`}
            />
          </button>

          <button
            onClick={() => setSpotlightOpen(true)}
            className={`flex items-center justify-center transition-all group cursor-pointer ${
              windowsStyle ? 'w-9 h-9 rounded-lg' : 'w-12 h-12 rounded-xl'
            } hover:bg-(--surface-30)`}
            aria-label="Search"
            title="Search (Ctrl+K)"
          >
            <Search className={`text-(--accent) ${windowsStyle ? 'w-5 h-5' : 'w-6 h-6'}`} />
          </button>

          <div className={`w-[1px] bg-(--surface-30) ${windowsStyle ? 'h-5 mx-1.5' : 'h-8 mx-2'}`} />

          {/* Pinned + running apps */}
          {allOsApps.length > 0 && (
            <div className={`flex items-center ${windowsStyle ? 'gap-1 px-1' : 'gap-2 px-2'}`}>
              {allOsApps.map((app) => {
                const wins = windows.filter((w) => w.appId === app.id);
                const isOpen = wins.length > 0;
                const isMinimized = isOpen && wins.every((w) => w.minimized);
                const isActive = wins.some((w) => w.id === focusedId && !w.minimized);

                return (
                  <button
                    key={app.id}
                    onClick={() => handleAppClick(app.id as AppId)}
                    className={`${appBtnBase} ${
                      isActive
                        ? 'bg-(--surface-50) text-(--accent) shadow-sm'
                        : isOpen && !isMinimized
                        ? 'bg-(--surface-25) text-(--accent)'
                        : isOpen && isMinimized
                        ? 'bg-(--surface-10) text-(--accent)/60 hover:text-(--accent)'
                        : 'hover:bg-(--surface-20) text-(--accent)/70 hover:text-(--accent)'
                    }`}
                    title={isOpen && isMinimized ? `Restore ${app.name}` : app.name}
                  >
                    {OS_ICON_MAP[app.id] ?? <LayoutGrid className="w-5 h-5" />}

                    <Indicator isOpen={isOpen} isActive={isActive} isMinimized={isMinimized} />

                    {/* Tooltip */}
                    <span className={`absolute ${tooltipPos} left-1/2 -translate-x-1/2 bg-[#191c1e] text-white text-[12px] font-medium px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl border border-(--border-20)`}>
                      {isOpen && isMinimized ? `Restore ${app.name}` : app.name}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          <div className={`flex items-center gap-1.5 ${windowsStyle ? 'px-1' : 'px-2'}`}>
            <button
              onClick={() => setWidgetsOpen(!widgetsOpen)}
              className={`${windowsStyle ? 'h-9 w-9 rounded-lg' : 'h-12 w-12 rounded-xl'} flex items-center justify-center relative group transition-all cursor-pointer ${
                widgetsOpen ? 'bg-(--surface-50) text-(--accent)' : 'hover:bg-(--surface-20) text-(--accent)/70 hover:text-(--accent)'
              }`}
              title="Toggle widgets (Ctrl+W)"
            >
              <Sparkles className={windowsStyle ? 'w-5 h-5' : 'w-6 h-6'} />
            </button>
          </div>

          <div className={`w-[1px] bg-(--surface-30) ${windowsStyle ? 'h-5 mx-2 ml-auto' : 'h-8 mx-4'}`} />

          {/* System Tray Area */}
          <div className="flex items-center gap-3" ref={trayRef}>
            <ConnectionDot online={online} />
            <button
              data-trigger="tray"
              onClick={onToggleTray}
              className={`flex items-center text-(--accent)/90 rounded-xl hover:bg-(--surface-30) transition-colors cursor-pointer ${
                windowsStyle ? 'gap-2 px-2.5 py-1.5 rounded-lg' : 'gap-4 px-3 py-1.5'
              } ${isTrayOpen ? 'bg-(--surface-50) shadow-sm' : ''}`}
              title="System Tray & Quick Controls"
            >
              <div className={`flex items-center gap-2.5 ${windowsStyle ? 'gap-1.5' : ''}`}>
                <Wifi className="w-4 h-4" />
                {theme.soundsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </div>
              <div className="flex flex-col items-end leading-none justify-center">
                <span className="text-[12px] font-bold tracking-tight text-(--accent)">
                  {currentTime || '09:41 AM'}
                </span>
                <span className="text-[10px] opacity-70 font-bold uppercase mt-0.5 text-(--text-muted) whitespace-nowrap">
                  {currentWeekday ? `${currentWeekday} · ${currentDate}` : currentDate || 'SEP 22, 2026'}
                </span>
              </div>
            </button>
          </div>

          {isTrayOpen && <SystemTrayModal onClose={onToggleTray} />}
        </footer>
      </div>
    </>
  );
});

export default Taskbar;
