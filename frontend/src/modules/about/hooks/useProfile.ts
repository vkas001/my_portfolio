import { useContent } from '@/context/ContentContext';
import type { Profile } from '@shared/types';

/** Shared profile store: one fetch owned by ContentProvider, so every
 *  consumer (About, TopBar, ProfileCard, editor) sees the same live data. */
export function useProfile(): Profile | null {
  return useContent().profile;
}