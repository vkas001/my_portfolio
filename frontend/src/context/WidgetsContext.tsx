import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useTheme } from '@/context/ThemeContext';
import { fitWidgetRect, getWorkspaceBounds, nextWidgetSlot } from '@/lib/osLayout';
import type { WidgetMeta, WidgetPlacement, WidgetVariant } from '@/types';
import { sound } from '@/lib/sound';

interface WidgetsContextValue {
  widgetMeta: Record<string, WidgetMeta>;
  registerWidgets: (meta: WidgetMeta[]) => void;
  widgetPlacements: WidgetPlacement[];
  addWidget: (id: string) => void;
  removeWidget: (instance: string) => void;
  updateWidgetPlacement: (instance: string, patch: Partial<WidgetPlacement>) => void;
  moveWidgetVariant: (instance: string, variant: WidgetVariant) => void;
}

const WidgetsContext = createContext<WidgetsContextValue | null>(null);

export function useWidgets(): WidgetsContextValue {
  const ctx = useContext(WidgetsContext);
  if (!ctx) throw new Error('useWidgets must be used within WidgetsProvider');
  return ctx;
}

/** Widget metadata + live placements. Placements are NOT owned here: they live
 *  in `theme.widgets` (ThemeContext) as the single source of truth, so every
 *  mutation goes through `setTheme` and persists in the same row as the theme. */
export function WidgetsProvider({ children }: { children: ReactNode }) {
  const { theme, setTheme } = useTheme();
  const [widgetMetaMap, setWidgetMetaMap] = useState<Record<string, WidgetMeta>>({});
  const lastBoundsRef = useRef(getWorkspaceBounds());
  const themeRef = useRef(theme);
  themeRef.current = theme;
  const widgetPlacements = theme.widgets ?? [];

  const registerWidgets = useCallback((meta: WidgetMeta[]) => {
    setWidgetMetaMap((prev) => {
      const next = { ...prev };
      for (const m of meta) next[m.id] = m;
      return next;
    });
  }, []);

  const addWidget = useCallback(
    (id: string) => {
      const meta = widgetMetaMap[id];
      if (!meta) {
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.warn(`[os] addWidget: unknown widget "${id}" (metadata not registered yet)`);
        }
        return;
      }
      const variant = meta.defaultVariant;
      const size = meta.variants[variant] ?? { w: 300, h: 200 };
      const bounds = getWorkspaceBounds(themeRef.current);
      const instance = `${id}#${Date.now().toString(36)}${Math.floor(Math.random() * 1e4).toString(36)}`;
      // Spawn top-right, stacking down and wrapping left — fitted so new
      // widgets never spawn inside the header, cut off, or overlapping.
      const slot = nextWidgetSlot(themeRef.current.widgets ?? [], size, bounds);
      const fitted = fitWidgetRect({ ...slot, w: size.w, h: size.h }, bounds);
      setTheme((prev) => ({ widgets: [...prev.widgets, { id, instance, ...fitted, variant }] }));
      sound.click();
    },
    [widgetMetaMap, setTheme],
  );

  const removeWidget = useCallback(
    (instance: string) => {
      setTheme((prev) => ({ widgets: prev.widgets.filter((p) => p.instance !== instance) }));
      sound.close();
    },
    [setTheme],
  );

  const updateWidgetPlacement = useCallback(
    (instance: string, patch: Partial<WidgetPlacement>) => {
      // Safety net: placements can never leave the workspace (nor enter the header).
      setTheme((prev) => ({
        widgets: prev.widgets.map((p) =>
          p.instance === instance ? { ...p, ...fitWidgetRect({ ...p, ...patch }, lastBoundsRef.current) } : p,
        ),
      }));
    },
    [setTheme],
  );

  const moveWidgetVariant = useCallback(
    (instance: string, variant: WidgetVariant) => {
      setTheme((prev) => ({
        widgets: prev.widgets.map((p) => {
          if (p.instance !== instance) return p;
          const meta = widgetMetaMap[p.id];
          const size = meta?.variants[variant] ?? { w: p.w, h: p.h };
          // Variant growth is top-left anchored: clamp so it can't spill
          // under the taskbar (or inside the header on tiny viewports).
          const fitted = fitWidgetRect({ ...p, w: size.w, h: size.h }, lastBoundsRef.current);
          return { ...p, variant, w: fitted.w, h: fitted.h, x: fitted.x, y: fitted.y };
        }),
      }));
    },
    [widgetMetaMap, setTheme],
  );

  // Keep placements fully on-screen when the viewport shrinks or the bars
  // change (topbar toggle, taskbar mode/style).
  useEffect(() => {
    const reflow = () => {
      const b = getWorkspaceBounds(themeRef.current);
      lastBoundsRef.current = b;
      setTheme((prev) => ({ widgets: prev.widgets.map((p) => ({ ...p, ...fitWidgetRect(p, b) })) }));
    };
    reflow();
    const raf = requestAnimationFrame(reflow);
    const settled = window.setTimeout(reflow, 300);
    let t: number | undefined;
    const onResize = () => {
      window.clearTimeout(t);
      t = window.setTimeout(reflow, 150);
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      window.clearTimeout(t);
      window.clearTimeout(settled);
      cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme.showTopBar, theme.taskbarMode, theme.taskbarStyle]);

  const value = useMemo<WidgetsContextValue>(
    () => ({
      widgetMeta: widgetMetaMap,
      registerWidgets,
      widgetPlacements,
      addWidget,
      removeWidget,
      updateWidgetPlacement,
      moveWidgetVariant,
    }),
    [
      widgetMetaMap, registerWidgets, widgetPlacements,
      addWidget, removeWidget, updateWidgetPlacement, moveWidgetVariant,
    ],
  );

  return <WidgetsContext.Provider value={value}>{children}</WidgetsContext.Provider>;
}