import { useEffect, useMemo, useState } from 'react';
import TopBar from '@/components/shell/TopBar/TopBar';
import ModuleHost from '@/components/shell/ModuleHost/ModuleHost';
import { APP_REGISTRY } from '@/apps/registry';
import type { AppId } from '@/types';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';

/** Portfolio sections shown in Web view's main column + rail (Settings stays
 *  OS-only chrome). Education lives here with the other content sections. */
const WEB_SECTION_IDS: AppId[] = ['about', 'skills', 'projects', 'experience', 'education'];

/** Right-sidebar sections: sticky column beside the main content. Hobbies sits
 *  at a fixed width; Contact fills the remaining space (stacks below ~1350px). */
const SIDEBAR_IDS: AppId[] = ['hobbies', 'contact'];

const RAIL_KEY = 'portfolio.webRailCollapsed';

/** YouTube-style collapsed/local-stored rail toggle. */
function loadCollapsed(): boolean {
  try {
    return localStorage.getItem(RAIL_KEY) === '1';
  } catch {
    return false;
  }
}

/** Normal scrolling website with a left-aligned rail (like YouTube): sticky
 *  section nav with labels, collapsible to icon-only via the rail toggle, and
 *  scroll-spy highlighting the section in view. */
export default function WebView() {
  const apps = useMemo(() => APP_REGISTRY.filter((a) => WEB_SECTION_IDS.includes(a.id as AppId)), []);
  const sidebarApps = useMemo(() => APP_REGISTRY.filter((a) => SIDEBAR_IDS.includes(a.id as AppId)), []);
  const [collapsed, setCollapsed] = useState<boolean>(loadCollapsed);
  const [activeId, setActiveId] = useState<AppId>('about');

  const toggleRail = () =>
    setCollapsed((c) => {
      const next = !c;
      try {
        localStorage.setItem(RAIL_KEY, next ? '1' : '0');
      } catch {
        /* storage unavailable */
      }
      return next;
    });

  // Scroll-spy: highlight the rail entry for the section in view.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id.replace('section-', '') as AppId);
          }
        }
      },
      { rootMargin: '0px 0px -70% 0px' },
    );
    apps.forEach((app) => {
      const el = document.getElementById(`section-${app.id}`);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [apps]);

  return (
    <div className="web-root">
      <TopBar />

      <div className="web-shell">
        <nav className={`web-rail${collapsed ? ' collapsed' : ''}`} aria-label="Sections">
          <button
            type="button"
            className="web-rail-toggle"
            onClick={toggleRail}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            <span>Collapse</span>
          </button>

          {apps.map((app) => (
            <a
              key={app.id}
              href={`#section-${app.id}`}
              className={`web-rail-link${activeId === app.id ? ' active' : ''}`}
              aria-current={activeId === app.id ? 'true' : undefined}
              title={collapsed ? app.name : undefined}
            >
              <span className="web-rail-ic"><app.icon size={18} /></span>
              <span className="web-rail-label">{app.name}</span>
            </a>
          ))}
        </nav>

        <div className="web-content">
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

        {sidebarApps.length > 0 && (
          <aside className="web-edu">
            {sidebarApps.map((app) => (
              <section key={app.id} id={`section-${app.id}`} className="web-section">
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
              </section>
            ))}
          </aside>
        )}
        </div>
      </div>

      <footer className="web-footer" style={{ color: 'var(--text-low)' }}>
        <ViewToggleHint />
      </footer>
    </div>
  );
}

function ViewToggleHint() {
  return <span>Prefer the desktop? Switch back to OS view from the header.</span>;
}