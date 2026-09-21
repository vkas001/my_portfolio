// ─── Theming System ─────────────────────────────────────────────────────────
// Theme engine for the portfolio OS. Tokens are applied as CSS variables on
// <html>. Accent palettes, text colors and surface treatment are ported from
// the ibiz_v2 desktop reference (theme.ts): deep muted accents for light
// mode, light tints for dark mode, slate-based text, ON_ACCENT text colors
// and status color tokens.
// ─────────────────────────────────────────────────────────────────────────────

export type ThemeMode = 'light' | 'dark';
export type AccentName =
  | 'blue' | 'cyan' | 'teal' | 'emerald' | 'lime' | 'amber'
  | 'orange' | 'rose' | 'red' | 'pink' | 'violet' | 'indigo';
export type GlassLevel = 'subtle' | 'normal' | 'strong';
export type BlurLevel = 'normal' | 'high' | 'ultra';
export type RadiusLevel = 'sharp' | 'rounded' | 'pill';
export type FontName =
  | 'Inter' | 'Manrope' | 'Space Grotesk' | 'Sora' | 'Outfit'
  | 'DM Sans' | 'Plus Jakarta Sans' | 'IBM Plex Sans' | 'JetBrains Mono' | 'System UI';

export interface AccentDef {
  name: AccentName;
  label: string;
  base: string;
  soft: string;
  strong: string;
  textOn: string;
}

export interface FontDef {
  name: FontName;
  label: string;
  stack: string;
}

export interface WallpaperDef {
  id: string;
  label: string;
  css: string;
  mode: 'light' | 'dark' | 'both';
}

// ─── Accents — light mode (deep muted, ported from ibiz_v2 ACCENTS) ─────────
export const ACCENTS: AccentDef[] = [
  { name: 'blue',    label: 'Blue',    base: '#00488d', soft: 'rgba(0,95,184,.16)',    strong: '#005fb8', textOn: '#ffffff' },
  { name: 'cyan',    label: 'Cyan',    base: '#0e7490', soft: 'rgba(8,145,178,.16)',   strong: '#0891b2', textOn: '#ffffff' },
  { name: 'teal',    label: 'Teal',    base: '#0f766e', soft: 'rgba(13,148,136,.16)',  strong: '#0d9488', textOn: '#ffffff' },
  { name: 'emerald', label: 'Emerald', base: '#0b6b4f', soft: 'rgba(15,157,110,.16)',  strong: '#0f9d6e', textOn: '#ffffff' },
  { name: 'lime',    label: 'Lime',    base: '#4d7c0f', soft: 'rgba(101,163,13,.16)',  strong: '#65a30d', textOn: '#ffffff' },
  { name: 'amber',   label: 'Amber',   base: '#92400e', soft: 'rgba(180,83,9,.16)',    strong: '#b45309', textOn: '#ffffff' },
  { name: 'orange',  label: 'Orange',  base: '#c2410c', soft: 'rgba(234,88,12,.16)',   strong: '#ea580c', textOn: '#ffffff' },
  { name: 'rose',    label: 'Rose',    base: '#9f1239', soft: 'rgba(190,18,60,.16)',   strong: '#be123c', textOn: '#ffffff' },
  { name: 'red',     label: 'Red',     base: '#b91c1c', soft: 'rgba(220,38,38,.16)',   strong: '#dc2626', textOn: '#ffffff' },
  { name: 'pink',    label: 'Pink',    base: '#9d174d', soft: 'rgba(190,24,93,.16)',   strong: '#be185d', textOn: '#ffffff' },
  { name: 'violet',  label: 'Violet',  base: '#4c1d95', soft: 'rgba(109,40,217,.16)',  strong: '#6d28d9', textOn: '#ffffff' },
  { name: 'indigo',  label: 'Indigo',  base: '#3730a3', soft: 'rgba(67,56,202,.16)',   strong: '#4338ca', textOn: '#ffffff' },
];

