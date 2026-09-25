import type { Profile } from '@/modules/about';
import { sectionIcon } from '@/modules/about';
import UserAvatar from '@/components/ui/UserAvatar/UserAvatar';

export default function AboutPersonalNote({ profile }: { profile: Profile }) {
  const Icon = sectionIcon(profile.personalNoteIcon);
  const title = profile.personalNoteTitle || 'A bit about me';
  if (!profile.personalNote) return null;
  return (
    <section>
      <div
        className="flex items-start gap-3 rounded-xl p-3 @2xl:p-4"
        style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)' }}
      >
        <UserAvatar profile={profile} className="w-10 h-10 text-sm shrink-0" />
        <div className="min-w-0">
          <p
            className="text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1"
            style={{ color: 'var(--accent)' }}
          >
            {Icon && <Icon size={11} />} {title}
          </p>
          <p className="text-xs leading-relaxed mt-1 @2xl:text-sm" style={{ color: 'var(--text-mid)' }}>
            {profile.personalNote}
          </p>
        </div>
      </div>
    </section>
  );
}