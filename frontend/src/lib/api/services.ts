import type {
  ContactFormPayload,
  ContactResponse,
  Experience,
  GitHubStats,
  Profile,
  Project,
  Skill,
} from '@shared/types';
import { http } from './httpClient';
import { localProfile, localProjects, localSkills } from '@/data/portfolio';

/** Fetch profile, falling back to local seed data when offline. */
export async function fetchProfile(): Promise<Profile> {
  try { return await http.get<Profile>('/profile'); } catch { return localProfile; }
}

export async function fetchSkills(): Promise<Skill[]> {
  try { return await http.get<Skill[]>('/skills'); } catch { return localSkills; }
}

export async function fetchProjects(): Promise<Project[]> {
  try { return await http.get<Project[]>('/projects'); } catch { return localProjects; }
}

export async function fetchExperience(): Promise<Experience[]> {
  try {
    return await http.get<Experience[]>('/experience');
  } catch {
    return [];
  }
}

export async function fetchGitHubStats(): Promise<GitHubStats | null> {
  try { return await http.get<GitHubStats>('/github/stats'); } catch { return null; }
}

export async function sendContact(payload: ContactFormPayload): Promise<ContactResponse> {
  return http.post<ContactResponse>('/contact', payload);
}
