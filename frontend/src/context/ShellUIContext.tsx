import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useWindows } from '@/context/WindowsContext';
import type { NotificationItem } from '@/types';

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

interface ShellUIContextValue {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
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
  // Last-clicked widget (in-memory only): it floats above every tab until a
  // window is focused again. Owned here (not WidgetsContext) so window focus
  // paths can drop it without depending on the widgets provider.
  activeWidget: string | null;
  setActiveWidget: (instance: string | null) => void;
}

const ShellUIContext = createContext<ShellUIContextValue | null>(null);

export function useShellUI(): ShellUIContextValue {
  const ctx = useContext(ShellUIContext);
  if (!ctx) throw new Error('useShellUI must be used within ShellUIProvider');
  return ctx;
}

/** Non-geometric shell UI: web/os view, taskbar/menu/spotlight toggles,
 *  contact sheet flag and the notification tray. */
export function ShellUIProvider({ children }: { children: ReactNode }) {
  const { theme } = useTheme();
  const [viewMode, setViewModeState] = useState<ViewMode>(() => loadViewMode());
  const [widgetsOpen, setWidgetsOpen] = useState(true);
  const [spotlightOpen, setSpotlightOpen] = useState(false);
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [taskbarVisible, setTaskbarVisible] = useState(true);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [activeWidget, setActiveWidget] = useState<string | null>(null);
  const { focusedId } = useWindows();

  // Window focus takes precedence over the clicked widget: any focus change
  // drops the active widget back behind the tabs.
  useEffect(() => {
    setActiveWidget(null);
  }, [focusedId]);

  // 'always' mode implies a visible bar; auto-hide starts hidden.
  useEffect(() => {
    setTaskbarVisible(theme.taskbarMode === 'always');
  }, [theme.taskbarMode]);

  // Expose the shell view on <html> so CSS can key off it
  // (e.g. document scroll is locked in OS view, free in Web view).
  useEffect(() => {
    document.documentElement.dataset.view = viewMode;
  }, [viewMode]);

  const setViewMode = useCallback((mode: ViewMode) => {
    setViewModeState(mode);
    try {
      window.localStorage.setItem(VIEW_MODE_KEY, mode);
    } catch {
      // storage unavailable (private mode) — view mode just won't persist
    }
  }, []);

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

  const value = useMemo<ShellUIContextValue>(
    () => ({
      viewMode,
      setViewMode,
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
      activeWidget,
      setActiveWidget,
    }),
    [
      viewMode, setViewMode, widgetsOpen, setWidgetsOpen, spotlightOpen, setSpotlightOpen,
      startMenuOpen, setStartMenuOpen, taskbarVisible, setTaskbarVisible, contactModalOpen,
      setContactModalOpen, notifications, pushNotification, dismissNotification, markNotificationsRead,
      activeWidget, setActiveWidget,
    ],
  );

  return <ShellUIContext.Provider value={value}>{children}</ShellUIContext.Provider>;
}