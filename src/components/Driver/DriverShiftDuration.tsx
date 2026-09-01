import React, { useState, useEffect } from 'react';
import { ShiftDurationResponse } from '../../services/api';
import { Clock, Coffee, Shield } from 'lucide-react';

interface DriverShiftDurationProps {
  initialShift: ShiftDurationResponse;
}

export const DriverShiftDuration: React.FC<DriverShiftDurationProps> = ({ initialShift }) => {
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(initialShift.elapsedSeconds);

  // Live dynamic ticking counter
  useEffect(() => {
    setElapsedSeconds(initialShift.elapsedSeconds);
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [initialShift.shiftId, initialShift.elapsedSeconds]);

  // Format Elapsed Time (HH:MM:SS)
  const hours = Math.floor(elapsedSeconds / 3600);
  const mins = Math.floor((elapsedSeconds % 3600) / 60);
  const secs = elapsedSeconds % 60;
  const elapsedFormatted = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  // Format Remaining Time in human terms (e.g. 2h 28m)
  const totalShiftPlannedSeconds = 8 * 3600;
  const remainingSeconds = Math.max(0, totalShiftPlannedSeconds - elapsedSeconds);
  const remHours = Math.floor(remainingSeconds / 3600);
  const remMins = Math.floor((remainingSeconds % 3600) / 60);
  const remainingHuman = remainingSeconds > 0 ? `${remHours}h ${remMins}m remaining` : 'Shift Completed';

  // Progress Percent
  const progressPercent = Math.min(100, Number(((elapsedSeconds / totalShiftPlannedSeconds) * 100).toFixed(1)));
  const isOvertime = elapsedSeconds > totalShiftPlannedSeconds;

  const formatTimeOnly = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch {
      return '14:00';
    }
  };

  return (
    <div className="bg-card border border-border p-4 rounded shadow-sm font-sans">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-foreground" />
          <h3 className="font-semibold text-xs text-foreground uppercase tracking-wider font-mono">
            Active Shift Duration
          </h3>
        </div>
        <span className="px-2 py-0.5 bg-secondary text-foreground font-mono text-[10px] font-semibold rounded">
          {initialShift.shiftType} Shift
        </span>
      </div>

      {/* Main Big Ticking Timer */}
      <div className="flex items-baseline justify-between mb-3">
        <div>
          <span className="font-mono text-3xl sm:text-4xl font-black text-foreground tabular-nums tracking-tight">
            {elapsedFormatted}
          </span>
          <div className="text-xs text-muted-foreground mt-0.5 font-mono">
            {remainingHuman} • 8h standard shift
          </div>
        </div>
        <div className="text-right font-mono text-xs text-muted-foreground">
          <div>Started at {formatTimeOnly(initialShift.startTime)}</div>
          <div>Ends at {formatTimeOnly(initialShift.plannedEndTime)}</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1 mb-3">
        <div className="w-full h-2 bg-secondary rounded overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              isOvertime ? 'bg-destructive' : 'bg-foreground'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Simple Duty Stats */}
      <div className="flex items-center justify-between pt-2 border-t border-border text-xs text-muted-foreground font-mono">
        <span className="flex items-center gap-1.5">
          <Coffee className="w-3.5 h-3.5" />
          <span>Rest logged: <strong className="text-foreground">{initialShift.breakDurationMinutes} mins</strong></span>
        </span>
        <span className="flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5" />
          <span>Continuous drive: <strong className="text-foreground">{initialShift.continuousDriveMinutes} mins</strong></span>
        </span>
      </div>
    </div>
  );
};
