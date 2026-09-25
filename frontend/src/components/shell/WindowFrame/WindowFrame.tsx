import { useCallback, useRef, type ReactNode } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useWindows } from '@/context/WindowsContext';
import { getDockRects, getWindowBounds, getWindowSpawnBounds } from '@/lib/osLayout';
import { useAuth } from '@/context/AuthContext';
import { useShellUI } from '@/context/ShellUIContext';
import { APP_REGISTRY, EDITABLE_SECTIONS } from '@/apps/registry';
import type { WindowState } from '@/types';
import { Minus, Plus, Square, X } from 'lucide-react';

interface Props {
  win: WindowState;
  children: ReactNode;
}

export default function WindowFrame({ win, children }: Props) {
  const { theme } = useTheme();
  const { focusedId, focusWindow, closeWindow, minimizeWindow, toggleMaximize, toggleFullScreen, updateWindowRect, launchApp } = useWindows();
  const { isAdmin } = useAuth();
  const { setActiveWidget } = useShellUI();
  const app = APP_REGISTRY.find((a) => a.id === win.appId);
  const focused = focusedId === win.id;
  const section = EDITABLE_SECTIONS.find((e) => e.appId === win.appId)?.section;
  const canEdit = isAdmin && !!section && !win.isFullScreen;
  const frameRef = useRef<HTMLDivElement>(null);

  // Maximized windows fill the workspace down to the bottom of the viewport
  // (the taskbar floats above the frame, so tabs run behind it).
  const bounds = getWindowBounds(theme);
  const rect = win.maximized
    ? { x: 0, y: bounds.top, w: bounds.width, h: bounds.height }
    : { x: win.x, y: win.y + bounds.top, w: win.w, h: win.h };

  // Drag/resize writes the frame geometry straight to the DOM on an
  // rAF-coalesced schedule, so the window tracks the pointer with zero React
  // re-renders and zero layout reads mid-drag (both used to make it lurch
  // behind the mouse). The final rect is committed to context once on release.
  const startDrag = useCallback(
    (mode: 'move' | 'resize') => (e: React.PointerEvent) => {
      if (e.button !== 0) return;
      if (win.isFullScreen) return;
      if (win.maximized && mode === 'move') return;
      focusWindow(win.id);
      const el = frameRef.current;
      if (!el) return;
      el.classList.add('window-dragging');
      (e.target as HTMLElement).setPointerCapture(e.pointerId);

      // Bars can't change mid-drag, so measure the workspace once up front.
      const s = {
        mode,
        sx: e.clientX,
        sy: e.clientY,
        ox: win.x,
        oy: win.y,
        ow: win.w,
        oh: win.h,
        minW: app?.minSize?.w ?? 360,
        minH: app?.minSize?.h ?? 240,
        bounds: getWindowBounds(theme),
      };
      let px = s.sx;
      let py = s.sy;
      let raf = 0;

      const compute = () => {
        const dx = px - s.sx;
        const dy = py - s.sy;
        return s.mode === 'move'
          ? {
              x: Math.min(Math.max(0, s.ox + dx), Math.max(0, s.bounds.width - s.ow)),
              y: Math.min(Math.max(0, s.oy + dy), Math.max(0, s.bounds.height - s.oh)),
              w: s.ow,
              h: s.oh,
            }
          : {
              x: s.ox,
              y: s.oy,
              w: Math.min(Math.max(s.minW, s.ow + dx), Math.max(s.minW, s.bounds.width - s.ox)),
              h: Math.min(Math.max(s.minH, s.oh + dy), Math.max(s.minH, s.bounds.height - s.oy)),
            };
      };

      const paint = () => {
        raf = 0;
        const r = compute();
        el.style.left = `${r.x}px`;
        // State y is workspace-relative; the frame renders at + bounds.top
        // (top bar). Write viewport coords to the DOM so drag/resize tracks
        // the pointer, but keep the committed rect in workspace space.
        el.style.top = `${r.y + s.bounds.top}px`;
        el.style.width = `${r.w}px`;
        el.style.height = `${r.h}px`;
      };

      const onMove = (ev: PointerEvent) => {
        px = ev.clientX;
        py = ev.clientY;
        if (!raf) raf = window.requestAnimationFrame(paint);
      };

      const onUp = () => {
        if (raf) window.cancelAnimationFrame(raf);
        el.classList.remove('window-dragging');
        const r = compute(); // last pointer wins even if a rAF never fired
        paint();
        updateWindowRect(win.id, r);
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
      };

      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    },
    [win, app, theme, focusWindow, updateWindowRect],
  );

  // Admin "+"/edit: tile the current window into one half of the workspace
  // and open the section editor docked into the other half, side by side.
  const editContent = useCallback(() => {
    if (!section) return;
    if (win.maximized) toggleMaximize(win.id); // unmaximize before tiling
    // Tile inside the space above the taskbar so the docked editor + content
    // window never collide with the bar (drag can still go behind it).
    const b = getWindowSpawnBounds(theme);
    const editorMin = APP_REGISTRY.find((a) => a.id === 'editor')?.minSize ?? { w: 420, h: 460 };
    const { left, right } = getDockRects(theme, editorMin);
    const onLeft = win.x + win.w / 2 < b.width / 2;
    const contentRect = onLeft ? left : right;
    const editorRect = onLeft ? right : left;
    updateWindowRect(win.id, contentRect);
    launchApp('editor', {
      rect: editorRect,
      data: {
        section,
        // Remember the content window's pre-tile geometry so closing the
        // editor can restore it (win.x/y/w/h hold the restore geometry even
        // when the window started maximized).
        dock: { contentId: win.id, rect: { x: win.x, y: win.y, w: win.w, h: win.h } },
      },
    });
  }, [section, win.id, win.x, win.w, win.maximized, theme, toggleMaximize, updateWindowRect, launchApp]);

  // Full screen (green traffic light): covers the entire viewport, above the
  // top bar and taskbar (which auto-hides), with flat edges and no shadow.
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
      onPointerDown={() => { setActiveWidget(null); focusWindow(win.id); }}
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
          {canEdit && (
            <button
              className="icon-btn w-5 h-5"
              aria-label="Edit content"
              title={`Edit ${app?.name} content`}
              onClick={(e) => { e.stopPropagation(); editContent(); }}
              onPointerDown={(e) => e.stopPropagation()}
              style={{ color: 'var(--accent)' }}
            >
              <Plus size={11} />
            </button>
          )}
          <button
            className="tl-btn tl-min"
            aria-label="Minimize"
            onClick={(e) => { e.stopPropagation(); minimizeWindow(win.id); }}
            onPointerDown={(e) => e.stopPropagation()}
          />
          <button
            className="tl-btn tl-max"
            aria-label={win.isFullScreen ? 'Exit full screen' : 'Full screen'}
            title={win.isFullScreen ? 'Exit full screen' : 'Full screen'}
            onClick={(e) => { e.stopPropagation(); toggleFullScreen(win.id); }}
            onPointerDown={(e) => e.stopPropagation()}
          />
          <button className="tl-btn tl-close" aria-label="Close" onClick={(e) => { e.stopPropagation(); closeWindow(win.id); }} onPointerDown={(e) => e.stopPropagation()} />
        </div>
      </div>

      <div className="window-body">{children}</div>

      {app?.resizable !== false && !win.maximized && !win.isFullScreen && (
        <>
          {/* corner + edge resize handles. The frame has a large border-radius,
              which clips its own corners — the corner grab must be big enough
              that the rounded clip still leaves a usable hit target. */}
          <div onPointerDown={startDrag('resize')} className="absolute right-0 bottom-0 w-6 h-6 cursor-nwse-resize" />
          <div onPointerDown={startDrag('resize')} className="absolute right-0 top-10 bottom-4 w-2 cursor-ew-resize" />
          <div onPointerDown={startDrag('resize')} className="absolute left-0 right-4 bottom-0 h-2 cursor-ns-resize" />
        </>
      )}
      {/* keep icon imports used for potential future toolbar */}
      <span className="hidden"><Minus /><Square /><X /></span>
    </div>
  );
}
