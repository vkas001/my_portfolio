import { forwardRef, useState } from 'react';
import Input from '@/components/ui/Input/Input';

export interface NumberInputProps {
  /** Field label (rendered above the input, linked via htmlFor). */
  label?: string;
  /** Accessible name when no visible label is rendered. */
  'aria-label'?: string;
  /** Current model value. Never forced into the box while typing. */
  value: number;
  min?: number;
  max?: number;
  placeholder?: string;
  hint?: string;
  /** Validation error — swaps the control to the error state. */
  error?: string;
  /** Fires on every keystroke with the coerced number ('' coerces to 0). */
  onCommit: (value: number) => void;
}

/** Numeric text field that never shows a stray zero. A plain controlled
 *  `value={n}` input snaps an emptied box straight back to `0`
 *  (`Number('') === 0`), so a zero can never be removed or retyped cleanly.
 *  This keeps a local text buffer while editing (committing the coerced
 *  number underneath) and renders the model — with a zero model rendering
 *  as an empty box, so erasing everything leaves nothing behind. */
export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(function NumberInput(
  { label, 'aria-label': ariaLabel, value, min, max, placeholder, hint, error, onCommit },
  ref,
) {
  // null = idle, mirror the model (zero renders empty). A string
  // (possibly '') = mid-edit text.
  const [text, setText] = useState<string | null>(null);
  const shown = text ?? (value === 0 ? '' : String(value));

  return (
    <Input
      ref={ref}
      label={label}
      aria-label={ariaLabel}
      hint={hint}
      error={error}
      type="number"
      min={min}
      max={max}
      placeholder={placeholder ?? ''}
      value={shown}
      onChange={(e) => {
        const raw = e.target.value;
        setText(raw);
        onCommit(raw.trim() === '' ? 0 : Number(raw));
      }}
      onBlur={() => setText(null)}
    />
  );
});

export default NumberInput;
