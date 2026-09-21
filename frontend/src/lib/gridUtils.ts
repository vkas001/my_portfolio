// Grid snapping for widget drag/resize.
export const GRID_SIZES = [16, 24, 32] as const;
export type GridSize = (typeof GRID_SIZES)[number];

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export const WIDGET_MIN_W = 180;
export const WIDGET_MIN_H = 120;

export function snapToGrid(value: number, grid: GridSize): number {
  return Math.round(value / grid) * grid;
}

export function snapRect(rect: Rect, grid: GridSize): Rect {
  return {
    x: snapToGrid(rect.x, grid),
    y: snapToGrid(rect.y, grid),
    w: Math.max(WIDGET_MIN_W, snapToGrid(rect.w, grid)),
    h: Math.max(WIDGET_MIN_H, snapToGrid(rect.h, grid)),
  };
}

/** Clamp a rect so it stays within the given viewport bounds. */
export function clampRect(rect: Rect, viewport: { width: number; height: number }): Rect {
  return {
    ...rect,
    x: Math.min(Math.max(0, rect.x), Math.max(0, viewport.width - rect.w)),
    y: Math.min(Math.max(0, rect.y), Math.max(0, viewport.height - rect.h)),
  };
}

export function rectsOverlap(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
}

/** Find a free position for a new widget by scanning downward. */
export function findFreePosition(
  existing: Rect[],
  size: { w: number; h: number },
  viewport: { width: number; height: number },
  grid: GridSize = 24,
): { x: number; y: number } {
  for (let y = 0; y < viewport.height - size.h; y += grid) {
    for (let x = 0; x < viewport.width - size.w; x += grid) {
      const candidate: Rect = { x, y, w: size.w, h: size.h };
      if (!existing.some((r) => rectsOverlap(candidate, r))) {
        return { x, y };
      }
    }
  }
  return { x: 0, y: 0 };
}
