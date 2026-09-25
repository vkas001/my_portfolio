import {
  Bike,
  BookOpen,
  Camera,
  ChefHat,
  Code,
  Coffee,
  Dumbbell,
  Film,
  Gamepad2,
  Globe,
  Headphones,
  Mountain,
  Music,
  Palette,
  PenTool,
  Plane,
  Rocket,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';

/** Editable lucide icons for hobbies (must match the backend Hobby::ICONS
 *  allowlist). Storage uses the snake/kebab lucide name shown below. */
export const HOBBY_ICONS = [
  'mountain',
  'camera',
  'book-open',
  'gamepad',
  'headphones',
  'palette',
  'bike',
  'plane',
  'dumbbell',
  'chef-hat',
  'coffee',
  'globe',
  'film',
  'pen-tool',
  'rocket',
  'sparkles',
  'code',
  'music',
] as const;

export type HobbyIcon = (typeof HOBBY_ICONS)[number];

export const HOBBY_ICON_META: Record<HobbyIcon, { label: string; icon: LucideIcon }> = {
  mountain: { label: 'Mountain', icon: Mountain },
  camera: { label: 'Camera', icon: Camera },
  'book-open': { label: 'Book', icon: BookOpen },
  gamepad: { label: 'Gaming', icon: Gamepad2 },
  headphones: { label: 'Music', icon: Headphones },
  palette: { label: 'Art', icon: Palette },
  bike: { label: 'Cycling', icon: Bike },
  plane: { label: 'Travel', icon: Plane },
  dumbbell: { label: 'Fitness', icon: Dumbbell },
  'chef-hat': { label: 'Cooking', icon: ChefHat },
  coffee: { label: 'Coffee', icon: Coffee },
  globe: { label: 'Explore', icon: Globe },
  film: { label: 'Movies', icon: Film },
  'pen-tool': { label: 'Writing', icon: PenTool },
  rocket: { label: 'Making', icon: Rocket },
  sparkles: { label: 'Ideas', icon: Sparkles },
  code: { label: 'Coding', icon: Code },
  music: { label: 'Instruments', icon: Music },
};

export const HOBBY_ICON_LABELS: Record<string, string> = Object.fromEntries(
  HOBBY_ICONS.map((key) => [key, HOBBY_ICON_META[key].label]),
);

/** Resolve a stored icon name to a component; Camera on unknown/empty. */
export function hobbyIcon(name?: string | null): LucideIcon {
  return (name ? HOBBY_ICON_META[name as HobbyIcon]?.icon : undefined) ?? Camera;
}