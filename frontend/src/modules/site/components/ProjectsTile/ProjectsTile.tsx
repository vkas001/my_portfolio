import { ProjectsScreen } from '@/modules/projects';
import SiteTile from '@/modules/site/components/SiteTile/SiteTile';

/** Project cards with category filter and lift-to-expand detail intact. */
export default function ProjectsTile() {
  return (
    <SiteTile
      id="site-projects"
      eyebrow="Selected work"
      title="Projects"
      blurb="Things I've designed, built and shipped."
      accent="#f59e0b"
      span="b-projects"
    >
      <ProjectsScreen />
    </SiteTile>
  );
}
