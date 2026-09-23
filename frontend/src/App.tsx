import { AuthProvider } from '@/context/AuthContext';
import { OSProvider } from '@/context/OSContext';
import AppShell from '@/components/desktop/AppShell';

export default function App() {
  return (
    <AuthProvider>
      <OSProvider>
        <AppShell />
      </OSProvider>
    </AuthProvider>
  );
}
