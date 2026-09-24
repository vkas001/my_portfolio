import { LayoutGrid, Palette, Sparkles, Sun } from 'lucide-react';
import { ACCENTS, WALLPAPERS, type ThemeState } from '@/styles/theme';
import SectionCard from '@/components/ui/SectionCard/SectionCard';
import { SegmentedControl, SubLabel } from '@/modules/settings/components/primitives';
import {
  BLUR_OPTIONS, GLASS_OPTIONS, MODE_OPTIONS, RADIUS_OPTIONS,
  WALLPAPER_BLUR_OPTIONS, WALLPAPER_DIM_OPTIONS,
} from '@/modules/settings/lib/options';
import type { SetTheme } from '@/modules/settings/lib/types';

export default function PersonalizationTab({
  isDark,
  palette,
  theme,
  setTheme,
  isAdmin,
}: {
  isDark: boolean;
  palette: typeof ACCENTS;
  theme: ThemeState;
  setTheme: SetTheme;
  isAdmin: boolean;
}) {
  return (
    <>
      {!isAdmin && (
        <p className="text-[11px] -mb-2" style={{ color: 'var(--text-low)' }}>
          Browsing as guest — your changes apply to this session only.
          Sign in as admin to update the live site.
        </p>
      )}
      <SectionCard title="Theme mode" icon={<Sun size={13} />}>
        <SegmentedControl
          value={theme.mode}
          options={MODE_OPTIONS}
          onChange={(v) => setTheme({ mode: v })}
        />
      </SectionCard>

      <SectionCard title="Accent color" icon={<Palette size={13} />}>
        <p className="text-[11px] mb-2.5" style={{ color: 'var(--text-low)' }}>
          {isDark ? 'Light tints, tuned for dark glass' : 'Deep tones, tuned for light surfaces'}
        </p>
        <div className="grid grid-cols-12 gap-2">
          {palette.map((a) => {
            const isSelected = theme.accent === a.name;
            return (
              <button
                key={a.name}
                aria-pressed={isSelected}
                onClick={() => setTheme({ accent: a.name, customAccent: null })}
                className="col-span-12 @md:col-span-6 @2xl:col-span-4 flex items-center gap-2 p-2 rounded-[var(--radius-sm)] border transition-all cursor-pointer"
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
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12">
            <SubLabel>Glass</SubLabel>
            <SegmentedControl value={theme.glass} options={GLASS_OPTIONS} onChange={(v) => setTheme({ glass: v })} />
          </div>
          <div className="col-span-12">
            <SubLabel>Blur</SubLabel>
            <SegmentedControl value={theme.blur} options={BLUR_OPTIONS} onChange={(v) => setTheme({ blur: v })} />
          </div>
          <div className="col-span-12">
            <SubLabel>Corners</SubLabel>
            <SegmentedControl value={theme.radius} options={RADIUS_OPTIONS} onChange={(v) => setTheme({ radius: v })} />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Wallpaper" icon={<LayoutGrid size={13} />}>
        <div className="grid grid-cols-12 gap-2">
          {WALLPAPERS.map((w) => (
            <button
              key={w.id}
              className="col-span-6 @md:col-span-4 @2xl:col-span-3 h-16 rounded-[var(--radius-sm)] relative overflow-hidden transition-transform hover:scale-[1.03]"
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

      <SectionCard title="Wallpaper effects" icon={<Sparkles size={13} />}>
        <SubLabel>Dim level</SubLabel>
        <SegmentedControl
          value={theme.wallpaperDim}
          options={WALLPAPER_DIM_OPTIONS}
          onChange={(v) => setTheme({ wallpaperDim: v })}
        />
        <div className="h-3" />
        <SubLabel>Blur level</SubLabel>
        <SegmentedControl
          value={theme.wallpaperBlur}
          options={WALLPAPER_BLUR_OPTIONS}
          onChange={(v) => setTheme({ wallpaperBlur: v })}
        />
      </SectionCard>
    </>
  );
}