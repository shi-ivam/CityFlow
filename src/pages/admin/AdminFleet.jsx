import React, { useState } from 'react';
import { 
  Bus, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  Wrench, 
  Shield, 
  ArrowUpDown,
  Plus,
  Trash2,
  Calendar,
  X,
  Zap,
  Route as RouteIcon
} from 'lucide-react';

export default function AdminFleet({ 
  busFleet = [], 
  dutyAssignments = [], 
  routes = [],
  onAddVehicle = () => {},
  onUpdateVehicle = () => {},
  onDeleteVehicle = () => {},
  onScheduleMaintenance = () => {}
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedBusId, setSelectedBusId] = useState(busFleet[0]?.id || null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [isAssignRouteModalOpen, setIsAssignRouteModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // New Bus State
  const [newRegNumber, setNewRegNumber] = useState('');
  const [newBusModel, setNewBusModel] = useState('Electric Low-Floor 42-Seater');
  const [newBusCapacity, setNewBusCapacity] = useState(42);
  const [newBusDepot, setNewBusDepot] = useState('Millennium Central');

  // Maintenance Form State
  const [maintenanceType, setMaintenanceType] = useState('PREVENTIVE_INSPECTION');
  const [maintenanceDate, setMaintenanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [maintenanceNotes, setMaintenanceNotes] = useState('');

  // Route Assign State
  const [selectedRouteToAssign, setSelectedRouteToAssign] = useState(routes[0]?.id || '');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredBuses = busFleet.filter((bus) => {
    const matchesSearch = 
      bus.busNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bus.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bus.model?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || bus.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const selectedBus = busFleet.find(b => b.id === selectedBusId) || filteredBuses[0] || busFleet[0];

  const getAssignedRoute = (busId) => {
    const duty = dutyAssignments.find(d => d.busId === busId);
    if (!duty) return null;
    return routes.find(r => r.id === duty.routeId);
  };

  const handleCreateBus = (e) => {
    e.preventDefault();
    if (!newRegNumber.trim()) return;

    const newId = `BUS-${Math.floor(200 + Math.random() * 800)}`;
    const busObj = {
      id: newId,
      busNumber: newRegNumber.trim().toUpperCase(),
      model: newBusModel,
      capacity: Number(newBusCapacity),
      status: 'IN_SERVICE',
      depot: newBusDepot,
      lastMaintenance: new Date().toISOString().split('T')[0]
    };

    if (onAddVehicle) {
      onAddVehicle(busObj);
    }
    showToast(`Bus ${newRegNumber} added to fleet with ID ${newId}`);
    setIsAddModalOpen(false);
    setNewRegNumber('');
  };

  const handleMaintenanceSubmit = (e) => {
    e.preventDefault();
    if (!selectedBus) return;

    if (onScheduleMaintenance) {
      onScheduleMaintenance(selectedBus.id, {
        maintenanceType,
        scheduledDate: maintenanceDate,
        notes: maintenanceNotes,
        priority: 'HIGH'
      });
    }
    showToast(`Maintenance scheduled for ${selectedBus.id}: ${maintenanceType}`);
    setIsMaintenanceModalOpen(false);
  };

  const handleRouteAssignSubmit = (e) => {
    e.preventDefault();
    if (!selectedBus || !selectedRouteToAssign) return;

    showToast(`Bus ${selectedBus.id} assigned to Route ${selectedRouteToAssign}`);
    setIsAssignRouteModalOpen(false);
  };

  const handleDeleteBus = () => {
    if (!selectedBus) return;
    if (onDeleteVehicle) {
      onDeleteVehicle(selectedBus.id);
    }
    showToast(`Vehicle ${selectedBus.id} removed from active fleet inventory.`);
    setIsDeleteConfirmOpen(false);
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto font-sans select-none text-foreground">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-muted-foreground uppercase font-bold">
            <Bus className="w-3.5 h-3.5 text-primary" />
            <span>Asset Management</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight mt-1">
            Bus Fleet Operations & Workshop Queue
          </h1>
          <p className="text-xs text-muted-foreground">
            Vehicle telemetry, seating capacity, maintenance status, and route pairings.
          </p>
        </div>

        {/* Action button */}
        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Vehicle</span>
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-[10px] hover:underline cursor-pointer">Dismiss</button>
        </div>
      )}

      {/* Main Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Fleet Table */}
        <div className="lg:col-span-8 bg-card border border-border rounded-2xl shadow-card overflow-hidden flex flex-col">
          <div className="p-3 border-b border-border bg-muted/30 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filter by bus number, model..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-card border border-input text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary font-sans"
              />
            </div>

            {/* Status Filter Chips */}
            <div className="flex items-center space-x-1 font-mono text-xs w-full sm:w-auto overflow-x-auto">
              {['ALL', 'IN_SERVICE', 'MAINTENANCE', 'STANDBY'].map(filter => (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={`px-2.5 py-1 rounded-lg transition cursor-pointer font-bold ${
                    statusFilter === filter
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto max-h-[560px]">
            <table className="w-full border-collapse text-left text-xs font-sans">
              <thead>
                <tr className="bg-muted/60 border-b border-border text-muted-foreground font-mono uppercase text-[11px] font-semibold tracking-wider sticky top-0 bg-card z-10">
                  <th className="p-3">Vehicle ID</th>
                  <th className="p-3">Registration</th>
                  <th className="p-3">Model</th>
                  <th className="p-3 font-mono">Assigned Route</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredBuses.map((bus) => {
                  const isSelected = bus.id === selectedBus?.id;
                  const route = getAssignedRoute(bus.id);

                  return (
                    <tr
                      key={bus.id}
                      onClick={() => setSelectedBusId(bus.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-primary/10 font-medium border-l-4 border-l-primary' : 'hover:bg-accent/40'
                      }`}
                    >
                      <td className="p-3 font-mono font-bold text-foreground">
                        {bus.id}
                      </td>
                      <td className="p-3 font-medium text-foreground">
                        {bus.busNumber || bus.regNumber || 'DL-1PC-0100'}
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {bus.model}
                      </td>
                      <td className="p-3 font-mono">
                        {route ? (
                          <span className="px-2 py-0.5 rounded bg-primary/15 text-primary font-bold">
                            {route.code || route.id}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-[10px]">Unassigned</span>
                        )}
                      </td>
                      <td className="p-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono font-bold ${
                          bus.status === 'IN_SERVICE' 
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' 
                            : bus.status === 'MAINTENANCE'
                            ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {bus.status || 'IN_SERVICE'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Bus Detail Inspector */}
        {selectedBus && (
          <div className="lg:col-span-4 bg-card border border-border rounded-2xl shadow-card p-5 space-y-5 flex flex-col justify-between">
            <div className="border-b border-border pb-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 rounded-2xl bg-primary/20 text-primary font-mono text-lg font-bold flex items-center justify-center border border-primary/30">
                  <Bus className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">
                    {selectedBus.id}
                  </h2>
                  <div className="text-xs font-mono text-muted-foreground">
                    {selectedBus.busNumber || 'DL-1PC-0100'}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsDeleteConfirmOpen(true)}
                className="p-2 rounded-xl text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                title="Retire Bus Asset"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Spec breakdown */}
            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-muted/30 border border-border space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Model & Propulsion</span>
                <div className="font-bold text-foreground text-sm">{selectedBus.model}</div>
                <div className="text-[11px] text-muted-foreground">Depot: {selectedBus.depot || 'Central Depot'}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-muted/30 border border-border">
                  <div className="text-[10px] text-muted-foreground uppercase">Seating Capacity</div>
                  <div className="text-xl font-bold text-foreground mt-0.5">{selectedBus.capacity || 42}</div>
                </div>
                <div className="p-3 rounded-xl bg-muted/30 border border-border">
                  <div className="text-[10px] text-muted-foreground uppercase">Last Workshop</div>
                  <div className="text-xs font-bold text-foreground mt-1.5">{selectedBus.lastMaintenance || '2026-02-18'}</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => setIsAssignRouteModalOpen(true)}
                className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer flex items-center justify-center space-x-2"
              >
                <RouteIcon className="w-4 h-4 text-palette-ice" />
                <span>Assign Corridor Route</span>
              </button>

              <button
                onClick={() => setIsMaintenanceModalOpen(true)}
                className="w-full py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-bold text-xs transition cursor-pointer flex items-center justify-center space-x-2"
              >
                <Wrench className="w-4 h-4 text-amber-500" />
                <span>Schedule Maintenance</span>
              </button>
            </div>

          </div>
        )}

      </div>

      {/* Add Vehicle Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div onClick={() => setIsAddModalOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-xs" />
          <div className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4 z-10 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-base text-foreground flex items-center space-x-2">
                <Bus className="w-4 h-4 text-primary" />
                <span>Add Fleet Vehicle</span>
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-muted-foreground hover:text-foreground cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateBus} className="space-y-4 text-xs">
              <div>
                <label className="block text-muted-foreground font-mono uppercase mb-1">Registration Plate</label>
                <input
                  type="text"
                  required
                  value={newRegNumber}
                  onChange={(e) => setNewRegNumber(e.target.value)}
                  placeholder="e.g. DL-1PC-4509"
                  className="w-full px-3 py-2 rounded-xl bg-muted/40 border border-input text-foreground outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-muted-foreground font-mono uppercase mb-1">Vehicle Model</label>
                <select
                  value={newBusModel}
                  onChange={(e) => setNewBusModel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-muted/40 border border-input text-foreground outline-none focus:border-primary"
                >
                  <option value="Electric Low-Floor 42-Seater">Electric Low-Floor (42 Seater)</option>
                  <option value="CNG Standard Floor (45 Seater)">CNG Standard Floor (45 Seater)</option>
                  <option value="High-Capacity Articulated (70 Seater)">High-Capacity Articulated (70 Seater)</option>
                </select>
              </div>

              <div>
                <label className="block text-muted-foreground font-mono uppercase mb-1">Seating Capacity</label>
                <input
                  type="number"
                  required
                  value={newBusCapacity}
                  onChange={(e) => setNewBusCapacity(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-muted/40 border border-input text-foreground outline-none focus:border-primary"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 shadow-xs cursor-pointer"
                >
                  Save & Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Maintenance Modal */}
      {isMaintenanceModalOpen && selectedBus && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div onClick={() => setIsMaintenanceModalOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-xs" />
          <div className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4 z-10 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-base text-foreground flex items-center space-x-2">
                <Wrench className="w-4 h-4 text-amber-500" />
                <span>Schedule Maintenance: {selectedBus.id}</span>
              </h3>
              <button onClick={() => setIsMaintenanceModalOpen(false)} className="text-muted-foreground hover:text-foreground cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleMaintenanceSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-muted-foreground font-mono uppercase mb-1">Maintenance Type</label>
                <select
                  value={maintenanceType}
                  onChange={(e) => setMaintenanceType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-muted/40 border border-input text-foreground outline-none focus:border-primary"
                >
                  <option value="PREVENTIVE_INSPECTION">Preventive Bi-Weekly Inspection</option>
                  <option value="BRAKE_SYSTEM_OVERHAUL">Brake & Pneumatics Overhaul</option>
                  <option value="BATTERY_DIAGNOSTICS">EV Battery & High-Voltage Check</option>
                  <option value="EMERGENCY_REPAIR">Emergency Mechanical Repair</option>
                </select>
              </div>

              <div>
                <label className="block text-muted-foreground font-mono uppercase mb-1">Scheduled Workshop Date</label>
                <input
                  type="date"
                  required
                  value={maintenanceDate}
                  onChange={(e) => setMaintenanceDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-muted/40 border border-input text-foreground outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-muted-foreground font-mono uppercase mb-1">Workshop Notes</label>
                <textarea
                  value={maintenanceNotes}
                  onChange={(e) => setMaintenanceNotes(e.target.value)}
                  placeholder="Notes for depot technician..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-muted/40 border border-input text-foreground outline-none focus:border-primary"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsMaintenanceModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-600 text-white font-bold hover:bg-amber-500 shadow-xs cursor-pointer"
                >
                  Confirm Maintenance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Route Modal */}
      {isAssignRouteModalOpen && selectedBus && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div onClick={() => setIsAssignRouteModalOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-xs" />
          <div className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4 z-10 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-base text-foreground flex items-center space-x-2">
                <RouteIcon className="w-4 h-4 text-primary" />
                <span>Assign Route: {selectedBus.id}</span>
              </h3>
              <button onClick={() => setIsAssignRouteModalOpen(false)} className="text-muted-foreground hover:text-foreground cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRouteAssignSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-muted-foreground font-mono uppercase mb-1">Select Corridor Route</label>
                <select
                  value={selectedRouteToAssign}
                  onChange={(e) => setSelectedRouteToAssign(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-muted/40 border border-input text-foreground outline-none focus:border-primary"
                >
                  {routes.map(r => (
                    <option key={r.id} value={r.id}>{r.code || r.id} - {r.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsAssignRouteModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 shadow-xs cursor-pointer"
                >
                  Assign to Corridor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Vehicle Modal */}
      {isDeleteConfirmOpen && selectedBus && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div onClick={() => setIsDeleteConfirmOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-xs" />
          <div className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4 z-10 animate-in zoom-in-95">
            <div className="flex items-center space-x-2.5 text-rose-600">
              <AlertCircle className="w-5 h-5" />
              <h3 className="font-bold text-base">Retire Vehicle Asset?</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to retire vehicle <strong>{selectedBus.id}</strong> ({selectedBus.busNumber})? This will cancel any assigned trips on the Gantt timeline and notify the operations dispatcher.
            </p>
            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-border">
              <button
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="px-3.5 py-2 rounded-xl bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteBus}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-500 shadow-xs cursor-pointer"
              >
                Confirm Decommission
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
