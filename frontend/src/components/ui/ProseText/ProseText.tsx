import type { CSSProperties } from 'react';

/** Plain-text profile fields are authored in multi-line textareas: a blank
 *  line starts a new paragraph and a single newline stays a line break.
 *  Rendered as real paragraphs so spacing comes from the layout, not from
 *  blank lines collapsing into one run-on block. */
export default function ProseText({
  text,
  className,
  style,
}: {
  text?: string | null;
  className?: string;
  style?: CSSProperties;
}) {
  const paragraphs = (text ?? '')
    .split(/\r?\n\s*\r?\n/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (paragraphs.length === 0) return null;

  return (
    <div className={className} style={style}>
      {paragraphs.map((paragraph, index) => (
        <p key={index} className={index === 0 ? 'whitespace-pre-line' : 'whitespace-pre-line mt-3'}>
          {paragraph}
        </p>
      ))}
    </div>
  );
}
