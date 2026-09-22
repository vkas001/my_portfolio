import type { ReactNode } from 'react';

export interface CompactPageHeroProps {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  badge?: string;
  actions?: ReactNode;
  className?: string;
}

/**
 * Slim bordered hero card for app windows (ibiz_v2 CompactPageHero parity).
 * Responsive by container query (see index.css `.cph` narrow rules): the
 * subtitle/badge hide and the icon shrinks in narrow windows.
 */
export default function CompactPageHero({
  icon,
  title,
  subtitle,
  badge,
  actions,
  className = '',
}: CompactPageHeroProps) {
  return (
    <div className={`cph${className ? ` ${className}` : ''}`}>
      <span className="cph__icon">{icon}</span>
      <div className="cph__titles">
        <div className="cph__title-line">
          <h2>{title}</h2>
          {badge ? <span className="cph__badge">{badge}</span> : null}
        </div>
        {subtitle ? <p className="cph__subtitle">{subtitle}</p> : null}
      </div>
      {actions ? <div className="cph__actions">{actions}</div> : null}
    </div>
  );
}
