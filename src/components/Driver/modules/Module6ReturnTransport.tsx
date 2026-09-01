import React, { useState } from 'react';
import {
  Bus,
  MapPin,
  Clock,
  CheckCircle2,
  PhoneCall,
  QrCode,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Ticket,
} from 'lucide-react';

interface ReturnBusOption {
  id: string;
  busId: string;
  routeCode: string;
  routeName: string;
  departureTime: string;
  destinationEta: string;
  availableSeats: number;
  totalSeats: number;
  pickupStop: string;
}

const RETURN_OPTIONS: ReturnBusOption[] = [
  {
    id: 'ret-1',
    busId: 'TN-01-N-9018',
    routeCode: '45B',
    routeName: 'Tindivanam Hub ⇄ T. Nagar Depot',
    departureTime: '19:45 IST',
    destinationEta: '21:10 IST',
    availableSeats: 14,
    totalSeats: 35,
    pickupStop: 'Bay 2, Tindivanam Hub',
  },
  {
    id: 'ret-2',
    busId: 'TN-01-N-9032',
    routeCode: '19B',
    routeName: 'Intercity South ⇄ Central Depot',
    departureTime: '20:05 IST',
    destinationEta: '21:35 IST',
    availableSeats: 22,
    totalSeats: 35,
    pickupStop: 'Bay 4, Tindivanam Hub',
  },
  {
    id: 'ret-3',
    busId: 'TN-01-N-9005',
    routeCode: '21G',
    routeName: 'Highway Express ⇄ T. Nagar Depot',
    departureTime: '20:30 IST',
    destinationEta: '22:00 IST',
    availableSeats: 8,
    totalSeats: 35,
    pickupStop: 'Bay 1, Tindivanam Hub',
  },
];

interface Module6ReturnTransportProps {
  homeDepot?: string;
}

