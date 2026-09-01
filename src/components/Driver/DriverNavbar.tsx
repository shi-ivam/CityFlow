import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, ShieldCheck, Sun, Moon, User } from 'lucide-react';
import { DriverSummary, DriverProfile } from '../../services/api';

interface DriverNavbarProps {
  drivers: DriverSummary[];
  selectedDriverId: string;
  onSelectDriver: (driverId: string) => void;
  driverProfile: DriverProfile | null;
  onNavigateHome: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onRequestShiftChange: () => void;
}

export const DriverNavbar: React.FC<DriverNavbarProps> = ({
  drivers,
  selectedDriverId,
  onSelectDriver,
  driverProfile,
  onNavigateHome,
  theme,
  onToggleTheme,
  onRequestShiftChange,
}) => {
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
      setTimeStr(`${istTime} IST`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-14 w-full bg-card border-b border-border flex items-center justify-between px-4 sm:px-6 select-none z-30 shrink-0 font-sans">
      {/* Left: Return to Map & Active Driver Selector */}
      <div className="flex items-center gap-3 md:gap-4">
        <button
          onClick={onNavigateHome}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary hover:bg-accent text-foreground text-xs font-mono font-medium rounded border border-border transition-colors cursor-pointer"
          title="Return to City Transit Map"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>City Map</span>
        </button>

        <div className="h-4 w-px bg-border hidden sm:block" />

        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-foreground text-background flex items-center justify-center font-mono font-black text-xs rounded-sm">
            CF
          </div>
          <span className="font-bold text-sm tracking-tight text-foreground hidden md:inline">
            Driver Portal
          </span>
        </div>

        <div className="h-4 w-px bg-border" />

        {/* Driver Selector */}
        <div className="flex items-center gap-2">
          <User className="w-3.5 h-3.5 text-muted-foreground hidden sm:block" />
          <select
            value={selectedDriverId}
            onChange={(e) => onSelectDriver(e.target.value)}
            className="bg-secondary text-foreground text-xs font-mono font-medium py-1.5 px-2.5 rounded border border-border focus:outline-none focus:ring-1 focus:ring-foreground cursor-pointer"
          >
            {drivers.map((d) => (
              <option key={d.driverId} value={d.driverId} className="bg-card text-foreground">
                {d.name} ({d.driverId})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Right: Duty Status & Actions */}
      <div className="flex items-center gap-3">
        {driverProfile && (
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-secondary text-foreground rounded border border-border text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-foreground inline-block" />
            <span className="font-semibold">On Duty</span>
          </div>
        )}

        {/* Request Shift Change CTA */}
        <button
          onClick={onRequestShiftChange}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-foreground text-background font-mono text-xs font-bold uppercase tracking-wider rounded hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer shadow-sm border border-foreground"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Request Shift</span>
        </button>

        {/* Calm Time Display (HH:mm) */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-secondary/50 rounded border border-border text-foreground font-mono text-xs tabular-nums">
          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
          <span>{timeStr || '19:30 IST'}</span>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          className="p-1.5 bg-secondary hover:bg-accent text-foreground rounded border border-border transition-colors cursor-pointer"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
