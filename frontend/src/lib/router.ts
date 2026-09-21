/** Small hash-based router for desktop deep links (#/apps/about). */
export function parseHash(): { appId: string | null; params: URLSearchParams } {
  const raw = window.location.hash.replace(/^#\/?/, '');
  const [path, query] = raw.split('?');
  return {
    appId: path || null,
    params: new URLSearchParams(query ?? ''),
  };
}

export function setHash(appId: string | null): void {
  const url = appId ? `#/${appId}` : window.location.pathname;
  if (appId) window.location.hash = `#/${appId}`;
  else history.replaceState(null, '', url);
}

export function useHashRoute(onChange: () => void): void {
  window.addEventListener('hashchange', onChange);
}
