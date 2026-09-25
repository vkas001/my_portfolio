import type { ApiError } from '@shared/types';
import { getAuthToken } from './tokenStore';
import { isForcedOffline } from '@/lib/network';

export const API_BASE = import.meta.env.VITE_API_URL ?? '/api';

/** Fail fast so local fallbacks kick in when the backend is unreachable
 *  (down, wrong LAN IP, blackholed) instead of hanging on skeletons. */
const REQUEST_TIMEOUT_MS = 8000;

// ─── GET memoization ─────────────────────────────────────────────────────────
// Boot fans out to many consumers (ContentContext + widgets). Each GET path is
// cached thread-wide for a short TTL so duplicate/parallel loads collapse into
// one actual request and remounts reuse the fresh result. Mutations bypass.
const GET_CACHE_TTL_MS = 30000;
const getCache = new Map<string, { at: number; data: unknown }>();
const inflight = new Map<string, Promise<unknown>>();

/** Drop cached GETs — optionally just those under a path prefix — so the next
 *  call re-fetches (used by ContentContext.refresh and after mutations). */
export function invalidate(pathPrefix?: string): void {
  if (!pathPrefix) {
    getCache.clear();
    return;
  }
  for (const key of [...getCache.keys()]) {
    if (key.startsWith(pathPrefix)) getCache.delete(key);
  }
}

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

/** Fail fast under airplane mode so local seed fallbacks kick in. */
function ensureOnline(): void {
  if (isForcedOffline()) throw new HttpError(0, 'Offline mode');
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  ensureOnline();
  let res: Response;
  const token = getAuthToken();
  try {
    res = await fetch(`${API_BASE}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init?.headers,
      },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      ...init,
    });
  } catch {
    throw new HttpError(0, 'Network unreachable');
  }

  const body = (await res.json().catch(() => null)) as (ApiError & { data?: T }) | null;

  if (!res.ok || !body?.ok) {
    throw new HttpError(res.status, body?.error ?? `Request failed (${res.status})`);
  }
  return body.data as T;
}

export const http = {
  get: <T>(path: string): Promise<T> => {
    ensureOnline();
    const hit = getCache.get(path);
    if (hit && Date.now() - hit.at < GET_CACHE_TTL_MS) {
      return Promise.resolve(hit.data as T);
    }
    const pending = inflight.get(path);
    if (pending) return pending as Promise<T>;
    const p = request<T>(path)
      .then((data) => {
        inflight.delete(path);
        getCache.set(path, { at: Date.now(), data });
        return data;
      })
      .catch((err) => {
        inflight.delete(path);
        throw err;
      });
    inflight.set(path, p);
    return p;
  },
  post: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(data ?? {}) }),
  put: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(data ?? {}) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
