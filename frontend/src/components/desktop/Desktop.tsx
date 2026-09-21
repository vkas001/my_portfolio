import { useEffect } from 'react';
import { useOS } from '@/context/OSContext';
import { APP_REGISTRY } from '@/apps/registry';
import WindowFrame from '@/components/windows/WindowFrame';
import ModuleHost from '@/components/windows/ModuleHost';
import TopBar from './TopBar';
import Taskbar from './Taskbar';
import StartMenu from './StartMenu';
import Spotlight from './Spotlight';
import WidgetsPanel from '@/components/widgets/WidgetsPanel';
import ContactModal from '@/components/modals/ContactModal';
import { matchShortcut } from '@/lib/shortcuts';
import type { AppId } from '@/types';
import { useIsMobile } from '@/lib/hooks';
import MobileNotice from './MobileNotice';

export default function Desktop() {
  const {
    windows, focusedId, launchApp, setSpotlightOpen, setWidgetsOpen, widgetsOpen, closeWindow,
  } = useOS();
  const isMobile = useIsMobile();

  // Global keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const sc = matchShortcut(e);
      if (!sc) return;
      e.preventDefault();
      switch (sc.action) {
        case 'spotlight': setSpotlightOpen(true); break;
        case 'widgets': setWidgetsOpen(!widgetsOpen); break;
        case 'launch': launchApp(sc.payload as AppId); break;
        case 'close-focused': {
          if (focusedId) closeWindow(focusedId);
          break;
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [windows, widgetsOpen, focusedId, launchApp, setSpotlightOpen, setWidgetsOpen, closeWindow]);

  if (isMobile) return <MobileNotice />;

  return (
    <div className="desktop-root">
      <TopBar />
      <StartMenu />
      <Spotlight />
      <WidgetsPanel />
      <ContactModal />

      {/* Desktop icons */}
      <div className="desktop-area">
        <div className="absolute left-4 top-4 flex flex-col gap-2">
          {APP_REGISTRY.map((app) => (
            <button
              key={app.id}
              className="flex flex-col items-center gap-1 w-20 p-2 rounded-xl hover:bg-white/10 transition-colors group"
              onDoubleClick={() => launchApp(app.id)}
              title={`${app.name} — double-click to open`}
            >
              <span
                className="w-11 h-11 rounded-xl flex items-center justify-center text-xl group-hover:scale-105 transition-transform"
                style={{ background: `${app.color}22`, border: `1px solid ${app.color}44` }}
              >
                {app.icon}
              </span>
              <span className="text-[10px] text-center leading-tight" style={{ textShadow: '0 1px 4px rgba(0,0,0,.6)' }}>
                {app.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Windows */}
      {windows.map((win) => (
        <WindowFrame key={win.id} win={win}>
          <ModuleHost appId={win.appId} />
        </WindowFrame>
      ))}

      <Taskbar />
    </div>
  );
}
