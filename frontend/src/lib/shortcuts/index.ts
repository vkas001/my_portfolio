export interface ShortcutDef {
  id: string;
  label: string;
  keys: string;            // display form, e.g. 'Cmd+K'
  match: (e: KeyboardEvent) => boolean;
  action: string;          // semantic action name handled by the shell
  payload?: string;        // e.g. appId to launch
}

const mod = (e: KeyboardEvent) => e.metaKey || e.ctrlKey;

export const SHORTCUTS: ShortcutDef[] = [
  { id: 'spotlight',   label: 'Open Spotlight',      keys: 'Ctrl+K',      match: (e) => mod(e) && e.key.toLowerCase() === 'k', action: 'spotlight' },
  { id: 'widgets',     label: 'Toggle Widgets',      keys: 'Ctrl+W',      match: (e) => mod(e) && e.key.toLowerCase() === 'w', action: 'widgets' },
  { id: 'settings',    label: 'Open Settings',       keys: 'Ctrl+,',      match: (e) => mod(e) && e.key === ',',               action: 'launch', payload: 'settings' },
  { id: 'about',       label: 'Open About',          keys: 'Ctrl+1',      match: (e) => mod(e) && e.key === '1',               action: 'launch', payload: 'about' },
  { id: 'skills',      label: 'Open Skills',         keys: 'Ctrl+2',      match: (e) => mod(e) && e.key === '2',               action: 'launch', payload: 'skills' },
  { id: 'projects',    label: 'Open Projects',       keys: 'Ctrl+3',      match: (e) => mod(e) && e.key === '3',               action: 'launch', payload: 'projects' },
  { id: 'experience',  label: 'Open Experience',     keys: 'Ctrl+4',      match: (e) => mod(e) && e.key === '4',               action: 'launch', payload: 'experience' },
  { id: 'contact',     label: 'Open Contact',        keys: 'Ctrl+5',      match: (e) => mod(e) && e.key === '5',               action: 'launch', payload: 'contact' },
  { id: 'close-window',label: 'Close Focused Window',keys: 'Ctrl+Q',      match: (e) => mod(e) && e.key.toLowerCase() === 'q', action: 'close-focused' },
  { id: 'taskbar',     label: 'Toggle Taskbar',        keys: 'Ctrl+T',      match: (e) => mod(e) && e.key.toLowerCase() === 't', action: 'taskbar' },
];

export function matchShortcut(e: KeyboardEvent): ShortcutDef | undefined {
  return SHORTCUTS.find((s) => s.match(e));
}
