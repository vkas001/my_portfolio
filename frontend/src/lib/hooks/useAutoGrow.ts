import { useCallback, useLayoutEffect, useRef, type RefObject } from 'react';

/**
 * Grows a textarea to fit its content: height follows `scrollHeight`, never
 * below the element's own `rows` floor, and capped at `maxRows` (past the cap
 * it scrolls). Pass the value it renders so the height is re-measured on every
 * keystroke, and keep the element's `rows` as the minimum.
 *
 * Width changes are re-measured too: OS windows are resizable and dock, so the
 * same text wraps to more lines in a narrow pane and a height measured once
 * would clip it.
 *
 * `enabled: false` keeps the element on plain `rows`/CSS sizing and hands back
 * any height the hook set, so opting in stays an explicit per-field decision.
 */
export function useAutoGrow<T extends HTMLTextAreaElement>(
  value: unknown,
  maxRows = 12,
  enabled = true,
): RefObject<T | null> {
  const ref = useRef<T | null>(null);
  const lastWidth = useRef<number | null>(null);
  const ownsSizing = useRef(false);

  const resize = useCallback(() => {
    const el = ref.current;
    if (!el) return;

    if (!enabled) {
      // Opted out (or switched off): hand sizing back to `rows` / CSS and
      // leave nothing behind that a caller resize handle could fight.
      if (ownsSizing.current) {
        el.style.removeProperty('height');
        el.style.removeProperty('max-height');
        ownsSizing.current = false;
      }
      return;
    }

    const cs = getComputedStyle(el);
    const lineHeight = parseFloat(cs.lineHeight) || 20;
    const chrome =
      (parseFloat(cs.paddingTop) || 0) +
      (parseFloat(cs.paddingBottom) || 0) +
      (parseFloat(cs.borderTopWidth) || 0) +
      (parseFloat(cs.borderBottomWidth) || 0);

    const capPx = maxRows * lineHeight + chrome;
    el.style.maxHeight = `${capPx}px`;
    // Collapse first so scrollHeight reflects the content, not the old height.
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, capPx)}px`;
    ownsSizing.current = true;
  }, [enabled, maxRows]);

  useLayoutEffect(() => {
    resize();
  }, [resize, value]);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!enabled || !el || typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver(() => {
      const width = el.getBoundingClientRect().width;
      // Only a width change can change the line count; ignore the height
      // notifications our own write produces (also avoids a RO feedback loop).
      if (lastWidth.current !== null && Math.abs(width - lastWidth.current) < 0.5) return;
      lastWidth.current = width;
      resize();
    });
    observer.observe(el);

    return () => observer.disconnect();
  }, [enabled, resize]);

  return ref;
}
