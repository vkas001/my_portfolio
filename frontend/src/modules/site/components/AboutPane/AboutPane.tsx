import { AboutPersonalNote, AboutStrengths, useProfile } from '@/modules/about';
import { hobbyIcon, useHobbies } from '@/modules/hobbies';
import { useContent } from '@/context/ContentContext';
import ResumeSection from '@/modules/site/components/ResumeSection/ResumeSection';

/** Bio strengths + personal note + a compact interests strip (icon chips —
 *  hobbies live here now that the sidebar is gone; descriptions stay in
 *  the OS Hobbies window). */
export default function AboutPane() {
  const profile = useProfile();
  const hobbies = useHobbies();
  const { loading } = useContent();

  return (
    <ResumeSection id="site-about" index="01" title="About">
      {!profile ? (
        loading && (
          <div className="space-y-3 animate-pulse" aria-busy="true">
            <div className="h-16 rounded-xl" style={{ background: 'var(--accent-soft)' }} />
            <div className="h-4 w-2/3 rounded" style={{ background: 'var(--accent-soft)' }} />
          </div>
        )
      ) : (
        <>
          <AboutStrengths profile={profile} />
          <AboutPersonalNote profile={profile} />
          {!!hobbies.length && (
            <div className="rs-hobbies">
              <p className="rs-label">Off the clock</p>
              <div className="flex flex-wrap gap-1.5">
                {hobbies.map((h) => {
                  const Icon = hobbyIcon(h.icon);
                  return (
                    <span key={h.id} className="b-pill" title={h.description || h.name}>
                      <Icon size={11} style={{ color: 'var(--accent)' }} />
                      {h.name}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </ResumeSection>
  );
}
