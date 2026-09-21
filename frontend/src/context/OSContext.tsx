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
  getWallpaper,
  loadTheme,
  saveTheme,
  type ThemeState,
} from '@/theme';
import type { AppDef, AppId, NotificationItem, WindowState, WidgetMeta, WidgetPlacement, WidgetVariant } from '@/types';
import { sound } from '@/lib/sound';
import { APP_REGISTRY } from '@/apps/registry';

export interface OSContextValue {
  // theme
  theme: ThemeState;
  setTheme: (patch: Partial<ThemeState>) => void;
  resetTheme: () => void;
  wallpaperLabel: string;

  // windows
  windows: WindowState[];
  focusedId: string | null;
  launchApp: (appId: AppId) => void;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  toggleMaximize: (id: string) => void;
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
export function getWorkspaceBounds() {
  const width = window.innerWidth;
  const height = window.innerHeight - 40 /* topbar */ - 56 /* taskbar */;
  return { width, height };
}

let instanceCounter = 0;

export function OSProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeState>(() => loadTheme());
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [widgetMetaMap, setWidgetMetaMap] = useState<Record<string, WidgetMeta>>({});
  const [widgetPlacements, setWidgetPlacements] = useState<WidgetPlacement[]>(() => theme.widgets ?? []);
  const [widgetsOpen, setWidgetsOpen] = useState(true);
  const [spotlightOpen, setSpotlightOpen] = useState(false);
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const zCounter = useRef(10);
  const startedRef = useRef(false);

  // ─── Theme application ────────────────────────────────────────────────────
  useEffect(() => {
    applyTheme(theme);
    saveTheme(theme);
  }, [theme]);

  const setTheme = useCallback((patch: Partial<ThemeState>) => {
    setThemeState((t) => ({ ...t, ...patch }));
  }, []);

  const resetTheme = useCallback(() => {
    setThemeState((t) => ({ ...t, widgets: t.widgets }));
    // full reset to defaults, keeping nothing custom
    import('@/theme').then(({ DEFAULT_THEME }) => setThemeState({ ...DEFAULT_THEME }));
  }, []);

  // ─── Window management ────────────────────────────────────────────────────
  const focusWindow = useCallback((id: string) => {
    zCounter.current += 1;
    const z = zCounter.current;
    setWindows((ws) => ws.map((w) => (w.id === id ? { ...w, z, minimized: false } : w)));
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

      const bounds = getWorkspaceBounds();
      const w = Math.min(app.defaultSize.w, bounds.width - 24);
      const h = Math.min(app.defaultSize.h, bounds.height - 24);
      const offset = (windows.length % 6) * 28;
      instanceCounter += 1;
      const id = `${appId}#${instanceCounter}`;
      zCounter.current += 1;

      setWindows((ws) => [
        ...ws,
        {
          id,
          appId,
          x: Math.max(12, (bounds.width - w) / 2 - 60 + offset),
          y: Math.max(12, (bounds.height - h) / 2 - 40 + offset),
          w,
          h,
          z: zCounter.current,
          minimized: false,
          maximized: false,
        },
      ]);
      setFocusedId(id);
      sound.open();
    },
    [windows, focusWindow],
  );

  const closeWindow = useCallback((id: string) => {
    setWindows((ws) => ws.filter((w) => w.id !== id));
    setFocusedId((f) => (f === id ? null : f));
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

  const updateWindowRect = useCallback(
    (id: string, rect: Partial<Pick<WindowState, 'x' | 'y' | 'w' | 'h'>>) => {
      setWindows((ws) => ws.map((w) => (w.id === id ? { ...w, ...rect } : w)));
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
      if (!meta) return;
      const variant = meta.defaultVariant;
      const size = meta.variants[variant] ?? { w: 300, h: 200 };
      const bounds = getWorkspaceBounds();
      const instance = `${id}#${Date.now().toString(36)}${Math.floor(Math.random() * 1e4).toString(36)}`;
      const existing = widgetPlacements.map((p) => ({ x: p.x, y: p.y, w: p.w, h: p.h }));
      // Simple cascade placement
      const x = Math.min(bounds.width - size.w, 24 + (widgetPlacements.length % 4) * 40);
      const y = Math.min(bounds.height - size.h, 24 + (widgetPlacements.length % 4) * 40);
      void existing;
      setWidgetPlacements((ps) => [...ps, { id, instance, x, y, w: size.w, h: size.h, variant }]);
      sound.click();
    },
    [widgetMetaMap, widgetPlacements],
  );

  const removeWidget = useCallback((instance: string) => {
    setWidgetPlacements((ps) => ps.filter((p) => p.instance !== instance));
    sound.close();
  }, []);

  const updateWidgetPlacement = useCallback((instance: string, patch: Partial<WidgetPlacement>) => {
    setWidgetPlacements((ps) => ps.map((p) => (p.instance === instance ? { ...p, ...patch } : p)));
  }, []);

  const moveWidgetVariant = useCallback(
    (instance: string, variant: WidgetVariant) => {
      setWidgetPlacements((ps) =>
        ps.map((p) => {
          if (p.instance !== instance) return p;
          const meta = widgetMetaMap[p.id];
          const size = meta?.variants[variant] ?? { w: p.w, h: p.h };
          return { ...p, variant, w: size.w, h: size.h };
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

  const value = useMemo<OSContextValue>(
    () => ({
      theme,
      setTheme,
      resetTheme,
      wallpaperLabel: getWallpaper(theme.wallpaper).label,
      windows,
      focusedId,
      launchApp,
      closeWindow,
      focusWindow,
      minimizeWindow,
      toggleMaximize,
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
      contactModalOpen,
      setContactModalOpen,
      notifications,
      pushNotification,
      dismissNotification,
      markNotificationsRead,
    }),
    [
      theme, setTheme, resetTheme, windows, focusedId, launchApp, closeWindow, focusWindow,
      minimizeWindow, toggleMaximize, updateWindowRect, widgetMetaMap, registerWidgets,
      widgetPlacements, addWidget, removeWidget, updateWidgetPlacement, moveWidgetVariant,
      widgetsOpen, spotlightOpen, startMenuOpen, contactModalOpen, notifications, pushNotification,
      dismissNotification, markNotificationsRead,
    ],
  );

  return <OSContext.Provider value={value}>{children}</OSContext.Provider>;
}
