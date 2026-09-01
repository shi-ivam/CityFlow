import React from 'react';
import { Clock, CheckCircle2, Wrench, Shield, Bus } from 'lucide-react';

export default function VehicleAvailabilityTimeline({ busFleet = [], onOpenVehicleDrawer }) {
  const timeSlots = [
    '06:00', '08:00', '10:00', '12:00', '14:00', 
    '16:00', '18:00', '20:00', '22:00', '00:00'
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-5 space-y-4 font-sans shadow-xs">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
        <div>
          <h3 className="text-base font-bold font-mono text-foreground flex items-center space-x-2">
            <Clock className="w-4 h-4 text-primary" />
            <span>Vehicle Operational Capacity &amp; Availability Timeline</span>
          </h3>
          <p className="text-xs text-muted-foreground">
            24-Hour transit corridor service blocks, depot reserve buffers, and workshop maintenance windows.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-3 text-xs font-mono">
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
            <span className="text-muted-foreground">In Service</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
            <span className="text-muted-foreground">Standby Reserve</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
            <span className="text-muted-foreground">Workshop Service</span>
          </div>
        </div>
      </div>

      {/* Timeline Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[700px] space-y-2">
          
          {/* Header Time Axis */}
          <div className="grid grid-cols-12 text-[10px] font-mono text-muted-foreground pb-2 border-b border-border text-center">
            <div className="col-span-3 text-left font-bold text-foreground">ASSET / REGISTRATION</div>
            <div className="col-span-9 grid grid-cols-9 text-center">
              {timeSlots.slice(0, 9).map((slot, idx) => (
                <div key={idx}>{slot}</div>
              ))}
            </div>
          </div>

          {/* Vehicle Rows */}
          <div className="divide-y divide-border/40">
            {busFleet.map((bus) => {
              const isInService = bus.status === 'IN_SERVICE';
              const isMaintenance = bus.status === 'MAINTENANCE';
              const isStandby = bus.status === 'STANDBY_READY' || bus.status === 'AVAILABLE';

              return (
                <div
                  key={bus.id}
                  onClick={() => onOpenVehicleDrawer && onOpenVehicleDrawer(bus)}
                  className="grid grid-cols-12 items-center py-2.5 hover:bg-muted/30 transition cursor-pointer text-xs font-mono"
                >
                  {/* Vehicle Label */}
                  <div className="col-span-3 pr-2">
                    <div className="font-bold text-foreground truncate">{bus.busNumber}</div>
                    <div className="text-[10px] text-muted-foreground truncate">
                      {bus.id} • {bus.assignedRoute ? `Route ${bus.assignedRoute}` : 'Depot'}
                    </div>
                  </div>

                  {/* 24-Hour Timeline Bar */}
                  <div className="col-span-9 relative h-6 bg-muted/40 rounded flex items-center px-1 overflow-hidden">
                    {isInService && (
                      <div className="w-[85%] h-4 bg-emerald-500/80 hover:bg-emerald-500 rounded text-[10px] text-white font-bold flex items-center px-2 shadow-xs transition truncate">
                        <span>06:00 → 22:00 (In Service • Route {bus.assignedRoute || '534'})</span>
                      </div>
                    )}

                    {isStandby && (
                      <div className="w-[100%] h-4 bg-amber-500/80 hover:bg-amber-500 rounded text-[10px] text-white font-bold flex items-center px-2 shadow-xs transition truncate">
                        <span>00:00 → 24:00 (Standby Reserve • Ready for Dispatch)</span>
                      </div>
                    )}

                    {isMaintenance && (
                      <div className="w-[60%] h-4 bg-rose-500/80 hover:bg-rose-500 rounded text-[10px] text-white font-bold flex items-center px-2 shadow-xs transition truncate">
                        <span>08:00 → 18:00 (Workshop Inspection &amp; Calibration)</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>

    </div>
  );
}
