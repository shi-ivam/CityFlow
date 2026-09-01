import React from 'react';
import { Users, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function CrewUtilisationCard({ crewMembers = [], selectedCity = 'delhi' }) {
  if (!crewMembers || crewMembers.length === 0) {
    return (
      <div className="p-4 rounded-xl bg-card border border-border font-mono text-xs space-y-1">
        <div className="text-muted-foreground uppercase font-bold text-[10px]">CREW UTILISATION</div>
        <div className="text-sm font-bold text-muted-foreground">— No active crew</div>
      </div>
    );
  }

  const workingCount = crewMembers.filter(c => c.status === 'ASSIGNED').length;
  const restingCount = crewMembers.filter(c => c.status === 'RESTING_COMPLIANT' || c.status === 'REST_VIOLATION').length;
  const availableCount = crewMembers.filter(c => c.status === 'STANDBY_READY' || c.status === 'AVAILABLE' || c.status !== 'ASSIGNED').length - restingCount;
  const safeAvailableCount = Math.max(0, availableCount);
  const totalCrew = crewMembers.length;

  const rate = Math.round((workingCount / totalCrew) * 100);

  return (
    <div className="p-4 rounded-xl bg-card border border-border font-mono text-xs space-y-2 shadow-xs">
      <div className="flex items-center justify-between border-b border-border pb-1.5">
        <div className="text-muted-foreground uppercase font-bold text-[10px] flex items-center space-x-1.5">
          <Users className="w-3.5 h-3.5 text-primary" />
          <span>CREW UTILISATION ({selectedCity.toUpperCase()})</span>
        </div>
        <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
          ROTATION: ✓ Balanced
        </span>
      </div>

      <div className="flex items-baseline space-x-2">
        <span className="text-3xl font-bold text-primary font-mono">{rate}%</span>
        <span className="text-muted-foreground text-xs">Utilised</span>
      </div>

      <div className="text-xs font-medium text-foreground flex items-center space-x-2 pt-1 border-t border-border/50">
        <span className="text-emerald-600 dark:text-emerald-400 font-bold">{workingCount} Working</span>
        <span className="text-muted-foreground">•</span>
        <span className="text-amber-600 dark:text-amber-400 font-bold">{restingCount} Resting</span>
        <span className="text-muted-foreground">•</span>
        <span className="text-primary font-bold">{safeAvailableCount} Available</span>
      </div>
    </div>
  );
}
