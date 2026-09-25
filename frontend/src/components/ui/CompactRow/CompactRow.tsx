import type { MouseEventHandler, ReactNode } from 'react';

export interface CompactRowProps {
  icon: ReactNode;
  title: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
  selected?: boolean;
  onClick?: MouseEventHandler<HTMLDivElement>;
  onDoubleClick?: MouseEventHandler<HTMLDivElement>;
  className?: string;
}

/**
 * Dense list row (ibiz_v2 CompactRow parity). Responsive by container query
 * (see index.css `.crow` narrow rules): in narrow windows the meta column
 * hides and the title wraps instead of overflowing.
 */
export default function CompactRow({
  icon,
  title,
  meta,
  actions,
  selected = false,
  onClick,
  onDoubleClick,
  className = '',
}: CompactRowProps) {
  return (
    <div
      className={`crow${selected ? ' crow--on' : ''}${className ? ` ${className}` : ''}`}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    >
      <div className="crow__main">
        <span className="crow__icon">{icon}</span>
        <div className="crow__title">{title}</div>
      </div>
      {meta ? <span className="crow__meta">{meta}</span> : null}
      {actions ? <div className="crow__actions">{actions}</div> : null}
    </div>
  );
}
