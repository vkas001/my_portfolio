import { useRef, useState } from 'react';
import { ImagePlus, LayoutGrid, LoaderCircle, Palette, Sparkles, Sun, Trash2 } from 'lucide-react';
import { ACCENTS, WALLPAPERS, type ThemeState } from '@/styles/theme';
import SectionCard from '@/components/ui/SectionCard/SectionCard';
import { adminService } from '@/lib/api/adminService';
import toast from 'react-hot-toast';
import { RangeControl, SegmentedControl, SubLabel } from '@/modules/settings/components/primitives';
import {
  BLUR_OPTIONS, GLASS_OPTIONS, MODE_OPTIONS, RADIUS_OPTIONS,
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
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  // Gradient presets vs photo backdrops (built-in /splash/* or uploads).
  const colorWps = WALLPAPERS.filter((w) => !w.css.startsWith('url('));
  const photoWps = WALLPAPERS.filter((w) => w.css.startsWith('url('));
  const customPhoto = theme.wallpaperImage;

  const onPickFile = async (file: File | undefined) => {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('JPEG, PNG or WebP only');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Max 5 MB');
      return;
    }
    setUploading(true);
    try {
      const updated = await adminService.uploadWallpaperImage(file);
      setTheme({ wallpaperImage: updated.wallpaperImage });
      toast.success('Wallpaper uploaded');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const removeCustomPhoto = async () => {
    try {
      await adminService.removeWallpaperImage();
      setTheme({ wallpaperImage: null });
      toast.success('Custom wallpaper removed');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Remove failed');
    }
  };

  const tileClass =
    'col-span-6 @md:col-span-4 @2xl:col-span-3 h-16 rounded-[var(--radius-sm)] relative overflow-hidden transition-transform hover:scale-[1.03]';
  const tileBorder = (selected: boolean) =>
    selected ? '2px solid var(--accent)' : '1px solid var(--border)';

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
        <SubLabel>Colors</SubLabel>
        <div className="grid grid-cols-12 gap-2">
          {colorWps.map((w) => (
            <button
              key={w.id}
              className={tileClass}
              style={{
                background: w.css.startsWith('var(') ? 'var(--wp-accent-dark)' : w.css,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                border: !customPhoto && theme.wallpaper === w.id ? tileBorder(true) : tileBorder(false),
              }}
              onClick={() => setTheme({ wallpaper: w.id, wallpaperImage: null })}
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
        <div className="mt-3">
          <SubLabel>Photos</SubLabel>
        </div>
        <div className="grid grid-cols-12 gap-2">
          {photoWps.map((w) => (
            <button
              key={w.id}
              className={tileClass}
              style={{
                background: w.css,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                border: !customPhoto && theme.wallpaper === w.id ? tileBorder(true) : tileBorder(false),
              }}
              onClick={() => setTheme({ wallpaper: w.id, wallpaperImage: null })}
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
          {customPhoto && (
            <div
              className={`${tileClass} flex items-center gap-2 p-2`}
              style={{ border: tileBorder(true), background: 'var(--accent-soft)' }}
            >
              <img
                src={customPhoto}
                alt="Custom wallpaper"
                loading="lazy"
                className="w-10 h-10 rounded shrink-0 border object-cover"
                style={{ borderColor: 'var(--border)' }}
                draggable={false}
              />
              <span className="text-[12px] font-bold flex-1 text-left" style={{ color: 'var(--text-hi)' }}>
                Custom
              </span>
              <button
                className="icon-btn w-7 h-7 shrink-0"
                onClick={removeCustomPhoto}
                aria-label="Remove custom wallpaper"
                title="Remove custom wallpaper"
              >
                <Trash2 size={13} />
              </button>
            </div>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden wallpaper-upload-input"
          aria-hidden
          tabIndex={-1}
          onChange={(e) => {
            void onPickFile(e.target.files?.[0]);
            e.target.value = '';
          }}
        />
        <button
          className="btn-ghost text-[11px] mt-2.5 disabled:opacity-60"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? <LoaderCircle size={12} className="animate-spin" /> : <ImagePlus size={12} />}
          {uploading ? 'Uploading…' : customPhoto ? 'Replace custom photo' : 'Upload custom photo'}
        </button>
      </SectionCard>

      <SectionCard title="Wallpaper effects" icon={<Sparkles size={13} />}>
        <RangeControl
          label="Dim"
          value={theme.wallpaperDim}
          min={0} max={60} step={5}
          display={`${theme.wallpaperDim}%`}
          onChange={(v) => setTheme({ wallpaperDim: v })}
        />
        <RangeControl
          label="Blur"
          value={theme.wallpaperBlur}
          min={0} max={25} step={1}
          display={`${theme.wallpaperBlur}px`}
          onChange={(v) => setTheme({ wallpaperBlur: v })}
        />
      </SectionCard>
    </>
  );
}