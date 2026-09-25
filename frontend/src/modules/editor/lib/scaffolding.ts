import type { ReactNode } from 'react';
import type { EditorSection } from '@/types';
import type { Experience, Project, SocialLink } from '@shared/types';

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
  titleOf: (t: T) => string;
  subOf: (t: T) => string;
  emptyFor: (id: string) => T;
  save: (value: T, isNew: boolean) => Promise<boolean>;
  remove: (id: string) => Promise<boolean>;
  validate: (d: T) => string | null;
  renderFields: (draft: T, set: (patch: Partial<T>) => void) => ReactNode;
  renderRowMeta: (t: T) => ReactNode;
  move?: (id: string, dir: -1 | 1) => void;
}

export const emptyProject = (id: string): Project => ({
  id, title: '', description: '', longDescription: '', techStack: [], category: '',
  featured: false, liveUrl: null, githubUrl: null, imageUrl: null, year: new Date().getFullYear(), order: Number.MAX_SAFE_INTEGER,
});

export const emptyExperience = (id: string): Experience => ({
  id, company: '', role: '', startDate: '', endDate: null, location: '', employmentType: 'Full-time',
  highlights: [], techStack: [], order: Number.MAX_SAFE_INTEGER,
});