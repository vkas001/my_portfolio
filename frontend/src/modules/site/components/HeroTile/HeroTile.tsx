import { useState } from 'react';
import { Briefcase, Copy, Download, MapPin, Send } from 'lucide-react';
import { SOCIAL_META, useProfile } from '@/modules/about';
import UserAvatar from '@/components/ui/UserAvatar/UserAvatar';

function HeroSkeleton() {
  return (
    <div className="bento-tile b-hero" aria-busy="true">
      <div className="space-y-4 animate-pulse">
        <div className="flex items-center gap-5">
          <div className="w-24 h-24 rounded-full shrink-0" style={{ background: 'var(--accent-soft)' }} />
          <div className="flex-1 space-y-2">
            <div className="h-9 w-2/3 rounded-lg" style={{ background: 'var(--accent-soft)' }} />
            <div className="h-5 w-1/3 rounded-lg" style={{ background: 'var(--accent-soft)' }} />
          </div>
        </div>
        <div className="h-4 w-11/12 rounded" style={{ background: 'var(--accent-soft)' }} />
        <div className="h-4 w-3/5 rounded" style={{ background: 'var(--accent-soft)' }} />
        <div className="flex gap-2">
          <div className="h-9 w-36 rounded-lg" style={{ background: 'var(--accent-soft)' }} />
          <div className="h-9 w-36 rounded-lg" style={{ background: 'var(--accent-soft)' }} />
        </div>
      </div>
    </div>
  );
}

/** Bento hero: oversized name type, avatar medallion with availability dot,
 *  bio, meta pills, CTAs and socials. The one loud tile on the page. */
export default function HeroTile() {
  const profile = useProfile();
  const [copied, setCopied] = useState(false);

  if (!profile) return <HeroSkeleton />;

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <section className="bento-tile b-hero" aria-label="Introduction">
      <div className="flex items-center gap-5 min-w-0">
        <div className="b-avatar-ring shrink-0">
          <UserAvatar profile={profile} className="w-20 h-20 text-2xl @2xl:w-24 @2xl:h-24 @2xl:text-3xl" />
        </div>
        <div className="min-w-0">
          {profile.openToWork && (
            <span className="b-pill b-pill-accent">
              <span className="b-pulse" aria-hidden />
              {profile.openToWork}
            </span>
          )}
          <h1 className="b-hero-name">{profile.name}</h1>
          <p className="b-hero-title">{profile.title}</p>
        </div>
      </div>

      <p className="b-hero-bio">{profile.shortBio}</p>

      <div className="flex flex-wrap items-center gap-2">
        <span className="b-pill">
          <MapPin size={11} style={{ color: 'var(--accent)' }} /> {profile.location}
        </span>
        <span className="b-pill">
          <Briefcase size={11} style={{ color: 'var(--accent)' }} /> {profile.yearsExperience} yrs experience
        </span>
      </div>

      <div className="flex flex-col gap-2 @sm:flex-row @sm:flex-wrap">
        {profile.resumeUrl && (
          <a href={profile.resumeUrl} download className="btn-accent text-xs justify-center no-underline w-full @sm:w-auto">
            <Download size={13} /> Download résumé
          </a>
        )}
        <a href="#site-contact" className="btn-ghost text-xs justify-center no-underline w-full @sm:w-auto">
          <Send size={13} /> Work with me
        </a>
        <button type="button" onClick={copyEmail} className="btn-ghost text-xs justify-center w-full @sm:w-auto">
          <Copy size={13} /> {copied ? 'Copied!' : 'Copy email'}
        </button>
      </div>

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
    </section>
  );
}
