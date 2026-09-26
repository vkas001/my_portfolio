// SystemTrayModal — verbatim ibiz_v2 markup (toggles, slider, status rows).
// Content adapted: Wi-Fi mock, sounds bound to theme, live backend probe,
// windows-open and theme rows in place of ibiz's domain-specific metrics.
import { useEffect, useState } from 'react';
import { Wifi, Plane, Volume2, VolumeX, Monitor, Moon, Sun, AppWindow, Server, RadioTower, RotateCcw } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useWindows } from '@/context/WindowsContext';
import { readNetworkInfo, type NetworkInfo } from '@/lib/network';

interface SystemTrayModalProps {
  onClose: () => void;
}

export const SystemTrayModal: React.FC<SystemTrayModalProps> = ({ onClose }) => {
  const { theme, setTheme, resetTheme } = useTheme();
  const { windows } = useWindows();
  const [online, setOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine));
  const [backend, setBackend] = useState<'checking' | 'up' | 'down'>('checking');
  const [showBackendTip, setShowBackendTip] = useState(false);
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo | null>(readNetworkInfo);
  // Two-step reset: first click arms it, the second executes (clears theme +
  // widgets). Auto-disarms after 3s so a stray arm can't be triggered later.
  const [resetArmed, setResetArmed] = useState(false);

  const handleReset = () => {
    if (!resetArmed) {
      setResetArmed(true);
      return;
    }
    resetTheme();
    onClose();
  };

  useEffect(() => {
    if (!resetArmed) return;
    const t = window.setTimeout(() => setResetArmed(false), 3000);
    return () => window.clearTimeout(t);
  }, [resetArmed]);

  const airplane = theme.airplaneMode;
  const soundEnabled = theme.soundsEnabled;
  const muted = !soundEnabled || theme.volume <= 0;
  const effectiveOnline = online && !airplane;

  // Live connectivity readout — the Network Information API reports both the
  // link type (Wi-Fi/Ethernet/Cellular) and effective bandwidth, and fires
  // `change` when the connection shifts. Read-only: web pages cannot name,
  // enumerate, or control networks.
  useEffect(() => {
    const n = (navigator as unknown as { connection?: EventTarget }).connection;
    if (!n) return;
    const onChange = () => setNetworkInfo(readNetworkInfo());
    n.addEventListener('change', onChange);
    return () => n.removeEventListener('change', onChange);
  }, []);

  const typeLabel =
    networkInfo?.type === 'wifi'
      ? 'Wi-Fi'
      : networkInfo?.type === 'ethernet'
        ? 'Ethernet'
        : networkInfo?.type === 'cellular'
          ? 'Cellular'
          : 'Unknown';

  // `type` is often 'unknown' on desktop browsers (the API was built for
  // mobile), so fall back to the signals that ARE real everywhere: navigator
  // online state + effectiveType/downlink. This keeps a truthful readout
  // instead of dead-ending on an empty "No link detected".
  const linkSpeed = networkInfo && networkInfo.downlinkMbps > 0 ? ` · ~${Math.round(networkInfo.downlinkMbps * 10) / 10} Mbps` : '';
  const linkRate = networkInfo && networkInfo.effectiveType && networkInfo.effectiveType !== 'unknown' ? ` (${networkInfo.effectiveType.toUpperCase()})` : '';
  const knownLink = !!networkInfo && networkInfo.type !== 'unknown' && networkInfo.type !== 'none';

  const netStatus = airplane
    ? 'Off (airplane)'
    : !online
      ? 'Offline · no network'
      : knownLink
        ? `${typeLabel}${linkSpeed}`
        : networkInfo && networkInfo.downlinkMbps > 0
          ? `Connected${linkSpeed}${linkRate}`
          : 'Connected';

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
    <div
      data-tray
      className="tray-modal absolute right-2 bottom-[80px] w-80 max-w-[calc(100vw-24px)] bg-(--surface-80) backdrop-blur-3xl border border-(--border-60) radius-glass shadow-2xl p-5 text-(--text-primary) z-[80] animate-in fade-in slide-in-from-bottom-4 select-none"
    >
      {/* Quick Toggles */}
      <div className="grid grid-cols-2 gap-2.5 mb-4">
        <button
          onClick={() => setTheme({ airplaneMode: !airplane })}
          className={`p-3 rounded-2xl border transition-all flex flex-col items-start gap-2 cursor-pointer ${
            airplane
              ? 'bg-(--accent-strong) border-(--accent-strong) text-(--on-accent) shadow-md'
              : 'bg-(--surface-50) border-(--border-60) text-(--text-muted)'
          }`}
        >
          {airplane ? <Plane className="w-5 h-5" /> : <Wifi className="w-5 h-5" />}
          <div className="text-left">
            <div className="text-[12px] font-bold">{airplane ? 'Airplane Mode' : effectiveOnline ? 'Online' : 'Offline'}</div>
            <div className="text-[10px] opacity-80">
              {airplane ? 'Connections off' : effectiveOnline ? 'Connected' : 'No connection'}
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
              {muted ? 'Muted' : `${theme.volume}% Volume`}
            </div>
          </div>
        </button>
      </div>

      {/* Volume Slider */}
      {soundEnabled && (
        <div className="mb-4 px-1">
          <div className="flex justify-between text-[11px] text-(--text-muted) mb-1">
            <span>UI Volume</span>
            <span className="font-bold text-(--accent)">{theme.volume}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={theme.volume}
            onChange={(e) => setTheme((prev) => ({ ...prev, volume: Number(e.target.value) }))}
            className="w-full h-1.5 bg-(--accent-strong)/20 rounded-lg appearance-none cursor-pointer accent-(--accent-strong)"
          />
        </div>
      )}

      {/* Status rows */}
      <div className="space-y-2 border-t border-(--text-primary)/10 pt-3">
        {networkInfo && (
          <div className="flex items-center justify-between text-[12px]">
            <span className="flex items-center gap-2 text-(--text-secondary)">
              <RadioTower className="w-4 h-4 text-(--accent-strong)" />
              Network
              {networkInfo.saveData && <span className="text-[10px] opacity-70 uppercase tracking-wide">Data saver</span>}
            </span>
            <span className="text-[11px] font-bold text-(--text-secondary)">
              {netStatus}
            </span>
          </div>
        )}

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

      {/* Footer actions */}
      <div className="mt-4 pt-3 border-t border-(--text-primary)/10 flex items-center justify-between">
        <button
          onClick={handleReset}
          className={`flex items-center gap-1.5 text-[12px] font-bold transition-all cursor-pointer ${
            resetArmed ? 'text-(--error)' : 'text-(--text-secondary) hover:text-(--error)'
          } ${resetArmed ? 'px-0' : 'px-2 py-1 -ml-2 rounded-lg hover:bg-(--surface-50)'}`}
          title="Restore theme and widgets to default settings"
        >
          <RotateCcw size={13} />
          {resetArmed ? 'Confirm reset?' : 'Reset settings'}
        </button>
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
