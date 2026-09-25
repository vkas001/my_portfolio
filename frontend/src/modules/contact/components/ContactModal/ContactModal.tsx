import { useShellUI } from '@/context/ShellUIContext';
import { useContactForm } from '@/modules/contact';
import Input from '@/components/ui/Input/Input';
import TextArea from '@/components/ui/TextArea/TextArea';
import { X, Send, LoaderCircle, Check } from 'lucide-react';

interface Props {
  open?: boolean;
  onClose?: () => void;
}

export default function ContactModal({ open, onClose }: Props) {
  const { contactModalOpen, setContactModalOpen } = useShellUI();
  const isOpen = open ?? contactModalOpen;
  const handleClose = onClose ?? (() => setContactModalOpen(false));
  const { form, setField, status, error, submit } = useContactForm(() => setTimeout(handleClose, 1600));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 fade-in" style={{ background: 'rgba(0,0,0,.45)' }}>
      <div className="menu-surface !relative w-[440px] max-w-full p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold">Get in touch</h2>
          <button className="icon-btn w-7 h-7" onClick={handleClose} aria-label="Close">
            <X size={14} />
          </button>
        </div>

        {status === 'sent' ? (
          <div className="flex flex-col items-center gap-2 py-8">
            <span className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
              <Check size={18} />
            </span>
            <p className="text-sm font-medium">Message sent!</p>
            <p className="text-xs" style={{ color: 'var(--text-mid)' }}>Thanks for reaching out — I'll reply soon.</p>
          </div>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-3">
            <div className="grid grid-cols-12 gap-3">
              <Input required placeholder="Your name" value={form.name} onChange={(e) => setField('name')(e.target.value)} className="col-span-12 @md:col-span-6" />
              <Input required type="email" placeholder="Email" value={form.email} onChange={(e) => setField('email')(e.target.value)} className="col-span-12 @md:col-span-6" />
            </div>
            <Input required placeholder="Subject" value={form.subject} onChange={(e) => setField('subject')(e.target.value)} />
            <TextArea required rows={5} placeholder="Message…" value={form.message} onChange={(e) => setField('message')(e.target.value)} textareaClassName="resize-none" />
            {status === 'error' && (
              <p className="text-xs" style={{ color: '#f87171' }}>{error}</p>
            )}
            <button type="submit" disabled={status === 'sending'} className="btn-accent text-xs justify-center disabled:opacity-60">
              {status === 'sending' ? <LoaderCircle size={13} className="animate-spin" /> : <Send size={13} />}
              {status === 'sending' ? 'Sending…' : 'Send message'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}