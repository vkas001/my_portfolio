import { useState } from 'react';
import { ArrowDown, Copy, Mail } from 'lucide-react';
import { useProfile } from '@/modules/about';

/** Compact availability + email tile stacked under the stats: the fastest
 *  path to contact without scrolling to the band. */
export default function ContactQuickTile() {
  const profile = useProfile();
  const [copied, setCopied] = useState(false);

  if (!profile) {
    return (
      <div className="bento-tile b-quick" aria-busy="true">
        <div className="space-y-3 animate-pulse">
          <div className="h-4 w-1/2 rounded" style={{ background: 'var(--accent-soft)' }} />
          <div className="h-9 rounded-lg" style={{ background: 'var(--accent-soft)' }} />
        </div>
      </div>
    );
  }

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <section className="bento-tile lift b-quick" aria-label="Quick contact">
      <p className="b-tile-eyebrow">
        <span className="dot" aria-hidden />
        Currently
      </p>
      <p className="b-quick-status">{profile.openToWork || 'Open to interesting work'}</p>
      <button type="button" onClick={copyEmail} className="b-email-row" title="Copy email">
        <Mail size={13} style={{ color: 'var(--accent)' }} />
        <span className="truncate">{profile.email}</span>
        <Copy size={12} style={{ color: 'var(--text-low)' }} />
      </button>
      {copied && (
        <p className="text-[11px]" style={{ color: 'var(--success)' }}>
          Email copied — talk soon.
        </p>
      )}
      <a href="#site-contact" className="b-quick-link">
        Work with me <ArrowDown size={13} />
      </a>
    </section>
  );
}
