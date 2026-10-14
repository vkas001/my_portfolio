import { Blocks, LayoutDashboard, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useShellUI } from '@/context/ShellUIContext';
import { useWidgets } from '@/context/WidgetsContext';
import { WIDGET_DEFS } from '@/modules/widgets';
import CompactPageHero from '@/components/ui/CompactPageHero/CompactPageHero';
import SectionCard from '@/components/ui/SectionCard/SectionCard';
import { SegmentedControl, SettingRow, Toggle } from '@/modules/settings/components/primitives';
import type { WidgetVariant } from '@/types';

const variantLabel = (v: string) => v[0].toUpperCase() + v.slice(1);

/** Admin-only desktop-widget control panel: visibility, variants, add and
 *  remove — every edit flows through the widgets context, so the desktop
 *  behind the window updates live. Guests never reach here (launchers hide
 *  the app); a direct launch renders a sign-in notice instead. */
export default function WidgetsManagerScreen() {
  const { isAdmin } = useAuth();
  const { widgetsOpen, setWidgetsOpen } = useShellUI();
  const { widgetMeta, widgetPlacements, addWidget, removeWidget, moveWidgetVariant } = useWidgets();

  if (!isAdmin) {
    return (
      <div className="max-w-xl space-y-5">
        <CompactPageHero
          icon={<LayoutDashboard size={18} />}
          title="Widgets"
          subtitle="Admin only"
        />
        <div
          className="rounded-[var(--radius)] border p-5 text-sm"
          style={{ background: 'var(--bg-elev)', borderColor: 'var(--border)', color: 'var(--text-mid)' }}
        >
          Widget layout is managed by the site admin. Sign in to arrange the
          desktop widgets.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl space-y-5">
      <CompactPageHero
        icon={<LayoutDashboard size={18} />}
        title="Widgets"
        subtitle={`${widgetPlacements.length} on desktop`}
      />

      <SectionCard title="Desktop widgets" icon={<Blocks size={13} />}>
        <SettingRow label="Show widgets" description="Master visibility for the desktop layer">
          <Toggle enabled={widgetsOpen} onChange={setWidgetsOpen} />
        </SettingRow>
        <div className="space-y-2 pt-1">
          {widgetPlacements.map((p) => {
            const meta = widgetMeta[p.id];
            const variants = meta ? Object.keys(meta.variants) : [];
            return (
              <div key={p.instance} className="flex flex-col gap-2">
                <div
                  className="flex items-center gap-2 text-xs rounded-[var(--radius-sm)] px-3 py-2"
                  style={{ background: 'var(--accent-soft)' }}
                >
                  <span className="flex-1 font-bold" style={{ color: 'var(--text-hi)' }}>
                    {meta?.name ?? p.id}
                  </span>
                  <span className="text-[10px] tabular-nums shrink-0" style={{ color: 'var(--text-low)' }}>
                    {p.w}×{p.h} · {p.variant}
                  </span>
                  <button className="icon-btn w-6 h-6 shrink-0" onClick={() => removeWidget(p.instance)} title={`Remove ${meta?.name ?? p.id}`}>
                    <Trash2 size={12} />
                  </button>
                </div>
                {variants.length > 1 && (
                  <SegmentedControl<WidgetVariant>
                    value={p.variant as WidgetVariant}
                    options={variants.map((v) => ({ value: v as WidgetVariant, label: variantLabel(v) }))}
                    onChange={(v) => moveWidgetVariant(p.instance, v)}
                  />
                )}
              </div>
            );
          })}
          {!widgetPlacements.length && (
            <p className="text-xs" style={{ color: 'var(--text-low)' }}>
              No widgets on the desktop — add some below.
            </p>
          )}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {WIDGET_DEFS.map((w) => (
              <button key={w.id} className="chip cursor-pointer" onClick={() => addWidget(w.id)}>
                <Plus size={11} /> {w.name}
              </button>
            ))}
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
