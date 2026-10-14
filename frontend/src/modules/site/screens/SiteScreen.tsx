import { useEffect, useState } from 'react';
import { SITE_NAV } from '@/modules/site/lib/siteNav';
import SiteIntro from '@/modules/site/components/SiteIntro/SiteIntro';
import AboutPane from '@/modules/site/components/AboutPane/AboutPane';
import JobPane from '@/modules/site/components/JobPane/JobPane';
import EducationPane from '@/modules/site/components/EducationPane/EducationPane';
import ProjectsPane from '@/modules/site/components/ProjectsPane/ProjectsPane';
import SkillsPane from '@/modules/site/components/SkillsPane/SkillsPane';
import WritingPane from '@/modules/site/components/WritingPane/WritingPane';
import ContactPane from '@/modules/site/components/ContactPane/ContactPane';

/** Split-résumé site: a sticky identity column beside one calm reading
 *  column. No tiles, no rail — sections are numbered résumé blocks with
 *  hairline dividers. Content comes from the same hooks the OS apps use. */
export default function SiteScreen() {
  const [activeId, setActiveId] = useState<string>('site-about');

  // Scroll-spy: the nav marks the section nearest the top of the band —
  // the one the reader just arrived at, not the one scrolled furthest past.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const band = entries[0]?.rootBounds ? entries[0].rootBounds.height * 0.3 : 270;
        const inBand = entries.filter((e) => e.isIntersecting && e.boundingClientRect.top < band);
        if (!inBand.length) return;
        inBand.sort((a, b) => b.boundingClientRect.top - a.boundingClientRect.top);
        setActiveId(inBand[0].target.id);
      },
      { rootMargin: '0px 0px -70% 0px' },
    );
    SITE_NAV.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="web-shell">
      <div className="web-content">
        <div className="split">
          <SiteIntro activeId={activeId} />
          <main className="split-main">
            <AboutPane />
            <JobPane />
            <EducationPane />
            <ProjectsPane />
            <SkillsPane />
            <WritingPane />
            <ContactPane />
          </main>
        </div>
      </div>
    </div>
  );
}
