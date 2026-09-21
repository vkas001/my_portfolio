import { useEffect, useState } from 'react';
import { fetchProfile } from '@/lib/api';
import type { Profile } from '@shared/types';

export default function ProfileCard() {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    let alive = true;
    fetchProfile().then((p) => { if (alive) setProfile(p); });
    return () => { alive = false; };
  }, []);

  if (!profile) return <div className="h-full w-full animate-pulse rounded" style={{ background: 'var(--accent-soft)' }} />;

  return (
    <div className="flex flex-col h-full gap-2">
      <div className="flex items-center gap-3">
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center text-lg font-bold shrink-0"
          style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
        >
          {profile.name.charAt(0)}
          {profile.avatarUrl && (
            <img src={profile.avatarUrl} alt="" className="absolute inset-0 w-full h-full rounded-full object-cover" />
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate">{profile.name}</p>
          <p className="text-xs truncate" style={{ color: 'var(--text-mid)' }}>{profile.title}</p>
        </div>
      </div>
      <p className="text-xs leading-relaxed line-clamp-3" style={{ color: 'var(--text-mid)' }}>
        {profile.shortBio}
      </p>
      <div className="flex gap-1.5 mt-auto">
        {profile.socials.slice(0, 4).map((s) => (
          <a key={s.id} href={s.url} target="_blank" rel="noreferrer" className="chip no-underline">
            {s.label}
          </a>
        ))}
      </div>
    </div>
  );
}
