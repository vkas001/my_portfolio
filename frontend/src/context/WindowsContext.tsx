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
import { fitRectInBounds, followWindowBoundsChange, getWindowBounds, getWindowSpawnBounds, Z_WINDOW_BASE, Z_WINDOW_TOP, type WindowAnchorSpan } from '@/lib/osLayout';
import { WINDOW_SIZE_SCALES, type ThemeState } from '@/styles/theme';
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
  /** Launches (or focuses) an app and returns the window id of the
   *  launched/focused window, so callers can record a dock or follow-up. */
  launchApp: (appId: AppId, opts?: LaunchOptions) => string | undefined;
  closeWindow: (id: string) => void;
  closeAllWindows: () => void;
  focusWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  toggleMaximize: (id: string) => void;
  /** Green-dot zoom. `content` carries the window body's measured sizes so
   *  the zoom hugs the content height (width follows proportionally), never
   *  past 1.5x. Taller content than that keeps scrolling. */
  toggleFullScreen: (id: string, content?: { bodyW: number; bodyH: number; scrollW: number; scrollH: number }) => void;
  updateWindowRect: (id: string, rect: Partial<Pick<WindowState, 'x' | 'y' | 'w' | 'h'>>) => void;
  /** Replace a window's per-app payload (e.g. the editor keeping its
   *  section + dock in sync while switching apps). */
  updateWindowData: (id: string, data: WindowData) => void;
}

const WindowsContext = createContext<WindowsContextValue | null>(null);

export function useWindows(): WindowsContextValue {
  const ctx = useContext(WindowsContext);
  if (!ctx) throw new Error('useWindows must be used within WindowsProvider');
  return ctx;
}

let instanceCounter = 0;

// Window stacking: tabs stack above widgets (30) and below the taskbar/
// overlays (80). Tabs cap at Z_WINDOW_TOP (78) — the slot just under 79 is
// reserved for the active widget, so a clicked widget always surfaces above
// every tab until a window is focused again.
function assignTopZ(ws: WindowState[], id: string, unminimize: boolean): WindowState[] {
  const others = [...ws].sort((a, b) => a.z - b.z).filter((w) => w.id !== id);
  const mapped = new Map<string, number>();
  others.forEach((w, i) => mapped.set(w.id, Z_WINDOW_BASE + Math.min(i, Z_WINDOW_TOP - Z_WINDOW_BASE - 1)));
  const top = Z_WINDOW_BASE + Math.min(others.length, Z_WINDOW_TOP - Z_WINDOW_BASE);
  return ws.map((w) =>
    w.id === id
      ? { ...w, z: top, ...(unminimize ? { minimized: false } : {}) }
      : { ...w, z: mapped.get(w.id) ?? w.z },
  );
}

/** Open OS windows: state, focus/z-stack and the launch/move/resize lifecycle. */
// Anchor spans for the reflow: windows are clamped against the full workspace
// bounds but are *centred* in the free area above the taskbar — the same band
// `launchApp` centres new windows in, so a freshly opened tab is recognised as
// centred and keeps that placement as the browser resizes.
function anchorSpans(theme: ThemeState): WindowAnchorSpan {
  const fit = getWindowBounds(theme);
  return { width: fit.width, height: fit.height, centerHeight: getWindowSpawnBounds(theme).height };
}

