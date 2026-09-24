import { useId } from 'react';
import SelectR, { type StylesConfig } from 'react-select';
import { ChevronDown } from 'lucide-react';

export interface SelectOption<T extends string | number = string> {
  label: string;
  value: T;
  disabled?: boolean;
}

export interface SelectProps<T extends string | number = string> {
  options: SelectOption<T>[];
  value?: T | null;
  onChange?: (value: T | null) => void;
  placeholder?: string;
  label?: string;
  hint?: string;
  /** Validation error — swaps the control to the error state. */
  error?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
}

const selectStyles = (error?: string): StylesConfig<SelectOption<string | number>, false> => ({
  control: (base, state) => ({
    ...base,
    minHeight: 'auto',
    background: state.isDisabled ? 'var(--surface-80)' : 'rgba(0,0,0,.18)',
    border: `1px solid ${error ? 'var(--error)' : state.isFocused ? 'var(--accent)' : 'var(--border)'}`,
    borderRadius: 'var(--radius-sm)',
    boxShadow: state.isFocused && !error ? '0 0 0 3px rgba(var(--accent-rgb),.15)' : 'none',
    padding: '2px 6px',
    fontSize: 13,
    cursor: state.isDisabled ? 'not-allowed' : 'pointer',
    '&:hover': { borderColor: error ? 'var(--error)' : 'var(--accent)' },
  }),
  valueContainer: (base) => ({ ...base, padding: '4px 2px' }),
  singleValue: (base) => ({ ...base, color: 'var(--text-hi)', margin: 0 }),
  placeholder: (base) => ({ ...base, color: 'var(--text-low)' }),
  input: (base) => ({ ...base, color: 'var(--text-hi)' }),
  option: (base, state) => ({
    ...base,
    background: state.isSelected
      ? 'var(--accent)'
      : state.isFocused
        ? 'rgba(var(--accent-rgb),.2)'
        : 'transparent',
    color: state.isSelected ? 'var(--text-primary, #fff)' : 'var(--text-hi)',
    fontSize: 13,
    padding: '6px 10px',
    borderRadius: 6,
    cursor: 'pointer',
    '&:active': { background: 'var(--accent)' },
  }),
  menu: (base) => ({
    ...base,
    background: 'var(--bg-elev)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    boxShadow: '0 8px 24px rgba(0,0,0,.25)',
    overflow: 'hidden',
    zIndex: 90,
  }),
  menuList: (base) => ({ ...base, maxHeight: 240, padding: 4 }),
  noOptionsMessage: (base) => ({ ...base, color: 'var(--text-low)', fontSize: 12 }),
  indicatorSeparator: () => ({ display: 'none' }),
  dropdownIndicator: (base) => ({ ...base, color: 'var(--text-low)', padding: 2 }),
  loadingIndicator: (base) => ({ ...base, color: 'var(--text-low)' }),
});

/** Styled single-select dropdown (react-select wrapper, ported from ibiz_v2
 *  and themed with this app's tokens). Portaled to the body so the menu
 *  floats above OS windows (see global.css `.rs__menu-portal` z-index). */
export default function Select<T extends string | number = string>({
  options,
  value,
  onChange,
  placeholder = 'Select…',
  label,
  hint,
  error,
  disabled,
  id,
  className,
}: SelectProps<T>) {
  const selectId = id ?? useId();
  const flat = options as unknown as SelectOption<string | number>[];
  const current = flat.find((o) => String(o.value) === String(value)) ?? null;

  return (
    <div className={`flex flex-col gap-1 ${className ?? ''}`}>
      {label ? (
        <label htmlFor={selectId} className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: 'var(--text-low)' }}>
          {label}
        </label>
      ) : null}
      <SelectR<SelectOption<string | number>, false>
        instanceId={selectId}
        options={flat}
        value={current}
        onChange={(o) => onChange?.((o?.value as T | null) ?? null)}
        placeholder={placeholder}
        isDisabled={disabled}
        styles={selectStyles(error)}
        menuPortalTarget={document.body}
        components={{ DropdownIndicator: () => <ChevronDown size={14} style={{ color: 'var(--text-low)' }} /> }}
        inputId={selectId}
      />
      {error ? (
        <span className="text-[11px]" style={{ color: 'var(--error)' }}>{error}</span>
      ) : hint ? (
        <span className="text-[11px]" style={{ color: 'var(--text-low)' }}>{hint}</span>
      ) : null}
    </div>
  );
}