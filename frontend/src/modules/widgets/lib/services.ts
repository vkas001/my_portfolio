import type { GitHubStats } from '@shared/types';
import { http } from '@/lib/api/httpClient';

/** Fetch GitHub stats; null when unreachable (widget falls back to seeds). */
export async function fetchGitHubStats(): Promise<GitHubStats | null> {
  try {
    return await http.get<GitHubStats>('/github/stats');
  } catch {
    return null;
  }
}