import { useEffect, useState } from 'react';
import { fetchProfile } from '@/lib/api';
import { Mail, Github, Linkedin } from 'lucide-react';
import { useOS } from '@/context/OSContext';

export default function ContactQuick() {
  const [email, setEmail] = useState('');
  const { launchApp } = useOS();

  useEffect(() => {
    let alive = true;
    fetchProfile().then((p) => { if (alive) setEmail(p.email); });
    return () => { alive = false; };
  }, []);

  return (
    <div className="flex flex-col gap-2 h-full justify-center">
      <button className="btn-accent text-xs justify-center" onClick={() => launchApp('contact')}>
        <Mail size={13} /> Open contact form
      </button>
      <div className="flex gap-2 justify-center">
        <a className="icon-btn w-8 h-8" href={`mailto:${email}`} title="Email">
          <Mail size={14} />
        </a>
        <a className="icon-btn w-8 h-8" href="https://github.com/yourhandle" target="_blank" rel="noreferrer" title="GitHub">
          <Github size={14} />
        </a>
        <a className="icon-btn w-8 h-8" href="https://linkedin.com/in/yourhandle" target="_blank" rel="noreferrer" title="LinkedIn">
          <Linkedin size={14} />
        </a>
      </div>
    </div>
  );
}
