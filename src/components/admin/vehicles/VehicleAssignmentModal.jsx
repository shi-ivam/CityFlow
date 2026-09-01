import React, { useState, useEffect } from 'react';
import { X, Route, UserCheck, AlertTriangle, CheckCircle2, Calendar } from 'lucide-react';

export default function VehicleAssignmentModal({
  isOpen,
  onClose,
  vehicle,
  routes = [],
  crewMembers = [],
  onSaveAssignment
}) {
  if (!isOpen || !vehicle) return null;

  const [selectedRouteCode, setSelectedRouteCode] = useState(vehicle.assignedRoute || (routes[0]?.code || '534'));
  const [selectedDriverId, setSelectedDriverId] = useState(vehicle.driverId || (crewMembers[0]?.id || 'DRV-1042'));
  const [shiftTime, setShiftTime] = useState('06:00 → 14:00 IST (Morning Peak)');
  const [depot, setDepot] = useState(vehicle.depot || 'Kashmere Gate ISBT');

  const selectedDriver = crewMembers.find(c => c.id === selectedDriverId) || crewMembers[0];
  const hasDriverRestViolation = selectedDriver?.status === 'REST_VIOLATION' || selectedDriver?.accumulatedHours >= 8;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveAssignment({
      vehicleId: vehicle.id,
      assignedRoute: selectedRouteCode,
      driverId: selectedDriver?.id,
      assignedDriver: selectedDriver?.fullName || selectedDriver?.name,
      depot,
      shiftTime
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 font-sans text-foreground">
      <div className="bg-card border border-border rounded-lg max-w-lg w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 border-b border-border bg-muted/20 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Route className="w-5 h-5 text-primary" />
            <div>
              <h2 className="text-sm font-bold font-mono text-foreground">
                Assign Vehicle: {vehicle.busNumber}
              </h2>
              <p className="text-xs text-muted-foreground">
                Pair asset with transit corridor, driver roster, and depot terminal.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 font-mono text-xs">
          
          {/* Corridor Route */}
          <div>
            <label className="block text-[10px] text-muted-foreground uppercase mb-1 font-bold">
              Transit Route Corridor
            </label>
            <select
              value={selectedRouteCode}
              onChange={(e) => setSelectedRouteCode(e.target.value)}
              className="w-full p-2 rounded bg-muted/40 border border-input text-foreground outline-none font-bold"
            >
              {routes.map(r => (
                <option key={r.id} value={r.code}>
                  Route {r.code} — {r.name} ({r.lengthKm} km)
                </option>
              ))}
            </select>
          </div>

          {/* Assigned Driver */}
          <div>
            <label className="block text-[10px] text-muted-foreground uppercase mb-1 font-bold">
              Assigned Driver &amp; Crew Member
            </label>
            <select
              value={selectedDriverId}
              onChange={(e) => setSelectedDriverId(e.target.value)}
              className="w-full p-2 rounded bg-muted/40 border border-input text-foreground outline-none"
            >
              {crewMembers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.badge} — {c.fullName || c.name} ({c.status})
                </option>
              ))}
            </select>
          </div>

          {/* Conflict Warning Banner if Driver has rest violation */}
          {hasDriverRestViolation && (
            <div className="p-3 rounded bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 space-y-1">
              <div className="flex items-center space-x-1.5 font-bold">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>Rest Period Compliance Warning</span>
              </div>
              <p className="text-[11px] font-sans">
                {selectedDriver?.fullName || 'Selected Driver'} has accumulated {selectedDriver?.accumulatedHours || 8}h of driving duty and requires a mandatory 11-hour rest window before next shift dispatch.
              </p>
            </div>
          )}

          {/* Shift Time Window */}
          <div>
            <label className="block text-[10px] text-muted-foreground uppercase mb-1 font-bold">
              Operating Shift Schedule
            </label>
            <select
              value={shiftTime}
              onChange={(e) => setShiftTime(e.target.value)}
              className="w-full p-2 rounded bg-muted/40 border border-input text-foreground outline-none"
            >
              <option value="06:00 → 14:00 IST (Morning Peak)">06:00 → 14:00 IST (Morning Peak)</option>
              <option value="14:00 → 22:00 IST (Evening Peak)">14:00 → 22:00 IST (Evening Peak)</option>
              <option value="22:00 → 06:00 IST (Night Express)">22:00 → 06:00 IST (Night Express)</option>
            </select>
          </div>

          {/* Base Depot */}
          <div>
            <label className="block text-[10px] text-muted-foreground uppercase mb-1 font-bold">
              Dispatch Depot Terminal
            </label>
            <select
              value={depot}
              onChange={(e) => setDepot(e.target.value)}
              className="w-full p-2 rounded bg-muted/40 border border-input text-foreground outline-none"
            >
              <option value="Kashmere Gate ISBT">Kashmere Gate ISBT</option>
              <option value="Anand Vihar Hub">Anand Vihar Hub</option>
              <option value="Dwarka Sector 21 Depot">Dwarka Sector 21 Depot</option>
              <option value="Rohini Sector 14 Depot">Rohini Sector 14 Depot</option>
            </select>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-border flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded bg-muted/40 hover:bg-muted text-foreground transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded bg-primary text-primary-foreground font-bold hover:opacity-90 transition cursor-pointer flex items-center space-x-1"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Confirm Assignment</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
