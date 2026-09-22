import TopBar from '@/components/desktop/TopBar';
import ModuleHost from '@/components/windows/ModuleHost';
import { APP_REGISTRY } from '@/apps/registry';
import type { AppId } from '@/types';

/** Portfolio sections shown in Web view (Settings stays OS-only chrome). */
const WEB_SECTION_IDS: AppId[] = ['about', 'skills', 'projects', 'experience', 'contact'];

/** Normal scrolling website: sticky header + registry-driven sections.
 *  Each section is its own @container anchor so the reused OS app
 *  components keep their container-query responsive behavior. */
export default function WebView() {
  const apps = APP_REGISTRY.filter((a) => WEB_SECTION_IDS.includes(a.id as AppId));
  return (
    <div className="web-root">
      <TopBar />

      <nav className="web-nav" aria-label="Sections">
        {apps.map((app) => (
          <a key={app.id} href={`#section-${app.id}`} className="web-nav-link">
            <span aria-hidden className="inline-flex"><app.icon size={13} /></span>
            {app.name}
          </a>
        ))}
      </nav>

      <main className="web-main">
        {apps.map((app) => (
          <section key={app.id} id={`section-${app.id}`} className="web-section-wrap">
            <div className="web-section">
              <header className="web-section-head">
                <span className="web-section-icon" style={{ background: `${app.color}22`, border: `1px solid ${app.color}44`, color: app.color }}>
                  <app.icon size={20} />
                </span>
                <div>
                  <h2 style={{ color: 'var(--text-hi)' }}>{app.name}</h2>
                  <p style={{ color: 'var(--text-low)' }}>{app.description}</p>
                </div>
              </header>
              <ModuleHost appId={app.id} />
            </div>
          </section>
        ))}
      </main>

      <footer className="web-footer" style={{ color: 'var(--text-low)' }}>
        <ViewToggleHint />
      </footer>
    </div>
  );
}

function ViewToggleHint() {
  return <span>Prefer the desktop? Switch back to OS view from the header.</span>;
}
