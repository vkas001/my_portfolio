import { useRef } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useWindows } from '@/context/WindowsContext';
import { useShellUI } from '@/context/ShellUIContext';
import { APP_REGISTRY } from '@/apps/registry';
import WindowFrame from '@/components/shell/WindowFrame/WindowFrame';
import ModuleHost from '@/components/shell/ModuleHost/ModuleHost';
import TopBar from '@/components/shell/TopBar/TopBar';
import Taskbar from '@/components/shell/Taskbar/Taskbar';
import StartMenu from '@/components/shell/StartMenu/StartMenu';
import DesktopIcon, { SWAP_OVERLAP } from '@/components/shell/DesktopIcon/DesktopIcon';
import { WidgetsPanel } from '@/modules/widgets';
import { useIsMobile, useLocalStorage } from '@/lib/hooks';
import { Z_HOME_INDICATOR } from '@/lib/osLayout';
import MobileNotice from '@/components/shell/MobileNotice/MobileNotice';
import type { AppId } from '@/types';

const FORCE_OS_ON_MOBILE_KEY = 'portfolio.forceOsOnMobile';

export default function Desktop() {
  const { theme, setTheme } = useTheme();
  const { setViewMode } = useShellUI();
  const { windows, launchApp } = useWindows();
  const isMobile = useIsMobile();
  const [forceOsOnMobile, setForceOsOnMobile] = useLocalStorage(FORCE_OS_ON_MOBILE_KEY, false);
  // Live theme mirror: drag/drop handlers are captured at pointerdown, but a
  // drag spans several theme commits (live swaps) — reading render-scope
  // `theme` there would commit stale offsets and wipe the victim's spot
  // (swap "goes back" on release). The ref is always current.
  const themeRef = useRef(theme);
  themeRef.current = theme;

  // Global shortcuts + shared overlays (Spotlight, ContactModal) live in
  // AppShell so they keep working in Web view too.

  // Swap predicate: the dragged icon must sit squarely ABOVE the other —
  // its center inside the other's rect plus a real majority overlap — so
  // merely brushing past an icon mid-drag never yanks it out of place.
  // MARKER v3-hyst-center-rule
  const overlapSwapTarget = (
    rD: { left: number; top: number; right: number; bottom: number; width: number; height: number },
    r: { left: number; top: number; right: number; bottom: number; width: number; height: number },
  ): number => {
    const cx = rD.left + rD.width / 2;
    const cy = rD.top + rD.height / 2;
    const centerInside =
      cx > r.left + 2 && cx < r.right - 2 && cy > r.top + 2 && cy < r.bottom - 2;
    if (!centerInside) return 0;
    const ix = Math.max(0, Math.min(rD.right, r.right) - Math.max(rD.left, r.left));
    const iy = Math.max(0, Math.min(rD.bottom, r.bottom) - Math.max(rD.top, r.top));
    const overlap = ix * iy;
    const frac = overlap / Math.min(rD.width * rD.height, r.width * r.height);
    return frac > SWAP_OVERLAP ? overlap : 0;
  };
  // Hold predicate (hysteresis): once an icon is the swap victim it STAYS the
  // victim until the dragged icon has clearly left — center outside the
  // victim's original slot by a margin, or overlap collapsed. Without this,
  // pointer jitter on the strict boundary above flip-flops the victim every
  // frame.
  const HOLD_MARGIN = 10;
  const victimHeld = (
    rD: { left: number; top: number; right: number; bottom: number; width: number; height: number },
    r: { left: number; top: number; right: number; bottom: number },
  ): boolean => {
    const cx = rD.left + rD.width / 2;
    const cy = rD.top + rD.height / 2;
    return (
      cx > r.left - HOLD_MARGIN && cx < r.right + HOLD_MARGIN &&
      cy > r.top - HOLD_MARGIN && cy < r.bottom + HOLD_MARGIN
    );
  };
  // Live-swap bookkeeping for icon drags. Snapshot = theme offsets when the
  // drag started (the dragged icon's true pre-drag spot); slot = the dragged
  // icon's natural column slot (constant for the whole drag); victim = the
  // currently displaced icon + the slot rect it was taken from.
  const dragSnapRef = useRef<Record<string, { x: number; y: number }> | null>(null);
  const dragSlotRef = useRef<{ id: string; x: number; y: number } | null>(null);
  const dragVictimRef = useRef<{ id: string; left: number; top: number; right: number; bottom: number } | null>(null);

  const handleIconDragStart = (id: AppId) => {
    const offs = themeRef.current.desktopIconOffsets ?? {};
    dragSnapRef.current = { ...offs };
    const mine = document
      .querySelector('.desktop-area')
      ?.querySelector<HTMLButtonElement>(`[data-app-id="${id}"]`);
    if (mine) {
      const r = mine.getBoundingClientRect();
      const o = offs[id] ?? { x: 0, y: 0 };
      dragSlotRef.current = { id, x: r.left - o.x, y: r.top - o.y };
    } else {
      dragSlotRef.current = null;
    }
    dragVictimRef.current = null;
  };

  // Runs on every painted drag frame: if the dragged icon now covers a
  // different icon, swap the victim out to the dragged icon's pre-drag spot
  // immediately (phone-home-screen style) and remember it, so the next frame
  // either restores it (moved on) or leaves it (still covered). Commits only
  // when the victim changes — never per frame.
  const handleIconLiveMove = (id: AppId) => {
    const snap = dragSnapRef.current;
    const slot = dragSlotRef.current;
    if (!snap || !slot || slot.id !== id) return;
    const area = document.querySelector('.desktop-area');
    const mine = area?.querySelector<HTMLButtonElement>(`[data-app-id="${id}"]`);
    if (!mine) return;
    const offs = themeRef.current.desktopIconOffsets ?? {};
    const rD = mine.getBoundingClientRect();
    // A held victim sticks: while the dragged icon is still over the slot
    // the victim was taken from, skip the whole search — boundary jitter
    // can't flip-flop victims, and (crucially) we never "restore" a victim
    // into the pointer's current spot just because it teleported away.
    const curVictim = dragVictimRef.current;
    if (curVictim && victimHeld(rD, curVictim)) return;
    let best: { el: HTMLButtonElement } | null = null;
    let bestOverlap = 0;
    const others = area?.querySelectorAll<HTMLButtonElement>('[data-app-id]');
    if (others) {
      for (const el of Array.from(others)) {
        if (el === mine) continue;
        const overlap = overlapSwapTarget(rD, el.getBoundingClientRect());
        if (overlap > bestOverlap) {
          best = { el };
          bestOverlap = overlap;
        }
      }
    }
    const bestId = best?.el.dataset.appId ?? null;
    // Idle frame (nobody displaced, nobody covered): commit nothing, so no
    // re-render churn mid-drag. (strict implies hold, so bestId can never
    // re-pick a victim whose hold just failed — no flip-flop.)
    if (!bestId && !curVictim) return;
    const prevVictim = curVictim?.id ?? null;
    const next: Record<string, { x: number; y: number }> = { ...offs };
    // The icon we just left goes home to its pre-drag spot.
    if (prevVictim && prevVictim !== bestId) {
      if (snap[prevVictim]) next[prevVictim] = snap[prevVictim];
      else delete next[prevVictim];
    }
    if (bestId && best) {
      const rB = best.el.getBoundingClientRect();
      const oB = offs[bestId] ?? { x: 0, y: 0 };
      const slotB = { x: rB.left - oB.x, y: rB.top - oB.y };
      const origin = snap[id] ?? { x: 0, y: 0 };
      const prevD = { x: slot.x + origin.x, y: slot.y + origin.y };
      // The dragged icon keeps its live visual (re-render must not snap it
      // back), the victim retreats to the drag origin. Pin the victim's
      // ORIGINAL slot so it holds while covered.
      next[id] = {
        x: Math.round(rD.left - slot.x),
        y: Math.round(rD.top - slot.y),
      };
      next[bestId] = {
        x: Math.round(prevD.x - slotB.x),
        y: Math.round(prevD.y - slotB.y),
      };
      dragVictimRef.current = {
        id: bestId,
        left: rB.left,
        top: rB.top,
        right: rB.right,
        bottom: rB.bottom,
      };
    } else {
      dragVictimRef.current = null;
    }
    setTheme({ desktopIconOffsets: next });
  };

  // Commit a dropped icon offset. Icons never overlap: dropping one squarely
  // on top of another swaps the two, so both land exactly on each other's
  // old spots. (Computed here from the live DOM + render-scope theme — never
  // inside a setTheme updater, which must stay pure under StrictMode.)
  const commitIconOffset = (id: AppId, o: { x: number; y: number }) => {
    const offs = themeRef.current.desktopIconOffsets ?? {};
    let next: Record<string, { x: number; y: number }> = { ...offs, [id]: o };
    const area = document.querySelector('.desktop-area');
    const mine = area?.querySelector<HTMLButtonElement>(`[data-app-id="${id}"]`);
    if (mine) {
      const rD = mine.getBoundingClientRect();
      let best: { el: HTMLButtonElement; overlap: number } | null = null;
      const others = area?.querySelectorAll<HTMLButtonElement>('[data-app-id]');
      if (others) {
        for (const el of Array.from(others)) {
          if (el === mine) continue;
          const rb = el.getBoundingClientRect();
          const overlap = overlapSwapTarget(rD, rb);
          if (overlap > 0 && (!best || overlap > best.overlap)) best = { el, overlap };
        }
      }
      if (best?.el.dataset.appId) {
        const otherId = best.el.dataset.appId;
        const rB = best.el.getBoundingClientRect();
        const oB = offs[otherId] ?? { x: 0, y: 0 };
        // Natural (untranslated) slots: the dragged icon takes the other's
        // visual spot; the other retreats to the dragged icon's PRE-DRAG
        // spot (its theme offset, untouched by this drag) — a true position
        // swap. (Sending it to the drop point would be a no-op, since the
        // drop point IS the other's spot.)
        const oOld = dragSnapRef.current?.[id] ?? offs[id] ?? { x: 0, y: 0 };
        const slotD = { x: rD.left - o.x, y: rD.top - o.y };
        const slotB = { x: rB.left - oB.x, y: rB.top - oB.y };
        const prevD = { x: slotD.x + oOld.x, y: slotD.y + oOld.y };
        next = {
          ...offs,
          [id]: { x: Math.round(rB.left - slotD.x), y: Math.round(rB.top - slotD.y) },
          [otherId]: { x: Math.round(prevD.x - slotB.x), y: Math.round(prevD.y - slotB.y) },
        };
      }
    }
    dragSnapRef.current = null;
    dragVictimRef.current = null;
    dragSlotRef.current = null;
    setTheme({ desktopIconOffsets: next });
  };

  if (isMobile && !forceOsOnMobile) {
    return (
      <MobileNotice
        onUseWeb={() => setViewMode('web')}
        onEnterOs={() => setForceOsOnMobile(true)}
      />
    );
  }

  return (
    <div className="desktop-root">
      {/* Wallpaper dim overlay (Settings → Personalization → Wallpaper effects) */}
      <div className="wallpaper-dim" />
      <TopBar />
      <StartMenu />
      <WidgetsPanel />

      {/* Desktop icons — draggable; offsets persist in theme.desktopIconOffsets */}
      <div className="desktop-area">
        <div className="absolute left-4 top-4 flex flex-col gap-2">
          {APP_REGISTRY.filter((app) => !app.system).map((app) => (
            <DesktopIcon
              key={app.id}
              app={app}
              offset={theme.desktopIconOffsets[app.id]}
              size={theme.desktopIconSize ?? 'medium'}
              onMove={commitIconOffset}
              onOpen={launchApp}
              onDragStart={handleIconDragStart}
              onLiveMove={handleIconLiveMove}
            />
          ))}
        </div>
      </div>

      {/* Windows */}
      {windows.map((win) => (
        <WindowFrame key={win.id} win={win}>
          <ModuleHost appId={win.appId} data={win.data} windowId={win.id} />
        </WindowFrame>
      ))}

      <Taskbar />

      {/* Home indicator (Settings → Taskbar, ported from ibiz_v2) */}
      {theme.showHomeIndicator && (
        <div className="absolute inset-x-0 bottom-1 flex justify-center pointer-events-none" style={{ zIndex: Z_HOME_INDICATOR }}>
          <div
            className="h-1 rounded-full"
            style={{ width: 134, background: 'var(--text-low)', opacity: 0.65 }}
          />
        </div>
      )}
    </div>
  );
}
