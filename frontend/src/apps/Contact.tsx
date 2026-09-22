import { useState } from 'react';
import { sendContact } from '@/lib/api';
import { useProfile } from '@/lib/hooks';
import { useOS } from '@/context/OSContext';
import { Send, LoaderCircle, Check, Copy, Mail } from 'lucide-react';

export default function Contact() {
  const { pushNotification } = useOS();
  const profile = useProfile();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setError('');
    try {
      const res = await sendContact(form);
      setStatus('sent');
      pushNotification({ title: 'Message sent', body: res.message });
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to send');
    }
  };

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
      <div className="flex items-center gap-3">
        <span className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
          <Mail size={18} />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold">Let's build something</p>
          <button
            className="text-xs flex items-center gap-1 hover:underline"
            style={{ color: 'var(--text-mid)' }}
            onClick={copyEmail}
            title="Copy email"
          >
            {profile?.email ?? '…'} <Copy size={10} />
            {copied && <span style={{ color: 'var(--accent)' }}>copied!</span>}
          </button>
        </div>
      </div>

      {status === 'sent' ? (
        <div className="flex flex-col items-center gap-2 py-10">
          <span className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
            <Check size={22} />
          </span>
          <p className="text-sm font-medium">Thanks — your message is on its way!</p>
          <button className="btn-ghost text-xs" onClick={() => setStatus('idle')}>Send another</button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-12 gap-3">
            <input required placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="col-span-12 @md:col-span-6 w-full text-sm" />
            <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="col-span-12 @md:col-span-6 w-full text-sm" />
          </div>
          <input required placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="w-full text-sm" />
          <textarea required rows={5} placeholder="Tell me about your project…" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="w-full text-sm resize-none" />
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
