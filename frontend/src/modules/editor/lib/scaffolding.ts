import type { ReactNode } from 'react';
import type { EditorSection } from '@/types';
import type { Education, Experience, Hobby, Project, SocialLink } from '@shared/types';

export const newId = () => crypto.randomUUID().slice(0, 8);

export const SOCIAL_ICONS: SocialLink['icon'][] = ['github', 'linkedin', 'twitter', 'website', 'email'];

export interface SaveBridge {
  commitRef: { current: (() => void) | null };
  reportSave: (s: { canSave: boolean; saving: boolean }) => void;
}

export interface BaseItem {
  id: string;
}

export interface SectionScaffold<T extends BaseItem> {
  section: EditorSection;
  items: T[];
  /** Icon shown in the page hero and, unless `rowIcon` overrides it, per row. */
  icon?: ReactNode;
  rowIcon?: (t: T) => ReactNode;
  titleOf: (t: T) => string;
  subOf: (t: T) => string;
  emptyFor: (id: string) => T;
  save: (value: T, isNew: boolean) => Promise<boolean>;
  remove: (id: string) => Promise<boolean>;
  validate: (d: T) => string | null;
  renderFields: (draft: T, set: (patch: Partial<T>) => void, actions: { quickAddIn: (category: string) => void }) => ReactNode;
  renderRowMeta: (t: T) => ReactNode;
  move?: (id: string, dir: -1 | 1) => void;
  /** Stamp a category onto a draft (quick-add). Only needed when a field
   *  offers per-category + quick-add (skills). */
  setCategory?: (draft: T, category: string) => T;
  /** Preset for the fresh draft opened right after a quick-add save, so the
   *  form stays open on the same category for rapid entry. */
  presetCategory?: (category: string) => Partial<T>;
  /** After a successful ADD (not edit), keep the form open with a fresh draft
   *  instead of closing — rapid entry of several items. Receives the just-
   *  saved draft so the preset can carry values over (e.g. keep category). */
  repeatPreset?: (saved: T) => Partial<T>;
}

export const SECTION_LABELS: Record<EditorSection, string> = {
  profile: 'Profile',
  skills: 'Skills',
  projects: 'Projects',
  experience: 'Experience',
  education: 'Education',
  hobbies: 'Hobbies',
};

/** "3 items" / "2 entries" — experience reads better as entries. */
export const SECTION_UNIT = (section: EditorSection) => (section === 'experience' ? 'entry' : 'item');

export const emptyProject = (id: string): Project => ({
  id, title: '', description: '', longDescription: '', techStack: [], category: '',
  featured: false, liveUrl: null, githubUrl: null, imageUrl: null, year: new Date().getFullYear(), order: Number.MAX_SAFE_INTEGER,
});

export const emptyExperience = (id: string): Experience => ({
  id, company: '', role: '', startDate: '', endDate: null, location: '', employmentType: 'Full-time',
  highlights: [], techStack: [], order: Number.MAX_SAFE_INTEGER,
});

export const emptyEducation = (id: string): Education => ({
  id, institution: '', degree: '', startDate: '', endDate: null, description: '', order: Number.MAX_SAFE_INTEGER,
});

export const emptyHobby = (id: string): Hobby => ({
  id, name: '', icon: 'mountain', description: '', order: Number.MAX_SAFE_INTEGER,
});