import { useState } from 'react';
import { KeyRound, LogIn, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useWindows } from '@/context/WindowsContext';
import { useShellUI } from '@/context/ShellUIContext';
import SectionCard from '@/components/ui/SectionCard/SectionCard';
import { HttpError } from '@/lib/api/httpClient';

/**
 * Authentication window (opened from StartMenu → Sign in).
 * Guests browse the portfolio freely; signing in as admin unlocks
 * server-synced site settings and future content editing.
 */
export default function Auth() {
  const { user, isAdmin, signIn, signOut } = useAuth();
  const { windows, closeWindow } = useWindows();
  const { pushNotification } = useShellUI();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const closeSelf = () => {
    const win = windows.find((w) => w.appId === 'auth');
    if (win) closeWindow(win.id);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const me = await signIn(email.trim(), password);
      pushNotification({
        title: 'Signed in',
        body: me.isAdmin ? `Welcome back, ${me.name}.` : `Signed in as ${me.name}.`,
      });
      closeSelf();
    } catch (err) {
      setError(err instanceof HttpError ? err.message : 'Sign in failed. Try again.');
    } finally {
      setBusy(false);
    }
  };

  const onSignOut = async () => {
    await signOut();
    pushNotification({ title: 'Signed out', body: 'Browsing as guest.' });
    closeSelf();
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-[420px] flex flex-col gap-5 p-5">
        <div>
          <h2 className="text-[18px] font-bold flex items-center gap-2" style={{ color: 'var(--accent)' }}>
            <ShieldCheck size={17} />
            <span>{user ? 'Account' : 'Sign in'}</span>
          </h2>
          <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-low)' }}>
            {user
              ? 'You are signed in. Only the admin can update the live site.'
              : 'Visitors browse freely. Sign in as admin to update this site.'}
          </p>
        </div>

        {user ? (
          <SectionCard title="Signed in" icon={<ShieldCheck size={13} />}>
            <p className="text-[13px] font-bold" style={{ color: 'var(--text-hi)' }}>{user.name}</p>
            <p className="text-[12px] mb-4" style={{ color: 'var(--text-low)' }}>
              {user.email}{isAdmin ? ' · admin' : ''}
            </p>
            <button
              onClick={onSignOut}
              className="px-4 py-2 rounded-[var(--radius-sm)] text-xs font-bold transition-all cursor-pointer"
              style={{ background: 'var(--accent-soft)', color: 'var(--text-hi)' }}
            >
              Sign out
            </button>
          </SectionCard>
        ) : (
          <SectionCard title="Admin sign in" icon={<KeyRound size={13} />}>
            <form onSubmit={onSubmit} className="grid grid-cols-12 gap-3">
              <label className="col-span-12 flex flex-col gap-1.5">
                <span className="text-[11px] font-bold" style={{ color: 'var(--text-mid)' }}>Email</span>
                <input
                  type="text"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin"
                  className="w-full rounded-[var(--radius-sm)] px-3 py-2 text-[13px]"
                />
              </label>
              <label className="col-span-12 flex flex-col gap-1.5">
                <span className="text-[11px] font-bold" style={{ color: 'var(--text-mid)' }}>Password</span>
                <input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-[var(--radius-sm)] px-3 py-2 text-[13px]"
                />
              </label>
              {error && (
                <p className="col-span-12 text-[12px] font-semibold" style={{ color: 'var(--error)' }}>
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={busy || !email.trim() || !password}
                className="col-span-12 flex items-center justify-center gap-2 px-4 py-2.5 rounded-[var(--radius-sm)] text-[13px] font-bold transition-all cursor-pointer disabled:opacity-50"
                style={{ background: 'var(--accent)', color: 'var(--accent-text-on)' }}
              >
                <LogIn size={14} />
                {busy ? 'Signing in…' : 'Sign in'}
              </button>
            </form>
          </SectionCard>
        )}
      </div>
    </div>
  );
}
