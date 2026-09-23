import type {
  Experience,
  ExperienceInput,
  Profile,
  ProfileInput,
  Project,
  ProjectInput,
  Skill,
  SkillInput,
} from '@shared/types';
import { http } from './httpClient';

/** Admin-only writes for the portfolio content editor. All endpoints sit
 *  behind the backend `auth.token` guard; a guest call rejects with 401 and
 *  the ContentContext rolls back its optimistic update. */
export const adminService = {
  updateProfile: (input: ProfileInput) => http.put<Profile>('/admin/profile', input),

  storeSkill: (input: SkillInput) => http.post<Skill>('/admin/skills', input),
  updateSkill: (id: string, input: SkillInput) => http.put<Skill>(`/admin/skills/${id}`, input),
  deleteSkill: (id: string) => http.delete<{ id: string }>(`/admin/skills/${id}`),

  storeProject: (input: ProjectInput) => http.post<Project>('/admin/projects', input),
  updateProject: (id: string, input: ProjectInput) => http.put<Project>(`/admin/projects/${id}`, input),
  deleteProject: (id: string) => http.delete<{ id: string }>(`/admin/projects/${id}`),

  storeExperience: (input: ExperienceInput) => http.post<Experience>('/admin/experience', input),
  updateExperience: (id: string, input: ExperienceInput) => http.put<Experience>(`/admin/experience/${id}`, input),
  deleteExperience: (id: string) => http.delete<{ id: string }>(`/admin/experience/${id}`),
};