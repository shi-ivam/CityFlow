import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Search, 
  Bell, 
  User, 
  ChevronDown, 
  AlertTriangle, 
  ShieldCheck, 
  Sparkles,
  Layers,
  LogOut,
  Sliders,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { DIVISIONS } from './operationsData';

export default function TopControlDeck({
  selectedDivision,
  onSelectDivision,
  simulationTimeSeconds,
  isSimulating,
  onToggleSimulating,
  simSpeed,
  onChangeSimSpeed,
  onResetSimulation,
  activeConflictsCount,
  onOpenConflicts,
  onOpenSearch,
  onOpenAlerts,
  alertCount = 3,
  onShowToast,
  onToggleSidebar
}) {
  const [isDivisionOpen, setIsDivisionOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Format seconds into HH:MM:SS IST
  const formatFullTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600) % 24;
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')} IST`;
  };

  // Timeline scrubber percentage (06:00 to 22:00 = 16 hours = 57,600s)
  const timelineStartSec = 6 * 3600;
  const timelineEndSec = 22 * 3600;
  const clampedSec = Math.max(timelineStartSec, Math.min(timelineEndSec, simulationTimeSeconds));
  const progressPct = ((clampedSec - timelineStartSec) / (timelineEndSec - timelineStartSec)) * 100;

  const currentDivObj = DIVISIONS.find(d => d.id === selectedDivision) || DIVISIONS[0];

  return (
    <header className="h-16 bg-[#0b0f19] border-b border-[#1f2937] px-4 sm:px-6 flex items-center justify-between z-30 shrink-0 sticky top-0 font-sans select-none text-white">
      
      {/* LEFT: Branding & Division Switcher */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="p-1.5 rounded-lg bg-[#111827] hover:bg-[#1a2333] border border-[#1f2937] text-slate-400 hover:text-white transition"
            title="Toggle Navigation Sidebar"
          >
            <Layers className="w-4 h-4 text-indigo-400" />
          </button>
        )}

        {/* Brand Logo */}
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-mono font-bold text-xs shadow-md shadow-indigo-500/20">
            CF
          </div>
          <div className="hidden lg:flex flex-col">
            <div className="text-[13px] font-bold tracking-tight text-white flex items-center gap-1.5 leading-none">
              CITYFLOW <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">PRO</span>
            </div>
            <span className="text-[9px] font-mono tracking-wider text-slate-400 uppercase mt-0.5">
              Transit Operations
            </span>
          </div>
        </div>

        <div className="h-6 w-px bg-[#1f2937] hidden sm:block" />

        {/* Division Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsDivisionOpen(!isDivisionOpen)}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-[#111827] hover:bg-[#1a2333] border border-[#1f2937] text-xs text-slate-200 transition-colors"
          >
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-medium truncate max-w-[150px] sm:max-w-none">{currentDivObj.name}</span>
            <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isDivisionOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDivisionOpen && (
            <div className="absolute left-0 mt-1.5 w-56 rounded-lg bg-[#111827] border border-[#1f2937] shadow-2xl py-1 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-1.5 text-[10px] font-mono uppercase text-slate-400 font-semibold tracking-wider border-b border-[#1f2937]">
                Transit Divisions
              </div>
              {DIVISIONS.map((div) => (
                <button
                  key={div.id}
                  onClick={() => {
                    onSelectDivision(div.id);
                    setIsDivisionOpen(false);
                    onShowToast(`Switched division to ${div.name}`);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition-colors ${
                    selectedDivision === div.id
                      ? 'bg-indigo-600/20 text-indigo-400 font-semibold'
                      : 'text-slate-300 hover:bg-[#1f2937]'
                  }`}
                >
                  <span>{div.name}</span>
                  <span className="text-[10px] font-mono text-slate-500">{div.code}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Global Search Control */}
        <button
          onClick={onOpenSearch}
          className="hidden md:flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-[#111827] hover:bg-[#1a2333] border border-[#1f2937] text-xs text-slate-400 hover:text-slate-200 transition-colors group"
        >
          <Search className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400" />
          <span>Search operations...</span>
          <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#1f2937] border border-slate-700 text-slate-400">Ctrl K</kbd>
        </button>
      </div>

      {/* CENTER: Real-Time Simulation / Dispatch Controller */}
      <div className="flex items-center space-x-3 bg-[#111827] border border-[#1f2937] rounded-lg px-3 py-1.5 shadow-inner">
        {/* Play/Pause Button */}
        <button
          onClick={onToggleSimulating}
          className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-semibold transition ${
            isSimulating 
              ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30' 
              : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
          }`}
          title={isSimulating ? "Pause Simulation Clock" : "Start Live Simulation Clock"}
        >
          {isSimulating ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          <span className="text-[11px] font-mono">{isSimulating ? 'PAUSE' : 'LIVE'}</span>
        </button>

        {/* Continuous Time Scrubber */}
        <div className="hidden xl:flex items-center space-x-2 w-48">
          <span className="text-[10px] font-mono text-slate-400">06:00</span>
          <div className="flex-1 h-1.5 bg-[#1f2937] rounded-full overflow-hidden relative">
            <div 
              className="h-full bg-indigo-500 transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
            <div 
              className="w-2.5 h-2.5 rounded-full bg-white absolute top-1/2 -translate-y-1/2 -translate-x-1/2 shadow"
              style={{ left: `${progressPct}%` }}
            />
          </div>
          <span className="text-[10px] font-mono text-slate-400">22:00</span>
        </div>

        {/* Speed Toggles */}
        <div className="flex items-center space-x-0.5 bg-[#0b0f19] p-0.5 rounded border border-[#1f2937]">
          {[1, 2, 5].map((speed) => (
            <button
              key={speed}
              onClick={() => onChangeSimSpeed(speed)}
              className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition ${
                simSpeed === speed
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white hover:bg-[#1f2937]'
              }`}
            >
              {speed}x
            </button>
          ))}
        </div>

        {/* Current Dispatch Time Display */}
        <div className="flex items-center space-x-1.5 pl-1 text-slate-200 font-mono text-xs">
          <Clock className="w-3.5 h-3.5 text-indigo-400 hidden sm:inline" />
          <span className="font-bold tabular-nums tracking-wider text-emerald-400">
            {formatFullTime(simulationTimeSeconds)}
          </span>
        </div>

        {/* Reset Clock Button */}
        <button
          onClick={onResetSimulation}
          title="Reset clock to 08:30:15 IST"
          className="text-slate-400 hover:text-slate-200 p-1 rounded hover:bg-[#1f2937] transition"
        >
          <RotateCcw className="w-3 h-3" />
        </button>
      </div>

      {/* RIGHT: System Status & User Controls */}
      <div className="flex items-center space-x-2.5 sm:space-x-3">
        {/* Dynamic Compliance Chip */}
        {activeConflictsCount > 0 ? (
          <button
            onClick={onOpenConflicts}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-400 hover:bg-rose-500/25 transition text-xs font-mono font-bold animate-pulse shadow-sm"
            title={`${activeConflictsCount} active operational conflicts - Click to resolve`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>▲ {activeConflictsCount} CONFLICTS</span>
          </button>
        ) : (
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>● COMPLIANT</span>
          </div>
        )}

        {/* Alert Drawer Trigger */}
        <button
          onClick={onOpenAlerts}
          className="p-2 rounded-lg bg-[#111827] hover:bg-[#1a2333] border border-[#1f2937] text-slate-300 hover:text-white transition relative"
          title="Open Operational Alerts Drawer"
        >
          <Bell className="w-4 h-4" />
          {alertCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-mono font-bold flex items-center justify-center">
              {alertCount}
            </span>
          )}
        </button>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center space-x-2 p-1.5 rounded-lg bg-[#111827] hover:bg-[#1a2333] border border-[#1f2937] transition"
          >
            <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white font-bold text-xs">
              D
            </div>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-1.5 w-48 rounded-lg bg-[#111827] border border-[#1f2937] shadow-2xl py-1.5 z-50 text-xs text-slate-200">
              <div className="px-3 py-1.5 border-b border-[#1f2937]">
                <div className="font-semibold text-white">Chief Dispatcher</div>
                <div className="text-[10px] font-mono text-slate-400">ID: DISP-DELHI-04</div>
              </div>
              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  onShowToast('Dispatcher Profile: Active Shift Duty (Shift A)');
                }}
                className="w-full text-left px-3 py-2 hover:bg-[#1f2937] flex items-center space-x-2"
              >
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Dispatcher Profile</span>
              </button>
              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  onShowToast('Preferences: Audio Alerts Enabled, Dark Control Room');
                }}
                className="w-full text-left px-3 py-2 hover:bg-[#1f2937] flex items-center space-x-2"
              >
                <Sliders className="w-3.5 h-3.5 text-slate-400" />
                <span>Preferences</span>
              </button>
              <div className="border-t border-[#1f2937] my-1" />
              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  onShowToast('Simulated Sign Out: Session saved to local store.');
                }}
                className="w-full text-left px-3 py-2 hover:bg-rose-500/20 text-rose-400 flex items-center space-x-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>

      </div>

    </header>
  );
}
