import { useEffect } from 'react';
import { useWindows } from '@/context/WindowsContext';
import { useShellUI } from '@/context/ShellUIContext';
import Desktop from '@/components/shell/Desktop/Desktop';
import Spotlight from '@/components/shell/Spotlight/Spotlight';
import WebView from '@/components/shell/WebView/WebView';
import { ContactModal } from '@/modules/contact';
import { matchShortcut } from '@/lib/shortcuts';
import type { AppId } from '@/types';

/** Shared shell root: global keyboard shortcuts + overlays that work in BOTH
 *  Web and OS views (Spotlight, contact sheet), then the active view. */
export default function AppShell() {
  const { viewMode, widgetsOpen, setWidgetsOpen, setSpotlightOpen, taskbarVisible, setTaskbarVisible } = useShellUI();
  const { windows, focusedId, launchApp, closeWindow } = useWindows();

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
      <Spotlight />
      <ContactModal />
      {viewMode === 'web' ? <WebView /> : <Desktop />}
    </>
  );
}
