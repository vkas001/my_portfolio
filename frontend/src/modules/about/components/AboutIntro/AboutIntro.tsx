import type { Profile } from '@/modules/about';
import UserAvatar from '@/components/ui/UserAvatar/UserAvatar';
import { Briefcase, MapPin } from 'lucide-react';

export default function AboutIntro({ profile }: { profile: Profile }) {
  return (
    <header className="space-y-3">
      <div className="flex items-center gap-4">
        <UserAvatar profile={profile} className="w-14 h-14 text-2xl @sm:w-16 @sm:h-16" />
        <div className="min-w-0">
          <h1 className="text-xl font-bold break-words">{profile.name}</h1>
          <p className="text-sm break-words" style={{ color: 'var(--accent)' }}>{profile.title}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs" style={{ color: 'var(--text-mid)' }}>
        <span className="flex items-center gap-1">
          <MapPin size={11} /> {profile.location}
        </span>
        <span className="flex items-center gap-1">
          <Briefcase size={11} /> {profile.yearsExperience} yrs experience
        </span>
        {profile.openToWork && (
          <span
            className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide font-semibold"
            style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
          >
            {profile.openToWork}
          </span>
        )}
      </div>

      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-hi)' }}>
        {profile.shortBio}
      </p>
    </header>
  );
}