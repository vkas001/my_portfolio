import type { ApiError } from '@shared/types';
import { getAuthToken } from './tokenStore';

const BASE = import.meta.env.VITE_API_URL ?? '/api';

/** Fail fast so local fallbacks kick in when the backend is unreachable
 *  (down, wrong LAN IP, blackholed) instead of hanging on skeletons. */
const REQUEST_TIMEOUT_MS = 8000;

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  const token = getAuthToken();
  try {
    res = await fetch(`${BASE}${path}`, {
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
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(data ?? {}) }),
  put: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(data ?? {}) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
