import React, { useState } from 'react';
import { 
  Link2, 
  Unlink, 
  AlertTriangle, 
  ShieldAlert, 
  Clock, 
  User, 
  Search, 
  ShieldCheck,
  Sparkles,
  Zap
} from 'lucide-react';
import { validateRestPeriod } from '../utils/dutyEngine';

const TIMELINE_START_HOUR = 5;
const TIMELINE_END_HOUR = 24;
const TOTAL_MINUTES = (TIMELINE_END_HOUR - TIMELINE_START_HOUR) * 60;

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
  const [filterType, setFilterType] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDutyForDetails, setSelectedDutyForDetails] = useState(null);

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

  const getPercentagePosition = (minuteOffset) => {
    return (minuteOffset / TOTAL_MINUTES) * 100;
  };

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

  const currentScrubberPercent = getPercentagePosition(Math.max(0, operationalTime - (TIMELINE_START_HOUR * 60)));

  const hourMarks = [];
  for (let h = TIMELINE_START_HOUR; h <= TIMELINE_END_HOUR; h++) {
    const displayH = h === 24 ? '00:00' : `${String(h).padStart(2, '0')}:00`;
    hourMarks.push({ hour: h, label: displayH });
  }

  return (
    <div className="flex flex-col h-full bg-[#FFFFFF] select-none overflow-hidden font-sans">
      
      {/* Gantt Toolbar */}
      <div className="p-2.5 px-4 bg-[#FFFFFF] border-b border-[#EAEAEA] flex flex-wrap items-center justify-between gap-2 shrink-0">
        
        {/* Filter Badges */}
        <div className="flex items-center space-x-1 flex-wrap gap-y-1 text-xs font-mono">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-2.5 py-1 rounded-[4px] font-medium transition ${
              filterType === 'ALL'
                ? 'bg-[#111111] text-white font-semibold'
                : 'bg-[#F7F6F3] text-[#787774] hover:text-[#111111] border border-[#EAEAEA]'
            }`}
          >
            All ({dutyAssignments.length})
          </button>

          <button
            onClick={() => setFilterType('LINKED')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-[4px] font-medium transition ${
              filterType === 'LINKED'
                ? 'bg-[#E1F3FE] text-[#1F6C9F] font-semibold border border-[#BCDFF6]'
                : 'bg-[#F7F6F3] text-[#787774] hover:text-[#1F6C9F] border border-[#EAEAEA]'
            }`}
          >
            <Link2 className="w-3 h-3" />
            <span>Linked</span>
          </button>

          <button
            onClick={() => setFilterType('UNLINKED')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-[4px] font-medium transition ${
              filterType === 'UNLINKED'
                ? 'bg-[#FBF3DB] text-[#956400] font-semibold border border-[#F3E4BA]'
                : 'bg-[#F7F6F3] text-[#787774] hover:text-[#956400] border border-[#EAEAEA]'
            }`}
          >
            <Unlink className="w-3 h-3" />
            <span>Unlinked (15m)</span>
          </button>

          <button
            onClick={() => setFilterType('CONFLICT')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-[4px] font-medium transition ${
              filterType === 'CONFLICT'
                ? 'bg-[#FDEBEC] text-[#9F2F2D] font-semibold border border-[#F7D2D4]'
                : 'bg-[#F7F6F3] text-[#787774] hover:text-[#9F2F2D] border border-[#EAEAEA]'
            }`}
          >
            <ShieldAlert className="w-3 h-3" />
            <span>Conflicts</span>
          </button>
        </div>

        {/* Search & Action */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-3 h-3 text-[#787774] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search driver, bus..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#F7F6F3] border border-[#EAEAEA] rounded-[4px] pl-7 pr-2.5 py-1 text-xs text-[#111111] placeholder-[#787774] focus:outline-none focus:border-[#111111] font-mono w-40 sm:w-48"
            />
          </div>

          <button
            onClick={onOpenFallbackModal}
            className="flex items-center space-x-1.5 px-3 py-1 rounded-[4px] bg-[#111111] hover:bg-[#333333] text-white text-xs font-mono font-medium transition active:scale-95"
          >
            <Sparkles className="w-3 h-3" />
            <span>Fallback Solver</span>
          </button>
        </div>

      </div>

      {/* Gantt Header: Hour Scale */}
      <div className="bg-[#FBFBFA] border-b border-[#EAEAEA] px-4 py-1.5 flex items-center shrink-0">
        <div className="w-52 sm:w-60 shrink-0 text-[10px] font-mono font-semibold text-[#787774] uppercase tracking-wider flex items-center justify-between pr-3">
          <span>Driver & Fleet</span>
          <span>Shift</span>
        </div>

        <div className="flex-1 relative h-5 flex items-center font-mono text-[9px] text-[#787774]">
          {hourMarks.map((mark, idx) => {
            const leftPct = (idx / (hourMarks.length - 1)) * 100;
            return (
              <div 
                key={idx} 
                className="absolute -translate-x-1/2 flex flex-col items-center"
                style={{ left: `${leftPct}%` }}
              >
                <span>{mark.label}</span>
                <span className="w-px h-1 bg-[#EAEAEA] mt-0.5"></span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Gantt Body */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-1.5 relative">
        
        {/* Scrubber Line */}
        {currentScrubberPercent >= 0 && currentScrubberPercent <= 100 && (
          <div 
            className="absolute top-0 bottom-0 z-20 pointer-events-none flex flex-col items-center"
            style={{ left: `calc(${currentScrubberPercent}% + 13rem)` }}
          >
            <div className="bg-[#111111] text-white text-[8px] font-mono font-bold px-1 rounded-[2px]">
              NOW
            </div>
            <div className="w-px h-full bg-[#111111]"></div>
          </div>
        )}

        {filteredDuties.map(duty => {
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

          const restCheck = crew?.lastShiftEnd 
            ? validateRestPeriod(crew.lastShiftEnd, duty.startTime, 11)
            : { isCompliant: true, actualRestFormatted: "11h+" };

          return (
            <div 
              key={duty.id}
              className={`flex items-center rounded-[6px] p-1.5 transition-all border ${
                isSelected 
                  ? 'bg-[#F7F6F3] border-[#111111]' 
                  : isConflict
                  ? 'bg-[#FDEBEC]/40 border-[#F7D2D4]'
                  : isRouteHovered
                  ? 'bg-[#E1F3FE]/30 border-[#BCDFF6]'
                  : 'bg-[#FFFFFF] border-[#EAEAEA] hover:border-[#CCCCCC]'
              }`}
              onMouseEnter={() => onHoverRoute && onHoverRoute(duty.routeId)}
              onMouseLeave={() => onHoverRoute && onHoverRoute(null)}
            >
              
              {/* Driver Column */}
              <div className="w-52 sm:w-60 shrink-0 pr-3 border-r border-[#EAEAEA] flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-5 h-5 rounded-[4px] flex items-center justify-center text-[10px] font-mono font-bold ${
                      isConflict 
                        ? 'bg-[#FDEBEC] text-[#9F2F2D]' 
                        : isLinked 
                        ? 'bg-[#E1F3FE] text-[#1F6C9F]' 
                        : 'bg-[#FBF3DB] text-[#956400]'
                    }`}>
                      <User className="w-3 h-3" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[#111111] truncate max-w-[120px]">
                        {crew?.fullName || "Unassigned"}
                      </div>
                      <div className="text-[10px] text-[#787774] font-mono">
                        {crew?.badge} • {crew?.weeklyHoursUsed}h/wk
                      </div>
                    </div>
                  </div>

                  <span className={`text-[9px] font-mono px-1 py-0.2 rounded-[3px] font-semibold ${
                    isLinked ? 'bg-[#E1F3FE] text-[#1F6C9F]' : 'bg-[#FBF3DB] text-[#956400]'
                  }`}>
                    {isLinked ? '1:1' : 'HUB'}
                  </span>
                </div>

                <div className="mt-1 flex items-center justify-between text-[10px] font-mono">
                  <span className={restCheck.isCompliant ? "text-[#787774]" : "text-[#9F2F2D] font-bold"}>
                    Rest: {restCheck.actualRestFormatted}
                  </span>
                  {bus && <span className="text-[#111111] font-semibold">{bus.busNumber}</span>}
                </div>
              </div>

              {/* Timeline Block */}
              <div className="flex-1 relative h-10 ml-2 flex items-center">
                
                <div
                  onClick={() => {
                    onSelectDuty && onSelectDuty(duty.id);
                    setSelectedDutyForDetails(duty);
                  }}
                  style={{ left: `${leftPct}%`, width: `${Math.max(12, widthPct)}%` }}
                  className={`absolute h-8 rounded-[4px] px-2 flex items-center justify-between cursor-pointer transition-all ${
                    isConflict
                      ? 'bg-[#FDEBEC] border border-[#9F2F2D] text-[#9F2F2D]'
                      : isLinked
                      ? 'bg-[#E1F3FE] border border-[#1F6C9F] text-[#1F6C9F] hover:bg-[#D5EBFB]'
                      : 'bg-[#FBF3DB] border border-dashed border-[#956400] text-[#956400] hover:bg-[#F5EACB]'
                  }`}
                >
                  <div className="flex items-center space-x-1.5 truncate">
                    <span className="font-mono text-xs font-bold">{duty.dutyCode}</span>
                    {route && <span className="text-[9px] font-mono opacity-80">R-{route.code}</span>}
                  </div>

                  <div className="text-[9px] font-mono pl-1">
                    {isConflict ? (
                      <span className="font-bold underline">SOLVE</span>
                    ) : (
                      <span>{Math.round(durationMinutes / 60)}h</span>
                    )}
                  </div>
                </div>

              </div>

            </div>
          );
        })}

      </div>

      {/* Legend Bar */}
      <div className="bg-[#FBFBFA] border-t border-[#EAEAEA] p-2 px-4 flex flex-wrap items-center justify-between gap-2 shrink-0 font-mono text-[10px] text-[#787774]">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-[2px] bg-[#E1F3FE] border border-[#1F6C9F]"></span>
            <span>Linked (1:1 Lock)</span>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-[2px] bg-[#FBF3DB] border border-dashed border-[#956400]"></span>
            <span>Unlinked (15m Hub)</span>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-[2px] bg-[#FDEBEC] border border-[#9F2F2D]"></span>
            <span className="text-[#9F2F2D] font-bold">Rest Conflict (&lt;11h)</span>
          </div>
        </div>

        <div>
          <span>Standby Pool: <strong className="text-[#346538]">3 Drivers Rested</strong></span>
        </div>
      </div>

      {/* Details Modal */}
      {selectedDutyForDetails && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#EAEAEA] rounded-[8px] w-full max-w-md p-5 shadow-lg space-y-3 font-sans">
            <div className="flex items-center justify-between border-b border-[#EAEAEA] pb-2">
              <h3 className="font-serif font-bold text-base text-[#111111]">{selectedDutyForDetails.dutyCode}</h3>
              <button onClick={() => setSelectedDutyForDetails(null)} className="text-[#787774] hover:text-[#111111]">&times;</button>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="text-[#787774] uppercase text-[10px]">Segments</div>
              {selectedDutyForDetails.segments?.map((s, i) => (
                <div key={i} className="p-2 rounded-[4px] bg-[#FBFBFA] border border-[#EAEAEA] flex items-center justify-between">
                  <span>{s.start} — {s.end}</span>
                  <span className="font-bold">{s.busNumber}</span>
                </div>
              ))}
            </div>

            {selectedDutyForDetails.conflictDetails && (
              <div className="p-2.5 rounded-[4px] bg-[#FDEBEC] border border-[#F7D2D4] text-xs font-mono text-[#9F2F2D] space-y-1.5">
                <div className="font-bold">Rest Period Deficit</div>
                <p>{selectedDutyForDetails.conflictDetails.message}</p>
                <button
                  onClick={() => {
                    setSelectedDutyForDetails(null);
                    onOpenFallbackModal();
                  }}
                  className="w-full py-1 rounded-[4px] bg-[#9F2F2D] text-white font-semibold text-xs transition active:scale-95"
                >
                  Launch 3-Tier Solver &rarr;
                </button>
              </div>
            )}

            <div className="flex justify-end pt-1">
              <button
                onClick={() => setSelectedDutyForDetails(null)}
                className="px-3 py-1 rounded-[4px] bg-[#F7F6F3] border border-[#EAEAEA] text-[#787774] hover:text-[#111111] text-xs font-mono"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
