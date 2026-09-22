import { useRef, useState } from 'react';
import {
  Palette, SlidersHorizontal, Blocks, Keyboard, RotateCcw, Settings as SettingsIcon,
  Sun, Type, LayoutGrid, Sparkles, Plus, Trash2, Monitor, AppWindow, Rocket,
  Clock, Download, Upload, ChevronUp, ChevronDown, FileJson,
} from 'lucide-react';
import { useOS } from '@/context/OSContext';
import {
  ACCENTS, ACCENTS_DARK, BLUR_LEVELS, DENSITY_SPACING, FONTS, GLASS_LEVELS, RADIUS_LEVELS, WALLPAPERS,
  type BlurLevel, type ClockFormat, type DateFormat, type Density, type FontName, type GridSize,
  type GlassLevel, type RadiusLevel, type TaskbarMode, type TaskbarStyle, type ThemeMode,
  type ThemeState,
} from '@/theme';
import { APP_REGISTRY } from '@/apps/registry';
import { WIDGET_DEFS } from '@/components/widgets/registry';
import { SHORTCUTS } from '@/lib/shortcuts';
import { RangeControl, SectionCard, SegmentedControl, SettingRow, SubLabel, Toggle } from '@/components/settings/primitives';

const TABS = [
  { id: 'personalization', label: 'Personalization', icon: <Palette size={15} /> },
  { id: 'interface', label: 'Interface', icon: <SlidersHorizontal size={15} /> },
  { id: 'taskbar', label: 'Taskbar', icon: <Monitor size={15} /> },
  { id: 'time', label: 'Time', icon: <Clock size={15} /> },
  { id: 'widgets', label: 'Widgets', icon: <Blocks size={15} /> },
  { id: 'shortcuts', label: 'Shortcuts', icon: <Keyboard size={15} /> },
  { id: 'data', label: 'Data', icon: <FileJson size={15} /> },
  { id: 'reset', label: 'Reset', icon: <RotateCcw size={15} /> },
] as const;

type TabId = (typeof TABS)[number]['id'];

const MODE_OPTIONS: { value: ThemeMode; label: string }[] = [
  { value: 'light', label: '☀️ Light' },
  { value: 'dark', label: '🌙 Dark' },
];

const GLASS_OPTIONS = (Object.keys(GLASS_LEVELS) as GlassLevel[]).map((v) => ({
  value: v, label: v[0].toUpperCase() + v.slice(1),
}));

const BLUR_OPTIONS = (Object.keys(BLUR_LEVELS) as BlurLevel[]).map((v) => ({
  value: v, label: v[0].toUpperCase() + v.slice(1),
}));

const RADIUS_OPTIONS = (Object.keys(RADIUS_LEVELS) as RadiusLevel[]).map((v) => ({
  value: v, label: v[0].toUpperCase() + v.slice(1),
}));

const TASKBAR_MODE_OPTIONS: { value: TaskbarMode; label: string }[] = [
  { value: 'always', label: 'Always visible' },
  { value: 'auto-hide', label: 'Auto-hide' },
];

const TASKBAR_STYLE_OPTIONS: { value: TaskbarStyle; label: string }[] = [
  { value: 'windows', label: '🪟 Windows' },
  { value: 'macos', label: ' macOS' },
];

const CLOCK_OPTIONS: { value: ClockFormat; label: string }[] = [
  { value: '12h', label: '12-hour' },
  { value: '24h', label: '24-hour' },
];

const DATE_OPTIONS: { value: DateFormat; label: string }[] = [
  { value: 'short', label: 'Short (Sep 21, 2026)' },
  { value: 'long', label: 'Long (Sunday, September 21, 2026)' },
];

