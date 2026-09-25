import type { Experience } from '@shared/types';
import { http } from '@/lib/api/httpClient';

/** Fetch experience entries; offline yields an empty list (the screen shows
 *  its empty state rather than fabricated content). */
export async function fetchExperience(): Promise<Experience[]> {
  try {
    return await http.get<Experience[]>('/experience');
  } catch {
    return [];
  }
}