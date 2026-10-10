import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useShellUI } from '@/context/ShellUIContext';
import { useWindows } from '@/context/WindowsContext';
import { useWidgets } from '@/context/WidgetsContext';
import { APP_REGISTRY } from '@/apps/registry';
import { WIDGET_DEFS } from '@/modules/widgets';
import type { AppId } from '@/types';
import { Puzzle, Search } from 'lucide-react';
import { Z_WINDOW_TOP } from '@/lib/osLayout';

interface Result {
  kind: 'app' | 'widget';
  id: string;
  name: string;
  sub: string;
  icon: ReactNode;
  run: () => void;
}

export default function Spotlight() {
  const { spotlightOpen, setSpotlightOpen, viewMode } = useShellUI();
  const { launchApp } = useWindows();
  const { addWidget } = useWidgets();
  const [query, setQuery] = useState('');
  const [sel, setSel] = useState(0);
  const [position, setPosition] = useState<{ left: number; bottom: number } | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // In Web view there are no windows/widgets: app results scroll to the
  // matching section, settings + widget results are hidden.
  const isWeb = viewMode === 'web';

  const results = useMemo<Result[]>(() => {
    const q = query.trim().toLowerCase();
    const apps: Result[] = APP_REGISTRY
      .filter((a) => !isWeb || a.id !== 'settings')
      .map((a) => ({
        kind: 'app',
        id: a.id,
        name: a.name,
        sub: a.description ?? 'Application',
        icon: (
          <span className="inline-flex" style={{ color: a.color }}>
            <a.icon size={16} />
          </span>
        ),
        run: () => {
          if (isWeb) {
            document.getElementById(`section-${a.id}`)?.scrollIntoView({ behavior: 'smooth' });
          } else {
            launchApp(a.id as AppId);
          }
        },
      }));
    const widgets: Result[] = isWeb ? [] : WIDGET_DEFS.map((w) => ({
      kind: 'widget',
      id: w.id,
      name: w.name,
      sub: `Widget — ${w.description}`,
      icon: <Puzzle size={16} />,
      run: () => addWidget(w.id),
    }));
    const all = [...apps, ...widgets];
    if (!q) return all.slice(0, 6);
    return all.filter((r) => r.name.toLowerCase().includes(q) || r.sub.toLowerCase().includes(q)).slice(0, 8);
  }, [query, launchApp, addWidget, isWeb]);

  useEffect(() => {
    if (spotlightOpen) {
      setQuery('');
      setSel(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [spotlightOpen]);

  useEffect(() => {
    if (!spotlightOpen) {
      setPosition(null);
      return;
    }

    const updatePosition = () => {
      // Open from the same left edge as the Start menu: both flyouts anchor to
      // the launcher button so they share a starting point (not the search
      // button, which sits one slot to the right).
      const trigger =
        document.querySelector<HTMLElement>('[data-trigger="start"]') ??
        document.querySelector<HTMLElement>('[data-trigger="search"]');
      if (!trigger) return;
      const rect = trigger.getBoundingClientRect();
      const width = Math.min(320, window.innerWidth - 24);
      setPosition({
        left: Math.min(Math.max(12, rect.left), window.innerWidth - width - 12),
        bottom: Math.max(12, window.innerHeight - rect.top + 8),
      });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, [spotlightOpen]);

  useEffect(() => {
    if (!spotlightOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setSpotlightOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSpotlightOpen(false);
      if (e.key === 'ArrowDown') { e.preventDefault(); setSel((s) => Math.min(s + 1, results.length - 1)); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSel((s) => Math.max(s - 1, 0)); }
      if (e.key === 'Enter' && results[sel]) {
        results[sel].run();
        setSpotlightOpen(false);
      }
    };
    window.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [spotlightOpen, results, sel, setSpotlightOpen]);

  if (!spotlightOpen) return null;

  return (
    <div
      ref={ref}
      className="menu-surface !fixed w-80 max-w-[calc(100vw-24px)] p-3 slide-up"
      style={{
        zIndex: Z_WINDOW_TOP,
        left: position?.left ?? 12,
        bottom: position?.bottom ?? 68,
      }}
    >
      <div className="relative mb-2">
        <Search
          size={14}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
          style={{ color: 'var(--text-low)' }}
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setSel(0); }}
          placeholder={isWeb ? 'Search sections...' : 'Search apps, widgets...'}
          className="w-full rounded-xl py-2 pl-9 pr-8 text-[13px]"
          style={{ paddingLeft: '36px', paddingRight: '32px' }}
        />
      </div>
      <div className="max-h-72 overflow-auto">
          {results.map((r, i) => (
            <button
              key={`${r.kind}-${r.id}`}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${i === sel ? 'bg-white/10' : 'hover:bg-white/5'}`}
              onMouseEnter={() => setSel(i)}
              onClick={() => { r.run(); setSpotlightOpen(false); }}
            >
              <span className="text-base w-6 text-center">{r.icon}</span>
              <span className="flex-1 min-w-0">
                <span className="block text-xs font-medium truncate">{r.name}</span>
                <span className="block text-[10px] truncate" style={{ color: 'var(--text-mid)' }}>{r.sub}</span>
              </span>
              <span className="text-[9px] uppercase tracking-wide" style={{ color: 'var(--text-low)' }}>{r.kind}</span>
            </button>
          ))}
          {!results.length && (
            <p className="text-xs text-center py-6" style={{ color: 'var(--text-low)' }}>No results</p>
          )}
      </div>
    </div>
  );
}
