import { LayoutGrid, Type } from 'lucide-react';
import { FONTS, type FontName, type GridSize, type ThemeState } from '@/styles/theme';
import SectionCard from '@/components/ui/SectionCard/SectionCard';
import { RangeControl, SegmentedControl, SettingRow, SubLabel, Toggle } from '@/modules/settings/components/primitives';
import { DENSITY_OPTIONS, GRID_SIZE_OPTIONS } from '@/modules/settings/lib/options';
import type { SetTheme } from '@/modules/settings/lib/types';

export default function InterfaceTab({ theme, setTheme }: { theme: ThemeState; setTheme: SetTheme }) {
  return (
    <SectionCard title="Interface" icon={<Type size={13} />}>
      <div className="grid grid-cols-12 gap-4 mb-4">
        <div className="col-span-12">
          <SubLabel>Density</SubLabel>
          <SegmentedControl value={theme.density} options={DENSITY_OPTIONS} onChange={(v) => setTheme({ density: v })} />
        </div>
        <div className="col-span-12">
          <SubLabel icon={<LayoutGrid size={12} />}>Desktop grid</SubLabel>
          <SegmentedControl
            value={theme.gridSize}
            options={GRID_SIZE_OPTIONS as { value: GridSize; label: string }[]}
            onChange={(v) => setTheme({ gridSize: v })}
          />
        </div>
      </div>

      <SubLabel icon={<Type size={12} />}>Font family</SubLabel>
      <div className="flex flex-wrap gap-2 mb-4">
        {FONTS.map((f) => (
          <button
            key={f.name}
            className="px-3 py-1.5 rounded-[var(--radius-sm)] text-[12px] font-bold transition-all cursor-pointer"
            style={
              theme.font === f.name
                ? { background: 'var(--accent)', color: 'var(--accent-text-on)' }
                : { background: 'var(--accent-soft)', color: 'var(--text-mid)', fontFamily: f.stack }
            }
            onClick={() => setTheme({ font: f.name as FontName })}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
        <SettingRow label="Animations" description="Window open/close and hover effects">
          <Toggle enabled={theme.animationsEnabled} onChange={(v) => setTheme({ animationsEnabled: v })} />
        </SettingRow>
        <SettingRow label="Sounds" description="UI sounds for window and widget actions">
          <Toggle enabled={theme.soundsEnabled} onChange={(v) => setTheme({ soundsEnabled: v })} />
        </SettingRow>
        <SettingRow label="Top bar" description="Show the top status bar">
          <Toggle enabled={theme.showTopBar} onChange={(v) => setTheme({ showTopBar: v })} />
        </SettingRow>
      </div>

      <div className="pt-2 mt-2 space-y-4" style={{ borderTop: '1px solid var(--border)' }}>
        <RangeControl
          label="Volume"
          value={theme.volume}
          min={0} max={100} step={1}
          display={`${theme.volume}%`}
          onChange={(v) => setTheme({ volume: v })}
        />
        <RangeControl
          label="Window opacity"
          value={theme.windowOpacity}
          min={0.5} max={1} step={0.05}
          display={`${Math.round(theme.windowOpacity * 100)}%`}
          onChange={(v) => setTheme({ windowOpacity: v })}
        />
      </div>
    </SectionCard>
  );
}