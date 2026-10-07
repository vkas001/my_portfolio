import { AppWindow, LayoutGrid, RotateCcw } from 'lucide-react';
import type { IconSize, ThemeState, WindowSize } from '@/styles/theme';
import SectionCard from '@/components/ui/SectionCard/SectionCard';
import { SegmentedControl, SubLabel } from '@/modules/settings/components/primitives';
import { ICON_SIZE_OPTIONS, WINDOW_SIZE_OPTIONS } from '@/modules/settings/lib/options';
import type { SetTheme } from '@/modules/settings/lib/types';

export default function AppsTab({ theme, setTheme }: { theme: ThemeState; setTheme: SetTheme }) {
  return (
    <>
      <SectionCard title="Window size" icon={<AppWindow size={13} />}>
        <SegmentedControl<WindowSize>
          value={theme.windowSize}
          options={WINDOW_SIZE_OPTIONS}
          onChange={(v) => setTheme({ windowSize: v })}
        />
        <p className="text-[11px] mt-2" style={{ color: 'var(--text-low)' }}>
          Applies the next time an app opens. Small is ~78% of the default size, Large ~120% —
          every window still fits your workspace.
        </p>
      </SectionCard>

      <SectionCard title="Desktop icons" icon={<LayoutGrid size={13} />}>
        <SubLabel>Icon size</SubLabel>
        <SegmentedControl<IconSize>
          value={theme.desktopIconSize}
          options={ICON_SIZE_OPTIONS}
          onChange={(v) => setTheme({ desktopIconSize: v })}
        />
        <p className="text-[12px] mt-2 mb-3" style={{ color: 'var(--text-low)' }}>
          App icons on the desktop can be dragged anywhere — icons never overlap: dropping one
          squarely on top of another swaps the two. Double-click one to open the app.
        </p>
        <button
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-sm)] text-[12px] font-bold transition-all cursor-pointer active:scale-95"
          style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
          onClick={() => setTheme({ desktopIconOffsets: {} })}
        >
          <RotateCcw size={12} />
          Reset icon positions
        </button>
      </SectionCard>
    </>
  );
}
