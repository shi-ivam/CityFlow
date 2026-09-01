import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, Info, Check, ExternalLink, Search, CheckCircle2 } from 'lucide-react';
import { calculateDocumentCompliance } from '../../../services/vehicleService';

export default function VehicleAlertsCenter({ busFleet = [], onOpenVehicleDrawer }) {
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Dynamically generate alerts from fleet data
  const initialAlerts = [];

  busFleet.forEach(bus => {
    // Battery alert
    if ((bus.batteryPct || 100) <= 20) {
      initialAlerts.push({
        id: `alt-bat-${bus.id}`,
        vehicleId: bus.id,
        busNumber: bus.busNumber,
        severity: 'CRITICAL',
        title: `Critical Battery Depletion (${bus.batteryPct}%)`,
        description: `Asset ${bus.busNumber} has reached low battery threshold. Immediate depot return & DC fast charging required.`,
        timestamp: '8 mins ago',
        status: 'ACTIVE'
      });
    }

    // Maintenance alert
    if (bus.status === 'MAINTENANCE') {
      initialAlerts.push({
        id: `alt-maint-${bus.id}`,
        vehicleId: bus.id,
        busNumber: bus.busNumber,
        severity: 'HIGH',
        title: `Vehicle Grounded in Workshop Bay`,
        description: `Undergoing scheduled periodic inspection & brake system diagnostic.`,
        timestamp: '24 mins ago',
        status: 'ACTIVE'
      });
    }

    // Compliance alert
    if (bus.compliance) {
      Object.entries(bus.compliance).forEach(([docKey, dateStr]) => {
        const comp = calculateDocumentCompliance(dateStr);
        if (comp.status === 'EXPIRED') {
          initialAlerts.push({
            id: `alt-comp-${bus.id}-${docKey}`,
            vehicleId: bus.id,
            busNumber: bus.busNumber,
            severity: 'CRITICAL',
            title: `Expired Compliance Certificate (${docKey})`,
            description: `${docKey.toUpperCase()} expired on ${dateStr}. Vehicle legally prohibited from commercial passenger service.`,
            timestamp: '1 hour ago',
            status: 'ACTIVE'
          });
        } else if (comp.status === 'EXPIRING_SOON') {
          initialAlerts.push({
            id: `alt-comp-${bus.id}-${docKey}`,
            vehicleId: bus.id,
            busNumber: bus.busNumber,
            severity: 'WARNING',
            title: `Compliance Renewal Imminent (${docKey})`,
            description: `${docKey.toUpperCase()} expires in ${comp.daysRemaining} days (${dateStr}). Renewal notice queued.`,
            timestamp: '3 hours ago',
            status: 'ACTIVE'
          });
        }
      });
    }
  });

  const [alerts, setAlerts] = useState(initialAlerts);

  const handleResolveAlert = (alertId) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'RESOLVED' } : a));
  };

  const filteredAlerts = alerts.filter(a => {
    const matchesSev = filterSeverity === 'ALL' || a.severity === filterSeverity;
    const matchesSearch = 
      a.busNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSev && matchesSearch;
  });

  const activeCount = alerts.filter(a => a.status === 'ACTIVE').length;
  const criticalCount = alerts.filter(a => a.severity === 'CRITICAL' && a.status === 'ACTIVE').length;

  return (
    <div className="space-y-6 font-sans">
      
      {/* Alert KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
        <div className="p-4 bg-card border border-border rounded-lg shadow-xs">
          <div className="text-[10px] text-muted-foreground uppercase font-bold">TOTAL OPERATIONAL ALERTS</div>
          <div className="text-2xl font-bold text-foreground mt-1">{activeCount} Active</div>
          <div className="text-[11px] text-muted-foreground mt-1">Real-time telematics &amp; compliance feeds</div>
        </div>

        <div className="p-4 bg-card border border-border rounded-lg shadow-xs">
          <div className="text-[10px] text-muted-foreground uppercase font-bold">CRITICAL DISPATCH BLOCKS</div>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">{criticalCount}</div>
          <div className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">Requires immediate supervisor attention</div>
        </div>

        <div className="p-4 bg-card border border-border rounded-lg shadow-xs">
          <div className="text-[10px] text-muted-foreground uppercase font-bold">RESOLVED TODAY</div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {alerts.filter(a => a.status === 'RESOLVED').length}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">Audit signed off</div>
        </div>
      </div>

      {/* Search & Filter Header */}
      <div className="bg-card p-3 rounded-lg border border-border flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs font-mono text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search alerts by vehicle, issue, severity..."
            className="w-full pl-9 pr-3 py-1.5 rounded-md bg-muted/40 border border-input text-foreground outline-none font-sans"
          />
        </div>

        <div className="flex items-center space-x-1">
          {['ALL', 'CRITICAL', 'HIGH', 'WARNING'].map(sev => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-2.5 py-1 rounded text-xs transition cursor-pointer ${
                filterSeverity === sev 
                  ? 'bg-primary text-primary-foreground font-bold shadow-xs' 
                  : 'bg-muted/40 text-muted-foreground hover:bg-muted'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-3 font-mono text-xs">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map(alt => {
            const isResolved = alt.status === 'RESOLVED';
            const isCritical = alt.severity === 'CRITICAL';
            const bus = busFleet.find(b => b.id === alt.vehicleId);

            return (
              <div 
                key={alt.id} 
                className={`p-4 bg-card border rounded-lg space-y-2 shadow-xs transition ${
                  isResolved ? 'opacity-60 border-border' :
                  isCritical ? 'border-rose-500/40 bg-rose-500/5' : 'border-border'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      isCritical ? 'bg-rose-500 text-white' :
                      alt.severity === 'HIGH' ? 'bg-orange-500 text-white' :
                      'bg-amber-500 text-white'
                    }`}>
                      {alt.severity}
                    </span>
                    <span className="font-bold text-foreground text-sm font-sans">{alt.title}</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="font-bold text-primary">{alt.busNumber}</span>
                  </div>

                  <span className="text-[11px] text-muted-foreground">{alt.timestamp}</span>
                </div>

                <p className="text-xs text-muted-foreground font-sans">{alt.description}</p>

                <div className="pt-2 border-t border-border/60 flex items-center justify-between">
                  <button
                    onClick={() => bus && onOpenVehicleDrawer && onOpenVehicleDrawer(bus)}
                    className="text-primary hover:underline text-xs flex items-center space-x-1 cursor-pointer font-sans"
                  >
                    <span>Inspect Vehicle Asset ({alt.vehicleId})</span>
                    <ExternalLink className="w-3.5 h-3.5 inline" />
                  </button>

                  {!isResolved ? (
                    <button
                      onClick={() => handleResolveAlert(alt.id)}
                      className="px-3 py-1 rounded bg-emerald-600 text-white font-bold hover:opacity-90 transition flex items-center space-x-1 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Acknowledge &amp; Resolve</span>
                    </button>
                  ) : (
                    <span className="text-emerald-600 font-bold flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Resolved</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center text-muted-foreground bg-card border border-border rounded-lg">
            No operational alerts matching active filters.
          </div>
        )}
      </div>

    </div>
  );
}
