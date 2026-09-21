import { lazy } from 'react';
import type { AppDef } from '@/types';

const About = lazy(() => import('./About'));
const Skills = lazy(() => import('./Skills'));
const Projects = lazy(() => import('./Projects'));
const Experience = lazy(() => import('./Experience'));
const Contact = lazy(() => import('./Contact'));
const Settings = lazy(() => import('./Settings'));

export const APP_REGISTRY: AppDef[] = [
  {
    id: 'about',
    name: 'About',
    icon: '👤',
    color: '#8b5cf6',
    component: About,
    defaultSize: { w: 680, h: 520 },
    minSize: { w: 420, h: 340 },
    description: 'Profile, bio and resume',
  },
  {
    id: 'skills',
    name: 'Skills',
    icon: '⚡',
    color: '#06b6d4',
    component: Skills,
    defaultSize: { w: 640, h: 540 },
    minSize: { w: 420, h: 340 },
    description: 'Interactive skill matrix',
  },
  {
    id: 'projects',
    name: 'Projects',
    icon: '🚀',
    color: '#f59e0b',
    component: Projects,
    defaultSize: { w: 860, h: 600 },
    minSize: { w: 520, h: 400 },
    description: 'Portfolio projects with links',
  },
  {
    id: 'experience',
    name: 'Experience',
    icon: '📅',
    color: '#10b981',
    component: Experience,
    defaultSize: { w: 680, h: 560 },
    minSize: { w: 420, h: 360 },
    description: 'Work history timeline',
  },
  {
    id: 'contact',
    name: 'Contact',
    icon: '✉️',
    color: '#f43f5e',
    component: Contact,
    defaultSize: { w: 560, h: 520 },
    minSize: { w: 400, h: 380 },
    description: 'Contact form and social links',
  },
  {
    id: 'settings',
    name: 'Settings',
    icon: '⚙️',
    color: '#64748b',
    component: Settings,
    defaultSize: { w: 720, h: 560 },
    minSize: { w: 480, h: 400 },
    description: 'Theme, wallpaper and widgets',
  },
];
