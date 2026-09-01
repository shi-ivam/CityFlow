import React from 'react';
import { 
  X, 
  Bus, 
  User, 
  Route as RouteIcon, 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  MapPin, 
  Activity,
  Zap,
  ArrowRight,
  Calendar
} from 'lucide-react';

export default function DriverBusDetailDrawer({
  isOpen,
  onClose,
  selectedEntity,
  onReassignDriver,
  onSwapBus,
  onOpenSchedule
}) {
  if (!isOpen || !selectedEntity) return null;

  const isBus = selectedEntity.type === 'bus';
  const isDriver = selectedEntity.type === 'driver';
  const isDuty = selectedEntity.type === 'duty';

  const title = isBus 
    ? selectedEntity.id 
    : isDriver 
    ? selectedEntity.name 
    : `Duty ${selectedEntity.id}`;

  const subtitle = isBus 
    ? (selectedEntity.regNumber || 'DL-1PC-0100') 
    : isDriver 
    ? `ID: ${selectedEntity.id} • Lic: ${selectedEntity.licenseNumber || 'DL-9901'}` 
    : `Route ${selectedEntity.routeId || 'R534'}`;

  const isDelayed = selectedEntity.status === 'DELAYED' || selectedEntity.delayMinutes > 0;
  const isConflict = selectedEntity.hasConflict || selectedEntity.status === 'REST_VIOLATION';

  return (
    <div className="fixed inset-0 z-[9999] flex justify-end select-none font-sans">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
      />

      {/* Drawer Body */}
      <div className="relative w-full max-w-sm bg-card border-l border-border h-full shadow-2xl p-5 overflow-y-auto space-y-4 text-foreground z-10 animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/15 text-primary flex items-center justify-center font-bold">
              {isBus ? <Bus className="w-4 h-4" /> : isDriver ? <User className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
            </div>
            <div>
              <div className="text-[10px] font-mono text-muted-foreground uppercase font-bold">
                Operational Inspector
              </div>
              <h2 className="text-base font-bold text-foreground leading-tight">{title}</h2>
              <div className="text-xs font-mono text-muted-foreground">{subtitle}</div>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Badge */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 border border-border text-xs font-mono">
          <span className="text-muted-foreground">Current State:</span>
          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
            isConflict 
              ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400' 
              : isDelayed 
              ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400' 
              : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
          }`}>
            ● {isConflict ? 'Rest Violation' : isDelayed ? 'Delayed (+9m)' : 'Operational Normal'}
          </span>
        </div>

        {/* Telemetry & Specifications */}
        <div className="space-y-2.5 text-xs font-mono">
          <div className="p-3 rounded-xl bg-muted/20 border border-border space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Assigned Driver:</span>
              <strong className="text-foreground">{selectedEntity.driverName || selectedEntity.driverId || 'Rajesh Kumar'}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Operating Route:</span>
              <strong className="text-primary">{selectedEntity.routeId || 'Route 534'}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Current Location:</span>
              <strong className="text-foreground">Connaught Place Outer</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Next Stop ETA:</span>
              <strong className="text-emerald-600 dark:text-emerald-400">08:42 IST</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Telemetry Speed:</span>
              <strong className="text-foreground">28 km/h</strong>
            </div>
          </div>

          {/* Shift Duty Information */}
          <div className="p-3 rounded-xl bg-muted/20 border border-border space-y-1.5">
            <div className="text-[10px] uppercase font-bold text-muted-foreground">Scheduled Shift</div>
            <div className="flex justify-between text-[11px]">
              <span>Duty Time:</span>
              <strong className="text-foreground">06:00 – 14:00 IST (Shift A)</strong>
            </div>
            <div className="flex justify-between text-[11px]">
              <span>Continuous Rest:</span>
              <strong className="text-emerald-600 dark:text-emerald-400">11h Compliant ✓</strong>
            </div>
          </div>
        </div>

        {/* Action Buttons (Section 17: Reassign, Change Driver, Change Route, View Schedule) */}
        <div className="space-y-2 pt-2">
          <button
            onClick={() => {
              if (onReassignDriver) onReassignDriver(selectedEntity.id);
              onClose();
            }}
            className="w-full py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer flex items-center justify-center space-x-2"
          >
            <Zap className="w-3.5 h-3.5 text-palette-ice" />
            <span>Reassign Driver to Standby</span>
          </button>

          <button
            onClick={() => {
              if (onSwapBus) onSwapBus(selectedEntity.id);
              onClose();
            }}
            className="w-full py-2 rounded-xl bg-card border border-border hover:bg-muted/50 text-foreground font-bold text-xs transition cursor-pointer flex items-center justify-center space-x-2"
          >
            <Bus className="w-3.5 h-3.5 text-primary" />
            <span>Change Vehicle Asset</span>
          </button>

          <button
            onClick={() => {
              if (onOpenSchedule) onOpenSchedule();
              onClose();
            }}
            className="w-full py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-bold text-xs transition cursor-pointer flex items-center justify-center space-x-2"
          >
            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
            <span>View Full Gantt Schedule</span>
          </button>
        </div>

      </div>
    </div>
  );
}
