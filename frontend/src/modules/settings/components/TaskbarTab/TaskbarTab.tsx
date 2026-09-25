import { AppWindow, ChevronDown, ChevronUp, LayoutGrid, Monitor, Plus, Rocket, Trash2 } from 'lucide-react';
import type { ThemeState } from '@/styles/theme';
import { APP_REGISTRY } from '@/apps/registry';
import SectionCard from '@/components/ui/SectionCard/SectionCard';
import { SegmentedControl, SettingRow, Toggle } from '@/modules/settings/components/primitives';
import { TASKBAR_MODE_OPTIONS, TASKBAR_STYLE_OPTIONS } from '@/modules/settings/lib/options';
import type { SetTheme } from '@/modules/settings/lib/types';

export default function TaskbarTab({ theme, setTheme }: { theme: ThemeState; setTheme: SetTheme }) {
  const pinned = theme.taskbarApps;
  const available = APP_REGISTRY.filter((a) => !a.system && !pinned.includes(a.id));

  const add = (id: string) => setTheme({ taskbarApps: [...pinned, id] });
  const remove = (id: string) => setTheme({ taskbarApps: pinned.filter((x) => x !== id) });
  const move = (id: string, dir: -1 | 1) => {
    const i = pinned.indexOf(id);
    const j = i + dir;
    if (i === -1 || j < 0 || j >= pinned.length) return;
    const next = [...pinned];
    [next[i], next[j]] = [next[j], next[i]];
    setTheme({ taskbarApps: next });
  };

  return (
    <>
      <SectionCard title="Taskbar mode" icon={<Monitor size={13} />}>
        <SegmentedControl
          value={theme.taskbarMode}
          options={TASKBAR_MODE_OPTIONS}
          onChange={(v) => setTheme({ taskbarMode: v })}
        />
        <p className="text-[11px] mt-2" style={{ color: 'var(--text-low)' }}>
          Auto-hide slides the taskbar away until you hover the bottom edge (or press Ctrl+T).
        </p>
      </SectionCard>

      <SectionCard title="Taskbar style" icon={<AppWindow size={13} />}>
        <SegmentedControl
          value={theme.taskbarStyle}
          options={TASKBAR_STYLE_OPTIONS}
          onChange={(v) => setTheme({ taskbarStyle: v })}
        />
        <p className="text-[11px] mt-2" style={{ color: 'var(--text-low)' }}>
          Windows fills the bottom edge; macOS floats a centered dock.
        </p>
      </SectionCard>

      <SectionCard title="Home indicator" icon={<LayoutGrid size={13} />}>
        <SettingRow label="Home indicator" description="iPad-style home bar at the bottom of the screen">
          <Toggle enabled={theme.showHomeIndicator} onChange={(v) => setTheme({ showHomeIndicator: v })} />
        </SettingRow>
      </SectionCard>

      <SectionCard title="Pinned apps (left section)" icon={<LayoutGrid size={13} />}>
        {pinned.length === 0 ? (
          <p className="text-[12px]" style={{ color: 'var(--text-low)' }}>Nothing pinned.</p>
        ) : (
          <div className="grid grid-cols-12 gap-2 mb-3">
            {pinned.map((id, i) => {
              const app = APP_REGISTRY.find((a) => a.id === id);
              return (
                <div
                  key={id}
                  className="col-span-12 @md:col-span-6 flex items-center gap-2 p-2 rounded-[var(--radius-sm)] border"
                  style={{ background: 'var(--accent-soft)', borderColor: 'var(--border)' }}
                >
                  <span className="leading-none shrink-0 inline-flex" style={{ color: app?.color }}>
                    {app ? <app.icon size={16} /> : '·'}
                  </span>
                  <span className="text-[12px] font-bold flex-1 min-w-0 truncate" style={{ color: 'var(--text-hi)' }}>
                    {app?.name ?? id}
                  </span>
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      onClick={() => move(id, -1)} disabled={i === 0}
                      className="flex items-center justify-center w-7 h-7 rounded-lg cursor-pointer disabled:opacity-30"
                      style={{ color: 'var(--text-mid)' }} title="Move left"
                    >
                      <ChevronUp size={13} />
                    </button>
                    <button
                      onClick={() => move(id, 1)} disabled={i === pinned.length - 1}
                      className="flex items-center justify-center w-7 h-7 rounded-lg cursor-pointer disabled:opacity-30"
                      style={{ color: 'var(--text-mid)' }} title="Move right"
                    >
                      <ChevronDown size={13} />
                    </button>
                    <button
                      onClick={() => remove(id)}
                      className="flex items-center justify-center w-7 h-7 rounded-lg cursor-pointer"
                      style={{ color: 'var(--error)' }} title="Remove from taskbar"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {available.length > 0 && (
          <>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-low)' }}>
              Add from catalog
            </p>
            <div className="grid grid-cols-12 gap-2">
              {available.map((a) => (
                <button
                  key={a.id}
                  onClick={() => add(a.id)}
                  className="col-span-12 @md:col-span-6 flex items-center gap-2 p-2 rounded-[var(--radius-sm)] border transition-all cursor-pointer text-left"
                  style={{ background: 'var(--accent-soft)', borderColor: 'var(--border)' }}
                >
                  <span className="leading-none shrink-0 inline-flex" style={{ color: a.color }}>
                    <a.icon size={16} />
                  </span>
                  <span className="text-[12px] font-bold flex-1 min-w-0 truncate" style={{ color: 'var(--text-hi)' }}>
                    {a.name}
                  </span>
                  <Plus size={13} style={{ color: 'var(--accent)' }} className="shrink-0" />
                </button>
              ))}
            </div>
          </>
        )}
      </SectionCard>

      <SectionCard title="Startup apps" icon={<Rocket size={13} />}>
        <p className="text-[12px] mb-3" style={{ color: 'var(--text-low)' }}>
          Apps that open automatically when the desktop loads.
        </p>
        <div className="grid grid-cols-12 gap-x-4">
          {APP_REGISTRY.filter((app) => !app.system).map((app) => (
            <div key={app.id} className="col-span-12 @md:col-span-6">
            <SettingRow label={app.name}>
              <Toggle
                enabled={theme.startupWindows.includes(app.id)}
                onChange={(v) => setTheme({
                  startupWindows: v
                    ? [...theme.startupWindows, app.id]
                    : theme.startupWindows.filter((id) => id !== app.id),
                })}
              />
            </SettingRow>
            </div>
          ))}
        </div>
      </SectionCard>
    </>
  );
}