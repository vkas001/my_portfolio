import { useEffect, useState } from 'react';
import { fetchProfile } from '@/lib/api';
import type { Profile } from '@shared/types';

/** Shared profile fetch: one in-flight request reused by every consumer
 *  (About, TopBar, ProfileCard) instead of one fetch each. */
let cached: Promise<Profile> | null = null;

function getProfile(): Promise<Profile> {
  if (!cached) cached = fetchProfile();
  return cached;
}

export function useProfile(): Profile | null {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    let alive = true;
    getProfile().then((p) => { if (alive) setProfile(p); });
    return () => { alive = false; };
  }, []);

  return profile;
}
