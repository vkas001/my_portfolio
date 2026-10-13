import { Briefcase, Code2, Folder, GraduationCap, Mail, Newspaper, User, type LucideIcon } from 'lucide-react';
import type { AppId } from '@/types';

export interface SiteNavItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

/** Reading-column anchors for the split-résumé site. Order mirrors the
 *  page: identity first, contact last. */
export const SITE_NAV: SiteNavItem[] = [
  { id: 'site-about', label: 'About', icon: User },
  { id: 'site-experience', label: 'Experience', icon: Briefcase },
  { id: 'site-education', label: 'Education', icon: GraduationCap },
  { id: 'site-projects', label: 'Projects', icon: Folder },
  { id: 'site-skills', label: 'Skills', icon: Code2 },
  { id: 'site-writing', label: 'Writing', icon: Newspaper },
  { id: 'site-contact', label: 'Contact', icon: Mail },
];

/** Content-app → site section anchor. Apps without a section (auth, editor,
 *  settings) map to null. Hobbies fold into the About pane. */
const APP_ANCHOR: Partial<Record<AppId, string>> = {
  about: 'site-about',
  skills: 'site-skills',
  projects: 'site-projects',
  experience: 'site-experience',
  education: 'site-education',
  hobbies: 'site-about',
  blogs: 'site-writing',
  contact: 'site-contact',
};

/** Scroll target for an app in Web view; null = no site section. */
export function siteAnchorFor(appId: string): string | null {
  return APP_ANCHOR[appId as AppId] ?? null;
}
