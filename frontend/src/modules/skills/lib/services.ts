import type { Skill } from '@shared/types';
import { http } from '@/lib/api/httpClient';
import { localSkills } from './seeds';

/** Fetch skills, falling back to local seed data when offline. */
export async function fetchSkills(): Promise<Skill[]> {
  try {
    return await http.get<Skill[]>('/skills');
  } catch {
    return localSkills;
  }
}