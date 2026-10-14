import { useEffect, useState } from "react";
import TextArea from "@/components/ui/TextArea/TextArea";

const joinItems = (v: string[], rows: number) => v.join(rows > 1 ? "\n" : ", ");
const splitItems = (t: string, rows: number) =>
  t
    .split(rows > 1 ? /\n+/ : /,|\s+-\s*/)
    .map((s) => s.trim())
    .filter(Boolean);

export default function StringListInput({
  value,
  onChange,
  placeholder = "Comma or ' - ' separated",
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
  // Local text buffer: the box shows exactly what the user types (including
  // in-progress delimiters like a trailing comma or " -"), while every
  // keystroke still parses live into the draft so Save always sees the
  // current items. Feeding the normalized join back on each keystroke would
  // strip delimiters mid-typing and eat spaces — never do that here.
  const [text, setText] = useState(() => joinItems(value, rows));
  // Resync only on external changes (different draft, server echo with new
  // content). Our own keystrokes always parse back to `value`, so typing is
  // never clobbered.
  useEffect(() => {
    if (JSON.stringify(splitItems(text, rows)) !== JSON.stringify(value)) {
      setText(joinItems(value, rows));
    }
  }, [value, text, rows]);
  return (
    <TextArea
      autoGrow={autoGrow}
      maxRows={maxRows}
      rows={rows}
      placeholder={placeholder}
      value={text}
      onChange={(e) => {
        setText(e.target.value);
        onChange(splitItems(e.target.value, rows));
      }}
      // Single-line fields tokenize — Enter must not inject a newline.
      onKeyDown={
        rows > 1
          ? undefined
          : (e) => {
              if (e.key === "Enter") e.preventDefault();
            }
      }
    />
  );
}
