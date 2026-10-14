import type { ReactNode } from 'react';

interface ResumeSectionProps {
  id: string;
  index: string;
  title: string;
  children: ReactNode;
}

/** One numbered résumé block: mono index, hairline rule, heading, body.
 *  The number is the reading order, not decoration. */
export default function ResumeSection({ id, index, title, children }: ResumeSectionProps) {
  return (
    <section id={id} className="rs-section">
      <header className="rs-head">
        <span className="rs-num" aria-hidden>
          {index}
        </span>
        <h2 className="rs-title">{title}</h2>
        <span className="rs-rule" aria-hidden />
      </header>
      <div className="rs-body">{children}</div>
    </section>
  );
}
