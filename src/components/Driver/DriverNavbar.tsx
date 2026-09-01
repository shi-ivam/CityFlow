import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, ShieldCheck, Sun, Moon, User, RefreshCw } from 'lucide-react';
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
          className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/50 hover:bg-muted text-foreground text-xs font-mono font-medium rounded-lg border border-border transition-colors cursor-pointer"
          title="Return to City Transit Map"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-cf-primary" />
          <span>City Map</span>
        </button>

        <div className="h-4 w-px bg-border hidden sm:block" />

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-cf-primary text-white flex items-center justify-center font-mono font-bold text-xs rounded-lg shadow-xs">
            CF
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-tight text-foreground leading-none">
              Driver Portal
            </span>
            <span className="text-[10px] font-mono text-muted-foreground uppercase hidden md:inline">
              Chennai Metro Transit
            </span>
          </div>
        </div>

        <div className="h-4 w-px bg-border" />

        {/* Driver Selector */}
        <div className="flex items-center gap-2">
          <User className="w-3.5 h-3.5 text-cf-primary hidden sm:block" />
          <select
            value={selectedDriverId}
            onChange={(e) => onSelectDriver(e.target.value)}
            className="bg-card text-foreground text-xs font-mono font-medium py-1.5 px-2.5 rounded-lg border border-border focus:outline-none focus:border-cf-primary focus:ring-1 focus:ring-cf-primary cursor-pointer shadow-xs"
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
          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-cf-mint text-[#1e3a1e] rounded-lg border border-[#bbf7b5] text-xs font-mono font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse inline-block" />
            <span>Active on Shift</span>
          </div>
        )}

        {/* Request Shift Change CTA */}
        <button
          onClick={onRequestShiftChange}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-cf-primary text-white font-mono text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-cf-primary/90 active:scale-[0.98] transition-all cursor-pointer shadow-xs border border-cf-primary"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Request Handover</span>
          <span className="sm:hidden">Handover</span>
        </button>

        {/* Operational Clock */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-cf-olive/30 text-[#3b421a] rounded-lg border border-[#dce3b8] text-xs font-mono font-medium tabular-nums">
          <Clock className="w-3.5 h-3.5 text-cf-primary" />
          <span>{timeStr || '19:30 IST'}</span>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-2 rounded-lg bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground border border-border transition-colors cursor-pointer"
        >
          {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-cf-primary" />}
        </button>
      </div>
    </header>
  );
};
