import type { Skill } from '@shared/types';

/** Local fallback skills (also seeded in the backend database). */
export const localSkills: Skill[] = [
  { id: 'sk1',  name: 'TypeScript',      category: 'languages', proficiency: 95, yearsUsed: 5, icon: null },
  { id: 'sk2',  name: 'React',           category: 'frontend',  proficiency: 95, yearsUsed: 5, icon: null },
  { id: 'sk3',  name: 'Next.js',         category: 'frontend',  proficiency: 85, yearsUsed: 3, icon: null },
  { id: 'sk4',  name: 'Tailwind CSS',    category: 'frontend',  proficiency: 90, yearsUsed: 4, icon: null },
  { id: 'sk5',  name: 'Node.js',         category: 'backend',   proficiency: 90, yearsUsed: 5, icon: null },
  { id: 'sk6',  name: 'Laravel',         category: 'backend',   proficiency: 88, yearsUsed: 4, icon: null },
  { id: 'sk7',  name: 'PostgreSQL',      category: 'database',  proficiency: 80, yearsUsed: 4, icon: null },
  { id: 'sk8',  name: 'Redis',           category: 'database',  proficiency: 72, yearsUsed: 3, icon: null },
  { id: 'sk9',  name: 'Docker',          category: 'devops',    proficiency: 78, yearsUsed: 3, icon: null },
  { id: 'sk10', name: 'AWS',             category: 'devops',    proficiency: 70, yearsUsed: 2, icon: null },
  { id: 'sk11', name: 'Figma',           category: 'design',    proficiency: 82, yearsUsed: 4, icon: null },
  { id: 'sk12', name: 'Python',          category: 'languages', proficiency: 75, yearsUsed: 4, icon: null },
  { id: 'sk13', name: 'GraphQL',         category: 'backend',   proficiency: 74, yearsUsed: 2, icon: null },
  { id: 'sk14', name: 'Vitest / Jest',   category: 'tools',     proficiency: 85, yearsUsed: 4, icon: null },
];