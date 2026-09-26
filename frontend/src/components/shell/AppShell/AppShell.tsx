import { useEffect, useRef, useState } from 'react';
import { useWindows } from '@/context/WindowsContext';
import { useShellUI } from '@/context/ShellUIContext';
import Desktop from '@/components/shell/Desktop/Desktop';
import Spotlight from '@/components/shell/Spotlight/Spotlight';
import Toaster from '@/components/shell/Toaster/Toaster';
import WebView from '@/components/shell/WebView/WebView';
import { ContactModal } from '@/modules/contact';
import { BootScreen } from '@/components/shell/BootScreen/BootScreen';
import { matchShortcut } from '@/lib/shortcuts';
import type { AppId } from '@/types';

/** Time for the Web ⇄ OS switch splash (data is already loaded, so shorter
 *  than the real boot). */
const VIEW_SWITCH_SPLASH_MS = 1500;

/** Shared shell root: global keyboard shortcuts + overlays that work in BOTH
 *  Web and OS views (Spotlight, contact sheet), then the active view. */
export default function AppShell() {
  const { viewMode, widgetsOpen, setWidgetsOpen, setSpotlightOpen, taskbarVisible, setTaskbarVisible } = useShellUI();
  const { windows, focusedId, launchApp, closeWindow } = useWindows();
  const prevViewMode = useRef(viewMode);
  const [transitionSplash, setTransitionSplash] = useState<{ id: number } | null>(null);

  // Replay the boot splash on every Web ⇄ OS switch (skipped on mount — the
  // initial boot already ran in BootOverlay).
  useEffect(() => {
    if (prevViewMode.current !== viewMode) {
      prevViewMode.current = viewMode;
      setTransitionSplash({ id: Date.now() });
    }
  }, [viewMode]);

  // Global keyboard shortcuts (ported verbatim from Desktop).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const sc = matchShortcut(e);
      if (!sc) return;
      e.preventDefault();
      switch (sc.action) {
        case 'spotlight': setSpotlightOpen(true); break;
        case 'widgets': setWidgetsOpen(!widgetsOpen); break;
        case 'taskbar': setTaskbarVisible(!taskbarVisible); break;
        case 'launch': {
          // In Web view there are no windows: shortcuts scroll to sections.
          const payload = sc.payload as AppId;
          if (viewMode === 'web') {
            if (payload !== 'settings') {
              document.getElementById(`section-${payload}`)?.scrollIntoView({ behavior: 'smooth' });
            }
          } else {
            launchApp(payload);
          }
          break;
        }
        case 'close-focused': {
          if (focusedId) closeWindow(focusedId);
          break;
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [viewMode, windows, widgetsOpen, focusedId, launchApp, setSpotlightOpen, setWidgetsOpen, taskbarVisible, setTaskbarVisible, closeWindow]);

  return (
    <>
      <Toaster />
      <Spotlight />
      <ContactModal />
      {transitionSplash && (
        <BootScreen
          key={transitionSplash.id}
          duration={VIEW_SWITCH_SPLASH_MS}
          statusLine="Loading resources"
          words={
            viewMode === 'web'
              ? ['Switching', 'to', 'Web view']
              : ['Switching', 'to', 'OS view']
          }
          tagline="Please wait"
          onDone={() =>
            setTransitionSplash((s) => (s && s.id === transitionSplash.id ? null : s))
          }
        />
      )}
      {viewMode === 'web' ? <WebView /> : <Desktop />}
    </>
  );
}