// ─── Accents — dark mode (light tints, ported from ibiz_v2 ACCENTS_DARK) ────
// Lighter-than-base tints so accent text/buttons stay readable on dark glass.
export const ACCENTS_DARK: AccentDef[] = [
  { name: 'blue',    label: 'Blue',    base: '#8ab4f8', soft: 'rgba(138,180,248,.16)', strong: '#aecbfa', textOn: '#0f172a' },
  { name: 'cyan',    label: 'Cyan',    base: '#22d3ee', soft: 'rgba(34,211,238,.16)',  strong: '#67e8f9', textOn: '#0f172a' },
  { name: 'teal',    label: 'Teal',    base: '#2dd4bf', soft: 'rgba(45,212,191,.16)',  strong: '#5eead4', textOn: '#0f172a' },
  { name: 'emerald', label: 'Emerald', base: '#6ee7b7', soft: 'rgba(110,231,183,.16)', strong: '#a7f3d0', textOn: '#0f172a' },
  { name: 'lime',    label: 'Lime',    base: '#a3e635', soft: 'rgba(163,230,53,.16)',  strong: '#bef264', textOn: '#0f172a' },
  { name: 'amber',   label: 'Amber',   base: '#fbbf24', soft: 'rgba(251,191,36,.16)',  strong: '#fde68a', textOn: '#0f172a' },
  { name: 'orange',  label: 'Orange',  base: '#fb923c', soft: 'rgba(251,146,60,.16)',  strong: '#fdba74', textOn: '#0f172a' },
  { name: 'rose',    label: 'Rose',    base: '#fb7185', soft: 'rgba(251,113,133,.16)', strong: '#fda4af', textOn: '#0f172a' },
  { name: 'red',     label: 'Red',     base: '#f87171', soft: 'rgba(248,113,113,.16)', strong: '#fca5a5', textOn: '#0f172a' },
  { name: 'pink',    label: 'Pink',    base: '#f472b6', soft: 'rgba(244,114,182,.16)', strong: '#f9a8d4', textOn: '#0f172a' },
  { name: 'violet',  label: 'Violet',  base: '#a78bfa', soft: 'rgba(167,139,250,.16)', strong: '#c4b5fd', textOn: '#0f172a' },
  { name: 'indigo',  label: 'Indigo',  base: '#a5b4fc', soft: 'rgba(165,180,252,.16)', strong: '#c7d2fe', textOn: '#0f172a' },
];

// Text color drawn on top of accent fills, per mode (ibiz_v2 ON_ACCENT).
export const ON_ACCENT: Record<ThemeMode, string> = {
  light: '#ffffff',
  dark: '#0f172a',
};

// ─── Fonts (10) ─────────────────────────────────────────────────────────────
export const FONTS: FontDef[] = [
  { name: 'Inter',            label: 'Inter',            stack: "'Inter', system-ui, sans-serif" },
  { name: 'Manrope',          label: 'Manrope',          stack: "'Manrope', system-ui, sans-serif" },
  { name: 'Space Grotesk',    label: 'Space Grotesk',    stack: "'Space Grotesk', system-ui, sans-serif" },
  { name: 'Sora',             label: 'Sora',             stack: "'Sora', system-ui, sans-serif" },
  { name: 'Outfit',           label: 'Outfit',           stack: "'Outfit', system-ui, sans-serif" },
  { name: 'DM Sans',          label: 'DM Sans',          stack: "'DM Sans', system-ui, sans-serif" },
  { name: 'Plus Jakarta Sans',label: 'Plus Jakarta Sans',stack: "'Plus Jakarta Sans', system-ui, sans-serif" },
  { name: 'IBM Plex Sans',    label: 'IBM Plex Sans',    stack: "'IBM Plex Sans', system-ui, sans-serif" },
  { name: 'JetBrains Mono',   label: 'JetBrains Mono',   stack: "'JetBrains Mono', ui-monospace, monospace" },
  { name: 'System UI',        label: 'System UI',        stack: "system-ui, sans-serif" },
];

