import { useEffect, useRef, useState } from 'react';
import { Check, LoaderCircle, Plus, Trash2, Upload, X } from 'lucide-react';
import { useContent } from '@/context/ContentContext';
import type { Profile, ProfileInput } from '@shared/types';
import Field, { inputCls, labelCls } from '@/modules/editor/components/Field/Field';
import SelectInput from '@/modules/editor/components/SelectInput/SelectInput';
import { SOCIAL_ICONS, type SaveBridge } from '@/modules/editor/lib/scaffolding';

export default function ProfileTab({ commitRef, reportSave }: SaveBridge) {
  const { profile, saveProfile, uploadAvatar } = useContent();
  const [form, setForm] = useState<ProfileInput | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      await uploadAvatar(file);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not upload avatar.');
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    setForms(profile);
  }, [profile]);
  const setForms = (p: Profile | null) => {
    if (!p) return;
    setForm({
      name: p.name,
      title: p.title,
      shortBio: p.shortBio ?? '',
      bio: p.bio ?? '',
      avatarUrl: p.avatarUrl,
      resumeUrl: p.resumeUrl,
      email: p.email,
      location: p.location,
      yearsExperience: p.yearsExperience,
      socials: p.socials.map((s) => ({ id: s.id, label: s.label, url: s.url, icon: s.icon })),
    });
    setSaved(false);
  };

  const patch = (p: Partial<ProfileInput>) => setForm((f) => (f ? { ...f, ...p } : f));
  const patchSocial = (i: number, p: Partial<ProfileInput['socials'][number]>) =>
    patch({ socials: (form?.socials ?? []).map((s, idx) => (idx === i ? { ...s, ...p } : s)) });

  const commit = async () => {
    if (!form) return;
    if (!form.name.trim() || !form.title.trim() || !form.email.trim() || !form.location.trim()) {
      setError('Name, title, email and location are required');
      return;
    }
    setSaving(true);
    setError('');
    const ok = await saveProfile(form);
    setSaving(false);
    if (ok) {
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2000);
    } else setError('Could not save — check your input and try again.');
  };

  useEffect(() => {
    commitRef.current = () => { void commit(); };
    reportSave({ canSave: true, saving });
  });

  if (!profile || !form) {
    return <p className="text-xs" style={{ color: 'var(--text-low)' }}>Loading profile…</p>;
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-12">
          <span className={labelCls} style={{ color: 'var(--text-low)' }}>Profile picture</span>
          <div className="flex items-center gap-3">
            {form.avatarUrl ? (
              <img
                src={form.avatarUrl}
                alt="Profile"
                className="w-16 h-16 rounded-full object-cover shrink-0"
              />
            ) : (
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold shrink-0"
                style={{ background: 'var(--accent-soft)', color: 'var(--text-mid)' }}
              >
                {(form.name.trim() || '?').charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              <button
                type="button"
                className="btn-accent text-[11px] !py-1.5"
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
              >
                {uploading ? <LoaderCircle size={12} className="animate-spin" /> : <Upload size={12} />}
                {uploading ? 'Uploading…' : 'Upload'}
              </button>
              <button
                type="button"
                className="btn-ghost text-[11px] !py-1.5"
                disabled={uploading}
                onClick={() => patch({ avatarUrl: null })}
              >
                <Trash2 size={11} /> Remove
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleFile}
              />
            </div>
          </div>
        </div>
        <div className="col-span-12">
          <Field label="…or link an image URL (external host)">
            <input className={inputCls} value={form.avatarUrl ?? ''} onChange={(e) => patch({ avatarUrl: e.target.value || null })} />
          </Field>
        </div>
        <div className="col-span-12 @md:col-span-6">
          <Field label="Name"><input className={inputCls} value={form.name} onChange={(e) => patch({ name: e.target.value })} /></Field>
        </div>
        <div className="col-span-12 @md:col-span-6">
          <Field label="Title"><input className={inputCls} value={form.title} onChange={(e) => patch({ title: e.target.value })} /></Field>
        </div>
        <div className="col-span-12 @md:col-span-6">
          <Field label="Email"><input type="email" className={inputCls} value={form.email} onChange={(e) => patch({ email: e.target.value })} /></Field>
        </div>
        <div className="col-span-12 @md:col-span-6">
          <Field label="Location"><input className={inputCls} value={form.location} onChange={(e) => patch({ location: e.target.value })} /></Field>
        </div>
        <div className="col-span-12 @md:col-span-6">
          <Field label="Years experience">
            <input type="number" min={0} max={60} className={inputCls} value={form.yearsExperience} onChange={(e) => patch({ yearsExperience: Number(e.target.value) })} />
          </Field>
        </div>
        <div className="col-span-12">
          <Field label="Résumé URL"><input className={inputCls} value={form.resumeUrl ?? ''} onChange={(e) => patch({ resumeUrl: e.target.value || null })} /></Field>
        </div>
        <div className="col-span-12">
          <Field label="Short bio">
            <textarea className={`${inputCls} resize-y`} rows={2} value={form.shortBio} onChange={(e) => patch({ shortBio: e.target.value })} />
          </Field>
        </div>
        <div className="col-span-12">
          <Field label="Bio">
            <textarea className={`${inputCls} resize-y`} rows={4} value={form.bio} onChange={(e) => patch({ bio: e.target.value })} />
          </Field>
        </div>
      </div>

      <div className="space-y-1.5">
        <span className={labelCls} style={{ color: 'var(--text-low)' }}>Social links</span>
        {form.socials.map((s, i) => (
          <div key={s.id ?? i} className="grid grid-cols-12 gap-2 items-center">
            <div className="col-span-3">
              <input className={inputCls} value={s.label} placeholder="Label" onChange={(e) => patchSocial(i, { label: e.target.value })} />
            </div>
            <div className="col-span-5">
              <input className={inputCls} value={s.url} placeholder="https://…" onChange={(e) => patchSocial(i, { url: e.target.value })} />
            </div>
            <div className="col-span-3">
              <SelectInput value={s.icon} options={SOCIAL_ICONS} onChange={(v) => patchSocial(i, { icon: v })} />
            </div>
            <div className="col-span-1 flex justify-end">
              <button className="icon-btn w-6 h-6" aria-label="Remove link" style={{ color: '#f87171' }} onClick={() => patch({ socials: form.socials.filter((_, idx) => idx !== i) })}>
                <X size={11} />
              </button>
            </div>
          </div>
        ))}
        <button
          className="text-[11px] font-semibold flex items-center gap-1 cursor-pointer hover:opacity-80"
          style={{ color: 'var(--accent)' }}
          onClick={() => patch({ socials: [...form.socials, { label: '', url: '', icon: 'github' }] })}
        >
          <Plus size={11} /> Add link
        </button>
      </div>

      {error ? <p className="text-xs" style={{ color: '#f87171' }}>{error}</p> : null}
      {saved ? (
        <p className="text-xs font-semibold flex items-center gap-1" style={{ color: '#34d399' }}>
          <Check size={12} /> Saved — every open window updated live
        </p>
      ) : null}
    </div>
  );
}