export const Module6ReturnTransport: React.FC<Module6ReturnTransportProps> = ({
  homeDepot = 'Central Depot (T. Nagar, Chennai)',
}) => {
  const [isAtHomeDepot, setIsAtHomeDepot] = useState<boolean | null>(null);
  const [selectedBus, setSelectedBus] = useState<ReturnBusOption | null>(RETURN_OPTIONS[0]);
  const [bookingStatus, setBookingStatus] = useState<'NONE' | 'CONFIRMED' | 'ONBOARD' | 'ARRIVED'>('NONE');
  const [showEscalation, setShowEscalation] = useState<boolean>(false);

  return (
    <div className="space-y-4 font-sans">
      {/* 1. Post-Duty Destination Prompt */}
      <div className="bg-card border border-border p-4 rounded shadow-sm font-mono text-xs">
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-foreground" />
            <h3 className="font-semibold text-xs text-foreground uppercase tracking-wider">
              Post-Duty Repatriation Status
            </h3>
          </div>
          <span className="px-2 py-0.5 bg-secondary text-foreground font-semibold rounded text-[10px] border border-border">
            Issue #8 Return Core
          </span>
        </div>

        <div className="p-2.5 bg-secondary/50 rounded border border-border mb-3 space-y-1">
          <div className="text-[11px] text-muted-foreground">DESIGNATED HOME BASE:</div>
          <div className="font-bold text-foreground text-sm">{homeDepot}</div>
          <div className="text-[11px] text-muted-foreground">
            Current Position: Tindivanam Central Transit Hub (Inter-district Changeover Point)
          </div>
        </div>

        {isAtHomeDepot === true ? (
          <div className="p-3 bg-secondary/60 rounded border border-border text-center space-y-2">
            <CheckCircle2 className="w-6 h-6 text-foreground mx-auto" />
            <div className="font-bold text-foreground">DUTY CONCLUDED AT HOME BASE</div>
            <p className="text-[11px] text-muted-foreground">
              No return transport requested. Have a safe rest period.
            </p>
            <button
              onClick={() => setIsAtHomeDepot(null)}
              className="text-[11px] underline text-muted-foreground hover:text-foreground cursor-pointer"
            >
              Change Response
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => setIsAtHomeDepot(true)}
              className="flex-1 py-2 bg-secondary hover:bg-accent text-foreground rounded border border-border font-semibold text-xs cursor-pointer transition-colors"
            >
              I am at Home Depot / Off-Duty
            </button>
            <button
              onClick={() => setIsAtHomeDepot(false)}
              className="flex-1 py-2 bg-foreground text-background font-bold rounded text-xs cursor-pointer hover:opacity-90 transition-opacity"
            >
              Request Return Transport
            </button>
          </div>
        )}
      </div>

      {/* 2. Smart Return Bus Matcher (Active Regular Passenger Buses) */}
      {isAtHomeDepot !== true && (
        <div className="bg-card border border-border p-4 rounded shadow-sm font-mono text-xs">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <Bus className="w-4 h-4 text-foreground" />
              <h3 className="font-semibold text-xs text-foreground uppercase tracking-wider">
                Smart Return Bus Matcher
              </h3>
            </div>
            <span className="text-[10px] text-muted-foreground">Verified Capacity</span>
          </div>

          {bookingStatus === 'NONE' ? (
            <div className="space-y-2">
              <p className="text-muted-foreground text-xs leading-relaxed">
                Active scheduled passenger buses returning towards {homeDepot}. Seat reserved without
                rerouting:
              </p>

              <div className="space-y-2">
                {RETURN_OPTIONS.map((opt) => {
                  const isSelected = selectedBus?.id === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => setSelectedBus(opt)}
                      className={`p-3 rounded border transition-all cursor-pointer space-y-1.5 ${
                        isSelected
                          ? 'bg-secondary border-foreground/60 shadow-sm'
                          : 'bg-secondary/30 hover:bg-secondary/60 border-border'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-foreground text-xs">
                          {opt.busId} (Route {opt.routeCode})
                        </span>
                        <span className="px-2 py-0.5 bg-card text-foreground font-bold text-[10px] rounded border border-border">
                          {opt.availableSeats} Seats Available
                        </span>
                      </div>

                      <div className="text-[11px] text-muted-foreground">
                        {opt.routeName}
                      </div>

                      <div className="flex justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/50">
                        <span>Departs: <strong className="text-foreground">{opt.departureTime}</strong></span>
                        <span>Depot ETA: <strong className="text-foreground">{opt.destinationEta}</strong></span>
                        <span>Pickup: <strong className="text-foreground">{opt.pickupStop}</strong></span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {selectedBus && (
                <button
                  onClick={() => setBookingStatus('CONFIRMED')}
                  className="w-full mt-2 py-2.5 bg-foreground text-background font-bold uppercase rounded text-xs cursor-pointer hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  <Ticket className="w-4 h-4" />
                  <span>Reserve Return Transit Seat on {selectedBus.busId}</span>
                </button>
              )}
            </div>
          ) : (
            /* 3. Return Transit Boarding Pass & Lifecycle Tracking */
            <div className="space-y-3">
              <div className="p-3 bg-secondary/60 border border-foreground/30 rounded space-y-2">
                <div className="flex justify-between items-center pb-2 border-b border-border">
                  <span className="font-bold text-foreground flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-foreground" />
                    DIGITAL RETURN TRANSIT PASS
                  </span>
                  <span className="px-2 py-0.5 bg-foreground text-background font-bold text-[9px] rounded">
                    {bookingStatus}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-muted-foreground block">Return Bus</span>
                    <strong className="text-foreground">{selectedBus?.busId} (Route {selectedBus?.routeCode})</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Reserved Seat</span>
                    <strong className="text-foreground">Seat #04 (Driver Repat)</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Pickup Terminal</span>
                    <strong className="text-foreground">{selectedBus?.pickupStop}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Arrival ETA</span>
                    <strong className="text-foreground">{selectedBus?.destinationEta}</strong>
                  </div>
                </div>

                {/* Status Progression Buttons */}
                {bookingStatus === 'CONFIRMED' && (
                  <button
                    onClick={() => setBookingStatus('ONBOARD')}
                    className="w-full py-2 bg-foreground text-background font-bold uppercase rounded text-xs cursor-pointer hover:opacity-90"
                  >
                    Confirm Boarding (Status: ONBOARD)
                  </button>
                )}

                {bookingStatus === 'ONBOARD' && (
                  <button
                    onClick={() => setBookingStatus('ARRIVED')}
                    className="w-full py-2 bg-foreground text-background font-bold uppercase rounded text-xs cursor-pointer hover:opacity-90"
                  >
                    Confirm Arrival at Home Depot (Complete Repatriation)
                  </button>
                )}

                {bookingStatus === 'ARRIVED' && (
                  <div className="p-2 bg-card rounded border border-border text-center space-y-1">
                    <div className="font-bold text-foreground">
                      ✓ REPATRIATION COMPLETED AT HOME BASE
                    </div>
                    <button
                      onClick={() => setBookingStatus('NONE')}
                      className="text-[10px] underline text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      Book Another Return Pass
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. Dispatcher Escalation Fallback */}
      <div className="bg-card border border-border p-4 rounded shadow-sm font-mono text-xs">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-border">
          <div className="flex items-center gap-2">
            <PhoneCall className="w-4 h-4 text-foreground" />
            <h3 className="font-semibold text-xs text-foreground uppercase tracking-wider">
              Dispatcher Escalation Fallback
            </h3>
          </div>
          <span className="text-[10px] text-muted-foreground">Emergency Hotline</span>
        </div>

        {showEscalation ? (
          <div className="p-3 bg-secondary/70 rounded border border-border space-y-2">
            <div className="font-bold text-foreground">
              CENTRAL TRANSIT CONTROLLER HOTLINE: +91 44 2345 6789
            </div>
            <p className="text-muted-foreground text-xs">
              Transit Coordinator notified. Standby taxi / shuttle dispatch authorized if regular buses are
              unavailable.
            </p>
            <button
              onClick={() => setShowEscalation(false)}
              className="text-[10px] underline text-muted-foreground hover:text-foreground"
            >
              Dismiss
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">No return bus available in your window?</span>
            <button
              onClick={() => setShowEscalation(true)}
              className="px-3 py-1.5 bg-secondary hover:bg-accent text-foreground rounded border border-border font-semibold text-xs cursor-pointer transition-colors"
            >
              Request Dispatcher Assistance
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
