import React, { useState, useEffect } from 'react';
import { History, Shield, RefreshCw, Search, Filter, ArrowRight, User } from 'lucide-react';
import { db } from '../../db/transitDb.js';

export default function AdminActivityLog({ selectedCity = 'delhi' }) {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  const refreshLogs = () => {
    setLogs(db.getAuditLogs());
  };

  useEffect(() => {
    refreshLogs();
  }, [selectedCity]);

  const filtered = logs.filter(l => {
    const matchesSearch = 
      (l.action && l.action.toLowerCase().includes(search.toLowerCase())) ||
      (l.actor && l.actor.toLowerCase().includes(search.toLowerCase())) ||
      (l.details && l.details.toLowerCase().includes(search.toLowerCase()));
    
    const matchesFilter = actionFilter === 'ALL' || (l.action && l.action.startsWith(actionFilter));
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto font-sans select-none">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-muted-foreground uppercase">
            <History className="w-3.5 h-3.5 text-emerald-500" />
            <span>Immutable Audit Trail</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight mt-1">
            Operator Activity & System Mutation Log
          </h1>
          <p className="text-xs text-muted-foreground">
            Complete chronological event stream of all duty edits, driver reassignments, solver runs, and administrative overrides.
          </p>
        </div>

        <button
          onClick={refreshLogs}
          className="px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-foreground font-mono text-xs font-bold shadow-xs flex items-center space-x-1.5 transition-all active:scale-95"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Log Stream</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search action, actor, or detail..."
            className="w-full pl-8 pr-2 py-1.5 rounded bg-muted/50 border border-input text-xs font-sans outline-none focus:border-primary"
          />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-muted-foreground">Action Filter:</span>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="p-1.5 rounded bg-muted/50 border border-input text-foreground text-xs font-sans outline-none focus:border-primary"
          >
            <option value="ALL">All Actions</option>
            <option value="CREATE">Create Mutations</option>
            <option value="UPDATE">Update Mutations</option>
            <option value="DELETE">Delete Mutations</option>
            <option value="USER">Authentication</option>
            <option value="RESET">System Resets</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-muted/20 border-b border-border text-[11px] text-muted-foreground uppercase">
              <tr>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Operator / Actor</th>
                <th className="p-3">Action Type</th>
                <th className="p-3">Entity Type</th>
                <th className="p-3">Details & Mutation Rationale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-muted-foreground">
                    No matching activity logs found.
                  </td>
                </tr>
              ) : (
                filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3 text-muted-foreground whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })} • {new Date(log.timestamp).toLocaleDateString()}
                    </td>
                    <td className="p-3 font-semibold text-foreground whitespace-nowrap">
                      <div className="flex items-center space-x-1.5">
                        <User className="w-3 h-3 text-muted-foreground" />
                        <span>{log.actor || 'System'}</span>
                      </div>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.action.includes('CREATE') ? 'bg-emerald-500/15 text-emerald-600' :
                        log.action.includes('UPDATE') ? 'bg-blue-500/15 text-blue-600' :
                        log.action.includes('DELETE') ? 'bg-rose-500/15 text-rose-600' :
                        'bg-slate-500/15 text-slate-600'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3 uppercase text-muted-foreground text-[10px]">
                      {log.entityType}
                    </td>
                    <td className="p-3 font-sans text-xs text-foreground">
                      <div>{log.details}</div>
                      {log.entityId && (
                        <span className="text-[10px] font-mono text-muted-foreground">ID: {log.entityId}</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

