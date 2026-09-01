import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, ShieldCheck, AlertTriangle, Clock, Activity, CheckCircle2, Plus, X, Trash2, UserPlus, Phone } from 'lucide-react';
import { db } from '../../db/transitDb.js';

export default function AdminDrivers({ 
  crewMembers = [], 
  dutyAssignments = [], 
  routes = [],
  selectedCity = 'delhi',
  onUpdateDriver
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDriverId, setSelectedDriverId] = useState(crewMembers[0]?.id || null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [driverList, setDriverList] = useState(crewMembers);
  const [feedback, setFeedback] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [badgeNumber, setBadgeNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [experienceYears, setExperienceYears] = useState(5);
  const [isStandby, setIsStandby] = useState(true);

  useEffect(() => {
    const list = db.getCollection(selectedCity, 'drivers');
    setDriverList(list);
    if (!selectedDriverId && list.length > 0) {
      setSelectedDriverId(list[0].id);
    }
  }, [selectedCity, crewMembers]);

  const filteredDrivers = driverList.filter((c) => {
    return (
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.licenseNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const selectedDriver = driverList.find(c => c.id === selectedDriverId) || driverList[0];

  const handleCreateDriver = (e) => {
    e.preventDefault();
    if (!name.trim() || !licenseNumber.trim()) {
      alert('Please provide driver name and commercial driving license number');
      return;
    }

    const created = db.insert(selectedCity, 'drivers', {
      name: name.trim(),
      fullName: name.trim(),
      licenseNumber: licenseNumber.trim().toUpperCase(),
      badgeNumber: badgeNumber.trim().toUpperCase() || `DTC-B${Math.floor(3000 + Math.random() * 5000)}`,
      phone: phone || '+91 98100 22334',
      experienceYears: Number(experienceYears),
      accumulatedHours: 0,
      lastShiftEnd: new Date(Date.now() - 16 * 3600 * 1000).toISOString(),
      status: isStandby ? 'STANDBY_READY' : 'ASSIGNED',
      isStandby,
      complianceScore: 100,
      city: selectedCity
    }, 'HR Transit Lead');

    const updated = db.getCollection(selectedCity, 'drivers');
    setDriverList(updated);
    setSelectedDriverId(created.id);
    setIsAddModalOpen(false);
    setName('');
    setLicenseNumber('');
    setBadgeNumber('');
    setFeedback(`✓ Successfully registered driver: ${created.name} (${created.id})`);
    setTimeout(() => setFeedback(''), 4000);
  };

  const handleToggleStandby = (driver) => {
    const newStatus = driver.status === 'STANDBY_READY' ? 'ASSIGNED' : 'STANDBY_READY';
    db.update(selectedCity, 'drivers', driver.id, {
      status: newStatus,
      isStandby: newStatus === 'STANDBY_READY'
    }, 'Lead Dispatcher');

    setDriverList(db.getCollection(selectedCity, 'drivers'));
    setFeedback(`✓ Driver ${driver.name} status changed to ${newStatus}`);
    setTimeout(() => setFeedback(''), 4000);
  };

  const handleDeleteDriver = (driverId, driverName) => {
    if (!confirm(`Deactivate driver record for ${driverName} (${driverId})?`)) return;
    db.remove(selectedCity, 'drivers', driverId, 'HR Transit Lead');
    const updated = db.getCollection(selectedCity, 'drivers');
    setDriverList(updated);
    if (selectedDriverId === driverId) {
      setSelectedDriverId(updated[0]?.id || null);
    }
    setFeedback(`✓ Driver ${driverName} record deactivated.`);
    setTimeout(() => setFeedback(''), 4000);
  };

  const getWorkloadBreakdown = (driver) => {
    if (!driver) return null;
    const restH = driver.lastShiftEnd 
      ? ((Date.now() - new Date(driver.lastShiftEnd).getTime()) / (1000 * 3600))
      : 24;
    const isRestCompliant = restH >= 11;

    return {
      hoursDisplay: `${driver.accumulatedHours || 6}h 00m`,
      distanceKm: Math.round(((driver.accumulatedHours || 6) * 28.5)),
      longRoutesCount: 1,
      mediumRoutesCount: 1,
      shortRoutesCount: 0,
      restHours: restH.toFixed(1),
      isRestCompliant,
      nextAssignment: 'Corridor 534 (Kashmere Gate Express)'
    };
  };

  const workload = getWorkloadBreakdown(selectedDriver);

  return (
    <div className="p-6 lg:p-10 space-y-8 max-w-[1580px] mx-auto font-sans select-none">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-border/70 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-muted-foreground uppercase tracking-wider">
            <Users className="w-4 h-4 text-emerald-500" />
            <span>Workforce Management</span>
          </div>
          <h1 className="text-3xl font-semibold text-foreground tracking-tight mt-1">
            Driver Roster & Workload Operations
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Mandated 11-hour rest verification, cumulative duty tracking, route rotation, and personnel records.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-xs flex items-center space-x-2 transition-all active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          <span>Register New Driver</span>
        </button>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-mono text-xs flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Main Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Driver Table */}
        <div className="lg:col-span-7 bg-card border border-border rounded-lg shadow-card overflow-hidden flex flex-col">
          <div className="p-3 border-b border-border bg-muted/30 flex items-center justify-between">
            <div className="relative w-72">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filter drivers by name, ID, license..."
                className="w-full pl-9 pr-3 py-1.5 rounded-md bg-card border border-input text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary font-sans"
              />
            </div>
            <span className="text-xs font-mono text-muted-foreground">
              {filteredDrivers.length} Registered Drivers
            </span>
          </div>

          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full border-collapse text-left text-xs font-sans">
              <thead className="sticky top-0 bg-muted/80 backdrop-blur-xs z-10">
                <tr className="border-b border-border text-muted-foreground font-mono uppercase text-[11px] font-semibold tracking-wider">
                  <th className="p-3">Driver Name & ID</th>
                  <th className="p-3">License & Badge</th>
                  <th className="p-3 font-mono text-center">Status</th>
                  <th className="p-3 font-mono text-right">Duty Hours</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 font-mono">
                {filteredDrivers.map((driver) => {
                  const isSelected = driver.id === selectedDriverId;
                  const restH = driver.lastShiftEnd 
                    ? ((Date.now() - new Date(driver.lastShiftEnd).getTime()) / (1000 * 3600))
                    : 24;
                  const isCompliant = restH >= 11;

                  return (
                    <tr
                      key={driver.id}
                      onClick={() => setSelectedDriverId(driver.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-primary/10 border-l-4 border-l-primary' : 'hover:bg-muted/30'
                      }`}
                    >
                      <td className="p-3">
                        <div className="font-bold text-foreground text-sm font-sans">{driver.name || driver.fullName}</div>
                        <div className="text-[10px] text-muted-foreground">{driver.id}</div>
                      </td>
                      <td className="p-3">
                        <div className="text-foreground">{driver.licenseNumber}</div>
                        <div className="text-[10px] text-muted-foreground">{driver.badgeNumber}</div>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          driver.status === 'ASSIGNED' ? 'bg-emerald-500/15 text-emerald-600' :
                          driver.status === 'STANDBY_READY' ? 'bg-blue-500/15 text-blue-600' :
                          'bg-slate-500/15 text-slate-600'
                        }`}>
                          {driver.status}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-right font-bold text-foreground">
                        {driver.accumulatedHours || 6} hrs
                      </td>
                      <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => handleToggleStandby(driver)}
                            title="Toggle Standby"
                            className="px-2 py-1 rounded bg-muted hover:bg-muted/80 text-[10px] font-bold"
                          >
                            {driver.status === 'STANDBY_READY' ? 'Assign' : 'Standby'}
                          </button>
                          <button
                            onClick={() => handleDeleteDriver(driver.id, driver.name)}
                            title="Deactivate Driver"
                            className="p-1 rounded hover:bg-rose-500/10 text-muted-foreground hover:text-rose-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
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
          <div className="lg:col-span-5 bg-card border border-border rounded-lg shadow-card p-5 space-y-5 flex flex-col justify-between font-mono text-xs">
            
            {/* Top Driver Badge */}
            <div className="border-b border-border pb-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-primary/20 text-primary font-bold text-lg flex items-center justify-center border border-primary/30">
                  {selectedDriver.name ? selectedDriver.name.charAt(0) : 'D'}
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground font-sans">
                    {selectedDriver.name}
                  </h2>
                  <div className="text-xs text-muted-foreground">
                    ID: {selectedDriver.id} • Lic #{selectedDriver.licenseNumber}
                  </div>
                  <div className="text-[11px] text-muted-foreground flex items-center space-x-1 mt-0.5">
                    <Phone className="w-3 h-3" />
                    <span>{selectedDriver.phone || '+91 98100 22334'}</span>
                  </div>
                </div>
              </div>

              <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                workload.isRestCompliant ? 'bg-emerald-500/15 text-emerald-600' : 'bg-rose-500/15 text-rose-600'
              }`}>
                {workload.isRestCompliant ? '11h REST MET' : 'REST VIOLATION'}
              </span>
            </div>

            {/* Telemetry Workload Grid */}
            <div className="space-y-3">
              <div className="text-xs uppercase font-semibold text-muted-foreground tracking-wider flex items-center space-x-1.5">
                <Activity className="w-3.5 h-3.5 text-primary" />
                <span>Duty & Compliance Metrics</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-md bg-muted/30 border border-border">
                  <div className="text-[11px] text-muted-foreground">Shift Workload Today</div>
                  <div className="text-xl font-bold text-foreground mt-0.5">
                    {workload.hoursDisplay}
                  </div>
                </div>

                <div className="p-3 rounded-md bg-muted/30 border border-border">
                  <div className="text-[11px] text-muted-foreground">Rest Prior to Shift</div>
                  <div className={`text-xl font-bold mt-0.5 ${workload.isRestCompliant ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {workload.restHours} hrs
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-md bg-muted/20 border border-border space-y-2">
                <div className="text-xs font-semibold text-foreground border-b border-border/50 pb-1">
                  Corridor Experience & Rating
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-muted-foreground">Transit Driving Experience:</span>
                  <strong className="text-foreground">{selectedDriver.experienceYears || 6} Years</strong>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-muted-foreground">Safety Compliance Index:</span>
                  <strong className="text-emerald-600">{selectedDriver.complianceScore || 95}% (Punctual)</strong>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-muted-foreground">Next Scheduled Corridor:</span>
                  <strong className="text-primary">{workload.nextAssignment}</strong>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-[11px] text-emerald-800 dark:text-emerald-300 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Driver rest interval is electronically recorded to prevent fatigue infractions.</span>
            </div>

          </div>
        )}

      </div>

      {/* Register Driver Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 font-mono text-xs">
          <div className="bg-card border border-border rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="font-bold text-foreground text-sm font-sans">Onboard Transit Driver</span>
              <button onClick={() => setIsAddModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDriver} className="space-y-4">
              <div>
                <label className="block text-muted-foreground font-bold uppercase mb-1">
                  Driver Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Chandra Verma"
                  className="w-full p-2 rounded bg-muted/50 border border-input text-foreground font-sans text-xs outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-muted-foreground font-bold uppercase mb-1">
                  Commercial Driving License (DL)
                </label>
                <input
                  type="text"
                  required
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  placeholder="e.g. DL-042023009941"
                  className="w-full p-2 rounded bg-muted/50 border border-input text-foreground font-sans text-xs outline-none focus:border-primary uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted-foreground font-bold uppercase mb-1">
                    Badge Number
                  </label>
                  <input
                    type="text"
                    value={badgeNumber}
                    onChange={(e) => setBadgeNumber(e.target.value)}
                    placeholder="e.g. DTC-B4102"
                    className="w-full p-2 rounded bg-muted/50 border border-input text-foreground font-sans text-xs outline-none focus:border-primary uppercase"
                  />
                </div>
                <div>
                  <label className="block text-muted-foreground font-bold uppercase mb-1">
                    Experience (Years)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="35"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    className="w-full p-2 rounded bg-muted/50 border border-input text-foreground font-sans text-xs outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-muted-foreground font-bold uppercase mb-1">
                  Mobile Telemetry Phone
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98123 45678"
                  className="w-full p-2 rounded bg-muted/50 border border-input text-foreground font-sans text-xs outline-none focus:border-primary"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="standbyCheck"
                  checked={isStandby}
                  onChange={(e) => setIsStandby(e.target.checked)}
                  className="w-4 h-4 rounded text-primary"
                />
                <label htmlFor="standbyCheck" className="text-muted-foreground cursor-pointer">
                  Deploy initially as Standby Reserve (Eligible for 1-Click Solver)
                </label>
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
                  Save & Onboard Driver
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

