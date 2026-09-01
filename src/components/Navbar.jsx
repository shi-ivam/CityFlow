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
  onOpenPRDModal
}) {
  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60) % 24;
    const mins = minutes % 60;
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 === 0 ? 12 : hours % 12;
    return `${String(displayHours).padStart(2, '0')}:${String(mins).padStart(2, '0')} ${period}`;
  };

  return (
    <header className="h-14 border-b border-[#EAEAEA] bg-[#FFFFFF] px-4 lg:px-8 flex items-center justify-between z-30 shrink-0 sticky top-0">
      
      {/* Brand & Paradigm */}
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-[6px] bg-[#111111] flex items-center justify-center text-white">
          <Bus className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-serif font-bold text-lg tracking-tight text-[#111111]">CityFlow</span>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-[4px] bg-[#F7F6F3] text-[#787774] border border-[#EAEAEA]">
              DUAL-VIEW // V-02
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="hidden md:flex items-center bg-[#F7F6F3] p-0.5 rounded-[6px] border border-[#EAEAEA] space-x-0.5">
        <button
          onClick={() => setActiveTab('dual-view')}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded-[4px] text-xs font-medium transition-all ${
            activeTab === 'dual-view'
              ? 'bg-[#FFFFFF] text-[#111111] font-semibold shadow-sm border border-[#EAEAEA]'
              : 'text-[#787774] hover:text-[#111111]'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Dual-View</span>
        </button>

        <button
          onClick={() => setActiveTab('routes-gis')}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded-[4px] text-xs font-medium transition-all ${
            activeTab === 'routes-gis'
              ? 'bg-[#FFFFFF] text-[#111111] font-semibold shadow-sm border border-[#EAEAEA]'
              : 'text-[#787774] hover:text-[#111111]'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Spatial Overlap</span>
        </button>

        <button
          onClick={() => setActiveTab('schedule-gantt')}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded-[4px] text-xs font-medium transition-all ${
            activeTab === 'schedule-gantt'
              ? 'bg-[#FFFFFF] text-[#111111] font-semibold shadow-sm border border-[#EAEAEA]'
              : 'text-[#787774] hover:text-[#111111]'
          }`}
        >
          <CalendarClock className="w-3.5 h-3.5" />
          <span>Duty Roster</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded-[4px] text-xs font-medium transition-all ${
            activeTab === 'analytics'
              ? 'bg-[#FFFFFF] text-[#111111] font-semibold shadow-sm border border-[#EAEAEA]'
              : 'text-[#787774] hover:text-[#111111]'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Analytics</span>
        </button>
      </nav>

      {/* Right Controls */}
      <div className="flex items-center space-x-2.5">
        
        {/* Operational Time Clock */}
        <div className="flex items-center bg-[#F7F6F3] border border-[#EAEAEA] rounded-[6px] px-2.5 py-1 space-x-2 font-mono text-xs text-[#111111]">
          <span className="text-[#787774] text-[10px] uppercase font-semibold hidden lg:inline">Ops Time</span>
          <span className="font-bold">{formatTime(operationalTime)}</span>

          <div className="h-3 w-px bg-[#EAEAEA]"></div>

          <button
            onClick={() => setIsSimulating(!isSimulating)}
            title={isSimulating ? "Pause Simulation" : "Play Simulation"}
            className="text-[#787774] hover:text-[#111111] transition"
          >
            {isSimulating ? <Pause className="w-3 h-3 text-[#956400]" /> : <Play className="w-3 h-3 text-[#346538]" />}
          </button>

          <button
            onClick={() => setSimSpeed(simSpeed === 1 ? 5 : simSpeed === 5 ? 15 : 1)}
            title="Toggle Speed"
            className="px-1 py-0.2 rounded text-[10px] font-bold bg-[#FFFFFF] border border-[#EAEAEA] text-[#111111] hover:bg-[#F7F6F3]"
          >
            {simSpeed}x
          </button>

          <button
            onClick={() => setOperationalTime(480)}
            title="Reset to 08:00 AM"
            className="text-[#787774] hover:text-[#111111]"
          >
            <RotateCcw className="w-2.5 h-2.5" />
          </button>
        </div>

        {/* Conflict / Compliance Pill */}
        {conflictsCount > 0 ? (
          <button
            onClick={onOpenFallbackModal}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-[6px] bg-[#FDEBEC] text-[#9F2F2D] border border-[#F7D2D4] text-xs font-mono font-semibold transition hover:bg-[#F9DCDD] active:scale-95"
            title="Open 3-Tier Fallback Solver"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-[#9F2F2D]" />
            <span>{conflictsCount} Conflict</span>
            <span className="text-[10px] bg-[#9F2F2D] text-white px-1.5 py-0.2 rounded-[4px] font-bold">Solve</span>
          </button>
        ) : (
          <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-[6px] bg-[#EDF3EC] text-[#346538] border border-[#D5E5D4] text-xs font-mono font-semibold">
            <Zap className="w-3 h-3 text-[#346538]" />
            <span>100% Compliant</span>
          </div>
        )}

        {/* PRD Spec */}
        <button
          onClick={onOpenPRDModal}
          title="View Specification & Architecture"
          className="p-1.5 rounded-[6px] bg-[#F7F6F3] border border-[#EAEAEA] text-[#787774] hover:text-[#111111] hover:bg-[#FFFFFF] transition"
        >
          <FileText className="w-3.5 h-3.5" />
        </button>

      </div>

    </header>
  );
}
