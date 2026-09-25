import { useRef } from 'react';
import { Download, FileJson, RotateCcw, Upload } from 'lucide-react';
import type { ThemeState } from '@/styles/theme';
import SectionCard from '@/components/ui/SectionCard/SectionCard';
import type { SetTheme } from '@/modules/settings/lib/types';

export default function DataTab({ theme, setTheme, resetTheme }: { theme: ThemeState; setTheme: SetTheme; resetTheme: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null);

  const exportTheme = () => {
    const blob = new Blob([JSON.stringify(theme, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'portfolio-theme.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const importTheme = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string) as Partial<ThemeState>;
        if (parsed && typeof parsed === 'object' && 'accent' in parsed) {
          setTheme(parsed);
        }
      } catch { /* invalid file */ }
    };
    reader.readAsText(file);
  };

  return (
    <SectionCard title="Theme data" icon={<FileJson size={13} />}>
      <p className="text-[12px] mb-3" style={{ color: 'var(--text-low)' }}>
        Download your full theme as JSON, or restore one from a previous export.
      </p>
      <div className="flex flex-row flex-wrap gap-3">
        <button
          onClick={exportTheme}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-[var(--radius-sm)] font-bold text-[12px] transition-all cursor-pointer"
          style={{ background: 'var(--accent-soft)', color: 'var(--text-hi)' }}
        >
          <Download size={14} /> Export theme
        </button>
        <button
          onClick={() => fileRef.current?.click()}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-[var(--radius-sm)] font-bold text-[12px] transition-all cursor-pointer"
          style={{ background: 'var(--accent-soft)', color: 'var(--text-hi)' }}
        >
          <Upload size={14} /> Import theme
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) importTheme(file);
            e.target.value = '';
          }}
        />
        <button
          onClick={resetTheme}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-[var(--radius-sm)] font-bold text-[12px] transition-all cursor-pointer"
          style={{ background: 'var(--accent)', color: 'var(--accent-text-on)' }}
        >
          <RotateCcw size={14} /> Reset all
        </button>
      </div>
    </SectionCard>
  );
}