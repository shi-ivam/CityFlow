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
    <header className="h-16 bg-[#212227] border-b border-[#32353E] px-3 sm:px-5 flex items-center justify-between z-30 shrink-0 sticky top-0 font-sans select-none text-[#F1F5F9]">
      
      {/* LEFT: Branding, Modules Toggle & Division Switcher */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        
        {/* Module Sidebar Drawer Toggle */}
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-[#AAB9CF] hover:bg-[#B9C7DA] text-[#212227] font-bold transition shadow-xs shrink-0"
            title="Open Module Navigation Drawer"
          >
            <Menu className="w-4 h-4 text-[#212227]" />
            <span className="hidden xl:inline text-[11px] font-bold">Modules</span>
          </button>
        )}

        {/* Brand Logo */}
        <div className="flex items-center space-x-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-[#AAB9CF] text-[#212227] flex items-center justify-center font-mono font-bold text-xs shadow-sm">
            CF
          </div>
          <div className="hidden sm:flex flex-col min-w-0">
            <div className="text-[13px] font-bold tracking-tight text-[#F1F5F9] flex items-center gap-1.5 leading-none">
              CITYFLOW <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#AAB9CF] text-[#212227] font-mono font-bold">PRO</span>
            </div>
            <span className="text-[9px] font-mono tracking-wider text-[#AAB9CF] uppercase mt-0.5 truncate">
              Transit Operations
            </span>
          </div>
        </div>

        <div className="h-6 w-px bg-[#32353E] hidden sm:block" />

        {/* Division Switcher Dropdown */}
        <div className="relative shrink-0">
          <button
            onClick={() => setIsDivisionOpen(!isDivisionOpen)}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-[#AAB9CF] hover:bg-[#B9C7DA] text-xs text-[#212227] font-bold transition-colors shadow-xs"
          >
            <Layers className="w-3.5 h-3.5 text-[#212227]" />
            <span className="truncate max-w-[130px] sm:max-w-none">{currentDivObj.name}</span>
            <ChevronDown className={`w-3 h-3 text-[#212227] transition-transform ${isDivisionOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDivisionOpen && (
            <div className="absolute left-0 mt-1.5 w-56 rounded-lg bg-[#212227] border border-[#32353E] shadow-2xl py-1 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-1.5 text-[10px] font-mono uppercase text-[#AAB9CF] font-semibold tracking-wider border-b border-[#32353E]">
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
                      ? 'bg-[#AAB9CF] text-[#212227] font-bold'
                      : 'text-[#E2E8F0] hover:bg-[#282A31]'
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
        <nav className="hidden 2xl:flex items-center space-x-1 pl-2 border-l border-[#32353E] text-xs font-sans">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) => `px-2.5 py-1 rounded-md transition ${
              isActive 
                ? 'bg-[#AAB9CF] text-[#212227] font-bold shadow-xs' 
                : 'text-[#AAB9CF] hover:text-white hover:bg-[#282A31]'
            }`}
          >
            Cockpit
          </NavLink>
          <NavLink
            to="/admin/management"
            className={({ isActive }) => `px-2.5 py-1 rounded-md transition ${
              isActive 
                ? 'bg-[#AAB9CF] text-[#212227] font-bold shadow-xs' 
                : 'text-[#AAB9CF] hover:text-white hover:bg-[#282A31]'
            }`}
          >
            Management
          </NavLink>
          <NavLink
            to="/admin/vehicles"
            className={({ isActive }) => `px-2.5 py-1 rounded-md transition ${
              isActive 
                ? 'bg-[#AAB9CF] text-[#212227] font-bold shadow-xs' 
                : 'text-[#AAB9CF] hover:text-white hover:bg-[#282A31]'
            }`}
          >
            Fleet
          </NavLink>
          <NavLink
            to="/admin/drivers"
            className={({ isActive }) => `px-2.5 py-1 rounded-md transition ${
              isActive 
                ? 'bg-[#AAB9CF] text-[#212227] font-bold shadow-xs' 
                : 'text-[#AAB9CF] hover:text-white hover:bg-[#282A31]'
            }`}
          >
            Drivers
          </NavLink>
          <NavLink
            to="/admin/routes"
            className={({ isActive }) => `px-2.5 py-1 rounded-md transition ${
              isActive 
                ? 'bg-[#AAB9CF] text-[#212227] font-bold shadow-xs' 
                : 'text-[#AAB9CF] hover:text-white hover:bg-[#282A31]'
            }`}
          >
            Routes
          </NavLink>
        </nav>

      </div>

      {/* CENTER: Real-Time Simulation / Dispatch Controller (Solid AAB9CF Surface) */}
      <div className="flex items-center space-x-2.5 sm:space-x-3 bg-[#AAB9CF] text-[#212227] border border-[#BAC8DB] rounded-xl px-3 py-1.5 shadow-sm">
        {/* Play/Pause Button */}
        <button
          onClick={onToggleSimulating}
          className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-bold transition shadow-xs ${
            isSimulating 
              ? 'bg-[#212227] text-amber-300 hover:bg-[#2a2c33]' 
              : 'bg-[#212227] text-emerald-300 hover:bg-[#2a2c33]'
          }`}
          title={isSimulating ? "Pause Simulation Clock" : "Start Live Simulation Clock"}
        >
          {isSimulating ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          <span className="text-[11px] font-mono">{isSimulating ? 'PAUSE' : 'LIVE'}</span>
        </button>

        {/* Continuous Time Scrubber */}
        <div className="hidden xl:flex items-center space-x-2 w-40 2xl:w-48">
          <span className="text-[10px] font-mono text-[#212227] font-bold">06:00</span>
          <div className="flex-1 h-1.5 bg-[#212227]/30 rounded-full overflow-hidden relative">
            <div 
              className="h-full bg-[#212227] transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
            <div 
              className="w-2.5 h-2.5 rounded-full bg-[#212227] absolute top-1/2 -translate-y-1/2 -translate-x-1/2 shadow-xs"
              style={{ left: `${progressPct}%` }}
            />
          </div>
          <span className="text-[10px] font-mono text-[#212227] font-bold">22:00</span>
        </div>

        {/* Speed Toggles */}
        <div className="flex items-center space-x-0.5 bg-[#212227] p-0.5 rounded-md">
          {[1, 2, 5].map((speed) => (
            <button
              key={speed}
              onClick={() => onChangeSimSpeed(speed)}
              className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition ${
                simSpeed === speed
                  ? 'bg-[#AAB9CF] text-[#212227] shadow-xs'
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
          className="text-[#212227] hover:opacity-75 p-1 rounded transition"
        >
          <RotateCcw className="w-3 h-3" />
        </button>
      </div>

      {/* RIGHT: Search, Compliance & Status */}
      <div className="flex items-center space-x-2 sm:space-x-2.5">
        
        {/* Global Search Control */}
        <button
          onClick={onOpenSearch}
          className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-[#AAB9CF] hover:bg-[#B9C7DA] border border-[#BAC8DB] text-xs text-[#212227] font-bold transition-colors group shadow-xs"
        >
          <Search className="w-3.5 h-3.5 text-[#212227]" />
          <span className="hidden lg:inline text-[#212227]">Search operations...</span>
          <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#212227] text-[#AAB9CF]">Ctrl K</kbd>
        </button>

        {/* Dynamic Compliance Chip */}
        {activeConflictsCount > 0 ? (
          <button
            onClick={onOpenConflicts}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-500/30 transition text-xs font-mono font-bold animate-pulse shadow-xs shrink-0"
            title={`${activeConflictsCount} active operational conflicts - Click to resolve`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-300" />
            <span>▲ {activeConflictsCount} CONFLICTS</span>
          </button>
        ) : (
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>● COMPLIANT</span>
          </div>
        )}

        {/* Alert Drawer Trigger */}
        <button
          onClick={onOpenAlerts}
          className="p-2 rounded-lg bg-[#AAB9CF] hover:bg-[#B9C7DA] text-[#212227] transition relative shrink-0 shadow-xs"
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
            className="flex items-center space-x-1.5 p-1.5 rounded-lg bg-[#AAB9CF] hover:bg-[#B9C7DA] transition shadow-xs"
          >
            <div className="w-6 h-6 rounded-md bg-[#212227] text-[#AAB9CF] font-bold text-xs flex items-center justify-center">
              D
            </div>
            <ChevronDown className="w-3 h-3 text-[#212227]" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-1.5 w-48 rounded-lg bg-[#212227] border border-[#32353E] shadow-2xl py-1.5 z-50 text-xs text-[#E2E8F0] animate-in fade-in zoom-in-95">
              <div className="px-3 py-1.5 border-b border-[#32353E]">
                <div className="font-semibold text-white">Chief Dispatcher</div>
                <div className="text-[10px] font-mono text-[#AAB9CF]">ID: DISP-DELHI-04</div>
              </div>
              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  onShowToast('Dispatcher Profile: Active Shift Duty (Shift A)');
                }}
                className="w-full text-left px-3 py-2 hover:bg-[#282A31] flex items-center space-x-2"
              >
                <User className="w-3.5 h-3.5 text-[#AAB9CF]" />
                <span>Dispatcher Profile</span>
              </button>
              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  onShowToast('Preferences: Audio Alerts Enabled, Dark Control Room');
                }}
                className="w-full text-left px-3 py-2 hover:bg-[#282A31] flex items-center space-x-2"
              >
                <Sliders className="w-3.5 h-3.5 text-[#AAB9CF]" />
                <span>Preferences</span>
              </button>
              <div className="border-t border-[#32353E] my-1" />
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
