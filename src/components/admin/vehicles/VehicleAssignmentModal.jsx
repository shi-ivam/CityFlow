import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Route, UserCheck, AlertTriangle, CheckCircle2, Calendar } from 'lucide-react';
import { validateVehicleAssignment } from '../../../services/vehicleService';

export default function VehicleAssignmentModal({
  isOpen,
  onClose,
  vehicle,
  routes = [],
  crewMembers = [],
  allVehicles = [],
  onSaveAssignment
}) {
  if (!isOpen || !vehicle) return null;

  const [selectedRouteCode, setSelectedRouteCode] = useState(vehicle.assignedRoute || (routes[0]?.code || '534'));
  const [selectedDriverId, setSelectedDriverId] = useState(vehicle.driverId || (crewMembers[0]?.id || 'DRV-1042'));
  const [shiftTime, setShiftTime] = useState('06:00 → 14:00 IST (Morning Peak)');
  const [depot, setDepot] = useState(vehicle.depot || 'Kashmere Gate ISBT');

  const selectedDriver = crewMembers.find(c => c.id === selectedDriverId) || crewMembers[0];
  const validation = validateVehicleAssignment(vehicle, selectedDriver, shiftTime, allVehicles);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validation.isValid) return;

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

  return createPortal(
    <div className="fixed inset-0 z-[99999] overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 font-sans text-foreground">
      <div className="bg-card border border-border/80 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        
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

          {/* Validation Errors (Blocking) */}
          {validation.errors.length > 0 && (
            <div className="p-3 rounded bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 space-y-1">
              <div className="flex items-center space-x-1.5 font-bold">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>Assignment Blocked</span>
              </div>
              {validation.errors.map((err, i) => (
                <p key={i} className="text-[11px] font-sans">{err}</p>
              ))}
            </div>
          )}

          {/* Validation Warnings (Operational Notice) */}
          {validation.warnings.length > 0 && (
            <div className="p-3 rounded bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 space-y-1">
              <div className="flex items-center space-x-1.5 font-bold">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Operational Notice</span>
              </div>
              {validation.warnings.map((warn, i) => (
                <p key={i} className="text-[11px] font-sans">{warn}</p>
              ))}
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
              disabled={!validation.isValid}
              className="px-4 py-1.5 rounded bg-primary text-primary-foreground font-bold hover:opacity-90 disabled:opacity-50 transition cursor-pointer flex items-center space-x-1 shadow-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Confirm Assignment</span>
            </button>
          </div>

        </form>

      </div>
    </div>,
    document.body
  );
}
