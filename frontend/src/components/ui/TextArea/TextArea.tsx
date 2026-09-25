import { useId, forwardRef, type TextareaHTMLAttributes } from 'react';

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
}

/** Shared, theme-styled multiline text area (same API as ui/Input,
 *  for bio / message / note fields). */
export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  { label, error, hint, helperText, className, textareaClassName, style, id, ...rest },
  ref,
) {
  const areaId = id ?? useId();
  const resolvedHint = helperText ?? hint;

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
        ref={ref}
        id={areaId}
        className={`w-full text-sm resize-y ${textareaClassName ?? ''}`}
        style={{
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