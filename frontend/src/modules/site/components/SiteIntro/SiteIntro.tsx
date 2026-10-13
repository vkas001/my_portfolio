import { Download } from 'lucide-react';
import { SOCIAL_META, useProfile } from '@/modules/about';
import UserAvatar from '@/components/ui/UserAvatar/UserAvatar';
import SectionNav from '@/modules/site/components/SectionNav/SectionNav';

/** Sticky identity column: who this is, where to jump, how to reach them.
 *  Nothing here scrolls away — the page's fixed point. */
export default function SiteIntro({ activeId }: { activeId: string }) {
  const profile = useProfile();

  if (!profile) {
    return (
      <aside className="site-intro" aria-busy="true">
        <div className="space-y-3 animate-pulse">
          <div className="w-24 h-24 rounded-full" style={{ background: 'var(--accent-soft)' }} />
          <div className="h-7 w-3/4 rounded-lg" style={{ background: 'var(--accent-soft)' }} />
          <div className="h-4 w-1/2 rounded" style={{ background: 'var(--accent-soft)' }} />
          <div className="h-4 w-full rounded" style={{ background: 'var(--accent-soft)' }} />
        </div>
      </aside>
    );
  }

  return (
    <aside className="site-intro" aria-label="Introduction">
      <div className="b-avatar-ring">
        <UserAvatar profile={profile} className="w-20 h-20 text-2xl @2xl:w-24 @2xl:h-24 @2xl:text-3xl" />
      </div>
      <div>
        {profile.openToWork && (
          <span className="b-pill b-pill-accent">
            <span className="b-pulse" aria-hidden />
            {profile.openToWork}
          </span>
        )}
        <h1 className="si-name">{profile.name}</h1>
        <p className="si-title">{profile.title}</p>
      </div>
      <p className="si-bio">{profile.shortBio}</p>

      <SectionNav activeId={activeId} />

      <div className="flex flex-wrap gap-2">
        {profile.socials.map((s) => {
          const meta = SOCIAL_META[s.icon];
          return (
            <a
              key={s.id}
              href={s.url}
              target="_blank"
              rel="noreferrer"
              aria-label={s.label}
              title={s.label}
              className="b-social"
              style={{ color: meta.color }}
            >
              <meta.icon size={16} />
            </a>
          );
        })}
      </div>

      {profile.resumeUrl && (
        <a href={profile.resumeUrl} download className="btn-ghost text-xs justify-center no-underline">
          <Download size={13} /> Download résumé
        </a>
      )}
    </aside>
  );
}
