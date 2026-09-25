import type { GitHubStats } from '@shared/types';

/** Placeholder stats shown when the GitHub API is unreachable. */
export const fallbackStats: GitHubStats = {
  username: 'yourhandle',
  publicRepos: 24,
  followers: 180,
  starsEarned: 320,
  contributionsLastYear: 1240,
  languages: [
    { name: 'TypeScript', percent: 58 },
    { name: 'JavaScript', percent: 22 },
    { name: 'Python', percent: 12 },
    { name: 'CSS', percent: 8 },
  ],
  contributions: [],
  fetchedAt: new Date().toISOString(),
};