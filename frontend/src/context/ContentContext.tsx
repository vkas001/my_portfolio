import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type {
  Experience,
  ExperienceInput,
  Profile,
  ProfileInput,
  Project,
  ProjectInput,
  Skill,
  SkillInput,
} from '@shared/types';
import { fetchExperience, fetchProfile, fetchProjects, fetchSkills } from '@/lib/api';
import { adminService } from '@/lib/api/adminService';
import { useShellUI } from '@/context/ShellUIContext';
import type { EditorSection } from '@/types';

export type { EditorSection };

interface AnyItem {
  id: string;
  order?: number;
}

export interface ContentContextValue {
  loading: boolean;
  profile: Profile | null;
  skills: Skill[];
  projects: Project[];
  experience: Experience[];
  refresh: () => Promise<void>;

  saveProfile: (input: ProfileInput) => Promise<boolean>;
  /** Upload a new profile picture; persists via POST /admin/avatar and
   *  updates the shared profile so every window reflects it immediately. */
  uploadAvatar: (file: File) => Promise<boolean>;
  saveSkill: (value: Skill, isNew: boolean) => Promise<boolean>;
  deleteSkill: (id: string) => Promise<boolean>;
  saveProject: (value: Project, isNew: boolean) => Promise<boolean>;
  deleteProject: (id: string) => Promise<boolean>;
  saveExperience: (value: Experience, isNew: boolean) => Promise<boolean>;
  deleteExperience: (id: string) => Promise<boolean>;
  /** Swap item order in the local list and persist the new orders
   *  (projects/experience — skills have no order field). */
  moveItem: (section: 'projects' | 'experience', id: string, dir: -1 | 1) => Promise<void>;
}

const ContentContext = createContext<ContentContextValue | null>(null);

export function useContent(): ContentContextValue {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error('useContent must be used within ContentProvider');
  return ctx;
}

// ─── Optimistic list helpers ──────────────────────────────────────────────────

/** Apply an optimistic list change; on API failure roll back to the snapshot
 *  taken before the change and surface a toast. Returns true on success. */
async function persistList<T extends AnyItem>(
  snapshot: T[],
  optimistic: T[],
  applyList: (l: T[] | ((cur: T[]) => T[])) => void,
  note: (msg: string) => void,
  request: () => Promise<T>,
): Promise<boolean> {
  applyList(optimistic);
  try {
    const saved = await request();
    applyList((cur) => cur.map((it) => (it.id === saved.id ? { ...it, ...saved } : it)));
    return true;
  } catch (err) {
    applyList(snapshot);
    note(err instanceof Error ? err.message : 'Could not save');
    return false;
  }
}

async function deleteFromList<T extends AnyItem>(
  snapshot: T[],
  optimistic: T[],
  applyList: (l: T[] | ((cur: T[]) => T[])) => void,
  note: (msg: string) => void,
  request: () => Promise<unknown>,
): Promise<boolean> {
  applyList(optimistic);
  try {
    await request();
    return true;
  } catch (err) {
    applyList(snapshot);
    note(err instanceof Error ? err.message : 'Could not delete');
    return false;
  }
}

const sortByOrder = <T extends AnyItem>(l: T[]): T[] =>
  [...l].sort((a, b) => (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER));

