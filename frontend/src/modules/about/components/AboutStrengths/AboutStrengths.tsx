import type { Profile } from '@/modules/about';
import { sectionIcon } from '@/modules/about';

export default function AboutStrengths({ profile }: { profile: Profile }) {
  const hasStrengths = profile.strengths.length > 0;
  const Icon = sectionIcon(profile.strengthsIcon);
  const title = profile.strengthsTitle || "What I'm good at";
  return (
    <section className="space-y-2">
      <h2
        className="text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1"
        style={{ color: 'var(--accent)' }}
      >
        {Icon && <Icon size={11} />} {title}
      </h2>

      {hasStrengths && (
        <div className="grid grid-cols-12 gap-2">
          {profile.strengths.map((strength, i) => {
            const ItemIcon = sectionIcon(strength.icon);
            return (
              <div
                key={i}
                className="col-span-12 @md:col-span-6 @2xl:col-span-4 flex items-start gap-2 rounded-xl p-3 @2xl:p-4"
                style={{ background: 'var(--accent-soft)' }}
              >
                {ItemIcon ? (
                  <ItemIcon size={13} className="shrink-0 mt-0.5 @2xl:mt-1" style={{ color: 'var(--accent)' }} />
                ) : null}
                <p className="text-xs leading-relaxed font-medium @2xl:text-sm" style={{ color: 'var(--text-hi)' }}>
                  {strength.text}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {profile.bio && (
        <p className="text-sm leading-relaxed pt-1 @2xl:text-base" style={{ color: 'var(--text-mid)' }}>
          {profile.bio}
        </p>
      )}
    </section>
  );
}