export function WindowsProvider({ children }: { children: ReactNode }) {
  const { theme } = useTheme();
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const startedRef = useRef(false);
  const lastBoundsRef = useRef(getWindowBounds());
  // Previous anchor spans for the position-aware reflow. `centerHeight` comes
  // from the spawn bounds so "centred" means the same thing here as it does
  // when a window is launched.
  const lastSpanRef = useRef<WindowAnchorSpan>(anchorSpans(theme));
  const themeRef = useRef(theme);
  themeRef.current = theme;
  const windowsRef = useRef(windows);
  windowsRef.current = windows;

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
    (appId: AppId, opts?: LaunchOptions): string | undefined => {
      const app: AppDef | undefined = APP_REGISTRY.find((a) => a.id === appId);
      if (!app) return undefined;

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
        return existing.id;
      }

      // First launch fits above the taskbar (getWindowSpawnBounds); dragging
      // can still push a tab behind the bar afterwards (getWindowBounds).
      const bounds = getWindowSpawnBounds(themeRef.current);
      const minW = app.minSize?.w ?? 360;
      const minH = app.minSize?.h ?? 240;
      // Apps flagged `openMaximized` (the editor) cover the workspace when
      // launched on their own; an explicit `rect` — the dock/tile flow — always
      // wins, so opening one from a content window still tiles the pair.
      const coverWorkspace = !opts?.rect && app.openMaximized === true;
      // Settings → Apps window-size preset scales the app's default size; an
      // explicit `rect` (dock/tile flow) keeps its own dimensions untouched.
      const sizeScale = WINDOW_SIZE_SCALES[themeRef.current.windowSize] ?? 1;
      const w = opts?.rect?.w ?? Math.min(app.defaultSize.w * sizeScale, bounds.width - 24);
      const h = opts?.rect?.h ?? Math.min(app.defaultSize.h * sizeScale, bounds.height - 24);
      const offset = (windows.length % 6) * 28;
      instanceCounter += 1;
      const id = `${appId}#${instanceCounter}`;
      // Where the tab would sit without `openMaximized` — also what un-maximizing
      // restores, so the toggle always leads somewhere sensible. Spawned exactly
      // centered (plus the cascade offset for extra windows) so the reflow can
      // recognize it as centered and keep it that way as the viewport changes.
      const defaultRect = fitRectInBounds(
        { x: (bounds.width - w) / 2 + offset, y: (bounds.height - h) / 2 + offset, w, h },
        bounds,
        { w: minW, h: minH },
      );
      const fitted = opts?.rect
        ? fitRectInBounds({ x: opts.rect.x, y: opts.rect.y, w: opts.rect.w, h: opts.rect.h }, bounds, { w: minW, h: minH })
        : coverWorkspace
          ? { x: 0, y: 0, w: bounds.width, h: bounds.height }
          : defaultRect;

      setWindows((ws) =>
        assignTopZ(
          [
            ...ws,
            {
              id,
              appId,
              ...fitted,
              z: Z_WINDOW_BASE,
              minimized: false,
              maximized: coverWorkspace,
              isFullScreen: false,
              ...(coverWorkspace ? { prevRect: defaultRect } : null),
              ...(opts?.data ? { data: opts.data } : {}),
            },
          ],
          id,
          false,
        ),
      );
      setFocusedId(id);
      sound.open();
      return id;
    },
    [windows, focusWindow, restoreWindow],
  );

  const closeWindow = useCallback((id: string) => {
    const all = windowsRef.current;
    const closing = all.find((w) => w.id === id);
    if (!closing) return;

    // Windows removed by this close: the target itself, plus any editor docked
    // to it. Closing the content window an editor is tiled alongside closes the
    // editor too, so it is never left idle in an empty half.
    const remove = new Set<string>([id]);
    if (closing.appId !== 'editor') {
      for (const w of all) {
        if (w.appId === 'editor' && w.data?.dock?.contentId === id) remove.add(w.id);
      }
    }

    // Closing a docked editor restores the content window it was tiled
    // alongside back to its original size/position.
    const dock = closing.appId === 'editor' ? closing.data?.dock : undefined;

    setWindows((ws) =>
      ws
        .filter((w) => !remove.has(w.id))
        .map((w) => {
          if (!dock || w.id !== dock.contentId || w.maximized || w.isFullScreen) return w;
          const app = APP_REGISTRY.find((a) => a.id === w.appId);
          const fit = fitRectInBounds(dock.rect, lastBoundsRef.current, {
            w: app?.minSize?.w ?? 0,
            h: app?.minSize?.h ?? 0,
          });
          return { ...w, ...fit, clampSource: undefined };
        }),
    );
    setFocusedId((f) => (f && remove.has(f) ? null : f));
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
            return { ...w, maximized: false, ...p, prevRect: undefined, clampSource: undefined };
          }
          return {
            ...w,
            maximized: true,
            prevRect: { x: w.x, y: w.y, w: w.w, h: w.h },
            clampSource: undefined,
          };
        }),
      );
      focusWindow(id);
    },
    [focusWindow],
  );

