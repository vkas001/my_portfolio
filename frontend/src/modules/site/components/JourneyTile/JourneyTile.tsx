import { ExperienceScreen } from '@/modules/experience';
import { EducationScreen } from '@/modules/education';
import SiteTile from '@/modules/site/components/SiteTile/SiteTile';

/** Work history and academic background on one timeline tile. */
export default function JourneyTile() {
  return (
    <SiteTile id="site-journey" eyebrow="Path so far" title="Experience & education" accent="#10b981" span="b-journey">
      <div>
        <p className="b-sub-eyebrow">Experience</p>
        <ExperienceScreen />
      </div>
      <div>
        <p className="b-sub-eyebrow">Education</p>
        <EducationScreen />
      </div>
    </SiteTile>
  );
}
