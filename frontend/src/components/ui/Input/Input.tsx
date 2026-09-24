import { useId, forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Field label (rendered above the input, linked via htmlFor). */
  label?: string;
  /** Validation error — swaps the control to the error state. */
  error?: string;
  /** Helper text shown under the input. */
  hint?: string;
  /** Alias for `hint`. */
  helperText?: string;
  /** Absolutely-positioned overlay inside the field (icon, unit, button…). */
  suffix?: ReactNode;
  inputClassName?: string;
}

/** Shared, theme-styled single-line text input (ports ibiz_v2's Input to
 *  Tailwind + this app's theme tokens). Base look reuses the global control
 *  styles; the error/hint/suffix/label wiring is component-owned. */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, helperText, suffix, className, inputClassName, id, style, ...rest },
  ref,
) {
  const inputId = id ?? useId();
  const resolvedHint = helperText ?? hint;

  return (
    <div className={`flex flex-col gap-1 ${className ?? ''}`}>
      {label ? (
        <label
          htmlFor={inputId}
          className="text-[10px] font-bold uppercase tracking-wider block"
          style={{ color: 'var(--text-low)' }}
        >
          {label}
        </label>
      ) : null}
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          className={`w-full text-sm ${inputClassName ?? ''}`}
          style={{
            ...(error ? { borderColor: 'var(--error)', background: 'var(--error-soft)' } : null),
            ...(suffix ? { paddingRight: '2.25rem' } : null),
            ...style,
          }}
          {...rest}
        />
        {suffix ? <div className="absolute right-2 top-1/2 -translate-y-1/2">{suffix}</div> : null}
      </div>
      {error ? (
        <span className="text-[11px]" style={{ color: 'var(--error)' }}>{error}</span>
      ) : resolvedHint ? (
        <span className="text-[11px]" style={{ color: 'var(--text-low)' }}>{resolvedHint}</span>
      ) : null}
    </div>
  );
});

export default Input;