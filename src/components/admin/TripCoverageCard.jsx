import React, { useState } from 'react';
import { CalendarClock, RotateCw } from 'lucide-react';

// Centralized Configurable Coverage Thresholds
export const COVERAGE_THRESHOLDS = {
  GOOD_MIN: 95,         // >= 95%: Good
  ATTENTION_MIN: 80,    // 80% - 94%: Needs attention
  // < 80%: Low coverage
};

export function getCoverageStatus(coveragePercent) {
  if (coveragePercent >= COVERAGE_THRESHOLDS.GOOD_MIN) {
    return {
      label: '✓ Good',
      badgeStyle: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
    };
  }
  if (coveragePercent >= COVERAGE_THRESHOLDS.ATTENTION_MIN) {
    return {
      label: '⚠ Needs attention',
      badgeStyle: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30'
    };
  }
  return {
    label: '⚠ Low coverage',
    badgeStyle: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30'
  };
}

export default function TripCoverageCard({ trips = [], selectedCity = 'delhi', hasError = false, onRetry }) {
  const [retrySpin, setRetrySpin] = useState(false);

  // Error State Handling
  if (hasError || !Array.isArray(trips)) {
    return (
      <div className="p-4 rounded-xl bg-card border border-rose-500/30 font-mono text-xs space-y-2 shadow-xs">
        <div className="flex items-center justify-between border-b border-border pb-1.5">
          <div className="text-muted-foreground uppercase font-bold text-[10px]">ROUTE COVERAGE</div>
          <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-rose-500/15 text-rose-600 border border-rose-500/30">
            Error
          </span>
        </div>
        <div className="text-sm font-bold text-rose-500">Unable to calculate</div>
        <button
          onClick={() => {
            setRetrySpin(true);
            if (onRetry) onRetry();
            setTimeout(() => setRetrySpin(false), 1000);
          }}
          className="px-3 py-1 rounded bg-rose-600 text-white font-bold hover:bg-rose-700 flex items-center space-x-1"
        >
          <RotateCw className={`w-3 h-3 ${retrySpin ? 'animate-spin' : ''}`} />
          <span>RETRY</span>
        </button>
      </div>
    );
  }

  // Empty State Handling
  if (trips.length === 0) {
    return (
      <div className="p-4 rounded-xl bg-card border border-border font-mono text-xs space-y-2 shadow-xs">
        <div className="flex items-center justify-between border-b border-border pb-1.5">
          <div className="text-muted-foreground uppercase font-bold text-[10px] flex items-center space-x-1.5">
            <CalendarClock className="w-3.5 h-3.5 text-muted-foreground" />
            <span>ROUTE COVERAGE ({selectedCity.toUpperCase()})</span>
          </div>
          <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-muted text-muted-foreground border border-border">
            —
          </span>
        </div>
        <div className="text-2xl font-bold text-muted-foreground font-mono">—</div>
        <div className="text-xs font-medium text-muted-foreground border-t border-border/50 pt-1">
          No trips planned
        </div>
      </div>
    );
  }

  const totalPlanned = trips.length;
  const coveredTrips = trips.filter(t => t.busId && t.driverId && t.status !== 'CANCELLED').length;
  const uncoveredTrips = totalPlanned - coveredTrips;
  const coveragePercent = Math.round((coveredTrips / totalPlanned) * 100);

  const status = getCoverageStatus(coveragePercent);

  return (
    <div className="p-4 rounded-xl bg-card border border-border font-mono text-xs space-y-2 shadow-xs">
      <div className="flex items-center justify-between border-b border-border pb-1.5">
        <div className="text-muted-foreground uppercase font-bold text-[10px] flex items-center space-x-1.5">
          <CalendarClock className="w-3.5 h-3.5 text-emerald-500" />
          <span>ROUTE COVERAGE ({selectedCity.toUpperCase()})</span>
        </div>
        <span className={`px-2 py-0.5 rounded font-bold text-[10px] border ${status.badgeStyle}`}>
          {status.label}
        </span>
      </div>

      <div className="flex items-baseline space-x-2">
        <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">{coveragePercent}%</span>
        <span className="text-muted-foreground text-xs font-bold font-mono">({coveredTrips} / {totalPlanned} trips)</span>
      </div>

      <div className="text-xs font-medium text-foreground flex items-center space-x-2 pt-1 border-t border-border/50">
        <span className="text-emerald-600 dark:text-emerald-400 font-bold">{coveredTrips} Covered</span>
        <span className="text-muted-foreground">•</span>
        <span className={uncoveredTrips > 0 ? "text-amber-600 dark:text-amber-400 font-bold" : "text-muted-foreground"}>
          {uncoveredTrips} Uncovered
        </span>
      </div>
    </div>
  );
}
