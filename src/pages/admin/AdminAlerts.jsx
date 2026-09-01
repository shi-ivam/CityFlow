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

  // Generate dynamic list of alerts combining active conflicts and system warnings
  const systemAlerts = [
    ...activeConflicts.map((c, idx) => ({
      id: `conflict-${c.id || idx}`,
      type: 'CRITICAL',
      title: 'Rest Hours Violation Flagged',
      description: c.description || 'Driver assigned without meeting legal 11-hour rest window.',
      entity: c.crewId || 'Driver Roster',
      timestamp: '08:42:15 AM',
      isUnresolved: !resolvedIds.includes(`conflict-${c.id || idx}`)
    })),
    {
      id: 'warn-104',
      type: 'WARNING',
      title: 'Bus BUS-104 Minor Delay',
      description: 'Vehicle running +8 minutes behind schedule due to traffic corridor on Route 44.',
      entity: 'BUS-104',
      timestamp: '08:35:00 AM',
      isUnresolved: !resolvedIds.includes('warn-104')
    },
    {
      id: 'info-101',
      type: 'INFO',
      title: 'Handoff Exchange Hub Ready',
      description: 'Unlinked duty interchange node active at Central Hub with 15m handoff buffer.',
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
    <div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-muted-foreground uppercase">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            <span>Incident Command</span>
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
            className="flex items-center space-x-2 px-3 py-2 rounded-md bg-emerald-600 text-white font-mono text-xs font-semibold hover:bg-emerald-700 shadow-sm transition-all active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Run 3-Tier Fallback Solver</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 bg-card p-1.5 rounded-lg border border-border w-fit font-mono text-xs">
        {['ALL', 'CRITICAL', 'WARNING', 'RESOLVED'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3 py-1 rounded-md font-medium transition-all ${
              filterCategory === cat
                ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
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
              className={`p-4 rounded-lg border shadow-card transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                isResolved
                  ? 'bg-muted/20 border-border opacity-70'
                  : isCritical
                  ? 'bg-rose-500/5 dark:bg-rose-950/20 border-rose-500/40'
                  : isWarning
                  ? 'bg-amber-500/5 dark:bg-amber-950/20 border-amber-500/40'
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
                    <span className={`px-2 py-0.2 rounded text-[10px] font-mono font-bold uppercase border ${
                      isResolved
                        ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30'
                        : isCritical
                        ? 'bg-rose-500 text-white border-rose-600'
                        : isWarning
                        ? 'bg-amber-500/15 text-amber-800 border-amber-500/40'
                        : 'bg-muted text-muted-foreground border-border'
                    }`}>
                      {isResolved ? 'RESOLVED' : alert.type}
                    </span>
                    <span className="text-xs font-mono text-muted-foreground">{alert.timestamp}</span>
                    <span className="text-xs font-mono font-semibold text-foreground">• {alert.entity}</span>
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
                        className="px-3 py-1.5 rounded-md bg-rose-600 text-white font-semibold hover:bg-rose-700 shadow-xs transition-all"
                      >
                        Auto-Solve Fallback
                      </button>
                    )}
                    <button
                      onClick={() => handleResolveAlert(alert.id)}
                      className="px-3 py-1.5 rounded-md bg-card border border-border text-foreground hover:bg-accent transition-all"
                    >
                      Acknowledge & Dismiss
                    </button>
                  </>
                ) : (
                  <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Resolved</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {filteredAlerts.length === 0 && (
          <div className="p-12 text-center bg-card border border-border rounded-lg text-muted-foreground font-sans">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-foreground">No unresolved alerts in this category</h3>
            <p className="text-xs text-muted-foreground mt-1">Network operations are currently running smoothly.</p>
          </div>
        )}
      </div>

    </div>
  );
}
