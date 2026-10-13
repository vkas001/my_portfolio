import { EducationScreen } from '@/modules/education';
import ResumeSection from '@/modules/site/components/ResumeSection/ResumeSection';

/** Academic background, first-class section. */
export default function EducationPane() {
  return (
    <ResumeSection id="site-education" index="03" title="Education">
      <EducationScreen />
    </ResumeSection>
  );
}
