import { Suspense, useEffect, useState, type ComponentType, type ReactNode, Component } from 'react';
import { APP_REGISTRY } from '@/apps/registry';
import type { AppId } from '@/types';

/** Hosts a lazy-loaded app module with loading + error fallbacks. */
export default function ModuleHost({ appId }: { appId: AppId }) {
  const [error, setError] = useState<Error | null>(null);
  const app = APP_REGISTRY.find((a) => a.id === appId);

  useEffect(() => setError(null), [appId]);

  if (!app) {
    return <p className="text-sm" style={{ color: 'var(--text-mid)' }}>Unknown app: {appId}</p>;
  }

  const Comp = app.component as ComponentType;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
        <span className="text-3xl">⚠️</span>
        <p className="text-sm font-medium">Something went wrong</p>
        <p className="text-xs" style={{ color: 'var(--text-mid)' }}>{error.message}</p>
        <button className="btn-ghost text-xs" onClick={() => setError(null)}>Retry</button>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-full">
          <div
            className="w-6 h-6 rounded-full spin-slow"
            style={{ border: '2px solid var(--accent)', borderTopColor: 'transparent' }}
          />
        </div>
      }
    >
      <ErrorBoundary onError={setError}>
        <Comp />
      </ErrorBoundary>
    </Suspense>
  );
}

interface EBProps {
  children: ReactNode;
  onError: (e: Error) => void;
}

class ErrorBoundary extends Component<EBProps, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    this.props.onError(error);
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}
