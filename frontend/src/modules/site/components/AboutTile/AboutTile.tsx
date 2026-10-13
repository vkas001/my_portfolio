import { AboutPersonalNote, AboutStrengths, useProfile } from '@/modules/about';
import { useContent } from '@/context/ContentContext';
import SiteTile from '@/modules/site/components/SiteTile/SiteTile';

/** Bio strengths + personal note. The strengths heading comes from the
 *  profile so the tile title always matches the editor. */
export default function AboutTile() {
  const profile = useProfile();
  const { loading } = useContent();

  return (
    <SiteTile id="site-about" eyebrow="About" title="Beyond the résumé" accent="#8b5cf6" span="b-about">
      {!profile ? (
        loading && (
          <div className="space-y-3 animate-pulse" aria-busy="true">
            <div className="h-16 rounded-xl" style={{ background: 'var(--accent-soft)' }} />
            <div className="h-4 w-2/3 rounded" style={{ background: 'var(--accent-soft)' }} />
            <div className="h-20 rounded-xl" style={{ background: 'var(--accent-soft)' }} />
          </div>
        )
      ) : (
        <>
          <AboutStrengths profile={profile} />
          <AboutPersonalNote profile={profile} />
        </>
      )}
    </SiteTile>
  );
}