// ─── Wallpaper presets ──────────────────────────────────────────────────────
export const WALLPAPERS: WallpaperDef[] = [
  { id: 'violet-dream', label: 'Violet Dream', mode: 'dark',
    css: 'radial-gradient(1200px 800px at 20% 10%, rgba(139,92,246,.35), transparent 60%), radial-gradient(1000px 700px at 80% 90%, rgba(59,130,246,.25), transparent 60%), linear-gradient(160deg, #0b0616 0%, #140a2e 50%, #0a0512 100%)' },
  { id: 'twilight', label: 'Twilight', mode: 'dark',
    css: 'radial-gradient(1000px 700px at 75% 15%, rgba(244,63,94,.28), transparent 55%), radial-gradient(900px 700px at 15% 85%, rgba(99,102,241,.30), transparent 60%), linear-gradient(180deg, #0a0a1a 0%, #1a0f2e 60%, #0d0a1c 100%)' },
  { id: 'deep-ocean', label: 'Deep Ocean', mode: 'dark',
    css: 'radial-gradient(1100px 800px at 30% 20%, rgba(6,182,212,.25), transparent 60%), radial-gradient(900px 600px at 85% 80%, rgba(59,130,246,.20), transparent 55%), linear-gradient(170deg, #041220 0%, #062a3d 55%, #030d18 100%)' },
  { id: 'forest', label: 'Forest', mode: 'dark',
    css: 'radial-gradient(1000px 700px at 25% 15%, rgba(16,185,129,.22), transparent 55%), radial-gradient(900px 650px at 80% 85%, rgba(132,204,22,.15), transparent 55%), linear-gradient(165deg, #05130c 0%, #0a2418 55%, #04100a 100%)' },
  { id: 'ember', label: 'Ember', mode: 'dark',
    css: 'radial-gradient(1000px 700px at 70% 20%, rgba(249,115,22,.30), transparent 55%), radial-gradient(900px 600px at 20% 80%, rgba(239,68,68,.20), transparent 60%), linear-gradient(170deg, #150803 0%, #2a0f06 55%, #100502 100%)' },
  { id: 'midnight', label: 'Midnight', mode: 'dark',
    css: 'linear-gradient(180deg, #05060f 0%, #0a0d1f 50%, #04050c 100%)' },
  { id: 'accent-dark', label: 'Accent Dark', mode: 'dark',
    css: 'var(--wp-accent-dark)' },
  { id: 'aurora', label: 'Aurora', mode: 'dark',
    css: 'radial-gradient(900px 600px at 15% 25%, rgba(20,184,166,.30), transparent 55%), radial-gradient(1000px 700px at 85% 30%, rgba(139,92,246,.30), transparent 55%), radial-gradient(800px 600px at 50% 90%, rgba(236,72,153,.20), transparent 55%), linear-gradient(180deg, #060a12 0%, #0b1120 60%, #050810 100%)' },
  { id: 'porcelain', label: 'Porcelain', mode: 'light',
    css: 'radial-gradient(1000px 700px at 20% 15%, rgba(139,92,246,.10), transparent 55%), radial-gradient(900px 700px at 80% 85%, rgba(59,130,246,.10), transparent 55%), linear-gradient(165deg, #f6f7fb 0%, #eef0f7 60%, #f8f9fc 100%)' },
  { id: 'sunrise', label: 'Sunrise', mode: 'light',
    css: 'radial-gradient(900px 600px at 80% 15%, rgba(249,115,22,.18), transparent 55%), radial-gradient(900px 700px at 15% 85%, rgba(236,72,153,.14), transparent 55%), linear-gradient(170deg, #fdf6f0 0%, #fbeef0 60%, #fef9f4 100%)' },
  { id: 'mint', label: 'Mint', mode: 'light',
    css: 'radial-gradient(900px 650px at 25% 20%, rgba(16,185,129,.12), transparent 55%), radial-gradient(900px 650px at 80% 80%, rgba(6,182,212,.10), transparent 55%), linear-gradient(165deg, #f2faf7 0%, #e9f5f1 60%, #f4fbf8 100%)' },
  { id: 'paper', label: 'Paper', mode: 'light',
    css: 'linear-gradient(180deg, #fafafa 0%, #f2f2f2 60%, #fafafa 100%)' },
];

// ─── Level option tables ────────────────────────────────────────────────────
export const GLASS_LEVELS: Record<GlassLevel, number> = {
  subtle: 0.06, normal: 0.10, strong: 0.16,
};

export const BLUR_LEVELS: Record<BlurLevel, string> = {
  normal: '16px', high: '28px', ultra: '44px',
};

export const RADIUS_LEVELS: Record<RadiusLevel, string> = {
  sharp: '4px', rounded: '14px', pill: '24px',
};

