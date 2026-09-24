import { Toaster as RHT } from 'react-hot-toast';

/** App-level toast mount (react-hot-toast). Styled with the OS glass tokens;
 *  mounted once in AppShell so toasts float above every window. */
export default function Toaster() {
  return (
    <RHT
      position="bottom-right"
      gutter={8}
      containerStyle={{ zIndex: 90 }}
      toastOptions={{
        duration: 4000,
        style: {
          fontSize: 13,
          fontWeight: 500,
          color: 'var(--text-hi)',
          background: 'var(--bg-elev)',
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