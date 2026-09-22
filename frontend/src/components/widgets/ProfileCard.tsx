import { useProfile } from '@/lib/hooks';
import UserAvatar from '@/components/ui/UserAvatar';

export default function ProfileCard() {
  const profile = useProfile();

  if (!profile) return <div className="h-full w-full animate-pulse rounded" style={{ background: 'var(--accent-soft)' }} />;

  return (
    <div className="flex flex-col h-full gap-2">
      <div className="flex items-center gap-3">
        <UserAvatar profile={profile} className="w-11 h-11 text-lg" />
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
