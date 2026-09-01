import React, { useState, useEffect } from 'react';
import { Clock, ShieldCheck, Sun, Moon, ArrowRight, Search } from 'lucide-react';
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
      });
      setTimeStr(istTime);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-11 w-full bg-card/95 backdrop-blur-xs border-b border-border flex items-center justify-between px-4 sm:px-5 select-none z-30 shrink-0 font-sans">
      
      {/* Left: Brand + Status + City + Buses (Section 13) */}
      <div className="flex items-center space-x-3 text-xs font-mono">
        <span className="font-extrabold text-sm text-foreground tracking-tight font-sans">
          CITYFLOW
        </span>

        <span className="text-muted-foreground/40">•</span>

        <div className="flex items-center space-x-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>LIVE</span>
        </div>

        <span className="text-muted-foreground/40">•</span>

        <span className="text-foreground font-semibold">Chennai</span>

        <span className="text-muted-foreground/40">•</span>

        <span className="text-muted-foreground">{activeBusCount} Buses</span>
      </div>

      {/* Right: Time + Search + Theme + Control Room (Section 13) */}
      <div className="flex items-center space-x-2.5 font-mono text-xs">
        {/* Time */}
        <div className="hidden sm:flex items-center space-x-1 text-muted-foreground tabular-nums">
          <Clock className="w-3.5 h-3.5" />
          <span>{timeStr || '19:30'}</span>
        </div>

        {/* Theme Toggle */}
        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
        )}

        {/* Control Room Link */}
        <button
          onClick={() => navigate('/admin')}
          className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-sans font-bold text-xs shadow-2xs transition active:scale-95 cursor-pointer"
        >
          <span>Control Room</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

    </header>
  );
};

export default TopNavbar;
