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
    <div className="bg-[#FFFFFF] border-b border-[#EAEAEA] px-4 lg:px-8 py-2.5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 z-20 shrink-0">
      
      {/* 1. Crew Utilization Rate */}
      <div className="bg-[#FBFBFA] rounded-[8px] p-2.5 border border-[#EAEAEA] flex items-center justify-between">
        <div>
          <div className="text-[11px] font-mono text-[#787774] flex items-center space-x-1.5">
            <Users className="w-3 h-3 text-[#111111]" />
            <span>Crew Util. (CU)</span>
          </div>
          <div className="flex items-baseline space-x-1 mt-0.5">
            <span className="text-base font-bold text-[#111111] font-mono">{crewUtilization.rate}%</span>
            <span className="text-[10px] text-[#787774] font-mono">({crewUtilization.totalDutyHours}h / {crewUtilization.totalContractedHours}h)</span>
          </div>
        </div>
        <span className="px-1.5 py-0.5 rounded-[4px] bg-[#E1F3FE] text-[#1F6C9F] text-[10px] font-mono font-bold">
          CU
        </span>
      </div>

      {/* 2. Network Reach */}
      <div className="bg-[#FBFBFA] rounded-[8px] p-2.5 border border-[#EAEAEA] flex items-center justify-between">
        <div>
          <div className="text-[11px] font-mono text-[#787774] flex items-center space-x-1.5">
            <Map className="w-3 h-3 text-[#111111]" />
            <span>Network Reach</span>
          </div>
          <div className="flex items-baseline space-x-1 mt-0.5">
            <span className="text-base font-bold text-[#111111] font-mono">{networkCoverageKm}</span>
            <span className="text-[10px] text-[#787774] font-mono">km unique</span>
          </div>
        </div>
        <span className="px-1.5 py-0.5 rounded-[4px] bg-[#EDF3EC] text-[#346538] text-[10px] font-mono font-bold">
          GIS
        </span>
      </div>

      {/* 3. Deadhead Ratio */}
      <div className="bg-[#FBFBFA] rounded-[8px] p-2.5 border border-[#EAEAEA] flex items-center justify-between">
        <div>
          <div className="text-[11px] font-mono text-[#787774] flex items-center space-x-1.5">
            <Clock className="w-3 h-3 text-[#111111]" />
            <span>Deadhead Ratio</span>
          </div>
          <div className="flex items-baseline space-x-1 mt-0.5">
            <span className="text-base font-bold text-[#111111] font-mono">{deadheadRatio}%</span>
            <span className="text-[10px] text-[#787774] font-mono">15m Hubs</span>
          </div>
        </div>
        <span className="px-1.5 py-0.5 rounded-[4px] bg-[#FBF3DB] text-[#956400] text-[10px] font-mono font-bold">
          HUB
        </span>
      </div>

      {/* 4. Duty Structure (Linked vs Unlinked) */}
      <div className="bg-[#FBFBFA] rounded-[8px] p-2.5 border border-[#EAEAEA] flex items-center justify-between">
        <div>
          <div className="text-[11px] font-mono text-[#787774] flex items-center space-x-1.5">
            <TrendingUp className="w-3 h-3 text-[#111111]" />
            <span>Duty Structure</span>
          </div>
          <div className="flex items-center space-x-1.5 mt-0.5 text-xs font-mono font-bold">
            <span className="text-[#1F6C9F]">{linkedDutiesCount}L Linked</span>
            <span className="text-[#EAEAEA]">/</span>
            <span className="text-[#956400]">{unlinkedDutiesCount}U Hub</span>
          </div>
        </div>
        <div className="flex flex-col space-y-1">
          <span className="w-3 h-1 rounded-[2px] bg-[#1F6C9F]"></span>
          <span className="w-3 h-1 rounded-[2px] bg-[#956400]"></span>
        </div>
      </div>

      {/* 5. Fleet In Service */}
      <div className="bg-[#FBFBFA] rounded-[8px] p-2.5 border border-[#EAEAEA] flex items-center justify-between">
        <div>
          <div className="text-[11px] font-mono text-[#787774] flex items-center space-x-1.5">
            <Bus className="w-3 h-3 text-[#111111]" />
            <span>Fleet Active</span>
          </div>
          <div className="flex items-baseline space-x-1 mt-0.5">
            <span className="text-base font-bold text-[#111111] font-mono">{activeBusesCount}</span>
            <span className="text-[10px] text-[#787774] font-mono">/ {totalBusesCount} EVs</span>
          </div>
        </div>
        <span className="px-1.5 py-0.5 rounded-[4px] bg-[#F7F6F3] text-[#787774] border border-[#EAEAEA] text-[10px] font-mono font-bold">
          EV
        </span>
      </div>

      {/* 6. Rest Safety */}
      <div 
        onClick={conflictsCount > 0 ? onOpenFallbackModal : undefined}
        className={`rounded-[8px] p-2.5 border flex items-center justify-between transition cursor-pointer ${
          conflictsCount > 0 
            ? 'bg-[#FDEBEC] border-[#F7D2D4] text-[#9F2F2D]' 
            : 'bg-[#FBFBFA] border-[#EAEAEA]'
        }`}
      >
        <div>
          <div className="text-[11px] font-mono flex items-center space-x-1.5">
            {conflictsCount > 0 ? (
              <AlertTriangle className="w-3 h-3 text-[#9F2F2D]" />
            ) : (
              <ShieldCheck className="w-3 h-3 text-[#346538]" />
            )}
            <span className={conflictsCount > 0 ? "text-[#9F2F2D] font-bold" : "text-[#787774]"}>
              Rest Safety (11h)
            </span>
          </div>
          <div className="flex items-baseline space-x-1 mt-0.5">
            <span className={`text-base font-bold font-mono ${conflictsCount > 0 ? 'text-[#9F2F2D]' : 'text-[#346538]'}`}>
              {complianceScore}%
            </span>
            {conflictsCount > 0 && (
              <span className="text-[10px] text-[#9F2F2D] font-mono font-bold">
                (1 VIOLATION)
              </span>
            )}
          </div>
        </div>
        <span className={`px-1.5 py-0.5 rounded-[4px] text-[10px] font-mono font-bold ${
          conflictsCount > 0 ? 'bg-[#9F2F2D] text-white' : 'bg-[#EDF3EC] text-[#346538]'
        }`}>
          {conflictsCount > 0 ? 'FIX' : '100%'}
        </span>
      </div>

    </div>
  );
}
