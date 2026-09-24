import type {
  ContactFormPayload,
  ContactResponse,
  Experience,
  GitHubStats,
  Project,
  Skill,
} from '@shared/types';
import { http } from './httpClient';
import { localProjects, localSkills } from '@/data/portfolio';

/** Profile fetching lives in the About module (its own store + offline seed).
 *  Re-exported here to keep ContentContext's data layer import stable. */
export { fetchProfile } from '@/modules/about/lib/services';

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
