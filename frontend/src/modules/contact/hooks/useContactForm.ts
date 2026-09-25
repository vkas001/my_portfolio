import { useState } from 'react';
import toast from 'react-hot-toast';
import { useShellUI } from '@/context/ShellUIContext';
import { sendContact } from '@/modules/contact/lib/services';
import type { ContactFormPayload } from '@shared/types';

const EMPTY_FORM: ContactFormPayload = { name: '', email: '', subject: '', message: '' };

export type ContactStatus = 'idle' | 'sending' | 'sent' | 'error';

/** Contact form state + submit shared by ContactScreen and ContactModal. */
export function useContactForm(onSuccess?: () => void) {
  const { pushNotification } = useShellUI();
  const [form, setForm] = useState<ContactFormPayload>(EMPTY_FORM);
  const [status, setStatus] = useState<ContactStatus>('idle');
  const [error, setError] = useState('');

  const setField = (key: keyof ContactFormPayload) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setError('');
    try {
      const res = await sendContact(form);
      setStatus('sent');
      toast.success('Message sent');
      pushNotification({ title: 'Message sent', body: res.message });
      setForm(EMPTY_FORM);
      onSuccess?.();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to send';
      setStatus('error');
      setError(msg);
      toast.error(msg);
    }
  };

  const reset = () => {
    setStatus('idle');
    setError('');
    setForm(EMPTY_FORM);
  };

  return { form, setField, status, setStatus, error, submit, reset };
}