import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
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
  Layers, 
  LogOut, 
  Sliders, 
  Clock, 
  Menu
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
    <header className="h-16 bg-[#212227] border-b-2 border-[#8693AB]/40 px-3 sm:px-5 flex items-center justify-between z-30 shrink-0 sticky top-0 font-sans select-none text-[#F1F5F9]">
      
      {/* LEFT: Branding, Modules Toggle & Division Switcher */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        
        {/* Module Sidebar Drawer Toggle */}
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#8693AB] hover:bg-[#96A3BC] text-[#212227] font-bold transition shadow-sm active:scale-95 cursor-pointer shrink-0"
            title="Open Module Navigation Drawer"
          >
            <Menu className="w-4 h-4 text-[#212227]" />
            <span className="hidden xl:inline text-[11px] font-bold">Modules</span>
          </button>
        )}

        {/* Brand Logo */}
        <div className="flex items-center space-x-2.5 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-[#8693AB] text-[#212227] flex items-center justify-center font-mono font-black text-xs shadow-sm">
            CF
          </div>
          <div className="hidden sm:flex flex-col min-w-0">
            <div className="text-[13px] font-bold tracking-tight text-[#F1F5F9] flex items-center gap-1.5 leading-none">
              CITYFLOW <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#8693AB] text-[#212227] font-mono font-black">PRO</span>
            </div>
            <span className="text-[9px] font-mono tracking-wider text-[#AAB9CF] uppercase mt-0.5 truncate">
              Transit Operations
            </span>
          </div>
        </div>

        <div className="h-6 w-px bg-[#8693AB]/40 hidden sm:block" />

        {/* Division Switcher Dropdown */}
        <div className="relative shrink-0">
          <button
            onClick={() => setIsDivisionOpen(!isDivisionOpen)}
            className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-[#8693AB] hover:bg-[#96A3BC] text-xs text-[#212227] font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-[#212227]" />
            <span className="truncate max-w-[130px] sm:max-w-none">{currentDivObj.name}</span>
            <ChevronDown className={`w-3 h-3 text-[#212227] transition-transform ${isDivisionOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDivisionOpen && (
            <div className="absolute left-0 mt-1.5 w-56 rounded-xl bg-[#212227] border-2 border-[#8693AB] shadow-2xl py-1 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-1.5 text-[10px] font-mono uppercase text-[#AAB9CF] font-bold tracking-wider border-b border-[#8693AB]/30">
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
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition-colors cursor-pointer ${
                    selectedDivision === div.id
                      ? 'bg-[#8693AB] text-[#212227] font-bold'
                      : 'text-[#E2E8F0] hover:bg-[#8693AB]/20'
                  }`}
                >
                  <span>{div.name}</span>
                  <span className="text-[10px] font-mono opacity-80">{div.code}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Top Direct Module Navigation Pills */}
        <nav className="hidden 2xl:flex items-center space-x-1 pl-2 border-l border-[#8693AB]/40 text-xs font-sans">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) => `px-3 py-1.5 rounded-lg transition-all active:scale-95 cursor-pointer ${
              isActive 
                ? 'bg-[#8693AB] text-[#212227] font-black shadow-sm' 
                : 'text-[#AAB9CF] hover:text-white hover:bg-[#8693AB]/20 font-bold'
            }`}
          >
            Cockpit
          </NavLink>
          <NavLink
            to="/admin/management"
            className={({ isActive }) => `px-3 py-1.5 rounded-lg transition-all active:scale-95 cursor-pointer ${
              isActive 
                ? 'bg-[#8693AB] text-[#212227] font-black shadow-sm' 
                : 'text-[#AAB9CF] hover:text-white hover:bg-[#8693AB]/20 font-bold'
            }`}
          >
            Management
          </NavLink>
          <NavLink
            to="/admin/vehicles"
            className={({ isActive }) => `px-3 py-1.5 rounded-lg transition-all active:scale-95 cursor-pointer ${
              isActive 
                ? 'bg-[#8693AB] text-[#212227] font-black shadow-sm' 
                : 'text-[#AAB9CF] hover:text-white hover:bg-[#8693AB]/20 font-bold'
            }`}
          >
            Fleet
          </NavLink>
          <NavLink
            to="/admin/drivers"
            className={({ isActive }) => `px-3 py-1.5 rounded-lg transition-all active:scale-95 cursor-pointer ${
              isActive 
                ? 'bg-[#8693AB] text-[#212227] font-black shadow-sm' 
                : 'text-[#AAB9CF] hover:text-white hover:bg-[#8693AB]/20 font-bold'
            }`}
          >
            Drivers
          </NavLink>
          <NavLink
            to="/admin/routes"
            className={({ isActive }) => `px-3 py-1.5 rounded-lg transition-all active:scale-95 cursor-pointer ${
              isActive 
                ? 'bg-[#8693AB] text-[#212227] font-black shadow-sm' 
                : 'text-[#AAB9CF] hover:text-white hover:bg-[#8693AB]/20 font-bold'
            }`}
          >
            Routes
          </NavLink>
        </nav>

      </div>

      {/* CENTER: Real-Time Simulation / Dispatch Controller */}
      <div className="flex items-center space-x-2.5 sm:space-x-3 bg-[#AAB9CF] text-[#212227] border-2 border-[#8693AB] rounded-2xl px-3 py-1.5 shadow-sm">
        {/* Play/Pause Button */}
        <button
          onClick={onToggleSimulating}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer ${
            isSimulating 
              ? 'bg-[#212227] text-amber-300 hover:bg-[#2e3037]' 
              : 'bg-[#212227] text-emerald-300 hover:bg-[#2e3037]'
          }`}
          title={isSimulating ? "Pause Simulation Clock" : "Start Live Simulation Clock"}
        >
          {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span className="text-[11px] font-mono">{isSimulating ? 'PAUSE' : 'LIVE'}</span>
        </button>

        {/* Continuous Time Scrubber */}
        <div className="hidden xl:flex items-center space-x-2 w-40 2xl:w-48">
          <span className="text-[10px] font-mono text-[#212227] font-bold">06:00</span>
          <div className="flex-1 h-2 bg-[#212227]/30 rounded-full overflow-hidden relative">
            <div 
              className="h-full bg-[#212227] transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
            <div 
              className="w-3 h-3 rounded-full bg-[#212227] absolute top-1/2 -translate-y-1/2 -translate-x-1/2 shadow-sm"
              style={{ left: `${progressPct}%` }}
            />
          </div>
          <span className="text-[10px] font-mono text-[#212227] font-bold">22:00</span>
        </div>

        {/* Speed Toggles */}
        <div className="flex items-center space-x-0.5 bg-[#212227] p-0.5 rounded-lg">
          {[1, 2, 5].map((speed) => (
            <button
              key={speed}
              onClick={() => onChangeSimSpeed(speed)}
              className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold transition-all active:scale-95 cursor-pointer ${
                simSpeed === speed
                  ? 'bg-[#8693AB] text-[#212227] shadow-xs'
                  : 'text-[#AAB9CF] hover:text-white'
              }`}
            >
              {speed}x
            </button>
          ))}
        </div>

        {/* Current Dispatch Time Display */}
        <div className="flex items-center space-x-1.5 pl-1 font-mono text-xs">
          <Clock className="w-3.5 h-3.5 text-[#212227] hidden sm:inline" />
          <span className="font-bold tabular-nums tracking-wider text-[#212227]">
            {formatFullTime(simulationTimeSeconds)}
          </span>
        </div>

        {/* Reset Clock Button */}
        <button
          onClick={onResetSimulation}
          title="Reset clock to 08:30:15 IST"
          className="text-[#212227] hover:text-black p-1.5 rounded-lg hover:bg-[#8693AB]/40 transition active:scale-90 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* RIGHT: Search, Compliance & Status */}
      <div className="flex items-center space-x-2 sm:space-x-2.5">
        
        {/* Global Search Control - Fully functional & always visible */}
        <button
          onClick={onOpenSearch}
          className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[#8693AB] hover:bg-[#96A3BC] border border-[#BAC8DB] text-xs text-[#212227] font-bold transition-all shadow-sm active:scale-95 cursor-pointer group"
          title="Open Search & Command Palette (Ctrl + K)"
        >
          <Search className="w-3.5 h-3.5 text-[#212227]" />
          <span className="hidden sm:inline text-[#212227]">Search</span>
          <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#212227] text-[#AAB9CF] font-bold">Ctrl K</kbd>
        </button>

        {/* Dynamic Compliance Chip */}
        {activeConflictsCount > 0 ? (
          <button
            onClick={onOpenConflicts}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white transition text-xs font-mono font-bold animate-pulse shadow-sm active:scale-95 cursor-pointer shrink-0"
            title={`${activeConflictsCount} active operational conflicts - Click to resolve`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-white" />
            <span>▲ {activeConflictsCount} CONFLICTS</span>
          </button>
        ) : (
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-mono font-bold shadow-sm shrink-0">
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            <span>● COMPLIANT</span>
          </div>
        )}

        {/* Alert Drawer Trigger */}
        <button
          onClick={onOpenAlerts}
          className="p-2 rounded-xl bg-[#8693AB] hover:bg-[#96A3BC] text-[#212227] transition relative shrink-0 shadow-sm active:scale-95 cursor-pointer"
          title="Open Operational Alerts Drawer"
        >
          <Bell className="w-4 h-4 text-[#212227]" />
          {alertCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-mono font-bold flex items-center justify-center">
              {alertCount}
            </span>
          )}
        </button>

        {/* User Profile Menu */}
        <div className="relative shrink-0">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center space-x-1.5 p-1.5 rounded-xl bg-[#8693AB] hover:bg-[#96A3BC] transition shadow-sm active:scale-95 cursor-pointer"
          >
            <div className="w-6 h-6 rounded-lg bg-[#212227] text-[#AAB9CF] font-black text-xs flex items-center justify-center">
              D
            </div>
            <ChevronDown className="w-3 h-3 text-[#212227]" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-1.5 w-48 rounded-xl bg-[#212227] border-2 border-[#8693AB] shadow-2xl py-1.5 z-50 text-xs text-[#E2E8F0] animate-in fade-in zoom-in-95">
              <div className="px-3 py-1.5 border-b border-[#8693AB]/40">
                <div className="font-semibold text-white">Chief Dispatcher</div>
                <div className="text-[10px] font-mono text-[#AAB9CF]">ID: DISP-DELHI-04</div>
              </div>
              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  onShowToast('Dispatcher Profile: Active Shift Duty (Shift A)');
                }}
                className="w-full text-left px-3 py-2 hover:bg-[#8693AB]/20 flex items-center space-x-2 cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-[#AAB9CF]" />
                <span>Dispatcher Profile</span>
              </button>
              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  onShowToast('Preferences: Audio Alerts Enabled, Dark Control Room');
                }}
                className="w-full text-left px-3 py-2 hover:bg-[#8693AB]/20 flex items-center space-x-2 cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5 text-[#AAB9CF]" />
                <span>Preferences</span>
              </button>
              <div className="border-t border-[#8693AB]/40 my-1" />
              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  onShowToast('Simulated Sign Out: Session saved to local store.');
                }}
                className="w-full text-left px-3 py-2 hover:bg-rose-500/20 text-rose-400 flex items-center space-x-2 cursor-pointer"
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
