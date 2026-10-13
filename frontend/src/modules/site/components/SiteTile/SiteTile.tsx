import type { CSSProperties, ReactNode } from 'react';

interface SiteTileProps {
  id: string;
  /** Small-caps kicker naming what the tile is. */
  eyebrow: string;
  title: string;
  blurb?: string;
  /** Section color for the eyebrow dot. */
  accent: string;
  /** Bento placement class (b-about, b-skills, …). */
  span: string;
  children: ReactNode;
}

/** Shared tile chrome: eyebrow + title + body. Keeps every content tile
 *  speaking the same visual language; hero/stats/quick/band tiles are
 *  bespoke and don't use this shell. */
export default function SiteTile({ id, eyebrow, title, blurb, accent, span, children }: SiteTileProps) {
  return (
    <section id={id} className={`bento-tile lift b-anchor ${span}`} style={{ '--tile-accent': accent } as CSSProperties}>
      <header>
        <p className="b-tile-eyebrow">
          <span className="dot" aria-hidden />
          {eyebrow}
        </p>
        <h2 className="b-tile-title">{title}</h2>
        {blurb && <p className="b-tile-blurb">{blurb}</p>}
      </header>
      {children}
    </section>
  );
}
