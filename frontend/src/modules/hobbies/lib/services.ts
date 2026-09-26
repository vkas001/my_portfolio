import type { Hobby } from '@shared/types';
import { http } from '@/lib/api/httpClient';

/** Fetch hobbies; offline yields an empty list (the screen shows its empty
 *  state rather than fabricated content). */
export async function fetchHobbies(): Promise<Hobby[]> {
  try {
    return await http.get<Hobby[]>('/hobbies');
  } catch {
    return [];
  }
}