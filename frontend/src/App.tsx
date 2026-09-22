import { OSProvider } from '@/context/OSContext';
import AppShell from '@/components/desktop/AppShell';

export default function App() {
  return (
    <OSProvider>
      <AppShell />
    </OSProvider>
  );
}
