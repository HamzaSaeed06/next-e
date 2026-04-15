'use client';

import { useState, useEffect } from 'react';

export function FlashSaleCountdown() {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    function tick() {
      const now = new Date();
      const diff = endOfDay.getTime() - now.getTime();
      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeLeft({ hours, minutes, seconds });
    }

    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="flex items-center gap-2 mt-3">
      <span className="text-white/50 text-[11px] uppercase tracking-widest">Ends in</span>
      {[
        { val: pad(timeLeft.hours), label: 'HRS' },
        { val: pad(timeLeft.minutes), label: 'MIN' },
        { val: pad(timeLeft.seconds), label: 'SEC' },
      ].map(({ val, label }, i) => (
        <div key={label} className="flex items-center gap-2">
          <div className="flex flex-col items-center">
            <span className="text-xl font-extrabold text-white tabular-nums w-10 text-center bg-white/10 rounded px-1 py-0.5">{val}</span>
            <span className="text-[9px] text-white/40 font-bold tracking-widest mt-0.5">{label}</span>
          </div>
          {i < 2 && <span className="text-white/50 font-bold text-lg -mt-2">:</span>}
        </div>
      ))}
    </div>
  );
}
