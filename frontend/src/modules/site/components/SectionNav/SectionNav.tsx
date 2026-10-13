import { useEffect, useRef } from 'react';
import { SITE_NAV } from '@/modules/site/lib/siteNav';

/** Section jumps with an active-line indicator: the line grows on the
 *  section in view. Plain anchors — keyboard and deep-links work natively.
 *  When the nav collapses to the mobile strip, vertical wheel maps to
 *  horizontal scroll and the strip is mouse-draggable; real drags suppress
 *  the follow-up click so a swipe never navigates. */
export default function SectionNav({ activeId }: { activeId: string }) {
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) >= Math.abs(e.deltaY)) return;
      if (nav.scrollWidth <= nav.clientWidth + 1) return;
      e.preventDefault();
      nav.scrollLeft += e.deltaY;
    };
    nav.addEventListener('wheel', onWheel, { passive: false });

    let down = false;
    let dragging = false;
    let dragged = false;
    let downX = 0;
    let startLeft = 0;
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      down = true;
      downX = e.clientX;
      startLeft = nav.scrollLeft;
      dragging = false;
      dragged = false;
    };
    const onMove = (e: PointerEvent) => {
      if (!down || e.pointerType !== 'mouse') return;
      const dx = e.clientX - downX;
      if (!dragging) {
        if (Math.abs(dx) <= 6) return;
        if (nav.scrollWidth - nav.clientWidth <= 0) return;
        dragging = true;
        dragged = true;
        try { nav.setPointerCapture(e.pointerId); } catch { /* noop */ }
        nav.style.cursor = 'grabbing';
      }
      nav.scrollLeft = startLeft - dx;
    };
    const onUp = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      down = false;
      dragging = false;
      nav.style.cursor = '';
    };
    const onClick = (e: MouseEvent) => {
      if (dragged) {
        e.stopPropagation();
        e.preventDefault();
        dragged = false;
      }
    };
    nav.addEventListener('pointerdown', onDown);
    nav.addEventListener('pointermove', onMove);
    nav.addEventListener('pointerup', onUp);
    nav.addEventListener('pointercancel', onUp);
    nav.addEventListener('click', onClick, true);
    return () => {
      nav.removeEventListener('wheel', onWheel);
      nav.removeEventListener('pointerdown', onDown);
      nav.removeEventListener('pointermove', onMove);
      nav.removeEventListener('pointerup', onUp);
      nav.removeEventListener('pointercancel', onUp);
      nav.removeEventListener('click', onClick, true);
    };
  }, []);

  return (
    <nav ref={navRef} className="si-nav" aria-label="Sections">
      {SITE_NAV.map(({ id, label, icon: Icon }) => (
        <a
          key={id}
          href={`#${id}`}
          // Same-page anchors: a native link-drag would hijack a strip
          // swipe into a ghost-image drag (pointercancel kills the scroll).
          draggable={false}
          className={`si-nav-link${activeId === id ? ' active' : ''}`}
          aria-current={activeId === id ? 'true' : undefined}
        >
          <span className="si-nav-line" aria-hidden />
          <Icon size={13} />
          {label}
        </a>
      ))}
    </nav>
  );
}
