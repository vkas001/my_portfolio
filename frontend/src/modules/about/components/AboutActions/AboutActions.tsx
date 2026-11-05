import type { Profile } from '@/modules/about';
import { SOCIAL_META } from '@/modules/about';
import { Download } from 'lucide-react';
import { useShellUI } from '@/context/ShellUIContext';

export default function AboutActions({ profile }: { profile: Profile }) {
  const { setCvModalOpen } = useShellUI();

  return (
    <section className="flex flex-wrap gap-2">
      <button
        type="button"
        className="btn-accent text-xs no-underline justify-center w-full @sm:w-auto"
        onClick={() => setCvModalOpen(true)}
      >
        <Download size={13} /> Download CV
      </button>
      {profile.socials.map((s) => {
        const meta = SOCIAL_META[s.icon];
        const Icon = meta.icon;
        return (
          <a
            key={s.id}
            href={s.url}
            target="_blank"
            rel="noreferrer"
            aria-label={s.label}
            className="btn-ghost text-xs no-underline justify-center w-full @sm:w-auto"
          >
            <Icon size={13} style={{ color: meta.color }} /> {s.label}
          </a>
        );
      })}
    </section>
  );
}