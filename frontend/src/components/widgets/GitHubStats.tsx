import { useEffect, useState } from 'react';
import { fetchGitHubStats } from '@/lib/api';
import type { GitHubStats } from '@shared/types';
import { Star, GitFork, Users, BookOpen } from 'lucide-react';

const FALLBACK: GitHubStats = {
  username: 'yourhandle',
  publicRepos: 24,
  followers: 180,
  starsEarned: 320,
  contributionsLastYear: 1240,
  languages: [
    { name: 'TypeScript', percent: 58 },
    { name: 'JavaScript', percent: 22 },
    { name: 'Python', percent: 12 },
    { name: 'CSS', percent: 8 },
  ],
  contributions: [],
  fetchedAt: new Date().toISOString(),
};

export default function GitHubStatsWidget() {
  const [stats, setStats] = useState<GitHubStats | null>(null);

  useEffect(() => {
    let alive = true;
    fetchGitHubStats().then((s) => { if (alive) setStats(s ?? FALLBACK); });
    return () => { alive = false; };
  }, []);

  if (!stats) return null;

  return (
    <div className="flex flex-col h-full gap-2">
      <div className="grid grid-cols-2 gap-1.5">
        <Stat icon={<BookOpen size={11} />} label="Repos" value={stats.publicRepos} />
        <Stat icon={<Star size={11} />} label="Stars" value={stats.starsEarned} />
        <Stat icon={<GitFork size={11} />} label="Forks" value={Math.round(stats.starsEarned / 4)} />
        <Stat icon={<Users size={11} />} label="Followers" value={stats.followers} />
      </div>
      <div className="flex flex-col gap-1 mt-auto">
        {stats.languages.slice(0, 3).map((l) => (
          <div key={l.name} className="flex items-center gap-2">
            <span className="text-[10px] w-20 truncate" style={{ color: 'var(--text-mid)' }}>{l.name}</span>
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--accent-soft)' }}>
              <div className="h-full rounded-full" style={{ width: `${l.percent}%`, background: 'var(--accent)' }} />
            </div>
          </div>
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
