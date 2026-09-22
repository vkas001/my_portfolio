import type { Profile } from '@shared/types';

/** Circular profile avatar: initial-letter fallback + img overlay when
 *  avatarUrl is set. Sizing and font size come from className. */
export default function UserAvatar({
  profile,
  className = 'w-11 h-11 text-lg',
}: {
  profile: Profile;
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-full flex items-center justify-center font-bold shrink-0 ${className}`}
      style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
      aria-hidden
    >
      {profile.name.charAt(0)}
      {profile.avatarUrl && (
        <img
          src={profile.avatarUrl}
          alt=""
          className="absolute inset-0 w-full h-full rounded-full object-cover"
        />
      )}
    </div>
  );
}
