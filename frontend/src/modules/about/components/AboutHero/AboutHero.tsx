import { useState } from 'react';
import { useProfile, SOCIAL_META } from '@/modules/about';
import UserAvatar from '@/components/ui/UserAvatar/UserAvatar';
import { Briefcase, Copy, Download, MapPin, Send } from 'lucide-react';

/**
 * Web-view flagship hero (rendered only when the shell is in Web view).
 * Layout keys off the `.web-section` container anchor: single column on
 * phones/tablet-portrait, two-column once the section reaches `@2xl`
 * (672px). AboutActions is intentionally omitted in Web view — the
 * résumé/contact/socials CTAs all live here.
 */
export default function AboutHero() {
  const profile = useProfile();
  const [copied, setCopied] = useState(false);

  if (!profile) return null;

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
    <div
      className="rounded-2xl border p-5 @2xl:p-7"
      style={{
        background: 'linear-gradient(135deg, rgba(var(--accent-rgb), .08), transparent 55%)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="grid grid-cols-12 gap-2 items-center @sm:gap-5 @2xl:gap-7 @2xl:items-start">
        <div className="col-span-12 @2xl:col-span-7 flex items-center gap-4 min-w-0 @2xl:gap-5">
          <div
            className="shrink-0 p-[3px] rounded-full"
            style={{
              background: 'linear-gradient(135deg, rgba(var(--accent-rgb), .85), rgba(var(--accent-rgb), .15))',
            }}
          >
            <UserAvatar profile={profile} className="w-20 h-20 text-2xl @2xl:w-28 @2xl:h-28 @2xl:text-4xl" />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight break-words @2xl:text-3xl">{profile.name}</h1>
            <p className="text-sm font-medium mt-0.5 @2xl:text-base" style={{ color: 'var(--accent)' }}>
              {profile.title}
            </p>
          </div>
        </div>

        <div className="col-span-12 @2xl:col-span-5 flex flex-col gap-3 min-w-0 @2xl:gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs"
              style={{ borderColor: 'var(--border)', color: 'var(--text-mid)' }}
            >
              <MapPin size={11} style={{ color: 'var(--accent)' }} /> {profile.location}
            </span>
            <span
              className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs"
              style={{ borderColor: 'var(--border)', color: 'var(--text-mid)' }}
            >
              <Briefcase size={11} style={{ color: 'var(--accent)' }} /> {profile.yearsExperience} yrs experience
            </span>
            {profile.openToWork && (
              <span
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide"
                style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
              >
                {profile.openToWork}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2 @sm:flex-row @sm:flex-wrap">
            {profile.resumeUrl && (
              <a href={profile.resumeUrl} download className="btn-accent text-xs justify-center no-underline w-full @sm:w-auto">
                <Download size={13} /> Download résumé
              </a>
            )}
            <a href="#section-contact" className="btn-ghost text-xs justify-center no-underline w-full @sm:w-auto">
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
                  className="w-10 h-10 rounded-xl border flex items-center justify-center transition-transform duration-150 hover:-translate-y-0.5"
                  style={{ background: 'rgba(var(--accent-rgb), .06)', borderColor: 'var(--border)', color: meta.color }}
                >
                  <meta.icon size={16} />
                </a>
              );
            })}
          </div>
        </div>
      </div>

      <p className="text-sm leading-relaxed mt-5 @2xl:text-base @2xl:mt-6" style={{ color: 'var(--text-hi)' }}>
        {profile.shortBio}
      </p>
    </div>
  );
}