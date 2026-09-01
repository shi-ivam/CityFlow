import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Search, 
  Sun, 
  Moon, 
  Play, 
  Pause, 
  RotateCcw, 
  ShieldAlert, 
  ChevronRight, 
  MapPin 
} from 'lucide-react';

export default function AdminHeader({
  onOpenSearch,
  operationalTime = 480,
  setOperationalTime,
  isSimulating,
  setIsSimulating,
  simSpeed,
  setSimSpeed,
  conflictsCount = 0,
  onOpenFallbackModal,
  onOpenPRDModal,
  darkMode,
  setDarkMode,
  selectedCity = 'delhi',
  onSelectCity
}) {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        onOpenSearch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenSearch]);

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60) % 24;
    const mins = minutes % 60;
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 === 0 ? 12 : hours % 12;
    return `${String(displayHours).padStart(2, '0')}:${String(mins).padStart(2, '0')} ${period}`;
  };

  const getPageTitle = (path) => {
    if (path.includes('/routes')) return 'Spatial Route Operations';
    if (path.includes('/drivers')) return 'Driver Rostering & Workload';
    if (path.includes('/vehicles')) return 'Fleet & Vehicle Management';
    if (path.includes('/management')) return 'Dispatch & Control Room';
    return 'Admin Control Center';
  };

  const pageTitle = getPageTitle(location.pathname);

  return (
    <header className="h-14 bg-card border-b border-border px-4 flex items-center justify-between z-30 shrink-0 sticky top-0 font-sans">
      
      {/* Left Breadcrumb & Location Badge */}
      <div className="flex items-center space-x-3">
        {/* Chennai (MTC) Location Badge */}
        <div className="flex items-center bg-muted/60 border border-border rounded-md px-2.5 py-1 space-x-1.5 font-mono text-xs text-foreground">
          <MapPin className="w-3.5 h-3.5 text-primary" />
          <span className="font-bold text-foreground">
            {selectedCity === 'chennai' ? 'Chennai (MTC)' : 'Delhi Operations'}
          </span>
        </div>

        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground hidden sm:inline" />

        <h1 className="text-sm font-bold text-foreground tracking-tight hidden sm:inline">
          {pageTitle}
        </h1>
      </div>

      {/* Center: Global Search HUD Trigger */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-md bg-muted/50 hover:bg-muted border border-input text-xs text-muted-foreground transition-all duration-150 group"
        >
          <div className="flex items-center space-x-2">
            <Search className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground" />
            <span>Search buses, drivers, routes, schedules...</span>
          </div>
          <div className="flex items-center space-x-1">
            <kbd className="text-[10px]">Ctrl</kbd>
            <kbd className="text-[10px]">K</kbd>
          </div>
        </button>
      </div>

      {/* Right Controls: Ops Clock, Rest Status Dot, Theme */}
      <div className="flex items-center space-x-2">
        
        {/* Operational Time Clock */}
        <div className="flex items-center bg-muted/60 border border-border rounded-md px-2.5 py-1 space-x-2 font-mono text-xs text-foreground">
          <span className="font-bold tabular-nums">{formatTime(operationalTime)}</span>

          <div className="h-3 w-px bg-border" />

          {setIsSimulating && (
            <button
              onClick={() => setIsSimulating(!isSimulating)}
              title={isSimulating ? "Pause Simulation" : "Play Simulation"}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {isSimulating ? <Pause className="w-3 h-3 text-amber-500" /> : <Play className="w-3 h-3 text-emerald-500" />}
            </button>
          )}

          {setSimSpeed && (
            <button
              onClick={() => setSimSpeed(simSpeed === 1 ? 5 : simSpeed === 5 ? 15 : 1)}
              title="Toggle Speed"
              className="px-1 py-0.2 rounded text-[10px] font-bold bg-card border border-border text-foreground hover:bg-accent"
            >
              {simSpeed}x
            </button>
          )}

          {setOperationalTime && (
            <button
              onClick={() => setOperationalTime(480)}
              title="Reset to 08:00 AM"
              className="text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="w-2.5 h-2.5" />
            </button>
          )}
        </div>

        {/* Rest Compliance Status Dot */}
        {conflictsCount > 0 ? (
          <button
            onClick={onOpenFallbackModal}
            title={`${conflictsCount} duty rest conflict(s) detected - Click to open 3-Tier Solver`}
            className="flex items-center space-x-1.5 px-2 py-1 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-xs font-mono font-bold transition hover:bg-rose-500/20 active:scale-95 group"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
            </span>
            <span className="text-[11px] font-bold">{conflictsCount}</span>
          </button>
        ) : (
          <div
            title="100% Rest Compliant - All duty rosters within 11h mandatory rest threshold"
            className="flex items-center justify-center p-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/25 cursor-default"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-40"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>
        )}

        {/* Theme Toggle Button */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          className="p-1.5 rounded-md bg-muted/60 border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          {darkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-700" />}
        </button>

      </div>

    </header>
  );
}
