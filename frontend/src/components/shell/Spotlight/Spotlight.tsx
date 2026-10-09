import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useShellUI } from '@/context/ShellUIContext';
import { useWindows } from '@/context/WindowsContext';
import { useWidgets } from '@/context/WidgetsContext';
import { APP_REGISTRY } from '@/apps/registry';
import { WIDGET_DEFS } from '@/modules/widgets';
import type { AppId } from '@/types';
import { Puzzle, Search } from 'lucide-react';
import { Z_OVERLAY_TOP } from '@/lib/osLayout';

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
    if (!spotlightOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSpotlightOpen(false);
      if (e.key === 'ArrowDown') { e.preventDefault(); setSel((s) => Math.min(s + 1, results.length - 1)); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSel((s) => Math.max(s - 1, 0)); }
      if (e.key === 'Enter' && results[sel]) {
        results[sel].run();
        setSpotlightOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [spotlightOpen, results, sel, setSpotlightOpen]);

  // Open above the taskbar Search button (same 8px float gap as the start
  // menu). Falls back to the centered top overlay where there is no button
  // (web view) or it can't be measured. Hooks stay above the early return.
  const [anchor, setAnchor] = useState<{ left: number; bottom: number } | null>(null);
  useEffect(() => {
    if (!spotlightOpen) return;
    const btn = document.querySelector('[data-os-taskbar] button[aria-label="Search"]');
    if (!btn) {
      setAnchor(null);
      return;
    }
    const r = btn.getBoundingClientRect();
    const w = Math.min(520, window.innerWidth - 24);
    const left = Math.min(Math.max(12, r.left), Math.max(12, window.innerWidth - w - 12));
    setAnchor({ left, bottom: window.innerHeight - r.top + 8 });
  }, [spotlightOpen]);

  if (!spotlightOpen) return null;

  return (
    <div
      className={`fixed inset-0 fade-in ${anchor ? '' : 'flex items-start justify-center pt-[18vh]'}`}
      style={{ background: 'rgba(0,0,0,.35)', zIndex: Z_OVERLAY_TOP }}
      onMouseDown={() => setSpotlightOpen(false)}
    >
      <div
        className={`menu-surface w-[520px] max-w-[92vw] p-0 overflow-hidden ${anchor ? '' : '!relative'}`}
        style={anchor ? { position: 'absolute', left: anchor.left, bottom: anchor.bottom } : undefined}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 h-12" style={{ borderBottom: '1px solid var(--border)' }}>
          <Search size={15} style={{ color: 'var(--text-low)' }} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSel(0); }}
            placeholder={isWeb ? 'Search sections…' : 'Search apps, widgets…'}
            className="flex-1 bg-transparent border-0 !p-0 text-sm focus:!shadow-none"
            style={{ minHeight: 0 }}
          />
          <kbd className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>esc</kbd>
        </div>
        <div className="p-1.5 max-h-72 overflow-auto">
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
    </div>
  );
}
