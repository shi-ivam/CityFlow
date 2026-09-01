import React, { useState } from 'react';
import { 
  Lock, 
  Unlock, 
  ArrowLeftRight, 
  Coffee, 
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
  Layers,
  ChevronLeft
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
  const [selectedDay, setSelectedDay] = useState('Today');
  const [timeScale, setTimeScale] = useState(1);

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
  const nowDisplay = `${String(Math.floor(simHours % 24)).padStart(2, '0')}:${String(Math.floor((simulationTimeSeconds % 3600) / 60)).padStart(2, '0')}`;

  const activeConflicts = conflicts.filter(c => c.status === 'ACTIVE');

  // Rows for Bus View
  const busRows = buses.slice(0, 6).map(bus => {
    const busDuties = duties.filter(d => d.busId === bus.id);
    const assignedDriver = drivers.find(d => d.id === bus.driverId) || drivers[0];
    const assignedRoute = routes.find(r => r.id === bus.routeId) || routes[0];
    return {
      id: bus.id,
      primaryText: bus.id,
      secondaryText: assignedDriver?.name || 'Driver Standby',
      routeCode: assignedRoute?.code || assignedRoute?.id || 'R534',
      duties: busDuties
    };
  });

  // Rows for Driver View
  const driverRows = drivers.slice(0, 6).map(driver => {
    const driverDuties = duties.filter(d => d.driverId === driver.id || d.crewId === driver.id);
    return {
      id: driver.id,
      primaryText: driver.name,
      secondaryText: `ID: ${driver.id}`,
      routeCode: driverDuties[0]?.routeId || 'R534',
      duties: driverDuties
    };
  });

  const displayRows = viewMode === 'bus' ? busRows : driverRows;

  // Status color resolver (Section 12: subtle tints)
  const getDutyColorClasses = (duty) => {
    const isSelected = selectedDuty?.id === duty.id;
    const hasConflict = conflicts.some(c => c.status === 'ACTIVE' && (c.affectedDutyId === duty.id || c.affectedBusId === duty.busId));

    if (hasConflict) {
      return isSelected
        ? 'bg-rose-500/25 border-2 border-rose-600 text-rose-900 dark:text-rose-200 ring-2 ring-rose-400/40'
        : 'bg-rose-500/15 border border-rose-500/40 text-rose-900 dark:text-rose-200 hover:bg-rose-500/25';
    }

    if (duty.status === 'DELAYED') {
      return isSelected
        ? 'bg-amber-500/25 border-2 border-amber-600 text-amber-900 dark:text-amber-200 ring-2 ring-amber-400/40'
        : 'bg-amber-500/15 border border-amber-500/40 text-amber-900 dark:text-amber-200 hover:bg-amber-500/25';
    }

    if (duty.type === 'UNLINKED') {
      return isSelected
        ? 'bg-purple-500/25 border-2 border-purple-600 text-purple-900 dark:text-purple-200 ring-2 ring-purple-400/40'
        : 'bg-purple-500/15 border border-purple-500/40 text-purple-900 dark:text-purple-200 hover:bg-purple-500/25';
    }

    // Default Normal Linked Duty
    return isSelected
      ? 'bg-emerald-500/25 border-2 border-emerald-600 text-emerald-950 dark:text-emerald-200 ring-2 ring-emerald-400/40'
      : 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-900 dark:text-emerald-200 hover:bg-emerald-500/25';
  };

  return (
    <div className="h-full w-full flex flex-col bg-card rounded-xl border border-border overflow-hidden shadow-xs select-none font-sans">
      
      {/* Header: DISPATCH TIMELINE (Section 11) */}
      <div className="h-10 px-3 bg-[#FAF9FC] dark:bg-[#201E2B] border-b border-border flex items-center justify-between shrink-0 font-sans text-xs">
        
        {/* Left: Title & Tabs */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="font-bold text-xs text-foreground tracking-tight">DISPATCH TIMELINE</span>
          </div>

          <div className="h-4 w-px bg-border hidden sm:block" />

          {/* Bus View / Driver View */}
          <div className="flex items-center bg-muted/60 p-0.5 rounded-lg text-[11px] font-mono">
            <button
              onClick={() => setViewMode('bus')}
              className={`px-2.5 py-0.5 rounded transition cursor-pointer font-bold ${
                viewMode === 'bus' ? 'bg-card text-foreground shadow-2xs' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Bus View
            </button>
            <button
              onClick={() => setViewMode('driver')}
              className={`px-2.5 py-0.5 rounded transition cursor-pointer font-bold ${
                viewMode === 'driver' ? 'bg-card text-foreground shadow-2xs' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Driver View
            </button>
          </div>
        </div>

        {/* Right: Date, Time Zoom, Controls */}
        <div className="flex items-center space-x-2 font-mono text-[11px]">
          {/* Day Navigation */}
          <div className="flex items-center space-x-1">
            <button 
              onClick={() => setSelectedDay(selectedDay === 'Today' ? 'Yesterday' : 'Today')}
              className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <ChevronLeft className="w-3 h-3" />
            </button>
            <span className="font-bold text-foreground px-1">{selectedDay}</span>
            <button 
              onClick={() => setSelectedDay(selectedDay === 'Today' ? 'Tomorrow' : 'Today')}
              className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="h-4 w-px bg-border" />

          {/* Time Zoom Multiplier */}
          <div className="flex items-center space-x-1 bg-muted/60 px-1.5 py-0.5 rounded text-[10px]">
            <button 
              onClick={() => setTimeScale(Math.max(1, timeScale - 1))}
              className="hover:text-foreground cursor-pointer font-bold"
            >
              −
            </button>
            <span className="font-bold text-foreground px-1">{timeScale}x</span>
            <button 
              onClick={() => setTimeScale(Math.min(5, timeScale + 1))}
              className="hover:text-foreground cursor-pointer font-bold"
            >
              +
            </button>
          </div>

          {/* Conflicts Switch */}
          {activeConflicts.length > 0 && (
            <button
              onClick={() => onTabChange(activeTab === 'gantt' ? 'conflicts' : 'gantt')}
              className="flex items-center space-x-1 px-2 py-0.5 rounded bg-rose-500/15 text-rose-600 dark:text-rose-400 font-bold hover:bg-rose-500/25 transition cursor-pointer"
            >
              <AlertTriangle className="w-3 h-3" />
              <span>{activeConflicts.length} Conflicts</span>
            </button>
          )}
        </div>

      </div>

      {/* TIMELINE RULER & CANVAS */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 relative flex flex-col bg-[#FDFCFE] dark:bg-[#1E1C27]">
        
        {/* Timeline Header Hour Markers (Section 11) */}
        <div className="h-7 bg-[#F4F3F8] dark:bg-[#22202C] border-b border-border flex items-center shrink-0 font-mono text-[10px] text-muted-foreground sticky top-0 z-20">
          <div className="w-40 sm:w-44 px-3 font-bold text-foreground border-r border-border truncate">
            {viewMode === 'bus' ? 'VEHICLE / CREW' : 'DRIVER / BUS'}
          </div>
          <div className="flex-1 flex justify-between px-3 relative">
            {hoursArray.map((hour, idx) => (
              <span key={hour} className="relative -translate-x-1/2 font-bold text-muted-foreground">
                {hour}
              </span>
            ))}
          </div>
        </div>

        {/* Rows Container (Section 14: generous height for readability) */}
        <div className="flex-1 divide-y divide-border/60 relative">
          
          {/* Section 13: Elegant Thin Current Time Vertical Line */}
          <div
            className="absolute top-0 bottom-0 z-10 pointer-events-none transition-all duration-300"
            style={{ left: `calc(10rem + (100% - 10rem) * ${nowPercent / 100})` }}
          >
            <div className="h-full w-px bg-primary/70 relative">
              <span className="absolute -top-6 -left-8 px-1.5 py-0.2 rounded bg-primary text-primary-foreground font-mono text-[9px] font-bold shadow-xs">
                NOW {nowDisplay}
              </span>
            </div>
          </div>

          {displayRows.map((row) => (
            <div 
              key={row.id}
              className="h-14 flex items-center hover:bg-muted/30 transition-colors relative group"
            >
              {/* Row Left Label: Bus ID • Driver • Route */}
              <div className="w-40 sm:w-44 px-3 border-r border-border h-full flex flex-col justify-center shrink-0 bg-card/60">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-foreground truncate">
                    {row.primaryText}
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-muted text-[10px] font-mono font-bold text-muted-foreground">
                    {row.routeCode}
                  </span>
                </div>
                <div className="text-[11px] text-muted-foreground truncate mt-0.5">
                  {row.secondaryText}
                </div>
              </div>

              {/* Row Timeline Track */}
              <div className="flex-1 h-full relative px-2">
                {/* Background grid lines */}
                <div className="absolute inset-0 flex justify-between pointer-events-none px-3">
                  {hoursArray.map((h) => (
                    <div key={h} className="w-px h-full bg-border/25" />
                  ))}
                </div>

                {/* Duty Blocks in this row */}
                {row.duties.map((duty) => {
                  const leftPct = timeToPercent(duty.startTime || '07:00');
                  const rightPct = timeToPercent(duty.endTime || '11:00');
                  const widthPct = Math.max(8, rightPct - leftPct);

                  return (
                    <div
                      key={duty.id}
                      onClick={() => onSelectDuty(duty)}
                      onMouseEnter={() => onHoverDuty && onHoverDuty(duty.id)}
                      onMouseLeave={() => onHoverDuty && onHoverDuty(null)}
                      className={`absolute top-2 bottom-2 rounded-lg transition-all cursor-pointer flex flex-col justify-center px-2.5 shadow-2xs ${getDutyColorClasses(duty)}`}
                      style={{
                        left: `${leftPct}%`,
                        width: `${widthPct}%`
                      }}
                      title={`${duty.id} • ${duty.startTime} - ${duty.endTime} • Route ${duty.routeId}`}
                    >
                      <div className="flex items-center justify-between leading-none">
                        <span className="font-bold text-[11px] truncate">
                          {duty.routeId || 'R534'}
                        </span>
                        <span className="font-mono text-[10px] opacity-85 hidden md:inline truncate ml-1">
                          {duty.startTime}–{duty.endTime}
                        </span>
                      </div>
                      <div className="text-[9px] font-mono opacity-75 truncate mt-0.5">
                        {duty.driverId || 'Rajesh K.'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

        </div>

      </div>

      {/* Compact Timeline Footer Status Strip */}
      <div className="h-7 px-3 bg-[#FAF9FC] dark:bg-[#201E2B] border-t border-border flex items-center justify-between font-mono text-[10px] text-muted-foreground shrink-0">
        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Normal Duty</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            <span>Unlinked Shift</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Rest Conflict</span>
          </span>
        </div>
        <div>
          <span>Scroll track to inspect full schedule</span>
        </div>
      </div>

    </div>
  );
}
