import React, { useState } from 'react';
import { 
  Wrench, 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Search, 
  Filter,
  Check
} from 'lucide-react';

export default function VehicleMaintenanceQueue({
  busFleet = [],
  onScheduleMaintenance,
  onResolveMaintenance
}) {
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Sample work orders generated from fleet data
  const [workOrders, setWorkOrders] = useState([
    {
      id: 'WO-2026-081',
      vehicleId: 'bus-101',
      busNumber: 'DL 1PC 4821',
      issue: 'Periodic 10,000 km Brake & Regen Calibration',
      priority: 'MEDIUM',
      workshop: 'Kashmere Gate Workshop Bay 2',
      technician: 'Devendra S.',
      estCompletion: '2026-09-08',
      cost: '₹4,200',
      status: 'SCHEDULED'
    },
    {
      id: 'WO-2026-079',
      vehicleId: 'bus-201',
      busNumber: 'MH 12 KT 7421',
      issue: 'Articulation Turntable Hydraulic Fluid Top-up',
      priority: 'HIGH',
      workshop: 'Anand Vihar Heavy Bay 1',
      technician: 'M. Irfan',
      estCompletion: '2026-09-12',
      cost: '₹8,400',
      status: 'IN_PROGRESS'
    },
    {
      id: 'WO-2026-074',
      vehicleId: 'bus-302',
      busNumber: 'DL 1CD 5298',
      issue: 'Upper Deck Suspension Damper Sensor Calibration',
      priority: 'LOW',
      workshop: 'Kashmere Gate Bay 4',
      technician: 'D. Saini',
      estCompletion: '2026-09-20',
      cost: '₹7,200',
      status: 'SCHEDULED'
    }
  ]);

  const filteredOrders = workOrders.filter(wo => {
    const matchesSearch = 
      wo.busNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wo.issue.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wo.technician.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = priorityFilter === 'ALL' || wo.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'CRITICAL':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
            CRITICAL
          </span>
        );
      case 'HIGH':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/30">
            HIGH
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
            MEDIUM
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-muted text-muted-foreground border border-border">
            LOW
          </span>
        );
    }
  };

  const handleCompleteOrder = (orderId) => {
    setWorkOrders(prev => prev.map(wo => {
      if (wo.id === orderId) {
        return { ...wo, status: 'COMPLETED' };
      }
      return wo;
    }));
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Maintenance KPI Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 font-mono">
        <div className="p-4 bg-card border border-border rounded-lg shadow-xs">
          <div className="text-[10px] text-muted-foreground uppercase font-bold">ACTIVE WORK ORDERS</div>
          <div className="text-2xl font-bold text-foreground mt-1">{workOrders.filter(w => w.status !== 'COMPLETED').length}</div>
          <div className="text-[11px] text-muted-foreground mt-1">Under service &amp; inspection</div>
        </div>

        <div className="p-4 bg-card border border-border rounded-lg shadow-xs">
          <div className="text-[10px] text-muted-foreground uppercase font-bold">CRITICAL ISSUES</div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {workOrders.filter(w => w.priority === 'CRITICAL' && w.status !== 'COMPLETED').length}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">0 grounding defects</div>
        </div>

        <div className="p-4 bg-card border border-border rounded-lg shadow-xs">
          <div className="text-[10px] text-muted-foreground uppercase font-bold">WORKSHOPS ENGAGED</div>
          <div className="text-2xl font-bold text-foreground mt-1">3 Bays</div>
          <div className="text-[11px] text-muted-foreground mt-1">Kashmere Gate &amp; Anand Vihar</div>
        </div>

        <div className="p-4 bg-card border border-border rounded-lg shadow-xs">
          <div className="text-[10px] text-muted-foreground uppercase font-bold">INSPECTION COMPLIANCE</div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">100%</div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">All certificates current</div>
        </div>
      </div>

      {/* Action Header & Search */}
      <div className="bg-card p-3 rounded-lg border border-border flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs font-mono text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search work order, bus registration, technician..."
            className="w-full pl-9 pr-3 py-1.5 rounded-md bg-muted/40 border border-input text-foreground outline-none font-sans"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-muted-foreground text-[11px]">Priority:</span>
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(p => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              className={`px-2 py-1 rounded text-xs transition cursor-pointer ${
                priorityFilter === p
                  ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                  : 'bg-muted/40 text-muted-foreground hover:bg-muted'
              }`}
            >
              {p}
            </button>
          ))}

          <button
            onClick={() => onScheduleMaintenance && onScheduleMaintenance(busFleet[0])}
            className="px-3 py-1.5 rounded bg-rose-600 text-white font-bold hover:opacity-90 transition flex items-center space-x-1.5 cursor-pointer ml-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Schedule Service</span>
          </button>
        </div>
      </div>

      {/* Work Orders Table */}
      <div className="bg-card border border-border rounded-lg shadow-xs overflow-hidden font-sans">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="bg-muted/50 border-b border-border text-muted-foreground font-mono uppercase text-[11px] font-semibold">
              <th className="p-3">Work Order</th>
              <th className="p-3">Vehicle</th>
              <th className="p-3">Issue / Description</th>
              <th className="p-3">Priority</th>
              <th className="p-3">Workshop Bay</th>
              <th className="p-3">Lead Tech</th>
              <th className="p-3">Est. Completion</th>
              <th className="p-3">Cost</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 font-mono">
            {filteredOrders.map(wo => (
              <tr key={wo.id} className="hover:bg-muted/30 transition">
                <td className="p-3 font-bold text-primary">{wo.id}</td>
                <td className="p-3 font-bold text-foreground">{wo.busNumber}</td>
                <td className="p-3 font-sans text-foreground">{wo.issue}</td>
                <td className="p-3">{getPriorityBadge(wo.priority)}</td>
                <td className="p-3 text-muted-foreground text-[11px]">{wo.workshop}</td>
                <td className="p-3 text-foreground">{wo.technician}</td>
                <td className="p-3 text-muted-foreground">{wo.estCompletion}</td>
                <td className="p-3 font-bold text-foreground">{wo.cost}</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    wo.status === 'COMPLETED'
                      ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30'
                      : 'bg-amber-500/10 text-amber-600 border border-amber-500/30'
                  }`}>
                    {wo.status}
                  </span>
                </td>
                <td className="p-3 text-right">
                  {wo.status !== 'COMPLETED' ? (
                    <button
                      onClick={() => handleCompleteOrder(wo.id)}
                      className="px-2 py-1 rounded bg-emerald-600 text-white text-[11px] font-bold hover:opacity-90 transition flex items-center space-x-1 ml-auto cursor-pointer"
                    >
                      <Check className="w-3 h-3" />
                      <span>Complete</span>
                    </button>
                  ) : (
                    <span className="text-emerald-600 text-[11px] font-bold">✓ Closed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
