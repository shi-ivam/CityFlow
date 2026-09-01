import React from 'react';
import { 
  Bus, 
  Users, 
  Route, 
  Percent, 
  AlertTriangle, 
  Clock
} from 'lucide-react';

export default function KPITelemetryStrip({
  buses = [],
  drivers = [],
  conflicts = [],
  corridorOverlapPct = 18.4,
  crewUtilizationPct = 91.2,
  atRiskDeparturesCount = 2
}) {
  const activeBusesCount = buses.filter(b => b.status === 'IN_SERVICE').length;
  const totalBusesCount = buses.length || 9;
  const busDeploymentPct = ((activeBusesCount / totalBusesCount) * 100).toFixed(0);

  const activeDriversCount = drivers.filter(d => d.status === 'ASSIGNED').length;
  const breakDriversCount = drivers.filter(d => d.status === 'BREAK').length;
  const standbyDriversCount = drivers.filter(d => d.status === 'STANDBY' || d.isStandby).length;

  const activeConflictsCount = conflicts.filter(c => c.status === 'ACTIVE').length;

  return (
    <div className="bg-[#212227] border-b border-[#32353E] px-3 sm:px-5 py-2.5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-[#212227] font-sans text-xs select-none">
      
      {/* KPI 1: Active Buses */}
      <div className="flex items-center space-x-2.5 px-3 py-2 rounded-xl bg-[#AAB9CF] border border-[#BAC8DB] shadow-sm">
        <div className="w-8 h-8 rounded-lg bg-[#212227] text-[#AAB9CF] flex items-center justify-center shrink-0 shadow-xs">
          <Bus className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <div className="text-[10px] font-mono uppercase text-[#212227]/80 font-bold tracking-wider truncate">
            Active Buses
          </div>
          <div className="flex items-center space-x-1.5 mt-0.5">
            <span className="font-mono font-bold text-sm text-[#212227]">{activeBusesCount} / {totalBusesCount}</span>
            <span className="text-[10px] font-mono text-emerald-800 font-bold">({busDeploymentPct}%)</span>
          </div>
        </div>
      </div>

      {/* KPI 2: Driver Status */}
      <div className="flex items-center space-x-2.5 px-3 py-2 rounded-xl bg-[#AAB9CF] border border-[#BAC8DB] shadow-sm">
        <div className="w-8 h-8 rounded-lg bg-[#212227] text-[#AAB9CF] flex items-center justify-center shrink-0 shadow-xs">
          <Users className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <div className="text-[10px] font-mono uppercase text-[#212227]/80 font-bold tracking-wider truncate">
            Driver Status
          </div>
          <div className="flex items-center space-x-1.5 mt-0.5 text-[11px] font-mono">
            <span className="text-emerald-900 font-bold">{activeDriversCount} ACT</span>
            <span className="text-[#212227]/40">•</span>
            <span className="text-amber-900 font-bold">{breakDriversCount} BRK</span>
            <span className="text-[#212227]/40">•</span>
            <span className="text-[#212227] font-bold">{standbyDriversCount} SBY</span>
          </div>
        </div>
      </div>

      {/* KPI 3: Corridor Overlap */}
      <div className="flex items-center space-x-2.5 px-3 py-2 rounded-xl bg-[#AAB9CF] border border-[#BAC8DB] shadow-sm">
        <div className="w-8 h-8 rounded-lg bg-[#212227] text-[#AAB9CF] flex items-center justify-center shrink-0 shadow-xs">
          <Route className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <div className="text-[10px] font-mono uppercase text-[#212227]/80 font-bold tracking-wider truncate">
            Corridor Overlap
          </div>
          <div className="flex items-center space-x-1.5 mt-0.5">
            <span className={`font-mono font-bold text-sm ${corridorOverlapPct > 15 ? 'text-amber-900' : 'text-emerald-900'}`}>
              {corridorOverlapPct}%
            </span>
            <span className="text-[10px] font-mono text-[#212227]/70 font-semibold">Avg Corridor</span>
          </div>
        </div>
      </div>

      {/* KPI 4: Crew Utilization */}
      <div className="flex items-center space-x-2.5 px-3 py-2 rounded-xl bg-[#AAB9CF] border border-[#BAC8DB] shadow-sm">
        <div className="w-8 h-8 rounded-lg bg-[#212227] text-[#AAB9CF] flex items-center justify-center shrink-0 shadow-xs">
          <Percent className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <div className="text-[10px] font-mono uppercase text-[#212227]/80 font-bold tracking-wider truncate">
            Crew Utilization
          </div>
          <div className="flex items-center space-x-1.5 mt-0.5">
            <span className="font-mono font-bold text-sm text-[#212227]">{crewUtilizationPct}%</span>
            <span className="text-[10px] font-mono text-[#212227]/70 font-semibold">Target &gt;88%</span>
          </div>
        </div>
      </div>

      {/* KPI 5: At-Risk Departures */}
      <div className="flex items-center space-x-2.5 px-3 py-2 rounded-xl bg-[#AAB9CF] border border-[#BAC8DB] shadow-sm">
        <div className="w-8 h-8 rounded-lg bg-[#212227] text-[#AAB9CF] flex items-center justify-center shrink-0 shadow-xs">
          <Clock className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <div className="text-[10px] font-mono uppercase text-[#212227]/80 font-bold tracking-wider truncate">
            At-Risk Departures
          </div>
          <div className="flex items-center space-x-1.5 mt-0.5">
            <span className={`font-mono font-bold text-sm ${atRiskDeparturesCount > 0 ? 'text-rose-900' : 'text-emerald-900'}`}>
              {atRiskDeparturesCount}
            </span>
            <span className="text-[10px] font-mono text-[#212227]/70 font-semibold">Next 60m</span>
          </div>
        </div>
      </div>

      {/* KPI 6: Active Conflicts */}
      <div className="flex items-center space-x-2.5 px-3 py-2 rounded-xl bg-[#AAB9CF] border border-[#BAC8DB] shadow-sm">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-xs ${
          activeConflictsCount > 0 
            ? 'bg-rose-900 text-[#AAB9CF]' 
            : 'bg-[#212227] text-[#AAB9CF]'
        }`}>
          <AlertTriangle className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <div className="text-[10px] font-mono uppercase text-[#212227]/80 font-bold tracking-wider truncate">
            Active Conflicts
          </div>
          <div className="flex items-center space-x-1.5 mt-0.5">
            <span className={`font-mono font-bold text-sm ${activeConflictsCount > 0 ? 'text-rose-900' : 'text-emerald-900'}`}>
              {activeConflictsCount}
            </span>
            <span className="text-[10px] font-mono text-[#212227]/70 font-semibold">
              {activeConflictsCount > 0 ? 'Action Req' : 'Nominal'}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}
