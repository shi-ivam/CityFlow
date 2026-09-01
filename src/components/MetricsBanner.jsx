import React from 'react';
import { 
  Users, 
  Map, 
  Clock, 
  TrendingUp, 
  ShieldCheck, 
  AlertTriangle, 
  Link2, 
  Unlink, 
  Bus 
} from 'lucide-react';

export default function MetricsBanner({
  crewUtilization,
  networkCoverageKm,
  deadheadRatio,
  overlapStats,
  activeBusesCount,
  totalBusesCount,
  linkedDutiesCount,
  unlinkedDutiesCount,
  conflictsCount,
  onOpenFallbackModal
}) {
  const complianceScore = conflictsCount === 0 ? 100 : Math.max(0, 100 - (conflictsCount * 12.5));

  return (
    <div className="bg-[#080e1e]/95 border-b border-white/10 px-4 lg:px-6 py-2.5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 z-20 shrink-0">
      
      {/* 1. Crew Utilization Rate (CU) */}
      <div className="bg-slate-900/80 rounded-xl p-2.5 border border-white/5 flex items-center justify-between group hover:border-brand-500/30 transition">
        <div>
          <div className="flex items-center space-x-1.5 text-[11px] font-mono text-slate-400">
            <Users className="w-3.5 h-3.5 text-brand-400" />
            <span>Crew Util. (CU)</span>
          </div>
          <div className="flex items-baseline space-x-1.5 mt-0.5">
            <span className="text-lg font-display font-black text-white">{crewUtilization.rate}%</span>
            <span className="text-[10px] text-slate-400 font-mono">({crewUtilization.totalDutyHours}h / {crewUtilization.totalContractedHours}h)</span>
          </div>
        </div>
        <div className="w-9 h-9 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 font-bold text-xs font-mono">
          CU
        </div>
      </div>

      {/* 2. Network Route Coverage */}
      <div className="bg-slate-900/80 rounded-xl p-2.5 border border-white/5 flex items-center justify-between group hover:border-emerald-500/30 transition">
        <div>
          <div className="flex items-center space-x-1.5 text-[11px] font-mono text-slate-400">
            <Map className="w-3.5 h-3.5 text-emerald-400" />
            <span>Network Reach</span>
          </div>
          <div className="flex items-baseline space-x-1.5 mt-0.5">
            <span className="text-lg font-display font-black text-white">{networkCoverageKm}</span>
            <span className="text-xs text-slate-400 font-mono">km unique</span>
          </div>
        </div>
        <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-xs font-mono">
          GIS
        </div>
      </div>

      {/* 3. Deadhead Ratio */}
      <div className="bg-slate-900/80 rounded-xl p-2.5 border border-white/5 flex items-center justify-between group hover:border-amber-500/30 transition">
        <div>
          <div className="flex items-center space-x-1.5 text-[11px] font-mono text-slate-400">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Deadhead Ratio</span>
          </div>
          <div className="flex items-baseline space-x-1.5 mt-0.5">
            <span className="text-lg font-display font-black text-white">{deadheadRatio}%</span>
            <span className="text-[10px] text-amber-400/80 font-mono">15m Hubs</span>
          </div>
        </div>
        <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-xs font-mono">
          HUB
        </div>
      </div>

      {/* 4. Linked vs Unlinked Duties */}
      <div className="bg-slate-900/80 rounded-xl p-2.5 border border-white/5 flex items-center justify-between group hover:border-sky-500/30 transition">
        <div>
          <div className="flex items-center space-x-1.5 text-[11px] font-mono text-slate-400">
            <TrendingUp className="w-3.5 h-3.5 text-sky-400" />
            <span>Duty Structure</span>
          </div>
          <div className="flex items-center space-x-2 mt-0.5">
            <div className="flex items-center space-x-1 text-xs font-mono font-bold text-sky-400" title="Linked Duties (Solid Blue)">
              <Link2 className="w-3 h-3" />
              <span>{linkedDutiesCount}L</span>
            </div>
            <span className="text-slate-600">/</span>
            <div className="flex items-center space-x-1 text-xs font-mono font-bold text-amber-400" title="Unlinked Duties (Dashed Amber)">
              <Unlink className="w-3 h-3" />
              <span>{unlinkedDutiesCount}U</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col space-y-1">
          <span className="w-4 h-1 rounded bg-sky-400" title="Linked"></span>
          <span className="w-4 h-1 rounded bg-amber-400 border-dashed" title="Unlinked"></span>
        </div>
      </div>

      {/* 5. Active Fleet In Service */}
      <div className="bg-slate-900/80 rounded-xl p-2.5 border border-white/5 flex items-center justify-between group hover:border-cyan-500/30 transition">
        <div>
          <div className="flex items-center space-x-1.5 text-[11px] font-mono text-slate-400">
            <Bus className="w-3.5 h-3.5 text-cyan-400" />
            <span>Fleet Active</span>
          </div>
          <div className="flex items-baseline space-x-1.5 mt-0.5">
            <span className="text-lg font-display font-black text-white">{activeBusesCount}</span>
            <span className="text-xs text-slate-400 font-mono">/ {totalBusesCount} EVs</span>
          </div>
        </div>
        <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold text-xs font-mono">
          EV
        </div>
      </div>

      {/* 6. Rest Compliance & Safety Score */}
      <div 
        onClick={conflictsCount > 0 ? onOpenFallbackModal : undefined}
        className={`rounded-xl p-2.5 border flex items-center justify-between transition cursor-pointer ${
          conflictsCount > 0 
            ? 'bg-rose-950/40 border-rose-500/50 hover:bg-rose-950/60 shadow-lg shadow-rose-950/50' 
            : 'bg-slate-900/80 border-white/5 hover:border-emerald-500/30'
        }`}
      >
        <div>
          <div className="flex items-center space-x-1.5 text-[11px] font-mono">
            {conflictsCount > 0 ? (
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400 animate-bounce" />
            ) : (
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            )}
            <span className={conflictsCount > 0 ? "text-rose-300 font-bold" : "text-slate-400"}>
              Rest Safety (11h)
            </span>
          </div>
          <div className="flex items-baseline space-x-1.5 mt-0.5">
            <span className={`text-lg font-display font-black ${conflictsCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {complianceScore}%
            </span>
            {conflictsCount > 0 && (
              <span className="text-[10px] text-rose-300 font-mono font-bold bg-rose-900/80 px-1.5 py-0.2 rounded">
                {conflictsCount} VIOLATION
              </span>
            )}
          </div>
        </div>
        <div className={`w-9 h-9 rounded-lg border flex items-center justify-center font-bold text-xs font-mono ${
          conflictsCount > 0 ? 'bg-rose-500/20 border-rose-500 text-rose-300' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
        }`}>
          {conflictsCount > 0 ? 'FIX' : '100%'}
        </div>
      </div>

    </div>
  );
}
