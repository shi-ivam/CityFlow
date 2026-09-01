import React, { useState } from 'react';
import { AlertOctagon, Plus, CheckCircle2, Clock, AlertTriangle, Search, X } from 'lucide-react';

export default function VehicleIncidentsCenter({ busFleet = [], onOpenVehicleDrawer }) {
  const [incidents, setIncidents] = useState([
    {
      id: 'INC-2026-042',
      vehicleId: 'bus-101',
      busNumber: 'DL 1PC 4821',
      route: '534',
      type: 'Air Conditioning Compressor Low Pressure',
      severity: 'MEDIUM',
      reportedAt: 'Today, 08:30 AM',
      reportedBy: 'Rajesh Kumar (Driver)',
      status: 'IN_PROGRESS',
      location: 'Ring Road near AIIMS'
    },
    {
      id: 'INC-2026-039',
      vehicleId: 'bus-201',
      busNumber: 'MH 12 KT 7421',
      route: '721',
      type: 'Pneumatic Door Sensor Delay (Rear)',
      severity: 'LOW',
      reportedAt: 'Yesterday, 17:15 PM',
      reportedBy: 'Station Supervisor',
      status: 'RESOLVED',
      location: 'Rohini Sector 14 Terminal'
    }
  ]);

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    vehicleId: busFleet[0]?.id || 'bus-101',
    type: 'Brake System Telemetry Warning',
    severity: 'HIGH',
    location: 'Kashmere Gate ISBT Bay 4',
    description: 'Driver reported intermittent air pressure drop during regenerative braking.'
  });

  const handleCreateIncident = (e) => {
    e.preventDefault();
    const vehicle = busFleet.find(b => b.id === formData.vehicleId);
    const newInc = {
      id: `INC-2026-${Math.floor(100 + Math.random() * 900)}`,
      vehicleId: formData.vehicleId,
      busNumber: vehicle?.busNumber || 'DL 1PC 9901',
      route: vehicle?.assignedRoute || 'Unassigned',
      type: formData.type,
      severity: formData.severity,
      reportedAt: 'Just now',
      reportedBy: 'Control Room Dispatch',
      status: 'OPEN',
      location: formData.location
    };
    setIncidents([newInc, ...incidents]);
    setIsReportModalOpen(false);
  };

  const handleUpdateStatus = (id, newStatus) => {
    setIncidents(prev => prev.map(inc => inc.id === id ? { ...inc, status: newStatus } : inc));
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header & New Incident Action */}
      <div className="bg-card p-4 rounded-lg border border-border flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs font-mono text-xs">
        <div>
          <h3 className="text-sm font-bold text-foreground uppercase flex items-center space-x-2">
            <AlertOctagon className="w-4 h-4 text-rose-500" />
            <span>Operational Incident &amp; Defect Log</span>
          </h3>
          <p className="text-muted-foreground font-sans text-xs mt-0.5">
            Log driver defect cards, breakdown dispatches, and mechanical faults.
          </p>
        </div>

        <button
          onClick={() => setIsReportModalOpen(true)}
          className="px-3.5 py-1.5 rounded bg-rose-600 text-white font-bold hover:opacity-90 transition flex items-center space-x-1.5 cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Report Fleet Defect / Fault</span>
        </button>
      </div>

      {/* Incidents Table */}
      <div className="bg-card border border-border rounded-lg shadow-xs overflow-hidden font-mono text-xs">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-muted/50 border-b border-border text-muted-foreground uppercase text-[11px] font-semibold">
              <th className="p-3">Incident ID</th>
              <th className="p-3">Vehicle</th>
              <th className="p-3">Defect / Fault Description</th>
              <th className="p-3">Severity</th>
              <th className="p-3">Location</th>
              <th className="p-3">Reported By</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 font-sans">
            {incidents.map(inc => (
              <tr key={inc.id} className="hover:bg-muted/30 transition">
                <td className="p-3 font-mono font-bold text-primary">{inc.id}</td>
                <td className="p-3 font-mono font-bold text-foreground">{inc.busNumber}</td>
                <td className="p-3 font-bold text-foreground">{inc.type}</td>
                <td className="p-3 font-mono">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    inc.severity === 'HIGH' ? 'bg-rose-500/15 text-rose-600 border border-rose-500/30' :
                    inc.severity === 'MEDIUM' ? 'bg-amber-500/15 text-amber-600 border border-amber-500/30' :
                    'bg-muted text-muted-foreground border border-border'
                  }`}>
                    {inc.severity}
                  </span>
                </td>
                <td className="p-3 text-muted-foreground text-xs">{inc.location}</td>
                <td className="p-3 text-foreground text-xs">{inc.reportedBy}</td>
                <td className="p-3 font-mono">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    inc.status === 'RESOLVED' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30' :
                    'bg-blue-500/10 text-blue-600 border border-blue-500/30'
                  }`}>
                    {inc.status}
                  </span>
                </td>
                <td className="p-3 text-right font-mono">
                  {inc.status !== 'RESOLVED' ? (
                    <button
                      onClick={() => handleUpdateStatus(inc.id, 'RESOLVED')}
                      className="px-2.5 py-1 rounded bg-emerald-600 text-white text-[11px] font-bold hover:opacity-90 transition cursor-pointer"
                    >
                      Resolve
                    </button>
                  ) : (
                    <span className="text-emerald-600 font-bold text-xs">✓ Closed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Report Defect Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border-2 border-primary/50 rounded-xl max-w-md w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 font-mono text-xs">
            <div className="p-4 border-b border-border bg-muted/20 flex items-center justify-between">
              <div className="font-bold text-foreground flex items-center space-x-2">
                <AlertOctagon className="w-4 h-4 text-rose-500" />
                <span>Log Vehicle Defect / Fault</span>
              </div>
              <button onClick={() => setIsReportModalOpen(false)} className="p-1 rounded text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateIncident} className="p-5 space-y-4 font-sans text-xs">
              <div>
                <label className="block text-[10px] font-mono text-muted-foreground uppercase mb-1 font-bold">Target Vehicle</label>
                <select
                  value={formData.vehicleId}
                  onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                  className="w-full p-2 rounded bg-muted/40 border border-input text-foreground font-mono outline-none"
                >
                  {busFleet.map(b => (
                    <option key={b.id} value={b.id}>{b.busNumber} ({b.id})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-muted-foreground uppercase mb-1 font-bold">Defect Classification</label>
                <input
                  type="text"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full p-2 rounded bg-muted/40 border border-input text-foreground outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-muted-foreground uppercase mb-1 font-bold">Severity Level</label>
                <select
                  value={formData.severity}
                  onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                  className="w-full p-2 rounded bg-muted/40 border border-input text-foreground font-mono outline-none font-bold"
                >
                  <option value="CRITICAL">Critical (Immediate Grounding)</option>
                  <option value="HIGH">High Priority</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low (Minor Non-Critical)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-muted-foreground uppercase mb-1 font-bold">Location / Terminal</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full p-2 rounded bg-muted/40 border border-input text-foreground outline-none"
                />
              </div>

              <div className="pt-3 border-t border-border flex justify-end space-x-2 font-mono">
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="px-3 py-1.5 rounded bg-muted hover:bg-muted/80 text-foreground cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-rose-600 text-white font-bold hover:opacity-90 cursor-pointer"
                >
                  Submit Defect Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
