import { Clock } from 'lucide-react';
import type { ThemeState } from '@/styles/theme';
import SectionCard from '@/components/ui/SectionCard/SectionCard';
import { SegmentedControl, SettingRow, SubLabel, Toggle } from '@/modules/settings/components/primitives';
import { CLOCK_OPTIONS, DATE_OPTIONS } from '@/modules/settings/lib/options';
import type { SetTheme } from '@/modules/settings/lib/types';

export default function TimeTab({ theme, setTheme }: { theme: ThemeState; setTheme: SetTheme }) {
  return (
    <SectionCard title="Clock formatting" icon={<Clock size={13} />}>
      <SubLabel icon={<Clock size={12} />}>Clock format</SubLabel>
      <SegmentedControl value={theme.clockFormat} options={CLOCK_OPTIONS} onChange={(v) => setTheme({ clockFormat: v })} />
      <div className="h-4" />
      <SubLabel>Date display</SubLabel>
      <SegmentedControl value={theme.dateFormat} options={DATE_OPTIONS} onChange={(v) => setTheme({ dateFormat: v })} />
      <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
        <SettingRow label="Show seconds" description="Include seconds in the taskbar clock">
          <Toggle enabled={theme.showSeconds} onChange={(v) => setTheme({ showSeconds: v })} />
        </SettingRow>
      </div>
    </SectionCard>
  );
}