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
    <header className="h-14 bg-card/80 backdrop-blur-md border-b border-border/60 px-4 flex items-center justify-between z-30 shrink-0 sticky top-0 font-sans transition-colors">
      
      {/* Left: Hub Badge & Route Breadcrumb */}
      <div className="flex items-center space-x-2.5">
        <div className="flex items-center space-x-2 px-2.5 py-1 rounded-full bg-muted/40 border border-border/60 text-xs font-medium text-foreground">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="font-semibold text-[11px] tracking-tight">
            {selectedCity === 'chennai' ? 'Chennai MTC' : 'Delhi Operations'}
          </span>
        </div>

        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 hidden sm:inline" />

        <h1 className="text-xs font-medium text-muted-foreground hidden sm:inline tracking-tight">
          {pageTitle}
        </h1>
      </div>

      {/* Center: Global Search Bar */}
      <div className="hidden md:flex items-center flex-1 max-w-sm mx-6">
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-full bg-muted/30 hover:bg-muted/60 border border-border/60 text-xs text-muted-foreground transition-all group"
        >
          <div className="flex items-center space-x-2">
            <Search className="w-3.5 h-3.5 text-muted-foreground/70 group-hover:text-foreground transition-colors" />
            <span className="text-[11px] tracking-tight">Search routes, drivers, buses...</span>
          </div>
          <div className="flex items-center space-x-1">
            <kbd className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-card border border-border/70 text-muted-foreground shadow-2xs">Ctrl K</kbd>
          </div>
        </button>
      </div>

      {/* Right Controls: Ops Clock, Solver Dot, Theme */}
      <div className="flex items-center space-x-2">
        
        {/* Minimal Time Capsule */}
        <div className="flex items-center bg-muted/30 border border-border/60 rounded-full px-3 py-1 space-x-2 font-mono text-xs text-foreground">
          <span className="font-semibold tabular-nums text-[11px]">{formatTime(operationalTime)}</span>

          <div className="h-3 w-px bg-border/60" />

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
              title="Toggle Simulation Speed"
              className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-card border border-border/70 text-foreground hover:bg-accent transition"
            >
              {simSpeed}x
            </button>
          )}

          {setOperationalTime && (
            <button
              onClick={() => setOperationalTime(480)}
              title="Reset to 08:00 AM"
              className="text-muted-foreground/60 hover:text-foreground transition-colors"
            >
              <RotateCcw className="w-2.5 h-2.5" />
            </button>
          )}
        </div>

        {/* Rest Compliance Status */}
        {conflictsCount > 0 ? (
          <button
            onClick={onOpenFallbackModal}
            title={`${conflictsCount} rest conflict(s) detected - Click to open 3-Tier Solver`}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-xs font-mono font-bold transition hover:bg-rose-500/20 active:scale-95 group"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            <span className="text-[10px] font-bold">{conflictsCount}</span>
          </button>
        ) : (
          <div
            title="100% Rest Compliant - Zero violations"
            className="flex items-center space-x-1 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 cursor-default text-[10px] font-mono font-medium"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
            <span className="hidden sm:inline">COMPLIANT</span>
          </div>
        )}

        {/* Theme Toggle Button */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          className="p-1.5 rounded-full bg-muted/40 hover:bg-muted border border-border/60 text-muted-foreground hover:text-foreground transition-all"
        >
          {darkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-700" />}
        </button>

      </div>

    </header>
  );
}
