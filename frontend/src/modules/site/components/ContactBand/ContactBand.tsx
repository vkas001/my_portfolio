import { useState } from 'react';
import { Check, Copy, LoaderCircle, Send } from 'lucide-react';
import { useContactForm } from '@/modules/contact';
import { SOCIAL_META, useProfile } from '@/modules/about';
import Input from '@/components/ui/Input/Input';
import TextArea from '@/components/ui/TextArea/TextArea';

/** Full-width closing band: reach-me column beside the message form. */
export default function ContactBand() {
  const profile = useProfile();
  const { form, setField, status, error, submit, reset } = useContactForm();
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    if (!profile) return;
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <section id="site-contact" className="bento-tile b-anchor b-contact" aria-label="Contact">
      <header>
        <p className="b-tile-eyebrow">
          <span className="dot" aria-hidden />
          Say hello
        </p>
        <h2 className="b-tile-title">Let’s build something</h2>
      </header>

      <div className="b-contact-grid">
        <div className="flex flex-col gap-3 min-w-0">
          <button type="button" onClick={copyEmail} className="b-email-row" title="Copy email" disabled={!profile}>
            <span className="truncate">{profile?.email ?? 'Loading…'}</span>
            <Copy size={12} style={{ color: 'var(--text-low)' }} />
          </button>
          {copied && (
            <p className="text-[11px]" style={{ color: 'var(--success)' }}>
              Email copied — talk soon.
            </p>
          )}
          {profile && (
            <div className="flex flex-wrap gap-2">
              {profile.socials.map((s) => {
                const meta = SOCIAL_META[s.icon];
                return (
                  <a key={s.id} href={s.url} target="_blank" rel="noreferrer" className="b-social" aria-label={s.label} title={s.label} style={{ color: meta.color }}>
                    <meta.icon size={16} />
                  </a>
                );
              })}
            </div>
          )}
        </div>

        {status === 'sent' ? (
          <div className="flex flex-col items-center gap-2 py-8">
            <span className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
              <Check size={22} />
            </span>
            <p className="text-sm font-medium">Thanks — your message is on its way!</p>
            <button className="btn-ghost text-xs" onClick={reset}>
              Send another
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-3 min-w-0">
            <div className="grid grid-cols-12 gap-x-2 gap-y-4 @md:gap-x-4">
              <Input required placeholder="Your name" value={form.name} onChange={(e) => setField('name')(e.target.value)} className="col-span-12 @md:col-span-6" />
              <Input required type="email" placeholder="Email" value={form.email} onChange={(e) => setField('email')(e.target.value)} className="col-span-12 @md:col-span-6" />
            </div>
            <Input required placeholder="Subject" value={form.subject} onChange={(e) => setField('subject')(e.target.value)} />
            <TextArea required rows={4} placeholder="Tell me about your project…" value={form.message} onChange={(e) => setField('message')(e.target.value)} textareaClassName="resize-none" />
            {status === 'error' && (
              <p className="text-xs" style={{ color: 'var(--error)' }}>
                {error}
              </p>
            )}
            <div>
              <button type="submit" disabled={status === 'sending'} className="btn-accent text-xs disabled:opacity-60">
                {status === 'sending' ? <LoaderCircle size={13} className="animate-spin" /> : <Send size={13} />}
                {status === 'sending' ? 'Sending…' : 'Send message'}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
