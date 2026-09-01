import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface TopNavbarProps {
  activeBusCount: number;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ activeBusCount }) => {
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const istTime = now.toLocaleTimeString('en-US', {
        timeZone: 'Asia/Kolkata',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      setTimeStr(`${istTime} IST`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-12 w-full bg-card border-b border-border flex items-center justify-between px-4 select-none z-30 shrink-0">
      {/* Brand */}
      <div className="flex items-center">
        <span className="font-bold text-base tracking-tight text-foreground">
          CityFlow
        </span>
      </div>

      {/* Right Telemetry & Clock */}
      <div className="flex items-center gap-3 font-mono text-xs">
        <div className="flex items-center gap-2 text-muted-foreground">
          <span>
            ACTIVE BUSES: <strong className="text-foreground">{activeBusCount}</strong>
          </span>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-secondary/50 rounded border border-border text-foreground tabular-nums">
          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
          <span>{timeStr || '19:30:00 IST'}</span>
        </div>
      </div>
    </header>
  );
};

