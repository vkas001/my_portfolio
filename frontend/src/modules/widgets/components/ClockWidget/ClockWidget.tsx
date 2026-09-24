import { useEffect, useState } from 'react';
import { useTheme } from '@/context/ThemeContext';

export default function ClockWidget() {
  const { theme } = useTheme();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const time = now.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: theme.clockFormat === '12h',
  });

  const date = theme.dateFormat === 'long'
    ? now.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : now.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });

  return (
    <div className="flex flex-col items-center justify-center h-full gap-1">
      <p className="text-3xl font-bold tabular-nums" style={{ color: 'var(--accent)' }}>
        {time}
      </p>
      <p className="text-xs" style={{ color: 'var(--text-mid)' }}>
        {date}
      </p>
    </div>
  );
}
