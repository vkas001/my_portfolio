import type {
  Education,
  EducationInput,
  Experience,
  ExperienceInput,
  Hobby,
  HobbyInput,
  Profile,
  ProfileInput,
  Project,
  ProjectInput,
  Skill,
  SkillInput,
} from '@shared/types';
import { API_BASE, http } from './httpClient';
import { getAuthToken } from './tokenStore';

/** Admin-only writes for the portfolio content editor. All endpoints sit
 *  behind the backend `auth.token` guard; a guest call rejects with 401 and
 *  the ContentContext rolls back its optimistic update. */
export const adminService = {
  updateProfile: (input: ProfileInput) => http.put<Profile>('/admin/profile', input),

  /** Multipart avatar upload (the JSON http client can't carry a file). */
  uploadAvatar: async (file: File): Promise<Profile> => {
    const form = new FormData();
    form.append('image', file);
    const token = getAuthToken();
    const res = await fetch(`${API_BASE}/admin/avatar`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });
    const body = (await res.json().catch(() => null)) as { ok?: boolean; data?: Profile; error?: string } | null;
    if (!res.ok || !body?.ok || !body.data) {
      throw new Error(body?.error ?? `Upload failed (${res.status})`);
    }
    return body.data;
  },

  storeSkill: (input: SkillInput) => http.post<Skill>('/admin/skills', input),
  updateSkill: (id: string, input: SkillInput) => http.put<Skill>(`/admin/skills/${id}`, input),
  deleteSkill: (id: string) => http.delete<{ id: string }>(`/admin/skills/${id}`),

  storeProject: (input: ProjectInput) => http.post<Project>('/admin/projects', input),
  updateProject: (id: string, input: ProjectInput) => http.put<Project>(`/admin/projects/${id}`, input),
  deleteProject: (id: string) => http.delete<{ id: string }>(`/admin/projects/${id}`),

  storeExperience: (input: ExperienceInput) => http.post<Experience>('/admin/experience', input),
  updateExperience: (id: string, input: ExperienceInput) => http.put<Experience>(`/admin/experience/${id}`, input),
  deleteExperience: (id: string) => http.delete<{ id: string }>(`/admin/experience/${id}`),

  storeEducation: (input: EducationInput) => http.post<Education>('/admin/education', input),
  updateEducation: (id: string, input: EducationInput) => http.put<Education>(`/admin/education/${id}`, input),
  deleteEducation: (id: string) => http.delete<{ id: string }>(`/admin/education/${id}`),

  storeHobby: (input: HobbyInput) => http.post<Hobby>('/admin/hobbies', input),
  updateHobby: (id: string, input: HobbyInput) => http.put<Hobby>(`/admin/hobbies/${id}`, input),
  deleteHobby: (id: string) => http.delete<{ id: string }>(`/admin/hobbies/${id}`),
};