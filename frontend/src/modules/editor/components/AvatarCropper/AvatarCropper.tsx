import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, LoaderCircle, ZoomIn, ZoomOut, X } from 'lucide-react';
import { Z_OVERLAY_TOP } from '@/lib/osLayout';

/** On-screen square viewport (px) and exported square size (px). */
const VIEW = 288;
const OUTPUT = 512;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Geometry for the current zoom in image-pixel space. Cover-scales the image
 *  so it always fills the square viewport, then crops a centred square. */
function geometry(width: number, height: number, zoom: number) {
  const cover = Math.max(VIEW / width, VIEW / height);
  const scale = cover * zoom;
  const size = VIEW / scale;
  return { scale, size };
}

/** Square crop-and-downscale dialog. Panorama/potrait photos are panned and
 *  zoomed to choose the focal point; the result is exported at OUTPUT×OUTPUT
 *  (JPEG) so a multi-MB source becomes a small, right-facing avatar. */
export default function AvatarCropper({
  file,
  onCancel,
  onConfirm,
}: {
  file: File;
  onCancel: () => void;
  onConfirm: (blob: Blob) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bitmapRef = useRef<ImageBitmap | null>(null);
  const dragRef = useRef<{ x: number; y: number; cx: number; cy: number } | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let cancelled = false;
    createImageBitmap(file, { imageOrientation: 'from-image' })
      .then((bmp) => {
        if (cancelled) {
          bmp.close();
          return;
        }
        bitmapRef.current = bmp;
        setCenter({ x: bmp.width / 2, y: bmp.height / 2 });
        setReady(true);
      })
      .catch(() => setError('That image could not be read. Try a JPG or PNG.'));
    return () => {
      cancelled = true;
      bitmapRef.current?.close();
      bitmapRef.current = null;
    };
  }, [file]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const bmp = bitmapRef.current;
    if (!canvas || !bmp) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = VIEW * dpr;
    canvas.height = VIEW * dpr;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, VIEW, VIEW);
    ctx.imageSmoothingQuality = 'high';
    const { size } = geometry(bmp.width, bmp.height, zoom);
    ctx.drawImage(bmp, center.x - size / 2, center.y - size / 2, size, size, 0, 0, VIEW, VIEW);
  }, [zoom, center]);

  useEffect(() => {
    if (ready) draw();
  }, [ready, draw]);

  // Keep the crop inside the image whenever zoom changes.
  useEffect(() => {
    const bmp = bitmapRef.current;
    if (!bmp) return;
    const { size } = geometry(bmp.width, bmp.height, zoom);
    setCenter((c) => ({
      x: clamp(c.x, size / 2, bmp.width - size / 2),
      y: clamp(c.y, size / 2, bmp.height - size / 2),
    }));
  }, [zoom]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!ready) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { x: e.clientX, y: e.clientY, cx: center.x, cy: center.y };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const bmp = bitmapRef.current;
    if (!drag || !bmp) return;
    const { scale, size } = geometry(bmp.width, bmp.height, zoom);
    setCenter({
      x: clamp(drag.cx - (e.clientX - drag.x) / scale, size / 2, bmp.width - size / 2),
      y: clamp(drag.cy - (e.clientY - drag.y) / scale, size / 2, bmp.height - size / 2),
    });
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    dragRef.current = null;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
  };

  const confirm = () => {
    const bmp = bitmapRef.current;
    if (!bmp) return;
    setBusy(true);
    const { size } = geometry(bmp.width, bmp.height, zoom);
    const out = document.createElement('canvas');
    out.width = OUTPUT;
    out.height = OUTPUT;
    const ctx = out.getContext('2d');
    if (!ctx) {
      setBusy(false);
      return;
    }
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, OUTPUT, OUTPUT);
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(bmp, center.x - size / 2, center.y - size / 2, size, size, 0, 0, OUTPUT, OUTPUT);
    out.toBlob(
      (blob) => {
        setBusy(false);
        if (blob) onConfirm(blob);
        else setError('Could not process that image.');
      },
      'image/jpeg',
      0.9,
    );
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Crop profile picture"
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(6px)', zIndex: Z_OVERLAY_TOP }}
      onClick={onCancel}
    >
      <div
        className="w-full max-w-xs rounded-2xl p-4 space-y-3"
        style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)', boxShadow: '0 24px 60px rgba(0,0,0,.5)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-hi)' }}>
            Crop your picture
          </h3>
          <button
            type="button"
            aria-label="Cancel"
            className="btn-ghost !p-1.5"
            onClick={onCancel}
          >
            <X size={14} />
          </button>
        </div>

        <div
          className="relative mx-auto overflow-hidden rounded-2xl"
          style={{ width: VIEW, height: VIEW, maxWidth: '100%', background: '#000', touchAction: 'none' }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <canvas
            ref={canvasRef}
            className="block w-full h-full"
            style={{ cursor: ready ? 'grab' : 'default' }}
          />
          {ready && (
            <>
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ borderRadius: '9999px', boxShadow: '0 0 0 9999px rgba(0,0,0,.55)' }}
              />
              <div
                className="absolute inset-0 pointer-events-none rounded-full"
                style={{ border: '2px solid rgba(255,255,255,.75)' }}
              />
            </>
          )}
          {!ready && !error && (
            <div className="absolute inset-0 flex items-center justify-center">
              <LoaderCircle size={20} className="animate-spin" style={{ color: '#fff' }} />
            </div>
          )}
        </div>

        {error ? (
          <p className="text-[11px] text-center" style={{ color: 'var(--error)' }}>
            {error}
          </p>
        ) : (
          <p className="text-[11px] text-center" style={{ color: 'var(--text-low)' }}>
            Drag to reposition · slide to zoom
          </p>
        )}

        <div className="flex items-center gap-2">
          <ZoomOut size={14} style={{ color: 'var(--text-mid)' }} />
          <input
            type="range"
            min={1}
            max={4}
            step={0.01}
            value={zoom}
            aria-label="Zoom"
            disabled={!ready}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1"
            style={{ accentColor: 'var(--accent)' }}
          />
          <ZoomIn size={14} style={{ color: 'var(--text-mid)' }} />
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <button type="button" className="btn-ghost text-[11px] !py-1.5" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button type="button" className="btn-accent text-[11px] !py-1.5" onClick={confirm} disabled={!ready || busy || Boolean(error)}>
            {busy ? <LoaderCircle size={12} className="animate-spin" /> : <Check size={12} />}
            {busy ? 'Saving…' : 'Use picture'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
