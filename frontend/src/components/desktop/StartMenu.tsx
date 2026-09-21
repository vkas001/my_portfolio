import { useEffect, useRef } from 'react';
import { useOS } from '@/context/OSContext';
import { APP_REGISTRY } from '@/apps/registry';
import { Moon, Sun, RotateCcw } from 'lucide-react';

export default function StartMenu() {
  const {
    startMenuOpen, setStartMenuOpen, launchApp, theme, setTheme, resetTheme,
  } = useOS();
  const ref = useRef<HTMLDivElement>(null);

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

  if (!startMenuOpen) return null;

  return (
    <div ref={ref} className="menu-surface left-3 bottom-16 z-50 w-72 p-3 slide-up">
      <p className="text-[10px] uppercase tracking-wider mb-2" style={{ color: 'var(--text-low)' }}>
        Applications
      </p>
      <div className="grid grid-cols-3 gap-2 mb-4">
        {APP_REGISTRY.map((app) => (
          <button
            key={app.id}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-white/5 transition-colors"
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
