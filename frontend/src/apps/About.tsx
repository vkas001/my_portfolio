import { useProfile } from '@/lib/hooks';
import UserAvatar from '@/components/ui/UserAvatar';
import { MapPin, Download, Briefcase } from 'lucide-react';

export default function About() {
  const profile = useProfile();

  if (!profile) {
    return (
      <div className="space-y-3 animate-pulse">
        <div className="h-20 rounded-xl" style={{ background: 'var(--accent-soft)' }} />
        <div className="h-4 w-2/3 rounded" style={{ background: 'var(--accent-soft)' }} />
        <div className="h-24 rounded-xl" style={{ background: 'var(--accent-soft)' }} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-5">
      <header className="flex items-center gap-4">
        <UserAvatar profile={profile} className="w-16 h-16 text-2xl" />
        <div>
          <h1 className="text-xl font-bold">{profile.name}</h1>
          <p className="text-sm" style={{ color: 'var(--accent)' }}>{profile.title}</p>
          <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color: 'var(--text-mid)' }}>
            <MapPin size={11} /> {profile.location} · {profile.yearsExperience} yrs experience
          </p>
        </div>
      </header>

      <section>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-mid)' }}>{profile.bio}</p>
      </section>

      <section className="grid grid-cols-12 gap-3">
        <div className="col-span-12 @md:col-span-6 @2xl:col-span-4">
          <Highlight icon={<Briefcase size={13} />} label="Open to" value="New roles" />
        </div>
        <div className="col-span-12 @md:col-span-6 @2xl:col-span-4">
          <Highlight icon={<Briefcase size={13} />} label="Focus" value="Full-stack" />
        </div>
        <div className="col-span-12 @md:col-span-6 @2xl:col-span-4">
          <Highlight icon={<Briefcase size={13} />} label="Timezone" value={profile.location} />
        </div>
      </section>

      <section className="flex flex-wrap gap-2">
        {profile.resumeUrl && (
          <a href={profile.resumeUrl} download className="btn-accent text-xs no-underline">
            <Download size={13} /> Download résumé
          </a>
        )}
        {profile.socials.map((s) => (
          <a key={s.id} href={s.url} target="_blank" rel="noreferrer" className="btn-ghost text-xs no-underline">
            {s.label}
          </a>
        ))}
      </section>
    </div>
  );
}

function Highlight({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl p-3" style={{ background: 'var(--accent-soft)' }}>
      <p className="text-[10px] uppercase tracking-wider flex items-center gap-1" style={{ color: 'var(--accent)' }}>
        {icon} {label}
      </p>
      <p className="text-xs font-semibold mt-1">{value}</p>
    </div>
  );
}
