import React from 'react';
import { FatigueResponse } from '../../services/api';
import { Activity, ShieldCheck, AlertTriangle, AlertCircle } from 'lucide-react';

interface DriverFatigueCardProps {
  fatigue: FatigueResponse;
}

export const DriverFatigueCard: React.FC<DriverFatigueCardProps> = ({ fatigue }) => {
  const { fatigueScore, fatigueBand, factors, safetyAdvisory, recommendedAction } = fatigue;

  const isOptimal = fatigueBand === 'OPTIMAL';
  const isModerate = fatigueBand === 'MODERATE';
  const isHigh = fatigueBand === 'HIGH';

  return (
    <div className="bg-card border border-border p-4 rounded shadow-sm font-sans">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-foreground" />
          <h3 className="font-semibold text-xs text-foreground uppercase tracking-wider font-mono">
            Fatigue Level & Safety Status
          </h3>
        </div>
        <span
          className={`px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase rounded border ${
            isHigh
              ? 'bg-destructive text-destructive-foreground border-destructive'
              : isModerate
              ? 'bg-secondary text-foreground border-foreground/40'
              : 'bg-foreground text-background border-foreground'
          }`}
        >
          {isOptimal ? 'Optimal' : isModerate ? 'Moderate' : 'Rest Required'}
        </span>
      </div>

      {/* Main Score & Status */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-3xl sm:text-4xl font-black text-foreground tabular-nums tracking-tight">
              {fatigueScore}%
            </span>
            <span className="text-xs font-mono text-muted-foreground uppercase">
              {fatigue.statusText}
            </span>
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            Continuous Drive: {factors.continuousDrivingMinutes}m • Rest Taken: {factors.breakMinutes}m
          </div>
        </div>

        <div className="p-2.5 bg-secondary rounded border border-border">
          {isHigh ? (
            <AlertTriangle className="w-5 h-5 text-destructive" />
          ) : isModerate ? (
            <AlertCircle className="w-5 h-5 text-foreground" />
          ) : (
            <ShieldCheck className="w-5 h-5 text-foreground" />
          )}
        </div>
      </div>

      {/* Clean Single Fatigue Bar */}
      <div className="space-y-1 mb-3">
        <div className="w-full h-2 bg-secondary rounded overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              isHigh ? 'bg-destructive' : isModerate ? 'bg-foreground/80' : 'bg-foreground'
            }`}
            style={{ width: `${fatigueScore}%` }}
          />
        </div>
      </div>

      {/* Safety Advisory Banner */}
      <div className="p-2.5 bg-secondary/60 rounded border border-border text-xs text-foreground">
        <div className="font-semibold leading-snug">{safetyAdvisory}</div>
        <div className="text-muted-foreground text-[11px] font-mono mt-0.5">
          {recommendedAction}
        </div>
      </div>
    </div>
  );
};
