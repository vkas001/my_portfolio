import type { Project } from '@shared/types';
import { http } from '@/lib/api/httpClient';
import { localProjects } from './seeds';

/** Fetch projects, falling back to local seed data when offline. */
export async function fetchProjects(): Promise<Project[]> {
  try {
    return await http.get<Project[]>('/projects');
  } catch {
    return localProjects;
  }
}