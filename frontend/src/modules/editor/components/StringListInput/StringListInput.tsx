import { inputCls } from '@/modules/editor/components/Field/Field';

export default function StringListInput({
  value,
  onChange,
  placeholder = 'Comma-separated values',
  rows = 1,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  rows?: number;
}) {
  const text = value.join(rows > 1 ? '\n' : ', ');
  return (
    <textarea
      className={`${inputCls} resize-y`}
      rows={rows}
      placeholder={placeholder}
      value={text}
      onChange={(e) =>
        onChange(
          e.target.value
            .split(rows > 1 ? /\n+/ : /,\s*/)
            .map((s) => s.trim())
            .filter(Boolean),
        )
      }
    />
  );
}