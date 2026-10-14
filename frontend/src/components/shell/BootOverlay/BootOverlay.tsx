import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useContent } from '@/context/ContentContext';
import { BootScreen, BOOT_DURATION, BootBackdrop } from '@/components/shell/BootScreen/BootScreen';
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

/** Pre-theme progress readout for the veil: same wall-clock the splash will
 *  continue, capped at 99% so it never claims done before handoff. Uses the
 *  same .boot-progress markup so the swap is invisible. */
function VeilProgress({ startedAt, statusLine }: { startedAt: number; statusLine: string | null }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      setProgress(Math.min(99, ((Date.now() - startedAt) / BOOT_DURATION) * 100));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [startedAt]);

  return (
    <div className="boot-progress">
      <div className="boot-progress__track">
        <div className="boot-progress__fill" style={{ width: `${progress}%` }} />
      </div>
      <div className="boot-status">
        <span className="boot-status__line">
          <Loader2 className="boot-spinner" />
          {statusLine ?? 'Loading…'}
        </span>
        <span className="boot-status__pct">{Math.round(progress)}%</span>
      </div>
    </div>
  );
}

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
  const [veil] = useState(() => {
    let key = GUEST_THEME_KEY;
    try { key = localStorage.getItem(THEME_KEY_LAST) ?? GUEST_THEME_KEY; } catch { /* private mode */ }
    const stored = loadTheme(key);
    return {
      bg: (SPLASH_BACKGROUNDS[stored.splashBackground as SplashBackground] ?? SPLASH_BACKGROUNDS.abyss).css,
      image: stored.splashBackgroundImage,
    };
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

  const blocking = !authReady || !themeReady || loading;
  const statusLine =
    !themeReady ? 'Loading your theme…' : loading ? 'Loading portfolio…' : null;

  // Theme still resolving (local → identity → server pull): hold a live
  // progress veil so the first animated frame already carries final values.
  // The veil is the same unthemed base the splash paints over — seamless.
  if (!themeReady && !capped) {
    return (
      <div className="boot-overlay" aria-hidden="true" style={{ background: veil.bg }}>
        {veil.image && <BootBackdrop image={veil.image} />}
        <div className="boot-center">
          <VeilProgress startedAt={mountAt} statusLine={statusLine} />
        </div>
      </div>
    );
  }

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
      backgroundImage={theme.splashBackgroundImage}
      accent={theme.splashAccent}
      onDone={() => setReleased(true)}
    />
  );
}