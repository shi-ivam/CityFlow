import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { calculateFleetMetrics } from '../../../services/vehicleService';

export default function FleetHealth({ busFleet = [], onSelectStatus }) {
  const metrics = calculateFleetMetrics(busFleet);
  const total = metrics.total || 1;

  const inServicePct = (metrics.inService / total) * 100;
  const standbyPct = (metrics.standby / total) * 100;
  const maintenancePct = (metrics.maintenance / total) * 100;
  const offlinePct = (metrics.offline / total) * 100;

  return (
    <div className="bg-card border border-border rounded-lg p-4 shadow-xs space-y-3 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">
            FLEET HEALTH OVERVIEW
          </span>
          <span className="text-[11px] font-mono text-muted-foreground">
            • Real-time Asset Readiness
          </span>
        </div>

        <div className="flex items-center space-x-2 font-mono text-xs">
          <span className="text-muted-foreground">Operational Score:</span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            Healthy Fleet: {metrics.healthPct}%
          </span>
        </div>
      </div>

      {/* Segmented Multi-Color Bar */}
      <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden flex">
        {inServicePct > 0 && (
          <div 
            style={{ width: `${inServicePct}%` }} 
            className="bg-emerald-500 hover:opacity-85 transition-all cursor-pointer"
            title={`In Service: ${metrics.inService} (${inServicePct.toFixed(0)}%)`}
            onClick={() => onSelectStatus && onSelectStatus('IN_SERVICE')}
          />
        )}
        {standbyPct > 0 && (
          <div 
            style={{ width: `${standbyPct}%` }} 
            className="bg-amber-500 hover:opacity-85 transition-all cursor-pointer"
            title={`Standby: ${metrics.standby} (${standbyPct.toFixed(0)}%)`}
            onClick={() => onSelectStatus && onSelectStatus('STANDBY_READY')}
          />
        )}
        {maintenancePct > 0 && (
          <div 
            style={{ width: `${maintenancePct}%` }} 
            className="bg-rose-500 hover:opacity-85 transition-all cursor-pointer"
            title={`Maintenance: ${metrics.maintenance} (${maintenancePct.toFixed(0)}%)`}
            onClick={() => onSelectStatus && onSelectStatus('MAINTENANCE')}
          />
        )}
        {offlinePct > 0 && (
          <div 
            style={{ width: `${offlinePct}%` }} 
            className="bg-muted-foreground hover:opacity-85 transition-all cursor-pointer"
            title={`Offline: ${metrics.offline} (${offlinePct.toFixed(0)}%)`}
            onClick={() => onSelectStatus && onSelectStatus('OFFLINE')}
          />
        )}
      </div>

      {/* Segment Counts Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs font-mono pt-1">
        <button 
          onClick={() => onSelectStatus && onSelectStatus('IN_SERVICE')}
          className="flex items-center space-x-1.5 hover:opacity-80 transition cursor-pointer"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-muted-foreground">IN SERVICE:</span>
          <strong className="text-foreground">{metrics.inService}</strong>
        </button>

        <button 
          onClick={() => onSelectStatus && onSelectStatus('STANDBY_READY')}
          className="flex items-center space-x-1.5 hover:opacity-80 transition cursor-pointer"
        >
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span className="text-muted-foreground">STANDBY:</span>
          <strong className="text-foreground">{metrics.standby}</strong>
        </button>

        <button 
          onClick={() => onSelectStatus && onSelectStatus('MAINTENANCE')}
          className="flex items-center space-x-1.5 hover:opacity-80 transition cursor-pointer"
        >
          <span className="w-2 h-2 rounded-full bg-rose-500" />
          <span className="text-muted-foreground">MAINTENANCE:</span>
          <strong className="text-foreground">{metrics.maintenance}</strong>
        </button>

        <button 
          onClick={() => onSelectStatus && onSelectStatus('OFFLINE')}
          className="flex items-center space-x-1.5 hover:opacity-80 transition cursor-pointer"
        >
          <span className="w-2 h-2 rounded-full bg-muted-foreground" />
          <span className="text-muted-foreground">OFFLINE:</span>
          <strong className="text-foreground">{metrics.offline}</strong>
        </button>
      </div>
    </div>
  );
}
