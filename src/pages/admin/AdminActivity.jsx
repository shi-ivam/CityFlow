import React, { useState } from 'react';
import { Clock, Filter, Search, RotateCcw, CheckCircle2, AlertTriangle, ShieldCheck, User } from 'lucide-react';

export default function AdminActivity() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  const INITIAL_LOGS = [
    { id: 'act-1', time: '08:42:15 AM', user: 'Chief Dispatcher', action: 'Solver Execution', entity: 'Shift A Duties', prev: '2 Rest Violations', next: '100% Compliant (0 Violations)', type: 'SOLVER' },
    { id: 'act-2', time: '08:35:20 AM', user: 'Operator Verma', action: 'Driver Assignment', entity: 'Driver Rajesh Kumar', prev: 'STANDBY', next: 'ASSIGNED to Route 534', type: 'ROSTER' },
    { id: 'act-3', time: '08:28:10 AM', user: 'System Auto-Monitor', action: 'Conflict Flagged', entity: 'Duty DT-204', prev: 'SCHEDULED', next: 'REST_VIOLATION (<11h gap)', type: 'CONFLICT' },
    { id: 'act-4', time: '08:14:05 AM', user: 'Workshop Dispatch', action: 'Maintenance Queue', entity: 'Bus BUS-104', prev: 'IN_SERVICE', next: 'WORKSHOP_INSPECTION', type: 'FLEET' },
    { id: 'act-5', time: '07:55:00 AM', user: 'Chief Dispatcher', action: 'Corridor Optimization', entity: 'Route R42', prev: '15 min Headway', next: '12 min Peak Headway', type: 'ROUTE' },
    { id: 'act-6', time: '07:30:12 AM', user: 'System Initializer', action: 'Shift Start', entity: 'Delhi Central Division', prev: 'NIGHT_STANDBY', next: 'MORNING_OPERATIONS_ACTIVE', type: 'SYSTEM' }
  ];

  const filteredLogs = INITIAL_LOGS.filter(log => {
    const matchesSearch = log.entity.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.user.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'ALL' || log.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto font-sans select-none">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-muted-foreground uppercase">
            <Clock className="w-3.5 h-3.5 text-primary" />
            <span>Operational Audit Trail</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight mt-1">
            System Activity Log & Audit History
          </h1>
          <p className="text-xs text-muted-foreground">
            Complete chronological audit log of dispatcher overrides, solver runs, and vehicle state transitions.
          </p>
        </div>

        <div className="flex items-center space-x-2 font-mono text-xs">
          <span className="px-3 py-1.5 rounded-xl bg-card border border-border">
            Total Logged Events: <strong>{INITIAL_LOGS.length}</strong>
          </span>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card p-3 rounded-2xl border border-border shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by user, action, or entity..."
            className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-muted/40 border border-input text-foreground text-xs placeholder:text-muted-foreground outline-hidden focus:border-primary"
          />
        </div>

        <div className="flex items-center space-x-1.5 w-full sm:w-auto overflow-x-auto">
          {['ALL', 'SOLVER', 'ROSTER', 'CONFLICT', 'FLEET', 'ROUTE'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition cursor-pointer ${
                filterType === type 
                  ? 'bg-primary text-primary-foreground shadow-xs' 
                  : 'bg-muted/40 text-muted-foreground hover:text-foreground'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Timeline List */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xs divide-y divide-border/60">
        {filteredLogs.map(log => (
          <div key={log.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-muted/20 transition">
            <div className="flex items-start space-x-3.5">
              <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-sm text-foreground">{log.action}</span>
                  <span className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground font-mono text-[10px] font-bold">
                    {log.type}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Affected Asset: <strong className="text-foreground">{log.entity}</strong>
                </div>
                <div className="text-[11px] font-mono mt-1 flex items-center space-x-1.5 text-muted-foreground">
                  <span className="text-rose-500 line-through opacity-80">{log.prev}</span>
                  <span>&rarr;</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">{log.next}</span>
                </div>
              </div>
            </div>

            <div className="text-right shrink-0 font-mono text-xs text-muted-foreground">
              <div className="font-bold text-foreground flex items-center justify-end space-x-1">
                <User className="w-3 h-3 text-muted-foreground" />
                <span>{log.user}</span>
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{log.time}</div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
