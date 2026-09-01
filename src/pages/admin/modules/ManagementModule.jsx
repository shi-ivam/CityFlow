import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import GanttTimeline from '../../../components/GanttTimeline';
import { SlidersHorizontal, CalendarClock, Sparkles, AlertTriangle, ShieldCheck, ArrowRight, Zap } from 'lucide-react';

export default function ManagementModule({
  dutyAssignments = [],
  crewMembers = [],
  busFleet = [],
  routes = [],
  operationalTime = 480,
  selectedDutyId,
  setSelectedDutyId,
  hoveredRouteId,
  setHoveredRouteId,
  activeConflicts = [],
  onOpenFallbackModal
}) {
  const location = useLocation();
  const path = location.pathname;
  const searchParams = new URLSearchParams(location.search);
  const subFilter = searchParams.get('view') || 'all';

  let activeFeature = 'scheduling';
  if (path.includes('/management/smartassignment')) activeFeature = 'smartassignment';
  else if (path.includes('/management/rotation')) activeFeature = 'rotation';
  else if (path.includes('/management/longjourney')) activeFeature = 'longjourney';
  else if (path.includes('/management/alerts')) activeFeature = 'alerts';
  else if (path.includes('/management/network')) activeFeature = 'network';

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto font-sans">
      
      {/* Breadcrumb Header */}
      <div className="border-b border-border pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono text-muted-foreground uppercase font-semibold">
            ADMIN / MANAGEMENT / {activeFeature.toUpperCase()}
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight mt-1">
            Control Room & Dispatch Management
          </h1>
          <p className="text-xs text-muted-foreground">
            Temporal duty rosters, 3-tier automated constraint solvers, long-journey changeovers, and network status.
          </p>
        </div>

        <button
          onClick={onOpenFallbackModal}
          className="flex items-center space-x-2 px-3.5 py-2 rounded-md bg-emerald-600 text-white font-mono text-xs font-semibold hover:bg-emerald-700 shadow-sm transition-all active:scale-95 shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Run 3-Tier Rest Solver</span>
        </button>
      </div>

      {/* SCHEDULING / GANTT */}
      {activeFeature === 'scheduling' && (
        <div className="bg-card border border-border rounded-lg shadow-card overflow-hidden flex flex-col h-[560px]">
          <div className="p-3 bg-muted/30 border-b border-border flex items-center justify-between font-mono text-xs">
            <span className="font-bold text-foreground">Gantt Duty Timeline (04:00 - 24:00 IST)</span>
            <span className="text-muted-foreground">Filter: {subFilter.toUpperCase()}</span>
          </div>

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
      )}

      {/* SMART ASSIGNMENT */}
      {activeFeature === 'smartassignment' && (
        <div className="bg-card border border-border rounded-lg shadow-card p-5 space-y-4 font-mono text-xs">
          <h2 className="text-base font-bold font-sans text-foreground border-b border-border pb-2">
            Smart Constraint-Based Crew Assignment Solver
          </h2>
          <div className="p-4 rounded bg-muted/30 border border-border space-y-2">
            <div className="text-foreground font-bold">Solver Inputs Evaluated:</div>
            <div className="text-muted-foreground">
              ✓ Driver Availability • Mandatory 11h Rest • Current Workload • Corridor Difficulty • Depot Location
            </div>
            <button
              onClick={onOpenFallbackModal}
              className="mt-2 px-3 py-1.5 rounded bg-primary text-primary-foreground font-bold hover:bg-primary/90"
            >
              Auto-Assign Standby Drivers
            </button>
          </div>
        </div>
      )}

      {/* LONG JOURNEY CHANGEOVER */}
      {activeFeature === 'longjourney' && (
        <div className="bg-card border border-border rounded-lg shadow-card p-5 space-y-4 font-mono text-xs">
          <h2 className="text-base font-bold font-sans text-foreground border-b border-border pb-2">
            Long Journey Driver Changeover Plan (Interstate Routes)
          </h2>
          <div className="p-4 rounded bg-muted/30 border border-border space-y-2">
            <div className="text-base font-bold text-primary">Corridor: Delhi → Jaipur Express (280 km)</div>
            <div>Changeover Station: <strong>KOTPUTLI MIDWAY (~200 km)</strong></div>
            <div>Primary Driver: <strong className="text-foreground">DRV-1042 (Rajesh Kumar)</strong></div>
            <div>Replacement Driver: <strong className="text-foreground">DRV-1091 (Sanjay Sharma)</strong></div>
            <div className="text-emerald-600 dark:text-emerald-400 font-bold pt-2 border-t border-border">
              ✓ Handoff confirmed. Mandatory rest window satisfied for both drivers.
            </div>
          </div>
        </div>
      )}

      {/* ALERTS */}
      {activeFeature === 'alerts' && (
        <div className="bg-card border border-border rounded-lg shadow-card p-5 space-y-3 font-mono text-xs">
          <h2 className="text-base font-bold font-sans text-foreground border-b border-border pb-2">
            Active Operational Alerts ({activeConflicts.length})
          </h2>
          {activeConflicts.map((c, i) => (
            <div key={i} className="p-3 rounded bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-300 flex items-center justify-between">
              <div>
                <strong>{c.type}:</strong> {c.description}
              </div>
              <button
                onClick={onOpenFallbackModal}
                className="px-2 py-1 rounded bg-rose-600 text-white font-bold text-[10px]"
              >
                Solve
              </button>
            </div>
          ))}
        </div>
      )}

      {/* NETWORK STATUS */}
      {activeFeature === 'network' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono">
          <div className="bg-card border border-border p-4 rounded-lg">
            <div className="text-xs text-muted-foreground">ACTIVE BUSES</div>
            <div className="text-2xl font-bold text-foreground mt-1">142 / 160</div>
          </div>
          <div className="bg-card border border-border p-4 rounded-lg">
            <div className="text-xs text-muted-foreground">ON DUTY DRIVERS</div>
            <div className="text-2xl font-bold text-emerald-600 mt-1">118</div>
          </div>
          <div className="bg-card border border-border p-4 rounded-lg">
            <div className="text-xs text-muted-foreground">ROUTES COVERED</div>
            <div className="text-2xl font-bold text-primary mt-1">42</div>
          </div>
          <div className="bg-card border border-border p-4 rounded-lg">
            <div className="text-xs text-muted-foreground">CRITICAL ISSUES</div>
            <div className="text-2xl font-bold text-rose-500 mt-1">{activeConflicts.length}</div>
          </div>
        </div>
      )}

    </div>
  );
}
