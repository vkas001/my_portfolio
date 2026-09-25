import type { SkillCategory } from '@shared/types';

export const SKILL_CATEGORIES: SkillCategory[] = [
  'languages', 'frontend', 'backend', 'database', 'devops', 'design', 'tools',
];

export const CATEGORY_LABELS: Record<SkillCategory, string> = {
  languages: 'Languages',
  frontend: 'Frontend',
  backend: 'Backend',
  database: 'Database',
  devops: 'DevOps',
  design: 'Design',
  tools: 'Tools',
};

export const CATEGORY_COLORS: Record<SkillCategory, string> = {
  languages: '#8b5cf6',
  frontend: '#06b6d4',
  backend: '#10b981',
  database: '#f59e0b',
  devops: '#f43f5e',
  design: '#ec4899',
  tools: '#64748b',
};