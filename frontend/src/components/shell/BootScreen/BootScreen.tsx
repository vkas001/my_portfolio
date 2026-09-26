import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';

/** Minimum splash runtime (progress bar reaches 100% on this wall-clock).
 *  Ported from ibiz_v2's BootScreen — intentionally theme-independent:
 *  hard-coded dark gradient + white text, no --accent/--surface tokens. */
export const BOOT_DURATION = 2600;

const BOOT_STEPS: { at: number; text: string }[] = [
  { at: 5, text: 'Loading your theme…' },
  { at: 30, text: 'Restoring your settings…' },
  { at: 60, text: 'Mounting desktop…' },
  { at: 85, text: 'Preparing your portfolio…' },
];

const WORDS = ['You', 'are', 'welcomed'];

interface BootScreenProps {
  onDone?: () => void;
  /** Live phase message (e.g. still hydrating content) shown instead of the
   *  canned step text. Pass '' to show just the spinner + percentage. */
  statusLine?: string | null;
  /** Keep the overlay up at 100% until released — async phases still pending. */
  hold?: boolean;
  /** Wall-clock for the progress bar to reach 100%. Defaults to the full boot
   *  time; view switches pass a shorter value since data is already loaded. */
  duration?: number;
  /** Override the animated wordmark (default "You are welcomed"). */
  words?: string[];
  /** Override the tagline under the wordmark (default "My digital workspace").
   *  Pass null to hide it entirely. */
  tagline?: string | null;
}

export function BootScreen({
  onDone,
  statusLine,
  hold = false,
  duration = BOOT_DURATION,
  words = WORDS,
  tagline = 'My digital workspace',
}: BootScreenProps) {
  const [progress, setProgress] = useState(0);
  const [leaving, setLeaving] = useState(false);

  // Refs so the animation loop never restarts when the controller's
  // callback/hold flag change identity mid-boot.
  const holdRef = useRef(hold);
  holdRef.current = hold;
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    const start = Date.now();
    let raf: number;
    let doneTimer: number;

    const tick = () => {
      const elapsed = Date.now() - start;
      const p = Math.min(100, (elapsed / duration) * 100);
      setProgress(p);
      if (p >= 100) {
        if (holdRef.current) {
          raf = requestAnimationFrame(tick);
          return;
        }
        setLeaving(true);
        doneTimer = window.setTimeout(() => onDoneRef.current?.(), 500);
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(doneTimer);
    };
  }, []);

  const stepStatus =
    [...BOOT_STEPS].reverse().find((s) => progress >= s.at)?.text ?? 'Loading theme…';

  return (
    <div className={`boot-overlay${leaving ? ' boot-overlay--leaving' : ''}`}>
      <div className="boot-wordmark" aria-hidden="true">
        {words.map((word, i) => (
          <span
            key={word}
            className="boot-word"
            style={i === 0 ? undefined : { animationDelay: `${0.12 + i * 0.18}s` }}
          >
            {word}
          </span>
        ))}
      </div>
      {tagline && <div className="boot-tagline">{tagline}</div>}

      <div className="boot-progress">
        <div className="boot-progress__track">
          <div className="boot-progress__fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="boot-status">
          <span className="boot-status__line">
            <Loader2 className="boot-spinner" />
            {statusLine ?? stepStatus}
          </span>
          <span className="boot-status__pct">{Math.round(progress)}%</span>
        </div>
      </div>

      <div className="boot-footer">v1.0.0 &bull; Portfolio OS</div>
    </div>
  );
}