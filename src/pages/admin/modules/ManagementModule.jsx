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
            <div className="flex items-center space-x-2">
              <span className="text-muted-foreground">Active Filter:</span>
              <span className="px-2 py-0.5 rounded bg-primary/20 text-primary font-bold uppercase">
                {subFilter}
              </span>
            </div>
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
              externalFilter={subFilter}
            />
          </div>
        </div>
      )}

      {/* SMART ASSIGNMENT */}
      {activeFeature === 'smartassignment' && (
        <div className="bg-card border border-border rounded-lg shadow-card p-5 space-y-4 font-mono text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
            <div>
              <h2 className="text-base font-bold font-sans text-foreground">
                Smart Constraint-Based Crew Assignment Solver
              </h2>
              <p className="text-xs text-muted-foreground font-sans mt-0.5">
                Evaluates mandatory 11h rest periods, route difficulty, depot proximity, and driver driving hours.
              </p>
            </div>
            
            {/* Solver Mode Badges */}
            <div className="flex items-center space-x-1 font-mono text-xs">
              <a
                href="/admin/management/smartassignment?view=all"
                className={`px-2.5 py-1 rounded transition ${subFilter === 'all' ? 'bg-primary text-primary-foreground font-bold' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
              >
                All
              </a>
              <a
                href="/admin/management/smartassignment?view=assign"
                className={`px-2.5 py-1 rounded transition ${subFilter === 'assign' ? 'bg-primary text-primary-foreground font-bold' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
              >
                Assign
              </a>
              <a
                href="/admin/management/smartassignment?view=replace"
                className={`px-2.5 py-1 rounded transition ${subFilter === 'replace' ? 'bg-primary text-primary-foreground font-bold' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
              >
                Replace
              </a>
              <a
                href="/admin/management/smartassignment?view=backup"
                className={`px-2.5 py-1 rounded transition ${subFilter === 'backup' ? 'bg-primary text-primary-foreground font-bold' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
              >
                Backup Pool
              </a>
            </div>
          </div>

          {/* Sub-View: Assign Driver */}
          {(subFilter === 'all' || subFilter === 'assign') && (
            <div className="p-4 rounded-lg bg-muted/20 border border-border space-y-3">
              <div className="font-bold text-foreground flex items-center justify-between">
                <span>1. Intelligent Duty Allocation Engine</span>
                <span className="text-[11px] text-emerald-500 font-normal">Optimal Allocation</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 rounded bg-card border border-border/80 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-foreground">Route 534 (Mehrauli ⇄ Anand Vihar)</div>
                    <div className="text-[11px] text-muted-foreground">Shift 08:00 - 16:00 • 32 km Corridor</div>
                  </div>
                  <button 
                    onClick={onOpenFallbackModal}
                    className="px-2.5 py-1 rounded bg-primary text-primary-foreground font-bold text-[11px] hover:bg-primary/90"
                  >
                    Auto-Assign
                  </button>
                </div>
                <div className="p-3 rounded bg-card border border-border/80 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-foreground">Route 429 (Kashmere Gate ⇄ Saket)</div>
                    <div className="text-[11px] text-muted-foreground">Shift 09:30 - 17:30 • Urban Feeder</div>
                  </div>
                  <button 
                    onClick={onOpenFallbackModal}
                    className="px-2.5 py-1 rounded bg-primary text-primary-foreground font-bold text-[11px] hover:bg-primary/90"
                  >
                    Auto-Assign
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Sub-View: Replace Driver */}
          {(subFilter === 'all' || subFilter === 'replace') && (
            <div className="p-4 rounded-lg bg-muted/20 border border-border space-y-3">
              <div className="font-bold text-foreground flex items-center justify-between">
                <span>2. Emergency Driver Replacement & Swap</span>
                <span className="text-[11px] text-amber-500 font-normal">Rapid Dispatch Ready</span>
              </div>
              <div className="p-3 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-foreground">
                <div>
                  <strong>Driver Conflict Detected:</strong> DRV-1021 rest violation alert (&lt;11h rest gap)
                  <div className="text-[11px] text-muted-foreground mt-0.5">Replacement Candidate: DRV-1044 (Rest: 13.5h, 100% compliant)</div>
                </div>
                <button
                  onClick={onOpenFallbackModal}
                  className="px-3 py-1 rounded bg-amber-600 text-white font-bold hover:bg-amber-700"
                >
                  Swap Driver
                </button>
              </div>
            </div>
          )}

          {/* Sub-View: Backup Pool */}
          {(subFilter === 'all' || subFilter === 'backup') && (
            <div className="p-4 rounded-lg bg-muted/20 border border-border space-y-3">
              <div className="font-bold text-foreground flex items-center justify-between">
                <span>3. Standby Driver Reserve Pool</span>
                <span className="text-[11px] text-emerald-500 font-normal">{crewMembers.filter(c => c.isStandby).length || 6} Ready Drivers</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {crewMembers.filter(c => c.isStandby).slice(0, 3).map((driver) => (
                  <div key={driver.id} className="p-2.5 rounded bg-background border border-border flex items-center justify-between">
                    <div>
                      <div className="font-bold text-foreground">{driver.name}</div>
                      <div className="text-[10px] text-muted-foreground">Depot: Millennium Central</div>
                    </div>
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/15 text-emerald-600 font-bold">
                      READY
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* DRIVER ROTATION */}
      {activeFeature === 'rotation' && (
        <div className="bg-card border border-border rounded-lg shadow-card p-5 space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h2 className="text-base font-bold font-sans text-foreground">
                Driver Route Rotation & Fatigue Management
              </h2>
              <p className="text-xs text-muted-foreground font-sans mt-0.5">
                Balancing corridor difficulty, driving hours, and mandatory weekly rest periods.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              Fair Roster Index: 94.2%
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
            <div className="p-4 rounded-lg bg-muted/30 border border-border space-y-1">
              <span className="text-[11px] text-muted-foreground">FATIGUE INDEX</span>
              <div className="text-2xl font-bold text-emerald-600">Low (12.4%)</div>
              <span className="text-[10px] text-muted-foreground">All active drivers within safety thresholds</span>
            </div>
            <div className="p-4 rounded-lg bg-muted/30 border border-border space-y-1">
              <span className="text-[11px] text-muted-foreground">CORRIDOR ROTATION CYCLE</span>
              <div className="text-2xl font-bold text-primary">7-Day Rolling</div>
              <span className="text-[10px] text-muted-foreground">Next shift swap: Tomorrow 04:00 IST</span>
            </div>
            <div className="p-4 rounded-lg bg-muted/30 border border-border space-y-1">
              <span className="text-[11px] text-muted-foreground">RESTING DRIVERS</span>
              <div className="text-2xl font-bold text-foreground">
                {crewMembers.filter(c => c.status === 'RESTING_COMPLIANT' || c.isStandby).length || 8} Compliant
              </div>
              <span className="text-[10px] text-emerald-500">✓ Zero rest compliance violations</span>
            </div>
          </div>

          <div className="p-4 rounded bg-muted/20 border border-border space-y-3">
            <div className="font-bold text-foreground flex items-center justify-between">
              <span>High-Demand Corridor Rotation Assignment</span>
              <span className="text-xs text-muted-foreground font-normal">Active Cycle: Week 36</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2.5 rounded bg-background border border-border/80">
                <div>
                  <span className="font-bold text-foreground">Corridor 534 (Mehrauli ⇄ Anand Vihar)</span>
                  <span className="text-muted-foreground text-[11px] block">High Density • 32 km • Peak Congestion</span>
                </div>
                <div className="text-right">
                  <span className="text-emerald-500 font-bold">DRV-1044 (Suresh Yadav)</span>
                  <span className="text-[10px] text-muted-foreground block">Rotated from Trunk 570</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded bg-background border border-border/80">
                <div>
                  <span className="font-bold text-foreground">Corridor 429 (Kashmere Gate ⇄ Saket)</span>
                  <span className="text-muted-foreground text-[11px] block">Urban Arterial • 28 km • Metro Feeder</span>
                </div>
                <div className="text-right">
                  <span className="text-emerald-500 font-bold">DRV-1042 (Rajesh Kumar)</span>
                  <span className="text-[10px] text-muted-foreground block">Rotated from Feeder 11G</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LONG JOURNEY CHANGEOVER */}
      {activeFeature === 'longjourney' && (
        <div className="bg-card border border-border rounded-lg shadow-card p-5 space-y-4 font-mono text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
            <div>
              <h2 className="text-base font-bold font-sans text-foreground">
                Long Journey Driver Changeover Plan (Interstate Routes)
              </h2>
              <p className="text-xs text-muted-foreground font-sans mt-0.5">
                Mandated handover points for routes exceeding 200 km to guarantee safe driver rest windows.
              </p>
            </div>

            {/* Changeover Mode Badges */}
            <div className="flex items-center space-x-1 font-mono text-xs">
              <a
                href="/admin/management/longjourney?view=plan"
                className={`px-2.5 py-1 rounded transition ${subFilter === 'plan' || subFilter === 'all' ? 'bg-primary text-primary-foreground font-bold' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
              >
                Changeover Plan
              </a>
              <a
                href="/admin/management/longjourney?view=upcoming"
                className={`px-2.5 py-1 rounded transition ${subFilter === 'upcoming' ? 'bg-primary text-primary-foreground font-bold' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
              >
                Upcoming Handovers
              </a>
            </div>
          </div>

          {(subFilter === 'plan' || subFilter === 'all') && (
            <div className="p-4 rounded bg-muted/30 border border-border space-y-2">
              <div className="text-base font-bold text-primary">Corridor: Delhi → Jaipur Express (280 km)</div>
              <div>Changeover Station: <strong>KOTPUTLI MIDWAY (~200 km)</strong></div>
              <div>Primary Driver: <strong className="text-foreground">DRV-1042 (Rajesh Kumar)</strong></div>
              <div>Replacement Driver: <strong className="text-foreground">DRV-1091 (Sanjay Sharma)</strong></div>
              <div className="text-emerald-600 dark:text-emerald-400 font-bold pt-2 border-t border-border">
                ✓ Handoff confirmed. Mandatory rest window satisfied for both drivers.
              </div>
            </div>
          )}

          {subFilter === 'upcoming' && (
            <div className="space-y-3">
              <div className="p-3 rounded bg-card border border-border flex items-center justify-between">
                <div>
                  <span className="font-bold text-foreground">Delhi → Chandigarh Express (Route 701)</span>
                  <span className="text-[11px] text-muted-foreground block">Handover at Karnal Toll Plaza (~125 km)</span>
                </div>
                <div className="text-right">
                  <span className="text-primary font-bold font-mono">ETA: 42 mins</span>
                  <span className="text-[10px] text-emerald-500 block">Replacement Driver On Site</span>
                </div>
              </div>
              <div className="p-3 rounded bg-card border border-border flex items-center justify-between">
                <div>
                  <span className="font-bold text-foreground">Delhi → Agra Taj Corridor (Route 804)</span>
                  <span className="text-[11px] text-muted-foreground block">Handover at Mathura Expressway Hub (~140 km)</span>
                </div>
                <div className="text-right">
                  <span className="text-primary font-mono font-bold">ETA: 1h 18m</span>
                  <span className="text-[10px] text-emerald-500 block">Replacement Driver Checked In</span>
                </div>
              </div>
            </div>
          )}

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
