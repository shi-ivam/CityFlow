import React, { useState } from 'react';
import { AlertTriangle, ShieldCheck, CheckCircle2, Filter, Sparkles, Clock, XCircle, ArrowRight } from 'lucide-react';

export default function AdminAlerts({
  activeConflicts = [],
  dutyAssignments = [],
  crewMembers = [],
  onOpenFallbackModal
}) {
  const [filterCategory, setFilterCategory] = useState('ALL'); // 'ALL' | 'CRITICAL' | 'WARNING' | 'RESOLVED'
  const [resolvedIds, setResolvedIds] = useState([]);

  // Dynamic alerts
  const systemAlerts = [
    ...activeConflicts.map((c, idx) => ({
      id: `conflict-${c.id || idx}`,
      type: 'CRITICAL',
      title: 'Rest Hours Violation Flagged',
      description: c.description || 'Driver assigned without meeting legal 11-hour continuous rest window.',
      entity: c.crewId || 'Driver Roster',
      timestamp: '08:42:15 AM',
      isUnresolved: !resolvedIds.includes(`conflict-${c.id || idx}`)
    })),
    {
      id: 'warn-104',
      type: 'WARNING',
      title: 'Bus BUS-104 Minor Delay (+8 mins)',
      description: 'Vehicle running behind schedule due to traffic congestion near Kashmere Gate corridor.',
      entity: 'BUS-104',
      timestamp: '08:35:00 AM',
      isUnresolved: !resolvedIds.includes('warn-104')
    },
    {
      id: 'info-101',
      type: 'INFO',
      title: 'Handoff Exchange Hub Ready',
      description: 'Unlinked duty interchange node active at Central Hub with 15m handoff buffer verified.',
      entity: 'Hub Station 02',
      timestamp: '08:15:00 AM',
      isUnresolved: false
    }
  ];

  const filteredAlerts = systemAlerts.filter((a) => {
    if (filterCategory === 'CRITICAL') return a.type === 'CRITICAL';
    if (filterCategory === 'WARNING') return a.type === 'WARNING';
    if (filterCategory === 'RESOLVED') return !a.isUnresolved;
    return true;
  });

  const handleResolveAlert = (id) => {
    setResolvedIds(prev => [...prev, id]);
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto font-sans select-none text-foreground">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-muted-foreground uppercase font-bold">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            <span>Incident Command & Exception Log</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight mt-1">
            Operational Alert Center
          </h1>
          <p className="text-xs text-muted-foreground">
            Real-time monitoring of crew rest violations, spatial route collisions, and corridor delay warnings.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenFallbackModal}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-mono text-xs font-bold hover:bg-primary/90 shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-palette-ice" />
            <span>Run 3-Tier Fallback Solver</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-1.5 bg-card p-1.5 rounded-2xl border border-border w-fit font-mono text-xs">
        {['ALL', 'CRITICAL', 'WARNING', 'RESOLVED'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              filterCategory === cat
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Alert Cards Feed */}
      <div className="space-y-3">
        {filteredAlerts.map((alert) => {
          const isCritical = alert.type === 'CRITICAL';
          const isWarning = alert.type === 'WARNING';
          const isResolved = !alert.isUnresolved;

          return (
            <div
              key={alert.id}
              className={`p-4 rounded-2xl border shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                isResolved
                  ? 'bg-muted/20 border-border opacity-70'
                  : isCritical
                  ? 'bg-rose-500/10 border-rose-500/30'
                  : isWarning
                  ? 'bg-amber-500/10 border-amber-500/30'
                  : 'bg-card border-border'
              }`}
            >
              <div className="flex items-start space-x-3.5">
                <div className="mt-0.5">
                  {isResolved ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  ) : isCritical ? (
                    <AlertTriangle className="w-5 h-5 text-rose-500 animate-pulse shrink-0" />
                  ) : isWarning ? (
                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                  ) : (
                    <Clock className="w-5 h-5 text-primary shrink-0" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase ${
                      isResolved
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                        : isCritical
                        ? 'bg-rose-500 text-white'
                        : isWarning
                        ? 'bg-amber-500/20 text-amber-800 dark:text-amber-300'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {isResolved ? 'RESOLVED' : alert.type}
                    </span>
                    <span className="text-xs font-mono text-muted-foreground">{alert.timestamp}</span>
                    <span className="text-xs font-mono font-bold text-foreground">• {alert.entity}</span>
                  </div>

                  <h3 className="text-sm font-bold text-foreground">
                    {alert.title}
                  </h3>

                  <p className="text-xs text-muted-foreground font-sans">
                    {alert.description}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center font-mono text-xs">
                {!isResolved ? (
                  <>
                    {isCritical && (
                      <button
                        onClick={onOpenFallbackModal}
                        className="px-3 py-1.5 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-500 shadow-xs transition-all cursor-pointer"
                      >
                        Auto-Solve
                      </button>
                    )}
                    <button
                      onClick={() => handleResolveAlert(alert.id)}
                      className="px-3 py-1.5 rounded-xl bg-card border border-border text-foreground hover:bg-muted/50 transition-all cursor-pointer"
                    >
                      Acknowledge & Dismiss
                    </button>
                  </>
                ) : (
                  <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Resolved</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {filteredAlerts.length === 0 && (
          <div className="p-12 text-center bg-card border border-border rounded-2xl text-muted-foreground font-sans">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-foreground">No unresolved alerts in this category</h3>
            <p className="text-xs text-muted-foreground mt-1">Transit operations are running at 100% nominal state.</p>
          </div>
        )}
      </div>

    </div>
  );
}
