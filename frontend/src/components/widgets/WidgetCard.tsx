import { useRef, useState, type ReactNode } from 'react';
import { useOS, getWorkspaceBounds } from '@/context/OSContext';
import type { WidgetPlacement, WidgetVariant } from '@/types';
import { snapToGrid } from '@/lib/gridUtils';
import { X, Shrink, Expand } from 'lucide-react';

const GRID = 24;

interface Props {
  placement: WidgetPlacement;
  children: ReactNode;
}

const VARIANT_ORDER: WidgetVariant[] = ['small', 'medium', 'large', 'wide', 'tall'];

export default function WidgetCard({ placement, children }: Props) {
  const { removeWidget, updateWidgetPlacement, moveWidgetVariant, widgetMeta } = useOS();
  const meta = widgetMeta[placement.id];
  const cardRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  const startDrag = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    setDragging(true);
    const sx = e.clientX;
    const sy = e.clientY;
    const ox = placement.x;
    const oy = placement.y;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    const onMove = (ev: PointerEvent) => {
      const bounds = getWorkspaceBounds();
      updateWidgetPlacement(placement.instance, {
        x: Math.min(Math.max(0, ox + ev.clientX - sx), Math.max(0, bounds.width - placement.w)),
        y: Math.min(Math.max(0, oy + ev.clientY - sy), Math.max(0, bounds.height - placement.h)),
      });
    };
    const onUp = () => {
      setDragging(false);
      // snap on release
      updateWidgetPlacement(placement.instance, {
        x: snapToGrid(placement.x, GRID),
        y: snapToGrid(placement.y, GRID),
      });
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  const startResize = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    const sx = e.clientX;
    const sy = e.clientY;
    const ow = placement.w;
    const oh = placement.h;

    const onMove = (ev: PointerEvent) => {
      const bounds = getWorkspaceBounds();
      updateWidgetPlacement(placement.instance, {
        w: Math.min(Math.max(160, ow + ev.clientX - sx), bounds.width - placement.x),
        h: Math.min(Math.max(110, oh + ev.clientY - sy), bounds.height - placement.y),
      });
    };
    const onUp = () => {
      updateWidgetPlacement(placement.instance, {
        w: snapToGrid(placement.w, GRID),
        h: snapToGrid(placement.h, GRID),
      });
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  const cycleVariant = () => {
    if (!meta) return;
    const idx = VARIANT_ORDER.indexOf(placement.variant as WidgetVariant);
    const supported = VARIANT_ORDER.filter((v) => meta.variants[v]);
    const next = supported[(idx + 1) % supported.length] ?? meta.defaultVariant;
    moveWidgetVariant(placement.instance, next);
  };

  return (
    <div
      ref={cardRef}
      className={`widget-card ${dragging ? 'dragging' : ''}`}
      style={{ left: placement.x, top: placement.y, width: placement.w, height: placement.h, zIndex: 30 }}
    >
      {/* header */}
      <div
        className="flex items-center gap-1 px-2 h-7 cursor-grab active:cursor-grabbing select-none"
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
        <button className="icon-btn w-5 h-5" title="Remove" onClick={() => removeWidget(placement.instance)}>
          <X size={12} />
        </button>
      </div>

      {/* body */}
      <div className="px-3 pb-3 overflow-hidden" style={{ height: placement.h - 28 }}>
        {children}
      </div>

      <div className="widget-resize-handle" onPointerDown={startResize} />
    </div>
  );
}
