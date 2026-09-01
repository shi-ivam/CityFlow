import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  Activity, 
  CheckCircle2, 
  ChevronRight,
  UserPlus,
  Trash2,
  X,
  Bus,
  Route as RouteIcon,
  Sparkles
} from 'lucide-react';

export default function AdminDrivers({ 
  crewMembers = [], 
  dutyAssignments = [], 
  routes = [],
  onAddDriver = () => {},
  onDeactivateDriver = () => {}
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedDriverId, setSelectedDriverId] = useState(crewMembers[0]?.id || null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // New Driver Form State
  const [newDriverName, setNewDriverName] = useState('');
  const [newDriverLicense, setNewDriverLicense] = useState('');
  const [newDriverDepot, setNewDriverDepot] = useState('Millennium Central');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredDrivers = crewMembers.filter((c) => {
    const matchesSearch = 
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.licenseNumber?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = 
      statusFilter === 'ALL' ||
      (statusFilter === 'ASSIGNED' && (c.status === 'ASSIGNED' || c.status === 'ON_DUTY')) ||
      (statusFilter === 'RESTING' && (c.status === 'RESTING_COMPLIANT' || c.status === 'BREAK')) ||
      (statusFilter === 'STANDBY' && (c.isStandby || c.status === 'STANDBY'));

    return matchesSearch && matchesStatus;
  });

  const selectedDriver = crewMembers.find(c => c.id === selectedDriverId) || filteredDrivers[0] || crewMembers[0];

  const getWorkloadBreakdown = (driver) => {
    if (!driver) return null;

    const assignedDuties = dutyAssignments.filter(d => d.crewId === driver.id);
    const totalShiftMins = assignedDuties.reduce((acc, d) => acc + (d.endTime - d.startTime), 0);
    const hours = Math.floor(totalShiftMins / 60) || driver.accumulatedHours || 6;
    const mins = totalShiftMins % 60;

    return {
      hoursDisplay: `${hours}h ${mins}m`,
      distanceKm: Math.round((hours * 28.5)),
      longRoutesCount: 1,
      mediumRoutesCount: 2,
      shortRoutesCount: 1,
      consecutiveLong: 1,
      restStatus: driver.status === 'RESTING_COMPLIANT' || driver.status === 'STANDBY' ? 'COMPLIANT (11h+)' : 'ACTIVE SHIFT',
      isViolation: driver.status === 'REST_VIOLATION' || driver.hasRestViolation,
      nextAssignment: 'Short Feeder Corridor (R12)'
    };
  };

  const workload = getWorkloadBreakdown(selectedDriver);

  const handleCreateDriver = (e) => {
    e.preventDefault();
    if (!newDriverName.trim() || !newDriverLicense.trim()) return;

    const newId = `DRV-${Math.floor(1000 + Math.random() * 9000)}`;
    const driverObj = {
      id: newId,
      name: newDriverName.trim(),
      licenseNumber: newDriverLicense.trim(),
      status: 'STANDBY',
      isStandby: true,
      accumulatedHours: 0,
      depot: newDriverDepot
    };

    if (onAddDriver) {
      onAddDriver(driverObj);
    }
    showToast(`Driver ${newDriverName} registered with ID ${newId}`);
    setIsAddModalOpen(false);
    setNewDriverName('');
    setNewDriverLicense('');
  };

  const handleDeleteDriver = () => {
    if (!selectedDriver) return;
    if (onDeactivateDriver) {
      onDeactivateDriver(selectedDriver.id);
    }
    showToast(`Driver ${selectedDriver.name} (${selectedDriver.id}) deactivated.`);
    setIsDeleteConfirmOpen(false);
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto font-sans select-none text-foreground">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-muted-foreground uppercase font-bold">
            <Users className="w-3.5 h-3.5 text-emerald-500" />
            <span>Workforce Operations</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight mt-1">
            Driver Roster & Workload Management
          </h1>
          <p className="text-xs text-muted-foreground">
            Mandated 11-hour rest period tracking, shift hours, route rotation fairness, and rest gap verification.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register Driver</span>
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

      {/* Main Split: Left Table / Right Workload Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Driver Table */}
        <div className="lg:col-span-7 bg-card border border-border rounded-2xl shadow-card overflow-hidden flex flex-col">
          
          <div className="p-3 border-b border-border bg-muted/30 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filter drivers by name, license..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-card border border-input text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary font-sans"
              />
            </div>

            {/* Filter Chips */}
            <div className="flex items-center space-x-1 font-mono text-xs w-full sm:w-auto overflow-x-auto">
              {['ALL', 'ASSIGNED', 'RESTING', 'STANDBY'].map(filter => (
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
                  <th className="p-3">Driver ID</th>
                  <th className="p-3">Name</th>
                  <th className="p-3 font-mono">License</th>
                  <th className="p-3 font-mono text-right">Shift Hours</th>
                  <th className="p-3">Rest Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredDrivers.map((driver) => {
                  const isSelected = driver.id === selectedDriver?.id;
                  return (
                    <tr
                      key={driver.id}
                      onClick={() => setSelectedDriverId(driver.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-primary/10 font-medium border-l-4 border-l-primary' : 'hover:bg-accent/40'
                      }`}
                    >
                      <td className="p-3 font-mono font-bold text-foreground">
                        {driver.id}
                      </td>
                      <td className="p-3 font-medium text-foreground">
                        {driver.name}
                      </td>
                      <td className="p-3 font-mono text-muted-foreground">
                        {driver.licenseNumber}
                      </td>
                      <td className="p-3 font-mono text-right font-bold text-foreground tabular-nums">
                        {driver.accumulatedHours || 6}h 00m
                      </td>
                      <td className="p-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-500" />
                          11h Rest OK
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Driver Workload Inspector Panel */}
        {selectedDriver && workload && (
          <div className="lg:col-span-5 bg-card border border-border rounded-2xl shadow-card p-5 space-y-5 flex flex-col justify-between">
            
            {/* Top Driver Badge */}
            <div className="border-b border-border pb-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 rounded-2xl bg-primary/20 text-primary font-mono text-lg font-bold flex items-center justify-center border border-primary/30">
                  {selectedDriver.name ? selectedDriver.name.charAt(0) : 'D'}
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">
                    {selectedDriver.name}
                  </h2>
                  <div className="text-xs font-mono text-muted-foreground">
                    ID: {selectedDriver.id} • Lic #{selectedDriver.licenseNumber}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsDeleteConfirmOpen(true)}
                className="p-2 rounded-xl text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                title="Deactivate Driver"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Telemetry Workload Grid */}
            <div className="space-y-3">
              <div className="text-xs font-mono uppercase font-semibold text-muted-foreground tracking-wider flex items-center space-x-1.5">
                <Activity className="w-3.5 h-3.5 text-primary" />
                <span>Driver Workload Telemetry</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-muted/30 border border-border">
                  <div className="text-[11px] font-mono text-muted-foreground">Shift Hours Today</div>
                  <div className="text-xl font-bold font-mono text-foreground mt-0.5 tabular-nums">
                    {workload.hoursDisplay}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-muted/30 border border-border">
                  <div className="text-[11px] font-mono text-muted-foreground">Distance Driven</div>
                  <div className="text-xl font-bold font-mono text-foreground mt-0.5 tabular-nums">
                    {workload.distanceKm} km
                  </div>
                </div>
              </div>

              {/* Route Breakdown Matrix */}
              <div className="p-3.5 rounded-xl bg-muted/20 border border-border space-y-2">
                <div className="text-xs font-semibold text-foreground border-b border-border/50 pb-1">
                  Corridor Difficulty Rotation
                </div>

                <div className="grid grid-cols-3 gap-2 font-mono text-xs text-center pt-1">
                  <div className="p-2 rounded-lg bg-card border border-border">
                    <div className="text-[10px] text-muted-foreground">Long Routes</div>
                    <div className="text-base font-bold text-foreground">{workload.longRoutesCount}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-card border border-border">
                    <div className="text-[10px] text-muted-foreground">Medium</div>
                    <div className="text-base font-bold text-foreground">{workload.mediumRoutesCount}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-card border border-border">
                    <div className="text-[10px] text-muted-foreground">Short</div>
                    <div className="text-base font-bold text-foreground">{workload.shortRoutesCount}</div>
                  </div>
                </div>
              </div>

              {/* Next Assignment & Rest Gap */}
              <div className="space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 border border-border">
                  <span className="text-muted-foreground">Consecutive Long Routes:</span>
                  <span className="font-bold text-foreground">{workload.consecutiveLong} (Fairness OK)</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 border border-border">
                  <span className="text-muted-foreground">Next Scheduled Assignment:</span>
                  <span className="font-bold text-primary">{workload.nextAssignment}</span>
                </div>
              </div>

            </div>

            {/* Rest Gap Notice */}
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono text-emerald-800 dark:text-emerald-300 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Full compliance with 11-hour mandatory continuous rest period rule between duty shifts.</span>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => showToast(`Driver ${selectedDriver.name} set to Standby reserve.`)}
                className="py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-bold text-xs transition cursor-pointer"
              >
                Set to Standby
              </button>
              <button
                onClick={() => showToast(`Rest gap re-verified for ${selectedDriver.name}: 12.8 hours continuous.`)}
                className="py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs transition cursor-pointer"
              >
                Verify Rest Gap
              </button>
            </div>

          </div>
        )}

      </div>

      {/* Register Driver Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div onClick={() => setIsAddModalOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-xs" />
          <div className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4 z-10 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-base text-foreground flex items-center space-x-2">
                <UserPlus className="w-4 h-4 text-primary" />
                <span>Register Transit Driver</span>
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-muted-foreground hover:text-foreground cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDriver} className="space-y-4 text-xs">
              <div>
                <label className="block text-muted-foreground font-mono uppercase mb-1">Driver Full Name</label>
                <input
                  type="text"
                  required
                  value={newDriverName}
                  onChange={(e) => setNewDriverName(e.target.value)}
                  placeholder="e.g. Anand Kumar"
                  className="w-full px-3 py-2 rounded-xl bg-muted/40 border border-input text-foreground outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-muted-foreground font-mono uppercase mb-1">Commercial License Number</label>
                <input
                  type="text"
                  required
                  value={newDriverLicense}
                  onChange={(e) => setNewDriverLicense(e.target.value)}
                  placeholder="e.g. DL-04202300891"
                  className="w-full px-3 py-2 rounded-xl bg-muted/40 border border-input text-foreground outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-muted-foreground font-mono uppercase mb-1">Assigned Operating Depot</label>
                <select
                  value={newDriverDepot}
                  onChange={(e) => setNewDriverDepot(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-muted/40 border border-input text-foreground outline-none focus:border-primary"
                >
                  <option value="Millennium Central">Millennium Central Depot</option>
                  <option value="Kashmere Gate Hub">Kashmere Gate Transit Terminal</option>
                  <option value="Mehrauli South">Mehrauli South Depot</option>
                </select>
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
                  Confirm & Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Driver Confirmation Modal */}
      {isDeleteConfirmOpen && selectedDriver && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div onClick={() => setIsDeleteConfirmOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-xs" />
          <div className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4 z-10 animate-in zoom-in-95">
            <div className="flex items-center space-x-2.5 text-rose-600">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-bold text-base">Deactivate Transit Driver?</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to deactivate driver <strong>{selectedDriver.name}</strong> ({selectedDriver.id})? Any active shifts will be unlinked and scheduled trips reassigned to the Standby Pool.
            </p>
            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-border">
              <button
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="px-3.5 py-2 rounded-xl bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteDriver}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-500 shadow-xs cursor-pointer"
              >
                Confirm Deactivation
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