function useItems<T extends AnyItem>(loader: () => Promise<T[]>): {
  items: T[];
  loading: boolean;
  set: (l: T[] | ((cur: T[]) => T[])) => void;
  reload: () => Promise<void>;
} {
  const [items, set] = useState<T[] | null>(null);
  // Expose a setter that never sees the null loading marker.
  const setWrapped = (l: T[] | ((cur: T[]) => T[])) =>
    set((prev) => (typeof l === 'function' ? l(prev ?? []) : l));
  const reload = useCallback(async () => {
    try {
      set(sortByOrder(await loader()));
    } catch {
      set([]);
    }
  }, [loader]);
  useEffect(() => {
    void reload();
  }, [reload]);
  return { items: items ?? [], loading: items === null, set: setWrapped, reload };
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ContentProvider({ children }: { children: ReactNode }) {
  const { pushNotification } = useShellUI();
  const note = useCallback(
    (msg: string) => pushNotification({ title: 'Editor sync failed', body: msg }),
    [pushNotification],
  );

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const skills = useItems(fetchSkills);
  const projects = useItems(fetchProjects);
  const experience = useItems(fetchExperience);

  const refresh = useCallback(async () => {
    try {
      setProfile(await fetchProfile());
    } catch {
      setProfile(null);
    }
    await Promise.all([skills.reload(), projects.reload(), experience.reload()]);
    setLoading(false);
  }, [skills.reload, projects.reload, experience.reload]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  // ─── Profile ────────────────────────────────────────────────────────────────
  const saveProfile = useCallback(
    async (input: ProfileInput) => {
      const prev = profile;
      if (!prev) {
        try {
          setProfile(await adminService.updateProfile(input));
          return true;
        } catch (err) {
          note(err instanceof Error ? err.message : 'Could not save profile');
          return false;
        }
      }
      const optimistic: Profile = {
        id: prev.id,
        name: input.name,
        title: input.title,
        shortBio: input.shortBio,
        bio: input.bio,
        avatarUrl: input.avatarUrl ?? null,
        resumeUrl: input.resumeUrl ?? null,
        email: input.email,
        location: input.location,
        yearsExperience: input.yearsExperience,
        socials: input.socials.map((s, i) => ({
          id: s.id ?? `s${i}_${Date.now().toString(36)}`,
          label: s.label,
          url: s.url,
          icon: s.icon,
        })),
      };
      setProfile(optimistic);
      try {
        const saved = await adminService.updateProfile(input);
        setProfile(saved);
        return true;
      } catch (err) {
        setProfile(prev);
        note(err instanceof Error ? err.message : 'Could not save profile');
        return false;
      }
    },
    [profile, note],
  );

  // ─── Avatar upload ────────────────────────────────────────────────────────
  // Rejects on failure so the caller can surface the server's message.
  const uploadAvatar = useCallback(
    async (file: File): Promise<boolean> => {
      setProfile(await adminService.uploadAvatar(file));
      return true;
    },
    [],
  );

  // ─── Generic save/delete for item sections ─────────────────────────────────
  const saveItem = useCallback(
    async <T extends AnyItem>(
      items: T[],
      apply: (l: T[] | ((cur: T[]) => T[])) => void,
      value: T,
      isNew: boolean,
      request: () => Promise<T>,
      idOf: (v: T) => string,
    ) => {
      const sorted = sortByOrder(items);
      const optimistic = isNew
        ? sortByOrder([...sorted, value])
        : sorted.map((it) => (idOf(it) === idOf(value) ? { ...it, ...value } : it));
      return persistList(sorted, optimistic, apply, note, request);
    },
    [note],
  );

  const deleteItem = useCallback(
    async <T extends AnyItem>(
      items: T[],
      apply: (l: T[] | ((cur: T[]) => T[])) => void,
      id: string,
      request: () => Promise<unknown>,
    ) => {
      const sorted = sortByOrder(items);
      const optimistic = sorted.filter((it) => it.id !== id);
      return deleteFromList(sorted, optimistic, apply, note, request);
    },
    [note],
  );

  const saveSkill = useCallback(
    (value: Skill, isNew: boolean) => {
      const input: SkillInput = {
        ...(isNew ? { id: value.id } : {}),
        name: value.name,
        category: value.category,
        proficiency: value.proficiency,
        yearsUsed: value.yearsUsed,
        icon: value.icon,
      };
      return saveItem(
        skills.items,
        skills.set,
        value,
        isNew,
        () => (isNew ? adminService.storeSkill(input) : adminService.updateSkill(value.id, input)),
        (s) => s.id,
      );
    },
    [skills.items, skills.set, saveItem],
  );

  const deleteSkill = useCallback(
    (id: string) =>
      deleteItem(skills.items, skills.set, id, () => adminService.deleteSkill(id)),
    [skills.items, skills.set, deleteItem],
  );

  const saveProject = useCallback(
    (value: Project, isNew: boolean) => {
      const input: ProjectInput = {
        ...(isNew ? { id: value.id } : {}),
        title: value.title,
        description: value.description,
        longDescription: value.longDescription,
        techStack: value.techStack,
        category: value.category,
        featured: value.featured,
        liveUrl: value.liveUrl,
        githubUrl: value.githubUrl,
        imageUrl: value.imageUrl,
        year: value.year,
        order: value.order,
      };
      return saveItem(
        projects.items,
        projects.set,
        value,
        isNew,
        () => (isNew ? adminService.storeProject(input) : adminService.updateProject(value.id, input)),
        (p) => p.id,
      );
    },
    [projects.items, projects.set, saveItem],
  );

  const deleteProject = useCallback(
    (id: string) =>
      deleteItem(projects.items, projects.set, id, () => adminService.deleteProject(id)),
    [projects.items, projects.set, deleteItem],
  );

  const saveExperience = useCallback(
    (value: Experience, isNew: boolean) => {
      const input: ExperienceInput = {
        ...(isNew ? { id: value.id } : {}),
        company: value.company,
        role: value.role,
        startDate: value.startDate,
        endDate: value.endDate,
        location: value.location,
        employmentType: value.employmentType,
        highlights: value.highlights,
        techStack: value.techStack,
        order: value.order,
      };
      return saveItem(
        experience.items,
        experience.set,
        value,
        isNew,
        () =>
          isNew
            ? adminService.storeExperience(input)
            : adminService.updateExperience(value.id, input),
        (x) => x.id,
      );
    },
    [experience.items, experience.set, saveItem],
  );

  const deleteExperience = useCallback(
    (id: string) =>
      deleteItem(experience.items, experience.set, id, () => adminService.deleteExperience(id)),
    [experience.items, experience.set, deleteItem],
  );

  // Reorder an order-backed section (projects/experience): swap orders
  // locally and persist both updated rows. Skills have no order field, so
  // the editor simply doesn't offer move buttons there.
  const commitReorder = useCallback(
    async <T extends AnyItem & { order: number }>(
      items: T[],
      apply: (l: T[]) => void,
      id: string,
      dir: -1 | 1,
      updater: (rowId: string, row: T) => Promise<unknown>,
    ) => {
      const sorted = sortByOrder(items);
      const idx = sorted.findIndex((it) => it.id === id);
      const j = idx + dir;
      if (idx < 0 || j < 0 || j >= sorted.length) return;
      const next = [...sorted];
      const a = next[idx];
      const b = next[j];
      next[idx] = { ...a, order: b.order };
      next[j] = { ...b, order: a.order };
      apply(next);
      void updater(a.id, { ...a, order: b.order });
      void updater(b.id, { ...b, order: a.order });
    },
    [],
  );

  const moveItem = useCallback(
    (section: Exclude<EditorSection, 'profile' | 'skills'>, id: string, dir: -1 | 1) => {
      if (section === 'projects') {
        return commitReorder(
          projects.items,
          projects.set,
          id,
          dir,
          (rowId, row) => adminService.updateProject(rowId, row),
        );
      }
      return commitReorder(
        experience.items,
        experience.set,
        id,
        dir,
        (rowId, row) => adminService.updateExperience(rowId, row),
      );
    },
    [projects.items, projects.set, experience.items, experience.set, commitReorder],
  );

  const value = useMemo<ContentContextValue>(
    () => ({
      loading,
      profile,
      skills: skills.items,
      projects: projects.items,
      experience: experience.items,
      refresh,
      saveProfile,
      uploadAvatar,
      saveSkill,
      deleteSkill,
      saveProject,
      deleteProject,
      saveExperience,
      deleteExperience,
      moveItem,
    }),
    [
      loading,
      profile,
      skills.items,
      projects.items,
      experience.items,
      refresh,
      saveProfile,
      uploadAvatar,
      saveSkill,
      deleteSkill,
      saveProject,
      deleteProject,
      saveExperience,
      deleteExperience,
      moveItem,
    ],
  );

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}