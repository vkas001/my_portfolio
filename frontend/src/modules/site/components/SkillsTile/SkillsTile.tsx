import { SkillsScreen } from '@/modules/skills';
import SiteTile from '@/modules/site/components/SiteTile/SiteTile';

/** Skill matrix with its category filter and bars/cards switch intact. */
export default function SkillsTile() {
  return (
    <SiteTile
      id="site-skills"
      eyebrow="Toolbox"
      title="Skills"
      blurb="What I reach for, and how deep it goes."
      accent="#06b6d4"
      span="b-skills"
    >
      <SkillsScreen />
    </SiteTile>
  );
}
