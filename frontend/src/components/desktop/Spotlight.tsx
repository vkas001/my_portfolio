import { useEffect, useMemo, useRef, useState } from 'react';
import { useOS } from '@/context/OSContext';
import { APP_REGISTRY } from '@/apps/registry';
import { WIDGET_DEFS } from '@/components/widgets/registry';
import type { AppId } from '@/types';
import { Search } from 'lucide-react';

interface Result {
  kind: 'app' | 'widget';
  id: string;
  name: string;
  sub: string;
  icon: string;
  run: () => void;
}

export default function Spotlight() {
  const {
    spotlightOpen, setSpotlightOpen, launchApp, addWidget,
  } = useOS();
  const [query, setQuery] = useState('');
  const [sel, setSel] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo<Result[]>(() => {
    const q = query.trim().toLowerCase();
    const apps: Result[] = APP_REGISTRY.map((a) => ({
      kind: 'app',
      id: a.id,
      name: a.name,
      sub: a.description ?? 'Application',
      icon: a.icon,
      run: () => launchApp(a.id as AppId),
    }));
    const widgets: Result[] = WIDGET_DEFS.map((w) => ({
      kind: 'widget',
      id: w.id,
      name: w.name,
      sub: `Widget — ${w.description}`,
      icon: '🧩',
      run: () => addWidget(w.id),
    }));
    const all = [...apps, ...widgets];
    if (!q) return all.slice(0, 6);
    return all.filter((r) => r.name.toLowerCase().includes(q) || r.sub.toLowerCase().includes(q)).slice(0, 8);
  }, [query, launchApp, addWidget]);

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

  if (!spotlightOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[18vh] fade-in"
      style={{ background: 'rgba(0,0,0,.35)' }}
      onMouseDown={() => setSpotlightOpen(false)}
    >
      <div
        className="menu-surface !relative w-[520px] max-w-[92vw] p-0 overflow-hidden"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 h-12" style={{ borderBottom: '1px solid var(--border)' }}>
          <Search size={15} style={{ color: 'var(--text-low)' }} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSel(0); }}
            placeholder="Search apps, widgets…"
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
