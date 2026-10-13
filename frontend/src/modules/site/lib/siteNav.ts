import { Code2, Folder, History, Mail, Newspaper, Sparkles, User, type LucideIcon } from 'lucide-react';
import type { AppId } from '@/types';

export interface SiteNavItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

/** Left-rail anchors for the bento site. Order mirrors the grid's reading
 *  order: identity first, contact last. */
export const SITE_NAV: SiteNavItem[] = [
  { id: 'site-about', label: 'About', icon: User },
  { id: 'site-skills', label: 'Skills', icon: Code2 },
  { id: 'site-projects', label: 'Projects', icon: Folder },
  { id: 'site-journey', label: 'Journey', icon: History },
  { id: 'site-writing', label: 'Writing', icon: Newspaper },
  { id: 'site-interests', label: 'Interests', icon: Sparkles },
  { id: 'site-contact', label: 'Contact', icon: Mail },
];

/** Content-app → site tile anchor. Apps without a tile (auth, editor,
 *  settings) have no public section and map to null. */
const APP_ANCHOR: Partial<Record<AppId, string>> = {
  about: 'site-about',
  skills: 'site-skills',
  projects: 'site-projects',
  experience: 'site-journey',
  education: 'site-journey',
  hobbies: 'site-interests',
  blogs: 'site-writing',
  contact: 'site-contact',
};

/** Scroll target for an app in Web view; null = no site section. */
export function siteAnchorFor(appId: string): string | null {
  return APP_ANCHOR[appId as AppId] ?? null;
}
