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
    <div className="bg-[#18191D] border-b border-[#2B2D35] px-3 sm:px-5 py-2.5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-[#F1F5F9] font-sans text-xs select-none">
      
      {/* KPI 1: Active Buses */}
      <div className="flex items-center space-x-2.5 px-3 py-1.5 rounded-lg bg-[#212227] border border-[#32353E] shadow-xs">
        <div className="w-7 h-7 rounded-md bg-[#AAB9CF]/15 text-[#AAB9CF] flex items-center justify-center shrink-0 border border-[#AAB9CF]/20">
          <Bus className="w-3.5 h-3.5" />
        </div>
        <div className="min-w-0">
          <div className="text-[10px] font-mono uppercase text-[#AAB9CF] font-semibold tracking-wider truncate">
            Active Buses
          </div>
          <div className="flex items-center space-x-1.5 mt-0.5">
            <span className="font-mono font-bold text-sm text-[#F1F5F9]">{activeBusesCount} / {totalBusesCount}</span>
            <span className="text-[10px] font-mono text-emerald-400 font-semibold">({busDeploymentPct}%)</span>
          </div>
        </div>
      </div>

      {/* KPI 2: Driver Status */}
      <div className="flex items-center space-x-2.5 px-3 py-1.5 rounded-lg bg-[#212227] border border-[#32353E] shadow-xs">
        <div className="w-7 h-7 rounded-md bg-[#AAB9CF]/15 text-[#AAB9CF] flex items-center justify-center shrink-0 border border-[#AAB9CF]/20">
          <Users className="w-3.5 h-3.5" />
        </div>
        <div className="min-w-0">
          <div className="text-[10px] font-mono uppercase text-[#AAB9CF] font-semibold tracking-wider truncate">
            Driver Status
          </div>
          <div className="flex items-center space-x-1.5 mt-0.5 text-[11px] font-mono">
            <span className="text-emerald-400 font-bold">{activeDriversCount} ACT</span>
            <span className="text-slate-500">•</span>
            <span className="text-amber-400 font-bold">{breakDriversCount} BRK</span>
            <span className="text-slate-500">•</span>
            <span className="text-[#AAB9CF] font-bold">{standbyDriversCount} SBY</span>
          </div>
        </div>
      </div>

      {/* KPI 3: Corridor Overlap */}
      <div className="flex items-center space-x-2.5 px-3 py-1.5 rounded-lg bg-[#212227] border border-[#32353E] shadow-xs">
        <div className="w-7 h-7 rounded-md bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/25">
          <Route className="w-3.5 h-3.5" />
        </div>
        <div className="min-w-0">
          <div className="text-[10px] font-mono uppercase text-[#AAB9CF] font-semibold tracking-wider truncate">
            Corridor Overlap
          </div>
          <div className="flex items-center space-x-1.5 mt-0.5">
            <span className={`font-mono font-bold text-sm ${corridorOverlapPct > 15 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {corridorOverlapPct}%
            </span>
            <span className="text-[10px] font-mono text-[#8E9BAE]">Avg Corridor</span>
          </div>
        </div>
      </div>

      {/* KPI 4: Crew Utilization */}
      <div className="flex items-center space-x-2.5 px-3 py-1.5 rounded-lg bg-[#212227] border border-[#32353E] shadow-xs">
        <div className="w-7 h-7 rounded-md bg-[#AAB9CF]/15 text-[#AAB9CF] flex items-center justify-center shrink-0 border border-[#AAB9CF]/20">
          <Percent className="w-3.5 h-3.5" />
        </div>
        <div className="min-w-0">
          <div className="text-[10px] font-mono uppercase text-[#AAB9CF] font-semibold tracking-wider truncate">
            Crew Utilization
          </div>
          <div className="flex items-center space-x-1.5 mt-0.5">
            <span className="font-mono font-bold text-sm text-[#F1F5F9]">{crewUtilizationPct}%</span>
            <span className="text-[10px] font-mono text-[#8E9BAE]">Target &gt;88%</span>
          </div>
        </div>
      </div>

      {/* KPI 5: At-Risk Departures */}
      <div className="flex items-center space-x-2.5 px-3 py-1.5 rounded-lg bg-[#212227] border border-[#32353E] shadow-xs">
        <div className="w-7 h-7 rounded-md bg-rose-500/15 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/25">
          <Clock className="w-3.5 h-3.5" />
        </div>
        <div className="min-w-0">
          <div className="text-[10px] font-mono uppercase text-[#AAB9CF] font-semibold tracking-wider truncate">
            At-Risk Departures
          </div>
          <div className="flex items-center space-x-1.5 mt-0.5">
            <span className={`font-mono font-bold text-sm ${atRiskDeparturesCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {atRiskDeparturesCount}
            </span>
            <span className="text-[10px] font-mono text-[#8E9BAE]">Next 60m</span>
          </div>
        </div>
      </div>

      {/* KPI 6: Active Conflicts */}
      <div className="flex items-center space-x-2.5 px-3 py-1.5 rounded-lg bg-[#212227] border border-[#32353E] shadow-xs">
        <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 border ${
          activeConflictsCount > 0 
            ? 'bg-rose-500/15 text-rose-400 border-rose-500/30' 
            : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
        }`}>
          <AlertTriangle className="w-3.5 h-3.5" />
        </div>
        <div className="min-w-0">
          <div className="text-[10px] font-mono uppercase text-[#AAB9CF] font-semibold tracking-wider truncate">
            Active Conflicts
          </div>
          <div className="flex items-center space-x-1.5 mt-0.5">
            <span className={`font-mono font-bold text-sm ${activeConflictsCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {activeConflictsCount}
            </span>
            <span className="text-[10px] font-mono text-[#8E9BAE]">
              {activeConflictsCount > 0 ? 'Action Req' : 'Nominal'}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}
