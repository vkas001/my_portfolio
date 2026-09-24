import { useProfile } from '@/modules/about';
import { useShellUI } from '@/context/ShellUIContext';
import AboutHero from '@/modules/about/components/AboutHero/AboutHero';
import AboutIntro from '@/modules/about/components/AboutIntro/AboutIntro';
import AboutStrengths from '@/modules/about/components/AboutStrengths/AboutStrengths';
import AboutPersonalNote from '@/modules/about/components/AboutPersonalNote/AboutPersonalNote';
import AboutActions from '@/modules/about/components/AboutActions/AboutActions';

function AboutSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="h-20 rounded-xl" style={{ background: 'var(--accent-soft)' }} />
      <div className="h-4 w-2/3 rounded" style={{ background: 'var(--accent-soft)' }} />
      <div className="h-24 rounded-xl" style={{ background: 'var(--accent-soft)' }} />
    </div>
  );
}

function AboutHeroSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="rounded-2xl border p-5 @2xl:p-7" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full @2xl:w-28 @2xl:h-28" style={{ background: 'var(--accent-soft)' }} />
          <div className="flex-1 space-y-2">
            <div className="h-6 w-2/3 rounded" style={{ background: 'var(--accent-soft)' }} />
            <div className="h-4 w-1/3 rounded" style={{ background: 'var(--accent-soft)' }} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          <div className="h-7 w-24 rounded-full" style={{ background: 'var(--accent-soft)' }} />
          <div className="h-7 w-28 rounded-full" style={{ background: 'var(--accent-soft)' }} />
        </div>
        <div className="h-4 w-11/12 rounded mt-4" style={{ background: 'var(--accent-soft)' }} />
        <div className="h-4 w-3/5 rounded mt-2" style={{ background: 'var(--accent-soft)' }} />
      </div>
    </div>
  );
}

export default function AboutScreen() {
  const { viewMode } = useShellUI();
  const profile = useProfile();

  if (!profile) {
    return viewMode === 'web' ? <AboutHeroSkeleton /> : <AboutSkeleton />;
  }

  if (viewMode === 'web') {
    return (
      <div className="space-y-6">
        <AboutHero />
        <AboutStrengths profile={profile} />
        <AboutPersonalNote profile={profile} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-5">
      <AboutIntro profile={profile} />
      <AboutStrengths profile={profile} />
      <AboutPersonalNote profile={profile} />
      <AboutActions profile={profile} />
    </div>
  );
}