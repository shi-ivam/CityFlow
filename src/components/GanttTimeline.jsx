import React, { useState, useEffect } from 'react';
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
  Zap,
  CheckCircle2,
  X
} from 'lucide-react';
import { validateRestPeriod } from '../utils/dutyEngine';

const TIMELINE_START_HOUR = 5;
const TIMELINE_END_HOUR = 24;
const TOTAL_MINUTES = (TIMELINE_END_HOUR - TIMELINE_START_HOUR) * 60;

export default function GanttTimeline({
  dutyAssignments = [],
  crewMembers = [],
  busFleet = [],
  routes = [],
  operationalTime = 480,
  selectedDutyId,
  onSelectDuty,
  hoveredRouteId,
  onHoverRoute,
  onOpenFallbackModal,
  onUpdateDriverAssignment,
  onUpdateBusAssignment,
  externalFilter = 'all',
  onFilterChange
}) {
  const getInitialFilter = (ext) => {
    const f = (ext || '').toLowerCase();
    if (f === 'linked') return 'LINKED';
    if (f === 'unlinked') return 'UNLINKED';
    if (f === 'conflicts' || f === 'conflict') return 'CONFLICT';
    return 'ALL';
  };

  const [filterType, setFilterType] = useState(() => getInitialFilter(externalFilter));

  useEffect(() => {
    setFilterType(getInitialFilter(externalFilter));
  }, [externalFilter]);

  const [searchQuery, setSearchQuery] = useState('');
  const [unlinkedModalDuty, setUnlinkedModalDuty] = useState(null);

  const [selectedBusForLink, setSelectedBusForLink] = useState(busFleet[0]?.id || '');
  const [selectedRouteForLink, setSelectedRouteForLink] = useState(routes[0]?.id || '');

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
      const matchDuty = duty.dutyCode?.toLowerCase().includes(q);
      const matchCrew = crew?.fullName?.toLowerCase().includes(q) || crew?.name?.toLowerCase().includes(q);
      const matchBus = bus?.busNumber?.toLowerCase().includes(q);
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

  const handleLinkSubmit = () => {
    if (!unlinkedModalDuty) return;
    if (onUpdateBusAssignment) {
      onUpdateBusAssignment(selectedRouteForLink, busFleet[0]?.id, selectedBusForLink);
    }
    if (onUpdateDriverAssignment && unlinkedModalDuty.crewId) {
      onUpdateDriverAssignment(selectedRouteForLink, selectedBusForLink, unlinkedModalDuty.crewId);
    }
    setUnlinkedModalDuty(null);
  };

  return (
    <div className="flex flex-col h-full bg-card select-none overflow-hidden font-sans border-t border-border">
      
      {/* Gantt Toolbar */}
      <div className="p-2.5 px-4 bg-muted/20 border-b border-border flex flex-wrap items-center justify-between gap-2 shrink-0">
        
        {/* Filter Badges */}
        <div className="flex items-center space-x-1 flex-wrap gap-y-1 text-xs font-mono">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-2.5 py-1 rounded font-medium transition ${
              filterType === 'ALL'
                ? 'bg-primary text-primary-foreground font-semibold'
                : 'bg-muted text-muted-foreground hover:text-foreground border border-border'
            }`}
          >
            All ({dutyAssignments.length})
          </button>

          <button
            onClick={() => setFilterType('LINKED')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded font-medium transition ${
              filterType === 'LINKED'
                ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-500/30'
                : 'bg-muted text-muted-foreground hover:text-foreground border border-border'
            }`}
          >
            <Link2 className="w-3 h-3 text-emerald-500" />
            <span>🔗 Linked</span>
          </button>

          <button
            onClick={() => setFilterType('UNLINKED')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded font-medium transition ${
              filterType === 'UNLINKED'
                ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 font-semibold border border-amber-500/30'
                : 'bg-muted text-muted-foreground hover:text-foreground border border-border'
            }`}
          >
            <Unlink className="w-3 h-3 text-amber-500" />
            <span>○ Unlinked</span>
          </button>

          <button
            onClick={() => setFilterType('CONFLICT')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded font-medium transition ${
              filterType === 'CONFLICT'
                ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 font-semibold border border-rose-500/30'
                : 'bg-muted text-muted-foreground hover:text-foreground border border-border'
            }`}
          >
            <ShieldAlert className="w-3 h-3 text-rose-500" />
            <span>Conflicts</span>
          </button>
        </div>

        {/* Search */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-3 h-3 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search driver, bus..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-muted/50 border border-input rounded pl-7 pr-2 py-1 text-xs text-foreground placeholder:text-muted-foreground font-mono w-40 sm:w-48 outline-none"
            />
          </div>

          <button
            onClick={onOpenFallbackModal}
            className="flex items-center space-x-1.5 px-3 py-1 rounded bg-primary text-primary-foreground text-xs font-mono font-medium transition active:scale-95"
          >
            <Sparkles className="w-3 h-3" />
            <span>Fallback Solver</span>
          </button>
        </div>

      </div>

      {/* Gantt Header: Hour Scale */}
      <div className="bg-muted/30 border-b border-border px-4 py-1.5 flex items-center shrink-0">
        <div className="w-52 sm:w-60 shrink-0 text-[10px] font-mono font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between pr-3">
          <span>Driver & Fleet Duty</span>
          <span>Duty Status & Rest</span>
        </div>

        <div className="flex-1 relative h-5 flex items-center font-mono text-[9px] text-muted-foreground">
          {hourMarks.map((mark, idx) => {
            const leftPct = (idx / (hourMarks.length - 1)) * 100;
            return (
              <div 
                key={idx} 
                className="absolute -translate-x-1/2 flex flex-col items-center"
                style={{ left: `${leftPct}%` }}
              >
                <span>{mark.label}</span>
                <span className="w-px h-1 bg-border mt-0.5" />
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Gantt Body */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-2 relative">
        
        {/* Scrubber Line */}
        {currentScrubberPercent >= 0 && currentScrubberPercent <= 100 && (
          <div 
            className="absolute top-0 bottom-0 z-20 pointer-events-none flex flex-col items-center"
            style={{ left: `calc(${currentScrubberPercent}% + 13rem)` }}
          >
            <div className="bg-primary text-primary-foreground text-[8px] font-mono font-bold px-1 rounded">
              NOW
            </div>
            <div className="w-px h-full bg-primary" />
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

          const isLinked = duty.dutyType === 'LINKED' || (duty.crewId && duty.busId && duty.routeId);
          const isConflict = duty.status.includes('CONFLICT') || duty.status.includes('VIOLATION');

          const restCheck = crew?.lastShiftEnd 
            ? validateRestPeriod(crew.lastShiftEnd, duty.startTime, 11)
            : { isCompliant: true, actualRestFormatted: "11h+" };

          return (
            <div 
              key={duty.id}
              className={`flex items-center rounded-lg p-2 transition-all border ${
                isConflict
                  ? 'bg-rose-500/10 border-rose-500/30'
                  : isLinked 
                  ? 'bg-card border-border hover:border-primary/50' 
                  : 'bg-amber-500/10 border-amber-500/30'
              }`}
              onMouseEnter={() => onHoverRoute && onHoverRoute(duty.routeId)}
              onMouseLeave={() => onHoverRoute && onHoverRoute(null)}
            >
              
              {/* Driver Column */}
              <div className="w-52 sm:w-60 shrink-0 pr-3 border-r border-border flex flex-col justify-between space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <User className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs font-bold text-foreground truncate max-w-[120px]">
                      {crew?.name || crew?.fullName || "Unassigned Driver"}
                    </span>
                  </div>

                  {/* Linked vs Unlinked Badge */}
                  <span
                    onClick={() => {
                      if (!isLinked) setUnlinkedModalDuty(duty);
                    }}
                    className={`px-1.5 py-0.2 rounded font-mono text-[10px] font-bold cursor-pointer border ${
                      isLinked
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                        : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 hover:underline'
                    }`}
                  >
                    {isLinked ? '🔗 LINKED' : '○ UNLINKED (CLICK TO LINK)'}
                  </span>
                </div>

                {/* Mandated Driver Rest Indicator */}
                <div className="text-[10px] font-mono flex items-center justify-between">
                  <span className="text-muted-foreground">Rest Period:</span>
                  <span className={`font-bold ${restCheck.isCompliant ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                    {restCheck.isCompliant ? `✓ Rest: ${restCheck.actualRestFormatted} (Rest OK)` : `⚠ REST CONFLICT (${restCheck.actualRestFormatted} < 11h)`}
                  </span>
                </div>
              </div>

              {/* Timeline Shift Bar */}
              <div className="flex-1 relative h-7 mx-2 bg-muted/40 rounded overflow-hidden">
                <div 
                  className={`absolute top-0 bottom-0 rounded px-2 flex items-center justify-between text-[10px] font-mono font-bold transition-all shadow-xs ${
                    isConflict 
                      ? 'bg-rose-500 text-white' 
                      : isLinked
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-amber-500 text-white'
                  }`}
                  style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                >
                  <span className="truncate">{bus?.busNumber || "No Bus"} • Route {route?.code || "102"}</span>
                  <span className="opacity-90">{duty.dutyCode || "DT-01"}</span>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* LINK UNLINKED DUTY MODAL */}
      {unlinkedModalDuty && (
        <div className="fixed inset-0 z-[3500] bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 font-sans animate-in fade-in select-none">
          <div className="w-full max-w-md bg-card border border-border rounded-xl p-5 space-y-4 shadow-modal font-mono text-xs">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h3 className="font-bold text-sm text-foreground flex items-center space-x-1.5">
                <Unlink className="w-4 h-4 text-amber-500" />
                <span>LINK UNLINKED DUTY</span>
              </h3>
              <button onClick={() => setUnlinkedModalDuty(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1 bg-muted/30 p-3 rounded border border-border">
              <div>Driver: <strong>{crewMembers.find(c => c.id === unlinkedModalDuty.crewId)?.name || 'Amit Sharma'}</strong></div>
              <div>Duty Code: <strong>{unlinkedModalDuty.dutyCode || 'DT-UNLINK-01'}</strong></div>
            </div>

            <div>
              <label className="block text-muted-foreground uppercase mb-1">Select Bus to Link</label>
              <select
                value={selectedBusForLink}
                onChange={(e) => setSelectedBusForLink(e.target.value)}
                className="w-full px-3 py-2 rounded bg-muted/50 border border-input text-foreground outline-none"
              >
                {busFleet.map(b => (
                  <option key={b.id} value={b.id}>{b.busNumber} ({b.capacity} Seats)</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-muted-foreground uppercase mb-1">Select Target Route</label>
              <select
                value={selectedRouteForLink}
                onChange={(e) => setSelectedRouteForLink(e.target.value)}
                className="w-full px-3 py-2 rounded bg-muted/50 border border-input text-foreground outline-none"
              >
                {routes.map(r => (
                  <option key={r.id} value={r.id}>Route {r.code} — {r.name}</option>
                ))}
              </select>
            </div>

            <div className="pt-2 flex justify-end space-x-2 border-t border-border">
              <button onClick={() => setUnlinkedModalDuty(null)} className="px-3.5 py-1.5 rounded bg-muted text-muted-foreground font-medium">Cancel</button>
              <button onClick={handleLinkSubmit} className="px-4 py-1.5 rounded bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-xs">LINK DUTY</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
