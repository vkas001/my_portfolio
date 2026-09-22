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
import {
  applyTheme,
  DEFAULT_THEME,
  getWallpaper,
  LEGACY_DEFAULT_STARTUP_WINDOWS,
  loadTheme,
  saveTheme,
  type ThemeState,
} from '@/theme';
import { fitRectInBounds, fitWidgetRect, getWorkspaceBoundsFor, nextWidgetSlot } from '@/lib/osLayout';
import type { AppDef, AppId, NotificationItem, WindowState, WidgetMeta, WidgetPlacement, WidgetVariant } from '@/types';
import { sound } from '@/lib/sound';
import { themeService } from '@/lib/api/themeService';
import { APP_REGISTRY } from '@/apps/registry';

export type ViewMode = 'web' | 'os';

const VIEW_MODE_KEY = 'portfolio.viewMode';

/** Shell view preference, localStorage-only (not server-synced). Default: OS. */
function loadViewMode(): ViewMode {
  try {
    const v = window.localStorage.getItem(VIEW_MODE_KEY);
    return v === 'web' || v === 'os' ? v : 'os';
  } catch {
    return 'os';
  }
}

export interface OSContextValue {
  // theme
  theme: ThemeState;
  setTheme: (patch: Partial<ThemeState>) => void;
  resetTheme: () => void;
  wallpaperLabel: string;

  // shell view mode (web ⇄ os), default os
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;

  // windows
  windows: WindowState[];
  focusedId: string | null;
  launchApp: (appId: AppId) => void;
  closeWindow: (id: string) => void;
  closeAllWindows: () => void;
  focusWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  toggleMaximize: (id: string) => void;
  toggleFullScreen: (id: string) => void;
  updateWindowRect: (id: string, rect: Partial<Pick<WindowState, 'x' | 'y' | 'w' | 'h'>>) => void;

  // widgets
  widgetMeta: Record<string, WidgetMeta>;
  registerWidgets: (meta: WidgetMeta[]) => void;
  widgetPlacements: WidgetPlacement[];
  addWidget: (id: string) => void;
  removeWidget: (instance: string) => void;
  updateWidgetPlacement: (instance: string, patch: Partial<WidgetPlacement>) => void;
  moveWidgetVariant: (instance: string, variant: WidgetVariant) => void;

  // shell UI
  widgetsOpen: boolean;
  setWidgetsOpen: (open: boolean) => void;
  spotlightOpen: boolean;
  setSpotlightOpen: (open: boolean) => void;
  startMenuOpen: boolean;
  setStartMenuOpen: (open: boolean) => void;
  // Auto-hide taskbar visibility (ibiz_v2 isTaskbarVisible parity).
  // True = bar shown; only meaningful when theme.taskbarMode === 'auto-hide'.
  taskbarVisible: boolean;
  setTaskbarVisible: (open: boolean) => void;
  contactModalOpen: boolean;
  setContactModalOpen: (open: boolean) => void;
  notifications: NotificationItem[];
  pushNotification: (n: Omit<NotificationItem, 'id' | 'time' | 'read'>) => void;
  dismissNotification: (id: string) => void;
  markNotificationsRead: () => void;
}

const OSContext = createContext<OSContextValue | null>(null);

export function useOS(): OSContextValue {
  const ctx = useContext(OSContext);
  if (!ctx) throw new Error('useOS must be used within OSProvider');
  return ctx;
}

/** Resolve viewport bounds available to windows/widgets (between bars). */
export function getWorkspaceBounds(
  theme?: Pick<ThemeState, 'showTopBar' | 'taskbarMode' | 'taskbarStyle'> | null,
) {
  return getWorkspaceBoundsFor(
    theme ?? { showTopBar: true, taskbarMode: 'always', taskbarStyle: 'windows' },
  );
}

let instanceCounter = 0;

// Window stacking (ibiz_v2 displayZ parity): tabs stack above widgets (30)
// and below the taskbar/overlays (80).
const Z_BASE = 41;
const Z_MAX = 79;

/** Return windows with `id` on top (`unminimize`). Order is compacted oldest-first
 * on every call, so z stays in [Z_BASE, Z_MAX] forever and can never creep
 * over the taskbar layer no matter how often windows are focused/launched. */
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

