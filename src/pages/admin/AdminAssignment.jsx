import React, { useState, useMemo } from 'react';
import { Sparkles, Users, Bus, CheckCircle2, AlertTriangle, ShieldCheck, ArrowRight, Zap, Filter, Search } from 'lucide-react';
import { validateScheduleConstraints } from '../../services/constraintEngine.js';

export default function AdminAssignment({
  routes = [],
  crewMembers = [],
  busFleet = [],
  dutyAssignments = [],
  onUpdateDriverAssignment,
  onUpdateBusAssignment,
  selectedCity = 'delhi'
}) {
  const [selectedRouteId, setSelectedRouteId] = useState(routes[0]?.id || '');
  const [selectedShift, setSelectedShift] = useState('MORNING');
  const [filterQuery, setFilterQuery] = useState('');
  const [assignedSuccess, setAssignedSuccess] = useState('');

  const selectedRoute = routes.find(r => r.id === selectedRouteId) || routes[0];

  // Smart Candidate Ranking Algorithm
  const rankedCandidates = useMemo(() => {
    return crewMembers.map(driver => {
      let score = 70;
      const reasons = [];

      // 1. Rest Compliance check
      const restHours = driver.lastShiftEnd 
        ? ((Date.now() - new Date(driver.lastShiftEnd).getTime()) / (1000 * 3600))
        : 24;

      if (restHours >= 11) {
        score += 15;
        reasons.push(`✓ ${restHours.toFixed(1)}h rest (Legal 11h mandated satisfied)`);
      } else {
        score -= 40;
        reasons.push(`⚠ Rest Deficit: Only ${restHours.toFixed(1)}h rest since last shift`);
      }

      // 2. Standby Availability
      if (driver.isStandby || driver.status === 'STANDBY_READY') {
        score += 10;
        reasons.push('✓ Standby reserve ready for immediate deployment');
      } else if (driver.status === 'ASSIGNED') {
        score -= 10;
        reasons.push('• Currently assigned to corridor duty');
      }

      // 3. Workload Balance
      const hours = driver.accumulatedHours || 6;
      if (hours < 7) {
        score += 5;
        reasons.push(`✓ Low daily workload balance (${hours}h accumulated)`);
      } else {
        score -= 5;
        reasons.push(`• High daily duty accumulation (${hours}h)`);
      }

      // 4. Experience
      if (driver.experienceYears >= 5) {
        score += 5;
        reasons.push(`✓ Experienced operator (${driver.experienceYears} yrs transit service)`);
      }

      return {
        ...driver,
        smartScore: Math.max(20, Math.min(99, score)),
        reasons,
        isEligible: restHours >= 11
      };
    }).sort((a, b) => b.smartScore - a.smartScore);
  }, [crewMembers]);

  // Recommended Buses
  const rankedBuses = useMemo(() => {
    return busFleet
      .filter(b => b.status !== 'MAINTENANCE')
      .sort((a, b) => (b.batteryPct || 100) - (a.batteryPct || 100));
  }, [busFleet]);

  const [chosenDriverId, setChosenDriverId] = useState(rankedCandidates[0]?.id || '');
  const [chosenBusId, setChosenBusId] = useState(rankedBuses[0]?.id || '');

  const handleExecuteAssignment = () => {
    const driver = crewMembers.find(c => c.id === chosenDriverId);
    const bus = busFleet.find(b => b.id === chosenBusId);

    // Run Constraint Validation
    const constraintCheck = validateScheduleConstraints({
      cityId: selectedCity,
      crewId: chosenDriverId,
      busId: chosenBusId,
      routeId: selectedRouteId,
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 8 * 3600 * 1000).toISOString()
    });

    if (!constraintCheck.isValid) {
      alert(`Assignment Blocked by Safety Constraint:\n${constraintCheck.violations.map(v => v.message).join('\n')}`);
      return;
    }

    if (onUpdateDriverAssignment) {
      onUpdateDriverAssignment(selectedRouteId, chosenBusId, chosenDriverId);
    }
    if (onUpdateBusAssignment) {
      onUpdateBusAssignment(selectedRouteId, busFleet[0]?.id, chosenBusId);
    }

    setAssignedSuccess(`✓ SMART ASSIGNMENT CONFIRMED: Driver ${driver?.name || chosenDriverId} & Bus ${bus?.busNumber || chosenBusId} successfully deployed to Route ${selectedRoute?.code || 'Corridor'}`);
    setTimeout(() => setAssignedSuccess(''), 5000);
  };

  const filteredCandidates = rankedCandidates.filter(c => 
    c.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
    c.id.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-10 space-y-8 max-w-[1580px] mx-auto font-sans select-none">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-border/70 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-muted-foreground uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span>Optimization Engine</span>
          </div>
          <h1 className="text-3xl font-semibold text-foreground tracking-tight mt-1">
            Smart Crew & Fleet Assignment
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Constraint-checked matching evaluating continuous rest gaps, accumulated driving limits, and vehicle readiness.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-xs font-semibold flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>11h Mandate Active</span>
          </span>
        </div>
      </div>

      {assignedSuccess && (
        <div className="p-3.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-mono text-xs flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
          <span>{assignedSuccess}</span>
        </div>
      )}

      {/* Target Corridor & Shift Selector */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
        <div>
          <label className="block text-muted-foreground font-bold uppercase mb-1">
            1. Target Transit Corridor
          </label>
          <select
            value={selectedRouteId}
            onChange={(e) => setSelectedRouteId(e.target.value)}
            className="w-full p-2 rounded bg-muted/50 border border-input text-foreground font-sans text-xs outline-none focus:border-primary"
          >
            {routes.map(r => (
              <option key={r.id} value={r.id}>
                Route {r.code} — {r.name} ({r.lengthKm} km)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-muted-foreground font-bold uppercase mb-1">
            2. Operational Shift Window
          </label>
          <select
            value={selectedShift}
            onChange={(e) => setSelectedShift(e.target.value)}
            className="w-full p-2 rounded bg-muted/50 border border-input text-foreground font-sans text-xs outline-none focus:border-primary"
          >
            <option value="MORNING">Morning Peak Shift (05:00 - 13:30 IST)</option>
            <option value="AFTERNOON">Afternoon Shift (13:30 - 22:00 IST)</option>
            <option value="NIGHT">Night Corridor Shift (22:00 - 05:00 IST)</option>
          </select>
        </div>

        <div>
          <label className="block text-muted-foreground font-bold uppercase mb-1">
            3. Recommended Vehicle Asset
          </label>
          <select
            value={chosenBusId}
            onChange={(e) => setChosenBusId(e.target.value)}
            className="w-full p-2 rounded bg-muted/50 border border-input text-foreground font-sans text-xs outline-none focus:border-primary"
          >
            {rankedBuses.slice(0, 12).map(b => (
              <option key={b.id} value={b.id}>
                {b.busNumber} ({b.model}) • {b.batteryPct || 100}% Battery / Fuel
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Candidate Ranking List */}
      <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
        <div className="p-3.5 bg-muted/30 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-primary" />
            <span className="font-bold text-foreground uppercase tracking-wider">
              Constraint-Ranked Driver Candidates ({rankedCandidates.length})
            </span>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Search candidate name or ID..."
              className="w-full pl-8 pr-2 py-1 rounded bg-muted/50 border border-input text-xs font-sans outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="divide-y divide-border max-h-[520px] overflow-y-auto">
          {filteredCandidates.map((driver, idx) => (
            <div
              key={driver.id}
              onClick={() => setChosenDriverId(driver.id)}
              className={`p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer transition-colors ${
                chosenDriverId === driver.id 
                  ? 'bg-primary/5 border-l-4 border-l-primary' 
                  : 'hover:bg-muted/30'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center font-mono font-bold shrink-0 ${
                  driver.smartScore >= 85 ? 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/30' :
                  driver.smartScore >= 70 ? 'bg-blue-500/15 text-blue-600 border border-blue-500/30' :
                  'bg-rose-500/15 text-rose-600 border border-rose-500/30'
                }`}>
                  <span className="text-xs">{driver.smartScore}</span>
                  <span className="text-[8px] opacity-75">SCORE</span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-foreground">{driver.name || driver.fullName}</span>
                    <span className="font-mono text-xs text-muted-foreground">({driver.id})</span>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
                      driver.isEligible ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'
                    }`}>
                      {driver.isEligible ? 'REST COMPLIANT' : 'REST VIOLATION'}
                    </span>
                    {idx === 0 && (
                      <span className="px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-600 text-[10px] font-mono font-bold">
                        ★ TOP RECOMMENDATION
                      </span>
                    )}
                  </div>

                  <div className="space-y-0.5 font-mono text-[11px] text-muted-foreground">
                    {driver.reasons.map((r, rIdx) => (
                      <div key={rIdx} className={r.startsWith('⚠') ? 'text-rose-600 dark:text-rose-400 font-bold' : ''}>
                        {r}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 shrink-0 self-end md:self-center">
                <input
                  type="radio"
                  name="selectedCandidate"
                  checked={chosenDriverId === driver.id}
                  onChange={() => setChosenDriverId(driver.id)}
                  className="w-4 h-4 text-primary cursor-pointer"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Action Footer */}
        <div className="p-3.5 bg-muted/20 border-t border-border flex items-center justify-between">
          <div className="text-xs font-mono text-muted-foreground">
            Selected: <strong className="text-foreground">{crewMembers.find(c => c.id === chosenDriverId)?.name || 'None'}</strong> + <strong className="text-foreground">{busFleet.find(b => b.id === chosenBusId)?.busNumber || 'None'}</strong>
          </div>

          <button
            onClick={handleExecuteAssignment}
            className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-xs font-bold shadow-xs flex items-center space-x-1.5 active:scale-95 transition-all"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Deploy Selected Assignment</span>
          </button>
        </div>
      </div>

    </div>
  );
}

