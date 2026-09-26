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
  GUEST_THEME_KEY,
  LEGACY_DEFAULT_STARTUP_WINDOWS,
  loadTheme,
  saveTheme,
  themeKeyFor,
  type ThemeState,
} from '@/styles/theme';
import { useAuth } from '@/context/AuthContext';
import { fitRectInBounds, getWorkspaceBounds } from '@/lib/osLayout';
import { themeService } from '@/lib/api/themeService';
import { sound } from '@/lib/sound';
import { setForcedOffline } from '@/lib/network';

/** Functional or partial theme patch. Widgets keep placements synced through
 *  `theme.widgets`, so the updater form lets complex consumers compute against
 *  the latest state on high-frequency updates (widget drag/resize). */
export type ThemePatch = Partial<ThemeState> | ((prev: ThemeState) => Partial<ThemeState>);

interface ThemeContextValue {
  theme: ThemeState;
  setTheme: (patch: ThemePatch) => void;
  resetTheme: () => void;
  wallpaperLabel: string;
  /** True once the boot theme has been hydrated (local first render, then a
   *  server pull for the admin). The boot splash holds on this flag. */
  themeReady: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

/** Theme state: single source of truth for appearance incl. persisted widget
 *  placements (`theme.widgets`). Handles local persistence, identity-switching
 *  and server hydration. Guests are local-only — never pushed to the server. */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const { user, isAdmin, authReady } = useAuth();
  const [theme, setThemeState] = useState<ThemeState>(() => loadTheme());
  // Guests and each signed-in identity keep their own local theme. Only the
  // admin's key is ever server-synced — guest tweaks stay in the browser and
  // can never overwrite the admin's live site settings.
  const [themeKey, setThemeKey] = useState<string>(GUEST_THEME_KEY);
  const hydratedRef = useRef(false);
  const [themeReady, setThemeReady] = useState(false);
  const markHydrated = useCallback(() => {
    hydratedRef.current = true;
    setThemeReady(true);
  }, []);
  const saveTimer = useRef<number | undefined>(undefined);
  // Mirrors for the identity-switch effect (runs on auth changes only).
  const themeRef = useRef(theme);
  themeRef.current = theme;
  const themeKeyRef = useRef(themeKey);
  themeKeyRef.current = themeKey;

  // Theme application + persistence (local + server, ibiz_v2 parity).
  useEffect(() => {
    applyTheme(theme);
    // Plain-module mirrors: gate the WebAudio blips by sounds + volume and the
    // API layer by airplane mode (so reads fail fast → local seeds).
    sound.configure(theme.soundsEnabled, theme.volume);
    setForcedOffline(theme.airplaneMode);
    saveTheme(theme, themeKey);
    // Guests are local-only: never push to the server, so visitor settings
    // can't overwrite the admin's live site. Skip until hydration completes.
    if (!hydratedRef.current || !isAdmin) return;
    window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      void themeService.save(theme);
    }, 800);
    return () => window.clearTimeout(saveTimer.current);
  }, [theme, themeKey, isAdmin]);

  // Identity switch: park the outgoing theme under its own key, then load the
  // incoming identity's theme + widget placements (stored copy or defaults).
  // Switching into an admin forces a fresh server pull below.
  useEffect(() => {
    if (!authReady) return;
    const nextKey = themeKeyFor(user?.id ?? null);
    if (nextKey === themeKeyRef.current) {
      if (!isAdmin) markHydrated(); // guest: nothing to pull
      return;
    }
    saveTheme(themeRef.current, themeKeyRef.current);
    const incoming = loadTheme(nextKey);
    const b = getWorkspaceBounds(themeRef.current);
    const widgets = (incoming.widgets ?? []).map((p) => ({ ...p, ...fitRectInBounds(p, b) }));
    setThemeKey(nextKey);
    setThemeState({ ...incoming, widgets });
    hydratedRef.current = false;
    setThemeReady(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authReady, user]);

  // Boot/pull: server wins over local when it exists (admin only — guests
  // never touch the server). Stale exact-legacy startupWindows are
  // force-cleared once; any other saved pick (including an intentional [])
  // is preserved.
  useEffect(() => {
    if (!authReady) return;
    if (!isAdmin || hydratedRef.current) {
      markHydrated();
      return;
    }
    let cancelled = false;
    void themeService.get().then((server) => {
      if (cancelled || !server || typeof server !== 'object') {
        markHydrated();
        return;
      }
      const startup = (server.startupWindows as string[] | undefined) ?? [];
      const isLegacyStale =
        Array.isArray(startup) &&
        startup.length === LEGACY_DEFAULT_STARTUP_WINDOWS.length &&
        LEGACY_DEFAULT_STARTUP_WINDOWS.every((id) => startup.includes(id));
      const serverWidgets = (server.widgets as ThemeState['widgets']) ?? undefined;
      setThemeState((prev) => {
        const base = { ...DEFAULT_THEME, ...server, startupWindows: isLegacyStale ? [] : startup };
        // Server-saved widgets must appear: placements were seeded from the
        // first-render local theme before hydration completed. Fitted so
        // placements saved on a larger screen never load cut off.
        if (Array.isArray(serverWidgets) && serverWidgets.length > 0 && (prev.widgets ?? []).length === 0) {
          const b = getWorkspaceBounds(prev);
          return { ...base, widgets: serverWidgets.map((p) => ({ ...p, ...fitRectInBounds(p, b) })) };
        }
        return { ...base, widgets: serverWidgets ?? prev.widgets };
      });
      markHydrated();
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authReady, themeKey]);

  const setTheme = useCallback((patch: ThemePatch) => {
    setThemeState((prev) => {
      const p = typeof patch === 'function' ? patch(prev) : patch;
      return p && Object.keys(p).length > 0 ? { ...prev, ...p } : prev;
    });
  }, []);

  const resetTheme = useCallback(() => {
    setThemeState({ ...DEFAULT_THEME });
    // Guests reset their local theme only; only an admin clears the server row.
    if (isAdmin) void themeService.reset();
  }, [isAdmin]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme,
      resetTheme,
      wallpaperLabel: getWallpaper(theme.wallpaper).label,
      themeReady,
    }),
    [theme, setTheme, resetTheme, themeReady],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}