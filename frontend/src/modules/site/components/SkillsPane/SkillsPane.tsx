import { SkillsScreen } from '@/modules/skills';
import ResumeSection from '@/modules/site/components/ResumeSection/ResumeSection';

/** Skill matrix with its category filter, in the user's theme display mode. */
export default function SkillsPane() {
  return (
    <ResumeSection id="site-skills" index="05" title="Skills">
      <SkillsScreen />
    </ResumeSection>
  );
}
