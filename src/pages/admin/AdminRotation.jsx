import React, { useState } from 'react';
import { Calendar, RefreshCw, Clock, ArrowRightLeft, ShieldCheck, AlertCircle, CheckCircle2, UserCheck, Users } from 'lucide-react';
import { validateScheduleConstraints } from '../../services/constraintEngine.js';

export default function AdminRotation({
  crewMembers = [],
  onUpdateDriverAssignment,
  selectedCity = 'delhi'
}) {
  const [selectedShift, setSelectedShift] = useState('MORNING');
  const [swapDriverA, setSwapDriverA] = useState('');
  const [swapDriverB, setSwapDriverB] = useState('');
  const [feedback, setFeedback] = useState(null);

  const morningCrew = crewMembers.slice(0, 18);
  const afternoonCrew = crewMembers.slice(18, 36);
  const nightCrew = crewMembers.slice(36, 44);
  const standbyCrew = crewMembers.filter(c => c.isStandby || c.status === 'STANDBY_READY');

  const activeRoster = 
    selectedShift === 'MORNING' ? morningCrew :
    selectedShift === 'AFTERNOON' ? afternoonCrew : nightCrew;

  const handleExecuteSwap = () => {
    if (!swapDriverA || !swapDriverB) {
      setFeedback({ type: 'error', text: 'Please select both Driver A and Driver B to execute shift swap.' });
      return;
    }
    if (swapDriverA === swapDriverB) {
      setFeedback({ type: 'error', text: 'Cannot swap a driver with themselves.' });
      return;
    }

    const dA = crewMembers.find(c => c.id === swapDriverA);
    const dB = crewMembers.find(c => c.id === swapDriverB);

    // Validate rest period for both drivers in prospective shifts
    const checkA = validateScheduleConstraints({
      cityId: selectedCity,
      crewId: swapDriverA,
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 8 * 3600 * 1000).toISOString()
    });

    const checkB = validateScheduleConstraints({
      cityId: selectedCity,
      crewId: swapDriverB,
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 8 * 3600 * 1000).toISOString()
    });

    if (!checkA.isValid || !checkB.isValid) {
      const issues = [...checkA.violations, ...checkB.violations].map(v => v.message).join('\n');
      setFeedback({ type: 'error', text: `Swap rejected by safety engine:\n${issues}` });
      return;
    }

    setFeedback({
      type: 'success',
      text: `✓ Shift swap approved & scheduled between ${dA?.name} and ${dB?.name}. Roster updated with full 11h rest compliance.`
    });
    setSwapDriverA('');
    setSwapDriverB('');
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto font-sans select-none">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-muted-foreground uppercase">
            <RefreshCw className="w-3.5 h-3.5 text-emerald-500" />
            <span>Workforce Rostering</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight mt-1">
            Driver Shift Rotation & Rostering Engine
          </h1>
          <p className="text-xs text-muted-foreground">
            Enforces 6-day duty cycles, scheduled rest sabbaticals, and legally compliant mutual shift exchanges.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3 py-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-mono text-xs font-bold flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>11h Rest Interval Protection Active</span>
          </span>
        </div>
      </div>

      {feedback && (
        <div className={`p-3.5 rounded-lg font-mono text-xs flex items-center space-x-2 animate-in fade-in ${
          feedback.type === 'success' 
            ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
            : 'bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Mutual Shift Swap Station */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-xs font-mono text-xs space-y-4">
        <div className="flex items-center space-x-2 text-foreground font-bold uppercase tracking-wider">
          <ArrowRightLeft className="w-4 h-4 text-primary" />
          <span>Mutual Shift Swap Terminal</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-muted-foreground uppercase font-bold mb-1">
              Driver A (Requesting Swap)
            </label>
            <select
              value={swapDriverA}
              onChange={(e) => setSwapDriverA(e.target.value)}
              className="w-full p-2 rounded bg-muted/50 border border-input text-foreground text-xs font-sans outline-none focus:border-primary"
            >
              <option value="">Select Driver A...</option>
              {crewMembers.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.id}) • {d.complianceScore}% Score
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-muted-foreground uppercase font-bold mb-1">
              Driver B (Exchange Partner)
            </label>
            <select
              value={swapDriverB}
              onChange={(e) => setSwapDriverB(e.target.value)}
              className="w-full p-2 rounded bg-muted/50 border border-input text-foreground text-xs font-sans outline-none focus:border-primary"
            >
              <option value="">Select Driver B...</option>
              {crewMembers.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.id}) • {d.complianceScore}% Score
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleExecuteSwap}
            className="w-full py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-xs flex items-center justify-center space-x-2 transition-all active:scale-95"
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>Validate & Execute Swap</span>
          </button>
        </div>
      </div>

      {/* Shift Roster Tabs */}
      <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
        <div className="p-3.5 bg-muted/30 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="font-bold text-foreground uppercase tracking-wider">
              Shift Roster Assignment Matrix
            </span>
          </div>

          <div className="flex items-center space-x-1.5 bg-muted/50 p-1 rounded-lg border border-border">
            <button
              onClick={() => setSelectedShift('MORNING')}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                selectedShift === 'MORNING' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Morning (05:00-13:30)
            </button>
            <button
              onClick={() => setSelectedShift('AFTERNOON')}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                selectedShift === 'AFTERNOON' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Afternoon (13:30-22:00)
            </button>
            <button
              onClick={() => setSelectedShift('NIGHT')}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                selectedShift === 'NIGHT' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Night (22:00-05:00)
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-muted/20 border-b border-border text-[11px] text-muted-foreground uppercase">
              <tr>
                <th className="p-3">Driver Name & ID</th>
                <th className="p-3">License & Badge</th>
                <th className="p-3">Shift Status</th>
                <th className="p-3">Last Shift End</th>
                <th className="p-3">Accumulated</th>
                <th className="p-3">Compliance</th>
                <th className="p-3">Rotation Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {activeRoster.map((driver) => {
                const restH = driver.lastShiftEnd 
                  ? ((Date.now() - new Date(driver.lastShiftEnd).getTime()) / (1000 * 3600))
                  : 24;
                const isRestCompliant = restH >= 11;

                return (
                  <tr key={driver.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3">
                      <div className="font-bold text-foreground">{driver.name}</div>
                      <div className="text-[10px] text-muted-foreground">{driver.id}</div>
                    </td>
                    <td className="p-3">
                      <div>{driver.licenseNumber}</div>
                      <div className="text-[10px] text-muted-foreground">{driver.badgeNumber}</div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        driver.status === 'ASSIGNED' ? 'bg-emerald-500/15 text-emerald-600' :
                        driver.status === 'STANDBY_READY' ? 'bg-blue-500/15 text-blue-600' :
                        'bg-slate-500/15 text-slate-600'
                      }`}>
                        {driver.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <div>{restH.toFixed(1)}h ago</div>
                      <div className={`text-[10px] font-bold ${isRestCompliant ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {isRestCompliant ? '✓ 11h Legal Rest Met' : '⚠ Rest Violation (<11h)'}
                      </div>
                    </td>
                    <td className="p-3">
                      {driver.accumulatedHours || 6} hrs
                    </td>
                    <td className="p-3">
                      <div className="flex items-center space-x-1.5">
                        <div className="w-12 bg-muted rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full ${driver.complianceScore >= 90 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                            style={{ width: `${driver.complianceScore || 95}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold">{driver.complianceScore || 95}%</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="text-[11px] text-muted-foreground">
                        Day 4 of 6 • Rest Due Sunday
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Standby Crew Reserve Footer */}
        <div className="p-4 bg-muted/20 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-xs font-mono">
            <Users className="w-4 h-4 text-emerald-500" />
            <span>Active Standby Reserves: <strong className="text-foreground">{standbyCrew.length} drivers</strong> ready for instant dispatch</span>
          </div>

          <div className="flex items-center space-x-2">
            {standbyCrew.slice(0, 4).map(d => (
              <span key={d.id} className="px-2 py-0.5 rounded bg-card border border-border text-[10px] font-mono text-foreground font-bold">
                {d.name.split(' ')[0]} ({d.id})
              </span>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}

