import { useContent } from '@/context/ContentContext';
import type { Skill } from '@shared/types';

/** Shared skills store: one fetch owned by ContentProvider, so every
 *  consumer (Skills, SkillCloud, editor) sees the same live data. */
export function useSkills(): Skill[] {
  return useContent().skills;
}