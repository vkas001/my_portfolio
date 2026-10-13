import TopBar from '@/components/shell/TopBar/TopBar';
import { SiteScreen } from '@/modules/site';

/** Normal scrolling website: sticky header plus the split-résumé site.
 *  Settings stays OS-only chrome. */
export default function WebView() {
  return (
    <div className="web-root">
      <TopBar />

      <SiteScreen />

      <footer className="web-footer" style={{ color: 'var(--text-low)' }}>
        <ViewToggleHint />
      </footer>
    </div>
  );
}

function ViewToggleHint() {
  return <span>Prefer the desktop? Switch back to OS view from the header.</span>;
}
