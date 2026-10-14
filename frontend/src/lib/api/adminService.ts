import type {
  Blog,
  BlogInput,
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
import type { ThemeState } from '@/styles/theme';

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

  /** Multipart splash backdrop upload (replaces any previous custom file).
   *  Returns the merged theme so the caller can sync the field. */
  uploadSplashImage: async (file: File): Promise<ThemeState> => {
    const form = new FormData();
    form.append('image', file);
    const token = getAuthToken();
    const res = await fetch(`${API_BASE}/theme/splash-image`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });
    const body = (await res.json().catch(() => null)) as { ok?: boolean; data?: { theme: ThemeState }; error?: string } | null;
    if (!res.ok || !body?.ok || !body.data?.theme) {
      throw new Error(body?.error ?? `Upload failed (${res.status})`);
    }
    return body.data.theme;
  },

  /** Remove the custom backdrop file and fall back to the gradient preset. */
  removeSplashImage: (): Promise<{ theme: ThemeState }> =>
    http.delete<{ theme: ThemeState }>('/theme/splash-image'),

  /** Multipart desktop wallpaper upload (replaces any previous custom file). */
  uploadWallpaperImage: async (file: File): Promise<ThemeState> => {
    const form = new FormData();
    form.append('image', file);
    const token = getAuthToken();
    const res = await fetch(`${API_BASE}/theme/wallpaper-image`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });
    const body = (await res.json().catch(() => null)) as { ok?: boolean; data?: { theme: ThemeState }; error?: string } | null;
    if (!res.ok || !body?.ok || !body.data?.theme) {
      throw new Error(body?.error ?? `Upload failed (${res.status})`);
    }
    return body.data.theme;
  },

  /** Remove the custom wallpaper file and fall back to the preset id. */
  removeWallpaperImage: (): Promise<{ theme: ThemeState }> =>
    http.delete<{ theme: ThemeState }>('/theme/wallpaper-image'),

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

  storeBlog: (input: BlogInput) => http.post<Blog>('/admin/blogs', input),
  updateBlog: (id: string, input: BlogInput) => http.put<Blog>(`/admin/blogs/${id}`, input),
  deleteBlog: (id: string) => http.delete<{ id: string }>(`/admin/blogs/${id}`),
};