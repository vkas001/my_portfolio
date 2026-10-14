import type { Blog } from '@shared/types';
import { http } from '@/lib/api/httpClient';
import { getAuthToken } from '@/lib/api/tokenStore';

/** Blogs feed: the admin index (including drafts) when signed in, otherwise
 *  the public published-only feed. A stale token falls back to public;
 *  offline yields an empty list like the other slices. */
export async function fetchBlogs(): Promise<Blog[]> {
  if (getAuthToken()) {
    try {
      return await http.get<Blog[]>('/admin/blogs');
    } catch {
      // stale token — fall through to the public feed
    }
  }
  try {
    return await http.get<Blog[]>('/blogs');
  } catch {
    return [];
  }
}
