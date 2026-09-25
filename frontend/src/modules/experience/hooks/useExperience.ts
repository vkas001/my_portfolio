import { useContent } from '@/context/ContentContext';
import type { Experience } from '@shared/types';

/** Shared experience store: one fetch owned by ContentProvider, so every
 *  consumer (Experience, editor) sees the same live data. */
export function useExperience(): Experience[] {
  return useContent().experience;
}