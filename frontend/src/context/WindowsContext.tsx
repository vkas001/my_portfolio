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
import { fitRectInBounds, getWorkspaceBounds } from '@/lib/osLayout';
import type { AppDef, AppId, WindowData, WindowState } from '@/types';
import { sound } from '@/lib/sound';
import { APP_REGISTRY } from '@/apps/registry';

/** Extra launch input: a spawn rectangle (already in workspace coords) and
 *  arbitrary per-window data the app module may read (editor section…). */
export interface LaunchOptions {
  rect?: { x: number; y: number; w: number; h: number };
  data?: WindowData;
}

interface WindowsContextValue {
  windows: WindowState[];
  focusedId: string | null;
  launchApp: (appId: AppId, opts?: LaunchOptions) => void;
  closeWindow: (id: string) => void;
  closeAllWindows: () => void;
  focusWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  toggleMaximize: (id: string) => void;
  toggleFullScreen: (id: string) => void;
  updateWindowRect: (id: string, rect: Partial<Pick<WindowState, 'x' | 'y' | 'w' | 'h'>>) => void;
}

const WindowsContext = createContext<WindowsContextValue | null>(null);

export function useWindows(): WindowsContextValue {
  const ctx = useContext(WindowsContext);
  if (!ctx) throw new Error('useWindows must be used within WindowsProvider');
  return ctx;
}

let instanceCounter = 0;

// Window stacking (ibiz_v2 displayZ parity): tabs stack above widgets (30)
// and below the taskbar/overlays (80).
const Z_BASE = 41;
const Z_MAX = 79;

/** Return windows with `id` on top (`unminimize`). Order is compacted oldest-first
 *  on every call, so z stays in [Z_BASE, Z_MAX] forever and can never creep
 *  over the taskbar layer no matter how often windows are focused/launched. */
function assignTopZ(ws: WindowState[], id: string, unminimize: boolean): WindowState[] {
  const others = [...ws].sort((a, b) => a.z - b.z).filter((w) => w.id !== id);
  const mapped = new Map<string, number>();
  others.forEach((w, i) => mapped.set(w.id, Z_BASE + Math.min(i, Z_MAX - Z_BASE - 1)));
  const top = Z_BASE + Math.min(others.length, Z_MAX - Z_BASE);
  return ws.map((w) =>
    w.id === id
      ? { ...w, z: top, ...(unminimize ? { minimized: false } : {}) }
      : { ...w, z: mapped.get(w.id) ?? w.z },
  );
}

