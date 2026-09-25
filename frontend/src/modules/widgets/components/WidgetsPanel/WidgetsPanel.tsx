import { Suspense, useEffect } from 'react';
import { useShellUI } from '@/context/ShellUIContext';
import { useWidgets } from '@/context/WidgetsContext';
import WidgetCard from '@/modules/widgets/components/WidgetCard/WidgetCard';
import { WIDGET_DEFS } from '@/modules/widgets';

export default function WidgetsPanel() {
  const { widgetsOpen } = useShellUI();
  const { widgetPlacements, registerWidgets } = useWidgets();

  // Register widget metadata with the OS on mount
  useEffect(() => {
    registerWidgets(WIDGET_DEFS);
  }, [registerWidgets]);

  if (!widgetsOpen) return null;

  return (
    // Widget visibility/add controls live in the TopBar; this only renders placements.
    <Suspense fallback={null}>
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
      </Suspense>
  );
}
