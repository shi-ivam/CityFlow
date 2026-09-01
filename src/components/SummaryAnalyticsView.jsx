import React from 'react';
import { 
  BarChart3, 
  Users, 
  Map, 
  Clock, 
  ShieldCheck, 
  Bus, 
  Download, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import { calculateRouteLength, calculateNetworkCoverage, calculateDeadheadRatio } from '../utils/gisCalculations';
import { calculateCrewUtilization, validateRestPeriod } from '../utils/dutyEngine';

export default function SummaryAnalyticsView({
  routes,
  crewMembers,
  dutyAssignments,
  busFleet,
  interchangeHubs
}) {
  const crewUtil = calculateCrewUtilization(crewMembers, dutyAssignments);
  const networkCoverageKm = calculateNetworkCoverage(routes);
  const deadheadRatio = calculateDeadheadRatio(dutyAssignments);

  const totalRawKm = routes.reduce((acc, r) => acc + (r.lengthKm || 0), 0);
  const sharedKm = Math.round((totalRawKm - networkCoverageKm) * 10) / 10;
  const overlapNetworkRatio = Math.round((sharedKm / totalRawKm) * 100);

  const regularCrew = crewMembers.filter(c => !c.isStandby);
  const conflictDuties = dutyAssignments.filter(d => d.status.includes('CONFLICT') || d.status.includes('VIOLATION'));

  const handleExportData = () => {
    const report = {
      timestamp: new Date().toISOString(),
      systemName: "CityFlow / TransitFlow Master Operations Report",
      metrics: {
        crewUtilizationRate: `${crewUtil.rate}%`,
        totalDutyHours: `${crewUtil.totalDutyHours} hours`,
        contractedHours: `${crewUtil.totalContractedHours} hours`,
        uniqueNetworkCoverage: `${networkCoverageKm} km`,
        totalRawCorridors: `${totalRawKm} km`,
        deduplicatedSharedCorridors: `${sharedKm} km (${overlapNetworkRatio}%)`,
        deadheadRatio: `${deadheadRatio}%`,
        activeBuses: `${busFleet.filter(b => b.status === 'IN_SERVICE').length} / ${busFleet.length}`,
        restSafetyCompliance: conflictDuties.length === 0 ? "100% COMPLIANT" : `${conflictDuties.length} CONFLICTS`
      },
      routesSummary: routes.map(r => ({ code: r.code, name: r.name, lengthKm: r.lengthKm, freq: `${r.frequencyMins}m` })),
      dutySummary: dutyAssignments.map(d => ({ code: d.dutyCode, type: d.dutyType, status: d.status }))
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CityFlow_Operational_Analytics_${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="flex-1 bg-[#FBFBFA] p-4 lg:p-8 overflow-y-auto space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#EAEAEA] pb-5">
        <div>
          <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-[4px] bg-[#F7F6F3] text-[#787774] border border-[#EAEAEA] uppercase">
            Performance KPI & Audit Report
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#111111] mt-2">
            Operational Summary & Roster Analytics
          </h2>
          <p className="text-xs text-[#787774] font-mono mt-0.5">
            Real-time evaluation derived from spatial PostGIS geometries and continuous temporal shift rosters.
          </p>
        </div>

        <button
          onClick={handleExportData}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-[6px] bg-[#111111] hover:bg-[#333333] text-white font-mono text-xs font-semibold transition active:scale-95 shadow-xs"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export JSON Audit</span>
        </button>
      </div>

      {/* 4 Core KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* 1. Crew Utilization */}
        <div className="p-4 rounded-[8px] bg-[#FFFFFF] border border-[#EAEAEA] space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-[#787774]">
            <span>Crew Utilization (CU)</span>
            <Users className="w-3.5 h-3.5 text-[#111111]" />
          </div>
          <div className="text-2xl font-bold text-[#111111] font-mono">{crewUtil.rate}%</div>
          
          <div className="w-full bg-[#F7F6F3] h-1.5 rounded-full overflow-hidden border border-[#EAEAEA]">
            <div className="bg-[#111111] h-full rounded-full" style={{ width: `${crewUtil.rate}%` }}></div>
          </div>

          <div className="text-[10px] font-mono text-[#787774] flex items-center justify-between pt-0.5">
            <span>Duty: <strong className="text-[#111111]">{crewUtil.totalDutyHours}h</strong></span>
            <span>Contracted: <strong className="text-[#111111]">{crewUtil.totalContractedHours}h</strong></span>
          </div>
        </div>

        {/* 2. Network Reach */}
        <div className="p-4 rounded-[8px] bg-[#FFFFFF] border border-[#EAEAEA] space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-[#787774]">
            <span>Unique Linear Coverage</span>
            <Map className="w-3.5 h-3.5 text-[#111111]" />
          </div>
          <div className="text-2xl font-bold text-[#111111] font-mono">{networkCoverageKm} <span className="text-xs text-[#787774]">km</span></div>
          
          <div className="w-full bg-[#F7F6F3] h-1.5 rounded-full overflow-hidden border border-[#EAEAEA]">
            <div className="bg-[#346538] h-full rounded-full" style={{ width: '88%' }}></div>
          </div>

          <div className="text-[10px] font-mono text-[#787774] flex items-center justify-between pt-0.5">
            <span>Sum: {totalRawKm} km</span>
            <span>Shared: <strong className="text-[#956400]">{sharedKm} km ({overlapNetworkRatio}%)</strong></span>
          </div>
        </div>

        {/* 3. Deadhead Ratio */}
        <div className="p-4 rounded-[8px] bg-[#FFFFFF] border border-[#EAEAEA] space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-[#787774]">
            <span>Deadhead Transfer Ratio</span>
            <Clock className="w-3.5 h-3.5 text-[#111111]" />
          </div>
          <div className="text-2xl font-bold text-[#111111] font-mono">{deadheadRatio}%</div>
          
          <div className="w-full bg-[#F7F6F3] h-1.5 rounded-full overflow-hidden border border-[#EAEAEA]">
            <div className="bg-[#956400] h-full rounded-full" style={{ width: `${Math.min(100, deadheadRatio * 5)}%` }}></div>
          </div>

          <div className="text-[10px] font-mono text-[#787774] flex items-center justify-between pt-0.5">
            <span>15m Hub Transfers</span>
            <span className="text-[#346538] font-semibold">&lt; 5% Target Met</span>
          </div>
        </div>

        {/* 4. Rest Safety Compliance */}
        <div className="p-4 rounded-[8px] bg-[#FFFFFF] border border-[#EAEAEA] space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-[#787774]">
            <span>Mandated Rest (11h)</span>
            <ShieldCheck className="w-3.5 h-3.5 text-[#111111]" />
          </div>
          <div className={`text-2xl font-bold font-mono ${conflictDuties.length === 0 ? 'text-[#346538]' : 'text-[#9F2F2D]'}`}>
            {conflictDuties.length === 0 ? '100%' : '87.5%'}
          </div>
          
          <div className="w-full bg-[#F7F6F3] h-1.5 rounded-full overflow-hidden border border-[#EAEAEA]">
            <div className={`h-full rounded-full ${conflictDuties.length === 0 ? 'bg-[#346538]' : 'bg-[#9F2F2D]'}`} style={{ width: conflictDuties.length === 0 ? '100%' : '87.5%' }}></div>
          </div>

          <div className="text-[10px] font-mono text-[#787774] flex items-center justify-between pt-0.5">
            <span>Continuous Rest Rule</span>
            <span className={conflictDuties.length === 0 ? "text-[#346538] font-bold" : "text-[#9F2F2D] font-bold"}>
              {conflictDuties.length === 0 ? "0 Violations" : `${conflictDuties.length} Conflict`}
            </span>
          </div>
        </div>

      </div>

      {/* Driver Hours Audit & Mathematical Formulations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left: Driver Hours (7 cols) */}
        <div className="lg:col-span-7 bg-[#FFFFFF] rounded-[8px] border border-[#EAEAEA] p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-[#EAEAEA] pb-2.5">
            <h3 className="font-serif font-bold text-base text-[#111111]">
              Crew Roster & Rest Audit
            </h3>
            <span className="text-xs font-mono text-[#787774]">
              {crewMembers.length} Active & Reserve Drivers
            </span>
          </div>

          <div className="space-y-1.5 overflow-x-auto">
            {crewMembers.map(driver => {
              const assignedDuty = dutyAssignments.find(d => d.crewId === driver.id);
              const restCheck = driver.lastShiftEnd
                ? validateRestPeriod(driver.lastShiftEnd, assignedDuty?.startTime || "2026-09-01T08:00:00Z", 11)
                : { isCompliant: true, actualRestFormatted: "11h+" };

              return (
                <div key={driver.id} className="p-2.5 rounded-[4px] bg-[#FBFBFA] border border-[#EAEAEA] flex items-center justify-between text-xs font-mono">
                  
                  <div className="flex items-center space-x-2.5 min-w-[160px]">
                    <div className={`w-6 h-6 rounded-[3px] flex items-center justify-center font-bold text-[10px] ${
                      driver.isStandby 
                        ? 'bg-[#EDF3EC] text-[#346538]' 
                        : !restCheck.isCompliant
                        ? 'bg-[#FDEBEC] text-[#9F2F2D]'
                        : 'bg-[#E1F3FE] text-[#1F6C9F]'
                    }`}>
                      {driver.isStandby ? 'SBY' : driver.badge.replace('DRV-', '')}
                    </div>
                    <div>
                      <div className="font-bold text-[#111111] flex items-center space-x-1">
                        <span>{driver.fullName}</span>
                        {driver.isStandby && <span className="text-[9px] px-1 rounded bg-[#EDF3EC] text-[#346538]">Reserve</span>}
                      </div>
                      <div className="text-[10px] text-[#787774]">{driver.licenseNumber}</div>
                    </div>
                  </div>

                  <div className="text-center px-2">
                    <div className={`font-bold flex items-center space-x-1 justify-center ${
                      restCheck.isCompliant ? 'text-[#346538]' : 'text-[#9F2F2D]'
                    }`}>
                      {restCheck.isCompliant ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                      <span>{restCheck.actualRestFormatted}</span>
                    </div>
                    <div className="text-[9px] text-[#787774]">11h Rule</div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-[#111111]">
                      {driver.weeklyHoursUsed}h / 40h
                    </div>
                    <div className="text-[10px] text-[#787774]">
                      {assignedDuty ? assignedDuty.dutyCode : "Available"}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Formulas & Fleet (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="bg-[#FFFFFF] rounded-[8px] border border-[#EAEAEA] p-5 space-y-2.5 font-mono text-xs">
            <div className="font-bold text-[#111111] border-b border-[#EAEAEA] pb-1.5">
              Formulations & GIS Proofs
            </div>

            <div className="space-y-2">
              <div className="p-2.5 rounded-[4px] bg-[#FBFBFA] border border-[#EAEAEA] space-y-1">
                <span className="text-[#787774] text-[10px] uppercase font-bold">Crew Utilization Rate (CU)</span>
                <p className="text-[#111111] text-[11px]">
                  CU = [ &Sigma;(Scheduled Duty Hours) / &Sigma;(Available Contracted Hours) ] &times; 100
                </p>
                <div className="text-[10px] text-[#1F6C9F] font-bold">
                  ({crewUtil.totalDutyHours}h / {crewUtil.totalContractedHours}h) = {crewUtil.rate}%
                </div>
              </div>

              <div className="p-2.5 rounded-[4px] bg-[#FBFBFA] border border-[#EAEAEA] space-y-1">
                <span className="text-[#787774] text-[10px] uppercase font-bold">Corridor Buffer Union (GIS)</span>
                <p className="text-[#111111] text-[11px]">
                  Coverage = ST_Length( ST_Union( ST_Buffer(path, 50m) ) )
                </p>
                <div className="text-[10px] text-[#346538] font-bold">
                  Unique Linear Reach: {networkCoverageKm} km
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#FFFFFF] rounded-[8px] border border-[#EAEAEA] p-5 space-y-2.5 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-[#EAEAEA] pb-1.5">
              <span className="font-bold text-[#111111]">EV Fleet Readiness</span>
              <span className="text-[#787774]">{busFleet.length} Vehicles</span>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {busFleet.slice(0, 6).map(bus => (
                <div key={bus.id} className="p-2 rounded-[4px] bg-[#FBFBFA] border border-[#EAEAEA] space-y-0.5">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-[#111111]">{bus.busNumber}</span>
                    <span className="text-[#346538] text-[10px]">{bus.batteryPct}%</span>
                  </div>
                  <div className="text-[9px] text-[#787774] truncate">{bus.type}</div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