// Green dot: zoom the tab toward its content rather than swallow the
// viewport. Height grows only up to what the window body's content needs
// (scroll height vs. visible height), floored at 1.2x so a single tap always
// visibly expands even when the content already fits. Width follows the
// height's growth ratio so the tab keeps its shape; fluid layouts never
// overflow horizontally, so there is no content width to hug. Everything is
// capped at 1.5x, and content taller than the cap keeps its scrollbar. The
// window stays an ordinary floating tab (rounded corners, draggable,
// resizable, top bar + taskbar untouched), grown around its center and
// clamped to the space above the taskbar. Pressing the dot again restores
// the rect it had before (prevRect, shared with maximize) — so zooming a
// maximized tab grows the size it restores to, not the whole screen.
  const toggleFullScreen = useCallback(
    (id: string, content?: { bodyW: number; bodyH: number; scrollW: number; scrollH: number }) => {
      setWindows((ws) =>
        ws.map((w) => {
          if (w.id !== id) return w;
          if (w.isFullScreen) {
            const p = w.prevRect ?? { x: 80, y: 60, w: 900, h: 600 };
            return { ...w, isFullScreen: false, ...p, prevRect: undefined, clampSource: undefined };
          }
          const b = getWindowSpawnBounds(themeRef.current);
          const app = APP_REGISTRY.find((a) => a.id === w.appId);
          const base = w.maximized && w.prevRect ? w.prevRect : { x: w.x, y: w.y, w: w.w, h: w.h };
          // Settings is the OS control surface: its green dot fills the
          // whole workspace (header to taskbar) instead of the content zoom.
          if (w.appId === 'settings') {
            return { ...w, x: 0, y: 0, w: b.width, h: b.height, isFullScreen: true, maximized: false, prevRect: base, clampSource: undefined };
          }
          // Content-hugging zoom: chrome (titlebar/borders) is the gap
          // between the window rect and the measured body; each body axis
          // grows from its visible size toward its scroll size, capped at
          // 1.5x, and the window follows by the same delta (also capped).
          const bodyH = content?.bodyH && content.bodyH > 0 ? content.bodyH : base.h;
          const wantH = content ? Math.min(Math.max(content.scrollH, bodyH), bodyH * 1.5) : base.h * 1.5;
          // A single tap must always visibly expand: floor the zoom at 1.2x
          // even when the content already fits (which alone would be a no-op).
          const newH = Math.min(Math.max(base.h + Math.max(0, wantH - bodyH), base.h * 1.2), base.h * 1.5);
          // Width follows the height's growth ratio so the tab keeps its
          // shape instead of going tall and narrow; fluid content never
          // overflows horizontally, so there is no content width to hug.
          // Still hard-capped at 1.5x.
          const newW = Math.min(base.w * (base.h > 0 ? newH / base.h : 1), base.w * 1.5);
          const zoomed = fitRectInBounds(
            { x: base.x - (newW - base.w) / 2, y: base.y - (newH - base.h) / 2, w: newW, h: newH },
            b,
            { w: app?.minSize?.w ?? 0, h: app?.minSize?.h ?? 0 },
          );
          // clampSource must go: it describes the *pre-zoom* placement, and
          // reviving it on the next resize would snap the window back.
          return { ...w, ...zoomed, isFullScreen: true, maximized: false, prevRect: base, clampSource: undefined };
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
          if (w.id !== id || w.maximized) return w;
          const next = { ...w, ...rect };
          const app = APP_REGISTRY.find((a) => a.id === w.appId);
          // Safety net: no caller can push a window outside the workspace.
          const fitted = fitRectInBounds(next, lastBoundsRef.current, {
            w: app?.minSize?.w ?? 0,
            h: app?.minSize?.h ?? 0,
          });
          // Any user/programmatic move takes explicit control of the window
          // geometry, so its pre-clamp snapshot must no longer be revived.
          return { ...w, ...fitted, clampSource: undefined };
        }),
      );
    },
    [],
  );

  const updateWindowData = useCallback((id: string, data: WindowData) => {
    setWindows((ws) => ws.map((w) => (w.id === id ? { ...w, data } : w)));
  }, []);

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

  // Keep every window on-screen and *position aware* when the viewport resizes:
  // a centered tab stays centered at any width/height instead of being clamped
  // into a corner, while every other tab keeps its exact offset. Oversized
  // rects shrink to fit and remember their pre-clamp geometry, which comes back
  // once the viewport grows again.
  useEffect(() => {
    const reflow = () => {
      const b = getWindowBounds(themeRef.current);
      const span = anchorSpans(themeRef.current);
      const old = lastSpanRef.current;
      lastBoundsRef.current = b;
      lastSpanRef.current = span;
      setWindows((ws) =>
        ws.map((w) => {
          if (w.maximized) return w;
          const app = APP_REGISTRY.find((a) => a.id === w.appId);
          const min = { w: app?.minSize?.w ?? 0, h: app?.minSize?.h ?? 0 };
          const cur = { x: w.x, y: w.y, w: w.w, h: w.h };
          // The placement to re-anchor: the pre-clamp geometry while the window
          // is squeezed (its real position, not the corner it got pushed into),
          // otherwise where it currently sits.
          const place = w.clampSource ?? cur;
          // Size first — regain the remembered size once the workspace fits it
          // again — then re-anchor the position to the new bounds.
          const sized =
            w.clampSource && w.clampSource.w <= b.width && w.clampSource.h <= b.height
              ? { ...place, w: w.clampSource.w, h: w.clampSource.h }
              : place;
          const fitted = fitRectInBounds(followWindowBoundsChange(sized, old, span), b, min);
          if (fitted.x !== cur.x || fitted.y !== cur.y || fitted.w !== cur.w || fitted.h !== cur.h) {
            return { ...w, ...fitted, clampSource: w.clampSource ?? cur };
          }
          // Back inside the workspace with its original geometry: forget the
          // clamp so a later drag/resize isn't reverted to this snapshot.
          return w.clampSource ? { ...w, ...fitted, clampSource: undefined } : w;
        }),
      );
    };
reflow();
    const raf = requestAnimationFrame(reflow);
    const settled = window.setTimeout(reflow, 300);
    let t: number | undefined;
    // Don't yank geometry out from under an in-flight drag. This is a *time*
    // window, not latched pointer state on purpose: a drag released outside the
    // browser (or a lost pointer capture) never delivers `pointerup`, and a
    // latched flag would silently kill position-aware reflow for the rest of the
    // session. Any pause longer than this lets the reflow run again.
    let lastPointerAt = 0;
    const notePointer = () => {
      lastPointerAt = Date.now();
    };
    const onResize = () => {
      window.clearTimeout(t);
      const since = Date.now() - lastPointerAt;
      t = window.setTimeout(reflow, since < 250 ? 250 - since : 150);
    };
    window.addEventListener('pointerdown', notePointer, true);
    window.addEventListener('pointermove', notePointer, true);
    window.addEventListener('pointerup', notePointer, true);
    window.addEventListener('pointercancel', notePointer, true);
    window.addEventListener('resize', onResize);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('pointerdown', notePointer, true);
      window.removeEventListener('pointermove', notePointer, true);
      window.removeEventListener('pointerup', notePointer, true);
      window.removeEventListener('pointercancel', notePointer, true);
      window.removeEventListener('resize', onResize);
      window.clearTimeout(settled);
      cancelAnimationFrame(raf);
    };
  }, [theme.showTopBar]);

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
      updateWindowData,
    }),
    [
      windows, focusedId, launchApp, closeWindow, closeAllWindows, focusWindow,
      restoreWindow, minimizeWindow, toggleMaximize, toggleFullScreen,
      updateWindowRect, updateWindowData,
    ],
  );

  return <WindowsContext.Provider value={value}>{children}</WindowsContext.Provider>;
}