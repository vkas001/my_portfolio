// ─── Profile ────────────────────────────────────────────────────────────────
export interface Profile {
  id: string;
  name: string;
  title: string;
  bio: string;
  shortBio: string;
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
  ok: boolean;
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
