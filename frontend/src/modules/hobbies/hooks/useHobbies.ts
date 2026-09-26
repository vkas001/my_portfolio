import { useContent } from '@/context/ContentContext';
import type { Hobby } from '@shared/types';

/** Shared hobbies store: one fetch owned by ContentProvider, so every
 *  consumer (Hobbies, editor) sees the same live data. */
export function useHobbies(): Hobby[] {
  return useContent().hobbies;
}