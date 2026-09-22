import type { ThemeState } from '@/theme';

// ─── Workspace geometry — single source of truth ────────────────────────────
// Adapted from ibiz_v2 lib/osLayout (workspaceInsets/taskbarBottomInset),
// with portfolio bar metrics. Windows and widgets must stay fully inside
// [top, viewport - bottom] so nothing is ever cut off at a screen edge.

export const TOPBAR_H = 40;
export const TASKBAR_H = 56;
export const TASKBAR_AUTOHIDE_H = 14;
/** Breathing room between a maximized window and the bar — ibiz_v2 BOTTOM_GAP. */
export const BOTTOM_GAP = 16;
/** Bottom padding on the macOS centering wrapper (pb-5), outside the dock. */
export const MACOS_DOCK_PAD = 20;
/** Fallback dock height before it has painted (footer padding + content). */
export const MACOS_DOCK_FALLBACK_H = 64;

export interface WorkspaceInsets {
  top: number;
  bottom: number;
}

/**
 * Space to reserve at the bottom, measured from the DOM like ibiz_v2
 * (taskbarBottomInset over [data-os-taskbar]) plus its BOTTOM_GAP, so a
 * maximized window sits exactly above the bar in every style — never
 * touching or overlapping the dock. Falls back to constants pre-paint.
 */
export function taskbarBottomInset(
  theme: Pick<ThemeState, 'taskbarMode' | 'taskbarStyle'>,
): number {
  if (theme.taskbarMode !== 'always') return TASKBAR_AUTOHIDE_H;
  let measured = 0;
  if (typeof document !== 'undefined') {
    measured = document.querySelector('[data-os-taskbar]')?.getBoundingClientRect().height ?? 0;
  }
  const pad = theme.taskbarStyle === 'macos' ? MACOS_DOCK_PAD : 0;
  const height = measured > 0 ? Math.round(measured) : theme.taskbarStyle === 'macos' ? MACOS_DOCK_FALLBACK_H : TASKBAR_H;
  return height + pad + BOTTOM_GAP;
}

export function workspaceInsets(theme: Pick<ThemeState, 'showTopBar' | 'taskbarMode' | 'taskbarStyle'>): WorkspaceInsets {
  return {
    top: theme.showTopBar ? TOPBAR_H : 0,
    bottom: taskbarBottomInset(theme),
  };
}

export interface ViewportBounds {
  width: number;
  height: number;
  top: number;
  bottom: number;
}

/** Usable rectangle between the bars for the given viewport size. */
export function getWorkspaceBoundsFor(
  theme: Pick<ThemeState, 'showTopBar' | 'taskbarMode' | 'taskbarStyle'>,
  viewport: { width: number; height: number } = { width: window.innerWidth, height: window.innerHeight },
): ViewportBounds {
  const { top, bottom } = workspaceInsets(theme);
  return {
    width: Math.max(0, viewport.width),
    height: Math.max(0, viewport.height - top - bottom),
    top,
    bottom,
  };
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Fit a rect fully inside bounds, shrinking it first when it cannot fit.
 * minW/minH yield to tiny viewports so the rect never overflows.
 */
export function fitRectInBounds(
  rect: Rect,
  bounds: { width: number; height: number },
  min: { w: number; h: number } = { w: 0, h: 0 },
): Rect {
  const w = Math.min(rect.w, bounds.width);
  const h = Math.min(rect.h, bounds.height);
  return {
    x: Math.min(Math.max(0, rect.x), Math.max(0, bounds.width - w)),
    y: Math.min(Math.max(0, rect.y), Math.max(0, bounds.height - h)),
    w: Math.max(Math.min(w, bounds.width), Math.min(min.w, bounds.width)),
    h: Math.max(Math.min(h, bounds.height), Math.min(min.h, bounds.height)),
  };
}
