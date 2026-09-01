import React from 'react';
import { NextShiftAllocationResponse } from '../../services/api';
import { Calendar, MapPin, Bus, Clock, CheckCircle2 } from 'lucide-react';

interface NextShiftAllocationProps {
  nextShift: NextShiftAllocationResponse;
}

export const NextShiftAllocation: React.FC<NextShiftAllocationProps> = ({ nextShift }) => {
  return (
    <div className="bg-card border border-border p-4 rounded shadow-sm font-sans">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-foreground" />
          <h3 className="font-semibold text-xs text-foreground uppercase tracking-wider font-mono">
            Next Shift Allocation
          </h3>
        </div>
        <span className="px-2 py-0.5 bg-secondary text-foreground font-mono text-[10px] font-semibold rounded flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" />
          <span>{nextShift.status}</span>
        </span>
      </div>

      {/* Date & Shift Info */}
      <div className="mb-3">
        <div className="font-bold text-base sm:text-lg text-foreground tracking-tight">
          {nextShift.shiftDateFormatted}
        </div>
        <div className="text-xs text-muted-foreground font-mono mt-0.5 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          <span>{nextShift.shiftType} Shift • {nextShift.shiftWindowFormatted} IST</span>
        </div>
      </div>

      {/* Clean Assignment Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-border text-xs font-mono">
        <div className="flex items-center gap-2 text-foreground">
          <Bus className="w-4 h-4 text-muted-foreground shrink-0" />
          <div>
            <span className="text-[10px] text-muted-foreground block">Route & Bus</span>
            <strong>Route {nextShift.routeCode} ({nextShift.busId})</strong>
          </div>
        </div>

        <div className="flex items-center gap-2 text-foreground">
          <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
          <div>
            <span className="text-[10px] text-muted-foreground block">Reporting Location</span>
            <strong>{nextShift.reportingDepot} ({nextShift.reportingBay})</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
