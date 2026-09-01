import React, { useState, useEffect } from 'react';
import { DriverAssignedRouteResponse, DriverTelemetry } from '../../../services/api';
import {
  Navigation,
  Bus,
  Users,
  MapPin,
  AlertTriangle,
  DoorOpen,
  DoorClosed,
} from 'lucide-react';

interface Module3ActiveTripProps {
  assignedRouteData: DriverAssignedRouteResponse | null;
  telemetry: DriverTelemetry | null;
}

export const Module3ActiveTrip: React.FC<Module3ActiveTripProps> = ({
  assignedRouteData,
  telemetry,
}) => {
  const [isDwellActive, setIsDwellActive] = useState<boolean>(false);
  const [dwellSeconds, setDwellSeconds] = useState<number>(0);
  const [boardingCount, setBoardingCount] = useState<number>(4);
  const [alightingCount, setAlightingCount] = useState<number>(2);

  // Live dwell timer when doors open
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isDwellActive) {
      interval = setInterval(() => {
        setDwellSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setDwellSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isDwellActive]);

  const route = assignedRouteData?.route;
  const driver = assignedRouteData?.driver;

  const currentOccupancy = telemetry?.occupancyPercent || 78;
  const maxCapacity = 50;
  const seatedMax = 35;
  const standingMax = 15;
  const currentPax = Math.round((currentOccupancy / 100) * maxCapacity);
  const seatedCount = Math.min(seatedMax, currentPax);
  const standingCount = Math.max(0, currentPax - seatedMax);
  const availableSeats = Math.max(0, seatedMax - seatedCount);
  const isHighOccupancy = currentOccupancy >= 90;

  const nextStopName = telemetry?.nextStopName || 'Adyar Depot Stop';
  const distanceToStop = telemetry?.distanceToNextStopM || 450;
  const etaMinutes = telemetry?.nextStopEtaMinutes || 1.4;
  const delayMinutes = telemetry?.delayMinutes || 0;

  return (
    <div className="space-y-4 font-sans">
      {/* 1. Turn-by-Turn & Next Stop Telemetry */}
      <div className="bg-card border border-border p-4 rounded-md">
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-foreground" />
            <h3 className="font-semibold text-xs text-foreground uppercase tracking-wider font-mono">
              Live Next Stop Telemetry
            </h3>
          </div>
          <span
            className={`px-2 py-0.5 font-mono text-[10px] font-medium uppercase rounded-sm border ${
              delayMinutes > 2
                ? 'bg-destructive text-destructive-foreground border-destructive'
                : 'bg-foreground text-background border-foreground'
            }`}
          >
            {delayMinutes > 2 ? `Delayed +${delayMinutes}m` : 'On Schedule'}
          </span>
        </div>

        {/* Next Stop Details */}
        <div className="mb-3">
          <div className="text-[11px] font-mono text-muted-foreground uppercase flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-foreground" />
            <span>Next Scheduled Stop</span>
          </div>
          <div className="text-xl font-bold text-foreground tracking-tight mt-0.5">
            {nextStopName}
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2 text-xs font-mono">
            <div className="p-2.5 bg-secondary/30 rounded-sm border border-border">
              <span className="text-[10px] text-muted-foreground block">Distance Remaining</span>
              <strong className="text-foreground text-sm font-semibold">{distanceToStop} meters</strong>
            </div>
            <div className="p-2.5 bg-secondary/30 rounded-sm border border-border">
              <span className="text-[10px] text-muted-foreground block">Estimated Arrival</span>
              <strong className="text-foreground text-sm font-semibold">{etaMinutes} mins</strong>
            </div>
          </div>
        </div>

        {/* Speed & Heading Stats */}
        <div className="flex items-center justify-between pt-2 border-t border-border text-xs font-mono text-muted-foreground">
          <span>Speed: <strong className="text-foreground font-medium">{telemetry?.speedKmH || 32} km/h</strong></span>
          <span>Heading: <strong className="text-foreground font-medium">{Math.round(telemetry?.heading || 90)}&deg;</strong></span>
          <span>Progress: <strong className="text-foreground font-medium">{Math.round((telemetry?.progressAlongRoute || 0.4) * 100)}%</strong></span>
        </div>
      </div>

      {/* 2. Stop Arrival & Passenger Boarding Action */}
      <div className="bg-card border border-border p-4 rounded-md">
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-border">
          <div className="flex items-center gap-2">
            {isDwellActive ? (
              <DoorOpen className="w-4 h-4 text-foreground" />
            ) : (
              <DoorClosed className="w-4 h-4 text-foreground" />
            )}
            <h3 className="font-semibold text-xs text-foreground uppercase tracking-wider font-mono">
              Stop Arrival & Door Controls
            </h3>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground">
            {isDwellActive ? `Dwell: ${dwellSeconds}s` : 'Transit Protocol'}
          </span>
        </div>

        {isDwellActive ? (
          <div className="space-y-3">
            <div className="p-3 bg-secondary/40 border border-border rounded-sm text-xs font-mono space-y-2">
              <div className="flex justify-between items-center text-foreground font-semibold">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-foreground inline-block" />
                  Doors Open at {nextStopName}
                </span>
                <span>{dwellSeconds}s Elapsed</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                <div className="p-2 bg-card rounded-sm border border-border">
                  <span className="text-muted-foreground block">Boarding</span>
                  <strong className="text-foreground">+{boardingCount} Pax</strong>
                </div>
                <div className="p-2 bg-card rounded-sm border border-border">
                  <span className="text-muted-foreground block">Alighting</span>
                  <strong className="text-foreground">-{alightingCount} Pax</strong>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setIsDwellActive(false);
                setBoardingCount(Math.floor(Math.random() * 6) + 1);
                setAlightingCount(Math.floor(Math.random() * 4) + 1);
              }}
              className="w-full py-2 bg-foreground text-background font-mono text-xs font-medium uppercase rounded-sm cursor-pointer active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <DoorClosed className="w-4 h-4" />
              <span>Close Doors & Resume Route</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground leading-relaxed font-sans">
              Log dwell time and confirm stop arrival upon reaching {nextStopName}.
            </p>
            <button
              onClick={() => setIsDwellActive(true)}
              className="w-full py-2 bg-secondary hover:bg-accent text-foreground border border-border font-mono text-xs font-medium uppercase rounded-sm transition-colors cursor-pointer active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <DoorOpen className="w-4 h-4" />
              <span>Confirm Stop Arrival & Open Doors</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. Live Passenger Capacity & Load Indicator */}
      <div className="bg-card border border-border p-4 rounded-md">
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-foreground" />
            <h3 className="font-semibold text-xs text-foreground uppercase tracking-wider font-mono">
              Live Passenger Capacity & Load
            </h3>
          </div>
          <span
            className={`px-2 py-0.5 font-mono text-[10px] font-medium uppercase rounded-sm border ${
              isHighOccupancy
                ? 'bg-destructive text-destructive-foreground border-destructive'
                : 'bg-secondary text-foreground border-border'
            }`}
          >
            {isHighOccupancy ? 'High Occupancy' : 'Normal Load'}
          </span>
        </div>

        {/* Load Percentage Numbers */}
        <div className="flex items-baseline justify-between mb-2 font-mono">
          <div>
            <span className="text-3xl sm:text-4xl font-bold text-foreground tabular-nums tracking-tight">
              {currentPax} / {maxCapacity}
            </span>
            <span className="text-xs text-muted-foreground ml-2">({currentOccupancy}% Load)</span>
          </div>
          <div className="text-xs text-muted-foreground">
            {availableSeats > 0 ? `${availableSeats} Seats Available` : 'All Seats Occupied'}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-secondary rounded-sm overflow-hidden mb-3">
          <div
            className={`h-full transition-all duration-300 ${
              isHighOccupancy ? 'bg-destructive' : 'bg-foreground'
            }`}
            style={{ width: `${currentOccupancy}%` }}
          />
        </div>

        {/* Seating Breakdown */}
        <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2 border-t border-border">
          <div className="p-2.5 bg-secondary/30 rounded-sm border border-border">
            <span className="text-[10px] text-muted-foreground block">Seated Passengers</span>
            <strong className="text-foreground">{seatedCount} / {seatedMax}</strong>
          </div>
          <div className="p-2.5 bg-secondary/30 rounded-sm border border-border">
            <span className="text-[10px] text-muted-foreground block">Standing Passengers</span>
            <strong className="text-foreground">{standingCount} / {standingMax}</strong>
          </div>
        </div>

        {isHighOccupancy && (
          <div className="mt-3 p-2 bg-secondary border border-border rounded-sm text-foreground text-xs font-mono flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-muted-foreground" />
            <span>Capacity exceeded 90%. Passenger overflow reporting eligible.</span>
          </div>
        )}
      </div>

      {/* 4. Assigned Route & Bus Specs */}
      {route && (
        <div className="bg-card border border-border p-4 rounded-md text-xs font-mono">
          <div className="flex items-center gap-2 pb-2 mb-2 border-b border-border">
            <Bus className="w-4 h-4 text-foreground" />
            <h3 className="font-semibold text-xs text-foreground uppercase tracking-wider">
              Assigned Route & Vehicle
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] text-muted-foreground block">Route Code</span>
              <strong className="text-foreground">{route.code} &mdash; {route.name}</strong>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground block">Assigned Bus</span>
              <strong className="text-foreground">{driver?.assignedVehicleNumber || 'TN-01-N-9024'}</strong>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground block">Origin</span>
              <span className="text-foreground">{route.stops[0]?.name}</span>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground block">Destination</span>
              <span className="text-foreground">{route.stops[route.stops.length - 1]?.name}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