export function OSProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeState>(() => loadTheme());
  const [viewMode, setViewModeState] = useState<ViewMode>(() => loadViewMode());
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [widgetMetaMap, setWidgetMetaMap] = useState<Record<string, WidgetMeta>>({});
  const [widgetPlacements, setWidgetPlacements] = useState<WidgetPlacement[]>(() => theme.widgets ?? []);
  const [widgetsOpen, setWidgetsOpen] = useState(true);
  const [spotlightOpen, setSpotlightOpen] = useState(false);
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [taskbarVisible, setTaskbarVisible] = useState(true);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const startedRef = useRef(false);
  const hydratedRef = useRef(false);
  const saveTimer = useRef<number | undefined>(undefined);
  const lastBoundsRef = useRef(getWorkspaceBounds());

  // ─── Theme application + persistence (local + server, ibiz_v2 parity) ──────
  useEffect(() => {
    applyTheme(theme);
    saveTheme(theme);
    if (!hydratedRef.current) return; // skip server push until first pull completes
    window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      void themeService.save(theme);
    }, 800);
    return () => window.clearTimeout(saveTimer.current);
  }, [theme]);

  // 'always' mode implies a visible bar; auto-hide starts hidden.
  useEffect(() => {
    setTaskbarVisible(theme.taskbarMode === 'always');
  }, [theme.taskbarMode]);
  // Expose the shell view on <html> so CSS can key off it
  // (e.g. document scroll is locked in OS view, free in Web view).
  useEffect(() => {
    document.documentElement.dataset.view = viewMode;
  }, [viewMode]);
  // Boot: server wins over local when it exists (single-user, no auth scope).
  // Stale exact-legacy startupWindows are force-cleared once; any other
  // saved pick (including an intentional []) is preserved.
  useEffect(() => {
    let cancelled = false;
    void themeService.get().then((server) => {
      if (cancelled || !server || typeof server !== 'object') {
        hydratedRef.current = true;
        return;
      }
      const startup = (server.startupWindows as string[] | undefined) ?? [];
      const isLegacyStale =
        Array.isArray(startup) &&
        startup.length === LEGACY_DEFAULT_STARTUP_WINDOWS.length &&
        LEGACY_DEFAULT_STARTUP_WINDOWS.every((id) => startup.includes(id));
      const serverWidgets = (server.widgets as ThemeState['widgets']) ?? undefined;
      setThemeState((prev) => ({
        ...DEFAULT_THEME,
        ...server,
        startupWindows: isLegacyStale ? [] : startup,
        widgets: serverWidgets ?? prev.widgets,
      }));
      // Server-saved widgets must appear: placements were seeded from the
      // first-render local theme before hydration completed. Fitted so
      // placements saved on a larger screen never load cut off.
      if (Array.isArray(serverWidgets) && serverWidgets.length > 0) {
        const b = getWorkspaceBounds(theme);
        lastBoundsRef.current = b;
        const fitted = serverWidgets.map((p) => ({ ...p, ...fitRectInBounds(p, b) }));
        setWidgetPlacements((prev) => (prev.length === 0 ? fitted : prev));
      }
      hydratedRef.current = true;
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const setTheme = useCallback((patch: Partial<ThemeState>) => {
    setThemeState((t) => ({ ...t, ...patch }));
  }, []);

  const setViewMode = useCallback((mode: ViewMode) => {
    setViewModeState(mode);
    try {
      window.localStorage.setItem(VIEW_MODE_KEY, mode);
    } catch {
      // storage unavailable (private mode) — view mode just won't persist
    }
  }, []);

  const resetTheme = useCallback(() => {
    setThemeState({ ...DEFAULT_THEME });
    void themeService.reset();
  }, []);

  // ─── Window management ────────────────────────────────────────────────────
  // Window z lives in [Z_BASE, Z_TASKBAR) so tabs — maximized or not — can
  // never cover the taskbar (z-80). ibiz_v2 parity: displayZ = 40 + min(z,12).
  // When the range fills, z values are renormalized oldest-first.
  const focusWindow = useCallback((id: string) => {
    setWindows((ws) => assignTopZ(ws, id, false));
    setFocusedId(id);
  }, []);

  const launchApp = useCallback(
    (appId: AppId) => {
      const app: AppDef | undefined = APP_REGISTRY.find((a) => a.id === appId);
      if (!app) return;

      // Single instance: focus if already open
      const existing = windows.find((w) => w.appId === appId);
      if (existing && app.singleInstance !== false) {
        focusWindow(existing.id);
        return;
      }

      const bounds = getWorkspaceBounds(theme);
      const minW = app.minSize?.w ?? 360;
      const minH = app.minSize?.h ?? 240;
      const w = Math.min(app.defaultSize.w, bounds.width - 24);
      const h = Math.min(app.defaultSize.h, bounds.height - 24);
      const offset = (windows.length % 6) * 28;
      instanceCounter += 1;
      const id = `${appId}#${instanceCounter}`;
      const fitted = fitRectInBounds(
        {
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
          [...ws, { id, appId, ...fitted, z: Z_BASE, minimized: false, maximized: false, isFullScreen: false }],
          id,
          false,
        ),
      );
      setFocusedId(id);
      sound.open();
    },
    [windows, focusWindow, theme],
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

  const toggleMaximize = useCallback((id: string) => {
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
  }, [focusWindow]);

  // ibiz_v2 toggleFullScreen parity: the tab covers the entire viewport
  // (above topbar and taskbar) while the taskbar auto-hides. prevRect is
  // shared with maximize: maximized windows keep their restore geometry in
  // x/y/w/h, so entering fullscreen from maximized preserves it.
  const toggleFullScreen = useCallback((id: string) => {
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
  }, [focusWindow]);

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

  // ─── Widgets ──────────────────────────────────────────────────────────────
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
      const bounds = getWorkspaceBounds(theme);
      const instance = `${id}#${Date.now().toString(36)}${Math.floor(Math.random() * 1e4).toString(36)}`;
      // Spawn top-right, stacking down and wrapping left — fitted so new
      // widgets never spawn inside the header, cut off, or overlapping.
      const slot = nextWidgetSlot(widgetPlacements, size, bounds);
      const fitted = fitWidgetRect({ ...slot, w: size.w, h: size.h }, bounds);
      setWidgetPlacements((ps) => [...ps, { id, instance, ...fitted, variant }]);
      sound.click();
    },
    [widgetMetaMap, widgetPlacements, theme],
  );

  const removeWidget = useCallback((instance: string) => {
    setWidgetPlacements((ps) => ps.filter((p) => p.instance !== instance));
    sound.close();
  }, []);

  const updateWidgetPlacement = useCallback((instance: string, patch: Partial<WidgetPlacement>) => {
    // Safety net: placements can never leave the workspace (nor enter the header).
    setWidgetPlacements((ps) =>
      ps.map((p) => (p.instance === instance ? { ...p, ...fitWidgetRect({ ...p, ...patch }, lastBoundsRef.current) } : p)),
    );
  }, []);

  const moveWidgetVariant = useCallback(
    (instance: string, variant: WidgetVariant) => {
      setWidgetPlacements((ps) =>
        ps.map((p) => {
          if (p.instance !== instance) return p;
          const meta = widgetMetaMap[p.id];
          const size = meta?.variants[variant] ?? { w: p.w, h: p.h };
          // Variant growth is top-left anchored: clamp so it can't spill
          // under the taskbar (or inside the header on tiny viewports).
          const fitted = fitWidgetRect({ ...p, w: size.w, h: size.h }, lastBoundsRef.current);
          return { ...p, variant, w: fitted.w, h: fitted.h, x: fitted.x, y: fitted.y };
        }),
      );
    },
    [widgetMetaMap],
  );

  // ─── Notifications ────────────────────────────────────────────────────────
  const pushNotification = useCallback((n: Omit<NotificationItem, 'id' | 'time' | 'read'>) => {
    setNotifications((ns) => [
      { ...n, id: `n${Date.now().toString(36)}`, time: Date.now(), read: false },
      ...ns.slice(0, 19),
    ]);
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications((ns) => ns.filter((n) => n.id !== id));
  }, []);

  const markNotificationsRead = useCallback(() => {
    setNotifications((ns) => ns.map((n) => ({ ...n, read: true })));
  }, []);

  // ─── Startup windows ──────────────────────────────────────────────────────
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    const ids = theme.startupWindows ?? [];
    ids.forEach((appId, i) => {
      window.setTimeout(() => launchApp(appId as AppId), 120 + i * 90);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep placements persisted inside theme storage
  useEffect(() => {
    setThemeState((t) => (JSON.stringify(t.widgets) === JSON.stringify(widgetPlacements)
      ? t
      : { ...t, widgets: widgetPlacements }));
  }, [widgetPlacements]);

  // Keep every window/widget fully on-screen when the viewport shrinks or
  // the bars change (topbar toggle, taskbar mode/style). Oversized rects
  // shrink to fit instead of hanging cut off past an edge.
  useEffect(() => {
    const reflow = () => {
      const b = getWorkspaceBounds(theme);
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
      setWidgetPlacements((ps) => ps.map((p) => ({ ...p, ...fitWidgetRect(p, b) })));
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

  const value = useMemo<OSContextValue>(
    () => ({
      theme,
      setTheme,
      resetTheme,
      wallpaperLabel: getWallpaper(theme.wallpaper).label,
      viewMode,
      setViewMode,
      windows,
      focusedId,
      launchApp,
      closeWindow,
      closeAllWindows,
      focusWindow,
      minimizeWindow,
      toggleMaximize,
      toggleFullScreen,
      updateWindowRect,
      widgetMeta: widgetMetaMap,
      registerWidgets,
      widgetPlacements,
      addWidget,
      removeWidget,
      updateWidgetPlacement,
      moveWidgetVariant,
      widgetsOpen,
      setWidgetsOpen,
      spotlightOpen,
      setSpotlightOpen,
      startMenuOpen,
      setStartMenuOpen,
      taskbarVisible,
      setTaskbarVisible,
      contactModalOpen,
      setContactModalOpen,
      notifications,
      pushNotification,
      dismissNotification,
      markNotificationsRead,
    }),
    [
      theme, setTheme, resetTheme, viewMode, setViewMode, windows, focusedId, launchApp, closeWindow, closeAllWindows, focusWindow,
      minimizeWindow, toggleMaximize, toggleFullScreen, updateWindowRect, widgetMetaMap, registerWidgets,
      widgetPlacements, addWidget, removeWidget, updateWidgetPlacement, moveWidgetVariant,
      widgetsOpen, spotlightOpen, startMenuOpen, taskbarVisible, contactModalOpen, notifications, pushNotification,
      dismissNotification, markNotificationsRead,
    ],
  );

  return <OSContext.Provider value={value}>{children}</OSContext.Provider>;
}
