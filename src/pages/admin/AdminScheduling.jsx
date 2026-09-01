import React, { useState } from 'react';
import GanttTimeline from '../../components/GanttTimeline';
import { CalendarClock, Sparkles, Filter, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function AdminScheduling({
  dutyAssignments = [],
  crewMembers = [],
  busFleet = [],
  routes = [],
  operationalTime = 480,
  selectedDutyId,
  setSelectedDutyId,
  hoveredRouteId,
  setHoveredRouteId,
  onOpenFallbackModal
}) {
  const linkedCount = dutyAssignments.filter(d => d.dutyType === 'LINKED').length;
  const unlinkedCount = dutyAssignments.filter(d => d.dutyType === 'UNLINKED').length;

  return (
    <div className="h-full flex flex-col min-h-0 bg-card font-sans">
      
      {/* Header bar */}
      <div className="p-4 border-b border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-muted-foreground uppercase">
            <CalendarClock className="w-3.5 h-3.5 text-primary" />
            <span>Temporal Duty Roster Engine</span>
          </div>
          <h1 className="text-xl font-bold text-foreground tracking-tight mt-0.5">
            Gantt Schedule & Duty Assignments
          </h1>
        </div>

        {/* Legend Pills & Solver Trigger */}
        <div className="flex items-center space-x-3 text-xs font-mono">
          <div className="hidden md:flex items-center space-x-3 bg-muted/40 p-1.5 rounded-md border border-border">
            <span className="flex items-center space-x-1">
              <span className="w-3 h-3 rounded-xs bg-blue-500/20 border border-blue-500" />
              <span className="text-foreground font-medium">Linked ({linkedCount})</span>
            </span>

            <span className="flex items-center space-x-1">
              <span className="w-3 h-3 rounded-xs bg-amber-500/20 border border-dashed border-amber-500" />
              <span className="text-foreground font-medium">Unlinked ({unlinkedCount})</span>
            </span>

            <span className="flex items-center space-x-1">
              <span className="w-3 h-3 rounded-xs bg-emerald-500/20 border border-emerald-500" />
              <span className="text-foreground font-medium">Rest Valid</span>
            </span>
          </div>

          <button
            onClick={onOpenFallbackModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-emerald-600 text-white font-mono text-xs font-semibold hover:bg-emerald-700 shadow-xs transition-all active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Run 3-Tier Rest Solver</span>
          </button>
        </div>
      </div>

      {/* Main Timeline Body */}
      <div className="flex-1 relative flex flex-col min-h-0">
        <GanttTimeline
          dutyAssignments={dutyAssignments}
          crewMembers={crewMembers}
          busFleet={busFleet}
          routes={routes}
          operationalTime={operationalTime}
          selectedDutyId={selectedDutyId}
          onSelectDuty={setSelectedDutyId}
          hoveredRouteId={hoveredRouteId}
          onHoverRoute={setHoveredRouteId}
          onOpenFallbackModal={onOpenFallbackModal}
        />
      </div>

    </div>
  );
}
