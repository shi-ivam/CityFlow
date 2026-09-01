import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  ArrowLeft, 
  Bus, 
  Wrench, 
  Route, 
  UserCheck, 
  Activity, 
  FileText, 
  History, 
  Zap, 
  ShieldCheck, 
  Calendar, 
  Clock,
  Edit2
} from 'lucide-react';

export default function VehicleFullProfileModal({
  vehicle,
  onClose,
  onEditVehicle,
  onAssignVehicle,
  onScheduleMaintenance,
  trips = []
}) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!vehicle) return null;

  const vehicleTrips = trips.filter(t => t.busId === vehicle.id || t.busNumber === vehicle.busNumber);

  return createPortal(
    <div className="fixed inset-0 z-[99999] overflow-y-auto bg-background/95 backdrop-blur-md p-4 lg:p-10 font-sans text-foreground">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Navigation */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <button
            onClick={onClose}
            className="flex items-center space-x-2 text-xs font-mono text-muted-foreground hover:text-foreground transition cursor-pointer font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>&lt; BACK TO FLEET OPERATIONS</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onEditVehicle(vehicle)}
              className="px-3 py-1.5 rounded-md bg-card border border-border text-foreground hover:bg-muted font-mono text-xs transition flex items-center space-x-1.5 cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Asset</span>
            </button>
            <button
              onClick={() => onAssignVehicle(vehicle)}
              className="px-3 py-1.5 rounded-md bg-card border border-border text-foreground hover:bg-muted font-mono text-xs transition flex items-center space-x-1.5 cursor-pointer"
            >
              <Route className="w-3.5 h-3.5" />
              <span>Assign</span>
            </button>
            <button
              onClick={() => onScheduleMaintenance(vehicle)}
              className="px-3 py-1.5 rounded-md bg-rose-600 text-white font-mono text-xs font-bold hover:opacity-90 transition flex items-center space-x-1.5 cursor-pointer"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Schedule Maintenance</span>
            </button>
          </div>
        </div>

        {/* Vehicle Identity Banner */}
        <div className="bg-card border border-border rounded-lg p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
          <div>
            <div className="flex items-center space-x-2 font-mono text-xs text-muted-foreground">
              <span>ASSET ID: {vehicle.id}</span>
              <span>•</span>
              <span>VIN: {vehicle.vin || 'MAT624001N8A94120'}</span>
            </div>
            <h1 className="text-3xl font-bold font-mono text-foreground mt-1">
              {vehicle.busNumber}
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              {vehicle.manufacturer || 'Tata Motors'} {vehicle.model || 'Starbus EV'} • {vehicle.type} ({vehicle.capacity} Seats)
            </p>
          </div>

          <div className="flex items-center space-x-3 font-mono text-xs">
            <div className="p-3 bg-muted/30 border border-border rounded text-center min-w-24">
              <div className="text-[10px] text-muted-foreground">BATTERY / FUEL</div>
              <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{vehicle.batteryPct}%</div>
            </div>
            <div className="p-3 bg-muted/30 border border-border rounded text-center min-w-24">
              <div className="text-[10px] text-muted-foreground">ODOMETER</div>
              <div className="text-xl font-bold text-foreground mt-0.5">{((vehicle.odometerKm || 84231) / 1000).toFixed(0)}k km</div>
            </div>
            <div className="p-3 bg-muted/30 border border-border rounded text-center min-w-24">
              <div className="text-[10px] text-muted-foreground">STATUS</div>
              <div className="text-xs font-bold text-emerald-600 mt-1.5">{vehicle.status}</div>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center space-x-2 border-b border-border font-mono text-xs">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'telemetry', label: 'Live Telemetry' },
            { id: 'trips', label: `Trips (${vehicleTrips.length})` },
            { id: 'maintenance', label: 'Service & Maintenance' },
            { id: 'documents', label: 'Compliance Documents' },
            { id: 'activity', label: 'Activity Audit Log' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 border-b-2 font-medium transition cursor-pointer ${
                activeTab === tab.id
                  ? 'border-primary text-primary font-bold'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
              <div className="bg-card border border-border rounded-lg p-5 space-y-3">
                <h3 className="font-bold text-sm text-foreground uppercase border-b border-border pb-2">
                  Technical Specifications
                </h3>
                <div className="divide-y divide-border/60">
                  <div className="py-2 flex justify-between">
                    <span className="text-muted-foreground">Powertrain:</span>
                    <span className="font-bold text-foreground">{vehicle.fuelType || 'ELECTRIC (CCS-2 Fast Charge)'}</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-muted-foreground">Range per Charge:</span>
                    <span className="font-bold text-foreground">{vehicle.rangeKm || 186} km</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-muted-foreground">Depot Base:</span>
                    <span className="font-bold text-foreground">{vehicle.depot || 'Kashmere Gate ISBT'}</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-muted-foreground">Manufacturing Year:</span>
                    <span className="font-bold text-foreground">{vehicle.year || 2024}</span>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-5 space-y-3">
                <h3 className="font-bold text-sm text-foreground uppercase border-b border-border pb-2">
                  Current Operational Assignment
                </h3>
                <div className="divide-y divide-border/60">
                  <div className="py-2 flex justify-between">
                    <span className="text-muted-foreground">Assigned Route:</span>
                    <span className="font-bold text-primary">Route {vehicle.assignedRoute || '534'}</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-muted-foreground">Assigned Driver:</span>
                    <span className="font-bold text-foreground">{vehicle.assignedDriver || 'Rajesh Kumar'}</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-muted-foreground">Live Speed:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{vehicle.speedKmH || 42} km/h</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-muted-foreground">GPS Location Ping:</span>
                    <span className="font-bold text-foreground">{vehicle.lastGpsUpdate || '12 sec ago'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'trips' && (
            <div className="bg-card border border-border rounded-lg overflow-hidden font-mono text-xs">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-muted/50 border-b border-border text-muted-foreground uppercase text-[11px]">
                    <th className="p-3">Trip ID</th>
                    <th className="p-3">Route</th>
                    <th className="p-3">Departure</th>
                    <th className="p-3">Driver</th>
                    <th className="p-3">Current / Next Stop</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {vehicleTrips.map((trip) => (
                    <tr key={trip.id} className="hover:bg-muted/30">
                      <td className="p-3 font-bold text-primary">{trip.id}</td>
                      <td className="p-3 font-bold text-foreground">Route {trip.routeCode}</td>
                      <td className="p-3 text-muted-foreground">{trip.departureTime}</td>
                      <td className="p-3 text-foreground">{trip.driverName}</td>
                      <td className="p-3 text-muted-foreground">{trip.currentStop} → {trip.nextStop}</td>
                      <td className="p-3 font-bold text-emerald-600">{trip.status}</td>
                    </tr>
                  ))}
                  {vehicleTrips.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-muted-foreground">
                        No active or scheduled trips found for this vehicle.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
              {[
                { title: "Registration Certificate (RC)", number: "RC-DL-01-2024-8841", expiry: vehicle.compliance?.permitExpiry || "2028-06-30", status: "VALID" },
                { title: "Commercial Vehicle Insurance", number: "INS-ICICI-881920-A", expiry: vehicle.compliance?.insuranceExpiry || "2027-03-15", status: "VALID" },
                { title: "Fitness Certificate", number: "FIT-MVD-DEL-4019", expiry: vehicle.compliance?.fitnessExpiry || "2026-11-20", status: "VALID" },
                { title: "Pollution Under Control (PUC)", number: "PUC-DPCC-99014", expiry: vehicle.compliance?.pollutionExpiry || "2026-10-05", status: "EXPIRING SOON" }
              ].map((doc, idx) => (
                <div key={idx} className="p-4 bg-card border border-border rounded-lg space-y-2">
                  <div className="flex justify-between font-bold text-foreground">
                    <span>{doc.title}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-600 border border-emerald-500/30">
                      {doc.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground">Doc Ref: {doc.number}</div>
                  <div className="text-[11px] text-muted-foreground">Expiry Date: <strong className="text-foreground">{doc.expiry}</strong></div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
