import type { ApiError } from '@shared/types';

const BASE = import.meta.env.VITE_API_URL ?? '/api';

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
  try {
    res = await fetch(`${BASE}${path}`, {
      headers: { 'Content-Type': 'application/json', ...init?.headers },
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
