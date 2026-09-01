import React, { useState } from 'react';
import { 
  Link2, 
  Unlink, 
  AlertTriangle, 
  ShieldAlert, 
  Clock, 
  User, 
  Bus, 
  CheckCircle2, 
  Sparkles, 
  Filter, 
  Search, 
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Zap,
  Info
} from 'lucide-react';
import { validateRestPeriod } from '../utils/dutyEngine';

// Timeline span: 05:00 to 24:00 (19 hours total = 1140 minutes)
const TIMELINE_START_HOUR = 5; // 05:00 AM
const TIMELINE_END_HOUR = 24;  // 12:00 Midnight
const TOTAL_MINUTES = (TIMELINE_END_HOUR - TIMELINE_START_HOUR) * 60; // 1140 minutes

export default function GanttTimeline({
  dutyAssignments,
  crewMembers,
  busFleet,
  routes,
  operationalTime,
  selectedDutyId,
  onSelectDuty,
  hoveredRouteId,
  onHoverRoute,
  onOpenFallbackModal,
  onOpenNewDutyModal
}) {
  const [filterType, setFilterType] = useState('ALL'); // 'ALL', 'LINKED', 'UNLINKED', 'CONFLICT', 'STANDBY'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDutyForDetails, setSelectedDutyForDetails] = useState(null);

  // Helper to convert ISO time string or "HH:MM" to minute offset from TIMELINE_START_HOUR
  const getMinuteOffset = (timeStr) => {
    if (!timeStr) return 0;
    let hours = 0;
    let mins = 0;

    if (timeStr.includes('T')) {
      const date = new Date(timeStr);
      hours = date.getUTCHours();
      mins = date.getUTCMinutes();
    } else if (timeStr.includes(':')) {
      const parts = timeStr.split(':');
      hours = parseInt(parts[0], 10);
      mins = parseInt(parts[1], 10);
    }

    const totalMinutes = (hours * 60) + mins;
    const startMinutes = TIMELINE_START_HOUR * 60;
    return Math.max(0, Math.min(TOTAL_MINUTES, totalMinutes - startMinutes));
  };

  // Convert minutes to percentage position on timeline
  const getPercentagePosition = (minuteOffset) => {
    return (minuteOffset / TOTAL_MINUTES) * 100;
  };

  // Filtered duties
  const filteredDuties = dutyAssignments.filter(duty => {
    if (filterType === 'LINKED' && duty.dutyType !== 'LINKED') return false;
    if (filterType === 'UNLINKED' && duty.dutyType !== 'UNLINKED') return false;
    if (filterType === 'CONFLICT' && !duty.status.includes('CONFLICT') && !duty.status.includes('VIOLATION')) return false;

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const crew = crewMembers.find(c => c.id === duty.crewId);
      const bus = busFleet.find(b => b.id === duty.busId);
      const matchDuty = duty.dutyCode.toLowerCase().includes(q);
      const matchCrew = crew?.fullName.toLowerCase().includes(q);
      const matchBus = bus?.busNumber.toLowerCase().includes(q);
      if (!matchDuty && !matchCrew && !matchBus) return false;
    }

    return true;
  });

  // Current operational time scrubber X position
  const currentScrubberPercent = getPercentagePosition(Math.max(0, operationalTime - (TIMELINE_START_HOUR * 60)));

  // Generate hour labels
  const hourMarks = [];
  for (let h = TIMELINE_START_HOUR; h <= TIMELINE_END_HOUR; h++) {
    const displayH = h === 24 ? '00:00' : `${String(h).padStart(2, '0')}:00`;
    hourMarks.push({ hour: h, label: displayH });
  }

  return (
    <div className="flex flex-col h-full bg-[#070b16] select-none overflow-hidden">
      
      {/* Gantt Control Toolbar */}
      <div className="p-3 bg-[#0a1020] border-b border-white/10 flex flex-wrap items-center justify-between gap-3 shrink-0">
        
        {/* Left: Filters & Badges */}
        <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
          <span className="text-[11px] font-mono text-slate-400 font-bold uppercase tracking-wider mr-1 hidden sm:inline">
            Duty Filter:
          </span>

          <button
            onClick={() => setFilterType('ALL')}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition ${
              filterType === 'ALL'
                ? 'bg-brand-600 text-white shadow'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            All Duties ({dutyAssignments.length})
          </button>

          <button
            onClick={() => setFilterType('LINKED')}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition ${
              filterType === 'LINKED'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-400 shadow-glow-sky'
                : 'bg-slate-900 text-slate-400 hover:text-sky-300 border border-white/5'
            }`}
          >
            <Link2 className="w-3.5 h-3.5 text-sky-400" />
            <span>Linked (Solid)</span>
          </button>

          <button
            onClick={() => setFilterType('UNLINKED')}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition ${
              filterType === 'UNLINKED'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-400 border-dashed shadow-glow-amber'
                : 'bg-slate-900 text-slate-400 hover:text-amber-300 border border-white/5'
            }`}
          >
            <Unlink className="w-3.5 h-3.5 text-amber-400" />
            <span>Unlinked (15m Hub)</span>
          </button>

          <button
            onClick={() => setFilterType('CONFLICT')}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition ${
              filterType === 'CONFLICT'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500 shadow-glow-rose'
                : 'bg-slate-900 text-rose-400/80 hover:text-rose-300 border border-rose-500/30'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>Rest Conflicts</span>
          </button>
        </div>

        {/* Right: Search & Action */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search driver, bus, code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900 border border-white/10 rounded-lg pl-8 pr-3 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 font-mono w-44 sm:w-56"
            />
          </div>

          <button
            onClick={onOpenFallbackModal}
            className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow transition"
            title="Interactive 3-Tier Fallback Solver"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-200" />
            <span>Fallback Solver</span>
          </button>
        </div>

      </div>

      {/* Gantt Header: Hour Scale Ruler */}
      <div className="bg-[#090e1c] border-b border-white/10 px-4 py-2 flex items-center shrink-0">
        
        {/* Driver / Shift Column Label */}
        <div className="w-56 sm:w-64 shrink-0 text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between pr-4">
          <span>Driver & Fleet Pairing</span>
          <span className="text-[10px] text-slate-500">Shift</span>
        </div>

        {/* 24-Hour Timeline Grid Axis */}
        <div className="flex-1 relative h-6 flex items-center font-mono text-[10px] text-slate-400">
          {hourMarks.map((mark, idx) => {
            const leftPct = (idx / (hourMarks.length - 1)) * 100;
            return (
              <div 
                key={idx} 
                className="absolute -translate-x-1/2 flex flex-col items-center"
                style={{ left: `${leftPct}%` }}
              >
                <span>{mark.label}</span>
                <span className="w-px h-1.5 bg-white/20 mt-0.5"></span>
              </div>
            );
          })}
        </div>

      </div>

      {/* Main Gantt Body: Duty Roster Rows */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-2.5 relative">
        
        {/* Real-time Vertical Time Scrubber Line */}
        {currentScrubberPercent >= 0 && currentScrubberPercent <= 100 && (
          <div 
            className="absolute top-0 bottom-0 z-20 pointer-events-none flex flex-col items-center"
            style={{ left: `calc(${currentScrubberPercent}% + 14rem)` }}
          >
            <div className="bg-brand-500 text-slate-950 text-[9px] font-mono font-extrabold px-1.5 py-0.5 rounded shadow-lg shadow-brand-500/50">
              NOW
            </div>
            <div className="w-0.5 h-full bg-gradient-to-b from-brand-400 via-sky-400 to-transparent shadow-[0_0_8px_#38bdf8]"></div>
          </div>
        )}

        {filteredDuties.length === 0 ? (
          <div className="p-8 text-center text-slate-400 font-mono text-xs">
            No duties match the selected filters.
          </div>
        ) : (
          filteredDuties.map(duty => {
            const crew = crewMembers.find(c => c.id === duty.crewId);
            const bus = busFleet.find(b => b.id === duty.busId);
            const route = routes.find(r => r.id === duty.routeId);

            const startOffset = getMinuteOffset(duty.startTime);
            const endOffset = getMinuteOffset(duty.endTime);
            const durationMinutes = Math.max(30, endOffset - startOffset);

            const leftPct = getPercentagePosition(startOffset);
            const widthPct = Math.min(100 - leftPct, getPercentagePosition(durationMinutes));

            const isLinked = duty.dutyType === 'LINKED';
            const isConflict = duty.status.includes('CONFLICT') || duty.status.includes('VIOLATION');
            const isSelected = selectedDutyId === duty.id;
            const isRouteHovered = hoveredRouteId === duty.routeId;

            // Rest compliance check
            const restCheck = crew?.lastShiftEnd 
              ? validateRestPeriod(crew.lastShiftEnd, duty.startTime, 11)
              : { isCompliant: true, actualRestFormatted: "11h+" };

            return (
              <div 
                key={duty.id}
                className={`flex items-center rounded-xl p-2 transition-all border ${
                  isSelected 
                    ? 'bg-slate-900/90 border-brand-400 shadow-xl' 
                    : isConflict
                    ? 'bg-rose-950/20 border-rose-500/40 hover:bg-rose-950/30'
                    : isRouteHovered
                    ? 'bg-slate-800/80 border-sky-400/60'
                    : 'bg-slate-900/60 border-white/5 hover:bg-slate-800/50'
                }`}
                onMouseEnter={() => onHoverRoute && onHoverRoute(duty.routeId)}
                onMouseLeave={() => onHoverRoute && onHoverRoute(null)}
              >
                
                {/* Left Card: Driver & Vehicle Metadata (w-56 sm:w-64) */}
                <div className="w-56 sm:w-64 shrink-0 pr-3 border-r border-white/10 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-mono font-bold ${
                        isConflict 
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500' 
                          : isLinked 
                          ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' 
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white truncate max-w-[130px]" title={crew?.fullName || "Unassigned"}>
                          {crew?.fullName || "Unassigned Driver"}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {crew?.badge} • {crew?.weeklyHoursUsed}h/wk
                        </div>
                      </div>
                    </div>

                    {/* Duty Type Pill */}
                    <div className="text-[10px] font-mono">
                      {isLinked ? (
                        <span className="px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-300 border border-sky-400/40 font-bold flex items-center space-x-1">
                          <Link2 className="w-2.5 h-2.5" />
                          <span>1:1</span>
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-400/40 border-dashed font-bold flex items-center space-x-1">
                          <Unlink className="w-2.5 h-2.5" />
                          <span>HUB</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Rest Compliance Indicator */}
                  <div className="mt-1.5 flex items-center justify-between text-[10px] font-mono">
                    <div className="flex items-center space-x-1">
                      {restCheck.isCompliant ? (
                        <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <AlertTriangle className="w-3 h-3 text-rose-400 animate-pulse" />
                      )}
                      <span className={restCheck.isCompliant ? "text-slate-400" : "text-rose-400 font-bold"}>
                        Rest: {restCheck.actualRestFormatted}
                      </span>
                    </div>

                    {bus && (
                      <span className="text-slate-300 bg-slate-800 px-1.5 py-0.2 rounded border border-white/5">
                        {bus.busNumber}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right Timeline Canvas: Duty Block Rendering */}
                <div className="flex-1 relative h-14 ml-3 flex items-center">
                  
                  {/* Background hour grid lines */}
                  <div className="absolute inset-0 flex justify-between pointer-events-none opacity-10">
                    {hourMarks.map((_, i) => (
                      <div key={i} className="w-px h-full bg-white"></div>
                    ))}
                  </div>

                  {/* Duty Block Element */}
                  <div
                    onClick={() => {
                      onSelectDuty && onSelectDuty(duty.id);
                      setSelectedDutyForDetails(duty);
                    }}
                    style={{ left: `${leftPct}%`, width: `${Math.max(12, widthPct)}%` }}
                    className={`absolute h-11 rounded-xl p-2 flex items-center justify-between cursor-pointer transition-all duration-200 ${
                      isConflict
                        ? 'bg-rose-950/85 border-2 border-rose-500 shadow-glow-rose ring-1 ring-rose-400 animate-pulse text-white'
                        : isLinked
                        ? 'bg-sky-950/75 border-2 border-sky-400 shadow-glow-sky text-sky-100 hover:bg-sky-900/80'
                        : 'bg-amber-950/75 border-2 border-dashed border-amber-400 shadow-glow-amber text-amber-100 hover:bg-amber-900/80'
                    }`}
                  >
                    
                    {/* Inner content */}
                    <div className="flex items-center space-x-2 truncate">
                      
                      {/* Status Icon */}
                      {isConflict ? (
                        <div className="w-5 h-5 rounded-full bg-rose-500 flex items-center justify-center shrink-0">
                          <AlertTriangle className="w-3 h-3 text-white" />
                        </div>
                      ) : isLinked ? (
                        <div className="w-5 h-5 rounded-full bg-sky-500 flex items-center justify-center shrink-0">
                          <Link2 className="w-3 h-3 text-white" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center shrink-0">
                          <Unlink className="w-3 h-3 text-white" />
                        </div>
                      )}

                      {/* Details text */}
                      <div className="truncate">
                        <div className="font-bold text-xs flex items-center space-x-1.5 truncate">
                          <span>{duty.dutyCode}</span>
                          {route && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/40 font-mono">
                              R-{route.code}
                            </span>
                          )}
                        </div>
                        
                        <div className="text-[9px] font-mono opacity-80 truncate">
                          {isConflict ? (
                            <span className="text-rose-200 font-bold">
                              Rest Deficit: {duty.conflictDetails?.deficitHours || 4.5}h (Violation)
                            </span>
                          ) : isLinked ? (
                            <span>Locked 1:1 ({bus?.busNumber})</span>
                          ) : (
                            <span>{duty.handoffHub} (15m Swap)</span>
                          )}
                        </div>
                      </div>

                    </div>

                    {/* Right side conflict solve button or duration */}
                    <div className="flex items-center space-x-1.5 shrink-0 pl-1">
                      {isConflict ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenFallbackModal();
                          }}
                          className="px-2 py-0.5 rounded bg-rose-500 hover:bg-rose-400 text-white font-bold text-[10px] font-mono shadow transition"
                        >
                          SOLVE
                        </button>
                      ) : !isLinked && duty.segments && duty.segments.length > 1 ? (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/30 text-amber-200 border border-amber-400/40">
                          15m Hub
                        </span>
                      ) : (
                        <span className="text-[9px] font-mono text-slate-300 hidden sm:inline">
                          {Math.round(durationMinutes / 60)}h
                        </span>
                      )}
                    </div>

                  </div>

                </div>

              </div>
            );
          })
        )}

      </div>

      {/* Bottom Legend & Standby Crew Indicator */}
      <div className="bg-[#090e1c] border-t border-white/10 p-2.5 px-4 flex flex-wrap items-center justify-between gap-2 shrink-0 font-mono text-[11px]">
        
        {/* Legend */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5">
            <span className="w-3.5 h-3.5 rounded bg-sky-950 border-2 border-sky-400"></span>
            <span className="text-slate-300 font-bold">Linked Duty (Solid 1:1 Bus Lock)</span>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="w-3.5 h-3.5 rounded bg-amber-950 border-2 border-dashed border-amber-400"></span>
            <span className="text-slate-300 font-bold">Unlinked Duty (15m Hub Transfer)</span>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="w-3.5 h-3.5 rounded bg-rose-950 border-2 border-rose-500 animate-pulse"></span>
            <span className="text-rose-300 font-bold">Rest Period Conflict (&lt;11h)</span>
          </div>
        </div>

        {/* Standby Pool Stat */}
        <div className="flex items-center space-x-2 text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Reserve Standby Pool: <strong className="text-emerald-400">3 Rested Drivers Available</strong></span>
        </div>

      </div>

      {/* Duty Inspector Slide-Over / Modal */}
      {selectedDutyForDetails && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0c1424] border border-white/15 rounded-2xl w-full max-w-lg p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${
                  selectedDutyForDetails.dutyType === 'LINKED' ? 'bg-sky-500/20 text-sky-400' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {selectedDutyForDetails.dutyType === 'LINKED' ? <Link2 className="w-4 h-4" /> : <Unlink className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{selectedDutyForDetails.dutyCode}</h3>
                  <p className="text-xs font-mono text-slate-400">{selectedDutyForDetails.dutyType} DUTY ASSIGNMENT</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedDutyForDetails(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white bg-slate-800"
              >
                &times;
              </button>
            </div>

            {/* Shift Segments Breakdown */}
            <div className="space-y-2 font-mono text-xs">
              <div className="text-slate-400 font-bold uppercase text-[10px]">Duty Shift Segments</div>
              
              {selectedDutyForDetails.segments ? (
                <div className="space-y-1.5">
                  {selectedDutyForDetails.segments.map((seg, i) => (
                    <div key={i} className={`p-2.5 rounded-xl border flex items-center justify-between ${
                      seg.type === 'HANDOFF_BUFFER'
                        ? 'bg-purple-950/30 border-purple-500/40 text-purple-300'
                        : 'bg-slate-800/80 border-white/5 text-slate-200'
                    }`}>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-bold">{seg.start} — {seg.end}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold">{seg.busNumber}</span>
                        {seg.hub && <div className="text-[10px] text-slate-400">{seg.hub}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-slate-800/80 border border-white/5">
                  Continuous 1:1 drive shift across assigned corridor.
                </div>
              )}
            </div>

            {/* Conflict Warning if present */}
            {selectedDutyForDetails.conflictDetails && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/50 space-y-1 text-xs font-mono text-rose-300">
                <div className="font-bold flex items-center space-x-1.5 text-rose-200">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>Mandated Rest Period Deficit</span>
                </div>
                <p>{selectedDutyForDetails.conflictDetails.message}</p>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setSelectedDutyForDetails(null);
                      onOpenFallbackModal();
                    }}
                    className="w-full py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow"
                  >
                    Launch 3-Tier Fallback Solver &rarr;
                  </button>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-1">
              <button
                onClick={() => setSelectedDutyForDetails(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono"
              >
                Close Inspector
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
