import { useEffect, useMemo, useRef, useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useWindows } from '@/context/WindowsContext';
import { getDockRects } from '@/lib/osLayout';
import { APP_REGISTRY, EDITABLE_APPS } from '@/apps/registry';
import type { AppId, EditorSection, WindowData } from '@/types';
import SkillsTab from '@/modules/editor/components/SkillsTab/SkillsTab';
import ProjectsTab from '@/modules/editor/components/ProjectsTab/ProjectsTab';
import ExperienceTab from '@/modules/editor/components/ExperienceTab/ExperienceTab';
import EducationTab from '@/modules/editor/components/EducationTab/EducationTab';
import HobbiesTab from '@/modules/editor/components/HobbiesTab/HobbiesTab';
import ProfileTab from '@/modules/editor/components/ProfileTab/ProfileTab';
import FloatingSaveButton from '@/modules/editor/components/FloatingSaveButton/FloatingSaveButton';
import type { SaveBridge } from '@/modules/editor/lib/scaffolding';

export default function EditorScreen({ data, windowId }: { data?: WindowData; windowId?: string }) {
  const { theme } = useTheme();
  const { windows, focusedId, launchApp, focusWindow, restoreWindow, toggleMaximize, updateWindowRect, updateWindowData } = useWindows();
  const [section, setSection] = useState<EditorSection>(data?.section ?? 'profile');
  const commitRef = useRef<(() => void) | null>(null);
  const [saveState, setSaveState] = useState({ canSave: false, saving: false });
  const lastSave = useRef({ canSave: false, saving: false });
  const reportSave = useMemo(() => (s: { canSave: boolean; saving: boolean }) => {
    const p = lastSave.current;
    if (p.canSave !== s.canSave || p.saving !== s.saving) {
      lastSave.current = s;
      setSaveState(s);
    }
  }, []);
  const bridge: SaveBridge = { commitRef, reportSave };
  // Single-line pill strip: a mouse wheel sends vertical deltas, so translate
  // them into horizontal scrolling. Native non-passive listener — React's
  // onWheel is passive at the root and can't preventDefault. Trackpad
  // horizontal gestures (deltaX-dominant) and edge overscroll are left alone.
  const stripRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = stripRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      const max = el.scrollWidth - el.clientWidth;
      if (max <= 0) return;
      const atStart = el.scrollLeft <= 0;
      const atEnd = el.scrollLeft >= max - 1;
      if ((e.deltaY > 0 && atEnd) || (e.deltaY < 0 && atStart)) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };
    el.addEventListener('wheel', onWheel, { passive: false });

    // Mouse drag-to-scroll (touch/pen keep native overflow scrolling).
    // A small threshold keeps plain clicks untouched; a real drag suppresses
    // the click that follows so a swipe never activates a pill.
    let down = false;
    let dragging = false;
    let suppressClick = false;
    let startX = 0;
    let startScroll = 0;
    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      down = true;
      dragging = false;
      startX = e.clientX;
      startScroll = el.scrollLeft;
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!down || e.pointerType !== 'mouse') return;
      if (!dragging) {
        if (Math.abs(e.clientX - startX) <= 6) return;
        if (el.scrollWidth - el.clientWidth <= 0) return;
        dragging = true;
        try { el.setPointerCapture(e.pointerId); } catch { /* noop */ }
        el.style.cursor = 'grabbing';
      }
      el.scrollLeft = startScroll - (e.clientX - startX);
    };
    const endDrag = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      if (dragging) suppressClick = true;
      down = false;
      dragging = false;
      el.style.cursor = '';
    };
    const onClickCapture = (e: MouseEvent) => {
      if (!suppressClick) return;
      suppressClick = false;
      e.preventDefault();
      e.stopPropagation();
    };
    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('pointerup', endDrag);
    el.addEventListener('pointercancel', endDrag);
    el.addEventListener('click', onClickCapture, true);
    return () => {
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('pointerdown', onPointerDown);
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('pointerup', endDrag);
      el.removeEventListener('pointercancel', endDrag);
      el.removeEventListener('click', onClickCapture, true);
    };
  }, []);

  // The editor window driving this screen. Prefer the window that actually
  // mounts this instance (windowId), then the focused editor — focus is
  // written on pointerdown and React-batched, so a chip click fires before
  // focusedId updates and !windowId could target a *different* editor.
  const my =
    (windowId && windows.find((w) => w.id === windowId && w.appId === 'editor')) ??
    windows.find((w) => w.id === focusedId && w.appId === 'editor') ??
    windows.find((w) => w.appId === 'editor' && w.data?.section === section);

  const selectableApps = EDITABLE_APPS.flatMap((entry) => {
    const app = APP_REGISTRY.find((a) => a.id === entry.appId);
    return app ? [{ ...entry, app }] : [];
  });

  // Dock any selectable app next to this editor: restore the previously
  // docked content window, then tile the editor + app side by side (same
  // geometry as the titlebar ＋ edit flow) and update this window's dock so
  // the close-restore stays coherent. Content apps also carry the section
  // they manage; dock-only apps (contact) leave the current section alone.
  const dockApp = (appId: AppId, newSection?: EditorSection) => {
    if (!my) return;

    // Restore the window this editor was previously docked to.
    const prevDock = my.data?.dock;
    if (prevDock && windows.some((w) => w.id === prevDock.contentId)) {
      updateWindowRect(prevDock.contentId, prevDock.rect);
    }

    // Re-tile the pair inside the space above the taskbar so the docked
    // editor + content window never collide with the bar.
    const editorMin = APP_REGISTRY.find((a) => a.id === 'editor')?.minSize ?? { w: 420, h: 460 };
    const { left, right } = getDockRects(theme, editorMin);
    // A workspace-covering editor (opened on its own) must drop back to a
    // floating tab before it can take a half — rect writes are ignored while
    // maximized, same reason the titlebar edit flow un-maximizes first.
    // The editor always keeps the right half (content always left) so
    // switching sections never flings the pair across the screen.
    const wasMaximized = my.maximized;
    // The editor always docks to the right half; the content app takes the left,
    // regardless of where the editor was sitting when it was maximized/centred.
    const editorRect = right;
    const contentRect = left;
    if (wasMaximized) toggleMaximize(my.id);
    updateWindowRect(my.id, editorRect);

    // Open (or focus + retile) the app on the other half. A reused window
    // must be raised above any previously docked content windows piled in
    // the same half — otherwise only the editor section changes while the
    // stale window stays visible on the left.
    const existing = windows.find((w) => w.appId === appId);
    let contentId: string | undefined;
    if (existing) {
      updateWindowRect(existing.id, contentRect);
      restoreWindow(existing.id);
      contentId = existing.id;
    } else {
      contentId = launchApp(appId, { rect: contentRect });
    }
    focusWindow(my.id);

    if (contentId) {
      const restoreRect = existing
        ? { x: existing.x, y: existing.y, w: existing.w, h: existing.h }
        : contentRect;
      updateWindowData(my.id, { section: newSection ?? section, dock: { contentId, rect: restoreRect } });
    }
  };

  const chooseApp = (appId: AppId, newSection: EditorSection | null) => {
    if (newSection) {
      if (newSection === section) return; // already active — click is a no-op
      setSection(newSection);
    }
    dockApp(appId, newSection ?? undefined);
  };

  return (
    <div className="relative flex flex-col h-full gap-3">
      <div ref={stripRef} className="flex flex-nowrap items-center gap-1.5 overflow-x-auto no-scrollbar cursor-grab select-none">
        {selectableApps.map(({ app, section: s }) => {
          const active = s !== null && s === section;
          return (
            <button
              key={app.id}
              className={`chip cursor-pointer !py-1.5 !px-2.5 text-[11px] flex shrink-0 items-center gap-1.5 ${active ? '!bg-[var(--accent)] !text-[var(--accent-text-on)]' : ''}`}
              onClick={() => chooseApp(app.id, s)}
              title={s ? `Edit ${app.name} content` : `Open ${app.name} alongside`}
              style={active ? undefined : { color: app.color }}
            >
              <app.icon size={12} />
              {app.name}
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto pr-1 -mr-1 pb-14">
        {section === 'profile' ? <ProfileTab {...bridge} /> : null}
        {section === 'skills' ? <SkillsTab {...bridge} /> : null}
        {section === 'projects' ? <ProjectsTab {...bridge} /> : null}
        {section === 'experience' ? <ExperienceTab {...bridge} /> : null}
        {section === 'education' ? <EducationTab {...bridge} /> : null}
        {section === 'hobbies' ? <HobbiesTab {...bridge} /> : null}
      </div>

      <FloatingSaveButton canSave={saveState.canSave} saving={saveState.saving} onSave={() => commitRef.current?.()} />
    </div>
  );
}