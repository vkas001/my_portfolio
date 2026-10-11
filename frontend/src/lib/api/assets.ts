import { API_BASE } from './httpClient';

/**
 * Resolve a backend file path (e.g. `/storage/avatars/x.png` returned by the
 * avatar upload) to a fetchable URL. Absolute/external/data/blob URLs pass
 * through untouched. Relative paths are anchored at the API origin so they
 * keep working when the app and the API live on different hosts (dev LAN,
 * proxies) — a bare `/storage/…` src would 404 and the image stays invisible.
 */
export function assetUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined;
  if (/^(https?:|data:|blob:)/i.test(path)) return path;
  if (path.startsWith('/')) {
    const origin = API_BASE.replace(/\/api\/?$/, '');
    if (/^https?:\/\//i.test(origin)) return `${origin}${path}`;
  }
  return path;
}
