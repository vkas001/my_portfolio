// ─── Profile ────────────────────────────────────────────────────────────────
export interface Profile {
  id: string;
  name: string;
  title: string;
  bio: string;
  shortBio: string;
  /** Scannable "what I'm good at" bullets (full-ownership/focus highlights). */
  strengths: string[];
  /** Short personal note — location, interests, what you're exploring now. */
  personalNote: string;
  /** Availability badge text shown next to location (empty = hidden). */
  openToWork: string;
  /** Editable section heading for the strengths block. */
  strengthsTitle: string;
  /** Lucide icon name rendered before the strengths heading. */
  strengthsIcon: string;
  /** Editable heading for the personal-note block. */
  personalNoteTitle: string;
  /** Lucide icon name rendered before the personal-note heading. */
  personalNoteIcon: string;
  avatarUrl: string | null;
  resumeUrl: string | null;
  email: string;
  location: string;
  socials: SocialLink[];
  yearsExperience: number;
}

export interface SocialLink {
  id: string;
  label: string;
  url: string;
  icon: 'github' | 'linkedin' | 'twitter' | 'website' | 'email';
}

// ─── Skills ─────────────────────────────────────────────────────────────────
export type SkillCategory =
  | 'languages'
  | 'frontend'
  | 'backend'
  | 'database'
  | 'devops'
  | 'design'
  | 'tools';

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  proficiency: number; // 0-100
  yearsUsed: number;
  icon?: string | null;
}

// ─── Projects ───────────────────────────────────────────────────────────────
export interface Project {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  techStack: string[];
  category: string;
  featured: boolean;
  liveUrl: string | null;
  githubUrl: string | null;
  imageUrl: string | null;
  year: number;
  order: number;
}

// ─── Experience ─────────────────────────────────────────────────────────────
export interface Experience {
  id: string;
  company: string;
  role: string;
  startDate: string; // ISO
  endDate: string | null; // null = current
  location: string;
  employmentType: string;
  highlights: string[];
  techStack: string[];
  order: number;
}

// ─── Contact ────────────────────────────────────────────────────────────────
export interface ContactFormPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactResponse {
  message: string;
}

// ─── GitHub Stats ───────────────────────────────────────────────────────────
export interface GitHubStats {
  username: string;
  publicRepos: number;
  followers: number;
  starsEarned: number;
  contributionsLastYear: number;
  languages: { name: string; percent: number }[];
  contributions: { date: string; count: number }[];
  fetchedAt: string;
}

// ─── Auth ───────────────────────────────────────────────────────────────────
// Single-admin auth (hand-rolled bearer tokens). Guests browse + keep a
// local-only theme; only a signed-in admin persists site settings.
export interface AuthUser {
  id: number;
  name: string;
  email: string;
  isAdmin: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

// ─── Admin content inputs ─────────────────────────────────────────────────────
// Payloads for the auth.token-gated /admin/* endpoints. The frontend generates
// a short id (crypto.randomUUID().slice(0,8)) for new records; PUTs key off the
// URL id and may omit it from the body.
export interface ProfileInput {
  name: string;
  title: string;
  shortBio: string;
  bio: string;
  strengths?: string[];
  personalNote?: string;
  openToWork?: string;
  strengthsTitle?: string;
  strengthsIcon?: string;
  personalNoteTitle?: string;
  personalNoteIcon?: string;
  avatarUrl?: string | null;
  resumeUrl?: string | null;
  email: string;
  location: string;
  yearsExperience: number;
  socials: {
    id?: string;
    label: string;
    url: string;
    icon: SocialLink['icon'];
  }[];
}

export interface SkillInput {
  id?: string;
  name: string;
  category: SkillCategory;
  proficiency: number;
  yearsUsed?: number;
  icon?: string | null;
}

export interface ProjectInput {
  id?: string;
  title: string;
  description: string;
  longDescription?: string;
  techStack?: string[];
  category: string;
  featured?: boolean;
  liveUrl?: string | null;
  githubUrl?: string | null;
  imageUrl?: string | null;
  year: number;
  order?: number;
}

export interface ExperienceInput {
  id?: string;
  company: string;
  role: string;
  startDate: string; // YYYY-MM-DD
  endDate?: string | null; // null = current
  location: string;
  employmentType: string;
  highlights?: string[];
  techStack?: string[];
  order?: number;
}

// ─── API Envelope ───────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  ok: boolean;
  data: T;
  error?: string;
}

export interface ApiError {
  ok: false;
  error: string;
}
