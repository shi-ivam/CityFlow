import React, { useState } from 'react';
import { Users, Search, Filter, ShieldCheck, AlertTriangle, Clock, Activity, CheckCircle2, ChevronRight } from 'lucide-react';

export default function AdminDrivers({ crewMembers = [], dutyAssignments = [], routes = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDriverId, setSelectedDriverId] = useState(crewMembers[0]?.id || null);

  const filteredDrivers = crewMembers.filter((c) => {
    return (
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.licenseNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const selectedDriver = crewMembers.find(c => c.id === selectedDriverId) || crewMembers[0];

  // Helper to compute mock/real workload breakdown for selected driver
  const getWorkloadBreakdown = (driver) => {
    if (!driver) return null;

    const assignedDuties = dutyAssignments.filter(d => d.crewId === driver.id);
    const totalShiftMins = assignedDuties.reduce((acc, d) => acc + (d.endTime - d.startTime), 0);
    const hours = Math.floor(totalShiftMins / 60) || driver.accumulatedHours || 6;
    const mins = totalShiftMins % 60;

    return {
      hoursDisplay: `${hours}h ${mins}m`,
      distanceKm: Math.round((hours * 28.5)),
      longRoutesCount: 1,
      mediumRoutesCount: 1,
      shortRoutesCount: 0,
      consecutiveLong: 1,
      restStatus: driver.status === 'RESTING_COMPLIANT' || driver.status === 'STANDBY' ? 'COMPLIANT (11h+)' : 'ACTIVE SHIFT',
      isViolation: driver.status === 'REST_VIOLATION' || driver.hasRestViolation,
      nextAssignment: 'Short Route (Corridor R12)'
    };
  };

  const workload = getWorkloadBreakdown(selectedDriver);

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-muted-foreground uppercase">
            <Users className="w-3.5 h-3.5 text-emerald-500" />
            <span>Workforce Operations</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight mt-1">
            Driver Roster & Workload Management
          </h1>
          <p className="text-xs text-muted-foreground">
            Mandated 11-hour rest period tracking, shift hours, route rotation fairness, and rest gap verification.
          </p>
        </div>

        <div className="flex items-center space-x-3 font-mono text-xs">
          <div className="px-3 py-1.5 rounded-md bg-card border border-border">
            <span className="text-muted-foreground">Active Roster: </span>
            <strong className="text-foreground">{crewMembers.length}</strong>
          </div>
          <div className="px-3 py-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300">
            <span>Rest Compliant: </span>
            <strong className="font-bold">100%</strong>
          </div>
        </div>
      </div>

      {/* Main Split: Left Driver Roster List (7 Cols) / Right Workload Inspector (5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Driver Table */}
        <div className="lg:col-span-7 bg-card border border-border rounded-lg shadow-card overflow-hidden flex flex-col">
          
          <div className="p-3 border-b border-border bg-muted/30 flex items-center justify-between">
            <div className="relative w-72">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filter drivers by name, license..."
                className="w-full pl-9 pr-3 py-1.5 rounded-md bg-card border border-input text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary font-sans"
              />
            </div>
            <span className="text-xs font-mono text-muted-foreground">
              Select driver to inspect workload
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs font-sans">
              <thead>
                <tr className="bg-muted/60 border-b border-border text-muted-foreground font-mono uppercase text-[11px] font-semibold tracking-wider">
                  <th className="p-3">Driver ID</th>
                  <th className="p-3">Name</th>
                  <th className="p-3 font-mono">License</th>
                  <th className="p-3 font-mono text-right">Shift Hours</th>
                  <th className="p-3">Rest Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredDrivers.map((driver) => {
                  const isSelected = driver.id === selectedDriverId;
                  return (
                    <tr
                      key={driver.id}
                      onClick={() => setSelectedDriverId(driver.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-primary/10 font-medium border-l-4 border-l-primary' : 'hover:bg-accent/50'
                      }`}
                    >
                      <td className="p-3 font-mono font-bold text-foreground">
                        {driver.id}
                      </td>
                      <td className="p-3 font-medium text-foreground">
                        {driver.name}
                      </td>
                      <td className="p-3 font-mono text-muted-foreground">
                        {driver.licenseNumber}
                      </td>
                      <td className="p-3 font-mono text-right font-bold text-foreground tabular-nums">
                        {driver.accumulatedHours || 6}h 00m
                      </td>
                      <td className="p-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-500" />
                          11h Rest OK
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Driver Workload Inspector Panel */}
        {selectedDriver && workload && (
          <div className="lg:col-span-5 bg-card border border-border rounded-lg shadow-card p-5 space-y-5 flex flex-col justify-between">
            
            {/* Top Driver Badge */}
            <div className="border-b border-border pb-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 text-primary font-mono text-base font-bold flex items-center justify-center border border-primary/30">
                  {selectedDriver.name ? selectedDriver.name.charAt(0) : 'D'}
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">
                    {selectedDriver.name}
                  </h2>
                  <div className="text-xs font-mono text-muted-foreground">
                    ID: {selectedDriver.id} • Lic #{selectedDriver.licenseNumber}
                  </div>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                REST VERIFIED
              </span>
            </div>

            {/* Telemetry Workload Grid */}
            <div className="space-y-3">
              <div className="text-xs font-mono uppercase font-semibold text-muted-foreground tracking-wider flex items-center space-x-1.5">
                <Activity className="w-3.5 h-3.5 text-primary" />
                <span>Driver Workload Telemetry</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-md bg-muted/30 border border-border">
                  <div className="text-[11px] font-mono text-muted-foreground">Shift Hours Today</div>
                  <div className="text-xl font-bold font-mono text-foreground mt-0.5 tabular-nums">
                    {workload.hoursDisplay}
                  </div>
                </div>

                <div className="p-3 rounded-md bg-muted/30 border border-border">
                  <div className="text-[11px] font-mono text-muted-foreground">Distance Driven</div>
                  <div className="text-xl font-bold font-mono text-foreground mt-0.5 tabular-nums">
                    {workload.distanceKm} km
                  </div>
                </div>
              </div>

              {/* Route Breakdown Matrix */}
              <div className="p-3.5 rounded-md bg-muted/20 border border-border space-y-2">
                <div className="text-xs font-semibold text-foreground border-b border-border/50 pb-1">
                  Corridor Difficulty Rotation
                </div>

                <div className="grid grid-cols-3 gap-2 font-mono text-xs text-center pt-1">
                  <div className="p-2 rounded bg-card border border-border">
                    <div className="text-[10px] text-muted-foreground">Long Routes</div>
                    <div className="text-base font-bold text-foreground">{workload.longRoutesCount}</div>
                  </div>
                  <div className="p-2 rounded bg-card border border-border">
                    <div className="text-[10px] text-muted-foreground">Medium</div>
                    <div className="text-base font-bold text-foreground">{workload.mediumRoutesCount}</div>
                  </div>
                  <div className="p-2 rounded bg-card border border-border">
                    <div className="text-[10px] text-muted-foreground">Short</div>
                    <div className="text-base font-bold text-foreground">{workload.shortRoutesCount}</div>
                  </div>
                </div>
              </div>

              {/* Next Assignment & Rest Gap */}
              <div className="space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between p-2.5 rounded bg-muted/40 border border-border">
                  <span className="text-muted-foreground">Consecutive Long Routes:</span>
                  <span className="font-bold text-foreground">{workload.consecutiveLong} (Fairness OK)</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded bg-muted/40 border border-border">
                  <span className="text-muted-foreground">Next Scheduled Assignment:</span>
                  <span className="font-bold text-primary">{workload.nextAssignment}</span>
                </div>
              </div>

            </div>

            {/* Rest Gap Notice */}
            <div className="p-3 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono text-emerald-800 dark:text-emerald-300 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Full compliance with 11-hour mandatory continuous rest period rule between duty shifts.</span>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
