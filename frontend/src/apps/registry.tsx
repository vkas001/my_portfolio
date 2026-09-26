import { lazy } from 'react';
import { Briefcase, Code2, Folder, GraduationCap, LogIn, Mail, PencilLine, Settings as SettingsIcon, Sparkles, User } from 'lucide-react';
import type { AppDef, AppId, EditorSection } from '@/types';

const About = lazy(() => import('@/modules/about').then((m) => ({ default: m.AboutScreen })));
const Skills = lazy(() => import('@/modules/skills').then((m) => ({ default: m.SkillsScreen })));
const Projects = lazy(() => import('@/modules/projects').then((m) => ({ default: m.ProjectsScreen })));
const Experience = lazy(() => import('@/modules/experience').then((m) => ({ default: m.ExperienceScreen })));
const Education = lazy(() => import('@/modules/education').then((m) => ({ default: m.EducationScreen })));
const Hobbies = lazy(() => import('@/modules/hobbies').then((m) => ({ default: m.HobbiesScreen })));
const Contact = lazy(() => import('@/modules/contact').then((m) => ({ default: m.ContactScreen })));
const Settings = lazy(() => import('@/modules/settings').then((m) => ({ default: m.SettingsScreen })));
const Auth = lazy(() => import('@/modules/auth').then((m) => ({ default: m.AuthScreen })));
const Editor = lazy(() => import('@/modules/editor').then((m) => ({ default: m.EditorScreen })));

export const APP_REGISTRY: AppDef[] = [
  {
    id: 'about',
    name: 'About',
    icon: User,
    color: '#8b5cf6',
    component: About,
    defaultSize: { w: 680, h: 520 },
    minSize: { w: 420, h: 340 },
    description: 'Profile, bio and resume',
  },
  {
    id: 'skills',
    name: 'Skills',
    icon: Code2,
    color: '#06b6d4',
    component: Skills,
    defaultSize: { w: 640, h: 540 },
    minSize: { w: 420, h: 340 },
    description: 'Interactive skill matrix',
  },
  {
    id: 'projects',
    name: 'Projects',
    icon: Folder,
    color: '#f59e0b',
    component: Projects,
    defaultSize: { w: 860, h: 600 },
    minSize: { w: 520, h: 400 },
    description: 'Portfolio projects with links',
  },
  {
    id: 'experience',
    name: 'Experience',
    icon: Briefcase,
    color: '#10b981',
    component: Experience,
    defaultSize: { w: 680, h: 560 },
    minSize: { w: 420, h: 360 },
    description: 'Work history timeline',
  },
  {
    id: 'education',
    name: 'Education',
    icon: GraduationCap,
    color: '#6366f1',
    component: Education,
    defaultSize: { w: 680, h: 560 },
    minSize: { w: 420, h: 360 },
    description: 'Academic background',
  },
  {
    id: 'hobbies',
    name: 'Hobbies & Interests',
    icon: Sparkles,
    color: '#f97316',
    component: Hobbies,
    defaultSize: { w: 620, h: 520 },
    minSize: { w: 420, h: 340 },
    description: 'Hobbies, interests and side joys',
  },
  {
    id: 'contact',
    name: 'Contact',
    icon: Mail,
    color: '#f43f5e',
    component: Contact,
    defaultSize: { w: 560, h: 520 },
    minSize: { w: 400, h: 380 },
    description: 'Contact form and social links',
  },
  {
    id: 'settings',
    name: 'Settings',
    icon: SettingsIcon,
    color: '#64748b',
    component: Settings,
    defaultSize: { w: 720, h: 560 },
    minSize: { w: 480, h: 400 },
    description: 'Theme, wallpaper and widgets',
  },
  {
    id: 'auth',
    name: 'Sign in',
    icon: LogIn,
    color: '#38bdf8',
    component: Auth,
    defaultSize: { w: 480, h: 540 },
    minSize: { w: 400, h: 440 },
    singleInstance: true,
    system: true,
    description: 'Admin sign in and account',
  },
  {
    id: 'editor',
    name: 'Editor',
    icon: PencilLine,
    color: '#38bdf8',
    component: Editor,
    defaultSize: { w: 620, h: 640 },
    minSize: { w: 480, h: 520 },
    singleInstance: false,
    system: true,
    description: 'Manage portfolio content live',
  },
];

/** Apps the editor manages / can dock alongside itself. Content apps map to
 *  the portfolio section their editor manages (single source for the
 *  WindowFrame ＋ edit affordance AND the editor's app switcher); apps with
 *  no section (contact — gets its own editor once contact gains editable
 *  fields) are dock-only: opening them leaves the current section untouched. */
export const EDITABLE_APPS: { appId: AppId; section: EditorSection | null }[] = [
  { appId: 'about', section: 'profile' },
  { appId: 'skills', section: 'skills' },
  { appId: 'projects', section: 'projects' },
  { appId: 'experience', section: 'experience' },
  { appId: 'education', section: 'education' },
  { appId: 'hobbies', section: 'hobbies' },
  { appId: 'contact', section: null },
];
