// Theme contracts are frontend-only (localStorage-first with server sync —
// they never cross the API as a @shared type), so the settings model
// re-exports the OS theme types directly.
export type { ThemeState, WidgetPlacement } from '@/styles/theme';
export type { SetTheme } from './lib/types';