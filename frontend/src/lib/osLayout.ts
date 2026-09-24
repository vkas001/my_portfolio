import type { ThemeState } from '@/styles/theme';

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

/** Current workspace bounds (fallback defaults before a theme exists). */
export function getWorkspaceBounds(
  theme?: Pick<ThemeState, 'showTopBar' | 'taskbarMode' | 'taskbarStyle'> | null,
): ViewportBounds {
  return getWorkspaceBoundsFor(
    theme ?? { showTopBar: true, taskbarMode: 'always', taskbarStyle: 'windows' },
  );
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

/**
 * Fit a *widget* rect fully inside the workspace. Unlike windows (which live
 * in workspace-relative coords inside .desktop-area), widget cards are
 * absolutely positioned against .desktop-root (full viewport), so the clamp
 * must honor the top bar inset — widgets, tabs and windows alike never go
 * inside the header, and never under the taskbar.
 */
export function fitWidgetRect(
  rect: Rect,
  bounds: ViewportBounds,
  min: { w: number; h: number } = { w: 0, h: 0 },
): Rect {
  const w = Math.min(rect.w, bounds.width);
  const h = Math.min(rect.h, bounds.height);
  const minY = bounds.top;
  const maxY = Math.max(minY, bounds.top + bounds.height - h);
  return {
    x: Math.min(Math.max(0, rect.x), Math.max(0, bounds.width - w)),
    y: Math.min(Math.max(minY, rect.y), maxY),
    w: Math.max(Math.min(w, bounds.width), Math.min(min.w, bounds.width)),
    h: Math.max(Math.min(h, bounds.height), Math.min(min.h, bounds.height)),
  };
}

function rectsOverlap(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
}

/**
 * Default spawn slot for a new widget: columns on fixed right-aligned lines
 * sweeping left from the top-right corner, each new widget stacking flush
 * below whatever already occupies its column (exact `gap`) so every column
 * stays aligned under its top widget. Falls back to a fitted top-right rect
 * when the desktop is full (overlap allowed rather than spawning off-screen).
 */
export function nextWidgetSlot(
  existing: Rect[],
  size: { w: number; h: number },
  bounds: ViewportBounds,
  margin = 16,
  gap = 16,
  // Must clear the widest widget (registry max 408) + gap so adjacent
  // columns never overlap; narrower widgets right-align to their column line.
  colPitch = 440,
): { x: number; y: number } {
  const bottomLimit = bounds.top + bounds.height - margin;
  for (let col = 0; ; col++) {
    const x = bounds.width - margin - col * colPitch - size.w;
    if (x < margin) break;
    let y = bounds.top + margin;
    for (;;) {
      if (y + size.h > bottomLimit + 1) break; // column full → next column left
      const slot = { x, y, w: size.w, h: size.h };
      let lowest = -Infinity;
      for (const p of existing) {
        if (rectsOverlap(p, slot)) lowest = Math.max(lowest, p.y + p.h);
      }
      if (lowest === -Infinity) return { x, y };
      y = lowest + gap; // stack flush below the lowest blocker
    }
  }
  const fitted = fitWidgetRect({ x: bounds.width - margin - size.w, y: bounds.top + margin, w: size.w, h: size.h }, bounds);
  return { x: fitted.x, y: fitted.y };
}
