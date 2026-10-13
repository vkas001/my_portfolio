import { useState } from 'react';
import type { Blog } from '@shared/types';
import Field from '@/modules/editor/components/Field/Field';
import Input from '@/components/ui/Input/Input';
import TextArea from '@/components/ui/TextArea/TextArea';
import StringListInput from '@/modules/editor/components/StringListInput/StringListInput';
import MarkdownBody from '@/components/ui/MarkdownBody/MarkdownBody';

export default function BlogFields({
  d,
  set,
}: {
  d: Blog;
  set: (patch: Partial<Blog>) => void;
}) {
  const [showPreview, setShowPreview] = useState(false);
  return (
    <>
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-7">
          <Input label="Title" value={d.title} onChange={(e) => set({ title: e.target.value })} />
        </div>
        <div className="col-span-5 flex items-end pb-1">
          <label className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: 'var(--text-mid)' }}>
            <input type="checkbox" checked={d.published} onChange={(e) => set({ published: e.target.checked })} /> Published
          </label>
        </div>
      </div>
      <TextArea label="Excerpt" rows={2} maxRows={4} autoGrow value={d.excerpt} onChange={(e) => set({ excerpt: e.target.value })} />
      <Field label="Tags">
        <StringListInput value={d.tags} onChange={(v) => set({ tags: v })} />
      </Field>
      <Input label="Cover image URL" value={d.coverUrl ?? ''} onChange={(e) => set({ coverUrl: e.target.value || null })} placeholder="https://…" />
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: 'var(--text-low)' }}>Body (Markdown)</span>
          <button
            type="button"
            className="text-[11px] font-semibold cursor-pointer hover:opacity-80"
            style={{ color: 'var(--accent)' }}
            onClick={() => setShowPreview((s) => !s)}
          >
            {showPreview ? 'Edit' : 'Preview'}
          </button>
        </div>
        {showPreview ? (
          <div className="rounded-lg p-3 border min-h-24" style={{ background: 'var(--bg-elev)', borderColor: 'var(--border)' }}>
            {d.body.trim() ? <MarkdownBody source={d.body} /> : (
              <p className="text-xs" style={{ color: 'var(--text-low)' }}>Nothing to preview yet.</p>
            )}
          </div>
        ) : (
          <TextArea
            aria-label="Body (Markdown)"
            rows={8}
            maxRows={20}
            autoGrow
            textareaClassName="font-mono"
            placeholder={"# Title\n\nSome **bold** text, a list:\n\n- one\n- two"}
            value={d.body}
            onChange={(e) => set({ body: e.target.value })}
          />
        )}
      </div>
    </>
  );
}
