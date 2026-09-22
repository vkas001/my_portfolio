import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useOS, getWorkspaceBounds } from '@/context/OSContext';
import type { WidgetPlacement, WidgetVariant } from '@/types';
import { snapToGrid } from '@/lib/gridUtils';
import { X, Shrink, Expand } from 'lucide-react';

interface Props {
  placement: WidgetPlacement;
  children: ReactNode;
}

const VARIANT_ORDER: WidgetVariant[] = ['small', 'medium', 'large', 'wide', 'tall'];

export default function WidgetCard({ placement, children }: Props) {
  const { removeWidget, updateWidgetPlacement, moveWidgetVariant, widgetMeta, theme } = useOS();
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
    // Header buttons handle their own clicks — don't start a drag from them.
    if ((e.target as HTMLElement).closest('button')) return;
    e.preventDefault();
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    const sx = e.clientX;
    const sy = e.clientY;
    const { x: ox, y: oy, w, h } = rectRef.current;

    const onMove = (ev: PointerEvent) => {
      const bounds = getWorkspaceBounds(theme);
      updateWidgetPlacement(placement.instance, {
        x: Math.min(Math.max(0, ox + ev.clientX - sx), Math.max(0, bounds.width - w)),
        y: Math.min(Math.max(0, oy + ev.clientY - sy), Math.max(0, bounds.height - h)),
      });
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
      const maxW = Math.max(160, bounds.width - x);
      const maxH = Math.max(110, bounds.height - y);
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
      className={`widget-card ${dragging ? 'dragging' : ''}`}
      style={{ left: placement.x, top: placement.y, width: placement.w, height: placement.h, zIndex: 30 }}
    >
      {/* header — the only drag handle */}
      <div
        className="flex items-center gap-1 px-2 h-7 cursor-grab active:cursor-grabbing select-none"
        style={{ touchAction: 'none' }}
        onPointerDown={startDrag}
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