// ─── Status colors (ported from ibiz_v2 ERROR_COLORS + status tokens) ───────
export const STATUS_COLORS: Record<ThemeMode, { error: string; errorSoft: string; success: string; successSoft: string; warning: string; warningSoft: string }> = {
  light: {
    error: '#dc2626', errorSoft: 'rgba(220, 38, 38, 0.12)',
    success: '#10b981', successSoft: 'rgba(16, 185, 129, 0.14)',
    warning: '#f59e0b', warningSoft: 'rgba(245, 158, 11, 0.16)',
  },
  dark: {
    error: '#f87171', errorSoft: 'rgba(248, 113, 113, 0.16)',
    success: '#10b981', successSoft: 'rgba(16, 185, 129, 0.14)',
    warning: '#f59e0b', warningSoft: 'rgba(245, 158, 11, 0.16)',
  },
};

// ─── Theme state shape ──────────────────────────────────────────────────────
export interface ThemeState {
  mode: ThemeMode;
  accent: AccentName;
  customAccent: string | null; // hex — overrides the palette (ibiz_v2 customAccent)
  glass: GlassLevel;
  blur: BlurLevel;
  radius: RadiusLevel;
  font: FontName;
  wallpaper: string; // WallpaperDef.id
  dockPosition?: 'bottom';
  animationsEnabled: boolean;
  soundsEnabled: boolean;
  widgets: WidgetPlacement[];
  startupWindows: string[];
}

export interface WidgetPlacement {
  id: string;          // widget type id, e.g. 'profile-card'
  instance: string;    // unique instance id
  x: number; y: number;   // px offsets on desktop
  w: number; h: number;   // px size
  variant: string;        // widget variant key
}

export const DEFAULT_THEME: ThemeState = {
  mode: 'dark',
  accent: 'violet',
  customAccent: null,
  glass: 'normal',
  blur: 'normal',
  radius: 'rounded',
  font: 'Inter',
  wallpaper: 'violet-dream',
  animationsEnabled: true,
  soundsEnabled: false,
  widgets: [],
  startupWindows: ['about', 'skills'],
};

