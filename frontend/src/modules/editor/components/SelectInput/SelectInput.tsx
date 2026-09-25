import Select from '@/components/ui/Select/Select';

/** Editor-friendly adapter over the shared ui/Select dropdown: keeps the
 *  old `{value, options, onChange, labels}` contract (string-only values). */
export default function SelectInput<T extends string>({
  value,
  options,
  onChange,
  labels,
}: {
  value: T;
  options: T[];
  onChange: (v: T) => void;
  labels?: Record<T, string>;
}) {
  return (
    <Select
      value={value}
      options={options.map((o) => ({ value: o, label: labels?.[o] ?? o }))}
      onChange={(v) => {
        if (v !== null) onChange(v as T);
      }}
    />
  );
}