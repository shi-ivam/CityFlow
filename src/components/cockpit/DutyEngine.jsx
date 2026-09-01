import React, { useState } from 'react';
import { 
  Lock, 
  Unlock, 
  ArrowLeftRight, 
  Coffee, 
  Footprints, 
  AlertTriangle, 
  ShieldCheck, 
  Sparkles, 
  Users, 
  Bus, 
  Clock, 
  Check, 
  X, 
  ChevronRight,
  ShieldAlert,
  Zap,
  Calendar,
  Layers
} from 'lucide-react';

export default function DutyEngine({
  duties = [],
  buses = [],
  drivers = [],
  routes = [],
  conflicts = [],
  simulationTimeSeconds = 8 * 3600 + 30 * 60 + 15,
  activeTab = 'gantt',
  onTabChange,
  selectedDuty,
  onSelectDuty,
  onHoverDuty,
  onAssignStandbyCrew,
  onTriggerOvertimeProtocol,
  onSplitShiftFallback,
  onAdjustDeparture,
  onRerouteVariant,
  onReassignDriver,
  onSwapBus,
  onToggleLockDuty,
  onRescheduleDuty,
  onShowToast
}) {
  const [viewMode, setViewMode] = useState('bus'); // 'bus' | 'driver'
  const [selectedConflictDetail, setSelectedConflictDetail] = useState(null);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [rescheduleStart, setRescheduleStart] = useState('06:00');
  const [rescheduleEnd, setRescheduleEnd] = useState('10:30');
  const [isDriverPickerOpen, setIsDriverPickerOpen] = useState(false);
  const [isBusPickerOpen, setIsBusPickerOpen] = useState(false);

  // Timeline bounds: 06:00 to 22:00 (16 hours total)
  const timelineStartHour = 6;
  const timelineEndHour = 22;
  const totalHours = timelineEndHour - timelineStartHour;

  const hoursArray = [];
  for (let h = timelineStartHour; h <= timelineEndHour; h += 2) {
    hoursArray.push(`${String(h).padStart(2, '0')}:00`);
  }

  // Convert "HH:MM" to percent of timeline
  const timeToPercent = (timeStr) => {
    if (!timeStr) return 0;
    const [hh, mm] = timeStr.split(':').map(Number);
    const hourVal = hh + mm / 60;
    const pct = ((hourVal - timelineStartHour) / totalHours) * 100;
    return Math.max(0, Math.min(100, pct));
  };

  // Current simulation time percent
  const simHours = simulationTimeSeconds / 3600;
  const nowPercent = Math.max(0, Math.min(100, ((simHours - timelineStartHour) / totalHours) * 100));

  const activeConflicts = conflicts.filter(c => c.status === 'ACTIVE');
  const resolvedConflicts = conflicts.filter(c => c.status === 'RESOLVED');

  return (
    <div className="flex flex-col h-full bg-[#18191D] border-l border-[#2B2D35] overflow-hidden select-none font-sans text-[#F1F5F9]">
      
      {/* Top Header: Tabs & Mode Toggles */}
      <div className="h-12 px-4 bg-[#212227] border-b border-[#2B2D35] flex items-center justify-between shrink-0">
        
        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => onTabChange('gantt')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'gantt'
                ? 'bg-[#AAB9CF] text-[#18191D] shadow-xs'
                : 'text-[#AAB9CF] hover:text-white hover:bg-[#282A31]'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>GANTT</span>
          </button>

          <button
            onClick={() => onTabChange('conflicts')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition relative ${
              activeTab === 'conflicts'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-[#AAB9CF] hover:text-white hover:bg-[#282A31]'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>CONFLICTS</span>
            {activeConflicts.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[9px] font-mono font-bold">
                {activeConflicts.length}
              </span>
            )}
          </button>
        </div>

        {/* View Mode Toggle: Bus vs Driver (Visible in Gantt tab) */}
        {activeTab === 'gantt' && (
          <div className="flex items-center space-x-1 bg-[#18191D] p-0.5 rounded-lg border border-[#2B2D35] text-xs">
            <button
              onClick={() => setViewMode('bus')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-mono transition ${
                viewMode === 'bus'
                  ? 'bg-[#212227] text-[#F1F5F9] font-bold border border-[#32353E] shadow-xs'
                  : 'text-[#8E9BAE] hover:text-white'
              }`}
            >
              <Bus className="w-3 h-3 text-[#AAB9CF]" />
              <span>Bus View</span>
            </button>
            <button
              onClick={() => setViewMode('driver')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-mono transition ${
                viewMode === 'driver'
                  ? 'bg-[#212227] text-[#F1F5F9] font-bold border border-[#32353E] shadow-xs'
                  : 'text-[#8E9BAE] hover:text-white'
              }`}
            >
              <Users className="w-3 h-3 text-[#AAB9CF]" />
              <span>Driver View</span>
            </button>
          </div>
        )}
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 relative">
        
        {/* TAB 1: GANTT SCHEDULE */}
        {activeTab === 'gantt' && (
          <div className="p-3 space-y-3">
            
            {/* Legend Strip */}
            <div className="flex items-center justify-between text-[10px] font-mono text-[#AAB9CF] px-1 border-b border-[#2B2D35] pb-2">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded bg-[#2B3C56] border border-[#AAB9CF] inline-block" />
                  <span>Linked Duty</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded bg-amber-500/30 border border-amber-500 inline-block" />
                  <span>Unlinked Duty</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded bg-[#2A2C34] border border-[#3B3E49] inline-block" />
                  <span>Mandatory Rest</span>
                </div>
              </div>
              <div className="text-[#AAB9CF] font-bold">
                NOW: {Math.floor(simulationTimeSeconds / 3600)}:{String(Math.floor((simulationTimeSeconds % 3600) / 60)).padStart(2, '0')}
              </div>
            </div>

            {/* Timeline Header Ruler */}
            <div className="relative h-6 bg-[#AAB9CF] rounded border border-[#BAC8DB] flex items-center text-[10px] font-mono text-[#212227] px-20 shadow-xs">
              <div className="absolute left-2 text-[10px] text-[#212227] font-bold">
                {viewMode === 'bus' ? 'FLEET' : 'CREW'}
              </div>
              <div className="flex-1 flex justify-between relative pl-4 font-bold">
                {hoursArray.map((hr) => (
                  <span key={hr}>{hr}</span>
                ))}
              </div>
            </div>

            {/* Timeline Rows */}
            <div className="space-y-2">
              {viewMode === 'bus' ? (
                // BUS ROWS
                buses.slice(0, 7).map((bus) => {
                  const busDuties = duties.filter(d => d.busId === bus.id);
                  const isConflictBus = conflicts.some(c => c.status === 'ACTIVE' && c.affectedBusId === bus.id);

                  return (
                    <div
                      key={bus.id}
                      className={`relative h-11 bg-[#212227] rounded-lg border flex items-center p-1 transition-all ${
                        isConflictBus 
                          ? 'border-rose-500/50 bg-rose-950/20' 
                          : 'border-[#32353E] hover:border-[#AAB9CF]/50'
                      }`}
                    >
                      {/* Row Label */}
                      <div className="w-20 shrink-0 px-2 font-mono text-xs flex flex-col justify-center">
                        <span className="font-bold text-[#F1F5F9] flex items-center gap-1">
                          {bus.id}
                          {isConflictBus && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />}
                        </span>
                        <span className="text-[9px] text-[#AAB9CF]">{bus.model.split(' ')[0]}</span>
                      </div>

                      {/* Timeline Track */}
                      <div className="flex-1 h-full relative border-l border-[#32353E] pl-1 overflow-hidden">
                        {/* Now Scrubber Line */}
                        <div
                          className="absolute top-0 bottom-0 w-0.5 bg-emerald-400 z-20 pointer-events-none"
                          style={{ left: `${nowPercent}%` }}
                        />

                        {/* Duty Blocks */}
                        {busDuties.map((duty) => {
                          const leftPct = timeToPercent(duty.startTime);
                          const rightPct = timeToPercent(duty.endTime);
                          const widthPct = Math.max(3, rightPct - leftPct);
                          const isSelected = selectedDuty && selectedDuty.id === duty.id;
                          const hasConflict = conflicts.some(c => c.status === 'ACTIVE' && c.affectedDutyId === duty.id);

                          return (
                            <div
                              key={duty.id}
                              onClick={() => onSelectDuty(duty)}
                              onMouseEnter={() => onHoverDuty(duty.id)}
                              onMouseLeave={() => onHoverDuty(null)}
                              style={{
                                left: `${leftPct}%`,
                                width: `${widthPct}%`
                              }}
                              className={`absolute top-1 bottom-1 rounded-md px-1.5 flex items-center justify-between text-[10px] font-mono cursor-pointer transition-all shadow-sm overflow-hidden ${
                                duty.type === 'LINKED'
                                  ? (hasConflict 
                                      ? 'bg-rose-600 text-white border border-rose-400 animate-pulse' 
                                      : 'bg-[#AAB9CF] text-[#212227] font-bold border border-[#BAC8DB]')
                                  : 'bg-amber-400 text-amber-950 font-bold border border-amber-300'
                              } ${isSelected ? 'ring-2 ring-white z-30 scale-y-105' : 'hover:brightness-110'}`}
                              title={`${duty.id} | Driver: ${duty.driverId} | ${duty.startTime} - ${duty.endTime}`}
                            >
                              <div className="truncate flex items-center space-x-1">
                                {duty.isLocked ? <Lock className="w-2.5 h-2.5 shrink-0 text-[#212227]" /> : <Unlock className="w-2.5 h-2.5 shrink-0 text-amber-900" />}
                                <span className="font-bold truncate text-[#212227]">{duty.dutyCode}</span>
                                <span className="text-[9px] text-[#212227]/80 truncate hidden sm:inline">{duty.driverId}</span>
                              </div>
                              <span className="text-[9px] font-bold shrink-0 text-[#212227] hidden md:inline">{duty.startTime}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              ) : (
                // DRIVER ROWS
                drivers.map((driver) => {
                  const driverDuties = duties.filter(d => d.driverId === driver.id);
                  const isConflictDriver = conflicts.some(c => c.status === 'ACTIVE' && c.driverId === driver.id);

                  return (
                    <div
                      key={driver.id}
                      className={`relative h-11 bg-[#212227] rounded-lg border flex items-center p-1 transition-all ${
                        isConflictDriver 
                          ? 'border-rose-500/50 bg-rose-950/20' 
                          : 'border-[#32353E] hover:border-[#AAB9CF]/50'
                      }`}
                    >
                      {/* Row Label */}
                      <div className="w-20 shrink-0 px-2 font-mono text-xs flex flex-col">
                        <span className="font-bold text-[#F1F5F9] truncate flex items-center gap-1">
                          {driver.id}
                          {isConflictDriver && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />}
                        </span>
                        <span className="text-[9px] text-[#8E9BAE]">{driver.status}</span>
                      </div>

                      {/* Timeline Track */}
                      <div className="flex-1 h-full relative border-l border-[#2B2D35] pl-1 overflow-hidden">
                        {/* Now Scrubber Line */}
                        <div
                          className="absolute top-0 bottom-0 w-0.5 bg-emerald-400 z-20 pointer-events-none"
                          style={{ left: `${nowPercent}%` }}
                        />

                        {driverDuties.map((duty) => {
                          const leftPct = timeToPercent(duty.startTime);
                          const rightPct = timeToPercent(duty.endTime);
                          const widthPct = Math.max(3, rightPct - leftPct);
                          const isSelected = selectedDuty && selectedDuty.id === duty.id;
                          const hasConflict = conflicts.some(c => c.status === 'ACTIVE' && c.affectedDutyId === duty.id);

                          return (
                            <div
                              key={duty.id}
                              onClick={() => onSelectDuty(duty)}
                              onMouseEnter={() => onHoverDuty(duty.id)}
                              onMouseLeave={() => onHoverDuty(null)}
                              style={{
                                left: `${leftPct}%`,
                                width: `${widthPct}%`
                              }}
                              className={`absolute top-1 bottom-1 rounded-md px-1.5 flex items-center justify-between text-[10px] font-mono cursor-pointer transition-all shadow-sm overflow-hidden ${
                                hasConflict 
                                  ? 'bg-rose-600 text-white border border-rose-400 animate-pulse' 
                                  : 'bg-[#AAB9CF] text-[#212227] font-bold border border-[#BAC8DB]'
                              } ${isSelected ? 'ring-2 ring-white z-30 scale-y-105' : 'hover:brightness-110'}`}
                            >
                              <div className="truncate flex items-center space-x-1">
                                {duty.isLocked ? <Lock className="w-2.5 h-2.5 shrink-0 text-[#212227]" /> : <Unlock className="w-2.5 h-2.5 shrink-0 text-amber-900" />}
                                <span className="font-bold truncate text-[#212227]">{duty.busId}</span>
                                <span className="text-[9px] text-[#212227]/80 truncate hidden sm:inline">{duty.routeId}</span>
                              </div>
                              <span className="text-[9px] font-bold shrink-0 text-[#212227]">{duty.startTime}</span>
                            </div>
                          );
                        })}

                        {/* If Driver is on break, show Mandatory Rest Block */}
                        {driver.status === 'BREAK' && (
                          <div
                            style={{ left: `${timeToPercent('08:00')}%`, width: '12%' }}
                            className="absolute top-1 bottom-1 rounded-md px-1.5 flex items-center justify-center space-x-1 text-[10px] font-mono bg-slate-700/80 text-slate-300 border border-slate-500/50"
                          >
                            <Coffee className="w-2.5 h-2.5 text-amber-400" />
                            <span>REST 45m</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Selected Duty Details Inspector Panel */}
            {selectedDuty && (
              <div className="mt-4 p-3.5 rounded-xl bg-[#0b0f19] border border-indigo-500/40 shadow-2xl space-y-3 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center justify-between border-b border-[#1f2937] pb-2">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono font-bold text-xs">
                      {selectedDuty.dutyCode}
                    </span>
                    <span className="text-xs font-semibold text-white">Duty Assignment Inspector</span>
                  </div>
                  <button
                    onClick={() => onSelectDuty(null)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
                  <div className="p-2 rounded bg-[#111827] border border-[#1f2937]">
                    <span className="text-[10px] text-slate-400 block">Assigned Bus</span>
                    <span className="font-bold text-emerald-400">{selectedDuty.busId}</span>
                  </div>
                  <div className="p-2 rounded bg-[#111827] border border-[#1f2937]">
                    <span className="text-[10px] text-slate-400 block">Driver</span>
                    <span className="font-bold text-cyan-400">{selectedDuty.driverId}</span>
                  </div>
                  <div className="p-2 rounded bg-[#111827] border border-[#1f2937]">
                    <span className="text-[10px] text-slate-400 block">Route</span>
                    <span className="font-bold text-amber-400">{selectedDuty.routeId}</span>
                  </div>
                  <div className="p-2 rounded bg-[#111827] border border-[#1f2937]">
                    <span className="text-[10px] text-slate-400 block">Shift Window</span>
                    <span className="font-bold text-white">{selectedDuty.startTime} – {selectedDuty.endTime}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-300 font-sans px-1">
                  <span>Relief Station: <strong className="text-white font-mono">{selectedDuty.nextReliefStop}</strong></span>
                  <span>Rest Mandate: <strong className="text-emerald-400 font-mono">{selectedDuty.restRequirementMinutes} min</strong></span>
                </div>

                {/* Duty Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#1f2937]">
                  <button
                    onClick={() => setIsDriverPickerOpen(!isDriverPickerOpen)}
                    className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition"
                  >
                    <Users className="w-3 h-3" />
                    <span>Reassign Driver</span>
                  </button>

                  <button
                    onClick={() => setIsBusPickerOpen(!isBusPickerOpen)}
                    className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-[#1a2333] hover:bg-[#232f45] border border-[#1f2937] text-white text-xs font-semibold transition"
                  >
                    <Bus className="w-3 h-3 text-emerald-400" />
                    <span>Swap Bus</span>
                  </button>

                  <button
                    onClick={() => onToggleLockDuty(selectedDuty.id)}
                    className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-[#1a2333] hover:bg-[#232f45] border border-[#1f2937] text-slate-300 text-xs font-semibold transition"
                  >
                    {selectedDuty.isLocked ? <Unlock className="w-3 h-3 text-amber-400" /> : <Lock className="w-3 h-3 text-indigo-400" />}
                    <span>{selectedDuty.isLocked ? 'Unlock Duty' : 'Lock Assignment'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setRescheduleStart(selectedDuty.startTime);
                      setRescheduleEnd(selectedDuty.endTime);
                      setIsRescheduleModalOpen(true);
                    }}
                    className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-[#1a2333] hover:bg-[#232f45] border border-[#1f2937] text-slate-300 text-xs font-semibold transition"
                  >
                    <Clock className="w-3 h-3 text-cyan-400" />
                    <span>Reschedule</span>
                  </button>
                </div>

                {/* Driver Picker Dropdown Modal */}
                {isDriverPickerOpen && (
                  <div className="p-3 rounded-lg bg-[#111827] border border-indigo-500/40 space-y-2 animate-in fade-in">
                    <div className="text-[11px] font-mono text-slate-400 font-bold uppercase">
                      Select Available Driver for {selectedDuty.dutyCode}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                      {drivers.map(d => (
                        <button
                          key={d.id}
                          onClick={() => {
                            onReassignDriver(selectedDuty.id, d.id);
                            setIsDriverPickerOpen(false);
                            onShowToast(`Reassigned ${selectedDuty.dutyCode} to driver ${d.name} (${d.id})`);
                          }}
                          className={`p-1.5 rounded text-left text-xs font-mono transition border ${
                            d.id === selectedDuty.driverId
                              ? 'bg-indigo-600 text-white border-indigo-400'
                              : 'bg-[#0b0f19] hover:bg-[#1a2333] text-slate-300 border-[#1f2937]'
                          }`}
                        >
                          <div className="font-bold truncate">{d.name}</div>
                          <div className="text-[10px] text-slate-400">{d.id} • {d.status}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bus Picker Dropdown Modal */}
                {isBusPickerOpen && (
                  <div className="p-3 rounded-lg bg-[#111827] border border-emerald-500/40 space-y-2 animate-in fade-in">
                    <div className="text-[11px] font-mono text-slate-400 font-bold uppercase">
                      Select Fleet Vehicle for {selectedDuty.dutyCode}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                      {buses.map(b => (
                        <button
                          key={b.id}
                          onClick={() => {
                            onSwapBus(selectedDuty.id, b.id);
                            setIsBusPickerOpen(false);
                            onShowToast(`Swapped bus to ${b.id} (${b.regNumber})`);
                          }}
                          className={`p-1.5 rounded text-left text-xs font-mono transition border ${
                            b.id === selectedDuty.busId
                              ? 'bg-emerald-600 text-white border-emerald-400'
                              : 'bg-[#0b0f19] hover:bg-[#1a2333] text-slate-300 border-[#1f2937]'
                          }`}
                        >
                          <div className="font-bold truncate">{b.id}</div>
                          <div className="text-[10px] text-slate-400">{b.regNumber} • {b.status}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}

          </div>
        )}

        {/* TAB 2: CONFLICT DECISION ENGINE (Sections 20, 21, 22, 23) */}
        {activeTab === 'conflicts' && (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-[#1f2937] pb-2">
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-500" />
                  Mission-Critical Operational Conflicts
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Automated constraint resolution engine. Select fallback actions below to update rosters and schedules.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 font-mono text-xs font-bold border border-rose-500/30">
                {activeConflicts.length} ACTIVE
              </span>
            </div>

            {/* Active Conflicts List */}
            {activeConflicts.length > 0 ? (
              <div className="space-y-3">
                {activeConflicts.map((conflict) => (
                  <div
                    key={conflict.id}
                    className={`rounded-xl border p-4 shadow-lg space-y-3 transition-all ${
                      conflict.severity === 'CRITICAL'
                        ? 'bg-[#261A1D] border-rose-500/40'
                        : 'bg-[#262017] border-amber-500/40'
                    }`}
                  >
                    {/* Conflict Card Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                          conflict.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        }`}>
                          {conflict.severity === 'CRITICAL' ? '🔴 CRITICAL' : '🟠 WARNING'}
                        </span>
                        <span className="font-mono font-bold text-xs text-[#F1F5F9]">{conflict.code}</span>
                        <span className="text-xs text-[#AAB9CF]">• Departure: <strong className="text-white font-mono">{conflict.departureTime}</strong></span>
                      </div>
                      <div className="text-xs font-mono text-[#AAB9CF]">
                        Bus: <strong className="text-white">{conflict.affectedBusId}</strong>
                      </div>
                    </div>

                    {/* Conflict Description & Affected Context */}
                    <div className="space-y-1 text-xs">
                      <div className="font-semibold text-[#F1F5F9]">{conflict.issue}</div>
                      <div className="text-[#AAB9CF] text-[11px]">{conflict.impact}</div>
                      <div className="text-[#AAB9CF] font-mono text-[11px] pt-1">
                        Driver: <strong className="text-white">{conflict.driverName} ({conflict.driverId})</strong>
                      </div>
                    </div>

                    {/* Recommendation Banner */}
                    <div className="p-2.5 rounded-lg bg-[#18191D] border border-[#32353E] text-xs flex items-center justify-between">
                      <span className="text-[#AAB9CF]">Recommended Fallback:</span>
                      <span className="font-bold text-emerald-400">{conflict.recommendation}</span>
                    </div>

                    {/* FALLBACK ACTIONS THAT ACTUALLY WORK (Section 21) */}
                    <div className="pt-2 border-t border-[#32353E] flex flex-wrap gap-2">
                      {conflict.id === 'CF-204' && (
                        <>
                          <button
                            onClick={() => onAssignStandbyCrew(conflict.id, 'SHARMA-18', conflict.affectedDutyId)}
                            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition shadow-xs active:scale-95"
                          >
                            <Users className="w-3.5 h-3.5" />
                            <span>Assign Standby Crew</span>
                          </button>

                          <button
                            onClick={() => onTriggerOvertimeProtocol(conflict.id, conflict.driverId, conflict.affectedDutyId)}
                            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-mono text-xs font-bold transition shadow-xs active:scale-95"
                          >
                            <Zap className="w-3.5 h-3.5" />
                            <span>Overtime Protocol</span>
                          </button>

                          <button
                            onClick={() => onSplitShiftFallback(conflict.id, conflict.affectedDutyId)}
                            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#2B3C56] hover:bg-[#364B6B] text-[#F1F5F9] border border-[#AAB9CF]/50 font-mono text-xs font-bold transition shadow-xs active:scale-95"
                          >
                            <Footprints className="w-3.5 h-3.5" />
                            <span>Split-Shift Fallback</span>
                          </button>
                        </>
                      )}

                      {conflict.id === 'CF-109' && (
                        <>
                          <button
                            onClick={() => onAdjustDeparture(conflict.id, conflict.affectedDutyId, 8)}
                            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold transition shadow-md active:scale-95"
                          >
                            <Clock className="w-3.5 h-3.5" />
                            <span>Adjust Departure +8 min</span>
                          </button>

                          <button
                            onClick={() => onRerouteVariant(conflict.id, 'R17')}
                            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition shadow-md active:scale-95"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Reroute Variant</span>
                          </button>
                        </>
                      )}
                    </div>

                  </div>
                ))}
              </div>
            ) : (
              /* All Resolved State (Section 30) */
              <div className="p-8 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-sm text-white">NO ACTIVE CONFLICTS</h4>
                <p className="text-xs text-emerald-300/80 max-w-sm mx-auto">
                  All current departures have compliant crew coverage and nominal corridor headway separation.
                </p>
              </div>
            )}

            {/* Resolved Conflicts Archive */}
            {resolvedConflicts.length > 0 && (
              <div className="mt-6 space-y-2 pt-4 border-t border-[#1f2937]">
                <div className="text-xs font-mono text-slate-400 uppercase font-bold tracking-wider">
                  Resolved Conflicts Log ({resolvedConflicts.length})
                </div>
                <div className="space-y-2">
                  {resolvedConflicts.map(rc => (
                    <div
                      key={rc.id}
                      className="p-3 rounded-lg bg-[#0b0f19] border border-emerald-500/30 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold">
                          RESOLVED
                        </span>
                        <span className="font-mono text-slate-300">{rc.code}: {rc.issue.split('.')[0]}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">{rc.resolvedAt || '08:30 IST'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

      </div>

      {/* Reschedule Duty Modal (Section 19) */}
      {isRescheduleModalOpen && selectedDuty && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#111827] border border-[#1f2937] rounded-xl shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in-95 font-sans">
            <div className="flex items-center justify-between border-b border-[#1f2937] pb-3">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-sm text-white">Reschedule {selectedDuty.dutyCode}</h3>
              </div>
              <button
                onClick={() => setIsRescheduleModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Start Time (HH:MM)</label>
                <input
                  type="text"
                  value={rescheduleStart}
                  onChange={(e) => setRescheduleStart(e.target.value)}
                  className="w-full bg-[#0b0f19] border border-[#1f2937] rounded-lg px-3 py-2 text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">End Time (HH:MM)</label>
                <input
                  type="text"
                  value={rescheduleEnd}
                  onChange={(e) => setRescheduleEnd(e.target.value)}
                  className="w-full bg-[#0b0f19] border border-[#1f2937] rounded-lg px-3 py-2 text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div className="p-2.5 rounded bg-indigo-950/20 border border-indigo-500/30 text-slate-300 text-[11px] font-sans">
                Rescheduling will automatically recalculate continuous driving rest requirements and corridor overlap.
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-[#1f2937]">
              <button
                onClick={() => setIsRescheduleModalOpen(false)}
                className="px-3 py-1.5 rounded-lg bg-[#1f2937] text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onRescheduleDuty(selectedDuty.id, rescheduleStart, rescheduleEnd);
                  setIsRescheduleModalOpen(false);
                  onShowToast(`Rescheduled ${selectedDuty.dutyCode} to ${rescheduleStart} – ${rescheduleEnd}`);
                }}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md"
              >
                Apply Schedule Change
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
