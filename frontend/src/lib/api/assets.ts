import { API_BASE } from './httpClient';

/**
 * Resolve a backend file path (e.g. `/storage/avatars/x.png` returned by the
 * avatar upload) to a fetchable URL. Absolute/external/data/blob URLs pass
 * through untouched. Backend storage paths are anchored at the API origin so
 * they keep working when the app and the API live on different hosts; other
 * relative paths (bundled `/splash/*` art) stay on the app origin.
 */
export function assetUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined;
  if (/^(https?:|data:|blob:)/i.test(path)) return path;
  if (path.startsWith('/storage/')) {
    const origin = API_BASE.replace(/\/api\/?$/, '');
    if (/^https?:\/\//i.test(origin)) return `${origin}${path}`;
  }
  return path;
}
