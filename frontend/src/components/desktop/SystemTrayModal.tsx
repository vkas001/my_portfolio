// SystemTrayModal — verbatim ibiz_v2 markup (toggles, slider, status rows).
// Content adapted: Wi-Fi mock, sounds bound to theme, live backend probe,
// windows-open and theme rows in place of ibiz's domain-specific metrics.
import { useEffect, useState } from 'react';
import { Wifi, WifiOff, Volume2, VolumeX, Monitor, Moon, Sun, AppWindow, Server } from 'lucide-react';
import { useOS } from '@/context/OSContext';

interface SystemTrayModalProps {
  onClose: () => void;
}

export const SystemTrayModal: React.FC<SystemTrayModalProps> = ({ onClose }) => {
  const { theme, setTheme, windows } = useOS();
  const [wifiEnabled, setWifiEnabled] = useState(true);
  const [volume, setVolume] = useState(85);
  const [online, setOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine));
  const [backend, setBackend] = useState<'checking' | 'up' | 'down'>('checking');
  const [showBackendTip, setShowBackendTip] = useState(false);

  const soundEnabled = theme.soundsEnabled;

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      try {
        const base = import.meta.env.VITE_API_URL ?? '/api';
        const res = await fetch(`${base}/health`);
        if (!cancelled) setBackend(res.ok ? 'up' : 'down');
      } catch {
        if (!cancelled) setBackend('down');
      }
    };
    void check();
    const t = window.setInterval(check, 30000);
    return () => {
      cancelled = true;
      window.clearInterval(t);
    };
  }, []);

  return (
    <div className="tray-modal absolute right-2 bottom-[80px] w-80 max-w-[calc(100vw-24px)] bg-(--surface-80) backdrop-blur-3xl border border-(--border-60) radius-glass shadow-2xl p-5 text-(--text-primary) z-[80] animate-in fade-in slide-in-from-bottom-4 select-none">
      {/* Quick Toggles */}
      <div className="grid grid-cols-2 gap-2.5 mb-4">
        <button
          onClick={() => setWifiEnabled(!wifiEnabled)}
          className={`p-3 rounded-2xl border transition-all flex flex-col items-start gap-2 cursor-pointer ${
            wifiEnabled
              ? 'bg-(--accent-strong) border-(--accent-strong) text-(--on-accent) shadow-md'
              : 'bg-(--surface-50) border-(--border-60) text-(--text-muted)'
          }`}
        >
          {wifiEnabled ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
          <div className="text-left">
            <div className="text-[12px] font-bold">{online ? 'Online' : 'Offline'}</div>
            <div className="text-[10px] opacity-80">
              {wifiEnabled ? 'Connected' : 'Disconnected'}
            </div>
          </div>
        </button>

        <button
          onClick={() => setTheme({ soundsEnabled: !soundEnabled })}
          className={`p-3 rounded-2xl border transition-all flex flex-col items-start gap-2 cursor-pointer ${
            soundEnabled
              ? 'bg-(--accent-strong) border-(--accent-strong) text-(--on-accent) shadow-md'
              : 'bg-(--surface-50) border-(--border-60) text-(--text-muted)'
          }`}
        >
          {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          <div className="text-left">
            <div className="text-[12px] font-bold">Sounds</div>
            <div className="text-[10px] opacity-80">
              {soundEnabled ? `${volume}% Volume` : 'Muted'}
            </div>
          </div>
        </button>
      </div>

      {/* Volume Slider */}
      {soundEnabled && (
        <div className="mb-4 px-1">
          <div className="flex justify-between text-[11px] text-(--text-muted) mb-1">
            <span>System Volume</span>
            <span className="font-bold text-(--accent)">{volume}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-full h-1.5 bg-(--accent-strong)/20 rounded-lg appearance-none cursor-pointer accent-(--accent-strong)"
          />
        </div>
      )}

      {/* Status rows */}
      <div className="space-y-2 border-t border-(--text-primary)/10 pt-3">
        <div
          className="flex items-center justify-between text-[12px] relative"
          onMouseEnter={() => setShowBackendTip(true)}
          onMouseLeave={() => setShowBackendTip(false)}
        >
          <span className="flex items-center gap-2 text-(--text-secondary)">
            <Server className="w-4 h-4 text-(--accent-strong)" />
            Backend API
          </span>
          <span className="flex items-center gap-1.5 text-[11px] font-bold">
            <span
              className="w-2 h-2 rounded-full"
              style={{
                background: backend === 'up' ? 'var(--success)' : backend === 'down' ? 'var(--error)' : 'var(--warning)',
              }}
            />
            {backend === 'up' ? 'Connected' : backend === 'down' ? 'Unreachable' : 'Checking…'}
          </span>
          {showBackendTip && (
            <span className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-(--surface-80) border border-(--border-60) rounded-lg text-[11px] text-(--text-primary) whitespace-nowrap shadow-lg z-[100]">
              {backend === 'up' ? 'Backend connected' : backend === 'down' ? 'Backend disconnected' : 'Probing backend…'}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between text-[12px]">
          <span className="flex items-center gap-2 text-(--text-secondary)">
            <Monitor className="w-4 h-4 text-(--accent-strong)" />
            Windows open
          </span>
          <span className="text-[11px] font-bold text-(--text-secondary)">{windows.length}</span>
        </div>

        <div className="flex items-center justify-between text-[12px]">
          <span className="flex items-center gap-2 text-(--text-secondary)">
            {theme.mode === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            Theme
          </span>
          <span className="text-[11px] font-bold text-(--text-secondary) capitalize">
            {theme.mode} · {theme.accent}
          </span>
        </div>

        <div className="flex items-center justify-between text-[12px]">
          <span className="flex items-center gap-2 text-(--text-secondary)">
            <AppWindow className="w-4 h-4" />
            Taskbar
          </span>
          <span className="text-[11px] font-bold text-(--text-secondary) capitalize">
            {theme.taskbarStyle} · {theme.taskbarMode}
          </span>
        </div>
      </div>

      {/* Footer close */}
      <div className="mt-4 pt-3 border-t border-(--text-primary)/10 flex justify-end">
        <button
          onClick={onClose}
          className="text-[12px] font-bold text-(--accent-strong) hover:underline cursor-pointer"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
};

export default SystemTrayModal;
