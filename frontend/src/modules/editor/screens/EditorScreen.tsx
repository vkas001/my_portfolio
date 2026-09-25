import { useMemo, useRef, useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useWindows } from '@/context/WindowsContext';
import { getDockRects, getWindowSpawnBounds } from '@/lib/osLayout';
import { APP_REGISTRY, EDITABLE_SECTIONS } from '@/apps/registry';
import type { EditorSection, WindowData } from '@/types';
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

  const appSelector = EDITABLE_SECTIONS.flatMap((entry) => {
    const app = APP_REGISTRY.find((a) => a.id === entry.appId);
    return app ? [{ ...entry, app }] : [];
  });

  // Switch which app this editor manages: restore the previously docked
  // content window, then tile the editor + selected app side by side (same
  // geometry as the titlebar ＋ edit flow) and update this window's section +
  // dock so the close-restore stays coherent.
  const openSection = (next: EditorSection) => {
    if (next === section) return;
    const entry = EDITABLE_SECTIONS.find((e) => e.section === next);
    if (!entry) return;
    setSection(next);
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

    // Open (or focus + retile) the content app on the other half.
    const existing = windows.find((w) => w.appId === entry.appId);
    let contentId: string | undefined;
    if (existing) {
      updateWindowRect(existing.id, contentRect);
      contentId = existing.id;
    } else {
      contentId = launchApp(entry.appId, { rect: contentRect });
    }
    focusWindow(my.id);

    if (contentId) {
      const restoreRect = existing
        ? { x: existing.x, y: existing.y, w: existing.w, h: existing.h }
        : contentRect;
      updateWindowData(my.id, { section: next, dock: { contentId, rect: restoreRect } });
    }
  };

  return (
    <div className="relative flex flex-col h-full gap-3">
      <div className="flex flex-wrap gap-1.5">
        {appSelector.map(({ app, section: s }) => (
          <button
            key={s}
            className={`chip cursor-pointer !py-1.5 !px-2.5 text-[11px] flex items-center gap-1.5 ${section === s ? '!bg-[var(--accent)] !text-[var(--accent-text-on)]' : ''}`}
            onClick={() => openSection(s)}
            title={`Edit ${app.name} content`}
            style={section === s ? undefined : { color: app.color }}
          >
            <app.icon size={12} />
            {app.name}
          </button>
        ))}
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