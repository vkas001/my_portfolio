import type { ContactFormPayload, Profile, Project, Skill } from '@shared/types';

// ─── Local fallback data (also seeded in the Laravel MySQL database) ────────

export const localProfile: Profile = {
  id: 'me',
  name: 'Vkas',
  title: 'Full-Stack Developer',
  shortBio: 'I build fast, delightful web experiences — from pixel-perfect UIs to resilient APIs.',
  bio: 'Full-stack developer focused on React, TypeScript and Node.js. I care about performance, accessibility, and building products that feel effortless. Currently exploring OS-style web interfaces, real-time systems and AI-assisted workflows.',
  avatarUrl: null,
  resumeUrl: null,
  email: 'hello@example.com',
  location: 'Remote',
  yearsExperience: 5,
  socials: [
    { id: 's1', label: 'GitHub', url: 'https://github.com/yourhandle', icon: 'github' },
    { id: 's2', label: 'LinkedIn', url: 'https://linkedin.com/in/yourhandle', icon: 'linkedin' },
    { id: 's3', label: 'X / Twitter', url: 'https://x.com/yourhandle', icon: 'twitter' },
  ],
};

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

export const localProjects: Project[] = [
  {
    id: 'p1',
    title: 'Portfolio OS',
    description: 'This desktop-style portfolio with windows, widgets and glassmorphism.',
    longDescription:
      'A fully dynamic portfolio that behaves like an operating system: draggable windows, a widget grid with variants, a theme engine with 12 accents, glass blur levels and wallpapers. Built as a monorepo with a React 19 + Vite frontend and a Laravel backend serving content.',
    techStack: ['React 19', 'Vite', 'TypeScript', 'Laravel', 'Tailwind v4'],
    category: 'Web App',
    featured: true,
    liveUrl: null,
    githubUrl: null,
    imageUrl: null,
    year: 2026,
    order: 1,
  },
  {
    id: 'p2',
    title: 'Realtime Collab Notes',
    description: 'Multiplayer notes with CRDT sync and presence.',
    longDescription:
      'Collaborative note editor with CRDT-based conflict-free syncing, live cursors, presence avatars and offline support. Backed by WebSockets with automatic reconnection and state recovery.',
    techStack: ['React', 'Yjs', 'WebSocket', 'Node.js', 'PostgreSQL'],
    category: 'Web App',
    featured: true,
    liveUrl: null,
    githubUrl: null,
    imageUrl: null,
    year: 2025,
    order: 2,
  },
  {
    id: 'p3',
    title: 'DevMetrics API',
    description: 'Aggregated developer analytics with caching layer.',
    longDescription:
      'An API that aggregates GitHub, npm and package health metrics into clean dashboards. Multi-layer caching with Redis, rate limiting, and typed SDK generation.',
    techStack: ['Node.js', 'TypeScript', 'Redis', 'OpenAPI'],
    category: 'Backend',
    featured: true,
    liveUrl: null,
    githubUrl: null,
    imageUrl: null,
    year: 2025,
    order: 3,
  },
  {
    id: 'p4',
    title: 'Glass UI Kit',
    description: 'Glassmorphism component library with theming engine.',
    longDescription:
      'A React component library implementing a full glassmorphism design system: theme tokens, accent palettes, blur levels and light/dark modes, all driven by CSS variables.',
    techStack: ['React', 'TypeScript', 'Tailwind', 'Storybook'],
    category: 'Library',
    featured: false,
    liveUrl: null,
    githubUrl: null,
    imageUrl: null,
    year: 2024,
    order: 4,
  },
];

export const contactDefaults: ContactFormPayload = {
  name: '',
  email: '',
  subject: '',
  message: '',
};
