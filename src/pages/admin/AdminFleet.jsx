import React, { useState } from 'react';
import { Bus, Search, Filter, CheckCircle2, AlertCircle, Wrench, Shield, ArrowUpDown } from 'lucide-react';

export default function AdminFleet({ busFleet = [], dutyAssignments = [], routes = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredBuses = busFleet.filter((bus) => {
    const matchesSearch = 
      bus.busNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bus.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bus.model?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || bus.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'IN_SERVICE':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono font-medium bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
            In Service
          </span>
        );
      case 'MAINTENANCE':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono font-medium bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30">
            <Wrench className="w-3 h-3 mr-1 text-rose-500" />
            Maintenance
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono font-medium bg-muted text-muted-foreground border border-border">
            Depot Standby
          </span>
        );
    }
  };

  const getAssignedRoute = (busId) => {
    const duty = dutyAssignments.find(d => d.busId === busId);
    if (!duty) return null;
    return routes.find(r => r.id === duty.routeId);
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-muted-foreground uppercase">
            <Bus className="w-3.5 h-3.5 text-primary" />
            <span>Asset Management</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight mt-1">
            Bus Fleet Operations
          </h1>
          <p className="text-xs text-muted-foreground">
            Vehicle telemetry, seating capacity, maintenance status, and route pairings.
          </p>
        </div>

        {/* Quick Metrics */}
        <div className="flex items-center space-x-3 font-mono text-xs">
          <div className="px-3 py-1.5 rounded-md bg-card border border-border">
            <span className="text-muted-foreground">Total Fleet: </span>
            <strong className="text-foreground">{busFleet.length}</strong>
          </div>
          <div className="px-3 py-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300">
            <span>Active: </span>
            <strong className="font-bold">{busFleet.filter(b => b.status === 'IN_SERVICE').length}</strong>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card p-3 rounded-lg border border-border shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search bus number, asset ID..."
            className="w-full pl-9 pr-3 py-1.5 rounded-md bg-muted/50 border border-input text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary font-sans"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground font-mono">Status:</span>
          {['ALL', 'IN_SERVICE', 'AVAILABLE', 'MAINTENANCE'].map((st) => (
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
                <th className="p-3">Bus Asset ID</th>
                <th className="p-3">Vehicle Number</th>
                <th className="p-3 text-center">Seating Capacity</th>
                <th className="p-3">Assigned Route</th>
                <th className="p-3">Telemetry Health</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredBuses.map((bus) => {
                const assignedRoute = getAssignedRoute(bus.id);
                return (
                  <tr key={bus.id} className="hover:bg-accent/50 transition-colors">
                    <td className="p-3 font-mono font-bold text-foreground">
                      {bus.id}
                    </td>
                    <td className="p-3 font-mono text-foreground font-medium">
                      {bus.busNumber}
                    </td>
                    <td className="p-3 font-mono text-center font-semibold text-foreground">
                      {bus.capacity} Seats
                    </td>
                    <td className="p-3">
                      {assignedRoute ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 font-mono text-[11px] font-semibold">
                          Route {assignedRoute.code} ({assignedRoute.name})
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs font-mono italic">
                          Unassigned (Depot)
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-mono text-[11px] text-muted-foreground">
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span>GPS Live • Fuel 92%</span>
                      </div>
                    </td>
                    <td className="p-3">
                      {getStatusBadge(bus.status)}
                    </td>
                  </tr>
                );
              })}

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

    </div>
  );
}
