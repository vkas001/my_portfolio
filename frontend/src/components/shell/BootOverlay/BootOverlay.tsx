import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useContent } from '@/context/ContentContext';
import { BootScreen, BOOT_DURATION } from '@/components/shell/BootScreen/BootScreen';

/** Single boot experience. Overlays the shell while auth, the theme and the
 *  portfolio content hydrate (the "required settings"), always respecting the
 *  minimum boot duration. BootScreen drives its own release: once nothing is
 *  blocking it (and the minimum time elapsed) `hold` drops, it fades out, and
 *  `onDone` unmounts it. A generous safety cap forces the exit if a network
 *  call ever hangs. */
const BOOT_SAFETY_CAP_MS = 10_000;

export default function BootOverlay() {
  const { authReady } = useAuth();
  const { themeReady } = useTheme();
  const { loading } = useContent();
  const [released, setReleased] = useState(false);
  const [minElapsed, setMinElapsed] = useState(false);
  const [capped, setCapped] = useState(false);

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
    !themeReady ? 'Loading your theme…' : loading ? 'Loading your portfolio…' : null;

  return (
    <BootScreen
      hold={(!minElapsed || blocking) && !capped}
      statusLine={statusLine}
      onDone={() => setReleased(true)}
    />
  );
}