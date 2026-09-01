import React from 'react';
import { ShieldCheck, AlertTriangle } from 'lucide-react';

export default function FleetHealth({ busFleet = [], onSelectStatus }) {
  const total = busFleet.length || 1;
  const inService = busFleet.filter(b => b.status === 'IN_SERVICE').length;
  const standby = busFleet.filter(b => b.status === 'STANDBY_READY' || b.status === 'AVAILABLE').length;
  const maintenance = busFleet.filter(b => b.status === 'MAINTENANCE').length;
  const offline = busFleet.filter(b => b.status === 'OFFLINE').length;
  const inspectionDue = busFleet.filter(b => b.status === 'INSPECTION_DUE').length;

  const healthyCount = inService + standby;
  const healthPct = Math.round((healthyCount / total) * 100);

  const inServicePct = (inService / total) * 100;
  const standbyPct = (standby / total) * 100;
  const maintenancePct = (maintenance / total) * 100;
  const offlinePct = (offline / total) * 100;
  const inspectionDuePct = (inspectionDue / total) * 100;

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
            Healthy Fleet: {healthPct}%
          </span>
        </div>
      </div>

      {/* Segmented Multi-Color Bar */}
      <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden flex">
        {inServicePct > 0 && (
          <div 
            style={{ width: `${inServicePct}%` }} 
            className="bg-emerald-500 hover:opacity-85 transition-all cursor-pointer"
            title={`In Service: ${inService} (${inServicePct.toFixed(0)}%)`}
            onClick={() => onSelectStatus && onSelectStatus('IN_SERVICE')}
          />
        )}
        {standbyPct > 0 && (
          <div 
            style={{ width: `${standbyPct}%` }} 
            className="bg-amber-500 hover:opacity-85 transition-all cursor-pointer"
            title={`Standby: ${standby} (${standbyPct.toFixed(0)}%)`}
            onClick={() => onSelectStatus && onSelectStatus('STANDBY_READY')}
          />
        )}
        {maintenancePct > 0 && (
          <div 
            style={{ width: `${maintenancePct}%` }} 
            className="bg-rose-500 hover:opacity-85 transition-all cursor-pointer"
            title={`Maintenance: ${maintenance} (${maintenancePct.toFixed(0)}%)`}
            onClick={() => onSelectStatus && onSelectStatus('MAINTENANCE')}
          />
        )}
        {inspectionDuePct > 0 && (
          <div 
            style={{ width: `${inspectionDuePct}%` }} 
            className="bg-orange-500 hover:opacity-85 transition-all cursor-pointer"
            title={`Inspection Due: ${inspectionDue} (${inspectionDuePct.toFixed(0)}%)`}
            onClick={() => onSelectStatus && onSelectStatus('INSPECTION_DUE')}
          />
        )}
        {offlinePct > 0 && (
          <div 
            style={{ width: `${offlinePct}%` }} 
            className="bg-muted-foreground hover:opacity-85 transition-all cursor-pointer"
            title={`Offline: ${offline} (${offlinePct.toFixed(0)}%)`}
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
          <strong className="text-foreground">{inService}</strong>
        </button>

        <button 
          onClick={() => onSelectStatus && onSelectStatus('STANDBY_READY')}
          className="flex items-center space-x-1.5 hover:opacity-80 transition cursor-pointer"
        >
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span className="text-muted-foreground">STANDBY:</span>
          <strong className="text-foreground">{standby}</strong>
        </button>

        <button 
          onClick={() => onSelectStatus && onSelectStatus('MAINTENANCE')}
          className="flex items-center space-x-1.5 hover:opacity-80 transition cursor-pointer"
        >
          <span className="w-2 h-2 rounded-full bg-rose-500" />
          <span className="text-muted-foreground">MAINTENANCE:</span>
          <strong className="text-foreground">{maintenance}</strong>
        </button>

        {inspectionDue > 0 && (
          <button 
            onClick={() => onSelectStatus && onSelectStatus('INSPECTION_DUE')}
            className="flex items-center space-x-1.5 hover:opacity-80 transition cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            <span className="text-muted-foreground">INSPECTION DUE:</span>
            <strong className="text-foreground">{inspectionDue}</strong>
          </button>
        )}

        <button 
          onClick={() => onSelectStatus && onSelectStatus('OFFLINE')}
          className="flex items-center space-x-1.5 hover:opacity-80 transition cursor-pointer"
        >
          <span className="w-2 h-2 rounded-full bg-muted-foreground" />
          <span className="text-muted-foreground">OFFLINE:</span>
          <strong className="text-foreground">{offline}</strong>
        </button>
      </div>
    </div>
  );
}
