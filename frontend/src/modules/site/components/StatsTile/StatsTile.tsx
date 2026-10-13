import { useProfile } from '@/modules/about';
import { useSkills } from '@/modules/skills';
import { useProjects } from '@/modules/projects';
import { useBlogs } from '@/modules/blogs';
import { useContent } from '@/context/ContentContext';

/** Four headline numbers beside the hero: tenure, output, range, writing. */
export default function StatsTile() {
  const profile = useProfile();
  const skills = useSkills();
  const projects = useProjects();
  const blogs = useBlogs();
  const { loading } = useContent();

  const stats: { value: string; label: string }[] =
    loading && !profile
      ? []
      : [
          { value: String(profile?.yearsExperience ?? 0), label: 'Years building' },
          { value: String(projects.length), label: 'Projects shipped' },
          { value: String(skills.length), label: 'Skills in rotation' },
          { value: String(blogs.filter((b) => b.published).length), label: 'Notes published' },
        ];

  return (
    <section className="bento-tile b-stats" aria-label="At a glance">
      <p className="b-tile-eyebrow">
        <span className="dot" aria-hidden />
        At a glance
      </p>
      {stats.length === 0 ? (
        <div className="b-stats-grid animate-pulse" aria-busy="true">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-14 rounded-lg" style={{ background: 'var(--accent-soft)' }} />
          ))}
        </div>
      ) : (
        <div className="b-stats-grid">
          {stats.map((s) => (
            <div key={s.label} className="b-stat">
              <b>{s.value}</b>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
