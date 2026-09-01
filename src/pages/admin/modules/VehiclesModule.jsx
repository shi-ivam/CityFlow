import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Bus, Wrench, Search, CheckCircle2, Clock, MapPin, ArrowRight } from 'lucide-react';

export default function VehiclesModule({ busFleet = [], dutyAssignments = [], routes = [] }) {
  const location = useLocation();
  const path = location.pathname;
  const searchParams = new URLSearchParams(location.search);
  const subFilter = searchParams.get('view') || 'all';

  const [searchTerm, setSearchTerm] = useState('');

  let activeFeature = 'overview';
  if (path.includes('/vehicles/fleet')) activeFeature = 'fleet';
  else if (path.includes('/vehicles/livestatus')) activeFeature = 'livestatus';
  else if (path.includes('/vehicles/assignments')) activeFeature = 'assignments';
  else if (path.includes('/vehicles/availability')) activeFeature = 'availability';
  else if (path.includes('/vehicles/maintenance')) activeFeature = 'maintenance';

  const totalBuses = busFleet.length || 160;
  const activeBuses = busFleet.filter(b => b.status === 'IN_SERVICE').length || 142;
  const idleBuses = busFleet.filter(b => b.status === 'STANDBY_READY' || b.status === 'AVAILABLE').length || 12;
  const maintenanceBuses = busFleet.filter(b => b.status === 'MAINTENANCE').length || 6;

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto font-sans">
      
      {/* Breadcrumb Header */}
      <div className="border-b border-border pb-4">
        <div className="text-xs font-mono text-muted-foreground uppercase font-semibold">
          ADMIN / VEHICLES / {activeFeature.toUpperCase()}
        </div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight mt-1">
          Vehicle Fleet & Asset Operations
        </h1>
        <p className="text-xs text-muted-foreground">
          Real-time GPS telemetry, Indian registration tracking, route assignments, and maintenance logs.
        </p>
      </div>

      {/* OVERVIEW STATS */}
      {activeFeature === 'overview' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card border border-border p-4 rounded-lg shadow-card">
            <div className="text-xs font-mono text-muted-foreground">TOTAL BUSES</div>
            <div className="text-3xl font-bold font-mono text-foreground mt-1">{totalBuses}</div>
            <div className="text-[11px] text-muted-foreground font-mono mt-1">Delhi Fleet Asset Roster</div>
          </div>

          <div className="bg-card border border-border p-4 rounded-lg shadow-card">
            <div className="text-xs font-mono text-muted-foreground">ACTIVE IN SERVICE</div>
            <div className="text-3xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">{activeBuses}</div>
            <div className="text-[11px] text-emerald-600 font-mono mt-1">✓ Corridors Operational</div>
          </div>

          <div className="bg-card border border-border p-4 rounded-lg shadow-card">
            <div className="text-xs font-mono text-muted-foreground">IDLE (DEPOT STANDBY)</div>
            <div className="text-3xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">{idleBuses}</div>
            <div className="text-[11px] text-muted-foreground font-mono mt-1">Ready for backup dispatch</div>
          </div>

          <div className="bg-card border border-border p-4 rounded-lg shadow-card">
            <div className="text-xs font-mono text-muted-foreground">MAINTENANCE</div>
            <div className="text-3xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-1">{maintenanceBuses}</div>
            <div className="text-[11px] text-rose-500 font-mono mt-1">Workshop Inspection</div>
          </div>
        </div>
      )}

      {/* FLEET TABLE */}
      {(activeFeature === 'fleet' || activeFeature === 'overview') && (
        <div className="bg-card border border-border rounded-lg shadow-card overflow-hidden">
          <div className="p-3 bg-muted/30 border-b border-border flex items-center justify-between">
            <div className="relative w-72">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search registration number, vehicle ID..."
                className="w-full pl-9 pr-3 py-1.5 rounded-md bg-card border border-input text-xs text-foreground placeholder:text-muted-foreground outline-none font-sans"
              />
            </div>
            <span className="text-xs font-mono text-muted-foreground">Filter: {subFilter.toUpperCase()}</span>
          </div>

          <table className="w-full border-collapse text-left text-xs font-sans">
            <thead>
              <tr className="bg-muted/60 border-b border-border font-mono text-muted-foreground uppercase text-[11px]">
                <th className="p-3">Asset ID</th>
                <th className="p-3 font-mono">Registration Number</th>
                <th className="p-3">Vehicle Type</th>
                <th className="p-3 text-center">Seating Capacity</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {busFleet.map((bus) => (
                <tr key={bus.id} className="hover:bg-accent/50 transition-colors">
                  <td className="p-3 font-mono font-bold text-foreground">{bus.id}</td>
                  <td className="p-3 font-mono font-bold text-primary">{bus.busNumber}</td>
                  <td className="p-3 text-foreground">{bus.type}</td>
                  <td className="p-3 font-mono text-center font-bold text-foreground">{bus.capacity} Seats</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full font-mono text-[10px] font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                      {bus.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* LIVE STATUS */}
      {activeFeature === 'livestatus' && (
        <div className="bg-card border border-border rounded-lg shadow-card p-5 space-y-4">
          <h2 className="text-base font-bold text-foreground border-b border-border pb-2">
            Live Vehicle Telemetry & Location Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-md border border-border bg-muted/20 space-y-2 font-mono text-xs">
              <div className="text-base font-bold text-primary">DL 01 AB 4821</div>
              <div className="text-muted-foreground">Route: <strong>534 (Kashmere Gate → Saket)</strong></div>
              <div className="text-muted-foreground">Current Location: <strong>Connaught Place / Rajiv Chowk</strong></div>
              <div className="text-muted-foreground">Passenger Occupancy: <strong className="text-foreground">87%</strong></div>
              <div className="inline-block px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-500/30">
                ON TIME
              </div>
            </div>

            <div className="p-4 rounded-md border border-border bg-muted/20 space-y-2 font-mono text-xs">
              <div className="text-base font-bold text-primary">MH 12 KT 7421</div>
              <div className="text-muted-foreground">Route: <strong>725 (Anand Vihar → Dwarka)</strong></div>
              <div className="text-muted-foreground">Current Location: <strong>AIIMS Medical Hub</strong></div>
              <div className="text-muted-foreground">Passenger Occupancy: <strong className="text-foreground">94%</strong></div>
              <div className="inline-block px-2 py-0.5 rounded bg-amber-500/15 text-amber-800 dark:text-amber-300 font-bold border border-amber-500/30">
                DELAYED +6m
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ASSIGNMENTS */}
      {activeFeature === 'assignments' && (
        <div className="bg-card border border-border rounded-lg shadow-card p-5 space-y-3 font-mono text-xs">
          <h2 className="text-base font-bold font-sans text-foreground border-b border-border pb-2">
            Vehicle → Driver → Route Assignments
          </h2>
          <div className="p-3 rounded bg-muted/30 border border-border flex items-center justify-between">
            <span className="font-bold text-primary">DL 01 AB 4821</span>
            <span>↓</span>
            <span className="font-bold text-foreground">DRV-1042 (Rajesh Kumar)</span>
            <span>↓</span>
            <span className="font-bold text-amber-500">Route 534</span>
          </div>
        </div>
      )}

      {/* MAINTENANCE */}
      {activeFeature === 'maintenance' && (
        <div className="bg-card border border-border rounded-lg shadow-card p-5 space-y-3">
          <h2 className="text-base font-bold text-foreground border-b border-border pb-2">
            Fleet Maintenance Inspection Log
          </h2>
          <div className="p-3 rounded bg-muted/30 border border-border font-mono text-xs text-muted-foreground">
            3 vehicles currently undergoing scheduled workshop inspection & battery cell health calibration.
          </div>
        </div>
      )}

    </div>
  );
}
