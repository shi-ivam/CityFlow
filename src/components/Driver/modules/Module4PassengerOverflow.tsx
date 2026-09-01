import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Users,
  Compass,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Radio,
  MapPin,
  Bus,
  CornerDownRight,
} from 'lucide-react';

interface Module4PassengerOverflowProps {
  currentStopName?: string;
}

export const Module4PassengerOverflow: React.FC<Module4PassengerOverflowProps> = ({
  currentStopName = 'Saidapet Metro / Bus Stop',
}) => {
  // Overloaded Driver Flow States
  const [selectedPaxCount, setSelectedPaxCount] = useState<number>(10);
  const [overflowStatus, setOverflowStatus] = useState<
    'IDLE' | 'REQUEST_SENT' | 'SEARCHING_ASSISTANCE' | 'DRIVER_ASSIGNED' | 'ASSISTING_EN_ROUTE'
  >('IDLE');
  const [assistingEta, setAssistingEta] = useState<number>(4.2);

  // Assisting Driver Flow States
  const [incomingAlertVisible, setIncomingAlertVisible] = useState<boolean>(true);
  const [countdownSeconds, setCountdownSeconds] = useState<number>(45);
  const [detourStage, setDetourStage] = useState<
    'NONE' | 'EN_ROUTE_TO_OVERFLOW' | 'PICKUP_CONFIRMED' | 'REJOINING_ROUTE' | 'RESUMED'
  >('NONE');

  // Countdown timer for candidate assistance alert
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (incomingAlertVisible && countdownSeconds > 0 && detourStage === 'NONE') {
      interval = setInterval(() => {
        setCountdownSeconds((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [incomingAlertVisible, countdownSeconds, detourStage]);

  // Overflow Request Broadcast Simulation
  const handleBroadcastOverflow = () => {
    setOverflowStatus('REQUEST_SENT');
    setTimeout(() => {
      setOverflowStatus('SEARCHING_ASSISTANCE');
      setTimeout(() => {
        setOverflowStatus('DRIVER_ASSIGNED');
        setTimeout(() => {
          setOverflowStatus('ASSISTING_EN_ROUTE');
        }, 1500);
      }, 2000);
    }, 1200);
  };

  const handleAcceptDetour = () => {
    setIncomingAlertVisible(false);
    setDetourStage('EN_ROUTE_TO_OVERFLOW');
  };

  const handleDeclineDetour = () => {
    setIncomingAlertVisible(false);
    setDetourStage('NONE');
  };

  return (
    <div className="space-y-4 font-sans">
      {/* SECTION 1: Overloaded Driver Flow — 1-Tap Passenger Overflow Reporting */}
      <div className="bg-card border border-border p-4 rounded shadow-sm">
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-foreground" />
            <h3 className="font-semibold text-xs text-foreground uppercase tracking-wider font-mono">
              1-Tap Overflow Reporting (Overloaded Bus)
            </h3>
          </div>
          <span className="px-2 py-0.5 bg-secondary text-foreground font-mono text-[10px] font-semibold rounded border border-border">
            Issue #7 Core
          </span>
        </div>

        {overflowStatus === 'IDLE' ? (
          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-mono text-muted-foreground block mb-1">
                CURRENT OVERFLOW LOCATION:
              </label>
              <div className="p-2 bg-secondary/50 rounded border border-border text-xs font-mono text-foreground font-semibold flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-foreground" />
                <span>{currentStopName}</span>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-mono text-muted-foreground block mb-1">
                STRANDED / UNABLE TO BOARD PASSENGERS:
              </label>
              <div className="grid grid-cols-4 gap-2 font-mono text-xs">
                {[5, 10, 15, 20].map((count) => (
                  <button
                    key={count}
                    onClick={() => setSelectedPaxCount(count)}
                    className={`py-2 rounded text-center transition-all cursor-pointer border font-bold ${
                      selectedPaxCount === count
                        ? 'bg-foreground text-background border-foreground'
                        : 'bg-secondary/40 hover:bg-secondary text-foreground border-border'
                    }`}
                  >
                    +{count} Pax
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleBroadcastOverflow}
              className="w-full py-2.5 bg-foreground text-background font-mono text-xs font-bold uppercase rounded hover:opacity-90 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
            >
              <Radio className="w-4 h-4" />
              <span>Broadcast Emergency Overflow (+{selectedPaxCount} Pax)</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Live Overflow Status Tracking Stream */}
            <div className="p-3 bg-secondary/60 rounded border border-border font-mono text-xs space-y-2">
              <div className="flex justify-between items-center pb-2 border-b border-border">
                <span className="text-muted-foreground text-[10px] uppercase">Incident Ticket #OVF-4091</span>
                <span className="px-2 py-0.5 bg-foreground text-background font-bold text-[9px] rounded">
                  {overflowStatus.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-foreground" />
                  <span>Request Dispatched to Central Engine</span>
                </div>
                <div className="flex items-center gap-2">
                  {overflowStatus !== 'REQUEST_SENT' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-foreground" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-foreground border-t-transparent animate-spin" />
                  )}
                  <span>Candidate Assisting Buses Ranked</span>
                </div>
                <div className="flex items-center gap-2">
                  {overflowStatus === 'DRIVER_ASSIGNED' || overflowStatus === 'ASSISTING_EN_ROUTE' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-foreground" />
                  ) : (
                    <span className="w-3.5 h-3.5 rounded-full border border-muted-foreground inline-block" />
                  )}
                  <span>Assisting Driver Confirmed (Bus TN-01-N-9028)</span>
                </div>
              </div>

              {overflowStatus === 'ASSISTING_EN_ROUTE' && (
                <div className="p-2 bg-card rounded border border-border text-xs mt-2 space-y-1">
                  <div className="flex items-center justify-between font-bold text-foreground">
                    <span className="flex items-center gap-1.5">
                      <Bus className="w-3.5 h-3.5" />
                      <span>Assisting Bus TN-01-N-9028 (S. Murugan)</span>
                    </span>
                    <span>ETA: {assistingEta} mins</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Detour distance: +2.1 km • Advise waiting passengers to remain at shelter.
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setOverflowStatus('IDLE')}
              className="w-full py-1.5 bg-secondary hover:bg-accent text-foreground font-mono text-xs font-semibold rounded border border-border cursor-pointer transition-colors"
            >
              Reset / Log Another Overflow Incident
            </button>
          </div>
        )}
      </div>

      {/* SECTION 2: Assisting Driver Detour Rerouting Console (Nearby Driver Flow) */}
      <div className="bg-card border border-border p-4 rounded shadow-sm">
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <CornerDownRight className="w-4 h-4 text-foreground" />
            <h3 className="font-semibold text-xs text-foreground uppercase tracking-wider font-mono">
              Assisting Driver Detour Console
            </h3>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground">Dynamic Reroute</span>
        </div>

        {/* Incoming Detour Dispatch Alert */}
        {incomingAlertVisible && detourStage === 'NONE' ? (
          <div className="p-3 bg-secondary/80 border border-foreground/30 rounded text-xs font-mono space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-bold text-foreground flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-foreground animate-pulse" />
                OVERFLOW ASSISTANCE REQUEST
              </span>
              <span className="px-2 py-0.5 bg-foreground text-background font-bold text-[10px] rounded flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{countdownSeconds}s</span>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] bg-card p-2 rounded border border-border">
              <div>
                <span className="text-muted-foreground block">Detour Stop</span>
                <strong className="text-foreground">Saidapet West (Stop #14)</strong>
              </div>
              <div>
                <span className="text-muted-foreground block">Stranded Pax</span>
                <strong className="text-foreground">12 Passengers</strong>
              </div>
              <div>
                <span className="text-muted-foreground block">Detour Distance</span>
                <strong className="text-foreground">+2.4 km</strong>
              </div>
              <div>
                <span className="text-muted-foreground block">Schedule Delay</span>
                <strong className="text-foreground">+5 mins</strong>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleAcceptDetour}
                className="flex-1 py-2 bg-foreground text-background font-bold rounded text-xs uppercase cursor-pointer hover:opacity-90 transition-opacity"
              >
                Accept Detour & Assist
              </button>
              <button
                onClick={handleDeclineDetour}
                className="px-3 py-2 bg-secondary hover:bg-accent text-foreground font-semibold rounded text-xs border border-border cursor-pointer transition-colors"
              >
                Decline
              </button>
            </div>
          </div>
        ) : detourStage === 'NONE' ? (
          <div className="p-3 bg-secondary/40 rounded border border-border text-center space-y-2">
            <p className="text-xs text-muted-foreground font-mono">
              No active detour rerouting dispatches assigned to your bus.
            </p>
            <button
              onClick={() => {
                setIncomingAlertVisible(true);
                setCountdownSeconds(45);
              }}
              className="px-3 py-1.5 bg-secondary hover:bg-accent text-foreground text-xs font-mono font-medium rounded border border-border cursor-pointer"
            >
              Simulate Incoming Assistance Alert
            </button>
          </div>
        ) : (
          /* Active Detour Progression Lifecycle */
          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 bg-secondary/60 rounded border border-border space-y-2">
              <div className="flex justify-between items-center font-bold text-foreground">
                <span>DYNAMIC DETOUR NAVIGATION ACTIVE</span>
                <span className="text-[10px] px-2 py-0.5 bg-foreground text-background rounded">
                  {detourStage.replace(/_/g, ' ')}
                </span>
              </div>

              {detourStage === 'EN_ROUTE_TO_OVERFLOW' && (
                <div className="space-y-2 pt-1">
                  <div className="text-muted-foreground text-xs">
                    Navigating to Saidapet West Stop (+2.4 km detour polyline active on map).
                  </div>
                  <button
                    onClick={() => setDetourStage('PICKUP_CONFIRMED')}
                    className="w-full py-2 bg-foreground text-background font-bold uppercase rounded cursor-pointer"
                  >
                    Confirm Arrival & Board Overflow Pax (+12 Pax)
                  </button>
                </div>
              )}

              {detourStage === 'PICKUP_CONFIRMED' && (
                <div className="space-y-2 pt-1">
                  <div className="text-foreground text-xs font-semibold">
                    ✓ 12 stranded passengers boarded. Bus occupancy updated to 94%.
                  </div>
                  <button
                    onClick={() => setDetourStage('REJOINING_ROUTE')}
                    className="w-full py-2 bg-foreground text-background font-bold uppercase rounded cursor-pointer"
                  >
                    Navigate to Optimal Route Rejoin Waypoint (Guindy)
                  </button>
                </div>
              )}

              {detourStage === 'REJOINING_ROUTE' && (
                <div className="space-y-2 pt-1">
                  <div className="text-muted-foreground text-xs">
                    Approaching Guindy Junction rejoin stop. Resume original scheduled timetable.
                  </div>
                  <button
                    onClick={() => setDetourStage('RESUMED')}
                    className="w-full py-2 bg-foreground text-background font-bold uppercase rounded cursor-pointer"
                  >
                    Confirm Route Rejoin & Resume Timetable
                  </button>
                </div>
              )}

              {detourStage === 'RESUMED' && (
                <div className="space-y-2 pt-1">
                  <div className="text-foreground text-xs font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Detour Completed & Closed. Normal Timetable Active.</span>
                  </div>
                  <button
                    onClick={() => setDetourStage('NONE')}
                    className="w-full py-1.5 bg-secondary hover:bg-accent text-foreground rounded border border-border cursor-pointer text-xs"
                  >
                    Conclude Detour Flow
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
