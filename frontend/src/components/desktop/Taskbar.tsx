import { useOS } from '@/context/OSContext';
import { APP_REGISTRY } from '@/apps/registry';
import type { AppId } from '@/types';
import { LayoutGrid, Search, Sparkles } from 'lucide-react';

const PINNED: AppId[] = ['about', 'skills', 'projects', 'experience', 'contact', 'settings'];

export default function Taskbar() {
  const {
    windows, focusedId, launchApp, focusWindow, minimizeWindow,
    startMenuOpen, setStartMenuOpen, setSpotlightOpen, widgetsOpen, setWidgetsOpen,
  } = useOS();

  const runningIds = [...new Set(windows.map((w) => w.appId))];
  const items: AppId[] = [...PINNED, ...runningIds.filter((id) => !PINNED.includes(id))];

  return (
    <footer className="taskbar z-50">
      <button
        className={`icon-btn w-9 h-9 ${startMenuOpen ? 'bg-white/10' : ''}`}
        onClick={() => setStartMenuOpen(!startMenuOpen)}
        aria-label="Start menu"
        title="Start"
      >
        <LayoutGrid size={16} />
      </button>

      <button className="icon-btn w-9 h-9" onClick={() => setSpotlightOpen(true)} aria-label="Search" title="Search (Ctrl+K)">
        <Search size={15} />
      </button>

      <div className="w-px h-6 mx-1" style={{ background: 'var(--border)' }} />

      {items.map((appId) => {
        const app = APP_REGISTRY.find((a) => a.id === appId);
        if (!app) return null;
        const wins = windows.filter((w) => w.appId === appId);
        const isFocused = wins.some((w) => w.id === focusedId && !w.minimized);
        return (
          <button
            key={appId}
            className="icon-btn w-9 h-9 relative"
            title={app.name}
            onClick={() => {
              const w = wins[0];
              if (!w) launchApp(appId);
              else if (isFocused) minimizeWindow(w.id);
              else focusWindow(w.id);
            }}
          >
            <span className="text-base leading-none">{app.icon}</span>
            {wins.length > 0 && (
              <span
                className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-0.5 rounded-full transition-all"
                style={{ width: isFocused ? 16 : 8, background: 'var(--accent)' }}
              />
            )}
          </button>
        );
      })}

      <div className="flex-1" />

      <button
        className={`icon-btn h-9 px-3 gap-1.5 text-xs ${widgetsOpen ? 'bg-white/10' : ''}`}
        onClick={() => setWidgetsOpen(!widgetsOpen)}
        title="Toggle widgets (Ctrl+W)"
      >
        <Sparkles size={13} /> Widgets
      </button>
    </footer>
  );
}
