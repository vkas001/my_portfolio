import type { Education, Experience, Hobby, Profile, Project, Skill } from '@shared/types';

export interface CvSkillGroup {
  category: string;
  items: string[];
}

export interface CvData {
  profile: Profile;
  summary: string;
  strengths: string[];
  experience: Experience[];
  projects: Project[];
  education: Education[];
  hobbies: Hobby[];
  skillGroups: CvSkillGroup[];
}

interface CvSource {
  profile: Profile | null;
  skills: Skill[];
  projects: Project[];
  experience: Experience[];
  education: Education[];
  hobbies: Hobby[];
}

/** Markdown-ish content is written for the site; the CV needs plain prose. */
export function plainText(value: string | null | undefined): string {
  if (!value) return '';
  return value
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[*_~`>#]+/g, '')
    .replace(/\r?\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function formatCvDate(iso: string | null | undefined): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export function formatCvRange(start: string, end: string | null): string {
  const from = formatCvDate(start);
  const to = end ? formatCvDate(end) : 'Present';
  return from ? `${from} — ${to}` : to;
}

export function displayUrl(url: string): string {
  return url.replace(/^https?:\/\//i, '').replace(/^mailto:/i, '').replace(/\/$/, '');
}

export function cvInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

function categoryLabel(category: string): string {
  const trimmed = category.trim();
  if (!trimmed) return 'Other';
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

function groupSkills(skills: Skill[]): CvSkillGroup[] {
  const groups = new Map<string, string[]>();

  for (const skill of skills) {
    const key = categoryLabel(skill.category);
    const items = groups.get(key) ?? [];
    if (!items.includes(skill.name)) items.push(skill.name);
    groups.set(key, items);
  }

  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([category, items]) => ({ category, items }));
}

/** Build the CV model entirely from the content the portfolio apps already own. */
export function buildCv(source: CvSource): CvData | null {
  const { profile } = source;
  if (!profile) return null;

  const projects = [...source.projects]
    .sort((a, b) => Number(b.featured) - Number(a.featured) || a.order - b.order)
    .slice(0, 4);

  return {
    profile,
    summary: plainText(profile.shortBio) || plainText(profile.bio),
    strengths: profile.strengths.map((s) => plainText(s.text)).filter(Boolean),
    experience: [...source.experience].sort((a, b) => a.order - b.order),
    projects,
    education: [...source.education].sort((a, b) => a.order - b.order),
    hobbies: [...source.hobbies].sort((a, b) => a.order - b.order),
    skillGroups: groupSkills(source.skills),
  };
}
