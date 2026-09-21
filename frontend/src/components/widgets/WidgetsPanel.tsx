import { useEffect } from 'react';
import { useOS } from '@/context/OSContext';
import WidgetCard from './WidgetCard';
import { WIDGET_DEFS } from '@/components/widgets/registry';
import { Plus, PanelRightClose } from 'lucide-react';

export default function WidgetsPanel() {
  const { widgetsOpen, setWidgetsOpen, widgetPlacements, registerWidgets } = useOS();

  // Register widget metadata with the OS on mount
  useEffect(() => {
    registerWidgets(WIDGET_DEFS);
  }, [registerWidgets]);

  if (!widgetsOpen) return null;

  return (
    <>
      {/* Rendered placements on the desktop */}
      {widgetPlacements.map((p) => {
        const meta = WIDGET_DEFS.find((m) => m.id === p.id);
        if (!meta) return null;
        const Comp = meta.component;
        return (
          <WidgetCard key={p.instance} placement={p}>
            <Comp />
          </WidgetCard>
        );
      })}

      {/* Add-widget dock button lives in Taskbar; this is the picker popover */}
      <WidgetPicker />
      <button
        className="icon-btn absolute right-2 top-12 z-40"
        title="Hide widgets"
        onClick={() => setWidgetsOpen(false)}
      >
        <PanelRightClose size={14} />
      </button>
    </>
  );
}

function WidgetPicker() {
  const { widgetPlacements, addWidget, spotlightOpen } = useOS();
  const open = spotlightOpen === false;
  void widgetPlacements;

  return (
    <div
      className="menu-surface right-3 top-12 z-50 p-2 w-56 fade-in"
      style={{ display: open ? 'block' : 'none' }}
    >
      <p className="text-[10px] uppercase tracking-wider px-2 py-1" style={{ color: 'var(--text-low)' }}>
        Add widget
      </p>
      {WIDGET_DEFS.map((m) => (
        <button
          key={m.id}
          className="w-full text-left px-2 py-1.5 rounded text-xs hover:bg-white/5 flex items-center gap-2"
          onClick={() => addWidget(m.id)}
        >
          <Plus size={12} style={{ color: 'var(--accent)' }} />
          <span className="flex-1 truncate">{m.name}</span>
        </button>
      ))}
    </div>
  );
}
