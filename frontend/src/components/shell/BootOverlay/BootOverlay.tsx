import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useContent } from '@/context/ContentContext';
import { BootScreen, BOOT_DURATION } from '@/components/shell/BootScreen/BootScreen';
import { GUEST_THEME_KEY, loadTheme, SPLASH_BACKGROUNDS, THEME_KEY_LAST, type SplashBackground } from '@/styles/theme';

/** Single boot experience. Overlays the shell while auth, the theme and the
 *  portfolio content hydrate (the "required settings"), always respecting the
 *  minimum boot duration. BootScreen drives its own release: once nothing is
 *  blocking it (and the minimum time elapsed) `hold` drops, it fades out, and
 *  `onDone` unmounts it. A generous safety cap forces the exit if a network
 *  call ever hangs.
 *
 *  No-flip rule: the theme resolves in up to three paints (guest defaults →
 *  identity-local → server pull). The splash mounts only once the theme is
 *  settled, so its first animated frame already carries final values —
 *  otherwise the wordmark/background visibly swaps mid-animation. The wall
 *  clock keeps running from overlay mount, so the hold timing is unchanged. */
const BOOT_SAFETY_CAP_MS = 10_000;

export default function BootOverlay() {
  const { authReady } = useAuth();
  const { theme, themeReady } = useTheme();
  const { loading } = useContent();
  const [released, setReleased] = useState(false);
  const [minElapsed, setMinElapsed] = useState(false);
  const [capped, setCapped] = useState(false);
  const [mountAt] = useState(() => Date.now());
  // Veil tint, read synchronously from storage so the static veil already
  // wears the saved background. Uses the last-active identity key (not just
  // the guest key) so a signed-in admin's look shows from the first frame.
  const [veilBg] = useState(() => {
    let key = GUEST_THEME_KEY;
    try { key = localStorage.getItem(THEME_KEY_LAST) ?? GUEST_THEME_KEY; } catch { /* private mode */ }
    return (SPLASH_BACKGROUNDS[loadTheme(key).splashBackground as SplashBackground] ?? SPLASH_BACKGROUNDS.abyss).css;
  });

  useEffect(() => {
    const timer = window.setTimeout(() => setMinElapsed(true), BOOT_DURATION);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setCapped(true), BOOT_SAFETY_CAP_MS);
    return () => window.clearTimeout(timer);
  }, []);

  if (released) return null;

  // Theme still resolving (local → identity → server pull): hold a static
  // dark veil so the first animated frame already carries final values.
  // The veil is the same unthemed base the splash paints over — seamless.
  if (!themeReady && !capped) {
    return <div className="boot-overlay" aria-hidden="true" style={{ background: veilBg }} />;
  }

  const blocking = !authReady || !themeReady || loading;
  const statusLine =
    !themeReady ? 'Loading your theme…' : loading ? 'Loading portfolio…' : null;

  return (
    <BootScreen
      hold={(!minElapsed || blocking) && !capped}
      statusLine={statusLine}
      startedAt={mountAt}
      words={theme.splashWords}
      tagline={theme.splashTagline || null}
      footer={theme.splashFooter}
      duration={theme.splashDuration}
      background={theme.splashBackground}
      accent={theme.splashAccent}
      onDone={() => setReleased(true)}
    />
  );
}