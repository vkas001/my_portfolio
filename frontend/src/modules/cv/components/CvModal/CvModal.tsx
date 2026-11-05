import { useEffect, useMemo, useRef } from 'react';
import { Download, X } from 'lucide-react';
import { useContent } from '@/context/ContentContext';
import { useShellUI } from '@/context/ShellUIContext';
import { Z_ABOVE_TASKBAR } from '@/lib/osLayout';
import { buildCv } from '@/modules/cv/lib/buildCv';
import CvPreview from '@/modules/cv/components/CvPreview/CvPreview';

export default function CvModal() {
  const { cvModalOpen, setCvModalOpen } = useShellUI();
  const { profile, skills, projects, experience, education, hobbies, loading } = useContent();
  const closeRef = useRef<HTMLButtonElement>(null);

  const cv = useMemo(
    () => buildCv({ profile, skills, projects, experience, education, hobbies }),
    [profile, skills, projects, experience, education, hobbies],
  );

  useEffect(() => {
    if (!cvModalOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setCvModalOpen(false);
    };
    window.addEventListener('keydown', onKey);
    const focusTimer = window.setTimeout(() => closeRef.current?.focus(), 40);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
      window.clearTimeout(focusTimer);
    };
  }, [cvModalOpen, setCvModalOpen]);

  if (!cvModalOpen) return null;

  const close = () => setCvModalOpen(false);

  const download = () => {
    if (!cv) return;
    const previousTitle = document.title;
    const restoreTitle = () => {
      document.title = previousTitle;
      window.removeEventListener('afterprint', restoreTitle);
    };
    document.title = `${cv.profile.name} — CV`;
    window.addEventListener('afterprint', restoreTitle);
    window.print();
    window.setTimeout(restoreTitle, 2000);
  };

  return (
    <div
      id="cv-modal"
      className="cv-modal-overlay"
      style={{ zIndex: Z_ABOVE_TASKBAR }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <div
        className="cv-modal-panel menu-surface"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cv-modal-title"
        aria-describedby="cv-modal-description"
      >
        <div className="cv-toolbar cv-no-print">
          <div className="min-w-0">
            <p id="cv-modal-title" className="text-sm font-semibold">Résumé preview</p>
            <p id="cv-modal-description" className="text-[10px] mt-0.5" style={{ color: 'var(--text-low)' }}>
              Built automatically from your profile, skills, projects, experience and education.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              className="btn-accent text-xs justify-center disabled:opacity-60"
              disabled={!cv}
              onClick={download}
            >
              <Download size={13} /> Download PDF
            </button>
            <button
              ref={closeRef}
              type="button"
              className="icon-btn w-7 h-7"
              onClick={close}
              aria-label="Close CV preview"
              title="Close"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        <div className="cv-scroll">
          {cv ? (
            <CvPreview cv={cv} />
          ) : (
            <div className="cv-empty">
              <p className="text-sm font-medium">
                {loading ? 'Building your CV…' : 'Your CV needs profile details.'}
              </p>
              <p className="text-xs">
                {loading ? 'Pulling content from your portfolio apps.' : 'Add your name, title and profile in the Editor, then try again.'}
              </p>
            </div>
          )}
        </div>

        <p className="cv-print-hint cv-no-print">
          Download opens your browser&apos;s print dialog — choose “Save as PDF”.
        </p>
      </div>
    </div>
  );
}
