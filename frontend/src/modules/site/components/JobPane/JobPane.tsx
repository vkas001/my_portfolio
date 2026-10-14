import { ExperienceScreen } from '@/modules/experience';
import ResumeSection from '@/modules/site/components/ResumeSection/ResumeSection';

/** Work history timeline. */
export default function JobPane() {
  return (
    <ResumeSection id="site-experience" index="02" title="Experience">
      <ExperienceScreen />
    </ResumeSection>
  );
}
