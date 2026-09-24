import { inputCls } from '@/modules/editor/components/Field/Field';

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
    <select className={inputCls} value={value} onChange={(e) => onChange(e.target.value as T)}>
      {options.map((o) => (
        <option key={o} value={o}>{labels?.[o] ?? o}</option>
      ))}
    </select>
  );
}