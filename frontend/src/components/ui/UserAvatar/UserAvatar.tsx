import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import type { Profile } from '@shared/types';

/** Circular profile avatar: initial-letter fallback + img overlay when
 *  avatarUrl is set. Sizing and font size come from className.
 *  With a real avatar the circle is clickable and opens a dimmed
 *  full-size lightbox (portal to body, closes on Esc/backdrop/X). */
export default function UserAvatar({
  profile,
  className = 'w-11 h-11 text-lg',
}: {
  profile: Profile;
  className?: string;
}) {
  const [zoomed, setZoomed] = useState(false);
  const hasImg = Boolean(profile.avatarUrl);

  useEffect(() => {
    if (!zoomed) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setZoomed(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [zoomed]);

  const circle = (
    <div
      className={`relative overflow-hidden rounded-full flex items-center justify-center font-bold shrink-0 ${className}`}
      style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
      aria-hidden
    >
      {profile.name.charAt(0)}
      {hasImg && (
        <img
          src={profile.avatarUrl ?? undefined}
          alt=""
          className="absolute inset-0 w-full h-full rounded-full object-cover"
        />
      )}
    </div>
  );

  return (
    <>
      {hasImg ? (
        <button
          type="button"
          aria-label="View full-size avatar"
          title="View full-size avatar"
          className="cursor-pointer rounded-full shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 transition-transform duration-150 ease-out hover:-translate-y-0.5 hover:shadow-lg active:-translate-y-px"
          style={{ outlineColor: 'var(--accent)' }}
          onClick={() => setZoomed(true)}
        >
          {circle}
        </button>
      ) : (
        circle
      )}
      {zoomed &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Avatar preview"
            className="fixed inset-0 z-[100] flex items-center justify-center p-6"
            style={{ background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(4px)' }}
            onClick={() => setZoomed(false)}
          >
            <img
              src={profile.avatarUrl ?? undefined}
              alt={profile.name}
              className="rounded-lg shadow-2xl"
              style={{ maxWidth: 'min(92vw, 1400px)', maxHeight: '92vh', objectFit: 'contain' }}
              onClick={(e) => e.stopPropagation()}
            />
            <button
              type="button"
              aria-label="Close preview"
              className="absolute top-4 right-4 p-2 rounded-full cursor-pointer"
              style={{ background: 'rgba(0, 0, 0, 0.4)', color: '#fff' }}
              onClick={() => setZoomed(false)}
            >
              <X size={20} />
            </button>
          </div>,
          document.body,
        )}
    </>
  );
}