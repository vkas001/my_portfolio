import { HobbiesScreen } from '@/modules/hobbies';
import SiteTile from '@/modules/site/components/SiteTile/SiteTile';

/** Side joys, compact by design — the narrow tile keeps them scannable. */
export default function InterestsTile() {
  return (
    <SiteTile
      id="site-interests"
      eyebrow="Off the clock"
      title="Interests"
      blurb="Hobbies, interests and side joys."
      accent="#f97316"
      span="b-interests"
    >
      <HobbiesScreen />
    </SiteTile>
  );
}
