import React from 'react';
import { 
  Bus, 
  MapPin, 
  CalendarClock, 
  BarChart3, 
  ShieldAlert, 
  Play, 
  Pause, 
  RotateCcw, 
  Zap, 
  Sparkles, 
  Layers, 
  PlusCircle,
  FileText
} from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  operationalTime,
  setOperationalTime,
  isSimulating,
  setIsSimulating,
  simSpeed,
  setSimSpeed,
  conflictsCount,
  onOpenFallbackModal,
  onOpenNewRouteDrawer,
  onOpenNewDutyModal,
  onOpenPRDModal
}) {
  // Format operational time for display (e.g. "08:45 AM")
  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60) % 24;
    const mins = minutes % 60;
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 === 0 ? 12 : hours % 12;
    return `${String(displayHours).padStart(2, '0')}:${String(mins).padStart(2, '0')} ${period}`;
  };

  return (
    <header className="h-16 border-b border-white/10 bg-[#070c18]/90 backdrop-blur-xl px-4 lg:px-6 flex items-center justify-between z-30 shrink-0 sticky top-0">
      {/* Brand & Paradigm Tag */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-sky-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-brand-500/20 ring-1 ring-white/20">
          <Bus className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-display font-black text-lg tracking-tight text-white">CityFlow</span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">
              DUAL-VIEW ENGINE
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono tracking-wider hidden sm:block">
            Smart Scheduling & Spatial Route Management
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="hidden md:flex items-center bg-slate-900/80 p-1 rounded-xl border border-white/5 space-x-1">
        <button
          onClick={() => setActiveTab('dual-view')}
          className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'dual-view'
              ? 'bg-brand-600 text-white shadow-md shadow-brand-500/25'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Unified Dual-View</span>
        </button>

        <button
          onClick={() => setActiveTab('routes-gis')}
          className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'routes-gis'
              ? 'bg-brand-600 text-white shadow-md shadow-brand-500/25'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Spatial Route Overlap</span>
        </button>

        <button
          onClick={() => setActiveTab('schedule-gantt')}
          className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'schedule-gantt'
              ? 'bg-brand-600 text-white shadow-md shadow-brand-500/25'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <CalendarClock className="w-4 h-4" />
          <span>Duty Roster & Rest</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'analytics'
              ? 'bg-brand-600 text-white shadow-md shadow-brand-500/25'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Summary Analytics</span>
        </button>
      </nav>

      {/* Right Controls: Operational Time, Conflict Alerts, Actions */}
      <div className="flex items-center space-x-3">
        
        {/* Operational Time & Simulation Scrubber */}
        <div className="flex items-center bg-slate-900/90 border border-white/10 rounded-xl px-3 py-1.5 space-x-2 font-mono text-xs">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider hidden xl:inline">Ops Time</span>
            <span className="text-white font-bold">{formatTime(operationalTime)}</span>
          </div>

          <div className="h-4 w-px bg-white/10 mx-1"></div>

          {/* Play / Pause */}
          <button
            onClick={() => setIsSimulating(!isSimulating)}
            title={isSimulating ? "Pause Simulation" : "Play Simulation"}
            className="p-1 rounded-md text-slate-300 hover:text-brand-300 hover:bg-slate-800 transition"
          >
            {isSimulating ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
          </button>

          {/* Speed Selector */}
          <button
            onClick={() => setSimSpeed(simSpeed === 1 ? 5 : simSpeed === 5 ? 15 : 1)}
            title="Toggle Simulation Speed (1x, 5x, 15x)"
            className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-brand-400 hover:bg-slate-700 transition"
          >
            {simSpeed}x
          </button>

          {/* Reset Clock */}
          <button
            onClick={() => setOperationalTime(480)} // Reset to 08:00 AM
            title="Reset to 08:00 AM"
            className="p-1 rounded-md text-slate-400 hover:text-slate-200 transition"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>

        {/* Conflict Trigger / Fallback Button */}
        {conflictsCount > 0 ? (
          <button
            onClick={onOpenFallbackModal}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-semibold text-xs shadow-lg shadow-rose-600/30 border border-rose-400/40 animate-pulse transition-all"
            title="Open 3-Tier Fallback Solver"
          >
            <ShieldAlert className="w-4 h-4 text-rose-200" />
            <span className="font-bold">{conflictsCount} Conflict</span>
            <span className="text-[10px] bg-rose-950/60 px-1.5 py-0.5 rounded font-mono text-rose-200">Solve</span>
          </button>
        ) : (
          <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-semibold">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>100% Compliant</span>
          </div>
        )}

        {/* PRD Reference Modal Button */}
        <button
          onClick={onOpenPRDModal}
          title="View Product Requirements & Architecture (PRD)"
          className="p-2 rounded-xl bg-slate-900 border border-white/10 text-slate-400 hover:text-brand-400 hover:border-brand-500/40 transition"
        >
          <FileText className="w-4 h-4" />
        </button>

      </div>
    </header>
  );
}
