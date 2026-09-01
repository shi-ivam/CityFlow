import React, { useState } from 'react';
import {
  Bus,
  MapPin,
  CheckCircle2,
  PhoneCall,
  ShieldCheck,
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
    routeName: 'Tindivanam Hub &mdash; T. Nagar Depot',
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
    routeName: 'Intercity South &mdash; Central Depot',
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
    routeName: 'Highway Express &mdash; T. Nagar Depot',
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
      <div className="bg-card border border-border p-4 rounded-md font-mono text-xs">
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-foreground" />
            <h3 className="font-semibold text-xs text-foreground uppercase tracking-wider">
              Post-Duty Repatriation Status
            </h3>
          </div>
          <span className="px-2 py-0.5 bg-secondary text-foreground font-medium rounded-sm text-[10px] border border-border">
            Return Protocol
          </span>
        </div>

        <div className="p-2.5 bg-secondary/30 rounded-sm border border-border mb-3 space-y-1">
          <div className="text-[11px] text-muted-foreground">DESIGNATED HOME BASE:</div>
          <div className="font-semibold text-foreground text-sm tracking-tight">{homeDepot}</div>
          <div className="text-[11px] text-muted-foreground">
            Current Position: Tindivanam Central Transit Hub
          </div>
        </div>

        {isAtHomeDepot === true ? (
          <div className="p-3 bg-secondary/40 rounded-sm border border-border text-center space-y-2">
            <CheckCircle2 className="w-6 h-6 text-foreground mx-auto" />
            <div className="font-semibold text-foreground">DUTY CONCLUDED AT HOME BASE</div>
            <p className="text-[11px] text-muted-foreground font-sans">
              No return transport requested. Mandatory rest period initiated.
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
              className="flex-1 py-2 bg-secondary hover:bg-accent text-foreground rounded-sm border border-border font-medium text-xs cursor-pointer transition-colors active:scale-[0.98]"
            >
              At Home Depot / Off-Duty
            </button>
            <button
              onClick={() => setIsAtHomeDepot(false)}
              className="flex-1 py-2 bg-foreground text-background font-medium rounded-sm text-xs cursor-pointer active:scale-[0.98] transition-all"
            >
              Request Return Transport
            </button>
          </div>
        )}
      </div>

      {/* 2. Smart Return Bus Matcher */}
      {isAtHomeDepot !== true && (
        <div className="bg-card border border-border p-4 rounded-md font-mono text-xs">
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
              <p className="text-muted-foreground text-xs leading-relaxed font-sans">
                Active scheduled passenger buses returning towards {homeDepot}. Single driver seat reserved without modifying route:
              </p>

              <div className="space-y-2">
                {RETURN_OPTIONS.map((opt) => {
                  const isSelected = selectedBus?.id === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => setSelectedBus(opt)}
                      className={`p-3 rounded-sm border transition-all cursor-pointer space-y-1.5 active:scale-[0.99] ${
                        isSelected
                          ? 'bg-secondary/60 border-foreground/50'
                          : 'bg-secondary/20 hover:bg-secondary/40 border-border'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-foreground text-xs">
                          {opt.busId} (Route {opt.routeCode})
                        </span>
                        <span className="px-2 py-0.5 bg-card text-foreground font-medium text-[10px] rounded-sm border border-border">
                          {opt.availableSeats} Seats Available
                        </span>
                      </div>

                      <div
                        className="text-[11px] text-muted-foreground"
                        dangerouslySetInnerHTML={{ __html: opt.routeName }}
                      />

                      <div className="flex justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/40">
                        <span>Departs: <strong className="text-foreground">{opt.departureTime}</strong></span>
                        <span>ETA: <strong className="text-foreground">{opt.destinationEta}</strong></span>
                        <span>Bay: <strong className="text-foreground">{opt.pickupStop}</strong></span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {selectedBus && (
                <button
                  onClick={() => setBookingStatus('CONFIRMED')}
                  className="w-full mt-2 py-2.5 bg-foreground text-background font-medium uppercase rounded-sm text-xs cursor-pointer active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <Ticket className="w-4 h-4" />
                  <span>Reserve Transit Seat on {selectedBus.busId}</span>
                </button>
              )}
            </div>
          ) : (
            /* 3. Return Transit Boarding Pass */
            <div className="space-y-3">
              <div className="p-3 bg-secondary/30 border border-border rounded-sm space-y-2">
                <div className="flex justify-between items-center pb-2 border-b border-border">
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-foreground" />
                    DIGITAL RETURN PASS
                  </span>
                  <span className="px-2 py-0.5 bg-foreground text-background font-medium text-[9px] rounded-sm">
                    {bookingStatus}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-muted-foreground block">Return Vehicle</span>
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
                    className="w-full py-2 bg-foreground text-background font-medium uppercase rounded-sm text-xs cursor-pointer active:scale-[0.98]"
                  >
                    Confirm Boarding (Status: ONBOARD)
                  </button>
                )}

                {bookingStatus === 'ONBOARD' && (
                  <button
                    onClick={() => setBookingStatus('ARRIVED')}
                    className="w-full py-2 bg-foreground text-background font-medium uppercase rounded-sm text-xs cursor-pointer active:scale-[0.98]"
                  >
                    Confirm Arrival at Home Depot (Complete)
                  </button>
                )}

                {bookingStatus === 'ARRIVED' && (
                  <div className="p-2.5 bg-card rounded-sm border border-border text-center space-y-1">
                    <div className="font-semibold text-foreground flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-foreground" />
                      <span>REPATRIATION COMPLETED AT HOME BASE</span>
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
      <div className="bg-card border border-border p-4 rounded-md font-mono text-xs">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-border">
          <div className="flex items-center gap-2">
            <PhoneCall className="w-4 h-4 text-foreground" />
            <h3 className="font-semibold text-xs text-foreground uppercase tracking-wider">
              Dispatcher Escalation Fallback
            </h3>
          </div>
          <span className="text-[10px] text-muted-foreground">Coordinator</span>
        </div>

        {showEscalation ? (
          <div className="p-3 bg-secondary/40 rounded-sm border border-border space-y-2">
            <div className="font-semibold text-foreground">
              CENTRAL CONTROLLER HOTLINE: +91 44 2345 6789
            </div>
            <p className="text-muted-foreground text-xs font-sans">
              Transit Coordinator notified. Standby vehicle shuttle authorized if regular buses are unavailable.
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
              className="px-3 py-1.5 bg-secondary hover:bg-accent text-foreground rounded-sm border border-border font-medium text-xs cursor-pointer transition-colors active:scale-[0.98]"
            >
              Request Assistance
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
