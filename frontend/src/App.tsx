import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { WindowsProvider } from '@/context/WindowsContext';
import { WidgetsProvider } from '@/context/WidgetsContext';
import { ShellUIProvider } from '@/context/ShellUIContext';
import { ContentProvider } from '@/context/ContentContext';
import AppShell from '@/components/shell/AppShell/AppShell';

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <WindowsProvider>
          <WidgetsProvider>
            <ShellUIProvider>
              <ContentProvider>
                <AppShell />
              </ContentProvider>
            </ShellUIProvider>
          </WidgetsProvider>
        </WindowsProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}