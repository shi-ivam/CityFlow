import React from 'react';
import { 
  Bus, 
  Clock, 
  Activity, 
  AlertTriangle 
} from 'lucide-react';

export default function KPITelemetryStrip({
  buses = [],
  conflicts = [],
  onOpenConflicts,
  onOpenFleet
}) {
  const activeBusesCount = buses.filter(b => b.status === 'IN_SERVICE').length || 10;
  const activeConflictsCount = conflicts.filter(c => c.status === 'ACTIVE').length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3 font-sans select-none">
      
      {/* KPI 1: ACTIVE (Section 15) */}
      <div 
        onClick={onOpenFleet}
        className="px-3.5 py-2 rounded-xl bg-card border border-border hover:border-primary/50 transition-all shadow-2xs flex items-center space-x-3 cursor-pointer group"
      >
        <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <Bus className="w-3.5 h-3.5" />
        </div>
        <div className="min-w-0">
          <div className="text-[10px] font-mono uppercase text-muted-foreground font-bold tracking-wider truncate">
            ACTIVE
          </div>
          <div className="text-sm font-bold text-foreground font-mono tabular-nums leading-tight">
            {activeBusesCount}
          </div>
        </div>
      </div>

      {/* KPI 2: ON-TIME (Section 15) */}
      <div className="px-3.5 py-2 rounded-xl bg-card border border-border transition-all shadow-2xs flex items-center space-x-3 cursor-default">
        <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
          <Activity className="w-3.5 h-3.5" />
        </div>
        <div className="min-w-0">
          <div className="text-[10px] font-mono uppercase text-muted-foreground font-bold tracking-wider truncate">
            ON-TIME
          </div>
          <div className="text-sm font-bold text-foreground font-mono tabular-nums leading-tight">
            96.4%
          </div>
        </div>
      </div>

      {/* KPI 3: HEADWAY (Section 15) */}
      <div className="px-3.5 py-2 rounded-xl bg-card border border-border transition-all shadow-2xs flex items-center space-x-3 cursor-default">
        <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
          <Clock className="w-3.5 h-3.5" />
        </div>
        <div className="min-w-0">
          <div className="text-[10px] font-mono uppercase text-muted-foreground font-bold tracking-wider truncate">
            HEADWAY
          </div>
          <div className="text-sm font-bold text-foreground font-mono tabular-nums leading-tight">
            6.2m
          </div>
        </div>
      </div>

      {/* KPI 4: CONFLICTS (Section 15) */}
      <div 
        onClick={onOpenConflicts}
        className={`px-3.5 py-2 rounded-xl border transition-all shadow-2xs flex items-center space-x-3 cursor-pointer group ${
          activeConflictsCount > 0 
            ? 'bg-rose-500/10 border-rose-500/30 hover:border-rose-500/60' 
            : 'bg-card border-border hover:border-primary/50'
        }`}
      >
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
          activeConflictsCount > 0 
            ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400' 
            : 'bg-emerald-500/10 text-emerald-600'
        }`}>
          <AlertTriangle className="w-3.5 h-3.5" />
        </div>
        <div className="min-w-0">
          <div className="text-[10px] font-mono uppercase text-muted-foreground font-bold tracking-wider truncate">
            CONFLICTS
          </div>
          <div className={`text-sm font-bold font-mono tabular-nums leading-tight ${
            activeConflictsCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-foreground'
          }`}>
            {activeConflictsCount}
          </div>
        </div>
      </div>

    </div>
  );
}
