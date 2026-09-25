import { useContent } from '@/context/ContentContext';
import type { Project } from '@shared/types';

/** Shared projects store: one fetch owned by ContentProvider, so every
 *  consumer (Projects, ProjectShowcase, editor) sees the same live data. */
export function useProjects(): Project[] {
  return useContent().projects;
}