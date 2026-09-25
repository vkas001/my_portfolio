import type { AuthUser, LoginPayload, LoginResponse } from '@shared/types';
import { http } from './httpClient';
import { setAuthToken } from './tokenStore';

/**
 * Single-admin auth (adapted backend: hand-rolled bearer tokens).
 * The token is stored on success and cleared on logout; every other call
 * fails soft so the OS keeps working offline as a guest.
 */
export const authService = {
  async login(payload: LoginPayload): Promise<LoginResponse> {
    const res = await http.post<LoginResponse>('/auth/login', payload);
    setAuthToken(res.token);
    return res;
  },

  async me(): Promise<AuthUser | null> {
    try {
      const res = await http.get<{ user: AuthUser }>('/auth/me');
      return res?.user ?? null;
    } catch {
      return null;
    }
  },

  async logout(): Promise<void> {
    try {
      await http.post('/auth/logout');
    } catch {
      // server unreachable — still drop the local session below
    }
    setAuthToken(null);
  },
};
