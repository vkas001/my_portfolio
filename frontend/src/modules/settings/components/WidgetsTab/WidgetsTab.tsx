import { Blocks, Plus, Trash2 } from 'lucide-react';
import { useWidgets } from '@/context/WidgetsContext';
import { WIDGET_DEFS } from '@/modules/widgets';
import SectionCard from '@/components/ui/SectionCard/SectionCard';

export default function WidgetsTab({
  widgetPlacements,
  addWidget,
  removeWidget,
}: {
  widgetPlacements: ReturnType<typeof useWidgets>['widgetPlacements'];
  addWidget: ReturnType<typeof useWidgets>['addWidget'];
  removeWidget: ReturnType<typeof useWidgets>['removeWidget'];
}) {
  return (
    <SectionCard title="Widgets on desktop" icon={<Blocks size={13} />}>
      <div className="space-y-2">
        {widgetPlacements.map((p) => (
          <div
            key={p.instance}
            className="flex items-center gap-2 text-xs rounded-[var(--radius-sm)] px-3 py-2"
            style={{ background: 'var(--accent-soft)' }}
          >
            <span className="flex-1">{WIDGET_DEFS.find((w) => w.id === p.id)?.name ?? p.id}</span>
            <span className="text-[10px] tabular-nums" style={{ color: 'var(--text-low)' }}>
              {p.w}×{p.h} · {p.variant}
            </span>
            <button className="icon-btn w-6 h-6" onClick={() => removeWidget(p.instance)} title="Remove">
              <Trash2 size={12} />
            </button>
          </div>
        ))}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {WIDGET_DEFS.filter((w) => !widgetPlacements.some((p) => p.id === w.id)).map((w) => (
            <button key={w.id} className="chip cursor-pointer" onClick={() => addWidget(w.id)}>
              <Plus size={11} /> {w.name}
            </button>
          ))}
        </div>
      </div>
    </SectionCard>
  );
}