import { lazy } from 'react';
import type { WidgetMeta } from '@/types';

const ProfileCard = lazy(() => import('@/modules/widgets/components/ProfileCard/ProfileCard'));
const SkillCloud = lazy(() => import('@/modules/widgets/components/SkillCloud/SkillCloud'));
const ProjectShowcase = lazy(() => import('@/modules/widgets/components/ProjectShowcase/ProjectShowcase'));
const GitHubStats = lazy(() => import('@/modules/widgets/components/GitHubStats/GitHubStats'));
const ContactQuick = lazy(() => import('@/modules/widgets/components/ContactQuick/ContactQuick'));
const ClockWidget = lazy(() => import('@/modules/widgets/components/ClockWidget/ClockWidget'));

export const WIDGET_DEFS: WidgetMeta[] = [
  {
    id: 'profile-card',
    name: 'Profile',
    description: 'Name, title and quick links',
    component: ProfileCard,
    defaultVariant: 'medium',
    variants: {
      small: { w: 192, h: 168 },
      medium: { w: 288, h: 216 },
      wide: { w: 408, h: 216 },
    },
  },
  {
    id: 'skill-cloud',
    name: 'Skill Cloud',
    description: 'Top skills at a glance',
    component: SkillCloud,
    defaultVariant: 'medium',
    variants: {
      small: { w: 192, h: 168 },
      medium: { w: 288, h: 240 },
      large: { w: 360, h: 312 },
    },
  },
  {
    id: 'project-showcase',
    name: 'Featured Project',
    description: 'Rotating featured projects',
    component: ProjectShowcase,
    defaultVariant: 'medium',
    variants: {
      medium: { w: 288, h: 240 },
      wide: { w: 408, h: 240 },
      large: { w: 360, h: 336 },
    },
  },
  {
    id: 'github-stats',
    name: 'GitHub Stats',
    description: 'Repos, stars and streaks',
    component: GitHubStats,
    defaultVariant: 'medium',
    variants: {
      small: { w: 192, h: 168 },
      medium: { w: 288, h: 216 },
    },
  },
  {
    id: 'contact-quick',
    name: 'Quick Contact',
    description: 'One-click contact actions',
    component: ContactQuick,
    defaultVariant: 'small',
    variants: {
      small: { w: 192, h: 168 },
      medium: { w: 288, h: 192 },
    },
  },
  {
    id: 'clock',
    name: 'Clock',
    description: 'Local time and date',
    component: ClockWidget,
    defaultVariant: 'small',
    variants: {
      small: { w: 192, h: 144 },
      medium: { w: 288, h: 144 },
    },
  },
];
