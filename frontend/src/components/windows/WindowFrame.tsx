import { useCallback, useRef, type ReactNode } from 'react';
import { useOS, getWorkspaceBounds } from '@/context/OSContext';
import { APP_REGISTRY } from '@/apps/registry';
import type { WindowState } from '@/types';
import { Expand, Minus, Shrink, Square, X } from 'lucide-react';

interface Props {
  win: WindowState;
  children: ReactNode;
}

export default function WindowFrame({ win, children }: Props) {
  const { theme, focusedId, focusWindow, closeWindow, minimizeWindow, toggleMaximize, toggleFullScreen, updateWindowRect } = useOS();
  const app = APP_REGISTRY.find((a) => a.id === win.appId);
  const focused = focusedId === win.id;
  const frameRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{ mode: 'move' | 'resize'; sx: number; sy: number; ox: number; oy: number; ow: number; oh: number } | null>(null);

  // Maximized windows fill exactly the theme-aware workspace (no overlap/gap).
  const bounds = getWorkspaceBounds(theme);
  const rect = win.maximized
    ? { x: 0, y: bounds.top, w: bounds.width, h: bounds.height }
    : { x: win.x, y: win.y + bounds.top, w: win.w, h: win.h };

  const startDrag = useCallback(
    (mode: 'move' | 'resize') => (e: React.PointerEvent) => {
      if (e.button !== 0) return;
      if (win.isFullScreen) return;
      if (win.maximized && mode === 'move') return;
      focusWindow(win.id);
      dragState.current = { mode, sx: e.clientX, sy: e.clientY, ox: win.x, oy: win.y, ow: win.w, oh: win.h };
      frameRef.current?.classList.add('window-dragging');
      (e.target as HTMLElement).setPointerCapture(e.pointerId);

      const onMove = (ev: PointerEvent) => {
        const s = dragState.current;
        if (!s) return;
        const dx = ev.clientX - s.sx;
        const dy = ev.clientY - s.sy;
        const b = getWorkspaceBounds(theme);
        const minW = app?.minSize?.w ?? 360;
        const minH = app?.minSize?.h ?? 240;

        if (s.mode === 'move') {
          // Fully-contained: the window can never be pushed past an edge.
          updateWindowRect(win.id, {
            x: Math.min(Math.max(0, s.ox + dx), Math.max(0, b.width - s.ow)),
            y: Math.min(Math.max(0, s.oy + dy), Math.max(0, b.height - s.oh)),
          });
        } else {
          updateWindowRect(win.id, {
            w: Math.min(Math.max(minW, s.ow + dx), Math.max(minW, b.width - s.ox)),
            h: Math.min(Math.max(minH, s.oh + dy), Math.max(minH, b.height - s.oy)),
          });
        }
      };

      const onUp = () => {
        dragState.current = null;
        frameRef.current?.classList.remove('window-dragging');
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
      };

      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    },
    [win, app, theme, focusWindow, updateWindowRect],
  );

  // ibiz_v2 fullscreen parity: covers the entire viewport, above the top
  // bar and taskbar, with flat edges and no shadow.
  const style: React.CSSProperties = win.isFullScreen
    ? {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 90,
        borderRadius: 0,
        boxShadow: 'none',
        display: win.minimized ? 'none' : undefined,
      }
    : {
        left: rect.x,
        top: rect.y,
        width: rect.w,
        height: rect.h,
        zIndex: win.z,
        display: win.minimized ? 'none' : undefined,
      };

  return (
    <div
      ref={frameRef}
      className={`window-frame window-open ${win.maximized ? 'maximized' : ''} ${focused ? '' : 'opacity-95'}`}
      style={style}
      onPointerDown={() => focusWindow(win.id)}
      role="dialog"
      aria-label={app?.name}
    >
      <div
        className="window-titlebar"
        onPointerDown={startDrag('move')}
        onDoubleClick={() => toggleMaximize(win.id)}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="leading-none inline-flex" style={{ color: app?.color }}>
            {app ? <app.icon size={14} /> : null}
          </span>
          <span className="text-xs font-medium truncate" style={{ color: 'var(--text-mid)' }}>
            {app?.name}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            className="icon-btn w-5 h-5"
            aria-label={win.isFullScreen ? 'Exit full screen' : 'Full screen'}
            title={win.isFullScreen ? 'Exit full screen' : 'Full screen'}
            onClick={(e) => { e.stopPropagation(); toggleFullScreen(win.id); }}
            onPointerDown={(e) => e.stopPropagation()}
            style={{ color: 'var(--text-mid)' }}
          >
            {win.isFullScreen ? <Shrink size={11} /> : <Expand size={11} />}
          </button>
          <button className="tl-btn tl-min" aria-label="Minimize" onClick={(e) => { e.stopPropagation(); minimizeWindow(win.id); }} onPointerDown={(e) => e.stopPropagation()} />
          <button className="tl-btn tl-max" aria-label="Maximize" onClick={(e) => { e.stopPropagation(); toggleMaximize(win.id); }} onPointerDown={(e) => e.stopPropagation()} />
          <button className="tl-btn tl-close" aria-label="Close" onClick={(e) => { e.stopPropagation(); closeWindow(win.id); }} onPointerDown={(e) => e.stopPropagation()} />
        </div>
      </div>

      <div className="window-body">{children}</div>

      {app?.resizable !== false && !win.maximized && !win.isFullScreen && (
        <>
          {/* corner + edge resize handles */}
          <div onPointerDown={startDrag('resize')} className="absolute right-0 bottom-0 w-4 h-4 cursor-nwse-resize" />
          <div onPointerDown={startDrag('resize')} className="absolute right-0 top-10 bottom-4 w-1.5 cursor-ew-resize" />
          <div onPointerDown={startDrag('resize')} className="absolute left-0 right-4 bottom-0 h-1.5 cursor-ns-resize" />
        </>
      )}
      {/* keep icon imports used for potential future toolbar */}
      <span className="hidden"><Minus /><Square /><X /></span>
    </div>
  );
}
