import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useWidgets } from '@/context/WidgetsContext';
import { getWorkspaceBounds } from '@/lib/osLayout';
import type { WidgetPlacement, WidgetVariant } from '@/types';
import { snapToGrid } from '@/lib/gridUtils';
import { fitWidgetRect } from '@/lib/osLayout';
import { X, Shrink, Expand } from 'lucide-react';

interface Props {
  placement: WidgetPlacement;
  children: ReactNode;
}

const VARIANT_ORDER: WidgetVariant[] = ['small', 'medium', 'large', 'wide', 'tall'];

export default function WidgetCard({ placement, children }: Props) {
  const { removeWidget, updateWidgetPlacement, moveWidgetVariant, widgetMeta } = useWidgets();
  const { theme } = useTheme();
  const meta = widgetMeta[placement.id];
  const grid = theme.gridSize ?? 24;
  const [dragging, setDragging] = useState(false);
  // Live rect ref so pointermove/up handlers never use stale closure values.
  const rectRef = useRef({ x: placement.x, y: placement.y, w: placement.w, h: placement.h });
  useEffect(() => {
    rectRef.current = { x: placement.x, y: placement.y, w: placement.w, h: placement.h };
  }, [placement.x, placement.y, placement.w, placement.h]);

  const startDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    // Interactive elements keep their own behavior — drag only starts from
    // empty space (buttons, links, form fields, editable regions, the resize
    // handle, or anything marked data-no-drag).
    if (
      (e.target as HTMLElement).closest(
        'button, a, input, select, textarea, [contenteditable="true"], [data-no-drag], .widget-resize-handle',
      )
    ) {
      return;
    }
    e.preventDefault();
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    const sx = e.clientX;
    const sy = e.clientY;
    const { x: ox, y: oy, w, h } = rectRef.current;

    const onMove = (ev: PointerEvent) => {
      const bounds = getWorkspaceBounds(theme);
      // Viewport-relative clamp: never inside the header, never past the taskbar.
      const fitted = fitWidgetRect({ x: ox + ev.clientX - sx, y: oy + ev.clientY - sy, w, h }, bounds);
      updateWidgetPlacement(placement.instance, { x: fitted.x, y: fitted.y });
    };
    const onUp = () => {
      // Snap the *live* position, not the stale render-time one.
      const live = rectRef.current;
      updateWidgetPlacement(placement.instance, {
        x: snapToGrid(live.x, grid),
        y: snapToGrid(live.y, grid),
      });
      setDragging(false);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  const startResize = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    e.preventDefault();
    const sx = e.clientX;
    const sy = e.clientY;
    const { w: ow, h: oh, x, y } = rectRef.current;

    const onMove = (ev: PointerEvent) => {
      const bounds = getWorkspaceBounds(theme);
      // Max yields to the minimums on tiny viewports so size never inverts.
      // Widget coords are viewport-relative: the usable height below y runs
      // to the taskbar (workspace height + top inset), not bounds.height.
      const maxW = Math.max(160, bounds.width - x);
      const maxH = Math.max(110, bounds.height + bounds.top - y);
      updateWidgetPlacement(placement.instance, {
        w: Math.min(Math.max(160, ow + ev.clientX - sx), maxW),
        h: Math.min(Math.max(110, oh + ev.clientY - sy), maxH),
      });
    };
    const onUp = () => {
      const live = rectRef.current;
      updateWidgetPlacement(placement.instance, {
        w: snapToGrid(live.w, grid),
        h: snapToGrid(live.h, grid),
      });
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  const cycleVariant = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!meta) return;
    const idx = VARIANT_ORDER.indexOf(placement.variant as WidgetVariant);
    const supported = VARIANT_ORDER.filter((v) => meta.variants[v]);
    const next = supported[(idx + 1) % supported.length] ?? meta.defaultVariant;
    moveWidgetVariant(placement.instance, next);
  };

  const remove = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeWidget(placement.instance);
  };

  return (
    <div
      className={`widget-card cursor-grab active:cursor-grabbing ${dragging ? 'dragging' : ''}`}
      style={{
        left: placement.x,
        top: placement.y,
        width: placement.w,
        height: placement.h,
        zIndex: 30,
        touchAction: 'none',
      }}
      onPointerDown={startDrag}
    >
      {/* header — title + variant/remove controls (double-click cycles variant) */}
      <div
        className="flex items-center gap-1 px-2 h-7 select-none"
        onDoubleClick={cycleVariant}
      >
        <span className="text-[10px] font-medium truncate flex-1" style={{ color: 'var(--text-mid)' }}>
          {meta?.name ?? placement.id}
        </span>
        {meta && Object.keys(meta.variants).length > 1 && (
          <button
            className="icon-btn w-5 h-5"
            title={`Variant: ${placement.variant} (double-click header to cycle)`}
            onClick={cycleVariant}
          >
            {placement.variant === 'small' ? <Shrink size={11} /> : <Expand size={11} />}
          </button>
        )}
        <button className="icon-btn w-5 h-5" title="Remove" onClick={remove}>
          <X size={12} />
        </button>
      </div>

      {/* body */}
      <div className="px-3 pb-3 overflow-hidden" style={{ height: placement.h - 28 }}>
        {children}
      </div>

      <div className="widget-resize-handle" style={{ touchAction: 'none' }} onPointerDown={startResize} />
    </div>
  );
}
