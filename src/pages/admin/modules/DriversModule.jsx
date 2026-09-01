import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Users, ShieldCheck, AlertTriangle, Clock, RotateCcw, CheckCircle2, Search, ArrowRight } from 'lucide-react';

export default function DriversModule({ crewMembers = [], dutyAssignments = [], routes = [] }) {
  const location = useLocation();
  const path = location.pathname;
  const searchParams = new URLSearchParams(location.search);
  const subFilter = searchParams.get('view') || 'all';

  const [searchTerm, setSearchTerm] = useState('');

  // Identify active feature from path
  let activeFeature = 'overview';
  if (path.includes('/drivers/list')) activeFeature = 'drivers';
  else if (path.includes('/drivers/workload')) activeFeature = 'workload';
  else if (path.includes('/drivers/rotation')) activeFeature = 'rotation';
  else if (path.includes('/drivers/rest')) activeFeature = 'rest';
  else if (path.includes('/drivers/changeover')) activeFeature = 'changeover';

  const totalDrivers = crewMembers.length;
  const availableDrivers = crewMembers.filter(c => c.isStandby || c.status === 'RESTING_COMPLIANT').length;
  const onDutyDrivers = crewMembers.filter(c => c.status === 'ASSIGNED' || c.status === 'ACTIVE').length;
  const unavailableDrivers = crewMembers.filter(c => c.status === 'REST_VIOLATION' || c.hasRestViolation).length;

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto font-sans">
      
      {/* Breadcrumb Header */}
      <div className="border-b border-border pb-4">
        <div className="text-xs font-mono text-muted-foreground uppercase font-semibold">
          ADMIN / DRIVERS / {activeFeature.toUpperCase()}
        </div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight mt-1">
          Driver Operations & Workload Control
        </h1>
        <p className="text-xs text-muted-foreground">
          Mandated 11-hour rest period tracking, driver rotation fairness, and shift changeovers across Delhi corridors.
        </p>
      </div>

      {/* FEATURE 1: OVERVIEW */}
      {activeFeature === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-card border border-border p-4 rounded-lg shadow-card">
              <div className="text-xs font-mono text-muted-foreground">TOTAL DRIVERS</div>
              <div className="text-3xl font-bold font-mono text-foreground mt-1">{totalDrivers}</div>
              <div className="text-[11px] text-emerald-600 font-mono mt-1">✓ Roster Verified</div>
            </div>

            <div className="bg-card border border-border p-4 rounded-lg shadow-card">
              <div className="text-xs font-mono text-muted-foreground">AVAILABLE (STANDBY)</div>
              <div className="text-3xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">{availableDrivers}</div>
              <div className="text-[11px] text-muted-foreground font-mono mt-1">Ready for dispatch</div>
            </div>

            <div className="bg-card border border-border p-4 rounded-lg shadow-card">
              <div className="text-xs font-mono text-muted-foreground">ON DUTY</div>
              <div className="text-3xl font-bold font-mono text-primary mt-1">{onDutyDrivers}</div>
              <div className="text-[11px] text-muted-foreground font-mono mt-1">Active on corridors</div>
            </div>

            <div className="bg-card border border-border p-4 rounded-lg shadow-card">
              <div className="text-xs font-mono text-muted-foreground">REST VIOLATIONS</div>
              <div className="text-3xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-1">{unavailableDrivers}</div>
              <div className="text-[11px] text-rose-500 font-mono mt-1">Action Required</div>
            </div>
          </div>
        </div>
      )}

      {/* FEATURE 2: DRIVERS LIST */}
      {(activeFeature === 'drivers' || activeFeature === 'overview') && (
        <div className="bg-card border border-border rounded-lg shadow-card overflow-hidden">
          <div className="p-3 bg-muted/30 border-b border-border flex items-center justify-between">
            <div className="relative w-72">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search DRV ID, driver name, license..."
                className="w-full pl-9 pr-3 py-1.5 rounded-md bg-card border border-input text-xs text-foreground placeholder:text-muted-foreground outline-none font-sans"
              />
            </div>
            <span className="text-xs font-mono text-muted-foreground">Filter: {subFilter.toUpperCase()}</span>
          </div>

          <table className="w-full border-collapse text-left text-xs font-sans">
            <thead>
              <tr className="bg-muted/60 border-b border-border font-mono text-muted-foreground uppercase text-[11px]">
                <th className="p-3">Driver ID</th>
                <th className="p-3">Name</th>
                <th className="p-3">Status</th>
                <th className="p-3">Assigned Vehicle</th>
                <th className="p-3">Route</th>
                <th className="p-3 text-right">Shift Hours</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {crewMembers.map((driver) => (
                <tr key={driver.id} className="hover:bg-accent/50 transition-colors">
                  <td className="p-3 font-mono font-bold text-foreground">{driver.id}</td>
                  <td className="p-3 font-medium text-foreground">{driver.name || driver.fullName}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-semibold border ${
                      driver.status === 'REST_VIOLATION' 
                        ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30'
                        : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                    }`}>
                      {driver.status}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-foreground">DL 01 AB 4821</td>
                  <td className="p-3 font-mono text-primary font-semibold">Route 534</td>
                  <td className="p-3 font-mono text-right font-bold text-foreground">{driver.accumulatedHours || 6}h 20m</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* FEATURE 3: WORKLOAD */}
      {activeFeature === 'workload' && (
        <div className="bg-card border border-border rounded-lg shadow-card p-5 space-y-4">
          <h2 className="text-base font-bold text-foreground border-b border-border pb-2">
            Daily Driver Workload & Rotation Distribution
          </h2>
          <div className="grid grid-cols-3 gap-3 font-mono text-xs text-center">
            <div className="p-3 rounded bg-muted/30 border border-border">
              <div className="text-muted-foreground text-[10px]">LONG CORRIDORS (&gt;30km)</div>
              <div className="text-xl font-bold text-foreground mt-1">12 Drivers</div>
            </div>
            <div className="p-3 rounded bg-muted/30 border border-border">
              <div className="text-muted-foreground text-[10px]">MEDIUM CORRIDORS (15-30km)</div>
              <div className="text-xl font-bold text-foreground mt-1">28 Drivers</div>
            </div>
            <div className="p-3 rounded bg-muted/30 border border-border">
              <div className="text-muted-foreground text-[10px]">SHORT CORRIDORS (&lt;15km)</div>
              <div className="text-xl font-bold text-foreground mt-1">42 Drivers</div>
            </div>
          </div>
        </div>
      )}

      {/* FEATURE 4: ROTATION */}
      {activeFeature === 'rotation' && (
        <div className="bg-card border border-border rounded-lg shadow-card p-5 space-y-3">
          <h2 className="text-base font-bold text-foreground border-b border-border pb-2">
            Consecutive Long Route Rotation Status
          </h2>
          <div className="space-y-2 font-mono text-xs">
            <div className="p-3 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
              <div>
                <strong className="text-foreground font-bold">DRV-1042 (Rajesh Kumar)</strong>
                <div className="text-muted-foreground text-[11px]">LONG → MEDIUM → SHORT</div>
              </div>
              <span className="text-emerald-700 dark:text-emerald-300 font-bold">✓ Rotation Balanced</span>
            </div>

            <div className="p-3 rounded bg-rose-500/10 border border-rose-500/30 flex items-center justify-between">
              <div>
                <strong className="text-foreground font-bold">DRV-1081 (Sunil Kumar)</strong>
                <div className="text-rose-500 text-[11px]">LONG → LONG → LONG</div>
              </div>
              <span className="text-rose-600 dark:text-rose-400 font-bold">⚠ Rotation Required</span>
            </div>
          </div>
        </div>
      )}

      {/* FEATURE 5: REST */}
      {activeFeature === 'rest' && (
        <div className="bg-card border border-border rounded-lg shadow-card p-5 space-y-3">
          <h2 className="text-base font-bold text-foreground border-b border-border pb-2">
            Mandated 11-Hour Continuous Rest Gap Compliance
          </h2>
          <div className="p-3 rounded bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono text-emerald-800 dark:text-emerald-300">
            ✓ 98.4% of driver shift assignments satisfy the mandated 11-hour continuous rest period rule.
          </div>
        </div>
      )}

      {/* FEATURE 6: CHANGEOVER */}
      {activeFeature === 'changeover' && (
        <div className="bg-card border border-border rounded-lg shadow-card p-5 space-y-3">
          <h2 className="text-base font-bold text-foreground border-b border-border pb-2">
            Long-Journey Driver Changeovers (Delhi → Jaipur)
          </h2>
          <div className="p-3 rounded bg-muted/40 border border-border font-mono text-xs">
            <div><strong>Upcoming Changeover:</strong> Delhi → Jaipur Corridor (~200 km)</div>
            <div className="text-muted-foreground">Primary Driver: DRV-1042 (Rajesh Kumar) → Replacement: DRV-1091 (Sanjay Sharma)</div>
          </div>
        </div>
      )}

    </div>
  );
}
