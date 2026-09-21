import { useState } from 'react';
import {
  Palette, SlidersHorizontal, Blocks, Keyboard, RotateCcw, Settings as SettingsIcon,
  Sun, Type, LayoutGrid, Sparkles, Plus, Trash2,
} from 'lucide-react';
import { useOS } from '@/context/OSContext';
import {
  ACCENTS, ACCENTS_DARK, BLUR_LEVELS, FONTS, GLASS_LEVELS, RADIUS_LEVELS, WALLPAPERS,
  type AccentName, type BlurLevel, type FontName, type GlassLevel, type RadiusLevel, type ThemeMode,
} from '@/theme';
import { WIDGET_DEFS } from '@/components/widgets/registry';
import { SHORTCUTS } from '@/lib/shortcuts';
import { SectionCard, SegmentedControl, SettingRow, SubLabel, Toggle } from '@/components/settings/primitives';

const TABS = [
  { id: 'personalization', label: 'Personalization', icon: <Palette size={15} /> },
  { id: 'interface', label: 'Interface', icon: <SlidersHorizontal size={15} /> },
  { id: 'widgets', label: 'Widgets', icon: <Blocks size={15} /> },
  { id: 'shortcuts', label: 'Shortcuts', icon: <Keyboard size={15} /> },
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

export default function Settings() {
  const {
    theme, setTheme, resetTheme,
    widgetPlacements, addWidget, removeWidget,
  } = useOS();
  const [activeTab, setActiveTab] = useState<TabId>('personalization');
  const tabMeta = TABS.find((t) => t.id === activeTab) ?? TABS[0];

  const isDark = theme.mode === 'dark';
  const palette = isDark ? ACCENTS_DARK : ACCENTS;

  const TAB_DESCRIPTIONS: Record<TabId, string> = {
    personalization: 'Accent color, mode, glass, wallpaper',
    interface: 'Font, effects and behavior',
    widgets: 'Manage widgets on the desktop',
    shortcuts: 'Keyboard shortcuts at a glance',
    reset: 'Restore default theme and widgets',
  };

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
            <PersonalizationTab
              isDark={isDark}
              palette={palette}
              theme={theme}
              setTheme={setTheme}
            />
          )}
          {activeTab === 'interface' && <InterfaceTab theme={theme} setTheme={setTheme} />}
          {activeTab === 'widgets' && (
            <WidgetsTab
              widgetPlacements={widgetPlacements}
              addWidget={addWidget}
              removeWidget={removeWidget}
            />
          )}
          {activeTab === 'shortcuts' && <ShortcutsTab />}
          {activeTab === 'reset' && <ResetTab resetTheme={resetTheme} />}
        </div>
      </div>
    </div>
  );
}

// ─── Personalization ────────────────────────────────────────────────────────
function PersonalizationTab({
  isDark, palette, theme, setTheme,
}: {
  isDark: boolean;
  palette: typeof ACCENTS;
  theme: ReturnType<typeof useOS>['theme'];
  setTheme: ReturnType<typeof useOS>['setTheme'];
}) {
  return (
    <>
      {/* Theme mode — ported from ThemeModeToggle */}
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
                onClick={() => setTheme({ accent: a.name as AccentName, customAccent: null })}
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

      {/* Glass & effects */}
      <SectionCard title="Glass & effects" icon={<Sparkles size={13} />}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <SubLabel>Glass</SubLabel>
            <SegmentedControl
              value={theme.glass}
              options={GLASS_OPTIONS}
              onChange={(v) => setTheme({ glass: v })}
            />
          </div>
          <div>
            <SubLabel>Blur</SubLabel>
            <SegmentedControl
              value={theme.blur}
              options={BLUR_OPTIONS}
              onChange={(v) => setTheme({ blur: v })}
            />
          </div>
          <div>
            <SubLabel>Corners</SubLabel>
            <SegmentedControl
              value={theme.radius}
              options={RADIUS_OPTIONS}
              onChange={(v) => setTheme({ radius: v })}
            />
          </div>
        </div>
      </SectionCard>

      {/* Wallpaper */}
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
    </>
  );
}

// ─── Interface ──────────────────────────────────────────────────────────────
function InterfaceTab({ theme, setTheme }: {
  theme: ReturnType<typeof useOS>['theme'];
  setTheme: ReturnType<typeof useOS>['setTheme'];
}) {
  return (
    <SectionCard title="Interface" icon={<Type size={13} />}>
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
        <SettingRow
          label="Animations"
          description="Window open/close and hover effects"
        >
          <Toggle
            enabled={theme.animationsEnabled}
            onChange={(v) => setTheme({ animationsEnabled: v })}
          />
        </SettingRow>
        <SettingRow
          label="Sounds"
          description="UI sounds for window and widget actions"
        >
          <Toggle
            enabled={theme.soundsEnabled}
            onChange={(v) => setTheme({ soundsEnabled: v })}
          />
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
            <button
              className="icon-btn w-6 h-6"
              onClick={() => removeWidget(p.instance)}
              title="Remove"
            >
              <Trash2 />
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
