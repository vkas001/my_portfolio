import type { ThemeState } from '@/theme';
import { http } from './httpClient';

interface ThemePayload {
  theme: ThemeState | null;
  exists: boolean;
}

/**
 * Server-side theme persistence (adapted from ibiz_v2 personalizationService).
 * Single-user portfolio: one row, no tenant/user scope. All calls fail soft
 * so the OS keeps working offline on localStorage.
 */
export const themeService = {
  async get(): Promise<ThemeState | null> {
    try {
      const res = await http.get<ThemePayload>('/theme');
      if (res && typeof res === 'object' && 'theme' in res) {
        return res.theme;
      }
      // Back-compat: backend returned the ThemeState directly
      return (res as unknown as ThemeState) ?? null;
    } catch {
      return null;
    }
  },

  async save(theme: ThemeState): Promise<void> {
    try {
      await http.put('/theme', theme);
    } catch {
      /* offline — localStorage remains source of truth */
    }
  },

  async reset(): Promise<void> {
    try {
      await http.delete('/theme/reset');
    } catch {
      /* noop */
    }
  },
};
