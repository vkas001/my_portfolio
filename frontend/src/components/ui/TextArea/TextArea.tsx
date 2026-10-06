import { useId, useCallback, forwardRef, type MutableRefObject, type TextareaHTMLAttributes } from 'react';
import { useAutoGrow } from '@/lib/hooks/useAutoGrow';

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Field label (rendered above the textarea, linked via htmlFor). */
  label?: string;
  /** Validation error — swaps the control to the error state. */
  error?: string;
  /** Helper text shown under the textarea. */
  hint?: string;
  /** Alias for `hint`. */
  helperText?: string;
  textareaClassName?: string;
  /** Grow the box with its content instead of keeping `rows` fixed. */
  autoGrow?: boolean;
  /** Upper bound for `autoGrow`; past it the textarea scrolls. */
  maxRows?: number;
}

/** Shared, theme-styled multiline text area (same API as ui/Input,
 *  for bio / message / note fields). */
export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  { label, error, hint, helperText, className, textareaClassName, style, id, autoGrow, maxRows, ...rest },
  ref,
) {
  // Always call the hook: `id ?? useId()` would skip it whenever an explicit id
  // is passed and break the hook order across renders.
  const autoId = useId();
  const areaId = id ?? autoId;
  const resolvedHint = helperText ?? hint;

  // `rows` stays the minimum height; autoGrow only ever adds rows.
  const growRef = useAutoGrow<HTMLTextAreaElement>(rest.value, maxRows, Boolean(autoGrow));
  const setAreaRef = useCallback(
    (node: HTMLTextAreaElement | null) => {
      growRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) (ref as MutableRefObject<HTMLTextAreaElement | null>).current = node;
    },
    [growRef, ref],
  );

  return (
    <div className={`flex flex-col gap-1 ${className ?? ''}`}>
      {label ? (
        <label
          htmlFor={areaId}
          className="text-[10px] font-bold uppercase tracking-wider block"
          style={{ color: 'var(--text-low)' }}
        >
          {label}
        </label>
      ) : null}
      <textarea
        ref={setAreaRef}
        id={areaId}
        className={`w-full text-sm resize-y ${textareaClassName ?? ''}`}
        style={{
          // The JS owns the height when auto-growing, so the native handle
          // goes (inline style so a caller's resize class can't fight it).
          ...(autoGrow ? { resize: 'none' } : null),
          ...(error ? { borderColor: 'var(--error)', background: 'var(--error-soft)' } : null),
          ...style,
        }}
        {...rest}
      />
      {error ? (
        <span className="text-[11px]" style={{ color: 'var(--error)' }}>{error}</span>
      ) : resolvedHint ? (
        <span className="text-[11px]" style={{ color: 'var(--text-low)' }}>{resolvedHint}</span>
      ) : null}
    </div>
  );
});

export default TextArea;
