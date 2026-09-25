import {
  BLUR_LEVELS, DENSITY_SPACING, GLASS_LEVELS, RADIUS_LEVELS,
  type BlurLevel, type ClockFormat, type DateFormat, type Density, type GlassLevel,
  type RadiusLevel, type TaskbarMode, type TaskbarStyle, type ThemeMode,
} from '@/styles/theme';
import {
  Blocks,
  Clock,
  FileJson,
  Keyboard,
  Monitor,
  Palette,
  RotateCcw,
  SlidersHorizontal,
  type LucideIcon,
} from 'lucide-react';

export const MODE_OPTIONS: { value: ThemeMode; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

export const GLASS_OPTIONS = (Object.keys(GLASS_LEVELS) as GlassLevel[]).map((v) => ({
  value: v, label: v[0].toUpperCase() + v.slice(1),
}));

export const BLUR_OPTIONS = (Object.keys(BLUR_LEVELS) as BlurLevel[]).map((v) => ({
  value: v, label: v[0].toUpperCase() + v.slice(1),
}));

export const RADIUS_OPTIONS = (Object.keys(RADIUS_LEVELS) as RadiusLevel[]).map((v) => ({
  value: v, label: v[0].toUpperCase() + v.slice(1),
}));

export const TASKBAR_MODE_OPTIONS: { value: TaskbarMode; label: string }[] = [
  { value: 'always', label: 'Always visible' },
  { value: 'auto-hide', label: 'Auto-hide' },
];

export const TASKBAR_STYLE_OPTIONS: { value: TaskbarStyle; label: string }[] = [
  { value: 'windows', label: 'Windows' },
  { value: 'macos', label: 'macOS' },
];

export const CLOCK_OPTIONS: { value: ClockFormat; label: string }[] = [
  { value: '12h', label: '12-hour' },
  { value: '24h', label: '24-hour' },
];

export const DATE_OPTIONS: { value: DateFormat; label: string }[] = [
  { value: 'short', label: 'Short (Sep 21, 2026)' },
  { value: 'long', label: 'Long (Sunday, September 21, 2026)' },
];

export const DENSITY_OPTIONS = (Object.keys(DENSITY_SPACING) as Density[]).map((v) => ({
  value: v, label: v[0].toUpperCase() + v.slice(1),
}));

export const WALLPAPER_DIM_OPTIONS = [0, 10, 20, 30, 40, 50, 60].map((v) => ({ value: v, label: `${v}%` }));
export const WALLPAPER_BLUR_OPTIONS = [0, 5, 10, 15, 20, 25].map((v) => ({ value: v, label: `${v}px` }));
export const GRID_SIZE_OPTIONS = [16, 24, 32].map((v) => ({ value: v, label: String(v) }));

export const SETTINGS_TABS = [
  { id: 'personalization', label: 'Personalization', icon: Palette },
  { id: 'interface', label: 'Interface', icon: SlidersHorizontal },
  { id: 'taskbar', label: 'Taskbar', icon: Monitor },
  { id: 'time', label: 'Time', icon: Clock },
  { id: 'widgets', label: 'Widgets', icon: Blocks },
  { id: 'shortcuts', label: 'Shortcuts', icon: Keyboard },
  { id: 'data', label: 'Data', icon: FileJson },
  { id: 'reset', label: 'Reset', icon: RotateCcw },
] as const satisfies ReadonlyArray<{ id: string; label: string; icon: LucideIcon }>;

export type SettingsTabId = (typeof SETTINGS_TABS)[number]['id'];

export const TAB_DESCRIPTIONS: Record<SettingsTabId, string> = {
  personalization: 'Accent color, mode, glass, wallpaper',
  interface: 'Font, effects and behavior',
  taskbar: 'Mode, style, pinned and startup apps',
  time: 'Clock and date formatting',
  widgets: 'Manage widgets on the desktop',
  shortcuts: 'Keyboard shortcuts at a glance',
  data: 'Export or import your full theme',
  reset: 'Restore default theme and widgets',
};