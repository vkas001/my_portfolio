import { AuthProvider } from '@/context/AuthContext';
import { OSProvider } from '@/context/OSContext';
import { ContentProvider } from '@/context/ContentContext';
import AppShell from '@/components/desktop/AppShell';

export default function App() {
  return (
    <AuthProvider>
      <OSProvider>
        <ContentProvider>
          <AppShell />
        </ContentProvider>
      </OSProvider>
    </AuthProvider>
  );
}
