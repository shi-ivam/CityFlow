import React from 'react';
import { FatigueResponse, NextShiftAllocationResponse } from '../../../services/api';
import { DriverFatigueCard } from '../DriverFatigueCard';
import { NextShiftAllocation } from '../NextShiftAllocation';
import { RotateCw, CheckCircle2, BarChart3, TrendingUp } from 'lucide-react';

interface Module2FatigueRotationProps {
  fatigueData: FatigueResponse | null;
  nextShiftData: NextShiftAllocationResponse | null;
}

export const Module2FatigueRotation: React.FC<Module2FatigueRotationProps> = ({
  fatigueData,
  nextShiftData,
}) => {
  return (
    <div className="space-y-4 font-sans">
      {/* 1. Driver Fatigue Card & Safety Advisory */}
      {fatigueData && <DriverFatigueCard fatigue={fatigueData} />}

      {/* 2. Fair Route Rotation Profile & Distribution */}
      <div className="bg-card border border-border p-4 rounded-md">
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <RotateCw className="w-4 h-4 text-foreground" />
            <h3 className="font-semibold text-xs text-foreground uppercase tracking-wider font-mono">
              Fair Route Rotation Distribution
            </h3>
          </div>
          <span className="px-2 py-0.5 bg-secondary text-foreground font-mono text-[10px] font-medium rounded-sm border border-border">
            92% Balanced
          </span>
        </div>

        {/* Rotation Categories Breakdown */}
        <div className="space-y-3 mb-3">
          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-foreground font-normal">Short Routes (&lt; 20 km)</span>
              <span className="text-muted-foreground font-medium">35% &bull; 7 trips</span>
            </div>
            <div className="w-full h-1.5 bg-secondary rounded-sm overflow-hidden">
              <div className="h-full bg-foreground" style={{ width: '35%' }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-foreground font-normal">Medium Routes (20 – 50 km)</span>
              <span className="text-muted-foreground font-medium">50% &bull; 10 trips</span>
            </div>
            <div className="w-full h-1.5 bg-secondary rounded-sm overflow-hidden">
              <div className="h-full bg-foreground" style={{ width: '50%' }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-foreground font-normal">Long Routes (&gt; 50 km)</span>
              <span className="text-muted-foreground font-medium">15% &bull; 3 trips</span>
            </div>
            <div className="w-full h-1.5 bg-secondary rounded-sm overflow-hidden">
              <div className="h-full bg-foreground" style={{ width: '15%' }} />
            </div>
          </div>
        </div>

        {/* Consecutive Long Route Warning / Compliance Check */}
        <div className="p-2.5 bg-secondary/30 rounded-sm border border-border flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-foreground shrink-0" />
            <div>
              <span className="font-semibold text-foreground block">Rotation Constraint</span>
              <span className="text-[11px] text-muted-foreground">
                No consecutive long routes operated in past 72 hours.
              </span>
            </div>
          </div>
          <span className="px-2 py-0.5 bg-foreground text-background text-[10px] font-medium uppercase rounded-sm">
            Compliant
          </span>
        </div>
      </div>

      {/* 3. Cumulative Workload Analytics */}
      <div className="bg-card border border-border p-4 rounded-md">
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-foreground" />
            <h3 className="font-semibold text-xs text-foreground uppercase tracking-wider font-mono">
              Cumulative Workload Analytics
            </h3>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground">Rolling 30 Days</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs font-mono mb-3">
          <div className="p-3 bg-secondary/30 rounded-sm border border-border">
            <span className="text-[10px] text-muted-foreground uppercase block">Weekly Mileage</span>
            <div className="font-bold text-lg text-foreground tracking-tight mt-0.5">482.4 km</div>
            <span className="text-[10px] text-muted-foreground">34h 15m driving time</span>
          </div>

          <div className="p-3 bg-secondary/30 rounded-sm border border-border">
            <span className="text-[10px] text-muted-foreground uppercase block">Monthly Mileage</span>
            <div className="font-bold text-lg text-foreground tracking-tight mt-0.5">1,940.8 km</div>
            <span className="text-[10px] text-muted-foreground">142h 30m driving time</span>
          </div>
        </div>

        <div className="flex items-center justify-between p-2 bg-secondary/20 rounded-sm border border-border text-[11px] font-mono text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-foreground" />
            <span>Fairness Compliance Rating</span>
          </span>
          <strong className="text-foreground font-semibold">100% Validated</strong>
        </div>
      </div>

      {/* 4. Next Shift Allocation Preview */}
      {nextShiftData && <NextShiftAllocation nextShift={nextShiftData} />}
    </div>
  );
};
