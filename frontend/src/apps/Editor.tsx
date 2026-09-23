import { useEffect, useState, type ReactNode } from 'react';
import { useContent } from '@/context/ContentContext';
import type { EditorSection, WindowData } from '@/types';
import type {
  Experience,
  Profile,
  ProfileInput,
  Project,
  Skill,
  SkillCategory,
  SocialLink,
} from '@shared/types';
import { ArrowDown, ArrowUp, Check, LoaderCircle, Pencil, Plus, Trash2, X } from 'lucide-react';

const newId = () => crypto.randomUUID().slice(0, 8);

const SECTION_TABS: { id: EditorSection; label: string }[] = [
  { id: 'profile', label: 'Profile' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'experience', label: 'Experience' },
];

const SKILL_CATEGORIES: SkillCategory[] = [
  'languages', 'frontend', 'backend', 'database', 'devops', 'design', 'tools',
];

const CATEGORY_LABELS: Record<string, string> = {
  languages: 'Languages', frontend: 'Frontend', backend: 'Backend', database: 'Database',
  devops: 'DevOps', design: 'Design', tools: 'Tools',
};

const SOCIAL_ICONS: SocialLink['icon'][] = ['github', 'linkedin', 'twitter', 'website', 'email'];

// ─── Form primitives ──────────────────────────────────────────────────────────

const inputCls = 'w-full text-sm';
const labelCls = 'text-[10px] font-bold uppercase tracking-wider mb-1 block';
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className={labelCls} style={{ color: 'var(--text-low)' }}>{label}</span>
      {children}
    </label>
  );
}

function StringListInput({
  value,
  onChange,
  placeholder = 'Comma-separated values',
  rows = 1,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  rows?: number;
}) {
  const text = value.join(rows > 1 ? '\n' : ', ');
  return (
    <textarea
      className={`${inputCls} resize-y`}
      rows={rows}
      placeholder={placeholder}
      value={text}
      onChange={(e) =>
        onChange(
          e.target.value
            .split(rows > 1 ? /\n+/ : /,\s*/)
            .map((s) => s.trim())
            .filter(Boolean),
        )
      }
    />
  );
}

function SelectInput<T extends string>({
  value,
  options,
  onChange,
  labels,
}: {
  value: T;
  options: T[];
  onChange: (v: T) => void;
  labels?: Record<T, string>;
}) {
  return (
    <select className={inputCls} value={value} onChange={(e) => onChange(e.target.value as T)}>
      {options.map((o) => (
        <option key={o} value={o}>{labels?.[o] ?? o}</option>
      ))}
    </select>
  );
}

// ─── Shared row + form scaffolding per item section ──────────────────────────

interface BaseItem { id: string }

interface SectionScaffold<T extends BaseItem> {
  section: EditorSection;
  items: T[];
  titleOf: (t: T) => string;
  subOf: (t: T) => string;
  emptyFor: (id: string) => T;
  save: (value: T, isNew: boolean) => Promise<boolean>;
  remove: (id: string) => Promise<boolean>;
  validate: (d: T) => string | null;
  renderFields: (draft: T, set: (patch: Partial<T>) => void) => ReactNode;
  renderRowMeta: (t: T) => ReactNode;
  move?: (id: string, dir: -1 | 1) => void;
}

