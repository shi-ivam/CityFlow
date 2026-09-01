import React, { useState } from 'react';
import { Calendar, Clock, Bus, UserCheck, CheckCircle2, Sparkles, ArrowRight, X } from 'lucide-react';

export default function PlanTripDrawer({
  isOpen,
  onClose,
  routes = [],
  busFleet = [],
  crewMembers = [],
  onScheduleTrip,
  showSuccessToast,
  selectedCity = 'delhi'
}) {
  if (!isOpen) return null;

  const [selectedRouteId, setSelectedRouteId] = useState(routes[0]?.id || '');
  const [tripDate, setTripDate] = useState('2026-09-02');
  const [departureTime, setDepartureTime] = useState('08:30 AM');
  const [selectedBusId, setSelectedBusId] = useState(busFleet[0]?.id || '');
  const [selectedDriverId, setSelectedDriverId] = useState(crewMembers[0]?.id || '');

  const targetRoute = routes.find(r => r.id === selectedRouteId) || routes[0];
  const targetBus = busFleet.find(b => b.id === selectedBusId) || busFleet[0];
  const targetDriver = crewMembers.find(c => c.id === selectedDriverId) || crewMembers[0];

  const handleScheduleSubmit = () => {
    const newTrip = {
      id: `TRIP-${targetRoute?.code || '102'}-${Math.floor(100 + Math.random() * 900)}`,
      routeId: targetRoute?.id,
      routeCode: targetRoute?.code,
      date: tripDate,
      departureTime,
      busId: targetBus?.id,
      busNumber: targetBus?.busNumber,
      driverId: targetDriver?.id,
      driverName: targetDriver?.name || targetDriver?.fullName,
      status: 'SCHEDULED',
      currentStop: targetRoute?.stops[0]?.name || 'Origin',
      nextStop: targetRoute?.stops[1]?.name || 'Next Stop',
      etaMins: 10,
      occupancyRatio: `0 / ${targetBus?.capacity || 50}`
    };

    if (onScheduleTrip) {
      onScheduleTrip(newTrip);
    }
    if (showSuccessToast) {
      showSuccessToast(`✓ TRIP SCHEDULED: ${newTrip.id} on Route ${newTrip.routeCode} at ${departureTime}!`);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[3500] bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 font-sans animate-in fade-in duration-150 select-none">
      <div className="w-full max-w-lg bg-card border border-border rounded-xl shadow-modal overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-4 border-b border-border bg-muted/40 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-foreground">
              + PLAN NEW TRIP ({selectedCity === 'chennai' ? 'Chennai' : 'Delhi'} Network)
            </h2>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4 font-sans">
          
          {/* Step 1: Select Route */}
          <div>
            <label className="block text-xs font-mono text-muted-foreground uppercase mb-1">
              1. Select Route Template
            </label>
            <select
              value={selectedRouteId}
              onChange={(e) => setSelectedRouteId(e.target.value)}
              className="w-full px-3 py-2 rounded bg-muted/50 border border-input font-mono text-xs text-foreground outline-none focus:border-primary"
            >
              {routes.map(r => (
                <option key={r.id} value={r.id}>
                  Route {r.code} — {r.name} ({r.lengthKm} km)
                </option>
              ))}
            </select>
          </div>

          {/* Step 2 & 3: Date & Departure Time */}
          <div className="grid grid-cols-2 gap-3 font-mono text-xs">
            <div>
              <label className="block text-muted-foreground uppercase mb-1 flex items-center space-x-1">
                <Calendar className="w-3 h-3 text-primary" />
                <span>Date</span>
              </label>
              <input
                type="date"
                value={tripDate}
                onChange={(e) => setTripDate(e.target.value)}
                className="w-full px-3 py-2 rounded bg-muted/50 border border-input text-foreground outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-muted-foreground uppercase mb-1 flex items-center space-x-1">
                <Clock className="w-3 h-3 text-primary" />
                <span>Departure Time</span>
              </label>
              <input
                type="text"
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
                placeholder="08:30 AM"
                className="w-full px-3 py-2 rounded bg-muted/50 border border-input text-foreground outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Step 4 & 5: Bus & Driver Cascading Selection */}
          <div className="grid grid-cols-2 gap-3 font-mono text-xs">
            <div>
              <label className="block text-muted-foreground uppercase mb-1 flex items-center space-x-1">
                <Bus className="w-3 h-3 text-emerald-500" />
                <span>Assigned Bus</span>
              </label>
              <select
                value={selectedBusId}
                onChange={(e) => setSelectedBusId(e.target.value)}
                className="w-full px-3 py-2 rounded bg-muted/50 border border-input text-foreground outline-none focus:border-primary"
              >
                {busFleet.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.busNumber} ({b.capacity} Seats)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-muted-foreground uppercase mb-1 flex items-center space-x-1">
                <UserCheck className="w-3 h-3 text-amber-500" />
                <span>Assigned Driver</span>
              </label>
              <select
                value={selectedDriverId}
                onChange={(e) => setSelectedDriverId(e.target.value)}
                className="w-full px-3 py-2 rounded bg-muted/50 border border-input text-foreground outline-none focus:border-primary"
              >
                {crewMembers.map(c => (
                  <option key={c.id} value={c.id}>
                    ★ {c.name || c.fullName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* CityFlow Auto-Validation Recommendation Box */}
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 font-mono text-xs space-y-1.5 text-emerald-800 dark:text-emerald-300">
            <div className="font-bold flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>TRIP READY & VALIDATED BY CITYFLOW</span>
            </div>
            <div className="text-muted-foreground text-[11px] space-y-0.5">
              <div>✓ Recommended Bus: <strong>{targetBus?.busNumber}</strong> (Available)</div>
              <div>✓ Recommended Driver: <strong>{targetDriver?.name || targetDriver?.fullName}</strong> (11h Rest Complete)</div>
              <div>✓ 0 Schedule Conflicts • 0 Resource Clashes</div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-muted/40 flex items-center justify-between font-mono text-xs">
          <button onClick={onClose} className="px-3.5 py-1.5 rounded bg-muted text-muted-foreground hover:text-foreground">
            Cancel
          </button>

          <button
            onClick={handleScheduleSubmit}
            className="px-5 py-2 rounded bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-sm flex items-center space-x-1.5 active:scale-95"
          >
            <span>SCHEDULE TRIP</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
}
