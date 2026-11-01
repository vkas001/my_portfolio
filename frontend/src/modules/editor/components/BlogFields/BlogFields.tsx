import { useState } from 'react';
import toast from 'react-hot-toast';
import { Upload, X } from 'lucide-react';
import type { Blog } from '@shared/types';
import Field from '@/modules/editor/components/Field/Field';
import Input from '@/components/ui/Input/Input';
import TextArea from '@/components/ui/TextArea/TextArea';
import StringListInput from '@/modules/editor/components/StringListInput/StringListInput';
import MarkdownBody from '@/components/ui/MarkdownBody/MarkdownBody';
import { adminService } from '@/lib/api/adminService';

const COVER_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const COVER_MAX_BYTES = 5 * 1024 * 1024;

export default function BlogFields({
  d,
  set,
}: {
  d: Blog;
  set: (patch: Partial<Blog>) => void;
}) {
  const [showPreview, setShowPreview] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [coverBroken, setCoverBroken] = useState(false);

  const onPickCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!COVER_TYPES.includes(file.type) || file.size > COVER_MAX_BYTES) {
      toast.error('Choose a JPEG, PNG or WebP image up to 5 MB.');
      return;
    }
    setUploading(true);
    try {
      const url = await adminService.uploadBlogCover(file);
      setCoverBroken(false);
      set({ coverUrl: url });
      toast.success('Cover uploaded — save the post to keep it.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not upload cover');
    } finally {
      setUploading(false);
    }
  };
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
      <Input label="Cover image URL" value={d.coverUrl ?? ''} onChange={(e) => { setCoverBroken(false); set({ coverUrl: e.target.value || null }); }} placeholder="https://…" />
      <div className="flex items-center gap-2 -mt-1">
        {d.coverUrl && !coverBroken ? (
          <img
            key={d.coverUrl}
            src={d.coverUrl}
            alt=""
            className="h-12 w-20 rounded-md object-cover border"
            style={{ borderColor: 'var(--border)' }}
            onError={() => setCoverBroken(true)}
          />
        ) : null}
        <label
          className="inline-flex items-center gap-1.5 text-xs font-semibold rounded-lg border px-2.5 py-1.5 cursor-pointer hover:opacity-80"
          style={{ background: 'var(--bg-elev)', borderColor: 'var(--border)', color: 'var(--text-hi)', opacity: uploading ? 0.6 : 1 }}
        >
          <Upload size={14} />
          {uploading ? 'Uploading…' : d.coverUrl ? 'Replace' : 'Upload image'}
          <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onPickCover} disabled={uploading} />
        </label>
        {d.coverUrl ? (
          <button
            type="button"
            className="inline-flex items-center gap-1 text-xs font-semibold cursor-pointer hover:opacity-80"
            style={{ color: 'var(--text-low)' }}
            onClick={() => { setCoverBroken(false); set({ coverUrl: null }); }}
          >
            <X size={14} /> Remove
          </button>
        ) : null}
      </div>
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
