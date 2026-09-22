import { useEffect, useMemo, useRef, useState } from 'react';
import { useOS } from '@/context/OSContext';
import { APP_REGISTRY } from '@/apps/registry';
import { Moon, Sun, RotateCcw, Search, Settings, Undo2, X } from 'lucide-react';

export default function StartMenu() {
  const {
    startMenuOpen, setStartMenuOpen, launchApp, closeAllWindows, theme, setTheme, resetTheme,
    windows,
  } = useOS();
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!startMenuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setStartMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setStartMenuOpen(false);
    window.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [startMenuOpen, setStartMenuOpen]);

  useEffect(() => {
    if (startMenuOpen) {
      setSearchTerm('');
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [startMenuOpen]);

  const apps = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return APP_REGISTRY;
    return APP_REGISTRY.filter(
      (a) => a.name.toLowerCase().includes(q) || (a.description ?? '').toLowerCase().includes(q),
    );
  }, [searchTerm]);

  if (!startMenuOpen) return null;

  const openSettings = () => {
    launchApp('settings');
    setStartMenuOpen(false);
  };

  // ibiz_v2 parity: the launcher sits above the bar in its own style —
  // bottom-left over a Windows bar, centered over the macOS dock.
  const macos = theme.taskbarStyle === 'macos';

  // Above the fullscreen tab when one is open (matches the floating bar).
  const menuLayer = windows.some((w) => w.isFullScreen && !w.minimized) ? 'z-[100]' : 'z-[80]';

  return (
    <div
      ref={ref}
      className={`menu-surface ${menuLayer} w-80 max-w-[calc(100vw-24px)] p-3 ${
        // slide-up animates transform, which would fight -translate-x-1/2
        macos ? 'left-1/2 -translate-x-1/2 bottom-24 fade-in' : 'left-3 bottom-16 slide-up'
      }`}
    >
      {/* Search — ibiz_v2 StartMenu parity */}
      <div className="relative mb-2">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-low)' }} />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search applications..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-xl py-2 pl-9 pr-8 text-[13px]"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            aria-label="Clear search"
            className="icon-btn w-6 h-6 absolute right-1.5 top-1/2 -translate-y-1/2"
          >
            <X size={12} />
          </button>
        )}
      </div>

      <p className="text-[10px] uppercase tracking-wider mb-2" style={{ color: 'var(--text-low)' }}>
        Applications {searchTerm ? `· ${apps.length} result${apps.length === 1 ? '' : 's'}` : ''}
      </p>
      {apps.length === 0 ? (
        <p className="text-xs text-center py-4" style={{ color: 'var(--text-low)' }}>
          No applications match “{searchTerm}”
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-2 mb-3 max-h-64 overflow-auto">
          {apps.map((app) => (
            <button
              key={app.id}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
              onClick={() => { launchApp(app.id); setStartMenuOpen(false); }}
            >
              <span
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                style={{ background: `${app.color}22`, border: `1px solid ${app.color}44` }}
              >
                {app.icon}
              </span>
              <span className="text-[11px] text-center leading-tight">{app.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* System rows — ibiz_v2 OS Settings / Restore Layout parity */}
      <div className="pt-2 mb-3 flex flex-col gap-1" style={{ borderTop: '1px solid var(--border)' }}>
        <button
          onClick={openSettings}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[12.5px] font-medium transition-colors cursor-pointer hover:bg-white/5"
          style={{ color: 'var(--text-mid)' }}
        >
          <Settings size={14} className="shrink-0" style={{ color: 'var(--accent)' }} />
          <span className="truncate">OS Settings</span>
        </button>
        <button
          onClick={() => { closeAllWindows(); setStartMenuOpen(false); }}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[12.5px] font-medium transition-colors cursor-pointer hover:bg-white/5"
          style={{ color: 'var(--text-mid)' }}
        >
          <Undo2 size={14} className="shrink-0" style={{ color: 'var(--accent)' }} />
          <span className="truncate">Restore Layout</span>
        </button>
      </div>

      <p className="text-[10px] uppercase tracking-wider mb-2" style={{ color: 'var(--text-low)' }}>
        Quick settings
      </p>
      <div className="flex gap-2">
        <button
          className="btn-ghost text-xs flex-1 justify-center"
          onClick={() => setTheme({ mode: theme.mode === 'dark' ? 'light' : 'dark' })}
        >
          {theme.mode === 'dark' ? <Sun size={13} /> : <Moon size={13} />}
          {theme.mode === 'dark' ? 'Light' : 'Dark'}
        </button>
        <button className="btn-ghost text-xs justify-center" title="Reset theme" onClick={resetTheme}>
          <RotateCcw size={13} />
        </button>
      </div>
    </div>
  );
}
