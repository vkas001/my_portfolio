import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown } from 'lucide-react';
import Input from '@/components/ui/Input/Input';
import { categoryColor } from '@/modules/skills';

/** Combobox for a category field: a normal text input where you can type a
 *  brand-new category, plus a chevron-down button that opens the list of
 *  existing categories to pick from. The menu is portaled to the body and
 *  fixed-positioned under the field so it floats above the OS window.
 *  `labelOf` lets consumers pretty-print built-in categories (skills), while
 *  raw strings are used where there is no curated label set (projects). */
export default function CategoryField({
  value,
  onChange,
  options,
  label,
  hint,
  labelOf = (c: string) => c,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  label?: string;
  hint?: string;
  labelOf?: (c: string) => string;
}) {
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState<{ top: number; left: number; width: number } | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const measure = () => {
    const el = inputRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setRect({ top: r.bottom + 4, left: r.left, width: r.width });
  };

  const toggle = () => {
    if (open) {
      setOpen(false);
    } else {
      measure();
      setOpen(true);
    }
  };

  useEffect(() => {
    if (!open) return;
    const onScroll = () => measure();
    const onResize = () => setOpen(false);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      if (e.target instanceof Node) {
        if (wrapRef.current && wrapRef.current.contains(e.target)) return;
        if (menuRef.current && menuRef.current.contains(e.target)) return;
      }
      setOpen(false);
    };
    document.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onResize);
    window.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointerDown, true);
    return () => {
      document.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointerDown, true);
    };
  }, [open]);

  return (
    <div ref={wrapRef}>
      <Input
        ref={inputRef}
        label={label}
        value={value}
        hint={hint}
        onChange={(e) => onChange(e.target.value)}
        suffix={
          <button
            type="button"
            title={open ? 'Close category list' : 'Select an existing category'}
            aria-label={open ? 'Close category list' : 'Select an existing category'}
            aria-expanded={open}
            onClick={toggle}
            className="p-1 -m-1 rounded-md cursor-pointer transition-colors hover:bg-[rgba(var(--accent-rgb),.16)] hover:text-(--accent) focus-visible:outline-2 focus-visible:outline-offset-1"
            style={{ color: open ? 'var(--accent)' : 'var(--text-mid)' }}
          >
            <ChevronDown size={14} className={open ? 'rotate-180' : ''} style={{ transition: 'transform .15s' }} />
          </button>
        }
      />
      {open && rect
        ? createPortal(
            <div
              ref={menuRef}
              role="listbox"
              className="overflow-y-auto py-1"
              style={{
                position: 'fixed',
                top: rect.top,
                left: rect.left,
                width: rect.width,
                minWidth: 220,
                maxHeight: 240,
                background: 'var(--bg-elev)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                boxShadow: '0 8px 24px rgba(0,0,0,.25)',
                zIndex: 1100,
              }}
            >
              {options.map((c) => (
                <button
                  key={c}
                  type="button"
                  role="option"
                  aria-selected={value === c}
                  onClick={() => {
                    onChange(c);
                    setOpen(false);
                  }}
                  className="flex items-center gap-2 w-full text-left px-3 py-1.5 text-[12px] cursor-pointer hover:bg-[rgba(var(--accent-rgb),.2)]"
                  style={{ color: 'var(--text-hi)' }}
                >
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: categoryColor(c) }} />
                  <span className="truncate">{labelOf(c)}</span>
                  {value === c ? <Check size={12} className="ml-auto shrink-0" style={{ color: 'var(--accent)' }} /> : null}
                </button>
              ))}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}