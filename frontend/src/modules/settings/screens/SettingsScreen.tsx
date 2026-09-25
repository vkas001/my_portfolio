import { useState } from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useWidgets } from '@/context/WidgetsContext';
import { useAuth } from '@/context/AuthContext';
import { ACCENTS, ACCENTS_DARK } from '@/styles/theme';
import { SETTINGS_TABS, TAB_DESCRIPTIONS, type SettingsTabId } from '@/modules/settings/lib/options';
import PersonalizationTab from '@/modules/settings/components/PersonalizationTab/PersonalizationTab';
import InterfaceTab from '@/modules/settings/components/InterfaceTab/InterfaceTab';
import TaskbarTab from '@/modules/settings/components/TaskbarTab/TaskbarTab';
import TimeTab from '@/modules/settings/components/TimeTab/TimeTab';
import WidgetsTab from '@/modules/settings/components/WidgetsTab/WidgetsTab';
import ShortcutsTab from '@/modules/settings/components/ShortcutsTab/ShortcutsTab';
import DataTab from '@/modules/settings/components/DataTab/DataTab';
import ResetTab from '@/modules/settings/components/ResetTab/ResetTab';

export default function SettingsScreen() {
  const { theme, setTheme, resetTheme } = useTheme();
  const { isAdmin } = useAuth();
  const { widgetPlacements, addWidget, removeWidget } = useWidgets();
  const [activeTab, setActiveTab] = useState<SettingsTabId>('personalization');
  const tabMeta = SETTINGS_TABS.find((t) => t.id === activeTab) ?? SETTINGS_TABS[0];
  const TabIcon = tabMeta.icon;

  const isDark = theme.mode === 'dark';
  const palette = isDark ? ACCENTS_DARK : ACCENTS;

  return (
    <div className="flex h-full select-none">
      {/* Sidebar — ported from ibiz_v2 SettingsWindow aside */}
      <aside
        className="w-44 shrink-0 border-r flex flex-col gap-1 p-2 overflow-y-auto"
        style={{ borderColor: 'var(--border)', background: 'var(--bg-elev)' }}
      >
        <div className="px-2 pb-2 pt-1">
          <h2 className="text-[13px] font-bold flex items-center gap-2" style={{ color: 'var(--accent)' }}>
            <SettingsIcon size={14} />
            <span>Settings</span>
          </h2>
        </div>
        {SETTINGS_TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius-sm)] text-[12px] font-semibold whitespace-nowrap text-left transition-all cursor-pointer"
              style={
                activeTab === tab.id
                  ? { background: 'var(--accent-soft)', color: 'var(--accent)' }
                  : { color: 'var(--text-mid)' }
              }
            >
              <Icon size={14} />
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </aside>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[640px] flex flex-col gap-5 p-5">
          <div>
            <h2 className="text-[18px] font-bold flex items-center gap-2" style={{ color: 'var(--accent)' }}>
              <TabIcon size={15} />
              <span>{tabMeta.label}</span>
            </h2>
            <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-low)' }}>
              {TAB_DESCRIPTIONS[activeTab]}
            </p>
          </div>

          {activeTab === 'personalization' && (
            <PersonalizationTab isDark={isDark} palette={palette} theme={theme} setTheme={setTheme} isAdmin={isAdmin} />
          )}
          {activeTab === 'interface' && <InterfaceTab theme={theme} setTheme={setTheme} />}
          {activeTab === 'taskbar' && <TaskbarTab theme={theme} setTheme={setTheme} />}
          {activeTab === 'time' && <TimeTab theme={theme} setTheme={setTheme} />}
          {activeTab === 'widgets' && (
            <WidgetsTab widgetPlacements={widgetPlacements} addWidget={addWidget} removeWidget={removeWidget} />
          )}
          {activeTab === 'shortcuts' && <ShortcutsTab />}
          {activeTab === 'data' && <DataTab theme={theme} setTheme={setTheme} resetTheme={resetTheme} />}
          {activeTab === 'reset' && <ResetTab resetTheme={resetTheme} />}
        </div>
      </div>
    </div>
  );
}