/** Open OS windows: state, focus/z-stack and the launch/move/resize lifecycle. */
export function WindowsProvider({ children }: { children: ReactNode }) {
  const { theme } = useTheme();
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const startedRef = useRef(false);
  const lastBoundsRef = useRef(getWorkspaceBounds());
  const themeRef = useRef(theme);
  themeRef.current = theme;

  // Window z lives in [Z_BASE, Z_TASKBAR) so tabs — maximized or not — can
  // never cover the taskbar (z-80). ibiz_v2 parity: displayZ = 40 + min(z,12).
  // When the range fills, z values are renormalized oldest-first.
  const focusWindow = useCallback((id: string) => {
    setWindows((ws) => assignTopZ(ws, id, false));
    setFocusedId(id);
  }, []);

  // Bring a minimized window back (focusWindow alone never clears mirrored
  // minimized state — the taskbar restore path depends on this).
  const restoreWindow = useCallback(
    (id: string) => {
      setWindows((ws) => ws.map((w) => (w.id === id ? { ...w, minimized: false } : w)));
      focusWindow(id);
    },
    [focusWindow],
  );

  const launchApp = useCallback(
    (appId: AppId, opts?: LaunchOptions) => {
      const app: AppDef | undefined = APP_REGISTRY.find((a) => a.id === appId);
      if (!app) return;

      // Single instance (or one editor per section): focus if already open
      const existing =
        app.id === 'editor'
          ? windows.find((w) => w.appId === appId && w.data?.section === opts?.data?.section)
          : app.singleInstance !== false
            ? windows.find((w) => w.appId === appId)
            : undefined;
      if (existing) {
        if (existing.minimized) restoreWindow(existing.id);
        else focusWindow(existing.id);
        return;
      }

      const bounds = getWorkspaceBounds(themeRef.current);
      const minW = app.minSize?.w ?? 360;
      const minH = app.minSize?.h ?? 240;
      const w = opts?.rect?.w ?? Math.min(app.defaultSize.w, bounds.width - 24);
      const h = opts?.rect?.h ?? Math.min(app.defaultSize.h, bounds.height - 24);
      const offset = (windows.length % 6) * 28;
      instanceCounter += 1;
      const id = `${appId}#${instanceCounter}`;
      const fitted = fitRectInBounds(
        opts?.rect
          ? { x: opts.rect.x, y: opts.rect.y, w, h }
          : {
              x: Math.max(12, (bounds.width - w) / 2 - 60 + offset),
              y: Math.max(12, (bounds.height - h) / 2 - 40 + offset),
              w,
              h,
            },
        bounds,
        { w: minW, h: minH },
      );

      setWindows((ws) =>
        assignTopZ(
          [
            ...ws,
            {
              id,
              appId,
              ...fitted,
              z: Z_BASE,
              minimized: false,
              maximized: false,
              isFullScreen: false,
              ...(opts?.data ? { data: opts.data } : {}),
            },
          ],
          id,
          false,
        ),
      );
      setFocusedId(id);
      sound.open();
    },
    [windows, focusWindow, restoreWindow],
  );

  const closeWindow = useCallback((id: string) => {
    setWindows((ws) => ws.filter((w) => w.id !== id));
    setFocusedId((f) => (f === id ? null : f));
    sound.close();
  }, []);

  // ibiz_v2 parity (resetWindowsLayout): close everything, e.g. StartMenu → Restore Layout.
  const closeAllWindows = useCallback(() => {
    setWindows([]);
    setFocusedId(null);
    sound.close();
  }, []);

  const minimizeWindow = useCallback((id: string) => {
    setWindows((ws) => ws.map((w) => (w.id === id ? { ...w, minimized: true } : w)));
    setFocusedId((f) => (f === id ? null : f));
    sound.minimize();
  }, []);

  const toggleMaximize = useCallback(
    (id: string) => {
      setWindows((ws) =>
        ws.map((w) => {
          if (w.id !== id) return w;
          if (w.maximized) {
            const p = w.prevRect ?? { x: 80, y: 60, w: 900, h: 600 };
            return { ...w, maximized: false, ...p, prevRect: undefined };
          }
          return {
            ...w,
            maximized: true,
            prevRect: { x: w.x, y: w.y, w: w.w, h: w.h },
          };
        }),
      );
      focusWindow(id);
    },
    [focusWindow],
  );

  // ibiz_v2 toggleFullScreen parity: the tab covers the entire viewport
  // (above topbar and taskbar) while the taskbar auto-hides. prevRect is
  // shared with maximize: maximized windows keep their restore geometry in
  // x/y/w/h, so entering fullscreen from maximized preserves it.
  const toggleFullScreen = useCallback(
    (id: string) => {
      setWindows((ws) =>
        ws.map((w) => {
          if (w.id !== id) return w;
          if (w.isFullScreen) {
            const p = w.prevRect ?? { x: 80, y: 60, w: 900, h: 600 };
            return { ...w, isFullScreen: false, ...p, prevRect: undefined };
          }
          return {
            ...w,
            isFullScreen: true,
            prevRect: { x: w.x, y: w.y, w: w.w, h: w.h },
          };
        }),
      );
      focusWindow(id);
    },
    [focusWindow],
  );

  const updateWindowRect = useCallback(
    (id: string, rect: Partial<Pick<WindowState, 'x' | 'y' | 'w' | 'h'>>) => {
      setWindows((ws) =>
        ws.map((w) => {
          if (w.id !== id || w.maximized || w.isFullScreen) return w;
          const next = { ...w, ...rect };
          const app = APP_REGISTRY.find((a) => a.id === w.appId);
          // Safety net: no caller can push a window outside the workspace.
          const fitted = fitRectInBounds(next, lastBoundsRef.current, {
            w: app?.minSize?.w ?? 0,
            h: app?.minSize?.h ?? 0,
          });
          return { ...w, ...fitted };
        }),
      );
    },
    [],
  );

  // ─── Startup windows ──────────────────────────────────────────────────────
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    const ids = themeRef.current.startupWindows ?? [];
    ids.forEach((appId, i) => {
      window.setTimeout(() => launchApp(appId as AppId), 120 + i * 90);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep every window fully on-screen when the viewport shrinks or the bars
  // change (topbar toggle, taskbar mode/style). Oversized rects shrink to fit
  // instead of hanging cut off past an edge.
  useEffect(() => {
    const reflow = () => {
      const b = getWorkspaceBounds(themeRef.current);
      lastBoundsRef.current = b;
      setWindows((ws) =>
        ws.map((w) => {
          if (w.maximized || w.isFullScreen) return w;
          const app = APP_REGISTRY.find((a) => a.id === w.appId);
          return {
            ...w,
            ...fitRectInBounds(w, b, { w: app?.minSize?.w ?? 0, h: app?.minSize?.h ?? 0 }),
          };
        }),
      );
    };
    reflow();
    // The taskbar is DOM-measured: re-run after paint so a style/mode
    // switch measures the new bar, not the previous one.
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

  const value = useMemo<WindowsContextValue>(
    () => ({
      windows,
      focusedId,
      launchApp,
      closeWindow,
      closeAllWindows,
      focusWindow,
      restoreWindow,
      minimizeWindow,
      toggleMaximize,
      toggleFullScreen,
      updateWindowRect,
    }),
    [
      windows, focusedId, launchApp, closeWindow, closeAllWindows, focusWindow,
      restoreWindow, minimizeWindow, toggleMaximize, toggleFullScreen, updateWindowRect,
    ],
  );

  return <WindowsContext.Provider value={value}>{children}</WindowsContext.Provider>;
}