const TAB_DESCRIPTIONS: Record<TabId, string> = {
  personalization: 'Accent color, mode, glass, wallpaper',
  interface: 'Font, effects and behavior',
  taskbar: 'Mode, style, pinned and startup apps',
  time: 'Clock and date formatting',
  widgets: 'Manage widgets on the desktop',
  shortcuts: 'Keyboard shortcuts at a glance',
  data: 'Export or import your full theme',
  reset: 'Restore default theme and widgets',
};

export default function Settings() {
  const {
    theme, setTheme, resetTheme,
    widgetPlacements, addWidget, removeWidget,
  } = useOS();
  const [activeTab, setActiveTab] = useState<TabId>('personalization');
  const tabMeta = TABS.find((t) => t.id === activeTab) ?? TABS[0];

  const isDark = theme.mode === 'dark';
  const palette = isDark ? ACCENTS_DARK : ACCENTS;

  return (
    <div className="flex h-full select-none">
      {/* Sidebar — ported from ibiz_v2 SettingsWindow aside */}
      <aside
        className="w-44 shrink-0 border-r flex flex-col gap-1 p-2 overflow-y-auto"
        style={{ borderColor: 'var(--border)', background: 'var(--bg-elev)' }}
      >
        <div className="px-2 pb-2 pt-1">
          <h2 className="text-[13px] font-bold flex items-center gap-2" style={{ color: 'var(--accent)' }}>
            <SettingsIcon size={14} />
            <span>Settings</span>
          </h2>
        </div>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius-sm)] text-[12px] font-semibold whitespace-nowrap text-left transition-all cursor-pointer"
            style={
              activeTab === tab.id
                ? { background: 'var(--accent-soft)', color: 'var(--accent)' }
                : { color: 'var(--text-mid)' }
            }
          >
            {tab.icon}
            <span className="truncate">{tab.label}</span>
          </button>
        ))}
      </aside>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[640px] flex flex-col gap-5 p-5">
          <div>
            <h2 className="text-[18px] font-bold flex items-center gap-2" style={{ color: 'var(--accent)' }}>
              {tabMeta.icon}
              <span>{tabMeta.label}</span>
            </h2>
            <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-low)' }}>
              {TAB_DESCRIPTIONS[activeTab]}
            </p>
          </div>

          {activeTab === 'personalization' && (
            <PersonalizationTab isDark={isDark} palette={palette} theme={theme} setTheme={setTheme} />
          )}
          {activeTab === 'interface' && <InterfaceTab theme={theme} setTheme={setTheme} />}
          {activeTab === 'taskbar' && <TaskbarTab theme={theme} setTheme={setTheme} />}
          {activeTab === 'time' && <TimeTab theme={theme} setTheme={setTheme} />}
          {activeTab === 'widgets' && (
            <WidgetsTab widgetPlacements={widgetPlacements} addWidget={addWidget} removeWidget={removeWidget} />
          )}
          {activeTab === 'shortcuts' && <ShortcutsTab />}
          {activeTab === 'data' && <DataTab theme={theme} setTheme={setTheme} resetTheme={resetTheme} />}
          {activeTab === 'reset' && <ResetTab resetTheme={resetTheme} />}
        </div>
      </div>
    </div>
  );
}

type SetTheme = (patch: Partial<ThemeState>) => void;

