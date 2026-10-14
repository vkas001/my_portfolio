import { useContent } from '@/context/ContentContext';
import type { Blog } from '@shared/types';

/** Shared blogs store: one fetch owned by ContentProvider, so every
 *  consumer (Blogs, editor) sees the same live data. */
export function useBlogs(): Blog[] {
  return useContent().blogs;
}
