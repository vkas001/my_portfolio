import TextArea from '@/components/ui/TextArea/TextArea';

export default function StringListInput({
  value,
  onChange,
  placeholder = 'Comma-separated values',
  rows = 1,
  maxRows = 8,
  autoGrow = true,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  rows?: number;
  maxRows?: number;
  autoGrow?: boolean;
}) {
  const text = value.join(rows > 1 ? '\n' : ', ');
  return (
    <TextArea
      autoGrow={autoGrow}
      maxRows={maxRows}
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
