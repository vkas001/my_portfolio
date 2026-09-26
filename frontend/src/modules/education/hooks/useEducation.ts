import { useContent } from '@/context/ContentContext';
import type { Education } from '@shared/types';

/** Shared education store: one fetch owned by ContentProvider, so every
 *  consumer (Education, editor) sees the same live data. */
export function useEducation(): Education[] {
  return useContent().education;
}