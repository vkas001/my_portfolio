import { useMemo } from 'react';
import { ProjectsScreen, useProjects } from '@/modules/projects';
import ResumeSection from '@/modules/site/components/ResumeSection/ResumeSection';

/** Project cards under a metric strip (real counts only). The cards keep
 *  their filter + lift-to-expand behavior; the strip states the totals. */
export default function ProjectsPane() {
  const projects = useProjects();
  const stacks = useMemo(() => new Set(projects.flatMap((p) => p.techStack)).size, [projects]);
  const featured = useMemo(() => projects.filter((p) => p.featured).length, [projects]);

  return (
    <ResumeSection id="site-projects" index="04" title="Projects">
      <div className="b-stats-grid b-stats-grid--3" aria-label="Project totals">
        <div className="b-stat">
          <b>{projects.length}</b>
          <span>Shipped</span>
        </div>
        <div className="b-stat">
          <b>{featured}</b>
          <span>Featured</span>
        </div>
        <div className="b-stat">
          <b>{stacks}</b>
          <span>Stacks used</span>
        </div>
      </div>
      <ProjectsScreen />
    </ResumeSection>
  );
}
