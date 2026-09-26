import { useTheme } from '@/context/ThemeContext';
import { useWindows } from '@/context/WindowsContext';
import { useShellUI } from '@/context/ShellUIContext';
import { APP_REGISTRY } from '@/apps/registry';
import WindowFrame from '@/components/shell/WindowFrame/WindowFrame';
import ModuleHost from '@/components/shell/ModuleHost/ModuleHost';
import TopBar from '@/components/shell/TopBar/TopBar';
import Taskbar from '@/components/shell/Taskbar/Taskbar';
import StartMenu from '@/components/shell/StartMenu/StartMenu';
import { WidgetsPanel } from '@/modules/widgets';
import { useIsMobile, useLocalStorage } from '@/lib/hooks';
import MobileNotice from '@/components/shell/MobileNotice/MobileNotice';

const FORCE_OS_ON_MOBILE_KEY = 'portfolio.forceOsOnMobile';

export default function Desktop() {
  const { theme } = useTheme();
  const { setViewMode } = useShellUI();
  const { windows, launchApp } = useWindows();
  const isMobile = useIsMobile();
  const [forceOsOnMobile, setForceOsOnMobile] = useLocalStorage(FORCE_OS_ON_MOBILE_KEY, false);

  // Global shortcuts + shared overlays (Spotlight, ContactModal) live in
  // AppShell so they keep working in Web view too.

  if (isMobile && !forceOsOnMobile) {
    return (
      <MobileNotice
        onUseWeb={() => setViewMode('web')}
        onEnterOs={() => setForceOsOnMobile(true)}
      />
    );
  }

  return (
    <div className="desktop-root">
      {/* Wallpaper dim overlay (Settings → Personalization → Wallpaper effects) */}
      <div className="wallpaper-dim" />
      <TopBar />
      <StartMenu />
      <WidgetsPanel />

      {/* Desktop icons */}
      <div className="desktop-area">
        <div className="absolute left-4 top-4 flex flex-col gap-2">
          {APP_REGISTRY.filter((app) => !app.system).map((app) => (
            <button
              key={app.id}
              className="flex flex-col items-center gap-1 w-20 p-2 rounded-xl hover:bg-white/10 transition-colors group"
              onDoubleClick={() => launchApp(app.id)}
              title={`${app.name} — double-click to open`}
            >
              <span
                className="w-11 h-11 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform"
                style={{ background: `${app.color}22`, border: `1px solid ${app.color}44`, color: app.color }}
              >
                <app.icon size={20} />
              </span>
              <span
                className="text-[10px] text-center leading-tight"
                style={{ color: 'var(--wp-fg-hi)', textShadow: 'var(--wp-fg-shadow)' }}
              >
                {app.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Windows */}
      {windows.map((win) => (
        <WindowFrame key={win.id} win={win}>
          <ModuleHost appId={win.appId} data={win.data} windowId={win.id} />
        </WindowFrame>
      ))}

      <Taskbar />

      {/* Home indicator (Settings → Taskbar, ported from ibiz_v2) */}
      {theme.showHomeIndicator && (
        <div className="absolute inset-x-0 bottom-1 flex justify-center pointer-events-none z-[60]">
          <div
            className="h-1 rounded-full"
            style={{ width: 134, background: 'var(--text-low)', opacity: 0.65 }}
          />
        </div>
      )}
    </div>
  );
}
