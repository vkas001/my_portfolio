// SystemTrayModal — verbatim ibiz_v2 markup (toggles, slider, status rows).
// Content adapted: sounds bound to theme, windows-open and theme rows in
// place of ibiz's domain-specific metrics.
import { useEffect, useState } from 'react';
import { Volume2, VolumeX, Monitor, Moon, Sun, AppWindow, RotateCcw } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useWindows } from '@/context/WindowsContext';
import { taskbarBottomInset, Z_TASKBAR } from '@/lib/osLayout';

interface SystemTrayModalProps {
  onClose: () => void;
}

export const SystemTrayModal: React.FC<SystemTrayModalProps> = ({ onClose }) => {
  const { theme, setTheme, resetTheme } = useTheme();
  const { windows } = useWindows();
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

  const soundEnabled = theme.soundsEnabled;
  const muted = !soundEnabled || theme.volume <= 0;

  return (
    <div
      data-tray
      // Anchored to the viewport, not the bar: `taskbarBottomInset` is the
      // measured distance from the screen bottom to the top of the bar, so the
      // panel clears the Windows bar, the padded macOS dock and the autohide
      // bar alike. A literal offset overlaps the dock in macOS style.
      className="tray-modal fixed right-2 w-80 max-w-[calc(100vw-24px)] bg-(--surface-80) backdrop-blur-3xl border border-(--border-60) radius-glass shadow-2xl p-5 text-(--text-primary) animate-in fade-in slide-in-from-bottom-4 select-none"
      style={{ bottom: taskbarBottomInset(theme), zIndex: Z_TASKBAR }}
    >
      {/* Quick Toggles */}
      <div className="grid grid-cols-2 gap-2.5 mb-4">
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
