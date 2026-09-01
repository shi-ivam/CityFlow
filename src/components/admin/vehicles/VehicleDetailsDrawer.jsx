import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Bus, 
  Zap, 
  Fuel, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Wrench, 
  FileText, 
  History, 
  UserCheck, 
  Route, 
  Activity, 
  Calendar,
  AlertTriangle,
  ExternalLink,
  Edit2
} from 'lucide-react';

export default function VehicleDetailsDrawer({
  vehicle = null,
  onClose,
  onEditVehicle,
  onAssignVehicle,
  onScheduleMaintenance,
  onOpenFullProfile
}) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!vehicle) return null;

  const isLowBattery = vehicle.batteryPct <= 25;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'IN_SERVICE':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
            In Service
          </span>
        );
      case 'STANDBY_READY':
      case 'AVAILABLE':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30">
            <Clock className="w-3 h-3 mr-1 text-amber-600" />
            Standby
          </span>
        );
      case 'MAINTENANCE':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30">
            <Wrench className="w-3 h-3 mr-1 text-rose-500" />
            Maintenance
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-muted text-muted-foreground border border-border">
            Offline
          </span>
        );
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] overflow-hidden bg-black/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-150 font-sans">
      
      {/* Click outside backdrop */}
      <div className="flex-1" onClick={onClose} />

      {/* Drawer Container */}
      <div className="w-full max-w-xl bg-card border-l border-border h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
        
        {/* Drawer Header */}
        <div className="p-4 lg:p-6 border-b border-border bg-muted/20 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs font-mono text-muted-foreground uppercase flex items-center space-x-2">
                <span>VEHICLE ASSET</span>
                <span>•</span>
                <span>{vehicle.id}</span>
              </div>
              <h2 className="text-2xl font-bold font-mono text-foreground tracking-tight mt-0.5">
                {vehicle.busNumber}
              </h2>
              <div className="text-xs text-muted-foreground mt-0.5">
                {vehicle.type} • {vehicle.capacity} Seats • {vehicle.manufacturer || 'EV'}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {getStatusBadge(vehicle.status)}
              <button
                onClick={onClose}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center space-x-1 border-b border-border/80 -mb-4 pt-2 font-mono text-xs overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: Bus },
              { id: 'telemetry', label: 'Telemetry', icon: Activity },
              { id: 'assignments', label: 'Assignments', icon: Route },
              { id: 'maintenance', label: 'Maintenance', icon: Wrench },
              { id: 'documents', label: 'Documents', icon: FileText },
              { id: 'history', label: 'History', icon: History }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-2 border-b-2 font-medium transition cursor-pointer flex items-center space-x-1.5 shrink-0 ${
                    isActive
                      ? 'border-primary text-primary font-bold'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Drawer Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Telemetry Quick Glance */}
              <div className="grid grid-cols-3 gap-3 font-mono">
                <div className="p-3 bg-muted/30 border border-border rounded-lg">
                  <div className="text-[10px] text-muted-foreground uppercase">SPEED</div>
                  <div className="text-lg font-bold text-foreground mt-0.5">
                    {vehicle.speedKmH > 0 ? `${vehicle.speedKmH} km/h` : '0 km/h'}
                  </div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400">
                    {vehicle.speedKmH > 0 ? 'Moving' : 'Idle'}
                  </div>
                </div>

                <div className="p-3 bg-muted/30 border border-border rounded-lg">
                  <div className="text-[10px] text-muted-foreground uppercase">BATTERY / FUEL</div>
                  <div className={`text-lg font-bold mt-0.5 ${isLowBattery ? 'text-rose-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {vehicle.batteryPct}%
                  </div>
                  <div className="text-[10px] text-muted-foreground">{vehicle.rangeKm || 180} km range</div>
                </div>

                <div className="p-3 bg-muted/30 border border-border rounded-lg">
                  <div className="text-[10px] text-muted-foreground uppercase">ODOMETER</div>
                  <div className="text-lg font-bold text-foreground mt-0.5">
                    {vehicle.odometerKm ? `${(vehicle.odometerKm / 1000).toFixed(1)}k km` : '84k km'}
                  </div>
                  <div className="text-[10px] text-muted-foreground">Total Distance</div>
                </div>
              </div>

              {/* Identity & Specifications */}
              <div className="space-y-3">
                <h3 className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-wider">
                  Vehicle Specifications
                </h3>
                <div className="bg-muted/20 border border-border rounded-lg p-3 divide-y divide-border/60 text-xs font-mono">
                  <div className="py-2 flex items-center justify-between">
                    <span className="text-muted-foreground">Manufacturer:</span>
                    <span className="font-bold text-foreground">{vehicle.manufacturer || 'Tata Motors'}</span>
                  </div>
                  <div className="py-2 flex items-center justify-between">
                    <span className="text-muted-foreground">Model & Year:</span>
                    <span className="font-bold text-foreground">{vehicle.model || 'Starbus EV'} ({vehicle.year || 2024})</span>
                  </div>
                  <div className="py-2 flex items-center justify-between">
                    <span className="text-muted-foreground">VIN / Chassis:</span>
                    <span className="font-bold text-primary">{vehicle.vin || 'MAT624001N8A94120'}</span>
                  </div>
                  <div className="py-2 flex items-center justify-between">
                    <span className="text-muted-foreground">Depot Base:</span>
                    <span className="font-bold text-foreground">{vehicle.depot || 'Kashmere Gate ISBT'}</span>
                  </div>
                  <div className="py-2 flex items-center justify-between">
                    <span className="text-muted-foreground">Seating Capacity:</span>
                    <span className="font-bold text-foreground">{vehicle.capacity} Passenger Seats</span>
                  </div>
                </div>
              </div>

              {/* Current Assignment */}
              <div className="space-y-3">
                <h3 className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-wider">
                  Current Operational Assignment
                </h3>
                <div className="p-3 bg-muted/20 border border-border rounded-lg space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Corridor Route:</span>
                    <span className="font-bold text-primary">
                      {vehicle.assignedRoute ? `Route ${vehicle.assignedRoute}` : 'Unassigned (Depot Reserve)'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Assigned Driver:</span>
                    <span className="font-bold text-foreground">
                      {vehicle.assignedDriver || 'No Active Driver'}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: TELEMETRY */}
          {activeTab === 'telemetry' && (
            <div className="space-y-4 font-mono text-xs">
              <div className="p-4 bg-muted/20 border border-border rounded-lg space-y-3">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">GPS CONNECTION</span>
                  <span className="inline-flex items-center space-x-1 font-bold text-emerald-600 dark:text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span>CONNECTED (LIVE)</span>
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-[10px] text-muted-foreground">LAST TELEMETRY PING</div>
                    <div className="font-bold text-foreground">{vehicle.lastGpsUpdate || '12 seconds ago'}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground">CABIN TEMPERATURE</div>
                    <div className="font-bold text-foreground">{vehicle.temperature || '24°C (Optimal)'}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground">AIR BRAKE PRESSURE</div>
                    <div className="font-bold text-foreground">{vehicle.brakePressureBar || 8.5} bar (Nominal)</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground">ELECTRIC MOTOR HEALTH</div>
                    <div className="font-bold text-emerald-600 dark:text-emerald-400">{vehicle.motorStatus || 'Normal (98%)'}</div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-muted/20 border border-border rounded-lg space-y-2">
                <div className="text-xs font-bold text-foreground">Battery & Thermal Management</div>
                <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                  <div style={{ width: `${vehicle.batteryPct}%` }} className="bg-emerald-500 h-full" />
                </div>
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>State of Charge: {vehicle.batteryPct}%</span>
                  <span>Estimated Range: {vehicle.rangeKm || 186} km</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ASSIGNMENTS */}
          {activeTab === 'assignments' && (
            <div className="space-y-4 font-mono text-xs">
              <div className="p-4 bg-muted/20 border border-border rounded-lg space-y-3">
                <div className="text-xs font-bold text-foreground">Operational Pairing</div>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 bg-card border border-border rounded flex items-center justify-between">
                    <span className="text-muted-foreground">Corridor:</span>
                    <span className="font-bold text-primary">Route {vehicle.assignedRoute || '534 Express'}</span>
                  </div>
                  <div className="p-2.5 bg-card border border-border rounded flex items-center justify-between">
                    <span className="text-muted-foreground">Driver:</span>
                    <span className="font-bold text-foreground">{vehicle.assignedDriver || 'Rajesh Kumar'} ({vehicle.driverId || 'DRV-1042'})</span>
                  </div>
                  <div className="p-2.5 bg-card border border-border rounded flex items-center justify-between">
                    <span className="text-muted-foreground">Shift:</span>
                    <span className="font-bold text-foreground">06:00 → 14:00 IST</span>
                  </div>
                </div>

                <button
                  onClick={() => onAssignVehicle(vehicle)}
                  className="w-full py-2 bg-primary text-primary-foreground font-bold rounded hover:opacity-90 transition cursor-pointer"
                >
                  Modify Vehicle Assignment
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: MAINTENANCE */}
          {activeTab === 'maintenance' && (
            <div className="space-y-4 font-mono text-xs">
              <div className="p-4 bg-muted/20 border border-border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">NEXT SCHEDULED SERVICE</span>
                  <span className="font-bold text-foreground">{vehicle.nextServiceDate || '2026-09-18'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">LAST INSPECTION</span>
                  <span className="font-bold text-foreground">{vehicle.lastInspectionDate || '2026-08-21'}</span>
                </div>
                <button
                  onClick={() => onScheduleMaintenance(vehicle)}
                  className="w-full py-2 bg-rose-600 text-white font-bold rounded hover:opacity-90 transition cursor-pointer flex items-center justify-center space-x-1.5"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Schedule Workshop Maintenance</span>
                </button>
              </div>

              {/* Maintenance History */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-muted-foreground uppercase">Service Logs</div>
                {(vehicle.maintenanceHistory || [
                  { date: "2026-08-21", type: "Periodic Brake & Regen Check", technician: "Devendra S.", cost: "₹4,200", status: "COMPLETED" },
                  { date: "2026-06-10", type: "Air Filter & Coolant Flush", technician: "R. Verma", cost: "₹12,800", status: "COMPLETED" }
                ]).map((log, i) => (
                  <div key={i} className="p-3 bg-muted/20 border border-border rounded space-y-1">
                    <div className="flex justify-between font-bold text-foreground">
                      <span>{log.type}</span>
                      <span className="text-emerald-600 dark:text-emerald-400">{log.status}</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground flex justify-between">
                      <span>Date: {log.date} • Tech: {log.technician}</span>
                      <span>Cost: {log.cost}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: DOCUMENTS */}
          {activeTab === 'documents' && (
            <div className="space-y-3 font-mono text-xs">
              {[
                { title: "Registration Certificate (RC)", expiry: vehicle.compliance?.permitExpiry || "2028-06-30", status: "VALID" },
                { title: "Commercial Vehicle Insurance", expiry: vehicle.compliance?.insuranceExpiry || "2027-03-15", status: "VALID" },
                { title: "Vehicle Fitness Certificate", expiry: vehicle.compliance?.fitnessExpiry || "2026-11-20", status: "VALID" },
                { title: "Pollution Under Control (PUC)", expiry: vehicle.compliance?.pollutionExpiry || "2026-10-05", status: "EXPIRING SOON" }
              ].map((doc, idx) => (
                <div key={idx} className="p-3 bg-muted/20 border border-border rounded-lg flex items-center justify-between">
                  <div>
                    <div className="font-bold text-foreground">{doc.title}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">Expires on {doc.expiry}</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                    doc.status === 'VALID'
                      ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                      : 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                  }`}>
                    {doc.status}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* TAB 6: ACTIVITY HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-3 font-mono text-xs">
              {(vehicle.activityHistory || [
                { time: "10:42 AM", event: "Assigned to Trip 534A by Dispatch", user: "Control Room Lead" },
                { time: "08:15 AM", event: "Pre-Trip Inspection Verified (Air Brakes 8.5 bar)", user: "Rajesh Kumar" },
                { time: "06:00 AM", event: "Dispatched from Kashmere Gate Bay 4", user: "Depot Supervisor" }
              ]).map((act, idx) => (
                <div key={idx} className="p-3 bg-muted/20 border border-border rounded-lg space-y-1">
                  <div className="flex justify-between font-bold text-foreground">
                    <span>{act.event}</span>
                    <span className="text-muted-foreground text-[10px]">{act.time}</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground">User: {act.user}</div>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 border-t border-border bg-muted/20 flex items-center justify-between font-mono text-xs">
          <button
            onClick={() => onOpenFullProfile && onOpenFullProfile(vehicle)}
            className="px-3 py-2 rounded bg-card border border-border hover:bg-muted text-foreground transition flex items-center space-x-1.5 cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Full Profile</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onEditVehicle(vehicle)}
              className="px-3 py-2 rounded bg-card border border-border hover:bg-muted text-foreground transition flex items-center space-x-1.5 cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
            <button
              onClick={() => onAssignVehicle(vehicle)}
              className="px-3 py-2 rounded bg-primary text-primary-foreground font-bold hover:opacity-90 transition cursor-pointer"
            >
              Assign
            </button>
          </div>
        </div>

      </div>

    </div>,
    document.body
  );
}
