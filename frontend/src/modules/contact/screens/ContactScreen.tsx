import { useState } from 'react';
import { useContactForm } from '@/modules/contact';
import { useProfile } from '@/modules/about';
import Input from '@/components/ui/Input/Input';
import TextArea from '@/components/ui/TextArea/TextArea';
import CompactPageHero from '@/components/ui/CompactPageHero/CompactPageHero';
import { Send, LoaderCircle, Check, Copy, Mail } from 'lucide-react';

export default function ContactScreen() {
  const profile = useProfile();
  const { form, setField, status, error, submit, reset } = useContactForm();
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    if (!profile) return;
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* clipboard unavailable */ }
  };

return (
    <div className="max-w-xl space-y-5">
      <CompactPageHero
        icon={<Mail size={18} />}
        title="Let’s build something"
        subtitle={profile?.email ?? ''}
        actions={
          <button
            className="btn-ghost text-[11px] !py-1.5 flex items-center gap-1"
            onClick={copyEmail}
            title="Copy email"
            disabled={!profile}
          >
            <Copy size={11} />
            {copied ? 'Copied' : 'Copy'}
          </button>
        }
/>

      {status === 'sent' ? (
        <div className="flex flex-col items-center gap-2 py-10">
          <span className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
            <Check size={22} />
          </span>
          <p className="text-sm font-medium">Thanks — your message is on its way!</p>
          <button className="btn-ghost text-xs" onClick={reset}>Send another</button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-12 gap-x-2 gap-y-4 @md:gap-x-4">
            <Input required placeholder="Your name" value={form.name} onChange={(e) => setField('name')(e.target.value)} className="col-span-12 @md:col-span-6" />
            <Input required type="email" placeholder="Email" value={form.email} onChange={(e) => setField('email')(e.target.value)} className="col-span-12 @md:col-span-6" />
          </div>
          <Input required placeholder="Subject" value={form.subject} onChange={(e) => setField('subject')(e.target.value)} />
          <TextArea required rows={5} placeholder="Tell me about your project…" value={form.message} onChange={(e) => setField('message')(e.target.value)} textareaClassName="resize-none" />
          {status === 'error' && <p className="text-xs" style={{ color: 'var(--error)' }}>{error}</p>}
          <button type="submit" disabled={status === 'sending'} className="btn-accent text-xs disabled:opacity-60">
            {status === 'sending' ? <LoaderCircle size={13} className="animate-spin" /> : <Send size={13} />}
            {status === 'sending' ? 'Sending…' : 'Send message'}
          </button>
        </form>
      )}

      {profile && (
        <div className="flex flex-wrap gap-2 pt-1">
          {profile.socials.map((s) => (
            <a key={s.id} href={s.url} target="_blank" rel="noreferrer" className="btn-ghost text-xs no-underline">
              {s.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}