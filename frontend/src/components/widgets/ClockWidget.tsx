import { useEffect, useState } from 'react';

export default function ClockWidget() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full gap-1">
      <p className="text-3xl font-bold tabular-nums" style={{ color: 'var(--accent)' }}>
        {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </p>
      <p className="text-xs" style={{ color: 'var(--text-mid)' }}>
        {now.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
      </p>
    </div>
  );
}
