import { useEffect, useState } from 'react';
import { Wifi, WifiOff, Volume2, VolumeX, Monitor, Moon, Sun, AppWindow, X } from 'lucide-react';
import { useOS } from '@/context/OSContext';

// Quick-settings tray modal, adapted from ibiz_v2 SystemTrayModal.
// Single-user portfolio: wifi toggle is a local mock, sound toggles theme.soundsEnabled.
export default function SystemTrayModal({ onClose }: { onClose: () => void }) {
  const { theme, setTheme, windows } = useOS();
  const [wifiEnabled, setWifiEnabled] = useState(true);
  const [volume, setVolume] = useState(85);
  const [online, setOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine));

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

  const soundOn = theme.soundsEnabled;

  return (
    <div
      className="tray-modal absolute right-2 bottom-[68px] w-80 max-w-[calc(100vw-24px)] p-5 z-[80] fade-in select-none"
      style={{
        background: 'var(--bg-elev)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-window)',
        color: 'var(--text-hi)',
      }}
      role="dialog"
      aria-label="Quick settings"
    >
      <div className="grid grid-cols-2 gap-2.5 mb-4">
        <button
          onClick={() => setWifiEnabled((v) => !v)}
          className="p-3 rounded-[var(--radius)] border transition-all flex flex-col items-start gap-2 cursor-pointer text-left"
          style={
            wifiEnabled
              ? { background: 'var(--accent)', borderColor: 'var(--accent)', color: 'var(--accent-text-on)' }
              : { background: 'var(--accent-soft)', borderColor: 'var(--border)', color: 'var(--text-mid)' }
          }
        >
          {wifiEnabled ? <Wifi size={20} /> : <WifiOff size={20} />}
          <div>
            <div className="text-[12px] font-bold">{online ? 'Online' : 'Offline'}</div>
            <div className="text-[10px] opacity-80">{wifiEnabled ? 'Connected' : 'Disconnected'}</div>
          </div>
        </button>

        <button
          onClick={() => setTheme({ soundsEnabled: !soundOn })}
          className="p-3 rounded-[var(--radius)] border transition-all flex flex-col items-start gap-2 cursor-pointer text-left"
          style={
            soundOn
              ? { background: 'var(--accent)', borderColor: 'var(--accent)', color: 'var(--accent-text-on)' }
              : { background: 'var(--accent-soft)', borderColor: 'var(--border)', color: 'var(--text-mid)' }
          }
        >
          {soundOn ? <Volume2 size={20} /> : <VolumeX size={20} />}
          <div>
            <div className="text-[12px] font-bold">Sounds</div>
            <div className="text-[10px] opacity-80">{soundOn ? `${volume}% Volume` : 'Muted'}</div>
          </div>
        </button>
      </div>

      {soundOn && (
        <div className="mb-4 px-1">
          <div className="flex justify-between text-[11px] mb-1" style={{ color: 'var(--text-low)' }}>
            <span>System volume</span>
            <span className="font-bold" style={{ color: 'var(--accent)' }}>{volume}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-full cursor-pointer"
            style={{ accentColor: 'var(--accent)' }}
          />
        </div>
      )}

      <div className="space-y-2 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between text-[12px]">
          <span className="flex items-center gap-2" style={{ color: 'var(--text-mid)' }}>
            <Monitor size={14} style={{ color: 'var(--accent)' }} />
            Windows open
          </span>
          <span className="text-[11px] font-bold">{windows.length}</span>
        </div>
        <div className="flex items-center justify-between text-[12px]">
          <span className="flex items-center gap-2" style={{ color: 'var(--text-mid)' }}>
            {theme.mode === 'dark' ? <Moon size={14} /> : <Sun size={14} />}
            Theme
          </span>
          <span className="text-[11px] font-bold capitalize">{theme.mode} · {theme.accent}</span>
        </div>
        <div className="flex items-center justify-between text-[12px]">
          <span className="flex items-center gap-2" style={{ color: 'var(--text-mid)' }}>
            <AppWindow size={14} />
            Taskbar
          </span>
          <span className="text-[11px] font-bold capitalize">{theme.taskbarStyle} · {theme.taskbarMode}</span>
        </div>
      </div>

      <div className="mt-4 pt-3 flex justify-end" style={{ borderTop: '1px solid var(--border)' }}>
        <button
          onClick={onClose}
          className="flex items-center gap-1 text-[12px] font-bold cursor-pointer"
          style={{ color: 'var(--accent)' }}
        >
          <X size={12} /> Dismiss
        </button>
      </div>
    </div>
  );
}