// ─── Color helpers ──────────────────────────────────────────────────────────
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const v = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(v, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgba(hex: string, a: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
}

function mix(a: string, b: string, t: number): string {
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  const c = ca.map((v, i) => Math.round(v + (cb[i] - v) * t));
  return `#${c.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

/** Mix a hex color toward white (ibiz_v2 lighten helper). */
function lighten(hex: string, amt: number): string {
  const [r, g, b] = hexToRgb(hex);
  const toward = (c: number) => Math.round(c + (255 - c) * amt);
  return `#${[toward(r), toward(g), toward(b)]
    .map((c) => c.toString(16).padStart(2, '0'))
    .join('')}`;
}

/**
 * Resolve the active accent triplet. In dark mode the palette provides light
 * tints; a custom accent is lightened toward white in dark mode (both
 * behaviors ported from ibiz_v2's resolveAccent).
 */
function resolveAccent(mode: ThemeMode, name: AccentName, custom: string | null): AccentDef {
  if (custom) {
    if (mode === 'light') {
      return { name, label: 'Custom', base: custom, strong: custom, soft: custom, textOn: '#ffffff' };
    }
    return {
      name,
      label: 'Custom',
      base: lighten(custom, 0.55),
      strong: lighten(custom, 0.7),
      soft: lighten(custom, 0.42),
      textOn: ON_ACCENT.dark,
    };
  }
  return mode === 'dark'
    ? ACCENTS_DARK.find((a) => a.name === name) ?? ACCENTS_DARK[10]
    : ACCENTS.find((a) => a.name === name) ?? ACCENTS[10];
}

export function getAccent(name: AccentName): AccentDef {
  return ACCENTS.find((a) => a.name === name) ?? ACCENTS[10]; // violet (light set)
}

export function getWallpaper(id: string): WallpaperDef {
  return WALLPAPERS.find((w) => w.id === id) ?? WALLPAPERS[0];
}

/** Apply all theme tokens as CSS custom properties on documentElement. */
export function applyTheme(theme: ThemeState): void {
  const root = document.documentElement;
  const isDark = theme.mode === 'dark';
  const accent = resolveAccent(theme.mode, theme.accent, theme.customAccent);

  const glassA = GLASS_LEVELS[theme.glass];
  const blurPx = BLUR_LEVELS[theme.blur];
  const radius = RADIUS_LEVELS[theme.radius];
  const font = FONTS.find((f) => f.name === theme.font) ?? FONTS[0];
  const status = STATUS_COLORS[theme.mode];

  // Text & bg palettes — slate tones ported from ibiz_v2 TEXT_COLORS, with
  // slate-900 as the canvas in light mode and slate-950-mixed dark canvas.
  const bg = isDark ? '#0f172a' : '#f1f5f9';
  const bgElev = isDark ? 'rgba(30, 41, 59, .78)' : 'rgba(255, 255, 255, .78)';
  const textHi = isDark ? '#e2e8f0' : '#191c1e';
  const textMid = isDark ? '#cbd5e1' : '#424752';
  const textLow = isDark ? '#94a3b8' : '#505f76';
  const border = isDark ? 'rgba(255,255,255,.12)' : 'rgba(15,23,42,.10)';

  const set = (k: string, v: string) => root.style.setProperty(k, v);

  // Accent tokens (mode-aware palette)
  set('--accent', accent.base);
  set('--accent-soft', accent.soft);
  set('--accent-strong', accent.strong);
  set('--accent-text-on', accent.textOn);
  set('--accent-rgb', hexToRgb(accent.base).join(','));
  set('--accent-hover', rgba(accent.base, 0.85));
  set('--on-accent', ON_ACCENT[theme.mode]);

  // Mode
  set('--mode-dark', isDark ? '1' : '0');
  set('--bg', bg);
  set('--bg-elev', bgElev);
  set('--text-hi', textHi);
  set('--text-mid', textMid);
  set('--text-low', textLow);
  set('--border', border);

  // Status tokens
  set('--error', status.error);
  set('--error-soft', status.errorSoft);
  set('--success', status.success);
  set('--success-soft', status.successSoft);
  set('--warning', status.warning);
  set('--warning-soft', status.warningSoft);

  // Glass
  set('--glass-a', String(glassA));
  set('--glass-blur', blurPx);
  set('--glass-border', isDark ? `rgba(255,255,255,${0.08 + glassA})` : `rgba(15,23,42,${0.06 + glassA})`);
  set('--glass-highlight', isDark ? 'rgba(255,255,255,.06)' : 'rgba(255,255,255,.65)');

  // Radius
  set('--radius', radius);
  set('--radius-sm', `calc(${radius} * 0.6)`);
  set('--radius-lg', `calc(${radius} * 1.4)`);

  // Font
  set('--font-ui', font.stack);

  // Shadow depth
  set('--shadow-window', isDark
    ? '0 24px 70px rgba(0,0,0,.55), 0 2px 8px rgba(0,0,0,.4)'
    : '0 24px 70px rgba(15,23,42,.18), 0 2px 8px rgba(15,23,42,.08)');

  // Dynamic accent wallpapers (tuned per mode so the tint set reads well)
  set('--wp-accent-dark',
    `radial-gradient(1100px 800px at 25% 15%, ${rgba(accent.base, 0.30)}, transparent 60%), ` +
    `radial-gradient(900px 700px at 80% 85%, ${rgba(accent.strong, 0.24)}, transparent 55%), ` +
    `linear-gradient(165deg, #0a0814 0%, ${mix('#1e293b', accent.strong, 0.10)} 55%, #070512 100%)`);
  set('--wp-accent-light',
    `radial-gradient(1000px 700px at 25% 15%, ${rgba(accent.base, 0.12)}, transparent 55%), ` +
    `radial-gradient(900px 700px at 80% 85%, ${rgba(accent.strong, 0.09)}, transparent 55%), ` +
    `linear-gradient(165deg, #f7f7fb 0%, #f0f0f7 60%, #f9f9fc 100%)`);

  // Wallpaper selection
  const wp = getWallpaper(theme.wallpaper);
  const fallback = isDark ? 'var(--wp-accent-dark)' : 'var(--wp-accent-light)';
  set('--wallpaper', wp.css.startsWith('var(') ? fallback : wp.css);

  root.dataset.mode = theme.mode;
  root.dataset.accent = theme.accent;
  root.style.colorScheme = theme.mode;
}

/** Persist theme to localStorage (with ssr-safety noop). */
export function saveTheme(theme: ThemeState): void {
  try { localStorage.setItem('portfolio.theme', JSON.stringify(theme)); } catch { /* noop */ }
}

export function loadTheme(): ThemeState {
  try {
    const raw = localStorage.getItem('portfolio.theme');
    if (!raw) return { ...DEFAULT_THEME };
    const parsed = JSON.parse(raw) as Partial<ThemeState>;
    return { ...DEFAULT_THEME, ...parsed };
  } catch {
    return { ...DEFAULT_THEME };
  }
}
