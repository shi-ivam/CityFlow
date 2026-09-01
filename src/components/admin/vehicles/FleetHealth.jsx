import React from 'react';
import { calculateFleetMetrics } from '../../../services/vehicleService';

export default function FleetHealth({ busFleet = [], onSelectStatus }) {
  const metrics = calculateFleetMetrics(busFleet);
  const total = metrics.total || 1;

  const inServicePct = (metrics.inService / total) * 100;
  const standbyPct = (metrics.standby / total) * 100;
  const maintenancePct = (metrics.maintenance / total) * 100;
  const offlinePct = (metrics.offline / total) * 100;

  return (
    <div className="py-2 space-y-3 font-sans">
      <div className="flex items-center justify-between text-xs font-mono">
        <div className="flex items-center space-x-3">
          <span className="text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">
            Fleet Health
          </span>
          <span className="text-muted-foreground">•</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
            {metrics.healthPct}% Operational Readiness
          </span>
        </div>

        <div className="flex items-center space-x-4 text-[11px] text-muted-foreground">
          <span className="cursor-pointer hover:text-foreground" onClick={() => onSelectStatus && onSelectStatus('IN_SERVICE')}>
            <strong className="text-foreground">{metrics.inService}</strong> In Service
          </span>
          <span className="cursor-pointer hover:text-foreground" onClick={() => onSelectStatus && onSelectStatus('STANDBY_READY')}>
            <strong className="text-foreground">{metrics.standby}</strong> Standby
          </span>
          <span className="cursor-pointer hover:text-foreground" onClick={() => onSelectStatus && onSelectStatus('MAINTENANCE')}>
            <strong className="text-foreground">{metrics.maintenance}</strong> Workshop
          </span>
        </div>
      </div>

      {/* Slim Segmented Bar */}
      <div className="h-1.5 w-full bg-muted/60 rounded-full overflow-hidden flex">
        {inServicePct > 0 && (
          <div 
            style={{ width: `${inServicePct}%` }} 
            className="bg-emerald-500 hover:opacity-85 transition-all cursor-pointer"
            onClick={() => onSelectStatus && onSelectStatus('IN_SERVICE')}
          />
        )}
        {standbyPct > 0 && (
          <div 
            style={{ width: `${standbyPct}%` }} 
            className="bg-amber-500 hover:opacity-85 transition-all cursor-pointer"
            onClick={() => onSelectStatus && onSelectStatus('STANDBY_READY')}
          />
        )}
        {maintenancePct > 0 && (
          <div 
            style={{ width: `${maintenancePct}%` }} 
            className="bg-rose-500 hover:opacity-85 transition-all cursor-pointer"
            onClick={() => onSelectStatus && onSelectStatus('MAINTENANCE')}
          />
        )}
        {offlinePct > 0 && (
          <div 
            style={{ width: `${offlinePct}%` }} 
            className="bg-muted-foreground hover:opacity-85 transition-all cursor-pointer"
            onClick={() => onSelectStatus && onSelectStatus('OFFLINE')}
          />
        )}
      </div>
    </div>
  );
}
