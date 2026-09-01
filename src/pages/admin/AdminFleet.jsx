import React, { useState } from 'react';
import { Bus, Search, Filter, CheckCircle2, AlertCircle, Wrench, Shield, Plus, X, Trash2, Power, BatteryCharging } from 'lucide-react';
import { db } from '../../db/transitDb.js';

export default function AdminFleet({ 
  busFleet = [], 
  dutyAssignments = [], 
  routes = [],
  selectedCity = 'delhi',
  onUpdateBus
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [fleetList, setFleetList] = useState(busFleet);

  // Form State
  const [newBusNumber, setNewBusNumber] = useState('');
  const [newBusModel, setNewBusModel] = useState('Tata Starbus EV 12m Ultra');
  const [newBusType, setNewBusType] = useState('ELECTRIC');
  const [newBusCapacity, setNewBusCapacity] = useState(50);
  const [newBusDepot, setNewBusDepot] = useState('Kashmere Gate Depot #1');
  const [feedback, setFeedback] = useState('');

  // Keep synced
  React.useEffect(() => {
    setFleetList(db.getCollection(selectedCity, 'buses'));
  }, [selectedCity, busFleet]);

  const filteredBuses = fleetList.filter((bus) => {
    const matchesSearch = 
      bus.busNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bus.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bus.model?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || bus.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleToggleMaintenance = (bus) => {
    const newStatus = bus.status === 'MAINTENANCE' ? 'IN_SERVICE' : 'MAINTENANCE';
    const updated = db.update(selectedCity, 'buses', bus.id, {
      status: newStatus,
      lastServiceDate: new Date().toISOString().split('T')[0]
    }, 'Fleet Manager');

    setFleetList(db.getCollection(selectedCity, 'buses'));
    setFeedback(`✓ Bus ${bus.busNumber} status toggled to ${newStatus}`);
    setTimeout(() => setFeedback(''), 4000);
  };

  const handleDeleteBus = (busId, busNumber) => {
    if (!confirm(`Confirm decommissioning bus ${busNumber} from active municipal fleet?`)) return;
    db.remove(selectedCity, 'buses', busId, 'Fleet Manager');
    setFleetList(db.getCollection(selectedCity, 'buses'));
    setFeedback(`✓ Bus ${busNumber} decommissioned.`);
    setTimeout(() => setFeedback(''), 4000);
  };

  const handleCreateBus = (e) => {
    e.preventDefault();
    if (!newBusNumber.trim()) {
      alert('Please enter a valid registration number');
      return;
    }

    const created = db.insert(selectedCity, 'buses', {
      busNumber: newBusNumber.trim().toUpperCase(),
      registrationNumber: newBusNumber.trim().toUpperCase(),
      model: newBusModel,
      type: newBusType,
      capacity: Number(newBusCapacity),
      batteryPct: newBusType === 'ELECTRIC' ? 100 : 100,
      status: 'IN_SERVICE',
      depot: newBusDepot,
      odometerKm: 0,
      lastServiceDate: new Date().toISOString().split('T')[0],
      nextServiceDue: '2026-10-01',
      city: selectedCity
    }, 'Fleet Manager');

    setFleetList(db.getCollection(selectedCity, 'buses'));
    setIsAddModalOpen(false);
    setNewBusNumber('');
    setFeedback(`✓ Successfully commissioned new vehicle: ${created.busNumber}`);
    setTimeout(() => setFeedback(''), 4000);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'IN_SERVICE':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
            In Service
          </span>
        );
      case 'MAINTENANCE':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30">
            <Wrench className="w-3 h-3 mr-1 text-rose-500" />
            Maintenance
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium bg-muted text-muted-foreground border border-border">
            Standby Depot
          </span>
        );
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto font-sans select-none">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-muted-foreground uppercase">
            <Bus className="w-3.5 h-3.5 text-primary" />
            <span>Asset Operations</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight mt-1">
            Bus Fleet Asset Management
          </h1>
          <p className="text-xs text-muted-foreground">
            Vehicle commission records, battery telemetry, seating capacities, and workshop service logs.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-mono text-xs font-bold shadow-xs flex items-center space-x-1.5 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Commission New Bus</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-mono text-xs flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card p-3 rounded-lg border border-border shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search bus registration or model..."
            className="w-full pl-9 pr-3 py-1.5 rounded-md bg-muted/50 border border-input text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary font-sans"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground font-mono">Status:</span>
          {['ALL', 'IN_SERVICE', 'STANDBY_READY', 'MAINTENANCE'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition-all ${
                statusFilter === st
                  ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                  : 'bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Fleet Data Table */}
      <div className="bg-card border border-border rounded-lg shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs font-sans">
            <thead>
              <tr className="bg-muted/60 border-b border-border text-muted-foreground font-mono uppercase text-[11px] font-semibold tracking-wider">
                <th className="p-3">Vehicle Number & Model</th>
                <th className="p-3">Powertrain & Battery</th>
                <th className="p-3 text-center">Capacity</th>
                <th className="p-3">Home Depot</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 font-mono">
              {filteredBuses.map((bus) => (
                <tr key={bus.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-3">
                    <div className="font-bold text-foreground text-sm font-sans">{bus.busNumber}</div>
                    <div className="text-[10px] text-muted-foreground">{bus.model} • ID: {bus.id}</div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center space-x-2">
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                        bus.type === 'ELECTRIC' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-blue-500/10 text-blue-600'
                      }`}>
                        {bus.type}
                      </span>
                      <span className="text-xs text-foreground font-bold">{bus.batteryPct || 100}% SoC</span>
                    </div>
                  </td>
                  <td className="p-3 text-center font-bold text-foreground">
                    {bus.capacity} Seats
                  </td>
                  <td className="p-3 text-muted-foreground text-xs font-sans">
                    {bus.depot || 'Central Terminal Depot'}
                  </td>
                  <td className="p-3">
                    {getStatusBadge(bus.status)}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleToggleMaintenance(bus)}
                        title={bus.status === 'MAINTENANCE' ? 'Clear Maintenance & Return to Service' : 'Flag Workshop Maintenance'}
                        className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                      >
                        <Wrench className={`w-3.5 h-3.5 ${bus.status === 'MAINTENANCE' ? 'text-rose-500' : ''}`} />
                      </button>
                      <button
                        onClick={() => handleDeleteBus(bus.id, bus.busNumber)}
                        title="Decommission Bus"
                        className="p-1.5 rounded hover:bg-rose-500/10 text-muted-foreground hover:text-rose-600 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredBuses.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground font-sans">
                    No fleet vehicles match the search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Commission Bus Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 font-mono text-xs">
          <div className="bg-card border border-border rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="font-bold text-foreground text-sm font-sans">Commission New Bus Asset</span>
              <button onClick={() => setIsAddModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateBus} className="space-y-4">
              <div>
                <label className="block text-muted-foreground font-bold uppercase mb-1">
                  Registration Number (Plate)
                </label>
                <input
                  type="text"
                  required
                  value={newBusNumber}
                  onChange={(e) => setNewBusNumber(e.target.value)}
                  placeholder="e.g. DL 1PC 4950"
                  className="w-full p-2 rounded bg-muted/50 border border-input text-foreground font-sans text-xs outline-none focus:border-primary uppercase"
                />
              </div>

              <div>
                <label className="block text-muted-foreground font-bold uppercase mb-1">
                  Vehicle Model
                </label>
                <select
                  value={newBusModel}
                  onChange={(e) => setNewBusModel(e.target.value)}
                  className="w-full p-2 rounded bg-muted/50 border border-input text-foreground font-sans text-xs outline-none focus:border-primary"
                >
                  <option value="Tata Starbus EV 12m Ultra">Tata Starbus EV 12m Ultra</option>
                  <option value="Ashok Leyland Circuit-F Electric">Ashok Leyland Circuit-F Electric</option>
                  <option value="Olectra K9 Pure Electric AC">Olectra K9 Pure Electric AC</option>
                  <option value="DTC Low-Floor Green CNG 12m">DTC Low-Floor Green CNG 12m</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted-foreground font-bold uppercase mb-1">
                    Powertrain
                  </label>
                  <select
                    value={newBusType}
                    onChange={(e) => setNewBusType(e.target.value)}
                    className="w-full p-2 rounded bg-muted/50 border border-input text-foreground font-sans text-xs outline-none focus:border-primary"
                  >
                    <option value="ELECTRIC">ELECTRIC</option>
                    <option value="CNG">CNG</option>
                  </select>
                </div>
                <div>
                  <label className="block text-muted-foreground font-bold uppercase mb-1">
                    Seats Capacity
                  </label>
                  <input
                    type="number"
                    min="30"
                    max="75"
                    value={newBusCapacity}
                    onChange={(e) => setNewBusCapacity(e.target.value)}
                    className="w-full p-2 rounded bg-muted/50 border border-input text-foreground font-sans text-xs outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-muted-foreground font-bold uppercase mb-1">
                  Assigned Home Depot
                </label>
                <select
                  value={newBusDepot}
                  onChange={(e) => setNewBusDepot(e.target.value)}
                  className="w-full p-2 rounded bg-muted/50 border border-input text-foreground font-sans text-xs outline-none focus:border-primary"
                >
                  <option value="Kashmere Gate Depot #1">Kashmere Gate Depot #1</option>
                  <option value="BBM Central Workshop Depot #3">BBM Central Workshop Depot #3</option>
                  <option value="Anand Vihar East Terminal Depot">Anand Vihar East Terminal Depot</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded bg-muted hover:bg-muted/80 text-foreground font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-xs"
                >
                  Commission Bus
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

