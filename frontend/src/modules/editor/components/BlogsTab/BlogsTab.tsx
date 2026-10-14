import type { Blog } from '@shared/types';
import { useContent } from '@/context/ContentContext';
import SectionEditor from '@/modules/editor/components/SectionEditor/SectionEditor';
import BlogFields from '@/modules/editor/components/BlogFields/BlogFields';
import { Newspaper } from 'lucide-react';
import { emptyBlog, type SaveBridge } from '@/modules/editor/lib/scaffolding';

export default function BlogsTab({ commitRef, reportSave }: SaveBridge) {
  const { blogs, saveBlog, deleteBlog, moveItem } = useContent();
  return (
    <SectionEditor<Blog>
      commitRef={commitRef}
      reportSave={reportSave}
      scaffold={{
        section: 'blogs',
        items: blogs,
        icon: <Newspaper size={18} />,
        titleOf: (p) => p.title,
        subOf: (p) => `${p.published ? '' : 'Draft · '}${p.tags.slice(0, 3).join(', ') || 'No tags'}`,
        emptyFor: emptyBlog,
        save: saveBlog,
        remove: deleteBlog,
        move: (id, dir) => { void moveItem('blogs', id, dir); },
        validate: (d) => (d.title.trim() && d.body.trim() ? null : 'Title and body are required'),
        renderFields: (d, set) => <BlogFields d={d} set={set} />,
        renderRowMeta: (p) => (
          <span className="text-[10px] tabular-nums" style={{ color: p.published ? 'var(--text-low)' : 'var(--accent)' }}>
            {p.published ? (p.publishedAt ? p.publishedAt.slice(0, 10) : '') : 'DRAFT'}
          </span>
        ),
      }}
    />
  );
}
