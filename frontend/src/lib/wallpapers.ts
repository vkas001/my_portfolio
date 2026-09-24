import { WALLPAPERS, getWallpaper, type ThemeMode } from '@/styles/theme';

export function listWallpapers(mode?: ThemeMode) {
  if (!mode || mode === 'dark') return WALLPAPERS;
  return WALLPAPERS.filter((w) => w.mode === mode || w.mode === 'both');
}

export { getWallpaper };
