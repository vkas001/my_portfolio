// In-OS connectivity: a forced-offline override (airplane mode) plus the
// real, read-only network facts the platform exposes. Browsers never let web
// pages enumerate/name/join networks — the Network Information API only
// reports type + effective bandwidth, and even that is informational only.
let forced = false;
const subs = new Set<() => void>();

export function setForcedOffline(v: boolean): void {
  if (v === forced) return;
  forced = v;
  subs.forEach((cb) => cb());
}

export function isForcedOffline(): boolean {
  return forced;
}

/** Notify consumers (Taskbar health poll) the instant the override flips. */
export function subscribeForcedOffline(cb: () => void): () => void {
  subs.add(cb);
  return () => {
    subs.delete(cb);
  };
}

export interface NetworkInfo {
  /** 'wifi' | 'ethernet' | 'cellular' | 'none' | 'other' | 'unknown' */
  type: string;
  effectiveType: string; // 'slow-2g' | '2g' | '3g' | '4g' (blink's names)
  downlinkMbps: number;
  rttMs: number;
  saveData: boolean;
}

/** Read connectivity status (type, effective speed). Null when the Network
 *  Information API is unavailable — there is nothing fake to display. */
export function readNetworkInfo(): NetworkInfo | null {
  const c = (navigator as unknown as {
    connection?: {
      type?: string;
      effectiveType?: string;
      downlink?: number;
      rtt?: number;
      saveData?: boolean;
    };
  }).connection;
  if (!c) return null;
  return {
    type: c.type ?? 'unknown',
    effectiveType: c.effectiveType ?? 'unknown',
    downlinkMbps: c.downlink ?? 0,
    rttMs: c.rtt ?? 0,
    saveData: c.saveData ?? false,
  };
}