import { useState } from 'react';
import { Eye, Palette, Plus, RotateCcw, Timer, Type, X } from 'lucide-react';
import {
  DEFAULT_THEME, SPLASH_ACCENTS, SPLASH_BACKGROUNDS,
  type SplashBackground, type ThemeState,
} from '@/styles/theme';
import SectionCard from '@/components/ui/SectionCard/SectionCard';
import Input from '@/components/ui/Input/Input';
import { RangeControl } from '@/modules/settings/components/primitives';
import { BootScreen } from '@/components/shell/BootScreen/BootScreen';
import type { SetTheme } from '@/modules/settings/lib/types';

const MAX_WORDS = 6;

/** Boot-splash editor: wordmark, lines, timing and theme-independent look,
 *  with a fullscreen replay of the exact splash component as preview. */
export default function SplashTab({
  theme,
  setTheme,
  isAdmin,
}: {
  theme: ThemeState;
  setTheme: SetTheme;
  isAdmin: boolean;
}) {
  const [previewing, setPreviewing] = useState(false);

  const setWord = (i: number, value: string) => {
    const next = theme.splashWords.map((w, j) => (j === i ? value : w));
    setTheme({ splashWords: next });
  };
  const removeWord = (i: number) => {
    if (theme.splashWords.length <= 1) return;
    setTheme({ splashWords: theme.splashWords.filter((_, j) => j !== i) });
  };
  const addWord = () => {
    if (theme.splashWords.length >= MAX_WORDS) return;
    setTheme({ splashWords: [...theme.splashWords, 'hello'] });
  };
  const resetSplash = () =>
    setTheme({
      splashWords: [...DEFAULT_THEME.splashWords],
      splashTagline: DEFAULT_THEME.splashTagline,
      splashFooter: DEFAULT_THEME.splashFooter,
      splashDuration: DEFAULT_THEME.splashDuration,
      splashBackground: DEFAULT_THEME.splashBackground,
      splashAccent: DEFAULT_THEME.splashAccent,
    });

  return (
    <>
      {!isAdmin && (
        <p className="text-[11px] -mb-2" style={{ color: 'var(--text-low)' }}>
          Browsing as guest — your changes apply to this session only.
          Sign in as admin to update the live site.
        </p>
      )}

      <SectionCard title="Wordmark" icon={<Type size={13} />}>
        <p className="text-[11px] mb-2.5" style={{ color: 'var(--text-low)' }}>
          1–{MAX_WORDS} words, animated one by one on boot.
        </p>
        <div className="flex flex-col gap-2">
          {theme.splashWords.map((word, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-[11px] font-bold tabular-nums w-4 shrink-0" style={{ color: 'var(--text-low)' }}>
                {i + 1}
              </span>
              <Input
                value={word}
                maxLength={14}
                placeholder={`Word ${i + 1}`}
                aria-label={`Splash word ${i + 1}`}
                onChange={(e) => setWord(i, e.target.value)}
                className="flex-1 min-w-0"
              />
              <button
                className="icon-btn w-7 h-7 shrink-0 disabled:opacity-40"
                onClick={() => removeWord(i)}
                disabled={theme.splashWords.length <= 1}
                aria-label={`Remove word ${i + 1}`}
                title={theme.splashWords.length <= 1 ? 'At least one word' : `Remove word ${i + 1}`}
              >
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
        <button
          className="btn-ghost text-[11px] mt-2.5 disabled:opacity-40"
          onClick={addWord}
          disabled={theme.splashWords.length >= MAX_WORDS}
        >
          <Plus size={12} /> Add word
        </button>
      </SectionCard>

      <SectionCard title="Lines" icon={<Type size={13} />}>
        <div className="flex flex-col gap-3">
          <Input
            label="Tagline"
            value={theme.splashTagline}
            maxLength={60}
            placeholder="Empty hides the tagline"
            hint="Shown under the wordmark. Empty hides it."
            inputClassName="uppercase tracking-[0.2em]"
            onChange={(e) => setTheme({ splashTagline: e.target.value })}
          />
          <Input
            label="Footer"
            value={theme.splashFooter}
            maxLength={40}
            onChange={(e) => setTheme({ splashFooter: e.target.value })}
          />
        </div>
      </SectionCard>

      <SectionCard title="Timing" icon={<Timer size={13} />}>
        <RangeControl
          label="Splash duration"
          value={theme.splashDuration}
          min={1000}
          max={8000}
          step={100}
          display={`${(theme.splashDuration / 1000).toFixed(1)}s`}
          onChange={(v) => setTheme({ splashDuration: v })}
        />
      </SectionCard>

      <SectionCard title="Look" icon={<Palette size={13} />}>
        <p className="text-[11px] mb-2" style={{ color: 'var(--text-low)' }}>
          Fixed dark gradients — the splash renders before the theme loads.
        </p>
        <div className="grid grid-cols-12 gap-2 mb-4">
          {(Object.keys(SPLASH_BACKGROUNDS) as SplashBackground[]).map((key) => {
            const preset = SPLASH_BACKGROUNDS[key];
            const selected = theme.splashBackground === key;
            return (
              <button
                key={key}
                aria-pressed={selected}
                onClick={() => setTheme({ splashBackground: key })}
                className="col-span-12 @md:col-span-6 flex items-center gap-2 p-2 rounded-[var(--radius-sm)] border transition-all cursor-pointer"
                style={
                  selected
                    ? { borderColor: 'var(--accent)', boxShadow: '0 0 0 2px var(--accent-soft)', background: 'var(--accent-soft)' }
                    : { borderColor: 'var(--border)' }
                }
              >
                <span
                  className="w-10 h-7 rounded shrink-0 border"
                  style={{ background: preset.css, borderColor: 'var(--border)' }}
                  aria-hidden
                />
                <span className="text-[12px] font-bold" style={{ color: 'var(--text-hi)' }}>
                  {preset.label}
                </span>
              </button>
            );
          })}
        </div>
        <p className="text-[11px] mb-2" style={{ color: 'var(--text-low)' }}>
          Progress-fill accent
        </p>
        <div className="flex flex-wrap gap-2">
          {SPLASH_ACCENTS.map((a) => {
            const selected = theme.splashAccent.toLowerCase() === a.hex;
            return (
              <button
                key={a.hex}
                aria-pressed={selected}
                title={a.label}
                aria-label={`Progress accent ${a.label}`}
                onClick={() => setTheme({ splashAccent: a.hex })}
                className="w-8 h-8 rounded-full transition-all cursor-pointer"
                style={{
                  background: a.hex,
                  border: '1px solid var(--border)',
                  boxShadow: selected ? '0 0 0 2px var(--bg-elev), 0 0 0 4px var(--accent)' : undefined,
                }}
              />
            );
          })}
        </div>
      </SectionCard>

      <div className="flex flex-wrap gap-2">
        <button className="btn-accent text-xs" onClick={() => setPreviewing(true)}>
          <Eye size={13} /> Preview splash
        </button>
        <button className="btn-ghost text-xs" onClick={resetSplash}>
          <RotateCcw size={13} /> Reset splash
        </button>
      </div>

      {previewing && (
        <BootScreen
          words={theme.splashWords}
          tagline={theme.splashTagline || null}
          footer={theme.splashFooter}
          duration={theme.splashDuration}
          background={theme.splashBackground}
          accent={theme.splashAccent}
          onDone={() => setPreviewing(false)}
        />
      )}
    </>
  );
}
