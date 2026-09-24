import type { Profile } from '@shared/types';
import { http } from '@/lib/api/httpClient';
import { localProfile } from './seeds';

/** Fetch the profile, falling back to local seed data when offline. */
export async function fetchProfile(): Promise<Profile> {
  try {
    return await http.get<Profile>('/profile');
  } catch {
    return localProfile;
  }
}