import { BlogsScreen } from '@/modules/blogs';
import ResumeSection from '@/modules/site/components/ResumeSection/ResumeSection';

/** Post list with inline markdown reader. */
export default function WritingPane() {
  return (
    <ResumeSection id="site-writing" index="06" title="Writing">
      <BlogsScreen />
    </ResumeSection>
  );
}
