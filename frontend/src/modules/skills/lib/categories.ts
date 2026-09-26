import type { Skill } from '@shared/types';

/** Curated default categories. Categories are free-form — any skill can carry a
 *  custom one, but these ship as defaults (labels + colors) plus a stable
 *  first-class slot in the Skills window filter chips. */
export const SKILL_CATEGORIES: string[] = [
  'languages', 'frontend', 'backend', 'database', 'devops', 'design', 'tools',
];

export const CATEGORY_LABELS: Record<string, string> = {
  languages: 'Languages',
  frontend: 'Frontend',
  backend: 'Backend',
  database: 'Database',
  devops: 'DevOps',
  design: 'Design',
  tools: 'Tools',
};

export const CATEGORY_COLORS: Record<string, string> = {
  languages: '#8b5cf6',
  frontend: '#06b6d4',
  backend: '#10b981',
  database: '#f59e0b',
  devops: '#f43f5e',
  design: '#ec4899',
  tools: '#64748b',
};

/** Palette for custom (non built-in) categories, picked deterministically by
 *  name so a given category always gets the same color. */
const CUSTOM_COLOR_PALETTE = [
  '#f97316', '#84cc16', '#3b82f6', '#a855f7', '#14b8a6', '#eab308',
  '#ef4444', '#22c55e', '#ec4899', '#06b6d4', '#f43f5e', '#0ea5e9',
];

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/** Stable color for any category: the built-in color when known, otherwise a
 *  deterministic pick from the custom palette. */
export function categoryColor(category: string): string {
  return CATEGORY_COLORS[category] ?? CUSTOM_COLOR_PALETTE[hashString(category) % CUSTOM_COLOR_PALETTE.length];
}

/** Distinct categories in display order: built-ins first (curated order), then
 *  any custom categories seen in the data, alphabetical. */
export function collectSkillCategories(skills: Pick<Skill, 'category'>[]): string[] {
  const used = [...new Set(skills.map((s) => s.category))];
  const builtins = SKILL_CATEGORIES.filter((c) => used.includes(c));
  const customs = used.filter((c) => !SKILL_CATEGORIES.includes(c)).sort();
  return [...builtins, ...customs];
}