function SectionEditor<T extends BaseItem>({
  scaffold,
}: {
  scaffold: SectionScaffold<T>;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<T | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const startNew = () => {
    const id = newId();
    setDraft(scaffold.emptyFor(id));
    setEditingId(id);
    setCreating(true);
    setError('');
  };
  const startEdit = (item: T) => {
    setDraft({ ...item });
    setEditingId(item.id);
    setCreating(false);
    setError('');
  };
  const cancel = () => {
    setEditingId(null);
    setCreating(false);
    setDraft(null);
    setError('');
  };

  const patch = (p: Partial<T>) => setDraft((d) => (d ? { ...d, ...p } : d));

  const commit = async () => {
    if (!draft) return;
    const problem = scaffold.validate(draft);
    if (problem) {
      setError(problem);
      return;
    }
    setSaving(true);
    setError('');
    const ok = await scaffold.save(draft, creating);
    setSaving(false);
    if (ok) cancel();
    else setError('Could not save — check your input and try again.');
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-low)' }}>
          {scaffold.items.length} {scaffold.section === 'experience' ? 'entries' : 'items'}
        </span>
        {!editingId && (
          <button className="btn-accent text-[11px] !py-1.5" onClick={startNew}>
            <Plus size={12} /> Add {scaffold.section === 'experience' ? 'entry' : 'item'}
          </button>
        )}
      </div>

      {editingId && draft ? (
        <div className="rounded-xl p-3 border space-y-3" style={{ background: 'var(--bg-elev)', borderColor: 'var(--border)' }}>
          {scaffold.renderFields(draft, patch)}
          {error && <p className="text-xs" style={{ color: '#f87171' }}>{error}</p>}
          <div className="flex items-center justify-end gap-2 pt-1">
            <button className="btn-ghost text-xs" onClick={cancel} disabled={saving}>Cancel</button>
            <button className="btn-accent text-xs" onClick={commit} disabled={saving}>
              {saving ? <LoaderCircle size={12} className="animate-spin" /> : <Check size={12} />}
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-1.5">
          {scaffold.items.map((item, i) => (
            <div
              key={item.id}
              className="flex items-center gap-2 rounded-lg px-2.5 py-2"
              style={{ background: 'var(--accent-soft)' }}
            >
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold truncate">{scaffold.titleOf(item)}</div>
                <div className="text-[10px] truncate" style={{ color: 'var(--text-low)' }}>{scaffold.subOf(item)}</div>
              </div>
              {scaffold.move && (
                <div className="flex flex-col gap-0.5 shrink-0">
                  <button
                    className="icon-btn w-4 h-4 !text-[9px]"
                    aria-label="Move up"
                    disabled={i === 0}
                    onClick={() => scaffold.move?.(item.id, -1)}
                  >
                    <ArrowUp size={10} />
                  </button>
                  <button
                    className="icon-btn w-4 h-4 !text-[9px]"
                    aria-label="Move down"
                    disabled={i === scaffold.items.length - 1}
                    onClick={() => scaffold.move?.(item.id, 1)}
                  >
                    <ArrowDown size={10} />
                  </button>
                </div>
              )}
              <div className="hidden @md:block shrink-0">{scaffold.renderRowMeta(item)}</div>
              <button className="icon-btn w-6 h-6 shrink-0" aria-label="Edit" onClick={() => startEdit(item)}>
                <Pencil size={11} />
              </button>
              <button
                className="icon-btn w-6 h-6 shrink-0"
                aria-label="Delete"
                style={{ color: '#f87171' }}
                onClick={() => scaffold.remove(item.id)}
              >
                <Trash2 size={11} />
              </button>
            </div>
          ))}
          {!scaffold.items.length && (
            <p className="text-xs" style={{ color: 'var(--text-low)' }}>Nothing here yet — add one above.</p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Section scaffolds ────────────────────────────────────────────────────────

function SkillsEditor() {
  const { skills, saveSkill, deleteSkill } = useContent();
  return (
    <SectionEditor<Skill>
      scaffold={{
        section: 'skills',
        items: skills,
        titleOf: (s) => s.name,
        subOf: (s) => `${CATEGORY_LABELS[s.category] ?? s.category} · ${s.proficiency}%`,
        emptyFor: (id) => ({ id, name: '', category: 'tools', proficiency: 80, yearsUsed: 0, icon: null }),
        save: saveSkill,
        remove: deleteSkill,
        validate: (d) => (d.name.trim() ? null : 'Name is required'),
        renderFields: (d, set) => (
          <>
            <Field label="Name">
              <input className={inputCls} value={d.name} placeholder="React, Laravel, …" onChange={(e) => set({ name: e.target.value })} />
            </Field>
            <Field label="Category">
              <SelectInput value={d.category} options={SKILL_CATEGORIES} labels={CATEGORY_LABELS} onChange={(v) => set({ category: v })} />
            </Field>
            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-6">
                <Field label="Proficiency (0–100)">
                  <input type="number" min={0} max={100} className={inputCls} value={d.proficiency} onChange={(e) => set({ proficiency: Number(e.target.value) })} />
                </Field>
              </div>
              <div className="col-span-6">
                <Field label="Years used">
                  <input type="number" min={0} max={100} className={inputCls} value={d.yearsUsed} onChange={(e) => set({ yearsUsed: Number(e.target.value) })} />
                </Field>
              </div>
            </div>
          </>
        ),
        renderRowMeta: (s) => <span className="text-[10px] tabular-nums" style={{ color: 'var(--text-low)' }}>{s.yearsUsed}y</span>,
      }}
    />
  );
}

const emptyProject = (id: string): Project => ({
  id, title: '', description: '', longDescription: '', techStack: [], category: '',
  featured: false, liveUrl: null, githubUrl: null, imageUrl: null, year: new Date().getFullYear(), order: Number.MAX_SAFE_INTEGER,
});

function ProjectsEditor() {
  const { projects, saveProject, deleteProject, moveItem } = useContent();
  return (
    <SectionEditor<Project>
      scaffold={{
        section: 'projects',
        items: projects,
        titleOf: (p) => p.title,
        subOf: (p) => `${p.year} · ${p.techStack.slice(0, 3).join(', ')}`,
        emptyFor: emptyProject,
        save: saveProject,
        remove: deleteProject,
        move: (id, dir) => { void moveItem('projects', id, dir); },
        validate: (d) => (d.title.trim() && d.description.trim() && d.category.trim() ? null : 'Title, description and category are required'),
        renderFields: (d, set) => (
          <>
            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-7">
                <Field label="Title">
                  <input className={inputCls} value={d.title} onChange={(e) => set({ title: e.target.value })} />
                </Field>
              </div>
              <div className="col-span-5">
                <Field label="Category">
                  <input className={inputCls} value={d.category} onChange={(e) => set({ category: e.target.value })} />
                </Field>
              </div>
            </div>
            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-6">
                <Field label="Year">
                  <input type="number" min={1990} max={2100} className={inputCls} value={d.year} onChange={(e) => set({ year: Number(e.target.value) })} />
                </Field>
              </div>
              <div className="col-span-6 flex items-end pb-1">
                <label className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: 'var(--text-mid)' }}>
                  <input type="checkbox" checked={d.featured} onChange={(e) => set({ featured: e.target.checked })} /> Featured
                </label>
              </div>
            </div>
            <Field label="Short description">
              <textarea className={`${inputCls} resize-y`} rows={2} value={d.description} onChange={(e) => set({ description: e.target.value })} />
            </Field>
            <Field label="Long description">
              <textarea className={`${inputCls} resize-y`} rows={3} value={d.longDescription ?? ''} onChange={(e) => set({ longDescription: e.target.value })} />
            </Field>
            <Field label="Tech stack">
              <StringListInput value={d.techStack} onChange={(v) => set({ techStack: v })} />
            </Field>
            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-6">
                <Field label="Live URL"><input className={inputCls} value={d.liveUrl ?? ''} onChange={(e) => set({ liveUrl: e.target.value || null })} /></Field>
              </div>
              <div className="col-span-6">
                <Field label="Source URL"><input className={inputCls} value={d.githubUrl ?? ''} onChange={(e) => set({ githubUrl: e.target.value || null })} /></Field>
              </div>
            </div>
          </>
        ),
        renderRowMeta: (p) => <span className="text-[10px] tabular-nums" style={{ color: 'var(--text-low)' }}>{p.year}</span>,
      }}
    />
  );
}

const emptyExperience = (id: string): Experience => ({
  id, company: '', role: '', startDate: '', endDate: null, location: '', employmentType: 'Full-time',
  highlights: [], techStack: [], order: Number.MAX_SAFE_INTEGER,
});

function ExperienceEditor() {
  const { experience, saveExperience, deleteExperience, moveItem } = useContent();
  const [present, setPresent] = useState(false);
  return (
    <SectionEditor<Experience>
      scaffold={{
        section: 'experience',
        items: experience,
        titleOf: (x) => x.role,
        subOf: (x) => `${x.company} · ${x.location}`,
        emptyFor: emptyExperience,
        save: saveExperience,
        remove: deleteExperience,
        move: (id, dir) => { void moveItem('experience', id, dir); },
        validate: (d) =>
          d.role.trim() && d.company.trim() && d.location.trim() && d.employmentType.trim() && d.startDate
            ? null
            : 'Role, company, location, employment type and start date are required',
        renderFields: (d, set) => (
          <ExperienceFields d={d} set={set} present={present} setPresent={setPresent} />
        ),
        renderRowMeta: (x) => (
          <span className="text-[10px] tabular-nums" style={{ color: 'var(--text-low)' }}>
            {x.startDate.slice(0, 4)}{x.endDate ? `–${x.endDate.slice(0, 4)}` : '–now'}
          </span>
        ),
      }}
    />
  );
}

function ExperienceFields({
  d,
  set,
  present,
  setPresent,
}: {
  d: Experience;
  set: (patch: Partial<Experience>) => void;
  present: boolean;
  setPresent: (v: boolean) => void;
}) {
  const togglePresent = (v: boolean) => {
    setPresent(v);
    if (v) set({ endDate: null });
    else if (!d.endDate) set({ endDate: '' });
  };
  useEffect(() => {
    setPresent(!d.endDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [d.id]);
  return (
    <>
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-6">
          <Field label="Role"><input className={inputCls} value={d.role} onChange={(e) => set({ role: e.target.value })} /></Field>
        </div>
        <div className="col-span-6">
          <Field label="Company"><input className={inputCls} value={d.company} onChange={(e) => set({ company: e.target.value })} /></Field>
        </div>
      </div>
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-6">
          <Field label="Location"><input className={inputCls} value={d.location} onChange={(e) => set({ location: e.target.value })} /></Field>
        </div>
        <div className="col-span-6">
          <Field label="Employment type">
            <SelectInput
              value={d.employmentType}
              options={['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship']}
              onChange={(v) => set({ employmentType: v })}
            />
          </Field>
        </div>
      </div>
      <div className="grid grid-cols-12 gap-3 items-end">
        <div className="col-span-5">
          <Field label="Start date"><input type="date" className={inputCls} value={d.startDate} onChange={(e) => set({ startDate: e.target.value })} /></Field>
        </div>
        <div className="col-span-5">
          <Field label="End date">
            <input type="date" className={inputCls} disabled={present} value={d.endDate ?? ''} onChange={(e) => set({ endDate: e.target.value || null })} />
          </Field>
        </div>
        <div className="col-span-2 flex items-center justify-end pb-2">
          <label className="flex items-center gap-1.5 text-xs cursor-pointer" style={{ color: 'var(--text-mid)' }}>
            <input type="checkbox" checked={present} onChange={(e) => togglePresent(e.target.checked)} /> Current
          </label>
        </div>
      </div>
      <Field label="Highlights (one per line)">
        <StringListInput rows={3} value={d.highlights} onChange={(v) => set({ highlights: v })} placeholder="Achievement or responsibility" />
      </Field>
      <Field label="Tech stack">
        <StringListInput value={d.techStack} onChange={(v) => set({ techStack: v })} />
      </Field>
    </>
  );
}

// ─── Profile editor ───────────────────────────────────────────────────────────

function ProfileEditor() {
  const { profile, saveProfile } = useContent();
  const [form, setForm] = useState<ProfileInput | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

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

  if (!profile || !form) {
    return <p className="text-xs" style={{ color: 'var(--text-low)' }}>Loading profile…</p>;
  }

  const patch = (p: Partial<ProfileInput>) => setForm({ ...form, ...p });
  const patchSocial = (i: number, p: Partial<ProfileInput['socials'][number]>) =>
    patch({ socials: form.socials.map((s, idx) => (idx === i ? { ...s, ...p } : s)) });

  const commit = async () => {
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

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-12 gap-3">
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
        <div className="col-span-12 @md:col-span-6">
          <Field label="Avatar URL"><input className={inputCls} value={form.avatarUrl ?? ''} onChange={(e) => patch({ avatarUrl: e.target.value || null })} /></Field>
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

      {error && <p className="text-xs" style={{ color: '#f87171' }}>{error}</p>}
      {saved && (
        <p className="text-xs font-semibold flex items-center gap-1" style={{ color: '#34d399' }}>
          <Check size={12} /> Saved — every open window updated live
        </p>
      )}
      <div className="flex justify-end">
        <button className="btn-accent text-xs" onClick={commit} disabled={saving}>
          {saving ? <LoaderCircle size={12} className="animate-spin" /> : <Check size={12} />}
          {saving ? 'Saving…' : 'Save profile'}
        </button>
      </div>
    </div>
  );
}

// ─── Entry ────────────────────────────────────────────────────────────────────

export default function Editor({ data }: { data?: WindowData }) {
  const [section, setSection] = useState<EditorSection>(data?.section ?? 'profile');

  return (
    <div className="flex flex-col h-full gap-3">
      <div className="flex gap-1.5">
        {SECTION_TABS.map((t) => (
          <button
            key={t.id}
            className={`chip cursor-pointer !py-1.5 !px-2.5 text-[11px] ${section === t.id ? '!bg-[var(--accent)] !text-[var(--accent-text-on)]' : ''}`}
            onClick={() => setSection(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto pr-1 -mr-1">
        {section === 'profile' ? <ProfileEditor /> : null}
        {section === 'skills' ? <SkillsEditor /> : null}
        {section === 'projects' ? <ProjectsEditor /> : null}
        {section === 'experience' ? <ExperienceEditor /> : null}
      </div>
    </div>
  );
}