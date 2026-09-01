import React, { useState, useEffect } from 'react';
import { Clock, ShieldCheck, Sun, Moon, ArrowRight, Activity, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TopNavbarProps {
  activeBusCount: number;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ 
  activeBusCount, 
  theme = 'light', 
  onToggleTheme 
}) => {
  const navigate = useNavigate();
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
    <header className="h-13 w-full bg-card/95 backdrop-blur-sm border-b border-border flex items-center justify-between px-4 sm:px-6 select-none z-30 shrink-0 font-sans shadow-2xs">
      
      {/* Left Brand Identity */}
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-mono font-extrabold text-xs shadow-xs">
          CF
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-none">
            <span className="font-bold text-sm text-foreground tracking-tight">CITYFLOW</span>
            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-primary/15 text-primary font-bold">
              TRANSIT
            </span>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground mt-0.5">
            Smart Scheduling & Route Management
          </span>
        </div>
      </div>

      {/* Center Operational Live Status Pill */}
      <div className="hidden md:flex items-center space-x-2 px-3 py-1 rounded-full bg-secondary border border-border text-xs font-mono">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="font-bold text-foreground">● LIVE NETWORK</span>
        <span className="text-muted-foreground/50">•</span>
        <span className="text-muted-foreground">Chennai MTC Grid</span>
        <span className="text-muted-foreground/50">•</span>
        <span className="text-emerald-700 dark:text-emerald-400 font-bold">{activeBusCount} Buses Active</span>
      </div>

      {/* Right Controls: Telemetry Clock, Theme Switch, Admin Cockpit Link */}
      <div className="flex items-center space-x-2 sm:space-x-3 font-mono text-xs">
        {/* Real-time Clock */}
        <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-secondary/80 border border-border text-foreground">
          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="tabular-nums font-bold">{timeStr || '19:30:00 IST'}</span>
        </div>

        {/* Theme Toggle */}
        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            className="p-1.5 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-muted-foreground" />}
          </button>
        )}

        {/* Admin Portal Button */}
        <button
          onClick={() => navigate('/admin')}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Control Room</span>
          <ArrowRight className="w-3 h-3 ml-0.5" />
        </button>
      </div>

    </header>
  );
};

export default TopNavbar;
