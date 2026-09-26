import type { Education } from '@shared/types';
import { http } from '@/lib/api/httpClient';

/** Fetch education entries; offline yields an empty list (the screen shows
 *  its empty state rather than fabricated content). */
export async function fetchEducation(): Promise<Education[]> {
  try {
    return await http.get<Education[]>('/education');
  } catch {
    return [];
  }
}