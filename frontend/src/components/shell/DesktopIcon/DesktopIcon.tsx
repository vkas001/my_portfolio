import { useRef, type PointerEvent as ReactPointerEvent } from 'react';
import type { GridSize, IconSize } from '@/styles/theme';
import { snapToGrid } from '@/lib/gridUtils';
import type { AppDef, AppId } from '@/types';

interface Props {
  app: AppDef;
  /** Persisted drag offset from the default column slot (theme.desktopIconOffsets). */
  offset?: { x: number; y: number };
  size: IconSize;
  /** Desktop grid step (theme.gridSize) — drags snap to it, invisibly. */
  gridSize: GridSize;
  onMove: (appId: AppId, offset: { x: number; y: number }) => void;
  onOpen: (appId: AppId) => void;
  /** Fired once when the press turns into a drag (past the threshold). */
  onDragStart: (appId: AppId) => void;
  /** Fired on every painted drag frame so the parent can live-swap an
   *  overlapped icon (parent commits rarely — only when the victim changes). */
  onLiveMove: (appId: AppId) => void;
}

/** Movement (px) before a press counts as a drag rather than a click. */
const DRAG_THRESHOLD = 4;
/** Swallow a dblclick that lands right after a drag ended. */
const DRAG_DBLCLICK_GRACE = 400;
/** Overlap fraction of the smaller icon that counts as "dropped on top". */
export const SWAP_OVERLAP = 0.5;

// Literal class strings so Tailwind picks them up. Large matches the
// original icon look; the user-reported default is Medium.
const ICON_SIZES: Record<IconSize, { btn: string; tile: string; glyph: number; label: string }> = {
  small: { btn: 'w-14', tile: 'w-8 h-8', glyph: 16, label: 'text-[9px]' },
  medium: { btn: 'w-16', tile: 'w-9 h-9', glyph: 18, label: 'text-[10px]' },
  large: { btn: 'w-20', tile: 'w-11 h-11', glyph: 20, label: 'text-[10px]' },
};

function clamp(v: number, min: number, max: number): number {
  return max < min ? min : Math.min(Math.max(v, min), max);
}

/**
 * One desktop icon. The default layout (flex column, top-left) stays put —
 * dragging only writes a translate offset, so icons never reflow the others
 * and a reset is just clearing the offsets. Geometry is painted straight to
 * the DOM during the drag (rAF-coalesced, WindowFrame-style) and committed
 * once to the theme on release, so a drag never re-renders the shell.
 */
export default function DesktopIcon({ app, offset, size, gridSize, onMove, onOpen, onDragStart, onLiveMove }: Props) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const lastDragEndRef = useRef(0);
  const dims = ICON_SIZES[size] ?? ICON_SIZES.medium;

  const startDrag = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0) return;
    const el = btnRef.current;
    const area = el?.closest('.desktop-area');
    if (!el || !area) return;

    const start = offset ?? { x: 0, y: 0 };
    const rect = el.getBoundingClientRect();
    const areaRect = area.getBoundingClientRect();
    // Natural (untranslated) slot → allowed offset range keeps the whole
    // icon inside the desktop area (between the top bar and the taskbar).
    const baseLeft = rect.left - start.x;
    const baseTop = rect.top - start.y;
    const minX = areaRect.left - baseLeft;
    const maxX = areaRect.right - baseLeft - rect.width;
    const minY = areaRect.top - baseTop;
    const maxY = areaRect.bottom - baseTop - rect.height;

    const sx = e.clientX;
    const sy = e.clientY;
    let px = sx;
    let py = sy;
    let dragging = false;
    let raf = 0;

    const target = (moveX: number, moveY: number) => ({
      // Invisible grid: quantize to the desktop grid step, then clamp — so
      // icons always rest on vertical/horizontal grid lines with no overlay
      // ever drawn (widgets snap the same way).
      x: clamp(snapToGrid(start.x + moveX - sx, gridSize), minX, maxX),
      y: clamp(snapToGrid(start.y + moveY - sy, gridSize), minY, maxY),
    });

    const paint = () => {
      raf = 0;
      const t = target(px, py);
      el.style.transform = `translate3d(${t.x}px, ${t.y}px, 0)`;
      onLiveMove(app.id);
    };

    const onMoveEv = (ev: PointerEvent) => {
      px = ev.clientX;
      py = ev.clientY;
      if (!dragging && Math.abs(px - sx) + Math.abs(py - sy) < DRAG_THRESHOLD) return;
      if (!dragging) {
        dragging = true;
        el.style.zIndex = '5'; // float above neighbouring icons mid-drag
        onDragStart(app.id);
      }
      if (!raf) raf = window.requestAnimationFrame(paint);
    };

    const onUp = () => {
      if (raf) window.cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMoveEv);
      window.removeEventListener('pointerup', onUp);
      if (!dragging) return;
      el.style.zIndex = '';
      lastDragEndRef.current = Date.now();
      // Flush the final position synchronously: a coalesced rAF paint may
      // never have run for the last pointer position, and the drop commit
      // (overlap/swap math) measures this element's DOM rect — it must match
      // the logical offset exactly.
      const final = target(px, py);
      el.style.transform = `translate3d(${final.x}px, ${final.y}px, 0)`;
      onMove(app.id, final);
    };

    window.addEventListener('pointermove', onMoveEv);
    window.addEventListener('pointerup', onUp);
  };

  const handleOpen = () => {
    if (Date.now() - lastDragEndRef.current < DRAG_DBLCLICK_GRACE) return;
    onOpen(app.id);
  };

  return (
    <button
      ref={btnRef}
      data-app-id={app.id}
      className={`flex flex-col items-center gap-1 ${dims.btn} p-2 rounded-xl hover:bg-white/10 transition-colors group cursor-grab active:cursor-grabbing select-none touch-none`}
      style={{
        transform: offset ? `translate3d(${offset.x}px, ${offset.y}px, 0)` : undefined,
      }}
      onPointerDown={startDrag}
      onDoubleClick={handleOpen}
      title={`${app.name} — drag to move, double-click to open`}
    >
      <span
        className={`${dims.tile} rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform`}
        style={{ background: `${app.color}22`, border: `1px solid ${app.color}44`, color: app.color }}
      >
        <app.icon size={dims.glyph} />
      </span>
      <span
        className={`${dims.label} text-center leading-tight`}
        style={{ color: 'var(--wp-fg-hi)', textShadow: 'var(--wp-fg-shadow)' }}
      >
        {app.name}
      </span>
    </button>
  );
}
