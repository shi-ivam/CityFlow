import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
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
      {/* SECTION 1: Overloaded Driver Flow */}
      <div className="bg-card border border-border p-4 rounded-md">
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-foreground" />
            <h3 className="font-semibold text-xs text-foreground uppercase tracking-wider font-mono">
              Overflow Reporting (Overloaded Vehicle)
            </h3>
          </div>
          <span className="px-2 py-0.5 bg-secondary text-foreground font-mono text-[10px] font-medium rounded-sm border border-border">
            Live Broadcast
          </span>
        </div>

        {overflowStatus === 'IDLE' ? (
          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-mono text-muted-foreground block mb-1">
                LOCATION:
              </label>
              <div className="p-2.5 bg-secondary/30 rounded-sm border border-border text-xs font-mono text-foreground font-medium flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-foreground" />
                <span>{currentStopName}</span>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-mono text-muted-foreground block mb-1">
                STRANDED PASSENGERS:
              </label>
              <div className="grid grid-cols-4 gap-2 font-mono text-xs">
                {[5, 10, 15, 20].map((count) => (
                  <button
                    key={count}
                    onClick={() => setSelectedPaxCount(count)}
                    className={`py-2 rounded-sm text-center transition-all cursor-pointer border font-semibold active:scale-[0.98] ${
                      selectedPaxCount === count
                        ? 'bg-foreground text-background border-foreground'
                        : 'bg-secondary/30 hover:bg-secondary text-foreground border-border'
                    }`}
                  >
                    +{count} Pax
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleBroadcastOverflow}
              className="w-full py-2.5 bg-foreground text-background font-mono text-xs font-medium uppercase rounded-sm cursor-pointer active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Radio className="w-4 h-4" />
              <span>Broadcast Overflow (+{selectedPaxCount} Pax)</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Live Overflow Status Tracking Stream */}
            <div className="p-3 bg-secondary/30 rounded-sm border border-border font-mono text-xs space-y-2">
              <div className="flex justify-between items-center pb-2 border-b border-border">
                <span className="text-muted-foreground text-[10px] uppercase">Incident #OVF-4091</span>
                <span className="px-2 py-0.5 bg-foreground text-background font-medium text-[9px] rounded-sm">
                  {overflowStatus.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
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
                  <span>Candidate Assisting Vehicles Ranked</span>
                </div>
                <div className="flex items-center gap-2">
                  {overflowStatus === 'DRIVER_ASSIGNED' || overflowStatus === 'ASSISTING_EN_ROUTE' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-foreground" />
                  ) : (
                    <span className="w-3.5 h-3.5 rounded-full border border-muted-foreground inline-block" />
                  )}
                  <span>Assisting Vehicle Confirmed (TN-01-N-9028)</span>
                </div>
              </div>

              {overflowStatus === 'ASSISTING_EN_ROUTE' && (
                <div className="p-2.5 bg-card rounded-sm border border-border text-xs mt-2 space-y-1">
                  <div className="flex items-center justify-between font-semibold text-foreground">
                    <span className="flex items-center gap-1.5">
                      <Bus className="w-3.5 h-3.5" />
                      <span>Bus TN-01-N-9028 (S. Murugan)</span>
                    </span>
                    <span>ETA: {assistingEta} mins</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Detour distance: +2.1 km &bull; Passengers notified.
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setOverflowStatus('IDLE')}
              className="w-full py-1.5 bg-secondary hover:bg-accent text-foreground font-mono text-xs font-medium rounded-sm border border-border cursor-pointer transition-colors active:scale-[0.98]"
            >
              Reset / Log Another Incident
            </button>
          </div>
        )}
      </div>

      {/* SECTION 2: Assisting Driver Detour Rerouting Console */}
      <div className="bg-card border border-border p-4 rounded-md">
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
          <div className="p-3 bg-secondary/40 border border-border rounded-sm text-xs font-mono space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-foreground" />
                OVERFLOW ASSISTANCE REQUEST
              </span>
              <span className="px-2 py-0.5 bg-foreground text-background font-medium text-[10px] rounded-sm flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{countdownSeconds}s</span>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] bg-card p-2 rounded-sm border border-border">
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
                className="flex-1 py-2 bg-foreground text-background font-medium rounded-sm text-xs uppercase cursor-pointer active:scale-[0.98] transition-all"
              >
                Accept Detour & Assist
              </button>
              <button
                onClick={handleDeclineDetour}
                className="px-3 py-2 bg-secondary hover:bg-accent text-foreground font-medium rounded-sm text-xs border border-border cursor-pointer active:scale-[0.98] transition-colors"
              >
                Decline
              </button>
            </div>
          </div>
        ) : detourStage === 'NONE' ? (
          <div className="p-3 bg-secondary/20 rounded-sm border border-border text-center space-y-2">
            <p className="text-xs text-muted-foreground font-mono">
              No active detour rerouting dispatches assigned to your bus.
            </p>
            <button
              onClick={() => {
                setIncomingAlertVisible(true);
                setCountdownSeconds(45);
              }}
              className="px-3 py-1.5 bg-secondary hover:bg-accent text-foreground text-xs font-mono font-medium rounded-sm border border-border cursor-pointer active:scale-[0.98]"
            >
              Simulate Incoming Assistance Alert
            </button>
          </div>
        ) : (
          /* Active Detour Progression Lifecycle */
          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 bg-secondary/30 rounded-sm border border-border space-y-2">
              <div className="flex justify-between items-center font-semibold text-foreground">
                <span>DYNAMIC DETOUR NAVIGATION</span>
                <span className="text-[10px] px-2 py-0.5 bg-foreground text-background rounded-sm">
                  {detourStage.replace(/_/g, ' ')}
                </span>
              </div>

              {detourStage === 'EN_ROUTE_TO_OVERFLOW' && (
                <div className="space-y-2 pt-1">
                  <div className="text-muted-foreground text-xs">
                    Navigating to Saidapet West Stop (+2.4 km detour polyline active).
                  </div>
                  <button
                    onClick={() => setDetourStage('PICKUP_CONFIRMED')}
                    className="w-full py-2 bg-foreground text-background font-medium uppercase rounded-sm cursor-pointer active:scale-[0.98]"
                  >
                    Confirm Arrival & Board Overflow Pax (+12 Pax)
                  </button>
                </div>
              )}

              {detourStage === 'PICKUP_CONFIRMED' && (
                <div className="space-y-2 pt-1">
                  <div className="text-foreground text-xs font-medium flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>12 passengers boarded. Bus occupancy updated to 94%.</span>
                  </div>
                  <button
                    onClick={() => setDetourStage('REJOINING_ROUTE')}
                    className="w-full py-2 bg-foreground text-background font-medium uppercase rounded-sm cursor-pointer active:scale-[0.98]"
                  >
                    Navigate to Optimal Route Rejoin Waypoint (Guindy)
                  </button>
                </div>
              )}

              {detourStage === 'REJOINING_ROUTE' && (
                <div className="space-y-2 pt-1">
                  <div className="text-muted-foreground text-xs">
                    Approaching Guindy Junction rejoin stop. Resume original schedule.
                  </div>
                  <button
                    onClick={() => setDetourStage('RESUMED')}
                    className="w-full py-2 bg-foreground text-background font-medium uppercase rounded-sm cursor-pointer active:scale-[0.98]"
                  >
                    Confirm Route Rejoin & Resume Timetable
                  </button>
                </div>
              )}

              {detourStage === 'RESUMED' && (
                <div className="space-y-2 pt-1">
                  <div className="text-foreground text-xs font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-foreground" />
                    <span>Detour Completed & Closed. Normal Timetable Active.</span>
                  </div>
                  <button
                    onClick={() => setDetourStage('NONE')}
                    className="w-full py-1.5 bg-secondary hover:bg-accent text-foreground rounded-sm border border-border cursor-pointer text-xs active:scale-[0.98]"
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
