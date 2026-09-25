import {
  Award,
  Gem,
  Layers,
  Lightbulb,
  Rocket,
  Shield,
  Sparkles,
  Star,
  Target,
  Zap,
  type LucideIcon,
} from 'lucide-react';

/** Editable lucide icons for the About section headings (must match the backend allowlist).
 *  `none` hides the icon entirely. */
export const SECTION_ICONS = [
  'none',
  'star',
  'sparkles',
  'zap',
  'rocket',
  'award',
  'target',
  'shield',
  'gem',
  'lightbulb',
  'layers',
] as const;

export type SectionIcon = (typeof SECTION_ICONS)[number];

export const SECTION_ICON_META: Record<SectionIcon, { label: string; icon: LucideIcon | null }> = {
  none: { label: 'None', icon: null },
  star: { label: 'Star', icon: Star },
  sparkles: { label: 'Sparkles', icon: Sparkles },
  zap: { label: 'Zap', icon: Zap },
  rocket: { label: 'Rocket', icon: Rocket },
  award: { label: 'Award', icon: Award },
  target: { label: 'Target', icon: Target },
  shield: { label: 'Shield', icon: Shield },
  gem: { label: 'Gem', icon: Gem },
  lightbulb: { label: 'Lightbulb', icon: Lightbulb },
  layers: { label: 'Layers', icon: Layers },
};

export const SECTION_ICON_LABELS: Record<string, string> = Object.fromEntries(
  SECTION_ICONS.map((key) => [key, SECTION_ICON_META[key].label]),
);

/** Resolve a stored icon name to a component; `none` → null (no icon),
 *  Star on unknown/empty. */
export function sectionIcon(name?: string | null): LucideIcon | null {
  if (name === 'none') return null;
  return (name ? SECTION_ICON_META[name as SectionIcon]?.icon : undefined) ?? Star;
}