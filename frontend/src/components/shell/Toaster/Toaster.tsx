import { Toaster as RHT } from 'react-hot-toast';
import { Z_ABOVE_TASKBAR } from '@/lib/osLayout';

/** App-level toast mount (react-hot-toast). Styled with the OS glass tokens;
 *  mounted once in AppShell so toasts float above every window. */
export default function Toaster() {
  return (
    <RHT
      position="bottom-right"
      gutter={8}
      containerStyle={{ zIndex: Z_ABOVE_TASKBAR }}
      toastOptions={{
        duration: 4000,
        style: {
          fontSize: 13,
          fontWeight: 500,
          color: 'var(--text-hi)',
          background: 'var(--menu-glass-bg)',
          backdropFilter: 'blur(var(--glass-blur)) saturate(1.5)',
          WebkitBackdropFilter: 'blur(var(--glass-blur)) saturate(1.5)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          boxShadow: '0 8px 24px rgba(0,0,0,.25)',
          padding: '10px 12px',
        },
        success: {
          iconTheme: { primary: 'var(--success)', secondary: 'transparent' },
        },
        error: {
          iconTheme: { primary: 'var(--error)', secondary: 'transparent' },
        },
      }}
    />
  );
}