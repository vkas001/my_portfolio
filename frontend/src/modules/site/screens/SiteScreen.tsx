import { useEffect, useRef, useState } from 'react';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { SITE_NAV } from '@/modules/site/lib/siteNav';
import HeroTile from '@/modules/site/components/HeroTile/HeroTile';
import StatsTile from '@/modules/site/components/StatsTile/StatsTile';
import ContactQuickTile from '@/modules/site/components/ContactQuickTile/ContactQuickTile';
import AboutTile from '@/modules/site/components/AboutTile/AboutTile';
import SkillsTile from '@/modules/site/components/SkillsTile/SkillsTile';
import ProjectsTile from '@/modules/site/components/ProjectsTile/ProjectsTile';
import JourneyTile from '@/modules/site/components/JourneyTile/JourneyTile';
import WritingTile from '@/modules/site/components/WritingTile/WritingTile';
import InterestsTile from '@/modules/site/components/InterestsTile/InterestsTile';
import ContactBand from '@/modules/site/components/ContactBand/ContactBand';

const RAIL_KEY = 'portfolio.webRailCollapsed';

/** YouTube-style collapsed/local-stored rail toggle. */
function loadCollapsed(): boolean {
  try {
    return localStorage.getItem(RAIL_KEY) === '1';
  } catch {
    return false;
  }
}

/** The public website: a bento grid of purpose-built tiles beside the sticky
 *  section rail. Tiles read the same content hooks as the OS apps, but the
 *  layout is the site's own — no app cards, no module host. */
export default function SiteScreen() {
  const [collapsed, setCollapsed] = useState<boolean>(loadCollapsed);
  const [activeId, setActiveId] = useState<string>('site-about');
  const railRef = useRef<HTMLElement>(null);

  const toggleRail = () =>
    setCollapsed((c) => {
      const next = !c;
      try {
        localStorage.setItem(RAIL_KEY, next ? '1' : '0');
      } catch {
        /* storage unavailable */
      }
      return next;
    });

  // Scroll-spy: highlight the rail entry for the tile in view. The band is
  // the top 30% under the header; tall tiles above the viewport still touch
  // it, so the winner is the lowest tile top inside the band — i.e. the
  // section the reader just arrived at, not the one scrolled furthest past.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const band = entries[0]?.rootBounds ? entries[0].rootBounds.height * 0.3 : 270;
        const inBand = entries.filter((e) => e.isIntersecting && e.boundingClientRect.top < band);
        if (!inBand.length) return;
        inBand.sort((a, b) => b.boundingClientRect.top - a.boundingClientRect.top);
        setActiveId(inBand[0].target.id);
      },
      { rootMargin: '0px 0px -70% 0px' },
    );
    SITE_NAV.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  // Rail strip input (matters when the rail collapses to the horizontal
  // mobile strip): vertical wheel maps to horizontal scroll, and the strip
  // is mouse-draggable with real drags suppressing the follow-up click so a
  // swipe never navigates. Trackpad horizontal + touch keep native gestures.
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) >= Math.abs(e.deltaY)) return;
      if (rail.scrollWidth <= rail.clientWidth + 1) return;
      e.preventDefault();
      rail.scrollLeft += e.deltaY;
    };
    rail.addEventListener('wheel', onWheel, { passive: false });

    let downX = 0;
    let startLeft = 0;
    // Press in progress (set on pointerdown, cleared on up/cancel). Gating
    // on this flag rather than e.buttons keeps CDP-synthesized and
    // real-mouse drags on the same path.
    let down = false;
    let dragging = false;
    // Set once a press becomes a real drag; survives pointerup so the
    // capture-phase click guard below can tell a drag-release from a tap.
    let dragged = false;
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      down = true;
      downX = e.clientX;
      startLeft = rail.scrollLeft;
      dragging = false;
      dragged = false;
    };
    const onMove = (e: PointerEvent) => {
      if (!down || e.pointerType !== 'mouse') return;
      const dx = e.clientX - downX;
      if (!dragging) {
        if (Math.abs(dx) <= 6) return;
        if (rail.scrollWidth - rail.clientWidth <= 0) return;
        dragging = true;
        dragged = true;
        try { rail.setPointerCapture(e.pointerId); } catch { /* noop */ }
        rail.style.cursor = 'grabbing';
      }
      rail.scrollLeft = startLeft - dx;
    };
    const onUp = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      down = false;
      dragging = false;
      rail.style.cursor = '';
    };
    // Capture-phase click guard: a real drag must not activate the link
    // under the pointer when the button comes back up.
    const onClick = (e: MouseEvent) => {
      if (dragged) {
        e.stopPropagation();
        e.preventDefault();
        dragged = false;
      }
    };
    rail.addEventListener('pointerdown', onDown);
    rail.addEventListener('pointermove', onMove);
    rail.addEventListener('pointerup', onUp);
    rail.addEventListener('pointercancel', onUp);
    rail.addEventListener('click', onClick, true);
    return () => {
      rail.removeEventListener('wheel', onWheel);
      rail.removeEventListener('pointerdown', onDown);
      rail.removeEventListener('pointermove', onMove);
      rail.removeEventListener('pointerup', onUp);
      rail.removeEventListener('pointercancel', onUp);
      rail.removeEventListener('click', onClick, true);
    };
  }, []);

  return (
    <div className="web-shell">
      <nav ref={railRef} className={`web-rail${collapsed ? ' collapsed' : ''}`} aria-label="Sections">
        <button
          type="button"
          className="web-rail-toggle"
          onClick={toggleRail}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          <span>Collapse</span>
        </button>

        {SITE_NAV.map(({ id, label, icon: Icon }) => (
          <a
            key={id}
            href={`#${id}`}
            // Same-page anchors: a native link-drag would hijack a strip
            // swipe into a ghost-image drag (pointercancel kills the scroll).
            draggable={false}
            className={`web-rail-link${activeId === id ? ' active' : ''}`}
            aria-current={activeId === id ? 'true' : undefined}
            title={collapsed ? label : undefined}
          >
            <span className="web-rail-ic"><Icon size={18} /></span>
            <span className="web-rail-label">{label}</span>
          </a>
        ))}
      </nav>

      <div className="web-content">
        <main className="bento">
          <HeroTile />
          <StatsTile />
          <ContactQuickTile />
          <AboutTile />
          <SkillsTile />
          <ProjectsTile />
          <InterestsTile />
          <JourneyTile />
          <WritingTile />
          <ContactBand />
        </main>
      </div>
    </div>
  );
}
