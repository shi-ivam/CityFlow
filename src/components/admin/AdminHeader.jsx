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
  Zap, 
  FileText,
  ExternalLink,
  ChevronRight,
  MapPin,
  ChevronDown
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
      
      {/* Left Breadcrumb & City Switcher */}
      <div className="flex items-center space-x-3">
        {/* City Selector Dropdown */}
        <div className="flex items-center bg-muted/60 border border-border rounded-md px-2 py-1 space-x-1 font-mono text-xs text-foreground">
          <MapPin className="w-3.5 h-3.5 text-primary" />
          <select
            value={selectedCity}
            onChange={(e) => onSelectCity && onSelectCity(e.target.value)}
            className="bg-transparent font-bold text-foreground outline-none cursor-pointer text-xs"
          >
            <option value="delhi">Delhi (NCR)</option>
            <option value="chennai">Chennai (TN)</option>
          </select>
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

      {/* Right Controls: Ops Clock, Alerts, Theme */}
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

        {/* Conflicts & Compliance Pill */}
        {conflictsCount > 0 ? (
          <button
            onClick={onOpenFallbackModal}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-xs font-mono font-semibold transition hover:bg-rose-500/20 active:scale-95"
            title="Open 3-Tier Fallback Solver"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
            <span className="hidden sm:inline">{conflictsCount} Conflict</span>
            <span className="text-[10px] bg-rose-600 text-white px-1.5 py-0.2 rounded font-bold">Solve</span>
          </button>
        ) : (
          <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-mono font-semibold">
            <Zap className="w-3 h-3 text-emerald-500" />
            <span>100% Rest OK</span>
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

        {/* Public View Link */}
        <button
          onClick={() => navigate('/')}
          title="Switch to Public Dual-View Engine"
          className="hidden lg:flex items-center space-x-1 px-2.5 py-1 rounded-md bg-accent text-accent-foreground border border-border text-xs font-medium hover:bg-accent/80 transition-colors"
        >
          <span>Public View</span>
          <ExternalLink className="w-3 h-3 text-muted-foreground" />
        </button>

      </div>

    </header>
  );
}
