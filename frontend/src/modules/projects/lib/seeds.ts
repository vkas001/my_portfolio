import type { Project } from '@shared/types';

/** Local fallback projects (also seeded in the backend database). */
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