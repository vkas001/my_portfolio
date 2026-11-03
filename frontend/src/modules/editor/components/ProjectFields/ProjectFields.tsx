import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { ImagePlus, Upload, X } from 'lucide-react';
import type { Project } from '@shared/types';
import Field from '@/modules/editor/components/Field/Field';
import Input from '@/components/ui/Input/Input';
import NumberInput from '@/components/ui/NumberInput/NumberInput';
import TextArea from '@/components/ui/TextArea/TextArea';
import StringListInput from '@/modules/editor/components/StringListInput/StringListInput';
import CategoryField from '@/modules/editor/components/CategoryField/CategoryField';
import { useContent } from '@/context/ContentContext';
import { adminService } from '@/lib/api/adminService';
import { assetUrl } from '@/lib/api/assets';

const SHOT_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const SHOT_MAX_BYTES = 5 * 1024 * 1024;
const MAX_SHOTS = 6;

export default function ProjectFields({
  d,
  set,
}: {
  d: Project;
  set: (patch: Partial<Project>) => void;
}) {
  const { projects } = useContent();
  const [uploading, setUploading] = useState(false);
  const categoryOptions = useMemo(() => {
    const seen: string[] = [];
    for (const p of projects) {
      const c = (p.category ?? '').trim();
      if (c && !seen.some((x) => x.toLowerCase() === c.toLowerCase())) seen.push(c);
    }
    return seen;
  }, [projects]);

  const onPickScreenshots = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (!files.length) return;

    const existing = d.screenshots;
    const room = MAX_SHOTS - existing.length;
    if (room <= 0) {
      toast.error(`Up to ${MAX_SHOTS} screenshots per project.`);
      return;
    }

    const valid = files.filter((f) => SHOT_TYPES.includes(f.type) && f.size <= SHOT_MAX_BYTES);
    const accepted = valid.slice(0, room);
    if (accepted.length < files.length) {
      toast.error(`JPEG, PNG or WebP up to 5 MB — ${MAX_SHOTS} screenshots max.`);
    }
    if (!accepted.length) return;

    setUploading(true);
    const urls: string[] = [];
    try {
      for (const file of accepted) {
        urls.push(await adminService.uploadProjectScreenshot(file));
      }
      set({ screenshots: [...existing, ...urls] });
      toast.success('Screenshot added — save the project to keep it.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not upload screenshot');
      if (urls.length) set({ screenshots: [...existing, ...urls] });
    } finally {
      setUploading(false);
    }
  };

  const removeScreenshot = (index: number) => {
    set({ screenshots: d.screenshots.filter((_, i) => i !== index) });
  };

  return (
    <>
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-7">
          <Input label="Title" value={d.title} onChange={(e) => set({ title: e.target.value })} />
        </div>
        <div className="col-span-5">
          <CategoryField
            label="Category"
            value={d.category}
            onChange={(v) => set({ category: v })}
            options={categoryOptions}
            labelOf={(c) => c.toUpperCase()}
            hint="Type a new one, or pick an existing one from the list."
          />
        </div>
      </div>
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-4">
          <NumberInput key={`${d.id}-year`} label="Year" min={1990} max={2100} value={d.year} placeholder="2025" onCommit={(v) => set({ year: v })} />
        </div>
        <div className="col-span-8 flex flex-wrap items-center gap-x-4 gap-y-1 pb-1 @sm:justify-end">
          <label className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: 'var(--text-mid)' }}>
            <input type="checkbox" checked={d.featured} onChange={(e) => set({ featured: e.target.checked })} /> Featured
          </label>
          <label className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: 'var(--text-mid)' }}>
            <input type="checkbox" checked={d.isClient} onChange={(e) => set({ isClient: e.target.checked })} /> Client project
          </label>
        </div>
      </div>
      <TextArea label="Short description" rows={2} maxRows={6} autoGrow value={d.description} onChange={(e) => set({ description: e.target.value })} />
      <TextArea label="Long description" rows={3} maxRows={14} autoGrow value={d.longDescription ?? ''} onChange={(e) => set({ longDescription: e.target.value })} />
      <Field label="Tech stack">
        <StringListInput value={d.techStack} onChange={(v) => set({ techStack: v })} />
      </Field>
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-6">
          <Input label="Live URL" value={d.liveUrl ?? ''} onChange={(e) => set({ liveUrl: e.target.value || null })} />
        </div>
        <div className="col-span-6">
          <Input label="Source URL" value={d.githubUrl ?? ''} onChange={(e) => set({ githubUrl: e.target.value || null })} />
        </div>
      </div>
      <Field
        label="Proof screenshots"
        hint={`Shown in the expanded project card. Added screenshots save with the project (${d.screenshots.length}/${MAX_SHOTS}).`}
      >
        <div className="grid grid-cols-3 gap-2">
          {d.screenshots.map((url, index) => (
            <div
              key={`${url}-${index}`}
              className="relative rounded-lg overflow-hidden border group"
              style={{ borderColor: 'var(--border)' }}
            >
              <img
                src={assetUrl(url)}
                alt={`Screenshot ${index + 1}`}
                className="w-full h-16 object-cover"
                loading="lazy"
              />
              <button
                type="button"
                aria-label={`Remove screenshot ${index + 1}`}
                className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center cursor-pointer opacity-90 hover:opacity-100"
                style={{ background: 'rgba(0,0,0,.65)', color: '#fff' }}
                onClick={() => removeScreenshot(index)}
              >
                <X size={11} />
              </button>
            </div>
          ))}
          {d.screenshots.length < MAX_SHOTS && (
            <label
              className="h-16 rounded-lg border border-dashed flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold cursor-pointer hover:opacity-80"
              style={{ borderColor: 'var(--border)', color: 'var(--text-mid)', opacity: uploading ? 0.6 : 1 }}
            >
              {uploading ? <Upload size={14} /> : <ImagePlus size={14} />}
              {uploading ? 'Uploading…' : 'Add'}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={onPickScreenshots}
                disabled={uploading}
              />
            </label>
          )}
        </div>
      </Field>
    </>
  );
}