// ─── Personalization ────────────────────────────────────────────────────────
function PersonalizationTab({ isDark, palette, theme, setTheme }: {
  isDark: boolean;
  palette: typeof ACCENTS;
  theme: ThemeState;
  setTheme: SetTheme;
}) {
  return (
    <>
      <SectionCard title="Theme mode" icon={<Sun size={13} />}>
        <SegmentedControl
          value={theme.mode}
          options={MODE_OPTIONS}
          onChange={(v) => setTheme({ mode: v })}
        />
      </SectionCard>

      {/* Accent color — grid with per-mode swatches + custom picker */}
      <SectionCard title="Accent color" icon={<Palette size={13} />}>
        <p className="text-[11px] mb-2.5" style={{ color: 'var(--text-low)' }}>
          {isDark ? 'Light tints, tuned for dark glass' : 'Deep tones, tuned for light surfaces'}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {palette.map((a) => {
            const isSelected = theme.accent === a.name;
            return (
              <button
                key={a.name}
                aria-pressed={isSelected}
                onClick={() => setTheme({ accent: a.name, customAccent: null })}
                className="flex items-center gap-2 p-2 rounded-[var(--radius-sm)] border transition-all cursor-pointer"
                style={
                  isSelected
                    ? { borderColor: 'var(--accent)', boxShadow: '0 0 0 2px var(--accent-soft)', background: 'var(--accent-soft)' }
                    : { borderColor: 'var(--border)' }
                }
              >
                <div
                  className="w-6 h-6 rounded-full shrink-0"
                  style={{ backgroundColor: a.base, border: '1px solid var(--border)' }}
                />
                <span className="text-[12px] font-bold" style={{ color: 'var(--text-hi)' }}>
                  {a.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Custom accent — ported from ibiz_v2 customAccent color input */}
        <div className="mt-3 pt-3 flex flex-wrap items-center gap-3" style={{ borderTop: '1px solid var(--border)' }}>
          <label
            className="flex items-center gap-2 p-2 rounded-[var(--radius-sm)] border cursor-pointer"
            style={
              theme.customAccent
                ? { borderColor: 'var(--accent)', boxShadow: '0 0 0 2px var(--accent-soft)', background: 'var(--accent-soft)' }
                : { borderColor: 'var(--border)' }
            }
          >
            <input
              type="color"
              value={theme.customAccent ?? '#3b82f6'}
              onChange={(e) => setTheme({ customAccent: e.target.value })}
              className="w-6 h-6 rounded-full bg-transparent border-0 p-0 cursor-pointer"
            />
            <span className="text-[12px] font-bold" style={{ color: 'var(--text-hi)' }}>
              Custom
            </span>
          </label>
          {theme.customAccent && (
            <button
              onClick={() => setTheme({ customAccent: null })}
              className="px-3 py-1.5 rounded-[var(--radius-sm)] text-[11px] font-bold transition-all cursor-pointer"
              style={{ background: 'var(--accent-soft)', color: 'var(--text-mid)' }}
            >
              Use preset
            </button>
          )}
        </div>
      </SectionCard>

      <SectionCard title="Glass & effects" icon={<Sparkles size={13} />}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <SubLabel>Glass</SubLabel>
            <SegmentedControl value={theme.glass} options={GLASS_OPTIONS} onChange={(v) => setTheme({ glass: v })} />
          </div>
          <div>
            <SubLabel>Blur</SubLabel>
            <SegmentedControl value={theme.blur} options={BLUR_OPTIONS} onChange={(v) => setTheme({ blur: v })} />
          </div>
          <div>
            <SubLabel>Corners</SubLabel>
            <SegmentedControl value={theme.radius} options={RADIUS_OPTIONS} onChange={(v) => setTheme({ radius: v })} />
          </div>
        </div>
      </SectionCard>

      {/* Wallpaper picker */}
      <SectionCard title="Wallpaper" icon={<LayoutGrid size={13} />}>
        <div className="grid grid-cols-4 gap-2">
          {WALLPAPERS.map((w) => (
            <button
              key={w.id}
              className="h-16 rounded-[var(--radius-sm)] relative overflow-hidden transition-transform hover:scale-[1.03]"
              style={{
                background: w.css.startsWith('var(') ? 'var(--wp-accent-dark)' : w.css,
                border: theme.wallpaper === w.id ? '2px solid var(--accent)' : '1px solid var(--border)',
              }}
              onClick={() => setTheme({ wallpaper: w.id })}
              title={w.label}
            >
              <span
                className="absolute bottom-1 left-1 right-1 text-[9px] truncate text-left"
                style={{ color: '#fff', textShadow: '0 1px 3px rgba(0,0,0,.8)' }}
              >
                {w.label}
              </span>
            </button>
          ))}
        </div>
      </SectionCard>

      {/* Wallpaper effects — ported from ibiz_v2 RangeControls */}
      <SectionCard title="Wallpaper effects" icon={<Sparkles size={13} />}>
        <SubLabel>Dim level</SubLabel>
        <SegmentedControl
          value={theme.wallpaperDim}
          options={[0, 10, 20, 30, 40, 50, 60].map((v) => ({ value: v, label: `${v}%` }))}
          onChange={(v) => setTheme({ wallpaperDim: v })}
        />
        <div className="h-3" />
        <SubLabel>Blur level</SubLabel>
        <SegmentedControl
          value={theme.wallpaperBlur}
          options={[0, 5, 10, 15, 20, 25].map((v) => ({ value: v, label: `${v}px` }))}
          onChange={(v) => setTheme({ wallpaperBlur: v })}
        />
      </SectionCard>
    </>
  );
}

// ─── Interface — ported from ibiz_v2 InterfacePanel ──────────────────────────
function InterfaceTab({ theme, setTheme }: { theme: ThemeState; setTheme: SetTheme }) {
  const DENSITY_OPTIONS = (Object.keys(DENSITY_SPACING) as Density[]).map((v) => ({
    value: v, label: v[0].toUpperCase() + v.slice(1),
  }));
  return (
    <>
    <SectionCard title="Interface" icon={<Type size={13} />}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <SubLabel>Density</SubLabel>
          <SegmentedControl value={theme.density} options={DENSITY_OPTIONS} onChange={(v) => setTheme({ density: v })} />
        </div>
        <div>
          <SubLabel icon={<LayoutGrid size={12} />}>Desktop grid</SubLabel>
          <SegmentedControl
            value={theme.gridSize}
            options={([16, 24, 32] as GridSize[]).map((v) => ({ value: v, label: String(v) }))}
            onChange={(v) => setTheme({ gridSize: v })}
          />
        </div>
      </div>

      <SubLabel icon={<Type size={12} />}>Font family</SubLabel>
      <div className="flex flex-wrap gap-2 mb-4">
        {FONTS.map((f) => (
          <button
            key={f.name}
            className="px-3 py-1.5 rounded-[var(--radius-sm)] text-[12px] font-bold transition-all cursor-pointer"
            style={
              theme.font === f.name
                ? { background: 'var(--accent)', color: 'var(--accent-text-on)' }
                : { background: 'var(--accent-soft)', color: 'var(--text-mid)', fontFamily: f.stack }
            }
            onClick={() => setTheme({ font: f.name as FontName })}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
        <SettingRow label="Animations" description="Window open/close and hover effects">
          <Toggle enabled={theme.animationsEnabled} onChange={(v) => setTheme({ animationsEnabled: v })} />
        </SettingRow>
        <SettingRow label="Sounds" description="UI sounds for window and widget actions">
          <Toggle enabled={theme.soundsEnabled} onChange={(v) => setTheme({ soundsEnabled: v })} />
        </SettingRow>
        <SettingRow label="Top bar" description="Show the top status bar">
          <Toggle enabled={theme.showTopBar} onChange={(v) => setTheme({ showTopBar: v })} />
        </SettingRow>
      </div>

      <div className="pt-2 mt-2" style={{ borderTop: '1px solid var(--border)' }}>
        <RangeControl
          label="Window opacity"
          value={theme.windowOpacity}
          min={0.5} max={1} step={0.05}
          display={`${Math.round(theme.windowOpacity * 100)}%`}
          onChange={(v) => setTheme({ windowOpacity: v })}
        />
      </div>
    </SectionCard>
    </>
  );
}

// ─── Taskbar — ported from ibiz_v2 TaskbarPanel ─────────────────────────────
function TaskbarTab({ theme, setTheme }: { theme: ThemeState; setTheme: SetTheme }) {
  const pinned = theme.taskbarApps;
  const available = APP_REGISTRY.filter((a) => !pinned.includes(a.id));

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
          Auto-hide collapses the taskbar to a thin strip until you hover it.
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

      {/* Pinned apps with reorder — ported app-card grid */}
      <SectionCard title="Pinned apps (left section)" icon={<LayoutGrid size={13} />}>
        {pinned.length === 0 ? (
          <p className="text-[12px]" style={{ color: 'var(--text-low)' }}>Nothing pinned.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
            {pinned.map((id, i) => {
              const app = APP_REGISTRY.find((a) => a.id === id);
              return (
                <div
                  key={id}
                  className="flex items-center gap-2 p-2 rounded-[var(--radius-sm)] border"
                  style={{ background: 'var(--accent-soft)', borderColor: 'var(--border)' }}
                >
                  <span className="text-base leading-none shrink-0">{app?.icon ?? '·'}</span>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {available.map((a) => (
                <button
                  key={a.id}
                  onClick={() => add(a.id)}
                  className="flex items-center gap-2 p-2 rounded-[var(--radius-sm)] border transition-all cursor-pointer text-left"
                  style={{ background: 'var(--accent-soft)', borderColor: 'var(--border)' }}
                >
                  <span className="text-base leading-none shrink-0">{a.icon}</span>
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

      {/* Startup apps — ported from ibiz_v2 startupApps toggles */}
      <SectionCard title="Startup apps" icon={<Rocket size={13} />}>
        <p className="text-[12px] mb-3" style={{ color: 'var(--text-low)' }}>
          Apps that open automatically when the desktop loads.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          {APP_REGISTRY.map((app) => (
            <SettingRow key={app.id} label={app.name}>
              <Toggle
                enabled={theme.startupWindows.includes(app.id)}
                onChange={(v) => setTheme({
                  startupWindows: v
                    ? [...theme.startupWindows, app.id]
                    : theme.startupWindows.filter((id) => id !== app.id),
                })}
              />
            </SettingRow>
          ))}
        </div>
      </SectionCard>
    </>
  );
}

// ─── Time — ported from ibiz_v2 TimePanel ───────────────────────────────────
function TimeTab({ theme, setTheme }: { theme: ThemeState; setTheme: SetTheme }) {
  return (
    <SectionCard title="Clock formatting" icon={<Clock size={13} />}>
      <SubLabel icon={<Clock size={12} />}>Clock format</SubLabel>
      <SegmentedControl value={theme.clockFormat} options={CLOCK_OPTIONS} onChange={(v) => setTheme({ clockFormat: v })} />
      <div className="h-4" />
      <SubLabel>Date display</SubLabel>
      <SegmentedControl value={theme.dateFormat} options={DATE_OPTIONS} onChange={(v) => setTheme({ dateFormat: v })} />
      <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
        <SettingRow label="Show seconds" description="Include seconds in the taskbar clock">
          <Toggle enabled={theme.showSeconds} onChange={(v) => setTheme({ showSeconds: v })} />
        </SettingRow>
      </div>
    </SectionCard>
  );
}

// ─── Widgets ────────────────────────────────────────────────────────────────
function WidgetsTab({ widgetPlacements, addWidget, removeWidget }: {
  widgetPlacements: ReturnType<typeof useOS>['widgetPlacements'];
  addWidget: ReturnType<typeof useOS>['addWidget'];
  removeWidget: ReturnType<typeof useOS>['removeWidget'];
}) {
  return (
    <SectionCard title="Widgets on desktop" icon={<Blocks size={13} />}>
      <div className="space-y-2">
        {widgetPlacements.map((p) => (
          <div
            key={p.instance}
            className="flex items-center gap-2 text-xs rounded-[var(--radius-sm)] px-3 py-2"
            style={{ background: 'var(--accent-soft)' }}
          >
            <span className="flex-1">{WIDGET_DEFS.find((w) => w.id === p.id)?.name ?? p.id}</span>
            <span className="text-[10px] tabular-nums" style={{ color: 'var(--text-low)' }}>
              {p.w}×{p.h} · {p.variant}
            </span>
            <button className="icon-btn w-6 h-6" onClick={() => removeWidget(p.instance)} title="Remove">
              <Trash2 size={12} />
            </button>
          </div>
        ))}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {WIDGET_DEFS.filter((w) => !widgetPlacements.some((p) => p.id === w.id)).map((w) => (
            <button key={w.id} className="chip cursor-pointer" onClick={() => addWidget(w.id)}>
              <Plus size={11} /> {w.name}
            </button>
          ))}
        </div>
      </div>
    </SectionCard>
  );
}

// ─── Shortcuts ──────────────────────────────────────────────────────────────
function ShortcutsTab() {
  return (
    <SectionCard title="Keyboard shortcuts" icon={<Keyboard size={13} />}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
        {SHORTCUTS.map((s) => (
          <div key={s.id} className="flex items-center justify-between text-xs">
            <span style={{ color: 'var(--text-mid)' }}>{s.label}</span>
            <kbd
              className="text-[10px] px-1.5 py-0.5 rounded"
              style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
            >
              {s.keys}
            </kbd>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

// ─── Data — ported from ibiz_v2 DataPanel (export/import theme JSON) ────────
function DataTab({ theme, setTheme, resetTheme }: { theme: ThemeState; setTheme: SetTheme; resetTheme: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null);

  const exportTheme = () => {
    const blob = new Blob([JSON.stringify(theme, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'portfolio-theme.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const importTheme = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string) as Partial<ThemeState>;
        if (parsed && typeof parsed === 'object' && 'accent' in parsed) {
          setTheme(parsed);
        }
      } catch { /* invalid file */ }
    };
    reader.readAsText(file);
  };

  return (
    <SectionCard title="Theme data" icon={<FileJson size={13} />}>
      <p className="text-[12px] mb-3" style={{ color: 'var(--text-low)' }}>
        Download your full theme as JSON, or restore one from a previous export.
      </p>
      <div className="flex flex-row flex-wrap gap-3">
        <button
          onClick={exportTheme}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-[var(--radius-sm)] font-bold text-[12px] transition-all cursor-pointer"
          style={{ background: 'var(--accent-soft)', color: 'var(--text-hi)' }}
        >
          <Download size={14} /> Export theme
        </button>
        <button
          onClick={() => fileRef.current?.click()}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-[var(--radius-sm)] font-bold text-[12px] transition-all cursor-pointer"
          style={{ background: 'var(--accent-soft)', color: 'var(--text-hi)' }}
        >
          <Upload size={14} /> Import theme
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) importTheme(file);
            e.target.value = '';
          }}
        />
        <button
          onClick={resetTheme}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-[var(--radius-sm)] font-bold text-[12px] transition-all cursor-pointer"
          style={{ background: 'var(--accent)', color: 'var(--accent-text-on)' }}
        >
          <RotateCcw size={14} /> Reset all
        </button>
      </div>
    </SectionCard>
  );
}

// ─── Reset ──────────────────────────────────────────────────────────────────
function ResetTab({ resetTheme }: { resetTheme: () => void }) {
  return (
    <SectionCard title="Reset" icon={<RotateCcw size={13} />}>
      <p className="text-[12px] mb-3" style={{ color: 'var(--text-low)' }}>
        Restore all theme settings and widgets to their defaults. This cannot be undone.
      </p>
      <button
        className="px-4 py-2 rounded-[var(--radius-sm)] text-xs font-bold transition-all cursor-pointer"
        style={{ background: 'var(--error-soft)', color: 'var(--error)' }}
        onClick={resetTheme}
      >
        Reset theme & widgets to defaults
      </button>
    </SectionCard>
  );
}
