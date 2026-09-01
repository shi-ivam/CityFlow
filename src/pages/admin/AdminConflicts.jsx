import React, { useState, useEffect } from 'react';
import { AlertOctagon, CheckCircle2, Zap, ShieldAlert, Clock, RefreshCw, Check, X, ArrowRight } from 'lucide-react';
import { db } from '../../db/transitDb.js';
import { api } from '../../services/api/apiService.js';

export default function AdminConflicts({
  selectedCity = 'delhi',
  onConflictResolved
}) {
  const [conflicts, setConflicts] = useState([]);
  const [resolvedMessage, setResolvedMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const loadConflicts = () => {
    const list = db.getCollection(selectedCity, 'conflicts');
    setConflicts(list);
  };

  useEffect(() => {
    loadConflicts();
  }, [selectedCity]);

  const handleAutoFix = async (conflictId) => {
    setIsProcessing(true);
    const res = await api.conflicts.autoFix(selectedCity, conflictId, 'Smart Solver');
    if (res.success) {
      setResolvedMessage(res.message || 'Conflict resolved successfully');
      loadConflicts();
      if (onConflictResolved) onConflictResolved(conflictId);
      setTimeout(() => setResolvedMessage(''), 4500);
    }
    setIsProcessing(false);
  };

  const handleResolveManual = async (conflictId) => {
    const reason = prompt('Enter resolution summary / dispatcher justification:', 'Resolved via corridor schedule realignment');
    if (!reason) return;

    await api.conflicts.resolve(selectedCity, conflictId, reason, 'Lead Dispatcher');
    setResolvedMessage(`✓ Conflict resolved: ${reason}`);
    loadConflicts();
    if (onConflictResolved) onConflictResolved(conflictId);
    setTimeout(() => setResolvedMessage(''), 4500);
  };

  const openConflicts = conflicts.filter(c => c.status === 'OPEN');
  const resolvedConflicts = conflicts.filter(c => c.status === 'RESOLVED');

  return (
    <div className="p-6 lg:p-10 space-y-8 max-w-[1580px] mx-auto font-sans select-none">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-border/70 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-muted-foreground uppercase tracking-wider">
            <AlertOctagon className="w-4 h-4 text-rose-500" />
            <span>Safety & Corridor Diagnostics</span>
          </div>
          <h1 className="text-3xl font-semibold text-foreground tracking-tight mt-1">
            Active Conflicts & Automated Solver
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time constraint monitor detecting 11h rest infractions, headway bunching, and maintenance lockouts.
          </p>
        </div>

        <div className="flex items-center space-x-2 font-mono text-xs">
          <span className="px-3.5 py-1.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-rose-500" />
            <span>{openConflicts.length} Active Conflicts</span>
          </span>
        </div>
      </div>

      {resolvedMessage && (
        <div className="p-3.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-mono text-xs flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
          <span>{resolvedMessage}</span>
        </div>
      )}

      {/* Active Conflicts List */}
      <div className="space-y-4">
        <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-foreground">
          Pending Incidents Requiring Dispatch Action ({openConflicts.length})
        </h2>

        {openConflicts.length === 0 ? (
          <div className="p-8 text-center bg-card border border-border rounded-xl font-mono text-xs text-muted-foreground space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <div className="text-foreground font-bold">Zero Active Operational Conflicts</div>
            <p>All scheduled transit duties comply with statutory rest periods, bus allocations, and headway buffers.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {openConflicts.map((conf) => (
              <div
                key={conf.id}
                className="bg-card border border-border hover:border-border/80 rounded-xl p-5 shadow-xs font-mono text-xs space-y-3 relative overflow-hidden"
              >
                <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${
                  conf.severity === 'CRITICAL' ? 'bg-rose-500' :
                  conf.severity === 'HIGH' ? 'bg-amber-500' : 'bg-blue-500'
                }`} />

                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        conf.severity === 'CRITICAL' ? 'bg-rose-500/15 text-rose-600' :
                        conf.severity === 'HIGH' ? 'bg-amber-500/15 text-amber-600' : 'bg-blue-500/15 text-blue-600'
                      }`}>
                        {conf.severity}
                      </span>
                      <span className="font-bold text-foreground text-sm font-sans">{conf.title || conf.type}</span>
                    </div>
                    <p className="text-muted-foreground font-sans text-xs">{conf.description}</p>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() => handleAutoFix(conf.id)}
                      disabled={isProcessing}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center space-x-1.5 shadow-xs transition-all active:scale-95 disabled:opacity-50"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>One-Click Auto-Fix</span>
                    </button>
                    <button
                      onClick={() => handleResolveManual(conf.id)}
                      className="px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-foreground font-bold transition-all"
                    >
                      Manual Action
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-muted/30 border border-border rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-muted-foreground">
                  <div>
                    Suggested Fix: <strong className="text-foreground">{conf.suggestedResolution || 'Deploy qualified standby reserve crew'}</strong>
                  </div>
                  <div>
                    Affected Duty: <span className="text-primary font-bold">{conf.affectedDutyId || 'N/A'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resolved Conflicts History */}
      {resolvedConflicts.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-5 shadow-xs font-mono text-xs space-y-3">
          <h3 className="font-bold uppercase tracking-wider text-muted-foreground text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Resolved Incidents Archive ({resolvedConflicts.length})</span>
          </h3>

          <div className="divide-y divide-border">
            {resolvedConflicts.map(c => (
              <div key={c.id} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="font-bold text-foreground">{c.title || c.type}</div>
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400">✓ {c.resolutionAction || 'Resolved'}</div>
                </div>
                <span className="text-[10px] text-muted-foreground">RESOLVED</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

