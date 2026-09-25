import { useMemo, useRef, useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useWindows } from '@/context/WindowsContext';
import { getDockRects, getWindowSpawnBounds } from '@/lib/osLayout';
import { APP_REGISTRY, EDITABLE_APPS } from '@/apps/registry';
import type { AppId, EditorSection, WindowData } from '@/types';
import SkillsTab from '@/modules/editor/components/SkillsTab/SkillsTab';
import ProjectsTab from '@/modules/editor/components/ProjectsTab/ProjectsTab';
import ExperienceTab from '@/modules/editor/components/ExperienceTab/ExperienceTab';
import ProfileTab from '@/modules/editor/components/ProfileTab/ProfileTab';
import FloatingSaveButton from '@/modules/editor/components/FloatingSaveButton/FloatingSaveButton';
import type { SaveBridge } from '@/modules/editor/lib/scaffolding';

export default function EditorScreen({ data }: { data?: WindowData }) {
  const { theme } = useTheme();
  const { windows, focusedId, launchApp, focusWindow, updateWindowRect, updateWindowData } = useWindows();
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

  // The editor window driving this screen: the focused one (clicks inside a
  // window focus it before any handler runs), falling back to the editor that
  // owns this section when the focus write hasn't landed yet.
  const my =
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
    const b = getWindowSpawnBounds(theme);
    const editorMin = APP_REGISTRY.find((a) => a.id === 'editor')?.minSize ?? { w: 420, h: 460 };
    const { left, right } = getDockRects(theme, editorMin);
    const onLeft = my.x + my.w / 2 < b.width / 2;
    const editorRect = onLeft ? left : right;
    const contentRect = onLeft ? right : left;
    updateWindowRect(my.id, editorRect);

    // Open (or focus + retile) the app on the other half.
    const existing = windows.find((w) => w.appId === appId);
    let contentId: string | undefined;
    if (existing) {
      updateWindowRect(existing.id, contentRect);
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
      <div className="flex flex-wrap gap-1.5">
        {selectableApps.map(({ app, section: s }) => {
          const active = s !== null && s === section;
          return (
            <button
              key={app.id}
              className={`chip cursor-pointer !py-1.5 !px-2.5 text-[11px] flex items-center gap-1.5 ${active ? '!bg-[var(--accent)] !text-[var(--accent-text-on)]' : ''}`}
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
      </div>

      <FloatingSaveButton canSave={saveState.canSave} saving={saveState.saving} onSave={() => commitRef.current?.()} />
    </div>
  );
}