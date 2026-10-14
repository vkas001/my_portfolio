import { useEffect, useState } from 'react';
import { fetchGitHubStats } from '@/modules/widgets/lib/services';
import { fallbackStats } from '@/modules/widgets/lib/seeds';
import { useTheme } from '@/context/ThemeContext';
import type { GitHubStats } from '@shared/types';
import { Star, GitFork, Users, BookOpen } from 'lucide-react';

export default function GitHubStats() {
  const [stats, setStats] = useState<GitHubStats | null>(null);

  useEffect(() => {
    let alive = true;
    fetchGitHubStats().then((s) => { if (alive) setStats(s ?? fallbackStats); });
    return () => { alive = false; };
  }, []);

  if (!stats) return null;

  return (
    <div className="flex flex-col h-full gap-2">
      <div className="grid grid-cols-1 @min-[240px]:grid-cols-2 gap-1.5">
        <Stat icon={<BookOpen size={11} />} label="Repos" value={stats.publicRepos} />
        <Stat icon={<Star size={11} />} label="Stars" value={stats.starsEarned} />
        <Stat icon={<GitFork size={11} />} label="Forks" value={stats.forksEarned ?? 0} />
        <Stat icon={<Users size={11} />} label="Followers" value={stats.followers} />
      </div>
      {stats.contributions.length > 0 && (
        <ContributionCalendar
          total={stats.contributionsLastYear}
          days={stats.contributions}
        />
      )}
      <div className="flex flex-col gap-1 mt-auto">
        {stats.languages.slice(0, 3).map((l) => (
          <a
            key={l.name}
            href={`https://github.com/${stats.username}?tab=repositories&q=&type=&language=${encodeURIComponent(l.name)}`}
            target="_blank"
            rel="noreferrer"
            aria-label={`${l.name} repositories on GitHub`}
            title={`Browse ${stats.username}'s ${l.name} repos`}
            className="group flex items-center gap-2 rounded px-1 -mx-1 transition-colors hover:bg-[var(--accent-soft)]"
          >
            <span className="text-[10px] w-20 truncate group-hover:underline underline-offset-2" style={{ color: 'var(--text-mid)' }}>{l.name}</span>
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--accent-soft)' }}>
              <div className="h-full rounded-full" style={{ width: `${l.percent}%`, background: 'var(--accent)' }} />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-lg px-2 py-1.5" style={{ background: 'var(--accent-soft)' }}>
      <div className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--accent)' }}>
        {icon}
        <span>{label}</span>
      </div>
      <p className="text-sm font-bold">{value.toLocaleString()}</p>
    </div>
  );
}

/** GitHub's own contribution ramp, deliberately separate from the OS accent
 *  theme so the graph always reads as GitHub green. */
const GH_RAMP = {
  dark: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'],
  light: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'],
};

/** Year contribution heatmap (GitHub-style weeks-as-columns). Cells use the
 *  fixed GitHub green ramp above — never the accent tokens. */
function ContributionCalendar({ total, days }: { total: number; days: { date: string; count: number }[] }) {
  const { theme } = useTheme();
  const ramp = theme.mode === 'dark' ? GH_RAMP.dark : GH_RAMP.light;
  const max = Math.max(1, ...days.map((d) => d.count));
  const weeks: { date: string; count: number }[][] = [];
  days.forEach((d, i) => {
    if (i % 7 === 0) weeks.push([]);
    weeks[weeks.length - 1].push(d);
  });
  const level = (count: number) => (count === 0 ? 0 : 1 + Math.min(3, Math.floor((3 * count) / max)));

  return (
    <div className="flex flex-col gap-1 mt-1">
      <span className="text-[10px]" style={{ color: 'var(--text-low)' }}>
        {total.toLocaleString()} contributions in the last year
      </span>
      <div
        className="gh-cal grid gap-[3px] overflow-x-auto pb-1 focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
        style={{ gridTemplateRows: 'repeat(7, 10px)', gridAutoFlow: 'column', gridAutoColumns: '10px' }}
        role="img"
        tabIndex={0}
        aria-label={`${total} contributions in the last year — scroll horizontally to explore all weeks`}
      >
        {weeks.flatMap((week, wi) =>
          week.map((d) => (
            <span
              key={`${wi}-${d.date}`}
              title={`${d.count} contribution${d.count === 1 ? '' : 's'} on ${d.date}`}
              className="rounded-[2px]"
              style={{ width: 10, height: 10, background: ramp[level(d.count)] }}
            />
          )),
        )}
      </div>
    </div>
  );
}
