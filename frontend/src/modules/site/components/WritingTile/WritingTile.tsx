import { BlogsScreen } from '@/modules/blogs';
import SiteTile from '@/modules/site/components/SiteTile/SiteTile';

/** Post cards with the markdown reader intact. */
export default function WritingTile() {
  return (
    <SiteTile
      id="site-writing"
      eyebrow="Notes & essays"
      title="Writing"
      blurb="Notes on builds, interfaces and shipping."
      accent="#84cc16"
      span="b-writing"
    >
      <BlogsScreen />
    </SiteTile>
  );
}
